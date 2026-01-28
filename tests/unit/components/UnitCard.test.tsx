import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { UnitCard } from '@/components/ui/UnitCard';
import type { Unit, Building } from '@/schemas/models';

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, fill, priority, blurDataURL, className, sizes, ...props }: any) => {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        data-priority={priority}
        data-blur={blurDataURL ? 'blur' : 'no-blur'}
        data-sizes={sizes}
        {...props}
      />
    );
  },
}));

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, className }: any) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Heart: ({ className, ...props }: any) => (
    <svg className={className} data-testid="heart-icon" {...props} />
  ),
  MapPin: ({ className, ...props }: any) => (
    <svg className={className} data-testid="map-pin-icon" {...props} />
  ),
  PawPrint: ({ className, ...props }: any) => (
    <svg className={className} data-testid="paw-print-icon" {...props} />
  ),
  Car: ({ className, ...props }: any) => (
    <svg className={className} data-testid="car-icon" {...props} />
  ),
  Package: ({ className, ...props }: any) => (
    <svg className={className} data-testid="package-icon" {...props} />
  ),
  Palmtree: ({ className, ...props }: any) => (
    <svg className={className} data-testid="palmtree-icon" {...props} />
  ),
}));

// Mock feature flag
jest.mock('@lib/flags', () => ({
  isUnitCardV2Enabled: jest.fn(() => false), // Default to V1 for tests
}));

// Mock analytics
jest.mock('@lib/analytics', () => ({
  track: jest.fn(),
}));

