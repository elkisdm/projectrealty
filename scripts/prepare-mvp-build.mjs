#!/usr/bin/env node

/**
 * Script para preparar el build en modo MVP
 * Renombra carpetas no-MVP para que Next.js no las genere en el build
 */

import { rename, access } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const appDir = join(rootDir, 'app');

// Rutas MVP (NO tocar estas)
const MVP_ROUTES = [
  '', // root (page.tsx)
  'buscar',
  'property', // (catalog)/property/[slug]
  'arriendo', // arriendo/departamento/[comuna]/[slug] - ruta SEO alternativa
  'api', // APIs necesarias
  'robots.ts',
  'sitemap.ts',
  'layout.tsx',
  'page.tsx',
  'error.tsx',
  'global-error.tsx',
  'providers.tsx',
  'metadata.ts',
  'globals.css',
  'favicon.ico',
];

// Rutas a deshabilitar (renombrar con _ al inicio - Next.js ignora carpetas que empiezan con _)
// NOTA: No deshabilitamos (catalog) porque contiene property/[slug] que SÍ es MVP
// No deshabilitamos (marketing) completo, solo sus subcarpetas no-MVP
const DISABLED_ROUTES = [
  'coming-soon',
  'arrienda-sin-comision',
  'agendamiento',
  'agendamiento-mejorado',
  'cotizador',
  'propiedad', // ruta legacy
  'admin', // admin no es parte del MVP público
  // Grupos de rutas - deshabilitar solo si no contienen rutas MVP
  // '(marketing)' contiene landing-v2 que no es MVP, pero mejor deshabilitar solo landing-v2
  // '(catalog)' contiene property/[slug] que SÍ es MVP, NO deshabilitar
];

// APIs a deshabilitar (opcional, algunas pueden ser necesarias)
const DISABLED_API_ROUTES = [
  'api/quotations',
  'api/waitlist',
  'api/arrienda-sin-comision',
  'api/flash-videos',
  'api/landing',
  'api/analytics',
  'api/debug',
  'api/debug-admin',
  'api/debug-flags',
  'api/debug-units',
  'api/test-featured',
];

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function disableRoute(routePath) {
  // Manejar rutas anidadas como "api/quotations"
  const parts = routePath.split('/');
  let currentPath = appDir;
  let targetPath = appDir;
  
  // Construir la ruta completa hasta el último elemento
  for (let i = 0; i < parts.length - 1; i++) {
    currentPath = join(currentPath, parts[i]);
    targetPath = join(targetPath, parts[i]);
    if (!(await exists(currentPath))) {
      return false; // La ruta padre no existe
    }
  }
  
  // El último elemento es lo que vamos a renombrar
  const lastPart = parts[parts.length - 1];
  const fullPath = join(currentPath, lastPart);
  const disabledPath = join(currentPath, `_${lastPart}`);
  
  if (await exists(fullPath)) {
    // Si ya está deshabilitado (empieza con _), no hacer nada
    if (lastPart.startsWith('_')) {
      console.log(`⚠️  ${routePath} ya está deshabilitado`);
      return false;
    }
    
    // Si ya existe la versión deshabilitada, no hacer nada
    if (await exists(disabledPath)) {
      console.log(`⚠️  ${routePath} ya está deshabilitado como ${parts.slice(0, -1).join('/')}/_${lastPart}`);
      return false;
    }
    
    await rename(fullPath, disabledPath);
    const displayPath = routePath.includes('/') ? routePath : lastPart;
    console.log(`✅ Deshabilitado: ${displayPath} → ${parts.slice(0, -1).join('/')}/_${lastPart}`);
    return true;
  }
  return false;
}

