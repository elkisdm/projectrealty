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
      // En desarrollo, mostrar todos los argumentos
      if (args.length === 0) {
        console.error('[Error] No error details provided');
      } else if (args.length === 1) {
        console.error('[Error]', args[0]);
      } else {
        // Si hay múltiples argumentos, el primero es el mensaje y el resto son detalles
        const [message, ...details] = args;
        console.error('[Error]', message);
        if (details.length > 0) {
          // Intentar mostrar los detalles de forma legible
          details.forEach((detail, index) => {
            if (typeof detail === 'object' && detail !== null) {
              const keys = Object.keys(detail);
              if (keys.length === 0) {
                console.error(`  [Detail ${index + 1}] Empty object`);
                console.error(`  [Detail ${index + 1}] Type:`, typeof detail);
                console.error(`  [Detail ${index + 1}] Value:`, JSON.stringify(detail));
              } else {
                // Mostrar cada propiedad individualmente para mejor debugging
                console.error(`  [Detail ${index + 1}] Object with ${keys.length} properties:`);
                keys.forEach(key => {
                  const value = (detail as Record<string, unknown>)[key];
                  console.error(`    - ${key}:`, value, `(type: ${typeof value})`);
                });
                // También mostrar el objeto completo
                console.error(`  [Detail ${index + 1}] Full object:`, detail);
              }
            } else {
              console.error(`  [Detail ${index + 1}]`, detail, `(type: ${typeof detail})`);
            }
          });
        }
      }
    } else {
      // En producción, solo log críticos sin información sensible
      // Considera integrar con un servicio de logging (Sentry, LogRocket, etc.)
      console.error('[Error]', args[0] || 'Unknown error');
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
