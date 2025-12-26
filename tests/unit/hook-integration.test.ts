import { useBuildingsStore } from '../../lib/stores/buildingsStore';
import { Building } from '../../types';

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

describe('Hook Integration Test', () => {
  beforeEach(() => {
    useBuildingsStore.getState().reset();
  });

  it('should integrate store with filtering logic', () => {
    const store = useBuildingsStore.getState();
    
    // Set buildings
    store.setBuildings([mockBuilding]);
    
    // Set filters
    store.setFilters({ comuna: 'Las Condes' });
    
    // Verify state
    const state = useBuildingsStore.getState();
    expect(state.buildings).toEqual([mockBuilding]);
    expect(state.filters.comuna).toBe('Las Condes');
    expect(state.filteredBuildings).toEqual([mockBuilding]);
  });

  it('should integrate store with sorting logic', () => {
    const store = useBuildingsStore.getState();
    
    // Set buildings
    store.setBuildings([mockBuilding]);
    
    // Set sort
    store.setSort('price-desc');
    
    // Verify state
    const state = useBuildingsStore.getState();
    expect(state.buildings).toEqual([mockBuilding]);
    expect(state.sort).toBe('price-desc');
  });

  it('should handle loading and error states', () => {
    const store = useBuildingsStore.getState();
    
    // Set loading
    store.setLoading(true);
    let state = useBuildingsStore.getState();
    expect(state.loading).toBe(true);
    
    // Set error
    store.setError('Test error');
    state = useBuildingsStore.getState();
    expect(state.error).toBe('Test error');
    
    // Clear error
    store.setError(null);
    state = useBuildingsStore.getState();
    expect(state.error).toBeNull();
    
    // Clear loading
    store.setLoading(false);
    state = useBuildingsStore.getState();
    expect(state.loading).toBe(false);
  });

  it('should clear filters correctly', () => {
    const store = useBuildingsStore.getState();
    
    // Set filters
    store.setFilters({ comuna: 'Las Condes', minPrice: 400000 });
    
    // Verify filters are set
    let state = useBuildingsStore.getState();
    expect(state.filters.comuna).toBe('Las Condes');
    expect(state.filters.minPrice).toBe(400000);
    
    // Clear filters
    store.clearFilters();
    
    // Verify filters are cleared
    state = useBuildingsStore.getState();
    expect(state.filters).toEqual({});
  });

  it('should reset store completely', () => {
    const store = useBuildingsStore.getState();
    
    // Modify state
    store.setBuildings([mockBuilding]);
    store.setLoading(true);
    store.setError('Test error');
    store.setFilters({ comuna: 'Las Condes' });
    store.setSort('price-desc');
    
    // Reset
    store.reset();
    
    // Verify everything is reset
    const state = useBuildingsStore.getState();
    expect(state.buildings).toEqual([]);
    expect(state.filteredBuildings).toEqual([]);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.filters).toEqual({});
    expect(state.sort).toBe('price-asc');
  });
});
