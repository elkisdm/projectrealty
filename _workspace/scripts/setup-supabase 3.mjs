import { createClient } from '@supabase/supabase-js';
import { readFile } from 'node:fs/promises';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error('❌ Faltan variables de entorno requeridas:');
  console.error('   - SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { persistSession: false }
});

async function setupSupabase() {
  try {
    console.log('📖 Leyendo esquema SQL...');
    const schema = await readFile('supabase/schema.sql', 'utf8');
    
    console.log('🔧 Ejecutando esquema en Supabase...');
    
    // Ejecutar el esquema SQL
    const { error } = await supabase.rpc('exec_sql', { sql: schema });
    
    if (error) {
      console.error('❌ Error ejecutando esquema:', error);
      
      // Intentar ejecutar las consultas por separado
      console.log('🔄 Intentando ejecutar consultas por separado...');
      
      const queries = schema.split(';').filter(q => q.trim());
      
      for (const query of queries) {
        if (query.trim()) {
          try {
            const { error: queryError } = await supabase.rpc('exec_sql', { sql: query });
            if (queryError) {
              console.warn(`⚠️  Query falló: ${query.substring(0, 50)}...`);
            }
          } catch (e) {
            console.warn(`⚠️  Query falló: ${e.message}`);
          }
        }
      }
    } else {
      console.log('✅ Esquema ejecutado exitosamente');
    }
    
    // Verificar que las tablas existen
    console.log('🔍 Verificando tablas...');
    
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['buildings', 'units']);
    
    if (tablesError) {
      console.error('❌ Error verificando tablas:', tablesError);
    } else {
      console.log('📋 Tablas encontradas:', tables.map(t => t.table_name));
    }
    
    console.log('🎉 Setup completado!');
    
  } catch (error) {
    console.error('❌ Error durante el setup:', error);
    process.exit(1);
  }
}

setupSupabase();
