#!/usr/bin/env node

/**
 * 🎨 Generador de SVGs Glass - Hommie Icon System
 * 
 * Script para procesar glyphs.json y generar SVGs con efectos glass minimal.
 * Utiliza los tokens definidos en tokens.ts para aplicar estilos consistentes.
 */

import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname, basename, extname } from 'path';
import { 
  IconSize, 
  StrokeWeight, 
  OpacityLevel, 
  IconVariant,
  ICON_SIZES,
  STROKE_WEIGHTS,
  OPACITY_LEVELS,
  LIGHT_PRESET,
  DARK_PRESET,
  BRAND_PRESET,
  getPreset
} from './tokens';

// ============================================================================
// INTERFACES Y TIPOS
// ============================================================================

/**
 * Estructura de un path SVG individual
 */
export interface SVGPath {
  /** Comando SVG (M, L, C, etc.) */
  command: string;
  /** Parámetros del comando */
  params: number[];
  /** Atributos opcionales del path */
  attributes?: Record<string, string>;
}

/**
 * Estructura de un glyph individual
 */
export interface Glyph {
  /** Nombre único del glyph */
  name: string;
  /** Array de paths SVG que forman el ícono */
  paths: SVGPath[];
  /** Tamaño recomendado (opcional) */
  recommendedSize?: IconSize;
  /** Stroke recomendado (opcional) */
  recommendedStroke?: StrokeWeight;
  /** Categoría del ícono (opcional) */
  category?: string;
  /** Tags para búsqueda (opcional) */
  tags?: string[];
  /** Descripción del ícono (opcional) */
  description?: string;
}

/**
 * Estructura completa del archivo glyphs.json
 */
export interface GlyphsData {
  /** Metadatos del archivo */
  metadata: {
    /** Versión del formato */
    version: string;
    /** Fecha de generación */
    generatedAt: string;
    /** Autor o fuente */
    author?: string;
    /** Descripción del conjunto */
    description?: string;
  };
  /** Array de glyphs */
  glyphs: Glyph[];
  /** Configuración global (opcional) */
  config?: {
    /** Tamaño por defecto */
    defaultSize?: IconSize;
    /** Stroke por defecto */
    defaultStroke?: StrokeWeight;
    /** Preset por defecto */
    defaultPreset?: 'light' | 'dark' | 'brand';
  };
}

/**
 * Opciones de configuración para el generador
 */
export interface GeneratorOptions {
  /** Preset a usar (light, dark, brand) */
  preset: 'light' | 'dark' | 'brand';
  /** Tamaños a generar */
  sizes: IconSize[];
  /** Strokes a generar */
  strokes: StrokeWeight[];
  /** Variantes a generar */
  variants: IconVariant[];
  /** Directorio de salida */
  outputDir: string;
  /** Si debe sobrescribir archivos existentes */
  overwrite: boolean;
  /** Nivel de verbosidad */
  verbose: boolean;
}

/**
 * Resultado de la generación de un SVG
 */
export interface SVGGenerationResult {
  /** Nombre del archivo generado */
  filename: string;
  /** Ruta completa del archivo */
  filepath: string;
  /** Tamaño del archivo en bytes */
  size: number;
  /** Si la generación fue exitosa */
  success: boolean;
  /** Error si falló */
  error?: string;
}

// ============================================================================
// VALIDACIÓN Y UTILIDADES
// ============================================================================

/**
 * Valida que un path SVG sea válido
 */
function isValidSVGPath(path: SVGPath): boolean {
  if (!path.command || typeof path.command !== 'string') {
    return false;
  }
  
  if (!Array.isArray(path.params)) {
    return false;
  }
  
  // Validar que todos los parámetros sean números
  return path.params.every(param => typeof param === 'number' && !isNaN(param));
}

/**
 * Valida que un glyph sea válido
 */
function isValidGlyph(glyph: Glyph): boolean {
  if (!glyph.name || typeof glyph.name !== 'string') {
    return false;
  }
  
  if (!Array.isArray(glyph.paths) || glyph.paths.length === 0) {
    return false;
  }
  
  // Validar que todos los paths sean válidos
  return glyph.paths.every(isValidSVGPath);
}

/**
 * Valida que los datos de glyphs sean válidos
 */
