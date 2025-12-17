#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Faltan credenciales de Supabase');
  process.exit(1);
}

// Crear cliente con service role
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyWaitlistSchema() {
  try {
    console.log('🚀 Aplicando esquema de tabla waitlist...');
    
    // Crear tabla waitlist
    console.log('📄 Creando tabla waitlist...');
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.waitlist (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          email text NOT NULL CHECK (position('@' in email) > 1),
          phone text,
          source text DEFAULT 'coming-soon',
          utm jsonb DEFAULT '{}'::jsonb,
          created_at timestamptz DEFAULT now()
        );
      `
    });
    
    if (createError) {
      console.log('⚠️  La función exec_sql no está disponible, intentando método alternativo...');
      
      // Intentar crear la tabla usando SQL directo
      const { error: directError } = await supabase
        .from('waitlist')
        .select('*')
        .limit(1);
      
      if (directError && directError.message.includes('relation "waitlist" does not exist')) {
        console.log('❌ No se puede crear la tabla directamente. Usa el SQL Editor de Supabase.');
        console.log('\n📋 Copia y pega este SQL en el SQL Editor de Supabase:');
        console.log(`
-- Crear tabla de waitlist
CREATE TABLE IF NOT EXISTS public.waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL CHECK (position('@' in email) > 1),
  phone text,
  source text DEFAULT 'coming-soon',
  utm jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Configurar RLS para waitlist
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Política para inserción en waitlist
CREATE POLICY "wl_insert" ON public.waitlist 
    FOR INSERT TO anon, authenticated 
    USING (true) WITH CHECK (true);

-- Índice para email en waitlist
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON public.waitlist (email);
        `);
        return;
      }
    }
    
    // Configurar RLS
    console.log('🔒 Configurando Row Level Security...');
    await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;'
    });
    
    // Crear política de inserción
    console.log('📋 Creando política de inserción...');
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE POLICY "wl_insert" ON public.waitlist 
            FOR INSERT TO anon, authenticated 
            USING (true) WITH CHECK (true);
      `
    });
    
    // Crear índice
    console.log('📊 Creando índice de email...');
    await supabase.rpc('exec_sql', {
      sql: 'CREATE INDEX IF NOT EXISTS idx_waitlist_email ON public.waitlist (email);'
    });
    
    console.log('✅ Esquema de waitlist aplicado correctamente');
    
    // Verificar que la tabla existe
    console.log('\n🔍 Verificando tabla waitlist...');
    const { data, error: checkError } = await supabase
      .from('waitlist')
      .select('*')
      .limit(1);
    
    if (checkError) {
      console.error('❌ Error verificando tabla waitlist:', checkError.message);
      return;
    }
    
    console.log('✅ Tabla waitlist creada y verificada correctamente');
    console.log('\n🎉 Configuración completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error durante la configuración:', error.message);
  }
}

applyWaitlistSchema();
