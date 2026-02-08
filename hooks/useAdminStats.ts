import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@lib/react-query";

interface DashboardStats {
  totalBuildings: number;
  totalUnits: number;
  availableUnits: number;
  occupiedUnits: number;
  buildingsWithIncompleteData: number;
  distributionByComuna: Array<{
    comuna: string;
    count: number;
  }>;
  typologyDistribution: Array<{
    tipologia: string;
    count: number;
  }>;
  priceRange: {
    min: number;
    max: number;
    average: number;
  };
}

interface AdminStatsResponse {
  success: boolean;
  data: {
    stats: DashboardStats;
    timestamp: string;
  } | null;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  } | null;
}

async function fetchAdminStats(): Promise<DashboardStats> {
  const response = await fetch("/api/admin/stats");
  
  if (!response.ok) {
    let errorMessage = "Error al cargar estadísticas";
    try {
      const errorData = await response.json() as { error?: string; message?: string };
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      // Si no se puede parsear el error, usar el mensaje por defecto
    }
    throw new Error(errorMessage);
  }

  const data = (await response.json()) as AdminStatsResponse;
  
  if (!data.success || !data.data?.stats) {
    throw new Error(data.error?.message || "Respuesta inválida del servidor");
  }

  return data.data.stats;
}

export function useAdminStats() {
  return useQuery({
    queryKey: queryKeys.admin.stats(),
    queryFn: fetchAdminStats,
    staleTime: 60 * 1000, // 1 minuto - stats cambian poco frecuentemente
    gcTime: 5 * 60 * 1000, // 5 minutos en cache
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