async function enableRoute(routePath) {
  // routePath puede venir con o sin el prefijo _
  // Para rutas anidadas, necesitamos buscar recursivamente
  const fs = await import('fs');
  
  async function enableRecursive(dir, relativePath = '') {
    let count = 0;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const entryPath = join(dir, entry.name);
      const relativeEntryPath = relativePath ? `${relativePath}/${entry.name}` : entry.name;
      
      if (entry.isDirectory() && entry.name.startsWith('_') && entry.name !== '_next') {
        const originalName = entry.name.slice(1);
        const disabledPath = entryPath;
        const enabledPath = join(dir, originalName);
        
        await rename(disabledPath, enabledPath);
        console.log(`✅ Habilitado: ${relativeEntryPath} → ${relativePath ? `${relativePath}/` : ''}${originalName}`);
        count++;
      } else if (entry.isDirectory() && !entry.name.startsWith('_')) {
        // Buscar recursivamente en subdirectorios
        count += await enableRecursive(entryPath, relativeEntryPath);
      }
    }
    
    return count;
  }
  
  // Si routePath es específico, intentar habilitarlo directamente
  if (routePath && !routePath.startsWith('_')) {
    const parts = routePath.split('/');
    let currentPath = appDir;
    for (let i = 0; i < parts.length - 1; i++) {
      currentPath = join(currentPath, parts[i]);
      if (!(await exists(currentPath))) {
        return false;
      }
    }
    const lastPart = parts[parts.length - 1];
    const disabledPath = join(currentPath, `_${lastPart}`);
    const fullPath = join(currentPath, lastPart);
    
    if (await exists(disabledPath)) {
      await rename(disabledPath, fullPath);
      console.log(`✅ Habilitado: ${routePath}`);
      return true;
    }
  }
  
  // Si no es específico o no se encontró, buscar recursivamente
  return await enableRecursive(appDir);
}

async function main() {
  const command = process.argv[2];
  
  if (command === 'disable') {
    console.log('🚫 Deshabilitando rutas no-MVP...\n');
    
    let count = 0;
    for (const route of DISABLED_ROUTES) {
      if (await disableRoute(route)) {
        count++;
      }
    }
    
    // Deshabilitar APIs opcionales
    for (const route of DISABLED_API_ROUTES) {
      if (await disableRoute(route)) {
        count++;
      }
    }
    
    // Deshabilitar subcarpetas dentro de (marketing) que no son MVP
    const marketingDir = join(appDir, '(marketing)');
    if (await exists(marketingDir)) {
      const fs = await import('fs');
      const marketingEntries = fs.readdirSync(marketingDir, { withFileTypes: true });
      for (const entry of marketingEntries) {
        // Deshabilitar landing-v2 y flash-videos dentro de (marketing)
        if ((entry.name === 'landing-v2' || entry.name === 'flash-videos') && entry.isDirectory()) {
          const fullPath = join(marketingDir, entry.name);
          const disabledPath = join(marketingDir, `_${entry.name}`);
          if (await exists(fullPath) && !(await exists(disabledPath))) {
            await rename(fullPath, disabledPath);
            console.log(`✅ Deshabilitado: (marketing)/${entry.name} → (marketing)/_${entry.name}`);
            count++;
          }
        }
      }
    }
    
    console.log(`\n✅ ${count} rutas deshabilitadas`);
    console.log('💡 Ejecuta "pnpm run build" ahora');
    
  } else if (command === 'enable') {
    console.log('✅ Habilitando todas las rutas...\n');
    
    const fs = await import('fs');
    
    // Función recursiva para habilitar todas las rutas
    async function enableRecursive(dir, relativePath = '') {
      let count = 0;
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const entryPath = join(dir, entry.name);
        const relativeEntryPath = relativePath ? `${relativePath}/${entry.name}` : entry.name;
        
        if (entry.isDirectory()) {
          if (entry.name.startsWith('_') && entry.name !== '_next') {
            const originalName = entry.name.slice(1);
            const disabledPath = entryPath;
            const enabledPath = join(dir, originalName);
            
            await rename(disabledPath, enabledPath);
            console.log(`✅ Habilitado: ${relativeEntryPath} → ${relativePath ? `${relativePath}/` : ''}${originalName}`);
            count++;
          } else if (!entry.name.startsWith('_')) {
            // Buscar recursivamente en subdirectorios
            count += await enableRecursive(entryPath, relativeEntryPath);
          }
        }
      }
      
      return count;
    }
    
    const count = await enableRecursive(appDir);
    console.log(`\n✅ ${count} rutas habilitadas`);
    
  } else {
    console.log('Uso:');
    console.log('  node scripts/prepare-mvp-build.mjs disable  - Deshabilitar rutas no-MVP');
    console.log('  node scripts/prepare-mvp-build.mjs enable   - Habilitar todas las rutas');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});

