#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const WHATSAPP_PHONE = '+56993481594';
const ENV_LOCAL_PATH = '.env.local';

console.log('🔧 Configurando WhatsApp para testing local...');

// Crear .env.local si no existe
const envContent = `# WhatsApp Configuration
NEXT_PUBLIC_WHATSAPP_PHONE=${WHATSAPP_PHONE}

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
`;

try {
  fs.writeFileSync(ENV_LOCAL_PATH, envContent);
  console.log('✅ .env.local creado con éxito');
  console.log(`📱 WhatsApp configurado: ${WHATSAPP_PHONE}`);
  console.log('');
  console.log('🚀 Para probar:');
  console.log('1. Reinicia el servidor: npm run dev');
  console.log('2. Ve a: http://localhost:3000/coming-soon');
  console.log('3. El botón WhatsApp debería estar habilitado');
  console.log('');
  console.log('🔗 Deep link generado:');
  console.log(`https://wa.me/${WHATSAPP_PHONE.replace('+', '')}?text=Hola%20me%20interesa%20el%20lanzamiento`);
} catch (error) {
  console.error('❌ Error creando .env.local:', error.message);
  process.exit(1);
}
