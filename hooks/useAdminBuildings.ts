import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys, invalidateQueries } from "@lib/react-query";
import type { Building } from "@schemas/models";

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface AdminBuildingsResponse {
  success: boolean;
  data: Building[];
  pagination: PaginationInfo;
}

interface FetchBuildingsParams {
  page: number;
  limit: number;
  search?: string;
  comuna?: string;
}

async function fetchAdminBuildings({
  page,
  limit,
  search,
  comuna,
}: FetchBuildingsParams): Promise<AdminBuildingsResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...(search && { search }),
    ...(comuna && { comuna: String(comuna) }),
  });

  const response = await fetch(`/api/admin/buildings?${params}`);
  const data = (await response.json()) as AdminBuildingsResponse;

  if (!response.ok) {
    throw new Error(data.success === false ? "Error al cargar edificios" : "Error desconocido");
  }

  return data;
}

export function useAdminBuildings(params: FetchBuildingsParams) {
  return useQuery({
    queryKey: queryKeys.admin.buildings(params.page, params.limit, params.search, params.comuna),
    queryFn: () => fetchAdminBuildings(params),
    staleTime: 30 * 1000, // 30 segundos
    gcTime: 5 * 60 * 1000, // 5 minutos
  });
}

interface CreateBuildingParams {
  building: Building;
}

interface UpdateBuildingParams {
  id: string;
  building: Building;
}

export function useCreateBuilding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ building }: CreateBuildingParams) => {
      const response = await fetch("/api/admin/buildings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(building),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al crear edificio");
      }

      return data.data as Building;
    },
    onMutate: async ({ building }) => {
      // Cancelar queries en curso
      await queryClient.cancelQueries({
        queryKey: [...queryKeys.admin.all, "buildings"],
      });

      // Snapshot del valor anterior
      const previousData = queryClient.getQueriesData({
        queryKey: [...queryKeys.admin.all, "buildings"],
      });

      // Optimistic update
      queryClient.setQueriesData(
        { queryKey: [...queryKeys.admin.all, "buildings"] },
        (old: AdminBuildingsResponse | undefined) => {
          if (!old) return old;
          return {
            ...old,
            data: [building, ...old.data],
            pagination: {
              ...old.pagination,
              total: old.pagination.total + 1,
            },
          };
        }
      );

      return { previousData };
    },
    onError: (err, _, context) => {
      // Revertir en caso de error
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error(err instanceof Error ? err.message : "Error al crear edificio");
    },
    onSuccess: () => {
      toast.success("Edificio creado correctamente");
      invalidateQueries.admin.all(queryClient);
    },
  });
}

export function useUpdateBuilding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, building }: UpdateBuildingParams) => {
      const response = await fetch(`/api/admin/buildings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(building),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al actualizar edificio");
      }

      return data.data as Building;
    },
    onMutate: async ({ id, building }) => {
      await queryClient.cancelQueries({
        queryKey: [...queryKeys.admin.all, "buildings"],
      });

      const previousData = queryClient.getQueriesData({
        queryKey: [...queryKeys.admin.all, "buildings"],
      });

      // Optimistic update
      queryClient.setQueriesData(
        { queryKey: [...queryKeys.admin.all, "buildings"] },
        (old: AdminBuildingsResponse | undefined) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((b) => (b.id === id ? building : b)),
          };
        }
      );

      return { previousData };
    },
    onError: (err, _, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error(err instanceof Error ? err.message : "Error al actualizar edificio");
    },
    onSuccess: () => {
      toast.success("Edificio actualizado correctamente");
      invalidateQueries.admin.all(queryClient);
    },
  });
}

export function useDeleteBuilding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/buildings/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Error al eliminar edificio");
      }
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({
        queryKey: [...queryKeys.admin.all, "buildings"],
      });

      const previousData = queryClient.getQueriesData({
        queryKey: [...queryKeys.admin.all, "buildings"],
      });

      // Optimistic update - remover del cache
      queryClient.setQueriesData(
        { queryKey: [...queryKeys.admin.all, "buildings"] },
        (old: AdminBuildingsResponse | undefined) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.filter((b) => b.id !== id),
            pagination: {
              ...old.pagination,
              total: Math.max(0, old.pagination.total - 1),
            },
          };
        }
      );

      return { previousData, deletedId: id };
    },
    onError: (err, id, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error(err instanceof Error ? err.message : "Error al eliminar edificio");
    },
    onSuccess: () => {
      toast.success("Edificio eliminado correctamente");
      invalidateQueries.admin.all(queryClient);
    },
  });
}