function validateGlyphsData(data: unknown): data is GlyphsData {
  if (!data || typeof data !== 'object') {
    return false;
  }
  
  const glyphsData = data as GlyphsData;
  
  // Validar metadata
  if (!glyphsData.metadata || typeof glyphsData.metadata !== 'object') {
    return false;
  }
  
  if (!glyphsData.metadata.version || typeof glyphsData.metadata.version !== 'string') {
    return false;
  }
  
  // Validar glyphs
  if (!Array.isArray(glyphsData.glyphs)) {
    return false;
  }
  
  return glyphsData.glyphs.every(isValidGlyph);
}

/**
 * Lee y valida el archivo glyphs.json
 */
function readGlyphsFile(filePath: string): GlyphsData {
  console.log(`📖 Leyendo archivo: ${filePath}`);
  
  // Verificar que el archivo existe
  if (!existsSync(filePath)) {
    throw new Error(`❌ Archivo no encontrado: ${filePath}`);
  }
  
  try {
    // Leer el archivo
    const fileContent = readFileSync(filePath, 'utf-8');
    const data = JSON.parse(fileContent);
    
    // Validar la estructura
    if (!validateGlyphsData(data)) {
      throw new Error('❌ Formato de glyphs.json inválido');
    }
    
    console.log(`✅ Archivo leído correctamente`);
    console.log(`📊 Metadatos: v${data.metadata.version} - ${data.metadata.generatedAt}`);
    
    return data;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`❌ Error de sintaxis JSON en ${filePath}: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Analiza y reporta estadísticas de los glyphs
 */
function analyzeGlyphs(glyphs: Glyph[]): void {
  console.log(`\n📈 ANÁLISIS DE GLYPHS:`);
  console.log(`   Total de glyphs: ${glyphs.length}`);
  
  // Contar por categorías
  const categories = new Map<string, number>();
  const sizes = new Map<IconSize, number>();
  const strokes = new Map<StrokeWeight, number>();
  
  glyphs.forEach(glyph => {
    // Categorías
    const category = glyph.category || 'Sin categoría';
    categories.set(category, (categories.get(category) || 0) + 1);
    
    // Tamaños recomendados
    if (glyph.recommendedSize) {
      sizes.set(glyph.recommendedSize, (sizes.get(glyph.recommendedSize) || 0) + 1);
    }
    
    // Strokes recomendados
    if (glyph.recommendedStroke) {
      strokes.set(glyph.recommendedStroke, (strokes.get(glyph.recommendedStroke) || 0) + 1);
    }
  });
  
  // Mostrar estadísticas
  console.log(`\n   📂 Categorías:`);
  categories.forEach((count, category) => {
    console.log(`      ${category}: ${count} glyphs`);
  });
  
  console.log(`\n   📏 Tamaños recomendados:`);
  sizes.forEach((count, size) => {
    console.log(`      ${size}: ${count} glyphs`);
  });
  
  console.log(`\n   🖊️ Strokes recomendados:`);
  strokes.forEach((count, stroke) => {
    console.log(`      ${stroke}: ${count} glyphs`);
  });
  
  // Validar paths
  let totalPaths = 0;
  let validPaths = 0;
  
  glyphs.forEach(glyph => {
    totalPaths += glyph.paths.length;
    validPaths += glyph.paths.filter(isValidSVGPath).length;
  });
  
  console.log(`\n   🛣️ Paths SVG:`);
  console.log(`      Total: ${totalPaths}`);
  console.log(`      Válidos: ${validPaths}`);
  console.log(`      Inválidos: ${totalPaths - validPaths}`);
  
  if (validPaths < totalPaths) {
    console.log(`   ⚠️  Algunos paths SVG son inválidos`);
  }
}

// ============================================================================
// GENERACIÓN DE SVGs GLASS
// ============================================================================

/**
 * Convierte un path SVG a string
 */
function pathToString(path: SVGPath): string {
  const command = path.command;
  const params = path.params.join(' ');
  const attributes = path.attributes || {};
  
  // Construir atributos
  const attrString = Object.entries(attributes)
    .map(([key, value]) => `${key}="${value}"`)
    .join(' ');
  
  return `<path d="${command} ${params}" ${attrString} />`;
}

/**
 * Genera un SVG con efectos glass
 */
function makeGlassSVG(
  glyph: Glyph,
  size: IconSize,
  stroke: StrokeWeight,
  variant: IconVariant,
  preset: ReturnType<typeof getPreset>
): string {
  const iconSize = ICON_SIZES[size];
  const strokeWidth = STROKE_WEIGHTS[stroke];
  
  // Convertir paths a strings
  const pathElements = glyph.paths.map(pathToString).join('\n    ');
  
  // Determinar colores según la variante
  let fillColor = 'none';
  let strokeColor = preset.colors.primary;
  
  switch (variant) {
    case 'filled':
      fillColor = preset.colors.primary;
      strokeColor = 'none';
      break;
    case 'duotone':
      fillColor = preset.colors.secondary;
      strokeColor = preset.colors.primary;
      break;
    case 'gradient':
      fillColor = `url(#${glyph.name}-gradient)`;
      strokeColor = preset.colors.primary;
      break;
    default: // outline
      fillColor = 'none';
      strokeColor = preset.colors.primary;
  }
  
  // Generar definiciones de gradiente si es necesario
  const gradientDefs = variant === 'gradient' 
    ? `
  <defs>
    <linearGradient id="${glyph.name}-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${preset.colors.primary};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${preset.colors.secondary};stop-opacity:1" />
    </linearGradient>
  </defs>`
    : '';
  
  // Generar filtros glass
  const glassFilter = `
  <defs>
    <filter id="glass-${glyph.name}" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
      <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="glow" />
      <feBlend in="SourceGraphic" in2="glow" mode="normal" />
    </filter>
  </defs>`;
  
  // Construir el SVG
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <title>${glyph.name} - ${variant} - ${size}</title>
  <desc>${glyph.description || `Ícono ${glyph.name} con estilo ${variant}`}</desc>
  ${gradientDefs}
  ${glassFilter}
  <g filter="url(#glass-${glyph.name})" style="backdrop-filter: ${preset.blur.medium};">
    <rect width="24" height="24" fill="${preset.colors.glass}" stroke="${preset.colors.glassBorder}" stroke-width="0.5" rx="4" />
    <g fill="${fillColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">
    ${pathElements}
    </g>
  </g>
</svg>`;
  
  return svg;
}

/**
 * Genera el nombre del archivo SVG
 */
function generateSVGFilename(glyph: Glyph, size: IconSize, stroke: StrokeWeight, variant: IconVariant): string {
  return `${glyph.name}-${variant}-${size}-${stroke}.svg`;
}

/**
 * Asegura que el directorio de salida existe
 */
function ensureOutputDirectory(outputDir: string): void {
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
    console.log(`📁 Directorio creado: ${outputDir}`);
  }
}

/**
 * Genera SVGs para un glyph específico
 */
function generateGlyphSVGs(
  glyph: Glyph,
  options: GeneratorOptions,
  preset: ReturnType<typeof getPreset>
): SVGGenerationResult[] {
  const results: SVGGenerationResult[] = [];
  
  // Generar todas las combinaciones
  for (const size of options.sizes) {
    for (const stroke of options.strokes) {
      for (const variant of options.variants) {
        try {
          // Generar SVG
          const svgContent = makeGlassSVG(glyph, size, stroke, variant, preset);
          
          // Generar nombre de archivo
          const filename = generateSVGFilename(glyph, size, stroke, variant);
          const filepath = join(options.outputDir, filename);
          
          // Escribir archivo
          writeFileSync(filepath, svgContent, 'utf-8');
          
          // Obtener tamaño del archivo
          const stats = require('fs').statSync(filepath);
          
          results.push({
            filename,
            filepath,
            size: stats.size,
            success: true
          });
          
          if (options.verbose) {
            console.log(`   ✅ ${filename} (${stats.size} bytes)`);
          }
          
        } catch (error) {
          const filename = generateSVGFilename(glyph, size, stroke, variant);
          results.push({
            filename,
            filepath: join(options.outputDir, filename),
            size: 0,
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido'
          });
          
          if (options.verbose) {
            console.log(`   ❌ ${filename}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
          }
        }
      }
    }
  }
  
  return results;
}

