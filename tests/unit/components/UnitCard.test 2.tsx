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
}));

describe('UnitCard', () => {
  const mockUnit: Unit = {
    id: 'unit-1',
    tipologia: '2D1B',
    m2: 65,
    price: 450000,
    estacionamiento: true,
    bodega: false,
    disponible: true,
    gastosComunes: 50000,
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

    expect(screen.getByText('Edificio Smart')).toBeInTheDocument();
    expect(screen.getByText('Ñuñoa • 2D1B')).toBeInTheDocument();
  });

  it('debería mostrar los datos de la unidad', () => {
    render(<UnitCard unit={mockUnit} building={mockBuilding} />);

    expect(screen.getByText('Edificio Smart')).toBeInTheDocument();
    expect(screen.getByText(/450.000/)).toBeInTheDocument();
    expect(screen.getByText(/50.000.*GC/)).toBeInTheDocument();
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

  it('debería navegar a /property/[slug] cuando se hace click', () => {
    render(<UnitCard unit={mockUnit} building={mockBuilding} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/property/edificio-smart-unit-1');
  });

  it('debería llamar onClick cuando se proporciona', () => {
    const mockOnClick = jest.fn();
    render(<UnitCard unit={mockUnit} building={mockBuilding} onClick={mockOnClick} />);

    const card = screen.getByRole('link');
    fireEvent.click(card);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('debería mostrar el precio formateado correctamente', () => {
    render(<UnitCard unit={mockUnit} building={mockBuilding} />);

    // formatPrice debería formatear 450000 como $450.000
    expect(screen.getByText(/450.000/)).toBeInTheDocument();
    expect(screen.getByText('/mes')).toBeInTheDocument();
  });

  it('debería mostrar el gasto común si está disponible', () => {
    render(<UnitCard unit={mockUnit} building={mockBuilding} />);

    expect(screen.getByText(/50.000.*GC aprox./)).toBeInTheDocument();
  });

  it('debería no mostrar gasto común si es 0', () => {
    const unitSinGC: Unit = {
      ...mockUnit,
      gastosComunes: 0,
    };

    render(<UnitCard unit={unitSinGC} building={mockBuilding} />);

    expect(screen.queryByText(/GC aprox./)).not.toBeInTheDocument();
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
    };

    render(<UnitCard unit={unitReservado} building={mockBuilding} />);

    expect(screen.getByText('Reservado')).toBeInTheDocument();
  });

  it('debería funcionar sin building (solo unit)', () => {
    render(<UnitCard unit={mockUnit} />);

    // Debería renderizar con valores por defecto
    expect(screen.getByText('Edificio')).toBeInTheDocument();
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
});
