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
 * Valida RUT chileno (formato 7-8 dígitos + guión + dígito verificador 0-9 o K)
 * Incluye validación del dígito verificador (módulo 11)
 */
export function isValidChileanRut(rut: string): boolean {
  const trimmed = rut.trim();
  if (!trimmed) return false;
  // Aceptar con o sin puntos; si no hay guión, último carácter = DV (ej. 123456789 → 12345678-9)
  let normalized = trimmed.replace(/\./g, "");
  if (/^[0-9]{7,8}[0-9kK]{1}$/.test(normalized) && !normalized.includes("-")) {
    normalized = normalized.slice(0, -1) + "-" + normalized.slice(-1);
  }
  if (!/^[0-9]{7,8}-[0-9kK]{1}$/.test(normalized)) return false;

  const rutClean = normalized.replace("-", "");
  const dv = rutClean.slice(-1).toUpperCase();
  const rutNumber = parseInt(rutClean.slice(0, -1), 10);

  if (Number.isNaN(rutNumber)) return false;

  let sum = 0;
  let multiplier = 2;
  const digitsReversed = rutNumber.toString().split("").reverse();

  for (let idx = 0; idx < digitsReversed.length; idx++) {
    sum += Number(digitsReversed[idx]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const expectedDv = 11 - (sum % 11);
  const calculatedDv = expectedDv === 11 ? "0" : expectedDv === 10 ? "K" : expectedDv.toString();

  return dv.toUpperCase() === calculatedDv;
}

/**
 * Valida si un teléfono tiene formato chileno válido
 * Acepta múltiples formatos antes de normalización
 */
export function isValidChileanPhone(phone: string): boolean {
  const trimmed = phone.trim();
  if (!trimmed) return false;
  const cleaned = trimmed.replace(/[\s\-().]/g, "");
  // Móvil Chile: 9 dígitos empezando con 9, o con prefijo +56/56
  if (cleaned.match(/^9\d{8}$/)) return true;
  if (cleaned.match(/^569\d{8}$/)) return true;
  if (cleaned.match(/^\+569\d{8}$/)) return true;
  return false;
}

// Schema de validación para el formulario de visitas
export const visitFormSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .trim(),
  
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
    .trim()
    .min(1, "El teléfono es requerido")
    .refine(
      (val) => isValidChileanPhone(val),
      {
        message: "Formato chileno: 9 XXXX XXXX o +56 9 XXXX XXXX"
      }
    )
    .transform((val) => normalizeChileanPhone(val)),

  rut: z
    .string()
    .trim()
    .min(1, "El RUT es requerido")
    .refine(
      (val) => isValidChileanRut(val),
      { message: "RUT inválido (ej: 12.345.678-9 o 12345678-9)" }
    ),
});

// Tipo para el formulario
export type VisitFormData = z.infer<typeof visitFormSchema>;

// Tipo para el input del formulario (antes de normalización)
export type VisitFormInput = {
  name: string;
  email?: string;
  phone: string;
  rut: string;
};





