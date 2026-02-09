"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Unit, Building } from "@types";
import { logger } from "@lib/logger";
import { deduplicateUnitsByTipology } from "@lib/utils/unit-deduplication";
import { buildSearchParams } from "@/lib/search/query-params";

export interface UnitWithBuilding {
  unit: Unit;
  building: Building;
}

export interface SearchResultsParams {
  q?: string;
  comuna?: string | string[];
  operation?: "rent";
  precioMin?: number;
  precioMax?: number;
  dormitoriosMin?: number;
  tipos?: string | string[];
  dormitorios?: string | string[];
  estacionamiento?: boolean;
  bodega?: boolean;
  mascotas?: boolean;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface SearchResultsResponse {
  units: UnitWithBuilding[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function normalizeForQueryKey(value: string | string[] | undefined): string | undefined {
  if (!value) return undefined;
  if (Array.isArray(value)) return [...value].sort().join(",");
  return value;
}

function isUnitWithBuilding(value: unknown): value is Unit & { building: Building } {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return typeof record.id === "string" && !!record.building && typeof record.building === "object";
}

export function useSearchResults(params: SearchResultsParams) {
  const limit = params.limit || 12;
  const page = params.page || 1;

  const queryKey = useMemo(() => {
    return [
      "search-results",
      params.q || "",
      normalizeForQueryKey(params.comuna) || "",
      params.operation || "",
      params.precioMin ?? "",
      params.precioMax ?? "",
      params.dormitoriosMin ?? "",
      normalizeForQueryKey(params.tipos) || "",
      normalizeForQueryKey(params.dormitorios) || "",
      params.estacionamiento ?? "",
      params.bodega ?? "",
      params.mascotas ?? "",
      params.sort || "default",
      page,
      limit,
    ];
  }, [
    params.q,
    params.comuna,
    params.operation,
    params.precioMin,
    params.precioMax,
    params.dormitoriosMin,
    params.tipos,
    params.dormitorios,
    params.estacionamiento,
    params.bodega,
    params.mascotas,
    params.sort,
    page,
    limit,
  ]);

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey,
    queryFn: async (): Promise<SearchResultsResponse> => {
      try {
        const queryParams = buildSearchParams({
          q: params.q,
          comuna: params.comuna,
          operation: params.operation,
          precioMin: params.precioMin,
          precioMax: params.precioMax,
          dormitoriosMin: params.dormitoriosMin,
          tipos: params.tipos,
          estacionamiento: params.estacionamiento,
          bodega: params.bodega,
          mascotas: params.mascotas,
        });

        if (params.dormitorios) {
          if (Array.isArray(params.dormitorios)) {
            queryParams.set("dormitorios", params.dormitorios.join(","));
          } else {
            queryParams.set("dormitorios", params.dormitorios);
          }
        }

        if (params.sort) queryParams.set("sort", params.sort);
        queryParams.set("page", String(page));
        queryParams.set("limit", String(limit));

        const response = await fetch(`/api/buildings?${queryParams.toString()}`);
        const responseText = await response.text();

        if (!response.ok) {
          let errorMessage = `Error fetching search results: ${response.status} ${response.statusText}`;
          try {
            const errorData = JSON.parse(responseText);
            if (errorData?.error) {
              errorMessage = `${errorMessage} - ${errorData.error}`;
              if (errorData.details) {
                errorMessage = `${errorMessage} - ${JSON.stringify(errorData.details)}`;
              }
            }
          } catch {
            errorMessage = `${errorMessage} - ${responseText}`;
          }
          throw new Error(errorMessage);
        }

        const apiData = JSON.parse(responseText);
        if (!apiData || typeof apiData !== "object") {
          throw new Error("Respuesta inválida de la API: datos no válidos");
        }
        if (!Array.isArray(apiData.units)) {
          logger.error("Respuesta de API sin units array:", { data: apiData });
          throw new Error("Respuesta inválida de la API: units no es un array");
        }

        const mappedUnits: UnitWithBuilding[] = (apiData.units as unknown[])
          .filter((item): item is Unit & { building: Building } => {
            if (!isUnitWithBuilding(item)) {
              const maybeId =
                item && typeof item === "object" && "id" in item
                  ? (item as { id?: unknown }).id
                  : undefined;
              logger.warn("Unidad sin building válido:", { unitId: maybeId });
              return false;
            }
            return true;
          })
          .map((item) => ({ unit: item, building: item.building }));

        const units = deduplicateUnitsByTipology(mappedUnits);
        const total = typeof apiData.total === "number" ? apiData.total : units.length;
        const totalPages = Math.ceil(total / limit);

        try {
          const comunaForLog = Array.isArray(params.comuna)
            ? params.comuna.join(",")
            : params.comuna;
          const tiposForLog = Array.isArray(params.tipos)
            ? params.tipos.join(",")
            : params.tipos;

          fetch("/api/search-logs", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              query_text: params.q,
              filters: {
                comuna: comunaForLog,
                dormitoriosMin: params.dormitoriosMin,
                tipos: tiposForLog,
                precioMin: params.precioMin,
                precioMax: params.precioMax,
                estacionamiento: params.estacionamiento,
                bodega: params.bodega,
                mascotas: params.mascotas,
              },
              results_count: total,
            }),
          }).catch((err) => {
            logger.warn("Error registrando search log:", err);
          });
        } catch (err) {
          logger.warn("Error registrando search log:", err);
        }

        return {
          units,
          total,
          page: typeof apiData.page === "number" ? apiData.page : page,
          limit: typeof apiData.limit === "number" ? apiData.limit : limit,
          totalPages,
        };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        const hasParams = Object.values(params).some(
          (value) => value !== undefined && value !== null && value !== ""
        );
        const isCriticalError =
          errorMessage.includes("400") ||
          errorMessage.includes("500") ||
          errorMessage.includes("429");

        if (hasParams || isCriticalError) {
          logger.error("Error fetching search results", errorMessage);
          if (isCriticalError) {
            logger.error("Search params:", params);
          }
        }

        throw err instanceof Error
          ? err
          : new Error(`Error fetching search results: ${errorMessage}`);
      }
    },
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  return {
    data,
    units: data?.units || [],
    total: data?.total || 0,
    page: data?.page || page,
    limit: data?.limit || limit,
    totalPages: data?.totalPages || 0,
    isLoading,
    isFetching,
    error,
  };
}
