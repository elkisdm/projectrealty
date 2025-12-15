import { z } from "zod";

/**
 * Schema de validación para el formulario de búsqueda
 * Según especificación: solo q, comuna, precioMin, precioMax, dormitorios
 * NO incluye baños (removido según especificación)
 * 
 * Nota: El formulario trabaja con strings, pero transformamos a numbers al validar
 */
// Schema de input (lo que viene del formulario - strings)
export const searchFormInputSchema = z.object({
  q: z.string().max(100, "La búsqueda no puede tener más de 100 caracteres").optional(),
  comuna: z.string().optional(),
  precioMin: z.string().optional(),
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
      precioMax: z.number().min(0, "El precio máximo debe ser mayor o igual a 0").optional(),
      dormitorios: z.enum(["Estudio", "1", "2", "3"]).optional(),
      estacionamiento: z.boolean().optional(),
      bodega: z.boolean().optional(),
      mascotas: z.boolean().optional(),
    })
  )
  .refine(
    (data) => {
      // Validar que precioMax >= precioMin si ambos están presentes
      if (data.precioMin !== undefined && data.precioMax !== undefined) {
        return data.precioMax >= data.precioMin;
      }
      return true;
    },
    {
      message: "El precio máximo debe ser mayor o igual al precio mínimo",
      path: ["precioMax"],
    }
  );

// Tipo para el formulario (con strings para precioMin/precioMax)
export type SearchFormInput = z.infer<typeof searchFormInputSchema>;

// Tipo para los datos validados (con numbers para precioMin/precioMax)
export type SearchFormData = z.infer<typeof searchFormSchema>;



