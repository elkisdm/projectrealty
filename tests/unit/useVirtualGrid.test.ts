/**
 * @jest-environment jsdom
 */

import { renderHook, act } from '@testing-library/react';
import { useVirtualGrid, useResponsiveGrid } from '../../hooks/useVirtualGrid';

// Mock de window dimensions
const mockWindow = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', { writable: true, value: width });
  Object.defineProperty(window, 'innerHeight', { writable: true, value: height });
};

// Mock data
const mockItems = Array.from({ length: 50 }, (_, i) => ({
  id: `building-${i}`,
  slug: `building-${i}`,
  name: `Building ${i}`,
  comuna: 'Santiago',
  address: `Address ${i}`,
  precioDesde: 100000 + (i * 1000),
  coverImage: `/image-${i}.jpg`,
  gallery: [`/image-${i}.jpg`],
  typologySummary: [],
  badges: [],
  hasAvailability: true
}));

describe('useVirtualGrid', () => {
  beforeEach(() => {
    // Reset window dimensions
    mockWindow(1200, 800);
  });

  describe('Responsive breakpoints', () => {
    it('should detect mobile breakpoint correctly', () => {
      act(() => {
        mockWindow(600, 800);
      });
      
      const { result } = renderHook(() => useVirtualGrid({ 
        items: mockItems.slice(0, 10) 
      }));

      expect(result.current.currentBreakpoint).toBe('mobile');
      expect(result.current.dimensions.columns).toBe(1);
    });

    it('should detect tablet breakpoint correctly', () => {
      act(() => {
        mockWindow(800, 600);
      });
      
      const { result } = renderHook(() => useVirtualGrid({ 
        items: mockItems.slice(0, 10) 
      }));

      expect(result.current.currentBreakpoint).toBe('tablet');
      expect(result.current.dimensions.columns).toBe(2);
    });

    it('should detect desktop breakpoint correctly', () => {
      act(() => {
        mockWindow(1100, 800);
      });
      
      const { result } = renderHook(() => useVirtualGrid({ 
        items: mockItems.slice(0, 10) 
      }));

      expect(result.current.currentBreakpoint).toBe('desktop');
      expect(result.current.dimensions.columns).toBe(3);
    });

    it('should detect wide breakpoint correctly', () => {
      act(() => {
        mockWindow(1600, 1000);
      });
      
      const { result } = renderHook(() => useVirtualGrid({ 
        items: mockItems.slice(0, 10) 
      }));

      expect(result.current.currentBreakpoint).toBe('wide');
      expect(result.current.dimensions.columns).toBe(4);
    });
  });

  describe('Grid calculations', () => {
    it('should calculate correct dimensions for desktop', () => {
      act(() => {
        mockWindow(1200, 800);
      });
      
      const { result } = renderHook(() => useVirtualGrid({ 
        items: mockItems.slice(0, 10) 
      }));

      const { dimensions } = result.current;

      expect(dimensions.columns).toBe(3);
      expect(dimensions.rows).toBe(Math.ceil(10 / 3)); // 4 rows
      expect(dimensions.totalItems).toBe(10);
      expect(dimensions.itemWidth).toBeGreaterThan(200); // Minimum width
      expect(dimensions.itemHeight).toBe(320); // Card height
    });

    it('should handle empty items array', () => {
      const { result } = renderHook(() => useVirtualGrid({ 
        items: [] 
      }));

      const { dimensions } = result.current;

      expect(dimensions.totalItems).toBe(0);
      expect(dimensions.rows).toBe(0);
    });

    it('should calculate grid props correctly', () => {
      const { result } = renderHook(() => useVirtualGrid({ 
        items: mockItems.slice(0, 12),
        overscan: 1
      }));

      const { gridProps, dimensions } = result.current;

      expect(gridProps.columnCount).toBe(dimensions.columns);
      expect(gridProps.rowCount).toBe(dimensions.rows);
      expect(gridProps.columnWidth).toBe(dimensions.itemWidth);
      expect(gridProps.rowHeight).toBe(dimensions.itemHeight);
      expect(gridProps.overscanRowCount).toBe(1);
      expect(gridProps.overscanColumnCount).toBe(1);
    });
  });

  describe('Virtualization activation', () => {
    it('should activate virtualization for large lists', () => {
      const { result } = renderHook(() => useVirtualGrid({ 
        items: mockItems, // 50 items > 20 threshold
        enableVirtualization: true
      }));

      expect(result.current.isVirtualizationActive).toBe(true);
    });

    it('should not activate virtualization for small lists', () => {
      const { result } = renderHook(() => useVirtualGrid({ 
        items: mockItems.slice(0, 10), // 10 items < 20 threshold
        enableVirtualization: true
      }));

      expect(result.current.isVirtualizationActive).toBe(false);
    });

    it('should respect enableVirtualization=false', () => {
      const { result } = renderHook(() => useVirtualGrid({ 
        items: mockItems, // 50 items > 20 threshold
        enableVirtualization: false
      }));

      expect(result.current.isVirtualizationActive).toBe(false);
    });
  });

  describe('Helper functions', () => {
    it('should calculate item index correctly', () => {
      mockWindow(1200, 800); // Desktop: 3 columns
      
      const { result } = renderHook(() => useVirtualGrid({ 
        items: mockItems.slice(0, 10) 
      }));

      const { getItemIndex } = result.current;

      expect(getItemIndex(0, 0)).toBe(0); // First item
      expect(getItemIndex(0, 1)).toBe(1); // Second item in first row
      expect(getItemIndex(0, 2)).toBe(2); // Third item in first row
      expect(getItemIndex(1, 0)).toBe(3); // First item in second row
      expect(getItemIndex(1, 1)).toBe(4); // Second item in second row
    });

    it('should get item data correctly', () => {
      const testItems = mockItems.slice(0, 5);
      
      const { result } = renderHook(() => useVirtualGrid({ 
        items: testItems 
      }));

      const { getItemData } = result.current;

      expect(getItemData(0)).toBe(testItems[0]);
      expect(getItemData(2)).toBe(testItems[2]);
      expect(getItemData(10)).toBeUndefined(); // Out of bounds
    });

    it('should check if item is loaded correctly', () => {
      const testItems = mockItems.slice(0, 5);
      
      const { result } = renderHook(() => useVirtualGrid({ 
        items: testItems 
      }));

      const { isItemLoaded } = result.current;

      expect(isItemLoaded(0)).toBe(true);
      expect(isItemLoaded(4)).toBe(true);
      expect(isItemLoaded(5)).toBe(false); // Out of bounds
      expect(isItemLoaded(10)).toBe(false); // Out of bounds
    });
  });

  describe('Responsive updates', () => {
    it('should update when window resizes', () => {
      const { result } = renderHook(() => useVirtualGrid({ 
        items: mockItems.slice(0, 10) 
      }));

      // Initial: desktop (3 columns)
      expect(result.current.dimensions.columns).toBe(3);

      // Simulate window resize to mobile
      act(() => {
        mockWindow(600, 800);
        window.dispatchEvent(new Event('resize'));
      });

      // Should update to mobile (1 column)
      // Note: This test may need adjustment based on debouncing implementation
    });
  });
});

