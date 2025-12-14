/**
 * Utilidades para normalización de slugs según especificación SEO
 */

/**
 * Normaliza un texto a slug (minúsculas, sin acentos, sin caracteres especiales)
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * Normaliza el nombre de una comuna a slug
 * Ejemplo: "Las Condes" -> "las-condes"
 */
export function normalizeComunaSlug(comuna: string): string {
  return generateSlug(comuna);
}

/**
 * Convierte un slug de comuna de vuelta a formato legible
 * Ejemplo: "las-condes" -> "Las Condes"
 */
export function slugToComunaName(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}


