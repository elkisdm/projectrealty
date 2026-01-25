import { z } from "zod";

/**
 * Schema de validación para el formulario de búsqueda
 * Nuevos campos Hero Cocktail: intent, moveIn, beds, priceMax, petFriendly, parking, storage
 * Campos legacy mantenidos para compatibilidad: dormitorios, precioMax, mascotas, estacionamiento, bodega
 * 
 * Nota: El formulario trabaja con strings, pero transformamos a numbers al validar
 */
// Schema de input (lo que viene del formulario - strings)
export const searchFormInputSchema = z.object({
  q: z.string().max(100, "La búsqueda no puede tener más de 100 caracteres").optional(),
  comuna: z.string().optional(),
  precioMin: z.string().optional(),
  
  // New fields for Hero Cocktail
  intent: z.enum(["rent", "buy", "invest"]).default("rent"),
  moveIn: z.enum(["now", "30d", "60d"]).optional(),
  beds: z.enum(["studio", "1", "2", "3plus"]).optional(),
  priceMax: z.string().optional(),
  petFriendly: z.enum(["true", "false"]).optional(),
  parking: z.enum(["true", "false"]).optional(),
  storage: z.enum(["true", "false"]).optional(),
  
  // Legacy fields (kept for backwards compatibility)
  precioMax: z.string().optional(),
  dormitorios: z.enum(["Estudio", "1", "2", "3"], {
    errorMap: () => ({ message: "Selecciona una opción válida" }),
  }).optional(),
  estacionamiento: z.enum(["true", "false"]).optional(),
  bodega: z.enum(["true", "false"]).optional(),
  mascotas: z.enum(["true", "false"]).optional(),
});

// Schema de validación (transforma strings a numbers y booleans)
export const searchFormSchema = searchFormInputSchema
  .transform((data) => ({
    q: data.q?.trim() || undefined,
    comuna: data.comuna || undefined,
    precioMin: data.precioMin && data.precioMin.trim() !== "" 
      ? (() => {
          const num = Number(data.precioMin);
          return isNaN(num) ? undefined : num;
        })()
      : undefined,
    
    // New fields (intent defaults to "rent")
    intent: data.intent || "rent",
    moveIn: data.moveIn,
    beds: data.beds,
    priceMax: data.priceMax && data.priceMax.trim() !== ""
      ? (() => {
          const num = Number(data.priceMax);
          return isNaN(num) ? undefined : num;
        })()
      : undefined,
    petFriendly: data.petFriendly === "true" ? true : data.petFriendly === "false" ? false : undefined,
    parking: data.parking === "true" ? true : data.parking === "false" ? false : undefined,
    storage: data.storage === "true" ? true : data.storage === "false" ? false : undefined,
    
    // Legacy fields (kept for backwards compatibility)
    precioMax: data.precioMax && data.precioMax.trim() !== ""
      ? (() => {
          const num = Number(data.precioMax);
          return isNaN(num) ? undefined : num;
        })()
      : undefined,
    dormitorios: data.dormitorios,
    estacionamiento: data.estacionamiento === "true" ? true : data.estacionamiento === "false" ? false : undefined,
    bodega: data.bodega === "true" ? true : data.bodega === "false" ? false : undefined,
    mascotas: data.mascotas === "true" ? true : data.mascotas === "false" ? false : undefined,
  }))
  .pipe(
    z.object({
      q: z.string().max(100).optional(),
      comuna: z.string().optional(),
      precioMin: z.number().min(0, "El precio mínimo debe ser mayor o igual a 0").optional(),
      
      // New fields (intent is required after transformation)
      intent: z.enum(["rent", "buy", "invest"]),
      moveIn: z.enum(["now", "30d", "60d"]).optional(),
      beds: z.enum(["studio", "1", "2", "3plus"]).optional(),
      priceMax: z.number().min(0, "El precio máximo debe ser mayor o igual a 0").optional(),
      petFriendly: z.boolean().optional(),
      parking: z.boolean().optional(),
      storage: z.boolean().optional(),
      
      // Legacy fields
      precioMax: z.number().min(0, "El precio máximo debe ser mayor o igual a 0").optional(),
      dormitorios: z.enum(["Estudio", "1", "2", "3"]).optional(),
      estacionamiento: z.boolean().optional(),
      bodega: z.boolean().optional(),
      mascotas: z.boolean().optional(),
    })
  )
  .refine(
    (data) => {
      // Validar que priceMax/precioMax >= precioMin si están presentes
      const maxPrice = data.priceMax || data.precioMax;
      if (data.precioMin !== undefined && maxPrice !== undefined) {
        return maxPrice >= data.precioMin;
      }
      return true;
    },
    {
      message: "El precio máximo debe ser mayor o igual al precio mínimo",
      path: ["priceMax"],
    }
  );

// Tipo para el formulario (con strings para precioMin/precioMax)
export type SearchFormInput = z.infer<typeof searchFormInputSchema>;

// Tipo para los datos validados (con numbers para precioMin/precioMax)
export type SearchFormData = z.infer<typeof searchFormSchema>;





