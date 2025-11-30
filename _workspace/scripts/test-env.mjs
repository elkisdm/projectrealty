import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

console.log('🔍 Verificando variables de entorno...\n');

console.log(`USE_SUPABASE: ${process.env.USE_SUPABASE}`);
console.log(`USE_ASSETPLAN_SOURCE: ${process.env.USE_ASSETPLAN_SOURCE}`);
console.log(`SUPABASE_URL: ${process.env.SUPABASE_URL ? 'Configurado' : 'No configurado'}`);
console.log(`SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Configurado' : 'No configurado'}`);

console.log('\n🔧 Evaluando condiciones:');
console.log(`USE_SUPABASE === "true": ${process.env.USE_SUPABASE === "true"}`);
console.log(`USE_ASSETPLAN_SOURCE === "true": ${process.env.USE_ASSETPLAN_SOURCE === "true"}`);

if (process.env.USE_SUPABASE === "true") {
  console.log('✅ USE_SUPABASE está habilitado');
} else {
  console.log('❌ USE_SUPABASE NO está habilitado');
}
