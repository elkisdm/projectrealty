"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllBuildings } from "@lib/data";
import type { Unit, Building } from "@types";
import { logger } from "@lib/logger";
import { deduplicateUnitsByTipology } from "@lib/utils/unit-deduplication";

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
  comuna?: string | string[]; // Soporta multiselección
  precioMin?: number;
  precioMax?: number;
  dormitorios?: string | string[]; // "Estudio", "1", "2", "3" - soporta multiselección
  estacionamiento?: boolean;
  bodega?: boolean;
  mascotas?: boolean;
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

  // Filtro por comuna (soporta multiselección)
  if (params.comuna) {
    const comunasArray = Array.isArray(params.comuna) 
      ? params.comuna 
      : params.comuna !== "Todas" 
        ? [params.comuna] 
        : [];
    
    if (comunasArray.length > 0) {
      filtered = filtered.filter((item) =>
        comunasArray.some(c => 
          item.building.comuna.toLowerCase() === c.toLowerCase()
        )
      );
    }
  }

  // Filtro por precio
  if (params.precioMin !== undefined) {
    filtered = filtered.filter((item) => item.unit.price >= params.precioMin!);
  }
  if (params.precioMax !== undefined) {
    filtered = filtered.filter((item) => item.unit.price <= params.precioMax!);
  }

  // Filtro por dormitorios (soporta multiselección)
  if (params.dormitorios) {
    const dormitoriosArray = Array.isArray(params.dormitorios)
      ? params.dormitorios
      : [params.dormitorios];
    
    if (dormitoriosArray.length > 0) {
      // Convertir todos los dormitorios seleccionados a tipologías
      const allTipologias = dormitoriosArray.flatMap(d => dormitoriosToTipologia(d));
      
      filtered = filtered.filter((item) => {
        // Verificar por tipología
        if (allTipologias.includes(item.unit.tipologia)) {
          return true;
        }
        // También verificar por bedrooms si está disponible
        if (item.unit.bedrooms !== undefined) {
          return dormitoriosArray.some(d => {
            const dormitoriosNum = d === 'Estudio' ? 0 : parseInt(d, 10);
            return item.unit.bedrooms === dormitoriosNum;
          });
        }
        return false;
      });
    }
  }

  // Filtro por estacionamiento
  if (params.estacionamiento !== undefined) {
    filtered = filtered.filter((item) => {
      // Si el edificio es tipo MF, siempre mostrar (son opcionales)
      if (item.building.gc_mode === 'MF') {
        return true;
      }
      // Para otros tipos, filtrar por el valor del campo
      // Si el campo no está definido, asumir false
      const hasEstacionamiento = item.unit.estacionamiento ?? false;
      return hasEstacionamiento === params.estacionamiento;
    });
  }

  // Filtro por bodega
  if (params.bodega !== undefined) {
    filtered = filtered.filter((item) => {
      // Si el edificio es tipo MF, siempre mostrar (son opcionales)
      if (item.building.gc_mode === 'MF') {
        return true;
      }
      // Para otros tipos, filtrar por el valor del campo
      // Si el campo no está definido, asumir false
      const hasBodega = item.unit.bodega ?? false;
      return hasBodega === params.bodega;
    });
  }

  // Filtro por mascotas
  if (params.mascotas !== undefined) {
    filtered = filtered.filter((item) => {
      const petFriendly = item.unit.pet_friendly ?? item.unit.petFriendly ?? false;
      return petFriendly === params.mascotas;
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
    
    // Comuna (soporta array)
    if (params.comuna) {
      if (Array.isArray(params.comuna)) {
        key.push("comuna", params.comuna.sort().join(','));
      } else {
        key.push("comuna", params.comuna);
      }
    }
    
    if (params.precioMin) key.push("precioMin", params.precioMin.toString());
    if (params.precioMax) key.push("precioMax", params.precioMax.toString());
    
    // Dormitorios (soporta array)
    if (params.dormitorios) {
      if (Array.isArray(params.dormitorios)) {
        key.push("dormitorios", params.dormitorios.sort().join(','));
      } else {
        key.push("dormitorios", params.dormitorios);
      }
    }
    
    if (params.estacionamiento !== undefined) key.push("estacionamiento", params.estacionamiento.toString());
    if (params.bodega !== undefined) key.push("bodega", params.bodega.toString());
    if (params.mascotas !== undefined) key.push("mascotas", params.mascotas.toString());
    if (params.sort) key.push("sort", params.sort);
    if (page > 1) key.push("page", page.toString());
    if (limit !== 12) key.push("limit", limit.toString());
    return key;
  }, [params.q, params.comuna, params.precioMin, params.precioMax, params.dormitorios, params.estacionamiento, params.bodega, params.mascotas, params.sort, page, limit]);

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey,
    queryFn: async (): Promise<SearchResultsResponse> => {
      try {
        const queryParams = new URLSearchParams();
        if (params.q) queryParams.set("q", params.q);
        
        // Comuna (soporta array)
        if (params.comuna) {
          if (Array.isArray(params.comuna) && params.comuna.length > 0) {
            queryParams.set("comuna", params.comuna.join(','));
          } else if (typeof params.comuna === 'string' && params.comuna !== "Todas") {
            queryParams.set("comuna", params.comuna);
          }
        }
        
        if (params.precioMin) queryParams.set("precioMin", params.precioMin.toString());
        if (params.precioMax) queryParams.set("precioMax", params.precioMax.toString());
        
        // Dormitorios (soporta array)
        if (params.dormitorios) {
          if (Array.isArray(params.dormitorios) && params.dormitorios.length > 0) {
            queryParams.set("dormitorios", params.dormitorios.join(','));
          } else if (typeof params.dormitorios === 'string') {
            queryParams.set("dormitorios", params.dormitorios);
          }
        }
        
        if (params.estacionamiento !== undefined) queryParams.set("estacionamiento", params.estacionamiento.toString());
        if (params.bodega !== undefined) queryParams.set("bodega", params.bodega.toString());
        if (params.mascotas !== undefined) queryParams.set("mascotas", params.mascotas.toString());
        if (params.sort) queryParams.set("sort", params.sort);
        if (page) queryParams.set("page", page.toString());
        if (limit) queryParams.set("limit", limit.toString());

        const response = await fetch(`/api/buildings?${queryParams.toString()}`);
        
        // Leer el body una sola vez
        const responseText = await response.text();
        
        if (!response.ok) {
          let errorMessage = `Error fetching search results: ${response.status} ${response.statusText}`;
          try {
            const errorData = JSON.parse(responseText);
            if (errorData.error) {
              errorMessage = `${errorMessage} - ${errorData.error}`;
              if (errorData.details) {
                errorMessage = `${errorMessage} - ${JSON.stringify(errorData.details)}`;
              }
            } else {
              errorMessage = `${errorMessage} - ${JSON.stringify(errorData)}`;
            }
          } catch {
            // Si no se puede parsear como JSON, usar texto directamente
            errorMessage = `${errorMessage} - ${responseText}`;
          }
          throw new Error(errorMessage);
        }

        // Parsear la respuesta exitosa
        const data = JSON.parse(responseText);

        // Validar estructura de respuesta
        if (!data || typeof data !== 'object') {
          throw new Error('Respuesta inválida de la API: datos no válidos');
        }

        if (!Array.isArray(data.units)) {
          logger.error('Respuesta de API sin units array:', { data });
          throw new Error('Respuesta inválida de la API: units no es un array');
        }

        // Mapear la respuesta de la API (flat unit with building) a la estructura esperada por el hook (UnitWithBuilding)
        const mappedUnits: UnitWithBuilding[] = data.units
          .filter((item: any) => {
            // Filtrar unidades sin building válido
            if (!item || !item.building) {
              logger.warn('Unidad sin building válido:', { unitId: item?.id });
              return false;
            }
            return true;
          })
          .map((item: any) => ({
            unit: item,
            building: item.building
          }));

        // Deduplicar: solo 1 unidad por tipología por edificio
        const units = deduplicateUnitsByTipology(mappedUnits);

        const total = typeof data.total === 'number' ? data.total : units.length;
        const totalPages = Math.ceil(total / (limit || 12));

        // Registrar búsqueda en la BD (fire and forget, no bloquea)
        try {
          // Normalizar arrays a strings para el log
          const comunaForLog = Array.isArray(params.comuna) 
            ? params.comuna.join(',') 
            : params.comuna;
          const dormitoriosForLog = Array.isArray(params.dormitorios)
            ? params.dormitorios.join(',')
            : params.dormitorios;
            
          fetch('/api/search-logs', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              query_text: params.q,
              filters: {
                comuna: comunaForLog,
                dormitorios: dormitoriosForLog,
                precioMin: params.precioMin,
                precioMax: params.precioMax,
                estacionamiento: params.estacionamiento,
                bodega: params.bodega,
                mascotas: params.mascotas,
              },
              results_count: total,
            }),
          }).catch((err) => {
            // Silenciar errores de logging para no afectar UX
            logger.warn('Error registrando search log:', err);
          });
        } catch (err) {
          // Silenciar errores de logging
          logger.warn('Error registrando search log:', err);
        }

        return {
          units,
          total,
          page: typeof data.page === 'number' ? data.page : page,
          limit: typeof data.limit === 'number' ? data.limit : limit,
          totalPages,
        };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        const errorDetails = err instanceof Error ? { 
          message: err.message, 
          stack: err.stack,
          name: err.name 
        } : { error: String(err) };
        
        // Log con información estructurada
        logger.error("Error fetching search results", errorMessage);
        logger.error("Error details:", errorDetails);
        logger.error("Search params:", params);
        
        // Re-lanzar con mensaje más descriptivo
        const enhancedError = err instanceof Error 
          ? err 
          : new Error(`Error fetching search results: ${errorMessage}`);
        throw enhancedError;
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


