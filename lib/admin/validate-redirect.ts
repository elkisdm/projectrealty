/**
 * Valida que una URL de redirect sea segura para usar en el panel admin
 * Solo permite rutas relativas dentro del panel admin (/admin/*)
 * 
 * @param redirectUrl URL a validar
 * @param defaultPath Ruta por defecto si la URL no es válida
 * @returns URL validada y segura
 */
export function validateAdminRedirect(
  redirectUrl: string | null | undefined,
  defaultPath: string = '/admin'
): string {
  if (!redirectUrl) {
    return defaultPath;
  }

  // Eliminar espacios y caracteres de control
  const cleaned = redirectUrl.trim();

  // Rechazar URLs absolutas (http://, https://, //)
  if (/^(https?:|\/\/)/i.test(cleaned)) {
    return defaultPath;
  }

  // Rechazar protocolos peligrosos (javascript:, data:, etc.)
  if (/^[a-z][a-z0-9+.-]*:/i.test(cleaned)) {
    return defaultPath;
  }

  // Asegurar que empiece con /admin
  if (!cleaned.startsWith('/admin')) {
    return defaultPath;
  }

  // Rechazar rutas que intenten salir del directorio admin (../, ..)
  if (cleaned.includes('..')) {
    return defaultPath;
  }

  // Rechazar caracteres peligrosos
  if (/[<>"']/.test(cleaned)) {
    return defaultPath;
  }

  // Validar que sea una ruta válida (solo caracteres seguros)
  // Permitir: letras, números, guiones, guiones bajos, barras, query params
  if (!/^\/admin(\/[a-zA-Z0-9\-_/?:=&]*)?$/.test(cleaned)) {
    return defaultPath;
  }

  return cleaned;
}








