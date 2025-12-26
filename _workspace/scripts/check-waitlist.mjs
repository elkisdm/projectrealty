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

async function checkWaitlist() {
  try {
    console.log('🔍 Verificando datos de waitlist...');
    
    const { data, error } = await supabase
      .from('waitlist')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) {
      console.error('❌ Error consultando waitlist:', error);
      return;
    }
    
    console.log(`✅ Encontrados ${data.length} registros en waitlist:`);
    console.log('');
    
    data.forEach((record, index) => {
      console.log(`${index + 1}. ${record.email}${record.phone ? ` (${record.phone})` : ''}`);
      console.log(`   Source: ${record.source}`);
      console.log(`   Created: ${new Date(record.created_at).toLocaleString()}`);
      console.log(`   UTM: ${JSON.stringify(record.utm)}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
}

checkWaitlist();
