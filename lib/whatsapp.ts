export function buildWaLink({ phone, url, presetMessage }: { phone?: string; url?: string; presetMessage?: string }): string | null {
  // Prioridad 1: Si NEXT_PUBLIC_WA_URL existe → devolverla tal cual
  if (process.env.NEXT_PUBLIC_WA_URL) {
    return process.env.NEXT_PUBLIC_WA_URL;
  }

  // Prioridad 2: Si WA_PHONE_E164 existe → construir https://wa.me/<E164>?text=<urlencoded(WA_MESSAGE||'Hola')>
  const phoneE164 = phone || process.env.WA_PHONE_E164;
  if (phoneE164) {
    const message = presetMessage || process.env.WA_MESSAGE || 'Hola';
    const fullMessage = url ? `${message} ${url}`.trim() : message;
    return `https://wa.me/${phoneE164}?text=${encodeURIComponent(fullMessage)}`;
  }

  // Prioridad 3: Si no hay datos → devolver null
  return null;
}

export function buildWhatsAppUrl(opts?: { 
  phoneE164?: string; 
  message?: string; 
  url?: string 
}): string | null {
  // Prioridad 1: Si NEXT_PUBLIC_WA_URL existe → devolverla tal cual
  if (process.env.NEXT_PUBLIC_WA_URL) {
    return process.env.NEXT_PUBLIC_WA_URL;
  }

  // Prioridad 2: Si WA_PHONE_E164 existe → construir https://wa.me/<E164>?text=<urlencoded(WA_MESSAGE||'Hola')>
  const phoneE164 = opts?.phoneE164 || process.env.WA_PHONE_E164;
  if (phoneE164) {
    const message = opts?.message || process.env.WA_MESSAGE || 'Hola';
    const url = opts?.url || '';
    const fullMessage = url ? `${message} ${url}`.trim() : message;
    return `https://wa.me/${phoneE164}?text=${encodeURIComponent(fullMessage)}`;
  }

  // Prioridad 3: Si no hay datos → devolver null
  return null;
}

/**
 * Construye URL de WhatsApp con mensaje personalizado para property page
 * @param unit - Unidad de la propiedad
 * @param building - Edificio de la propiedad
 * @param propertyUrl - URL opcional de la página de la propiedad
 * @returns URL de WhatsApp o null si no está configurado
 */
export function buildPropertyWhatsAppUrl(
  unit: { tipologia: string; price: number },
  building: { name: string; comuna: string },
  propertyUrl?: string
): string | null {
  // Prioridad 1: Si NEXT_PUBLIC_WA_URL existe → devolverla tal cual
  if (process.env.NEXT_PUBLIC_WA_URL) {
    return process.env.NEXT_PUBLIC_WA_URL;
  }

  // Prioridad 2: Construir mensaje personalizado con datos de la propiedad
  const phoneE164 = process.env.WA_PHONE_E164;
  if (!phoneE164) {
    return null;
  }

  // Construir mensaje personalizado
  const tipologia = unit.tipologia === 'Studio' ? 'Estudio' : unit.tipologia;
  const precioFormateado = unit.price.toLocaleString('es-CL');
  const mensajeBase = `Hola, estoy interesado en arrendar ${tipologia} en ${building.name}, ${building.comuna}. Precio: $${precioFormateado}/mes. ¿Tienen disponibilidad?`;
  
  // Agregar URL si está disponible
  const mensaje = propertyUrl ? `${mensajeBase}\n\n${propertyUrl}` : mensajeBase;

  return `https://wa.me/${phoneE164}?text=${encodeURIComponent(mensaje)}`;
}


