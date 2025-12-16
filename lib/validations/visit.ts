import { z } from "zod";

/**
 * Schema de validación para el formulario de agendamiento de visitas
 * Según especificación:
 * - Nombre: requerido, mínimo 2 caracteres
 * - Email: opcional, formato válido si se proporciona
 * - Teléfono: requerido, formato chileno (+56 9 XXXX XXXX)
 * - Normalización automática de teléfono
 */

/**
 * Normaliza un número de teléfono chileno a formato estándar: +56 9 XXXX XXXX
 * Acepta múltiples formatos:
 * - +56912345678
 * - 912345678
 * - 9 1234 5678
 * - +56 9 1234 5678
 * - etc.
 */
export function normalizeChileanPhone(phone: string): string {
  // Remover todos los espacios, guiones, paréntesis y puntos
  let cleaned = phone.replace(/[\s\-().]/g, '');
  
  // Si empieza con +56, mantenerlo
  if (cleaned.startsWith('+56')) {
    cleaned = cleaned.substring(3); // Remover +56
  }
  
  // Si empieza con 56 (sin +), removerlo
  if (cleaned.startsWith('56') && cleaned.length > 9) {
    cleaned = cleaned.substring(2);
  }
  
  // Si empieza con 9, mantenerlo (formato móvil chileno)
  if (cleaned.startsWith('9')) {
    // Formatear como +56 9 XXXX XXXX
    const number = cleaned.substring(1); // Remover el 9 inicial
    if (number.length === 8) {
      return `+56 9 ${number.substring(0, 4)} ${number.substring(4)}`;
    }
  }
  
  // Si tiene 9 dígitos y empieza con 9, formatear
  if (cleaned.length === 9 && cleaned.startsWith('9')) {
    const number = cleaned.substring(1);
    return `+56 9 ${number.substring(0, 4)} ${number.substring(4)}`;
  }
  
  // Si ya está en formato correcto, retornar
  if (cleaned.match(/^\+569\d{8}$/)) {
    const number = cleaned.substring(4); // Remover +569
    return `+56 9 ${number.substring(0, 4)} ${number.substring(4)}`;
  }
  
  // Si no se puede normalizar, retornar el original (será validado por Zod)
  return phone;
}

/**
 * Valida si un teléfono tiene formato chileno válido
 * Acepta múltiples formatos antes de normalización
 */
export function isValidChileanPhone(phone: string): boolean {
  // Remover espacios y caracteres especiales para validar
  const cleaned = phone.replace(/[\s\-().]/g, '');
  
  // Formato: +569XXXXXXXX (11 dígitos con +569)
  if (cleaned.match(/^\+569\d{8}$/)) return true;
  
  // Formato: 569XXXXXXXX (10 dígitos con 569)
  if (cleaned.match(/^569\d{8}$/)) return true;
  
  // Formato: 9XXXXXXXX (9 dígitos empezando con 9)
  if (cleaned.match(/^9\d{8}$/)) return true;
  
  // Formato: +56 9 XXXX XXXX (con espacios)
  if (cleaned.match(/^\+569\d{8}$/)) return true;
  
  return false;
}

// Función para normalizar nombre (trim y capitalización inicial)
function normalizeName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return trimmed;
  
  // Capitalizar primera letra de cada palabra
  return trimmed
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// Schema de validación para el formulario de visitas
export const visitFormSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .trim()
    .transform((val) => normalizeName(val)), // Normalizar nombre
  
  email: z
    .string()
    .optional()
    .refine(
      (val) => !val || val === "" || z.string().email().safeParse(val).success,
      {
        message: "El email debe tener un formato válido"
      }
    ),
  
  phone: z
    .string()
    .min(1, "El teléfono es requerido")
    .refine(
      (val) => isValidChileanPhone(val),
      {
        message: "El teléfono debe tener un formato chileno válido (+56 9 XXXX XXXX, 9XXXXXXXX, etc.)"
      }
    )
    .transform((val) => normalizeChileanPhone(val)), // Normalizar automáticamente
});

// Tipo para el formulario
export type VisitFormData = z.infer<typeof visitFormSchema>;

// Tipo para el input del formulario (antes de normalización)
export type VisitFormInput = {
  name: string;
  email?: string;
  phone: string;
};



