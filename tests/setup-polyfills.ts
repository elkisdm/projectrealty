// Polyfills para Jest y MSW
import { TextEncoder, TextDecoder } from 'util';

// Polyfill para TextEncoder/TextDecoder
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

// Polyfill para crypto si es necesario
if (!global.crypto) {
  global.crypto = require('crypto').webcrypto;
}

// Polyfill para fetch si es necesario
if (!global.fetch) {
  // En Node.js 18+, fetch está disponible globalmente
  if (typeof globalThis.fetch === 'undefined') {
    const fetch = require('node-fetch');
    global.fetch = fetch;
  } else {
    global.fetch = globalThis.fetch;
  }
}

// Polyfills para Web APIs necesarias para Next.js Server Components
// Request, Response, Headers son necesarios para NextRequest y NextResponse
// En Node.js 18+, estas APIs están disponibles en globalThis pero jsdom no las expone en global
if (typeof global.Request === 'undefined') {
  if (typeof globalThis.Request !== 'undefined') {
    // Copiar desde globalThis a global para que estén disponibles en el scope global de Jest
    // Necesario porque jsdom no expone estas APIs globalmente
    Object.assign(global, {
      Request: globalThis.Request,
      Response: globalThis.Response,
      Headers: globalThis.Headers,
      URL: globalThis.URL,
      URLSearchParams: globalThis.URLSearchParams,
    });
  }
  // Si no están disponibles, los tests de API fallarán con mensaje claro
}

// Polyfill para TransformStream (necesario para Playwright en Node.js)
if (typeof global.TransformStream === 'undefined') {
  if (typeof globalThis.TransformStream !== 'undefined') {
    global.TransformStream = globalThis.TransformStream;
  } else {
    // Fallback básico si no está disponible
    global.TransformStream = class TransformStream {
      constructor() {
        // Implementación mínima para tests
      }
    } as any;
  }
}
