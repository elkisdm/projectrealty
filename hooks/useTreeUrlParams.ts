"use client";

import { useSearchParams } from "next/navigation";
import { z } from "zod";

const treeParamsSchema = z.object({
  highlight: z.enum(["rent", "buy", "rent-property", "sell-property"]).optional(),
  color: z.enum(["violet", "aqua", "amber", "purple"]).optional(),
  name: z.string().max(50).optional(),
});

export type TreeUrlParams = z.infer<typeof treeParamsSchema>;

export function useTreeUrlParams(): TreeUrlParams {
  const searchParams = useSearchParams();

  const highlight = searchParams.get("highlight");
  const color = searchParams.get("color");
  const name = searchParams.get("name");

  try {
    const parsed = treeParamsSchema.parse({
      highlight: highlight || undefined,
      color: color || undefined,
      name: name || undefined,
    });
    return parsed;
  } catch (error) {
    // Si hay error de validación, retornar valores por defecto
    console.warn("Invalid URL params:", error);
    return {};
  }
}
