/**
 * Lista completa de comunas de la Región Metropolitana de Santiago, Chile
 * Usada para autocompletado y validación en formularios Tree
 */

export const CHILEAN_COMMUNES_RM = [
  // Comunas principales (más populares primero)
  'Las Condes',
  'Providencia',
  'Ñuñoa',
  'Santiago',
  'Vitacura',
  'La Reina',
  'Lo Barnechea',
  'Macul',
  'Peñalolén',
  'La Florida',
  'San Miguel',
  'Maipú',
  'Recoleta',
  'Independencia',
  'Estación Central',
  'Quinta Normal',
  'Lo Espejo',
  'Pedro Aguirre Cerda',
  'San Joaquín',
  'La Granja',
  'La Pintana',
  'El Bosque',
  'La Cisterna',
  'San Ramón',
  'Huechuraba',
  'Conchalí',
  'Renca',
  'Cerro Navia',
  'Lo Prado',
  'Pudahuel',
  'Quilicura',
  'Colina',
  'Lampa',
  'Tiltil',
  'Puente Alto',
  'San Bernardo',
  'Buin',
  'Calera de Tango',
  'Paine',
  'Talagante',
  'El Monte',
  'Isla de Maipo',
  'Padre Hurtado',
  'Peñaflor',
  'Melipilla',
  'Alhué',
  'Curacaví',
  'María Pinto',
  'San Pedro',
  'Cerrillos',
  'Padre Hurtado',
] as const;

/**
 * Lista de comunas principales (top 15) para uso en componentes más simples
 */
export const COMUNAS_PRINCIPALES = CHILEAN_COMMUNES_RM.slice(0, 15);

/**
 * Normaliza nombre de comuna para comparación (case-insensitive, sin acentos)
 */
export function normalizeCommuneName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .trim();
}

/**
 * Busca comunas que coincidan con el texto ingresado
 */
export function searchCommunes(query: string, limit: number = 10): string[] {
  if (!query || query.length < 2) {
    return COMUNAS_PRINCIPALES.slice(0, limit);
  }

  const normalizedQuery = normalizeCommuneName(query);
  
  return CHILEAN_COMMUNES_RM
    .filter(commune => 
      normalizeCommuneName(commune).includes(normalizedQuery)
    )
    .slice(0, limit);
}

/**
 * Valida si una comuna existe en la lista
 */
export function isValidCommune(commune: string): boolean {
  return CHILEAN_COMMUNES_RM.some(
    c => normalizeCommuneName(c) === normalizeCommuneName(commune)
  );
}
