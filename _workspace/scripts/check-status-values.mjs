#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

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

async function checkStatusValues() {
  try {
    console.log('🔍 Verificando valores válidos para el campo status...');
    
    // Intentar diferentes valores para status
    const testValues = ['available', 'unavailable', 'disponible', 'no_disponible', 'active', 'inactive', 'ready', 'pending'];
    
    for (const statusValue of testValues) {
      console.log(`🧪 Probando status: "${statusValue}"`);
      
      const testUnit = {
        id: uuidv4(),
        provider: 'test',
        source_unit_id: 'test',
        building_id: '00000000-0000-0000-0000-000000000000',
        unidad: 'test',
        tipologia: 'test',
        bedrooms: 1,
        bathrooms: 1,
        area_m2: 50,
        area_interior_m2: 50,
        area_exterior_m2: 0,
        orientacion: 'N/A',
        pet_friendly: false,
        precio: 500000,
        gastos_comunes: 0,
        disponible: true,
        status: statusValue,
        promotions: '{}',
        comment_text: '',
        internal_flags: '{}'
      };
      
      const { error } = await supabase
        .from('units')
        .insert(testUnit);
      
      if (error) {
        console.log(`❌ "${statusValue}" - Error: ${error.message}`);
      } else {
        console.log(`✅ "${statusValue}" - Éxito`);
        // Limpiar el registro de prueba
        await supabase.from('units').delete().eq('id', testUnit.id);
      }
    }
    
  } catch (error) {
    console.error('❌ Error durante la verificación:', error.message);
  }
}

checkStatusValues();
