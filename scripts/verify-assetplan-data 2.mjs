import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function verify() {
    console.log('🔍 Verificando datos en Supabase...');
    
    // Consultar una unidad específica
    const { data, error } = await supabase
        .from('units')
        .select(`
            id, 
            price, 
            gc, 
            total_mensual, 
            estacionamiento, 
            bodega, 
            pet_friendly,
            orientacion
        `)
        .eq('id', 'GMND2201-B') // Verificar una unidad específica del CSV
        .single();

    const units = data ? [data] : [];

    if (error) {
        console.error('❌ Error consultando:', error);
        return;
    }

    if (units.length === 0) {
        console.error('❌ No se encontraron unidades.');
        return;
    }

    console.log(`✅ Se encontraron ${units.length} unidades de prueba.`);

    let passed = true;
    for (const unit of units) {
        const expectedTotal = unit.price + unit.gc;
        const totalOk = Math.abs(unit.total_mensual - expectedTotal) < 1; // Tolerancia flotante por si acaso (aunque son INT)
        
        console.log(`\nUnidad: ${unit.id}`);
        console.log(`  Precio: ${unit.price}, GC: ${unit.gc}, Total: ${unit.total_mensual} [${totalOk ? '✅' : '❌'}]`);
        console.log(`  Estacionamiento: ${unit.estacionamiento} (${typeof unit.estacionamiento})`);
        console.log(`  Pet Friendly: ${unit.pet_friendly} (${typeof unit.pet_friendly})`);
        console.log(`  Orientación: ${unit.orientacion}`);

        if (!totalOk) passed = false;
        if (typeof unit.estacionamiento !== 'boolean') {
             console.log('  ❌ Estacionamiento no es boolean');
             passed = false;
        }
    }

    if (passed) {
        console.log('\n✅ VERIFICACIÓN EXITOSA: Los datos y cálculos coinciden.');
    } else {
        console.error('\n❌ FALLÓ LA VERIFICACIÓN.');
        process.exit(1);
    }
}

verify();
