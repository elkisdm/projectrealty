// schemas/quotation.ts
import { z } from "zod";

export const QuotationInputSchema = z.object({
  unitId: z.string().min(1, "unitId requerido"),
  startDate: z.string().refine(s => !isNaN(Date.parse(s)), "Fecha inválida"),
  options: z.object({
    parkingSelected: z.boolean().default(false),
    storageSelected: z.boolean().default(false),
    parkingPrice: z.number().int().nonnegative().optional(),
    storagePrice: z.number().int().nonnegative().optional(),
    creditReportFee: z.number().int().nonnegative().default(6000),
  }).optional().default({
    parkingSelected: false,
    storageSelected: false,
    creditReportFee: 6000,
  }),
});

export type QuotationInput = z.infer<typeof QuotationInputSchema>;

export const QuotationResultSchema = z.object({
  meta: z.object({
    unitId: z.string(),
    buildingId: z.string(),
    startDate: z.string(),
    daysCharged: z.number().int().positive(),
    daysInMonth: z.number().int().positive(),
    prorationFactor: z.number().min(0).max(1),
    currency: z.literal("CLP"),
  }),
  lines: z.object({
    baseMonthly: z.number().int(),
    proratedRent: z.number().int(),
    discountPromo: z.number().int(),
    netRent: z.number().int(),
    gcMonthly: z.number().int(),
    gcProrated: z.number().int(),
    guaranteeTotal: z.number().int(),
    guaranteeEntry: z.number().int(),
    guaranteeInstallments: z.number().int(),
    guaranteeMonths: z.number().int(),
    commission: z.number().int(),
    creditReportFee: z.number().int(),
  }),
  totals: z.object({
    firstPayment: z.number().int(),
  }),
  flags: z.object({
    hasFreeCommission: z.boolean(),
    discountPercent: z.number().int().min(0).max(100),
  })
});

export type QuotationResult = z.infer<typeof QuotationResultSchema>;
