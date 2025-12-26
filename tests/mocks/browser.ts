import { setupWorker } from 'msw/browser';
import { handlers, errorHandlers, timeoutHandlers } from './handlers';

// Configurar el worker MSW para el navegador (Playwright)
export const worker = setupWorker(...handlers);

// Worker con errores para tests de manejo de errores
export const errorWorker = setupWorker(...errorHandlers);

// Worker con timeouts para tests de timeout
export const timeoutWorker = setupWorker(...timeoutHandlers);

// Configuración para el navegador
export const setupMSWBrowser = () => {
  worker.start({
    onUnhandledRequest: 'warn',
    serviceWorker: {
      url: '/mockServiceWorker.js',
    },
  });
};

export const teardownMSWBrowser = () => {
  worker.stop();
  errorWorker.stop();
  timeoutWorker.stop();
};

// Utilidades para tests en el navegador
export const resetBrowserHandlers = () => {
  worker.resetHandlers();
};

export const useBrowserErrorHandlers = () => {
  worker.use(...errorHandlers);
};

export const useBrowserTimeoutHandlers = () => {
  worker.use(...timeoutHandlers);
};

export const restoreBrowserHandlers = () => {
  worker.resetHandlers(...handlers);
};
