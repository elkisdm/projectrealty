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

describe('BuildingsStore', () => {
  beforeEach(() => {
    // Reset del store antes de cada test
    useBuildingsStore.getState().reset();
  });

  it('should initialize with default state', () => {
    const state = useBuildingsStore.getState();
    
    expect(state.buildings).toEqual([]);
    expect(state.filteredBuildings).toEqual([]);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.filters).toEqual({});
    expect(state.sort).toBe('price-asc');
  });

  it('should set buildings correctly', () => {
    const store = useBuildingsStore.getState();
    
    store.setBuildings([mockBuilding]);
    
    const newState = useBuildingsStore.getState();
    expect(newState.buildings).toEqual([mockBuilding]);
    expect(newState.filteredBuildings).toEqual([mockBuilding]);
  });

  it('should set loading state', () => {
    const store = useBuildingsStore.getState();
    
    store.setLoading(true);
    
    const newState = useBuildingsStore.getState();
    expect(newState.loading).toBe(true);
  });

  it('should set error state', () => {
    const store = useBuildingsStore.getState();
    
    store.setError('Test error');
    
    const newState = useBuildingsStore.getState();
    expect(newState.error).toBe('Test error');
  });

  it('should set filters correctly', () => {
    const store = useBuildingsStore.getState();
    
    store.setFilters({ comuna: 'Las Condes', minPrice: 400000 });
    
    const newState = useBuildingsStore.getState();
    expect(newState.filters).toEqual({
      comuna: 'Las Condes',
      minPrice: 400000,
    });
  });

  it('should clear filters', () => {
    const store = useBuildingsStore.getState();
    
    // Set filters first
    store.setFilters({ comuna: 'Las Condes' });
    
    let newState = useBuildingsStore.getState();
    expect(newState.filters).toEqual({ comuna: 'Las Condes' });
    
    // Clear filters
    store.clearFilters();
    
    newState = useBuildingsStore.getState();
    expect(newState.filters).toEqual({});
  });

  it('should set sort correctly', () => {
    const store = useBuildingsStore.getState();
    
    store.setSort('price-desc');
    
    const newState = useBuildingsStore.getState();
    expect(newState.sort).toBe('price-desc');
  });

  it('should reset to initial state', () => {
    const store = useBuildingsStore.getState();
    
    // Modify state
    store.setBuildings([mockBuilding]);
    store.setLoading(true);
    store.setError('Test error');
    store.setFilters({ comuna: 'Las Condes' });
    store.setSort('price-desc');
    
    // Reset
    store.reset();
    
    const finalState = useBuildingsStore.getState();
    expect(finalState.buildings).toEqual([]);
    expect(finalState.loading).toBe(false);
    expect(finalState.error).toBeNull();
    expect(finalState.filters).toEqual({});
    expect(finalState.sort).toBe('price-asc');
  });
});
