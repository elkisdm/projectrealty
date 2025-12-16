import { useQuery } from "@tanstack/react-query";
import type { FilterValues } from "../components/filters/FilterBar";
import type { TypologySummary, PromotionBadge } from "../schemas/models";

export type PriceRange = { min: number; max: number };

export type BuildingSummary = {
  id: string;
  slug: string;
  name: string;
  comuna: string;
  address: string;
  gallery: string[];
  coverImage?: string;
  badges?: PromotionBadge[];
  serviceLevel?: "pro" | "standard";
  precioDesde: number; // computed, always present in list
  precioRango?: PriceRange;
  hasAvailability: boolean;
  typologySummary?: TypologySummary[]; // compact summary for list
};

interface PaginationInfo {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  count: number;
}

interface BuildingsResponse { 
  buildings: BuildingSummary[];
  pagination?: PaginationInfo;
  meta?: {
    searchTerm: string | null;
    filtersApplied: boolean;
  };
}

interface FetchBuildingsParams {
  filters: FilterValues;
  sort?: string;
  search?: string;
  page?: number;
  limit?: number;
}

const createQueryKey = (filters: FilterValues, sort?: string, search?: string, page?: number, limit?: number) => {
  const key = ["buildings"];
  
  // Only add non-default filter values to the key
  if (filters.comuna && filters.comuna !== "Todas") {
    key.push("comuna", filters.comuna);
  }
  if (filters.tipologia && filters.tipologia !== "Todas") {
    key.push("tipologia", filters.tipologia);
  }
  if (filters.minPrice) {
    key.push("minPrice", filters.minPrice.toString());
  }
  if (filters.maxPrice) {
    key.push("maxPrice", filters.maxPrice.toString());
  }
  if (search && search.trim() !== "") {
    key.push("search", search.trim());
  }
  if (sort && sort !== "default") {
    key.push("sort", sort);
  }
  if (page && page > 1) {
    key.push("page", page.toString());
  }
  if (limit && limit !== 12) {
    key.push("limit", limit.toString());
  }
  
  return key;
};

const fetchBuildings = async ({ filters, sort, search, page = 1, limit = 12 }: FetchBuildingsParams): Promise<BuildingsResponse> => {
  const params = new URLSearchParams();
  
  // Only add non-default filter values to the URL
  if (filters.comuna && filters.comuna !== "Todas") {
    params.append("comuna", filters.comuna);
  }
  if (filters.tipologia && filters.tipologia !== "Todas") {
    params.append("tipologia", filters.tipologia);
  }
  if (filters.minPrice) {
    params.append("minPrice", filters.minPrice.toString());
  }
  if (filters.maxPrice) {
    params.append("maxPrice", filters.maxPrice.toString());
  }

  // Add search parameter
  if (search && search.trim() !== "") {
    params.append("search", search.trim());
  }

  // Add sort parameter
  if (sort && sort !== "default") {
    params.append("sort", sort);
  }

  // Add pagination parameters
  params.append("page", page.toString());
  params.append("limit", limit.toString());
  
  const url = `/api/buildings${params.toString() ? `?${params.toString()}` : ""}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  
  const data: BuildingsResponse = await response.json();
  return data;
};

export function useFetchBuildings({ filters, sort, search, page, limit }: FetchBuildingsParams) {
  return useQuery({
    queryKey: createQueryKey(filters, sort, search, page, limit),
    queryFn: () => fetchBuildings({ filters, sort, search, page, limit }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount: number, error: Error) => {
      // Don't retry on 4xx errors
      if (error instanceof Error && error.message.includes("Error 4")) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

export type { FilterValues };
