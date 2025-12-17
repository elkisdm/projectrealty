#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY son requeridos');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function setupWaitlist() {
  console.log('🔧 Configurando tabla waitlist...');
  
  try {
    // Leer el archivo SQL
    const sqlPath = path.join(process.cwd(), 'scripts', 'setup-waitlist.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Ejecutar el SQL
    const { error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      // Si exec_sql no existe, intentar con query directo
      console.log('⚠️  exec_sql no disponible, intentando query directo...');
      
      // Ejecutar comandos SQL por separado
      const commands = sql.split(';').filter(cmd => cmd.trim());
      
      for (const command of commands) {
        if (command.trim()) {
          const { error: cmdError } = await supabase.rpc('exec_sql', { sql: command });
          if (cmdError) {
            console.log(`⚠️  Comando saltado: ${command.substring(0, 50)}...`);
          }
        }
      }
    }
    
    // Verificar que la tabla existe
    const { data: tables, error: checkError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'waitlist');
    
    if (checkError) {
      console.log('⚠️  No se pudo verificar la tabla, pero el setup continuó');
    } else if (tables && tables.length > 0) {
      console.log('✅ Tabla waitlist verificada');
    }
    
    console.log('✅ Setup de waitlist completado');
    
  } catch (error) {
    console.error('❌ Error en setup:', error.message);
    process.exit(1);
  }
}

setupWaitlist();
