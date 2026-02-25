'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  ContractHistoryFilters,
  ContractHistoryItem,
  ContractHistoryResponse,
} from '@/types/contracts';

interface UseContractHistoryOptions {
  enabled?: boolean;
  initialLimit?: number;
}

interface HistoryPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function useContractHistory(options: UseContractHistoryOptions = {}) {
  const { enabled = true, initialLimit = 20 } = options;

  const [filters, setFilters] = useState<ContractHistoryFilters>({});
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(initialLimit);
  const [contracts, setContracts] = useState<ContractHistoryItem[]>([]);
  const [pagination, setPagination] = useState<HistoryPagination>({
    page: 1,
    limit: initialLimit,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const queryString = useMemo(() => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });

    if (filters.templateId) params.set('templateId', filters.templateId);
    if (filters.status) params.set('status', filters.status);
    if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.set('dateTo', filters.dateTo);

    return params.toString();
  }, [filters, limit, page]);

  const loadHistory = useCallback(async () => {
    if (!enabled) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/contracts?${queryString}`, {
        credentials: 'include',
      });
      const data = (await response.json()) as ContractHistoryResponse & {
        code?: string;
        message?: string;
      };

      if (!response.ok) {
        setError(data.message ?? 'No se pudo cargar el historial');
        setContracts([]);
        return;
      }

      setContracts(data.contracts ?? []);
      setPagination(data.pagination ?? { page, limit, total: 0, totalPages: 1 });
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Error al cargar historial');
      setContracts([]);
    } finally {
      setLoading(false);
    }
  }, [enabled, limit, page, queryString]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  const updateFilters = useCallback((next: ContractHistoryFilters) => {
    setFilters(next);
    setPage(1);
  }, []);

  const downloadContract = useCallback(async (contractId: string): Promise<string | null> => {
    try {
      setIsDownloading(true);
      const response = await fetch(`/api/contracts/${contractId}?download=1`, {
        credentials: 'include',
      });
      const data = (await response.json()) as { pdfUrl?: string; message?: string };
      if (!response.ok || !data.pdfUrl) {
        setError(data.message ?? 'No se pudo obtener URL de descarga');
        return null;
      }
      return data.pdfUrl;
    } catch (downloadError) {
      setError(downloadError instanceof Error ? downloadError.message : 'No se pudo descargar contrato');
      return null;
    } finally {
      setIsDownloading(false);
    }
  }, []);

  return {
    contracts,
    pagination,
    filters,
    page,
    limit,
    loading,
    error,
    isDownloading,
    setPage,
    setLimit,
    setFilters: updateFilters,
    reload: loadHistory,
    downloadContract,
  };
}
