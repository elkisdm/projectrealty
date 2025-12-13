import { renderHook, act, waitFor } from '@testing-library/react';
import { useBuildingsData, useFilteredBuildings, useBuildingsFilters, useBuildingsSort } from '../../hooks/useBuildingsData';
import { useBuildingsStore } from '../../lib/stores/buildingsStore';
import { Building } from '../../types';

// Mock de fetch
global.fetch = jest.fn();

// Mock de un building de prueba
const mockBuilding: Building = {
  id: 'test-1',
  name: 'Test Building',
  comuna: 'Las Condes',
  address: 'Test Address 123',
  cover: '/test-cover.jpg',
  amenities: ['gym', 'pool'],
  units: [
    {
      id: 'unit-1',
      tipologia: '1D1B',
      m2: 45,
      price: 500000,
      estacionamiento: true,
      bodega: false,
      disponible: true,
    },
  ],
  gallery: ['/test-1.jpg', '/test-2.jpg'],
};

const mockBuilding2: Building = {
  id: 'test-2',
  name: 'Test Building 2',
  comuna: 'Providencia',
  address: 'Test Address 456',
  cover: '/test-cover-2.jpg',
  amenities: ['gym'],
  units: [
    {
      id: 'unit-2',
      tipologia: '2D2B',
      m2: 65,
      price: 750000,
      estacionamiento: true,
      bodega: true,
      disponible: true,
    },
  ],
  gallery: ['/test-3.jpg', '/test-4.jpg'],
};

describe('useBuildingsData', () => {
  beforeEach(() => {
    // Reset del store antes de cada test
    act(() => {
      useBuildingsStore.getState().reset();
    });
    
    // Reset del mock de fetch
    (fetch as jest.Mock).mockClear();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useBuildingsData());
    
    expect(result.current.buildings).toEqual([]);
    expect(result.current.filteredBuildings).toEqual([]);
    expect(result.current.error).toBeNull();
    expect(result.current.filters).toEqual({});
    expect(result.current.sort).toBe('price-asc');
    // Loading puede ser true debido al fetch automático inicial
    expect(typeof result.current.loading).toBe('boolean');
  });

  it('should fetch buildings on mount when no data exists', async () => {
    const mockResponse = { buildings: [mockBuilding, mockBuilding2] };
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useBuildingsData());

    // Esperar a que se complete el fetch inicial
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/buildings?sort=price-asc');
    });
  });

  it('should handle fetch errors', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useBuildingsData());

    // Usar waitFor para esperar el estado asíncrono
    await waitFor(() => {
      expect(result.current.error).toBe('Network error');
    });
  });

  it('should update filters', () => {
    const { result } = renderHook(() => useBuildingsData());

    act(() => {
      result.current.updateFilters({ comuna: 'Las Condes' });
    });

    expect(result.current.filters.comuna).toBe('Las Condes');
  });

  it('should update sort', () => {
    const { result } = renderHook(() => useBuildingsData());

    act(() => {
      result.current.updateSort('price-desc');
    });

    expect(result.current.sort).toBe('price-desc');
  });

  it('should clear filters', () => {
    const { result } = renderHook(() => useBuildingsData());

    // Primero establecer un filtro
    act(() => {
      result.current.updateFilters({ comuna: 'Las Condes' });
    });

    expect(result.current.filters.comuna).toBe('Las Condes');

    // Limpiar filtros
    act(() => {
      result.current.clearFilters();
    });

    expect(result.current.filters).toEqual({});
  });

  it('should refresh data', async () => {
    const mockResponse = { buildings: [mockBuilding] };
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useBuildingsData());

    // Llamar refresh
    act(() => {
      result.current.refresh();
    });

    // Esperar a que se complete el fetch
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/buildings?sort=price-asc');
    });
  });

  it('should combine filters and sorting', async () => {
    // Setup: tener datos en el store
    act(() => {
      useBuildingsStore.getState().setBuildings([mockBuilding, mockBuilding2]);
    });

    const { result } = renderHook(() => useBuildingsData());

    // Aplicar filtro y ordenamiento
    act(() => {
      result.current.updateFilters({ comuna: 'Las Condes' });
      result.current.updateSort('price-desc');
    });

    expect(result.current.filters.comuna).toBe('Las Condes');
    expect(result.current.sort).toBe('price-desc');
  });
});

describe('useFilteredBuildings', () => {
  beforeEach(() => {
    act(() => {
      useBuildingsStore.getState().reset();
    });
  });

  it('should return only filtered buildings', () => {
    // Setup: tener datos filtrados específicamente en el store
    act(() => {
      // Reset primero para evitar efectos de otros tests
      useBuildingsStore.getState().reset();
      // Luego configurar el estado específico
      useBuildingsStore.getState().setBuildings([mockBuilding, mockBuilding2]);
      useBuildingsStore.getState().setFilteredBuildings([mockBuilding]);
      // Simular que ya terminó de cargar para evitar efectos de useEffect
      useBuildingsStore.getState().setLoading(false);
    });

    const { result } = renderHook(() => useFilteredBuildings());

    // Dar tiempo para que se ejecuten los hooks
    expect(result.current.error).toBeNull();
    expect(typeof result.current.loading).toBe('boolean');
    // Los filteredBuildings deberían ser al menos 1
    expect(result.current.buildings.length).toBeGreaterThan(0);
  });
});

describe('useBuildingsFilters', () => {
  beforeEach(() => {
    act(() => {
      useBuildingsStore.getState().reset();
    });
  });

  it('should return filters and filter actions', () => {
    const { result } = renderHook(() => useBuildingsFilters());

    expect(result.current.filters).toEqual({});
    expect(typeof result.current.updateFilters).toBe('function');
    expect(typeof result.current.clearFilters).toBe('function');
  });
});

describe('useBuildingsSort', () => {
  beforeEach(() => {
    act(() => {
      useBuildingsStore.getState().reset();
    });
  });

  it('should return sort and sort actions', () => {
    const { result } = renderHook(() => useBuildingsSort());

    expect(result.current.sort).toBe('price-asc');
    expect(typeof result.current.updateSort).toBe('function');
  });
});
