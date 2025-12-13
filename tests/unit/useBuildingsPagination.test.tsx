import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useBuildingsPagination, useBuildingsInfinite } from '../../hooks/useBuildingsPagination';
import { useBuildingsStore } from '../../lib/stores/buildingsStore';

// Mock fetch
global.fetch = jest.fn();

// Mock store
jest.mock('../../lib/stores/buildingsStore');
const mockUseBuildingsStore = useBuildingsStore as jest.MockedFunction<typeof useBuildingsStore>;

// Test wrapper with QueryClient
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

describe('useBuildingsPagination', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock store actions
    mockUseBuildingsStore.mockReturnValue({
      setLoading: jest.fn(),
      setError: jest.fn(),
      syncFromReactQuery: jest.fn(),
      setPage: jest.fn(),
      setFilters: jest.fn(),
      setTotalPages: jest.fn(),
      setTotalCount: jest.fn(),
      addInfinitePage: jest.fn(),
      clearInfinitePages: jest.fn(),
      setUseReactQuery: jest.fn(),
      setQueryKey: jest.fn(),
      reset: jest.fn(),
      // State
      buildings: [],
      filteredBuildings: [],
      loading: false,
      error: null,
      filters: {},
      sort: 'price-asc',
      page: 1,
      pageSize: 12,
      totalPages: 1,
      totalCount: 0,
      paginationMode: 'traditional',
      infinitePages: [],
      useReactQuery: true,
      queryKey: null,
    });
  });

  it('should fetch paginated buildings successfully', async () => {
    const mockResponse = {
      buildings: [
        {
          id: '1',
          slug: 'test-building',
          name: 'Test Building',
          comuna: 'Test Comuna',
          address: 'Test Address',
          gallery: [],
          coverImage: 'test.jpg',
          badges: [],
          serviceLevel: 'standard',
          precioDesde: 1000000,
          hasAvailability: true,
        },
      ],
      pagination: {
        currentPage: 1,
        totalPages: 5,
        totalCount: 50,
        hasNextPage: true,
        hasPrevPage: false,
        limit: 12,
      },
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(
      () => useBuildingsPagination({ filters: {}, page: 1, limit: 12 }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.buildings).toHaveLength(1);
    expect(result.current.pagination).toEqual(mockResponse.pagination);
    expect(result.current.isError).toBe(false);
  });

  it('should handle API errors gracefully', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: async () => ({ error: 'Server error' }),
    });

    const { result } = renderHook(
      () => useBuildingsPagination({ filters: {}, page: 1, limit: 12 }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.buildings).toHaveLength(0);
  });

  it('should apply filters correctly', async () => {
    const mockResponse = {
      buildings: [],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        hasNextPage: false,
        hasPrevPage: false,
        limit: 12,
      },
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const filters = {
      comuna: 'Test Comuna',
      minPrice: 1000000,
      maxPrice: 2000000,
    };

    renderHook(
      () => useBuildingsPagination({ filters, page: 1, limit: 12 }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('comuna=Test+Comuna&minPrice=1000000&maxPrice=2000000')
      );
    });
  });

  it('should navigate between pages', async () => {
    const mockResponse = {
      buildings: [],
      pagination: {
        currentPage: 2,
        totalPages: 5,
        totalCount: 50,
        hasNextPage: true,
        hasPrevPage: true,
        limit: 12,
      },
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(
      () => useBuildingsPagination({ filters: {}, page: 2, limit: 12 }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.pagination?.currentPage).toBe(2);
    expect(result.current.pagination?.hasNextPage).toBe(true);
    expect(result.current.pagination?.hasPrevPage).toBe(true);
  });
});

