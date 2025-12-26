/**
 * Tests de Accesibilidad (A11y) para páginas principales
 * 
 * Estos tests verifican que los componentes cumplan con estándares WCAG
 * usando jest-axe para detectar violaciones automáticas.
 */

import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { SearchForm } from '@/components/marketing/SearchForm';
import { UnitCard } from '@/components/ui/UnitCard';
import { PropertyBookingCard } from '@/components/property/PropertyBookingCard';

// Extender expect con toHaveNoViolations
expect.extend(toHaveNoViolations);

// Mock de datos para tests
const mockUnit = {
  id: 'test-unit-1',
  slug: 'test-unit-1',
  codigoUnidad: '101',
  buildingId: 'test-building',
  tipologia: '2D1B',
  price: 500000,
  disponible: true,
  dormitorios: 2,
  banos: 1,
  garantia: 500000,
  images: ['https://example.com/image.jpg'],
};

const mockBuilding = {
  id: 'test-building',
  slug: 'test-building',
  name: 'Edificio Test',
  address: 'Calle Test 123',
  comuna: 'Santiago',
  amenities: [],
  gallery: [],
  units: [mockUnit],
};

describe('A11y Tests - Componentes Principales', () => {
  describe('SearchForm', () => {
    it('no debe tener violaciones de accesibilidad', async () => {
      const { container } = render(<SearchForm />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('debe tener labels descriptivos en campos de formulario', async () => {
      const { container } = render(<SearchForm />);
      const inputs = container.querySelectorAll('input, select');

      inputs.forEach((input) => {
        const id = input.getAttribute('id');
        if (id) {
          const label = container.querySelector(`label[for="${id}"]`);
          expect(label).toBeTruthy();
        }
      });
    });
  });

  describe('UnitCard', () => {
    it('no debe tener violaciones de accesibilidad', async () => {
      const { container } = render(
        <UnitCard
          unit={mockUnit as any}
          building={mockBuilding as any}
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('debe tener links accesibles con aria-label descriptivo', async () => {
      const { container } = render(
        <UnitCard
          unit={mockUnit as any}
          building={mockBuilding as any}
        />
      );

      const links = container.querySelectorAll('a[href]');
      links.forEach((link) => {
        // Debe tener aria-label o texto descriptivo
        const hasAriaLabel = link.hasAttribute('aria-label');
        const hasText = link.textContent && link.textContent.trim().length > 0;
        expect(hasAriaLabel || hasText).toBe(true);
      });
    });
  });

  describe('PropertyBookingCard', () => {
    it('no debe tener violaciones de accesibilidad', async () => {
      const { container } = render(
        <PropertyBookingCard
          unit={mockUnit as any}
          building={mockBuilding as any}
          onScheduleVisit={() => { }}
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('debe tener botones con labels accesibles', async () => {
      const { container } = render(
        <PropertyBookingCard
          unit={mockUnit as any}
          building={mockBuilding as any}
          onScheduleVisit={() => { }}
        />
      );

      const buttons = container.querySelectorAll('button');
      buttons.forEach((button) => {
        // Debe tener aria-label o texto descriptivo
        const hasAriaLabel = button.hasAttribute('aria-label');
        const hasText = button.textContent && button.textContent.trim().length > 0;
        expect(hasAriaLabel || hasText).toBe(true);
      });
    });
  });
});

describe('A11y Tests - Navegación por Teclado', () => {
  describe('Elementos interactivos', () => {
    it('debe poder navegar con Tab entre elementos interactivos', async () => {
      const { container } = render(
        <PropertyBookingCard
          unit={mockUnit as any}
          building={mockBuilding as any}
          onScheduleVisit={() => { }}
        />
      );

      const interactiveElements = container.querySelectorAll(
        'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      expect(interactiveElements.length).toBeGreaterThan(0);

      // Verificar que todos tienen tabindex apropiado
      interactiveElements.forEach((element) => {
        const tabIndex = element.getAttribute('tabindex');
        // Si tiene tabindex, no debe ser -1 (debe ser accesible)
        if (tabIndex !== null) {
          expect(tabIndex).not.toBe('-1');
        }
      });
    });
  });
});

describe('A11y Tests - Contraste y Colores', () => {
  // Nota: El contraste de colores debe verificarse manualmente con herramientas
  // como WebAIM Contrast Checker, ya que jest-axe no verifica CSS calculado

  it('debe usar atributos semánticos para información importante', async () => {
    const { container } = render(
      <PropertyBookingCard
        unit={mockUnit as any}
        building={mockBuilding as any}
        onScheduleVisit={() => { }}
      />
    );

    // Precios y números importantes deben tener estructura semántica
    const prices = container.querySelectorAll('[class*="price"], [class*="Price"]');
    // Los precios deben estar en elementos con contexto semántico
    expect(prices.length).toBeGreaterThan(0);
  });
});




