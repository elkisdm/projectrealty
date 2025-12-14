"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllBuildings } from "@lib/data";
import type { Unit, Building } from "@types";
import { logger } from "@lib/logger";

/**
 * Tipo para unidad con su edificio asociado
 */
export interface UnitWithBuilding {
  unit: Unit;
  building: Building;
}

/**
 * Parámetros de búsqueda
 */
export interface SearchResultsParams {
  q?: string; // Búsqueda por texto
  comuna?: string;
  precioMin?: number;
  precioMax?: number;
  dormitorios?: string; // "Estudio", "1", "2", "3"
  sort?: string; // "default", "precio-asc", "precio-desc", etc.
  page?: number;
  limit?: number;
}

/**
 * Resultado de la búsqueda
 */
export interface SearchResultsResponse {
  units: UnitWithBuilding[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Convierte número de dormitorios a formato de tipología
 */
function dormitoriosToTipologia(dormitorios: string): string[] {
  switch (dormitorios) {
    case 'Estudio':
      return ['Studio'];
    case '1':
      return ['1D1B'];
    case '2':
      return ['2D1B', '2D2B'];
    case '3':
      return ['3D2B'];
    default:
      return [];
  }
}

/**
 * Filtra unidades según los parámetros de búsqueda
 */
function filterUnits(
  allUnits: UnitWithBuilding[],
  params: SearchResultsParams
): UnitWithBuilding[] {
  let filtered = allUnits;

  // Filtro por comuna
  if (params.comuna && params.comuna !== "Todas") {
    filtered = filtered.filter(
      (item) => item.building.comuna.toLowerCase() === params.comuna!.toLowerCase()
    );
  }

  // Filtro por precio
  if (params.precioMin !== undefined) {
    filtered = filtered.filter((item) => item.unit.price >= params.precioMin!);
  }
  if (params.precioMax !== undefined) {
    filtered = filtered.filter((item) => item.unit.price <= params.precioMax!);
  }

  // Filtro por dormitorios
  if (params.dormitorios) {
    const tipologias = dormitoriosToTipologia(params.dormitorios);
    filtered = filtered.filter((item) => {
      // Verificar por tipología
      if (tipologias.includes(item.unit.tipologia)) {
        return true;
      }
      // También verificar por bedrooms si está disponible
      if (item.unit.bedrooms !== undefined && params.dormitorios) {
        const dormitoriosNum = params.dormitorios === 'Estudio' ? 0 : parseInt(params.dormitorios, 10);
        return item.unit.bedrooms === dormitoriosNum;
      }
      return false;
    });
  }

  // Búsqueda por texto (q)
  if (params.q && params.q.trim() !== "") {
    const searchTerm = params.q.toLowerCase().trim();
    filtered = filtered.filter((item) => {
      const buildingName = item.building.name.toLowerCase();
      const comuna = item.building.comuna.toLowerCase();
      const address = item.building.address?.toLowerCase() || "";
      const tipologia = item.unit.tipologia.toLowerCase();
      const codigoUnidad = item.unit.codigoUnidad?.toLowerCase() || "";
      
      return (
        buildingName.includes(searchTerm) ||
        comuna.includes(searchTerm) ||
        address.includes(searchTerm) ||
        tipologia.includes(searchTerm) ||
        codigoUnidad.includes(searchTerm)
      );
    });
  }

  // Ordenamiento
  if (params.sort && params.sort !== "default") {
    switch (params.sort) {
      case "precio-asc":
        filtered = filtered.sort((a, b) => a.unit.price - b.unit.price);
        break;
      case "precio-desc":
        filtered = filtered.sort((a, b) => b.unit.price - a.unit.price);
        break;
      case "comuna-asc":
        filtered = filtered.sort((a, b) =>
          a.building.comuna.localeCompare(b.building.comuna)
        );
        break;
      default:
        // Mantener orden por defecto
        break;
    }
  }

  return filtered;
}

/**
 * Hook para obtener resultados de búsqueda (unidades)
 */
export function useSearchResults(params: SearchResultsParams) {
  const limit = params.limit || 12;
  const page = params.page || 1;

  const queryKey = useMemo(() => {
    const key = ["search-results"];
    if (params.q) key.push("q", params.q);
    if (params.comuna) key.push("comuna", params.comuna);
    if (params.precioMin) key.push("precioMin", params.precioMin.toString());
    if (params.precioMax) key.push("precioMax", params.precioMax.toString());
    if (params.dormitorios) key.push("dormitorios", params.dormitorios);
    if (params.sort) key.push("sort", params.sort);
    if (page > 1) key.push("page", page.toString());
    if (limit !== 12) key.push("limit", limit.toString());
    return key;
  }, [params.q, params.comuna, params.precioMin, params.precioMax, params.dormitorios, params.sort, page, limit]);

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey,
    queryFn: async (): Promise<SearchResultsResponse> => {
      try {
        // Obtener todos los edificios
        const allBuildings = await getAllBuildings();

        // Flatten: convertir buildings con units a array de unidades con building
        const allUnits: UnitWithBuilding[] = [];
        
        for (const building of allBuildings) {
          // Solo procesar edificios con unidades disponibles
          const availableUnits = building.units.filter((u) => u.disponible);
          
          for (const unit of availableUnits) {
            allUnits.push({
              unit,
              building,
            });
          }
        }

        // Aplicar filtros
        const filteredUnits = filterUnits(allUnits, params);

        // Paginación
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedUnits = filteredUnits.slice(startIndex, endIndex);
        const totalPages = Math.ceil(filteredUnits.length / limit);

        return {
          units: paginatedUnits,
          total: filteredUnits.length,
          page,
          limit,
          totalPages,
        };
      } catch (err) {
        logger.error("Error fetching search results", { error: err, params });
        throw err;
      }
    },
    staleTime: 60 * 1000, // 1 minuto
    gcTime: 5 * 60 * 1000, // 5 minutos
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