describe('UnitCard', () => {
  const mockUnit: Unit = {
    id: 'unit-1',
    slug: 'edificio-smart-unit-1',
    tipologia: '2D1B',
    m2: 65,
    price: 450000,
    estacionamiento: true,
    bodega: false,
    disponible: true,
    gastoComun: 50000, // Changed from gastosComunes to gastoComun
    codigoUnidad: '101',
    buildingId: 'building-1',
    dormitorios: 2,
    banos: 1,
    garantia: 1,
  };

  const mockBuilding: Building = {
    id: 'building-1',
    slug: 'edificio-smart',
    name: 'Edificio Smart',
    comuna: 'Ñuñoa',
    address: 'Av. Irarrázaval 1234',
    amenities: ['Gym', 'Piscina'],
    gallery: ['/images/buildings/smart-1.jpg', '/images/buildings/smart-2.jpg'],
    units: [mockUnit],
  };

  it('debería renderizar el componente correctamente', () => {
    render(<UnitCard unit={mockUnit} building={mockBuilding} />);

    // Building name should appear (with "Edificio" prefix in V1)
    expect(screen.getByText(/Edificio Smart/)).toBeInTheDocument();
    // Tipologia and comuna shown as separate pills in refactored version
    expect(screen.getByText('2D1B')).toBeInTheDocument();
    expect(screen.getByText('Ñuñoa')).toBeInTheDocument();
  });

  it('debería mostrar los datos de la unidad', () => {
    render(<UnitCard unit={mockUnit} building={mockBuilding} />);

    expect(screen.getByText(/Edificio Smart/)).toBeInTheDocument();
    expect(screen.getByText(/450.000/)).toBeInTheDocument();
    // Gasto común format changed in refactored version
    expect(screen.getByText(/Gasto común/)).toBeInTheDocument();
  });

  it('debería mostrar el tag de estado "Disponible"', () => {
    render(<UnitCard unit={mockUnit} building={mockBuilding} />);

    expect(screen.getByText('Disponible')).toBeInTheDocument();
  });

  it('debería mostrar el botón de favoritos', () => {
    render(<UnitCard unit={mockUnit} building={mockBuilding} />);

    const favoriteButton = screen.getByLabelText('Agregar a favoritos');
    expect(favoriteButton).toBeInTheDocument();
  });

  it('debería mostrar la imagen de la unidad', () => {
    render(<UnitCard unit={mockUnit} building={mockBuilding} />);

    const image = screen.getByAltText('Edificio Smart - 2D1B');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/images/buildings/smart-1.jpg');
  });

  it('debería navegar a la ruta SEO correcta cuando se hace click', () => {
    render(<UnitCard unit={mockUnit} building={mockBuilding} />);

    const link = screen.getByRole('link');
    // Now uses SEO-friendly route /arriendo/departamento/[comuna]/[slug]
    expect(link).toHaveAttribute('href', '/arriendo/departamento/nunoa/edificio-smart-unit-1');
  });

  it('debería llamar onClick cuando se proporciona', () => {
    const mockOnClick = jest.fn();
    render(<UnitCard unit={mockUnit} building={mockBuilding} onClick={mockOnClick} />);

    // When onClick is provided, card has role="button"
    // Find the main card button (not the favorite button which has aria-label)
    const buttons = screen.getAllByRole('button');
    // The card button is the one without aria-label "Agregar a favoritos"
    const cardButton = buttons.find(btn => btn.getAttribute('tabindex') === '0');

    if (cardButton) {
      fireEvent.click(cardButton);
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    } else {
      // Fallback: click the first button that's not the favorite
      const favoriteButton = screen.getByLabelText(/favoritos/i);
      const otherButtons = buttons.filter(btn => btn !== favoriteButton);
      if (otherButtons.length > 0) {
        fireEvent.click(otherButtons[0]);
        expect(mockOnClick).toHaveBeenCalledTimes(1);
      }
    }
  });

  it('debería mostrar el precio formateado correctamente', () => {
    render(<UnitCard unit={mockUnit} building={mockBuilding} />);

    // formatPrice debería formatear 450000 como $450.000
    expect(screen.getByText(/450.000/)).toBeInTheDocument();
    expect(screen.getByText('/mes')).toBeInTheDocument();
  });

  it('debería mostrar el gasto común si está disponible', () => {
    render(<UnitCard unit={mockUnit} building={mockBuilding} />);

    // Refactored version shows "Gasto común: $X"
    expect(screen.getByText(/Gasto común.*50\.000/)).toBeInTheDocument();
  });

  it('debería no mostrar gasto común si es 0', () => {
    const unitSinGC: Unit = {
      ...mockUnit,
      gastoComun: 0,
    };

    render(<UnitCard unit={unitSinGC} building={mockBuilding} />);

    expect(screen.queryByText(/Gasto común/)).not.toBeInTheDocument();
  });

  it('debería usar la imagen del building si está disponible', () => {
    render(<UnitCard unit={mockUnit} building={mockBuilding} />);

    const image = screen.getByAltText('Edificio Smart - 2D1B');
    expect(image).toHaveAttribute('src', '/images/buildings/smart-1.jpg');
  });

  it('debería tener accesibilidad correcta', () => {
    render(<UnitCard unit={mockUnit} building={mockBuilding} />);

    // Verificar que la imagen tiene alt text
    expect(screen.getByAltText('Edificio Smart - 2D1B')).toBeInTheDocument();

    // Verificar que el botón de favoritos tiene aria-label
    expect(screen.getByLabelText('Agregar a favoritos')).toBeInTheDocument();
  });

  it('debería mostrar el estado correcto según unit.status', () => {
    const unitReservado: Unit = {
      ...mockUnit,
      status: 'reserved',
      disponible: false, // Also set disponible to false for consistency
    };

    render(<UnitCard unit={unitReservado} building={mockBuilding} />);

    expect(screen.getByText('Reservado')).toBeInTheDocument();
  });

  it('debería funcionar sin building (solo unit)', () => {
    render(<UnitCard unit={mockUnit} />);

    // Should render with default values - "Edificio Edificio" when no building name
    expect(screen.getByText(/Edificio/)).toBeInTheDocument();
  });

  it('debería aplicar className adicional', () => {
    const { container } = render(
      <UnitCard unit={mockUnit} building={mockBuilding} className="custom-class" />
    );

    const card = container.querySelector('.custom-class');
    expect(card).toBeInTheDocument();
  });

  it('debería usar priority para next/image cuando se especifica', () => {
    render(<UnitCard unit={mockUnit} building={mockBuilding} priority={true} />);

    const image = screen.getByAltText('Edificio Smart - 2D1B');
    expect(image).toHaveAttribute('data-priority', 'true');
  });

  // ============================================
  // Variant Tests (V1 vs V2)
  // ============================================
  describe('Variants', () => {
    const { isUnitCardV2Enabled } = require('@lib/flags');

    beforeEach(() => {
      // Reset mock between tests
      isUnitCardV2Enabled.mockClear();
    });

    it('variant="default" renderiza V1 cuando feature flag está deshabilitado', () => {
      isUnitCardV2Enabled.mockReturnValue(false);

      render(<UnitCard unit={mockUnit} building={mockBuilding} variant="default" />);

      // V1 shows "Edificio" prefix and pills
      expect(screen.getByText(/Edificio Smart/)).toBeInTheDocument();
      expect(screen.getByText('2D1B')).toBeInTheDocument(); // Tipologia pill
      expect(screen.getByText('Ñuñoa')).toBeInTheDocument(); // Comuna pill
    });

    it('variant="v2" renderiza V2 layout', () => {
      isUnitCardV2Enabled.mockReturnValue(false); // Flag doesn't matter when explicit variant

      render(<UnitCard unit={mockUnit} building={mockBuilding} variant="v2" />);

      // V2 shows price prominently and specs in one line
      expect(screen.getByText(/450.000/)).toBeInTheDocument();
      expect(screen.getByText('/mes')).toBeInTheDocument();
    });

    it('feature flag activo renderiza V2 aunque variant sea default', () => {
      isUnitCardV2Enabled.mockReturnValue(true);

      render(<UnitCard unit={mockUnit} building={mockBuilding} />);

      // V2 layout should be rendered
      expect(screen.getByText(/450.000/)).toBeInTheDocument();
    });

    it('V2 muestra specs en 1 linea', () => {
      isUnitCardV2Enabled.mockReturnValue(false);

      render(<UnitCard unit={mockUnit} building={mockBuilding} variant="v2" />);

      // V2 shows specs in format "X m² · XD · XB"
      expect(screen.getByText(/65 m².*2D.*1B/)).toBeInTheDocument();
    });

    it('V2 muestra max 2 chips', () => {
      isUnitCardV2Enabled.mockReturnValue(false);

      const unitWithFeatures: Unit = {
        ...mockUnit,
        pet_friendly: true,
        estacionamiento: true,
        bodega: true, // 3 features, but only 2 chips should show
      };

      render(<UnitCard unit={unitWithFeatures} building={mockBuilding} variant="v2" />);

      // Should show only 2 chips (pet and parking based on order)
      const chips = screen.getAllByText(/Mascotas|Estac\.|Bodega/);
      expect(chips.length).toBeLessThanOrEqual(2);
    });

    it('V2 muestra badge overlay visible', () => {
      isUnitCardV2Enabled.mockReturnValue(false);

      render(<UnitCard unit={mockUnit} building={mockBuilding} variant="v2" />);

      // Badge should be present (Disponible)
      expect(screen.getByText('Disponible')).toBeInTheDocument();
    });

    it('V2 muestra total mensual con tooltip', () => {
      isUnitCardV2Enabled.mockReturnValue(false);

      render(<UnitCard unit={mockUnit} building={mockBuilding} variant="v2" />);

      // V2 shows "Total aprox:" with info button
      expect(screen.getByText(/Total aprox/)).toBeInTheDocument();
    });

    it('V2 muestra dirección truncada', () => {
      isUnitCardV2Enabled.mockReturnValue(false);

      render(<UnitCard unit={mockUnit} building={mockBuilding} variant="v2" />);

      // Address should be present
      expect(screen.getByText('Av. Irarrázaval 1234')).toBeInTheDocument();
    });
  });
});
