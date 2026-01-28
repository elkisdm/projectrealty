/**
 * Utilidades para persistencia de formularios Tree en localStorage
 * Con TTL, versionado y recuperación mejorada
 */

const STORAGE_PREFIX = "tree_form_";
const TTL_DAYS = 7;
const VERSION = "1.0";

interface PersistedFormData {
  flow: string;
  data: Record<string, unknown>;
  currentStep?: number;
  timestamp: number;
  version: string;
}

/**
 * Obtiene la clave de storage para un flow específico
 */
function getStorageKey(flow: string): string {
  return `${STORAGE_PREFIX}${flow}`;
}

/**
 * Verifica si los datos guardados están expirados
 */
function isExpired(timestamp: number): boolean {
  const now = Date.now();
  const ttlMs = TTL_DAYS * 24 * 60 * 60 * 1000;
  return now - timestamp > ttlMs;
}

/**
 * Guarda datos del formulario en localStorage
 */
export function saveFormData(
  flow: string,
  data: Record<string, unknown>,
  currentStep?: number
): void {
  if (typeof window === "undefined") return;

  try {
    const persisted: PersistedFormData = {
      flow,
      data,
      currentStep,
      timestamp: Date.now(),
      version: VERSION,
    };

    localStorage.setItem(getStorageKey(flow), JSON.stringify(persisted));
  } catch (error) {
    // Silenciar errores de localStorage (puede estar lleno o deshabilitado)
    console.warn("Error guardando datos del formulario:", error);
  }
}

/**
 * Recupera datos del formulario desde localStorage
 */
export function loadFormData(flow: string): {
  data: Record<string, unknown>;
  currentStep?: number;
} | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(getStorageKey(flow));
    if (!stored) return null;

    const persisted: PersistedFormData = JSON.parse(stored);

    // Verificar versión
    if (persisted.version !== VERSION) {
      // Versión incompatible, limpiar
      localStorage.removeItem(getStorageKey(flow));
      return null;
    }

    // Verificar expiración
    if (isExpired(persisted.timestamp)) {
      localStorage.removeItem(getStorageKey(flow));
      return null;
    }

    return {
      data: persisted.data || {},
      currentStep: persisted.currentStep,
    };
  } catch (error) {
    // Datos corruptos, limpiar
    console.warn("Error recuperando datos del formulario:", error);
    try {
      localStorage.removeItem(getStorageKey(flow));
    } catch {
      // Ignorar errores al limpiar
    }
    return null;
  }
}

/**
 * Elimina datos guardados de un flow específico
 */
export function clearFormData(flow: string): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(getStorageKey(flow));
  } catch (error) {
    console.warn("Error limpiando datos del formulario:", error);
  }
}

/**
 * Limpia todos los datos de formularios Tree expirados
 */
export function cleanupExpiredForms(): void {
  if (typeof window === "undefined") return;

  try {
    const keys = Object.keys(localStorage);
    const now = Date.now();
    const ttlMs = TTL_DAYS * 24 * 60 * 60 * 1000;

    keys.forEach((key) => {
      if (key.startsWith(STORAGE_PREFIX)) {
        try {
          const stored = localStorage.getItem(key);
          if (stored) {
            const persisted: PersistedFormData = JSON.parse(stored);
            if (isExpired(persisted.timestamp)) {
              localStorage.removeItem(key);
            }
          }
        } catch {
          // Datos corruptos, eliminar
          localStorage.removeItem(key);
        }
      }
    });
  } catch (error) {
    console.warn("Error limpiando formularios expirados:", error);
  }
}

// Importar useEffect para el hook
import { useEffect } from "react";

/**
 * Hook para persistencia de formularios Tree
 */
export function useFormPersistence(
  flow: string,
  formData: Record<string, unknown>,
  currentStep?: number
) {
  // Guardar automáticamente cuando cambian los datos
  useEffect(() => {
    if (Object.keys(formData).length > 0) {
      saveFormData(flow, formData, currentStep);
    }
  }, [flow, formData, currentStep]);

  // Limpiar datos expirados al montar
  useEffect(() => {
    cleanupExpiredForms();
  }, []);

  return {
    loadData: () => loadFormData(flow),
    clearData: () => clearFormData(flow),
    hasSavedData: () => {
      const saved = loadFormData(flow);
      return saved !== null;
    },
  };
}
