// Setup específico para tests de API que usan entorno Node.js
// Este archivo solo se usa cuando @jest-environment node está configurado

// No necesita mocks de window ni jsdom ya que estamos en entorno Node.js
// Solo necesitamos asegurar que las APIs globales estén disponibles

// Polyfills para Web APIs necesarias para Next.js Server Components
if (typeof global.Request === 'undefined' && typeof globalThis.Request !== 'undefined') {
  Object.assign(global, {
    Request: globalThis.Request,
    Response: globalThis.Response,
    Headers: globalThis.Headers,
    URL: globalThis.URL,
    URLSearchParams: globalThis.URLSearchParams,
  });
}