/**
 * Procesa todos los glyphs y genera SVGs
 */
function processGlyphs(glyphs: Glyph[], options: GeneratorOptions): void {
  console.log(`\n🎨 PROCESANDO GLYPHS:`);
  console.log(`   Preset: ${options.preset}`);
  console.log(`   Tamaños: ${options.sizes.join(', ')}`);
  console.log(`   Strokes: ${options.strokes.join(', ')}`);
  console.log(`   Variantes: ${options.variants.join(', ')}`);
  console.log(`   Salida: ${options.outputDir}`);
  
  // Obtener preset
  const preset = getPreset(options.preset);
  
  // Asegurar directorio de salida
  ensureOutputDirectory(options.outputDir);
  
  // Estadísticas
  let totalGenerated = 0;
  let totalSuccess = 0;
  let totalErrors = 0;
  let totalSize = 0;
  
  // Procesar cada glyph
  glyphs.forEach((glyph, index) => {
    console.log(`\n   📝 Procesando ${index + 1}/${glyphs.length}: ${glyph.name}`);
    
    const results = generateGlyphSVGs(glyph, options, preset);
    
    // Contar resultados
    const successCount = results.filter(r => r.success).length;
    const errorCount = results.filter(r => !r.success).length;
    const sizeSum = results.reduce((sum, r) => sum + r.size, 0);
    
    totalGenerated += results.length;
    totalSuccess += successCount;
    totalErrors += errorCount;
    totalSize += sizeSum;
    
    console.log(`      ✅ ${successCount} exitosos, ❌ ${errorCount} errores, 📦 ${(sizeSum / 1024).toFixed(2)} KB`);
  });
  
  // Reporte final
  console.log(`\n📊 REPORTE FINAL:`);
  console.log(`   Total generados: ${totalGenerated}`);
  console.log(`   Exitosos: ${totalSuccess}`);
  console.log(`   Errores: ${totalErrors}`);
  console.log(`   Tamaño total: ${(totalSize / 1024).toFixed(2)} KB`);
  console.log(`   Tasa de éxito: ${((totalSuccess / totalGenerated) * 100).toFixed(1)}%`);
}

