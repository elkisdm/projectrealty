import { z } from "zod";

export const InvestmentRequestSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100, "El nombre no puede exceder 100 caracteres"),
  email: z.string().email("Ingresa un email válido"),
  phone: z.string().min(8, "El teléfono debe tener al menos 8 caracteres").max(32, "El teléfono no puede exceder 32 caracteres"),
  message: z.string().max(500, "El mensaje no puede exceder 500 caracteres").optional(),
  source: z.string().max(50).optional(),
});

export type InvestmentRequest = z.infer<typeof InvestmentRequestSchema>;
