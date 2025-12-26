import fs from 'fs';
import path from 'path';

async function checkAvailableUnits() {
  try {
    console.log('🔍 Verificando unidades disponibles en CSV...\n');
    
    const csvPath = path.join(process.cwd(), 'data', 'sources', 'assetplan-export-updated.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    const headers = lines[0].split(';');
    
    // Encontrar índices de las columnas relevantes
    const estadoIndex = headers.findIndex(h => h === 'Estado');
    const condominioIndex = headers.findIndex(h => h === 'Condominio');
    const opIndex = headers.findIndex(h => h === 'OP');
    
    console.log(`📊 Total de líneas en CSV: ${lines.length - 1} (excluyendo header)`);
    
    // Contar estados
    const estados = new Map();
    const condominiosConDisponibles = new Set();
    let totalDisponibles = 0;
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const values = line.split(';');
      
      if (values.length < Math.max(estadoIndex, condominioIndex, opIndex) + 1) {
        continue;
      }
      
      const estado = values[estadoIndex]?.trim() || '';
      const condominio = values[condominioIndex]?.trim() || '';
      const op = values[opIndex]?.trim() || '';
      
      // Contar estados
      estados.set(estado, (estados.get(estado) || 0) + 1);
      
      // Contar disponibles
      if (estado.toLowerCase() === 'disponible') {
        totalDisponibles++;
        condominiosConDisponibles.add(condominio);
      }
    }
    
    console.log('📋 Estados encontrados:');
    for (const [estado, count] of estados) {
      console.log(`  - ${estado}: ${count} unidades`);
    }
    
    console.log(`\n✅ Unidades disponibles: ${totalDisponibles}`);
    console.log(`🏢 Condominios con unidades disponibles: ${condominiosConDisponibles.size}`);
    
    if (condominiosConDisponibles.size > 0) {
      console.log('\n🏢 Condominios con disponibilidad:');
      Array.from(condominiosConDisponibles).slice(0, 10).forEach(condominio => {
        console.log(`  - ${condominio}`);
      });
      if (condominiosConDisponibles.size > 10) {
        console.log(`  ... y ${condominiosConDisponibles.size - 10} más`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkAvailableUnits();

