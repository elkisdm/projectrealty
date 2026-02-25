import { z } from "zod";

/**
 * Schema para formulario de arrendar (step-by-step)
 * 10 pasos según PRD v1.0
 */
export const TreeRentRequestSchema = z.object({
  // Step 1: Comuna
  comuna: z.string().min(1, "La comuna es requerida").max(100),
  
  // Step 2: Presupuesto
  presupuesto: z.enum(["<350k", "350-450", "450-600", "600-800", "800+", "flexible"], {
    errorMap: () => ({ message: "Selecciona un rango de presupuesto" })
  }),
  
  // Step 3: Fecha mudanza
  fechaMudanza: z.enum(["0-15", "15-30", "30-60", "60+", "solo-cotizando"], {
    errorMap: () => ({ message: "Selecciona un rango de fecha" })
  }),
  
  // Step 4: Mascotas
  tieneMascotas: z.enum(["si", "no"], {
    errorMap: () => ({ message: "Indica si tienes mascotas" })
  }),
  
  // Step 5: Dormitorios
  dormitorios: z.enum(["estudio", "1d", "2d", "3d+"], {
    errorMap: () => ({ message: "Selecciona número de dormitorios" })
  }),
  
  // Step 6: Estacionamiento
  estacionamiento: z.enum(["si", "no", "me-da-igual"], {
    errorMap: () => ({ message: "Indica tu preferencia de estacionamiento" })
  }),
  
  // Step 7: Bodega
  bodega: z.enum(["si", "no", "me-da-igual"], {
    errorMap: () => ({ message: "Indica tu preferencia de bodega" })
  }),
  
  // Step 8: Contacto
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100),
  whatsapp: z.string().min(8, "El WhatsApp debe tener al menos 8 caracteres").max(32),
  email: z.string().email("Ingresa un email válido").optional(),
  
  // Step 9: Consentimiento
  consent: z.boolean().refine((val) => val === true, {
    message: "Debes aceptar el tratamiento de datos"
  }),
});

/**
 * Schema para formulario de comprar (form largo tipo inversión)
 * 9 campos según PRD v1.0
 */
export const TreeBuyRequestSchema = z.object({
  // Campos básicos
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100),
  whatsapp: z.string().min(8, "El WhatsApp debe tener al menos 8 caracteres").max(32),
  email: z.string().email("Ingresa un email válido"),
  
  // Campos financieros
  rentaMensual: z.enum(["<1.0M", "1.0-1.5M", "1.5-2.5M", "2.5-4M", "4M+"], {
    errorMap: () => ({ message: "Selecciona tu renta mensual promedio" })
  }),
  
  complementarRenta: z.enum(["si-aval-pareja", "si-otros-ingresos", "no"], {
    errorMap: () => ({ message: "Indica si puedes complementar renta" })
  }),
  
  situacionFinanciera: z.enum(["sin-deudas", "deudas-manejables", "alto-endeudamiento", "no-estoy-seguro"], {
    errorMap: () => ({ message: "Selecciona tu situación financiera" })
  }),
  
  capacidadAhorro: z.enum(["<200k", "200-500k", "500-1M", "1M+"], {
    errorMap: () => ({ message: "Selecciona tu capacidad de ahorro mensual" })
  }),
  
  preferenciaContacto: z.enum(["whatsapp", "llamada", "correo"], {
    errorMap: () => ({ message: "Selecciona cómo prefieres que te contactemos" })
  }),
  
  // Consentimiento
  consent: z.boolean().refine((val) => val === true, {
    message: "Debes aceptar el tratamiento de datos"
  }),
  
  // Turnstile token (opcional en MVP)
  turnstileToken: z.string().optional(),
});

/**
 * Schema para request completo con UTMs y referrer
 */
export const TreeLeadRequestSchema = z.object({
  flow: z.enum(["rent", "buy"]),
  payload: z.record(z.unknown()), // JSONB con respuestas del formulario
  name: z.string().min(1),
  whatsapp: z.string().min(8),
  email: z.string().email().optional(),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  utm_content: z.string().optional(),
  utm_term: z.string().optional(),
  referrer: z.string().optional(),
});

export type TreeRentRequest = z.infer<typeof TreeRentRequestSchema>;
export type TreeBuyRequest = z.infer<typeof TreeBuyRequestSchema>;
export type TreeLeadRequest = z.infer<typeof TreeLeadRequestSchema>;