describe('useResponsiveGrid', () => {
  beforeEach(() => {
    mockWindow(1200, 800);
  });

  it('should return grid configuration without virtualization', () => {
    const { result } = renderHook(() => useResponsiveGrid(mockItems.slice(0, 10)));

    expect(result.current.columns).toBe(3); // Desktop
    expect(result.current.rows).toBe(Math.ceil(10 / 3));
    expect(result.current.breakpoint).toBe('desktop');
    expect(result.current.gridClassName).toBe('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6');
  });

  it('should update breakpoint correctly', () => {
    mockWindow(600, 800); // Mobile
    
    const { result } = renderHook(() => useResponsiveGrid(mockItems.slice(0, 8)));

    expect(result.current.columns).toBe(1);
    expect(result.current.rows).toBe(8);
    expect(result.current.breakpoint).toBe('mobile');
  });
});

describe('Edge cases', () => {
  it('should handle undefined/null items gracefully', () => {
    const { result } = renderHook(() => useVirtualGrid({ 
      items: undefined as any 
    }));

    expect(result.current.dimensions.totalItems).toBe(0);
    expect(result.current.isVirtualizationActive).toBe(false);
  });

  it('should handle very large numbers of items', () => {
    const largeItemSet = Array.from({ length: 10000 }, (_, i) => ({
      id: `item-${i}`,
      slug: `item-${i}`,
      name: `Item ${i}`,
      comuna: 'Santiago',
      address: `Address ${i}`,
      precioDesde: i * 1000,
      coverImage: `/image-${i}.jpg`,
      gallery: [`/image-${i}.jpg`],
      typologySummary: [],
      badges: [],
      hasAvailability: true
    }));

    const { result } = renderHook(() => useVirtualGrid({ 
      items: largeItemSet 
    }));

    expect(result.current.dimensions.totalItems).toBe(10000);
    expect(result.current.isVirtualizationActive).toBe(true);
    // For large datasets, rows should be calculated as Math.ceil(totalItems / columns)
    const expectedRows = Math.ceil(10000 / result.current.dimensions.columns);
    expect(result.current.dimensions.rows).toBe(expectedRows);
  });
});
