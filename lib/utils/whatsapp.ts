/**
 * Normaliza número de WhatsApp a formato CL (+56 9 XXXXXXXX)
 * Acepta varios formatos de entrada y los normaliza
 */
export function normalizeWhatsApp(phone: string): string {
  // Remover espacios, guiones, paréntesis
  const cleaned = phone.replace(/[\s\-\(\)]/g, "");
  
  // Si empieza con +56, mantenerlo
  if (cleaned.startsWith("+56")) {
    return cleaned;
  }
  
  // Si empieza con 56 (sin +), agregar +
  if (cleaned.startsWith("56")) {
    return `+${cleaned}`;
  }
  
  // Si empieza con 9 (formato local), agregar +56
  if (cleaned.startsWith("9") && cleaned.length === 9) {
    return `+56${cleaned}`;
  }
  
  // Si tiene 8 dígitos (formato local sin 9), agregar +569
  if (/^\d{8}$/.test(cleaned)) {
    return `+569${cleaned}`;
  }
  
  // Si tiene 9 dígitos y no empieza con 9, asumir que falta el 9
  if (/^\d{9}$/.test(cleaned) && !cleaned.startsWith("9")) {
    return `+569${cleaned}`;
  }
  
  // Devolver tal cual si no coincide con ningún patrón (será validado por Zod)
  return phone;
}

/**
 * Valida formato básico de WhatsApp CL
 */
export function isValidWhatsAppCL(phone: string): boolean {
  const normalized = normalizeWhatsApp(phone);
  // Formato esperado: +56 9 XXXXXXXX (con o sin espacios)
  return /^\+569\d{8}$/.test(normalized.replace(/\s/g, ""));
}
