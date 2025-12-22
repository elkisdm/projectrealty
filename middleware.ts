import { proxy } from './proxy';

// Next.js requiere que el middleware esté en middleware.ts en la raíz
// Re-exportamos proxy como middleware para mantener compatibilidad
export { proxy as middleware };

