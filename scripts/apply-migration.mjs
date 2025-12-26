import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Cargar env vars
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Falta SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
    const migrationPath = path.resolve(__dirname, '../config/supabase/migrations/20250125_add_gc_mode_fields.sql');
    const sql = fs.readFileSync(migrationPath, 'utf-8');
    
    console.log('🚀 Aplicando migración:', migrationPath);

    // Remove comments and prepare SQL
    const cleanSql = sql
        .split('\n')
        .filter(line => !line.trim().startsWith('--')) // Remove comment lines
        .join('\n');

    // Split statements
    const statements = cleanSql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);

    for (const statement of statements) {
        try {
            console.log(`\nEjecutando SQL: ${statement.substring(0, 50)}...`);
            const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
            
            if (error) {
                console.error('❌ Error:', error.message);
                if (error.message.includes('function "exec_sql" does not exist') || error.message.includes('RPC exec_sql no disponible')) {
                     console.error('\n⚠️  La función RPC "exec_sql" no está instalada en Supabase.');
                     console.error('Debes ejecutar el SQL manualmente en el dashboard de Supabase (SQL Editor).');
                     process.exit(1);
                }
            } else {
                console.log('✅ OK');
            }
        } catch (e) {
            console.error('❌ Excepción:', e.message);
        }
    }
    
    console.log('\n🏁 Migración finalizada.');
}

run();