// ============================================================================
// FUNCIÓN PRINCIPAL
// ============================================================================

/**
 * Función principal del generador
 */
async function main(): Promise<void> {
  console.log(`🎨 Generador de SVGs Glass - Hommie Icon System\n`);
  
  try {
    // Configuración por defecto
    const defaultGlyphsPath = join(process.cwd(), 'data', 'glyphs.json');
    
    // Leer archivo glyphs.json
    const glyphsData = readGlyphsFile(defaultGlyphsPath);
    
    // Analizar y reportar estadísticas
    analyzeGlyphs(glyphsData.glyphs);
    
    // Mostrar configuración
    console.log(`\n⚙️  CONFIGURACIÓN:`);
    console.log(`   Preset por defecto: ${glyphsData.config?.defaultPreset || 'light'}`);
    console.log(`   Tamaño por defecto: ${glyphsData.config?.defaultSize || 'md'}`);
    console.log(`   Stroke por defecto: ${glyphsData.config?.defaultStroke || 'normal'}`);
    
    // Obtener preset
    const preset = getPreset(glyphsData.config?.defaultPreset || 'light');
    console.log(`\n🎨 Preset activo: ${preset.name}`);
    console.log(`   Colores: ${Object.keys(preset.colors).join(', ')}`);
    console.log(`   Blur: ${preset.blur.light}, ${preset.blur.medium}, ${preset.blur.strong}`);
    
    // Configurar opciones de generación
    const options: GeneratorOptions = {
      preset: glyphsData.config?.defaultPreset || 'light',
      sizes: ['sm', 'md', 'lg'],
      strokes: ['light', 'normal'],
      variants: ['outline', 'filled'],
      outputDir: join(process.cwd(), 'public', 'icons', 'generated'),
      overwrite: true,
      verbose: true
    };
    
    // Procesar glyphs
    processGlyphs(glyphsData.glyphs, options);
    
    console.log(`\n✅ Procesamiento completado exitosamente.`);
    
  } catch (error) {
    console.error(`\n❌ Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    process.exit(1);
  }
}

// ============================================================================
// EJECUCIÓN
// ============================================================================

// Ejecutar la función principal
main().catch(error => {
  console.error(`\n💥 Error fatal: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  process.exit(1);
});

// Exportaciones para uso en otros módulos
export {
  readGlyphsFile,
  analyzeGlyphs,
  isValidGlyph,
  isValidSVGPath,
  validateGlyphsData,
  makeGlassSVG,
  generateGlyphSVGs,
  processGlyphs
};
