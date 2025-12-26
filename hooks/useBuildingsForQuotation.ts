import { useQuery } from "@tanstack/react-query";
import { readAll } from "@lib/data";
import type { Building } from "@schemas/models";

/**
 * Hook específico para el cotizador que obtiene edificios completos con unidades
 * A diferencia de useFetchBuildings, este devuelve Building[] completos, no BuildingSummary[]
 */
export function useBuildingsForQuotation() {
  return useQuery({
    queryKey: ['buildings-for-quotation'],
    queryFn: async (): Promise<Building[]> => {
      return readAll();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
}
