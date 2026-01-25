import fs from 'fs';
import path from 'path';

async function countCondominiosFromCSV() {
  try {
    console.log('🔍 Contando condominios únicos desde el CSV...\n');
    
    // Leer el CSV original
    const csvPath = path.join(process.cwd(), 'data', 'sources', 'assetplan-export-updated.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    
    // Parsear el CSV (separado por ;)
    const lines = csvContent.split('\n').filter(line => line.trim());
    const headers = lines[0].split(';');
    
    console.log(`📊 Total de líneas en CSV: ${lines.length - 1} (excluyendo header)`);
    
    // Encontrar índices de las columnas relevantes
    const opIndex = headers.findIndex(h => h === 'OP');
    const condominioIndex = headers.findIndex(h => h === 'Condominio');
    const direccionIndex = headers.findIndex(h => h === 'Direccion');
    const comunaIndex = headers.findIndex(h => h === 'Comuna');
    const tipologiaIndex = headers.findIndex(h => h === 'Tipologia');
    const arriendoIndex = headers.findIndex(h => h === 'Arriendo Total');
    const unidadIndex = headers.findIndex(h => h === 'Unidad');
    
    console.log(`📋 Índices de columnas:`);
    console.log(`   • OP: ${opIndex}`);
    console.log(`   • Condominio: ${condominioIndex}`);
    console.log(`   • Direccion: ${direccionIndex}`);
    console.log(`   • Comuna: ${comunaIndex}`);
    console.log(`   • Tipologia: ${tipologiaIndex}`);
    console.log(`   • Arriendo Total: ${arriendoIndex}`);
    console.log(`   • Unidad: ${unidadIndex}`);
    
    // Procesar las líneas de datos
    const condominiosMap = new Map();
    const opMap = new Map();
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const values = line.split(';');
      
      if (values.length < Math.max(opIndex, condominioIndex, direccionIndex, comunaIndex) + 1) {
        continue; // Línea incompleta
      }
      
      const op = values[opIndex]?.trim();
      const condominio = values[condominioIndex]?.trim();
      const direccion = values[direccionIndex]?.trim();
      const comuna = values[comunaIndex]?.trim();
      const tipologia = values[tipologiaIndex]?.trim();
      const arriendo = parseFloat(values[arriendoIndex]?.replace(/[^\d]/g, '') || '0');
      const unidad = values[unidadIndex]?.trim();
      
      // Agrupar por condominio
      if (condominio) {
        if (!condominiosMap.has(condominio)) {
          condominiosMap.set(condominio, {
            count: 0,
            unidades: [],
            comunas: new Set(),
            direcciones: new Set(),
            tipologias: new Set(),
            precios: [],
            ops: new Set()
          });
        }
        const condominioData = condominiosMap.get(condominio);
        condominioData.count++;
        condominioData.unidades.push(unidad);
        condominioData.comunas.add(comuna);
        condominioData.direcciones.add(direccion);
        condominioData.tipologias.add(tipologia);
        if (arriendo > 0) {
          condominioData.precios.push(arriendo);
        }
        if (op) {
          condominioData.ops.add(op);
        }
      }
      
      // Agrupar por OP
      if (op) {
        if (!opMap.has(op)) {
          opMap.set(op, {
            count: 0,
            unidades: [],
            comunas: new Set(),
            direcciones: new Set(),
            tipologias: new Set(),
            precios: [],
            condominios: new Set()
          });
        }
        const opData = opMap.get(op);
        opData.count++;
        opData.unidades.push(unidad);
        opData.comunas.add(comuna);
        opData.direcciones.add(direccion);
        opData.tipologias.add(tipologia);
        if (arriendo > 0) {
          opData.precios.push(arriendo);
        }
        if (condominio) {
          opData.condominios.add(condominio);
        }
      }
    }
    
    console.log(`\n🏢 CONDOMINIOS ÚNICOS (${condominiosMap.size}):`);
    console.log('=' .repeat(80));
    
    Array.from(condominiosMap.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 20) // Mostrar los primeros 20
      .forEach(([condominio, data]) => {
        const minPrice = data.precios.length > 0 ? Math.min(...data.precios) : 0;
        const maxPrice = data.precios.length > 0 ? Math.max(...data.precios) : 0;
        const avgPrice = data.precios.length > 0 ? data.precios.reduce((a, b) => a + b, 0) / data.precios.length : 0;
        
        console.log(`\n📋 ${condominio}`);
        console.log(`   🏠 Unidades: ${data.count}`);
        console.log(`   📍 Comunas: ${Array.from(data.comunas).join(', ')}`);
        console.log(`   🏢 Direcciones: ${Array.from(data.direcciones).join(', ')}`);
        console.log(`   🏗️ Tipologías: ${Array.from(data.tipologias).join(', ')}`);
        console.log(`   💰 Precio desde: $${minPrice.toLocaleString('es-CL')}`);
        console.log(`   💰 Precio hasta: $${maxPrice.toLocaleString('es-CL')}`);
        console.log(`   💰 Precio promedio: $${avgPrice.toLocaleString('es-CL')}`);
        console.log(`   🏢 OPs: ${Array.from(data.ops).join(', ')}`);
      });
    
    if (condominiosMap.size > 20) {
      console.log(`\n... y ${condominiosMap.size - 20} condominios más`);
    }
    
    console.log(`\n🏗️  OPs ÚNICOS (${opMap.size}):`);
    console.log('=' .repeat(80));
    
    Array.from(opMap.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 20) // Mostrar los primeros 20
      .forEach(([op, data]) => {
        const minPrice = data.precios.length > 0 ? Math.min(...data.precios) : 0;
        const maxPrice = data.precios.length > 0 ? Math.max(...data.precios) : 0;
        const avgPrice = data.precios.length > 0 ? data.precios.reduce((a, b) => a + b, 0) / data.precios.length : 0;
        
        console.log(`\n📋 ${op}`);
        console.log(`   🏠 Unidades: ${data.count}`);
        console.log(`   📍 Comunas: ${Array.from(data.comunas).join(', ')}`);
        console.log(`   🏢 Direcciones: ${Array.from(data.direcciones).join(', ')}`);
        console.log(`   🏗️ Tipologías: ${Array.from(data.tipologias).join(', ')}`);
        console.log(`   💰 Precio desde: $${minPrice.toLocaleString('es-CL')}`);
        console.log(`   💰 Precio hasta: $${maxPrice.toLocaleString('es-CL')}`);
        console.log(`   💰 Precio promedio: $${avgPrice.toLocaleString('es-CL')}`);
        console.log(`   🏢 Condominios: ${Array.from(data.condominios).join(', ')}`);
      });
    
    if (opMap.size > 20) {
      console.log(`\n... y ${opMap.size - 20} OPs más`);
    }
    
    // Estadísticas por comuna
    const comunasMap = new Map();
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const values = line.split(';');
      if (values.length > comunaIndex) {
        const comuna = values[comunaIndex]?.trim();
        if (comuna) {
          comunasMap.set(comuna, (comunasMap.get(comuna) || 0) + 1);
        }
      }
    }
    
    console.log(`\n🏘️  UNIDADES POR COMUNA:`);
    console.log('=' .repeat(80));
    
    Array.from(comunasMap.entries())
      .sort((a, b) => b[1] - a[1])
      .forEach(([comuna, count]) => {
        console.log(`   📍 ${comuna}: ${count} unidades`);
      });
    
    console.log(`\n📈 RESUMEN:`);
    console.log(`   • Total unidades en CSV: ${lines.length - 1}`);
    console.log(`   • Condominios únicos: ${condominiosMap.size}`);
    console.log(`   • OPs únicos: ${opMap.size}`);
    console.log(`   • Comunas: ${comunasMap.size}`);
    console.log(`   • Promedio unidades por condominio: ${((lines.length - 1) / condominiosMap.size).toFixed(1)}`);
    
  } catch (error) {
    console.error('❌ Error fatal:', error);
  }
}

countCondominiosFromCSV();

