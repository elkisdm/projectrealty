import React from 'react';
import { render, screen } from '@testing-library/react';
import { BuildingCardV2 } from '../../components/ui/BuildingCardV2';
import { Building } from '../../types';

// Mock Next.js components
jest.mock('next/image', () => {
  return function MockImage({ src, alt, fill, priority, blurDataURL, ...props }: any) {
    // Filtrar props que no son válidas para img
    const imgProps = { ...props };
    delete imgProps.fill;
    delete imgProps.priority;
    delete imgProps.blurDataURL;

    return <img src={src} alt={alt} {...imgProps} />;
  };
});

jest.mock('next/link', () => {
  return function MockLink({ href, children, ...props }: any) {
    return <a href={href} {...props}>{children}</a>;
  };
});

// Mock analytics
jest.mock('@lib/analytics', () => ({
  track: jest.fn(),
}));

const mockBuilding: Building = {
  id: 'test-building-1',
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
    {
      id: 'unit-2',
      tipologia: '2D1B',
      m2: 65,
      price: 750000,
      estacionamiento: true,
      bodega: true,
      disponible: true,
    },
    {
      id: 'unit-3',
      tipologia: '1D1B',
      m2: 50,
      price: 600000,
      estacionamiento: false,
      bodega: false,
      disponible: false,
    },
  ],
  gallery: ['/test-1.jpg', '/test-2.jpg'],
};

const mockBuildingWithPromo: Building = {
  ...mockBuilding,
  promo: {
    label: 'Sin comisión',
    tag: 'Promoción',
  },
};

const mockBuildingNoAvailability: Building = {
  ...mockBuilding,
  units: [
    {
      id: 'unit-1',
      tipologia: '1D1B',
      m2: 45,
      price: 500000,
      estacionamiento: true,
      bodega: false,
      disponible: false,
    },
  ],
};

describe('BuildingCardV2', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders building information correctly', () => {
    render(<BuildingCardV2 building={mockBuilding} />);

    expect(screen.getByText('Test Building')).toBeInTheDocument();
    expect(screen.getByText('Las Condes')).toBeInTheDocument();
    expect(screen.getByText('$500.000')).toBeInTheDocument();
    expect(screen.getByText('Desde')).toBeInTheDocument();
  });

  it('renders promotion badge when building has promo', () => {
    render(<BuildingCardV2 building={mockBuildingWithPromo} />);

    expect(screen.getByText('Sin comisión')).toBeInTheDocument();
    expect(screen.getByText('Promoción')).toBeInTheDocument();
  });

  it('does not render promotion badge when showBadge is false', () => {
    render(<BuildingCardV2 building={mockBuildingWithPromo} showBadge={false} />);

    expect(screen.queryByText('Sin comisión')).not.toBeInTheDocument();
    expect(screen.queryByText('Promoción')).not.toBeInTheDocument();
  });

  it('renders typology chips for available units', () => {
    render(<BuildingCardV2 building={mockBuilding} />);

    expect(screen.getByText('1D1B — 1 disp')).toBeInTheDocument();
    expect(screen.getByText('2D1B — 1 disp')).toBeInTheDocument();
  });

  it('shows "Sin disponibilidad" when no units are available', () => {
    render(<BuildingCardV2 building={mockBuildingNoAvailability} />);

    expect(screen.getByText('Sin disponibilidad')).toBeInTheDocument();
    expect(screen.queryByText('Desde')).not.toBeInTheDocument();
  });

  it('renders correct link href', () => {
    render(<BuildingCardV2 building={mockBuilding} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/propiedad/test-building-1');
  });

  it('renders image with correct src and alt', () => {
    render(<BuildingCardV2 building={mockBuilding} />);

    const image = screen.getByAltText('Portada Test Building');
    expect(image).toHaveAttribute('src', '/test-cover.jpg');
  });

  it('applies custom className', () => {
    render(<BuildingCardV2 building={mockBuilding} className="custom-class" />);

    const card = screen.getByRole('link').closest('div');
    expect(card).toHaveClass('custom-class');
  });

  it('has correct aria-label for accessibility', () => {
    render(<BuildingCardV2 building={mockBuilding} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('aria-label', 'Ver propiedad Test Building en Las Condes, 2 tipologías disponibles');
  });

  it('has correct aria-label when no availability', () => {
    render(<BuildingCardV2 building={mockBuildingNoAvailability} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('aria-label', 'Ver propiedad Test Building en Las Condes, sin disponibilidad');
  });

  it('renders multiple typology chips correctly', () => {
    const buildingWithMultipleUnits = {
      ...mockBuilding,
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
        {
          id: 'unit-2',
          tipologia: '1D1B',
          m2: 50,
          price: 550000,
          estacionamiento: true,
          bodega: false,
          disponible: true,
        },
        {
          id: 'unit-3',
          tipologia: '2D1B',
          m2: 65,
          price: 750000,
          estacionamiento: true,
          bodega: true,
          disponible: true,
        },
        {
          id: 'unit-4',
          tipologia: '3D2B',
          m2: 85,
          price: 950000,
          estacionamiento: true,
          bodega: true,
          disponible: true,
        },
        {
          id: 'unit-5',
          tipologia: '3D2B',
          m2: 90,
          price: 1000000,
          estacionamiento: true,
          bodega: true,
          disponible: true,
        },
      ],
    };

    render(<BuildingCardV2 building={buildingWithMultipleUnits} />);

    expect(screen.getByText('1D1B — +2 disp')).toBeInTheDocument();
    expect(screen.getByText('2D1B — 1 disp')).toBeInTheDocument();
    expect(screen.getByText('3D2B — +2 disp')).toBeInTheDocument();
  });
});
