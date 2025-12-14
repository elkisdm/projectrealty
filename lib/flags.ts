import { featureFlags } from '../config/feature-flags';

// In-memory storage para overrides (temporal hasta implementar Redis/Supabase)
const overrideStore = new Map<string, { value: boolean; expiresAt: number }>();

// Tipos para flags soportados
export type SupportedFlag = 'comingSoon' | 'CARD_V2' | 'VIRTUAL_GRID' | 'pagination' | 'COMMUNE_SECTION' | 'FOOTER_ENABLED' | 'HEADER_ENABLED';

// Interface para override
export interface FlagOverride {
  flag: SupportedFlag;
  value: boolean;
  duration: number; // segundos
}

// Función para obtener el valor actual de un flag (con override)
export function getFlagValue(flag: SupportedFlag): boolean {
  const override = overrideStore.get(flag);
  
  // Si hay override activo y no ha expirado
  if (override && Date.now() < override.expiresAt) {
    return override.value;
  }
  
  // Si el override expiró, limpiarlo
  if (override && Date.now() >= override.expiresAt) {
    overrideStore.delete(flag);
  }
  
  // Retornar valor por defecto
  switch (flag) {
    case 'comingSoon':
      return Boolean(featureFlags.comingSoon);
    case 'CARD_V2':
      return process.env.NEXT_PUBLIC_FLAG_CARD_V2 === "1";
    case 'VIRTUAL_GRID':
      return process.env.NEXT_PUBLIC_FLAG_VIRTUAL_GRID === "1";
    case 'pagination':
      return Boolean(featureFlags.pagination);
    case 'COMMUNE_SECTION':
      return process.env.NEXT_PUBLIC_COMMUNE_SECTION === "1";
    case 'FOOTER_ENABLED':
      return process.env.NEXT_PUBLIC_FOOTER_ENABLED !== "0";
    case 'HEADER_ENABLED':
      // Por defecto deshabilitado (solo habilitar si explícitamente se configura como "1")
      return process.env.NEXT_PUBLIC_HEADER_ENABLED === "1";
    default:
      return false;
  }
}

// Función para aplicar override
export function applyOverride(override: FlagOverride): { success: boolean; message: string; expiresAt: string } {
  const { flag, value, duration } = override;
  
  // Validar flag soportado
  if (!['comingSoon', 'CARD_V2', 'VIRTUAL_GRID', 'pagination', 'COMMUNE_SECTION', 'FOOTER_ENABLED', 'HEADER_ENABLED'].includes(flag)) {
    throw new Error(`Flag no soportado: ${flag}`);
  }
  
  // Calcular tiempo de expiración
  const expiresAt = Date.now() + (duration * 1000);
  
  // Aplicar override
  overrideStore.set(flag, { value, expiresAt });
  
  return {
    success: true,
    message: `Flag ${flag} overrideado a ${value} por ${duration} segundos`,
    expiresAt: new Date(expiresAt).toISOString()
  };
}

// Función para obtener estado de todos los flags
export function getFlagsStatus(): Record<SupportedFlag, { value: boolean; overridden: boolean; expiresAt?: string }> {
  const status: Record<SupportedFlag, { value: boolean; overridden: boolean; expiresAt?: string }> = {
    comingSoon: {
      value: getFlagValue('comingSoon'),
      overridden: false
    },
    CARD_V2: {
      value: getFlagValue('CARD_V2'),
      overridden: false
    },
    VIRTUAL_GRID: {
      value: getFlagValue('VIRTUAL_GRID'),
      overridden: false
    },
    pagination: {
      value: getFlagValue('pagination'),
      overridden: false
    },
    FOOTER_ENABLED: {
      value: getFlagValue('FOOTER_ENABLED'),
      overridden: false
    },
    COMMUNE_SECTION: {
      value: getFlagValue('COMMUNE_SECTION'),
      overridden: false
    },
    HEADER_ENABLED: {
      value: getFlagValue('HEADER_ENABLED'),
      overridden: false
    }
  };
  
  // Marcar flags con override activo
  for (const [flag, override] of overrideStore.entries()) {
    if (Date.now() < override.expiresAt) {
      status[flag as SupportedFlag] = {
        value: override.value,
        overridden: true,
        expiresAt: new Date(override.expiresAt).toISOString()
      };
    }
  }
  
  return status;
}

// Función para limpiar overrides expirados
export function cleanupExpiredOverrides(): void {
  const now = Date.now();
  for (const [flag, override] of overrideStore.entries()) {
    if (now >= override.expiresAt) {
      overrideStore.delete(flag);
    }
  }
}

// Función para limpiar TODOS los overrides (útil para tests)
export function clearAllOverrides(): void {
  overrideStore.clear();
}

// Exportar flags individuales (mantener compatibilidad)
export const COMING_SOON = getFlagValue('comingSoon');
export const CARD_V2 = getFlagValue('CARD_V2');
export const VIRTUAL_GRID = getFlagValue('VIRTUAL_GRID');
export const PAGINATION = getFlagValue('pagination');

// Limpiar overrides expirados al importar el módulo
cleanupExpiredOverrides();
