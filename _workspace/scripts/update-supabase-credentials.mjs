#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';

console.log('🔧 ACTUALIZANDO CREDENCIALES DE SUPABASE');
console.log('======================================');

const envPath = path.join(process.cwd(), '.env.local');

const newCredentials = {
  SUPABASE_URL: 'https://keyluynuhmfuqydnmbfh.supabase.co',
  NEXT_PUBLIC_SUPABASE_URL: 'https://keyluynuhmfuqydnmbfh.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtleWx1eW51aG1mdXF5ZG5tYmZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4NTUxOTQsImV4cCI6MjA3MDQzMTE5NH0.9Z_GjwsQ5xlmxNjKQsEk30-XuzmQaybC_6eynK0UL5g',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtleWx1eW51aG1mdXF5ZG5tYmZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4NTUxOTQsImV4cCI6MjA3MDQzMTE5NH0.9Z_GjwsQ5xlmxNjKQsEk30-XuzmQaybC_6eynK0UL5g',
  SUPABASE_SERVICE_ROLE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtleWx1eW51aG1mdXF5ZG5tYmZoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg1NTE5NCwiZXhwIjoyMDcwNDMxMTk0fQ.o2yIbadLQIJQrc2X0XCcraWRJ1_TTJysUIMze4fkxeQ',
  USE_SUPABASE: 'true'
};

async function updateCredentials() {
  try {
    console.log('📄 Leyendo archivo .env.local actual...');
    
    let envContent = '';
    try {
      envContent = await fs.readFile(envPath, 'utf-8');
    } catch (error) {
      console.log('⚠️ Archivo .env.local no existe, se creará uno nuevo');
    }

    console.log('🔄 Actualizando credenciales...');
    
    const lines = envContent.split('\n');
    const updatedLines = [];
    const processedKeys = new Set();

    // Procesar líneas existentes
    for (const line of lines) {
      if (line.trim() === '' || line.trim().startsWith('#')) {
        updatedLines.push(line);
        continue;
      }

      const [key] = line.split('=');
      if (key && newCredentials.hasOwnProperty(key)) {
        updatedLines.push(`${key}=${newCredentials[key]}`);
        processedKeys.add(key);
        console.log(`   ✅ Actualizado: ${key}`);
      } else {
        updatedLines.push(line);
      }
    }

    // Agregar nuevas credenciales que no existían
    for (const [key, value] of Object.entries(newCredentials)) {
      if (!processedKeys.has(key)) {
        updatedLines.push(`${key}=${value}`);
        console.log(`   ➕ Agregado: ${key}`);
      }
    }

    // Escribir archivo actualizado
    const newContent = updatedLines.join('\n');
    await fs.writeFile(envPath, newContent, 'utf-8');
    
    console.log('\n✅ Credenciales actualizadas exitosamente');
    console.log(`📁 Archivo: ${envPath}`);
    
    // Verificar las credenciales
    console.log('\n🔍 Verificando credenciales...');
    for (const [key, value] of Object.entries(newCredentials)) {
      const maskedValue = value.length > 20 ? `${value.substring(0, 10)}...${value.slice(-10)}` : value;
      console.log(`   ${key}: ${maskedValue}`);
    }

    console.log('\n🎯 Próximos pasos:');
    console.log('1. Ejecuta: pnpm run debug:supabase');
    console.log('2. Si pasa, ejecuta: pnpm run test:mapping');
    console.log('3. Finalmente: pnpm run qa:supabase');

  } catch (error) {
    console.error('❌ Error actualizando credenciales:', error.message);
    process.exit(1);
  }
}

updateCredentials();
