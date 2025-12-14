/* eslint-disable no-console -- Logger implementation requires console access */
/**
 * Sistema de logging para desarrollo
 * Solo muestra logs en desarrollo, en producción no hace nada
 */

const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Logger que solo funciona en desarrollo
 */
export const logger = {
  /**
   * Log de información general (solo en desarrollo)
   */
  log: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  /**
   * Log de advertencias (solo en desarrollo)
   */
  warn: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },

  /**
   * Log de errores (siempre visible, pero solo en desarrollo se muestra completo)
   * En producción, considera usar un servicio de logging externo
   */
  error: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.error(...args);
    } else {
      // En producción, solo log críticos sin información sensible
      // Considera integrar con un servicio de logging (Sentry, LogRocket, etc.)
      console.error('[Error]', args[0]);
    }
  },

  /**
   * Log de información (solo en desarrollo)
   */
  info: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.info(...args);
    }
  },

  /**
   * Log de debug (solo en desarrollo)
   */
  debug: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },
};
