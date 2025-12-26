import { setupServer } from 'msw/node';
import { handlers, errorHandlers, timeoutHandlers } from './handlers';

// Configurar el servidor MSW para Node.js (tests)
export const server = setupServer(...handlers);

// Servidor con errores para tests de manejo de errores
export const errorServer = setupServer(...errorHandlers);

// Servidor con timeouts para tests de timeout
export const timeoutServer = setupServer(...timeoutHandlers);

// Configuración global para MSW
export const setupMSW = () => {
  // Configurar listeners para logging en desarrollo
  if (process.env.NODE_ENV === 'development') {
    server.listen({
      onUnhandledRequest: 'warn',
    });
  } else {
    server.listen({
      onUnhandledRequest: 'error',
    });
  }
};

export const teardownMSW = () => {
  server.close();
  errorServer.close();
  timeoutServer.close();
};

// Utilidades para tests
export const resetHandlers = () => {
  server.resetHandlers();
};

export const useErrorHandlers = () => {
  server.use(...errorHandlers);
};

export const useTimeoutHandlers = () => {
  server.use(...timeoutHandlers);
};

export const restoreHandlers = () => {
  server.resetHandlers(...handlers);
};