describe('useBuildingsInfinite', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock store actions
    mockUseBuildingsStore.mockReturnValue({
      setLoading: jest.fn(),
      setError: jest.fn(),
      syncFromReactQuery: jest.fn(),
      setPage: jest.fn(),
      setFilters: jest.fn(),
      setTotalPages: jest.fn(),
      setTotalCount: jest.fn(),
      addInfinitePage: jest.fn(),
      clearInfinitePages: jest.fn(),
      setUseReactQuery: jest.fn(),
      setQueryKey: jest.fn(),
      reset: jest.fn(),
      // State
      buildings: [],
      filteredBuildings: [],
      loading: false,
      error: null,
      filters: {},
      sort: 'price-asc',
      page: 1,
      pageSize: 12,
      totalPages: 1,
      totalCount: 0,
      paginationMode: 'infinite',
      infinitePages: [],
      useReactQuery: true,
      queryKey: null,
    });
  });

  it('should load initial page for infinite scroll', async () => {
    const mockResponse = {
      buildings: [
        {
          id: '1',
          slug: 'test-building',
          name: 'Test Building',
          comuna: 'Test Comuna',
          address: 'Test Address',
          gallery: [],
          coverImage: 'test.jpg',
          badges: [],
          serviceLevel: 'standard',
          precioDesde: 1000000,
          hasAvailability: true,
        },
      ],
      pagination: {
        currentPage: 1,
        totalPages: 5,
        totalCount: 50,
        hasNextPage: true,
        hasPrevPage: false,
        limit: 12,
      },
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(
      () => useBuildingsInfinite({ filters: {}, limit: 12 }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.buildings).toHaveLength(1);
    expect(result.current.pagination?.currentPage).toBe(1);
    expect(result.current.hasNextPage).toBe(true);
  });

  it('should load next page when fetchNextPage is called', async () => {
    const mockResponse1 = {
      buildings: [{ id: '1', name: 'Building 1' }],
      pagination: {
        currentPage: 1,
        totalPages: 3,
        totalCount: 30,
        hasNextPage: true,
        hasPrevPage: false,
        limit: 12,
      },
    };

    const mockResponse2 = {
      buildings: [{ id: '2', name: 'Building 2' }],
      pagination: {
        currentPage: 2,
        totalPages: 3,
        totalCount: 30,
        hasNextPage: true,
        hasPrevPage: true,
        limit: 12,
      },
    };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse1,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse2,
      });

    const { result } = renderHook(
      () => useBuildingsInfinite({ filters: {}, limit: 12 }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Load next page
    result.current.fetchNextPage();

    await waitFor(() => {
      expect(result.current.buildings).toHaveLength(2);
    });

    expect(result.current.buildings[0].id).toBe('1');
    expect(result.current.buildings[1].id).toBe('2');
  });

  it('should handle infinite scroll errors', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
      json: async () => ({ error: 'Rate limit exceeded' }),
    });

    const { result } = renderHook(
      () => useBuildingsInfinite({ filters: {}, limit: 12 }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.buildings).toHaveLength(0);
  });
});

describe('Integration with Zustand Store', () => {
  it('should sync data with Zustand store when useStore is true', async () => {
    const mockSyncFromReactQuery = jest.fn();
    const mockSetLoading = jest.fn();
    const mockSetError = jest.fn();

    mockUseBuildingsStore.mockReturnValue({
      setLoading: mockSetLoading,
      setError: mockSetError,
      syncFromReactQuery: mockSyncFromReactQuery,
      setPage: jest.fn(),
      setFilters: jest.fn(),
      setTotalPages: jest.fn(),
      setTotalCount: jest.fn(),
      addInfinitePage: jest.fn(),
      clearInfinitePages: jest.fn(),
      setUseReactQuery: jest.fn(),
      setQueryKey: jest.fn(),
      reset: jest.fn(),
      // State
      buildings: [],
      filteredBuildings: [],
      loading: false,
      error: null,
      filters: {},
      sort: 'price-asc',
      page: 1,
      pageSize: 12,
      totalPages: 1,
      totalCount: 0,
      paginationMode: 'traditional',
      infinitePages: [],
      useReactQuery: true,
      queryKey: null,
    });

    const mockResponse = {
      buildings: [{ id: '1', name: 'Test Building' }],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalCount: 1,
        hasNextPage: false,
        hasPrevPage: false,
        limit: 12,
      },
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    renderHook(
      () => useBuildingsPagination({ filters: {}, page: 1, limit: 12, useStore: true }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(mockSyncFromReactQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          buildings: expect.arrayContaining([
            expect.objectContaining({
              id: '1',
              name: 'Test Building'
            })
          ]),
          pagination: expect.objectContaining({
            currentPage: 1,
            totalPages: 1,
            totalCount: 1,
            hasNextPage: false,
            hasPrevPage: false,
            limit: 12
          })
        })
      );
    });
  });
});
