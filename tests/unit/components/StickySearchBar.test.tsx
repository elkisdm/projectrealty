import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { StickySearchBar } from '@/components/marketing/StickySearchBar';

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Search: ({ className, ...props }: any) => (
    <svg className={className} data-testid="search-icon" {...props} />
  ),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

describe('StickySearchBar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock scrollY
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 0,
    });
  });

  it('debería renderizar el componente correctamente', () => {
    render(<StickySearchBar />);

    const input = screen.getByLabelText('Buscar propiedades');
    expect(input).toBeInTheDocument();
    expect(screen.getByLabelText('Buscar')).toBeInTheDocument();
  });

  it('debería mostrar el placeholder por defecto', () => {
    render(<StickySearchBar />);

    const input = screen.getByPlaceholderText('Buscar por comuna, dirección...');
    expect(input).toBeInTheDocument();
  });

  it('debería mostrar el placeholder personalizado', () => {
    render(<StickySearchBar placeholder="Buscar propiedades..." />);

    const input = screen.getByPlaceholderText('Buscar propiedades...');
    expect(input).toBeInTheDocument();
  });

  it('debería actualizar el valor del input al escribir', () => {
    render(<StickySearchBar />);

    const input = screen.getByLabelText('Buscar propiedades') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Ñuñoa' } });

    expect(input.value).toBe('Ñuñoa');
  });

  it('debería navegar a /buscar cuando se hace submit sin callback', () => {
    render(<StickySearchBar />);

    const input = screen.getByLabelText('Buscar propiedades');
    const button = screen.getByLabelText('Buscar');

    fireEvent.change(input, { target: { value: 'Las Condes' } });
    fireEvent.click(button);

    expect(mockPush).toHaveBeenCalledWith('/buscar?q=Las%20Condes');
  });

  it('debería llamar onSearch callback cuando se proporciona', () => {
    const mockOnSearch = jest.fn();
    render(<StickySearchBar onSearch={mockOnSearch} />);

    const input = screen.getByLabelText('Buscar propiedades');
    const button = screen.getByLabelText('Buscar');

    fireEvent.change(input, { target: { value: 'Providencia' } });
    fireEvent.click(button);

    expect(mockOnSearch).toHaveBeenCalledWith('Providencia');
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('debería disparar búsqueda al presionar Enter', () => {
    const mockOnSearch = jest.fn();
    render(<StickySearchBar onSearch={mockOnSearch} />);

    const input = screen.getByLabelText('Buscar propiedades');

    fireEvent.change(input, { target: { value: 'Santiago' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(mockOnSearch).toHaveBeenCalledWith('Santiago');
  });

  it('debería no disparar búsqueda si el input está vacío', () => {
    const mockOnSearch = jest.fn();
    render(<StickySearchBar onSearch={mockOnSearch} />);

    const button = screen.getByLabelText('Buscar');
    fireEvent.click(button);

    expect(mockOnSearch).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('debería deshabilitar el botón cuando el input está vacío', () => {
    render(<StickySearchBar />);

    const button = screen.getByLabelText('Buscar');
    expect(button).toBeDisabled();
  });

  it('debería habilitar el botón cuando hay texto en el input', () => {
    render(<StickySearchBar />);

    const input = screen.getByLabelText('Buscar propiedades');
    const button = screen.getByLabelText('Buscar');

    expect(button).toBeDisabled();

    fireEvent.change(input, { target: { value: 'Test' } });

    expect(button).not.toBeDisabled();
  });

  it('debería usar valor inicial si se proporciona', () => {
    render(<StickySearchBar initialValue="Valor inicial" />);

    const input = screen.getByLabelText('Buscar propiedades') as HTMLInputElement;
    expect(input.value).toBe('Valor inicial');
  });

  it('debería tener accesibilidad correcta', () => {
    render(<StickySearchBar />);

    // Verificar que el input tiene aria-label
    const input = screen.getByLabelText('Buscar propiedades');
    expect(input).toBeInTheDocument();

    // Verificar que el botón tiene aria-label
    const button = screen.getByLabelText('Buscar');
    expect(button).toBeInTheDocument();
  });

  it('debería aplicar className adicional', () => {
    const { container } = render(
      <StickySearchBar className="custom-class" />
    );

    const wrapper = container.querySelector('.custom-class');
    expect(wrapper).toBeInTheDocument();
  });

  it('debería mostrar el icono de búsqueda', () => {
    render(<StickySearchBar />);

    const icon = screen.getByTestId('search-icon');
    expect(icon).toBeInTheDocument();
  });

  it('debería trimear espacios en blanco antes de buscar', () => {
    const mockOnSearch = jest.fn();
    render(<StickySearchBar onSearch={mockOnSearch} />);

    const input = screen.getByLabelText('Buscar propiedades');
    const button = screen.getByLabelText('Buscar');

    fireEvent.change(input, { target: { value: '  Test  ' } });
    fireEvent.click(button);

    expect(mockOnSearch).toHaveBeenCalledWith('Test');
  });

  it('debería no buscar si solo hay espacios en blanco', () => {
    const mockOnSearch = jest.fn();
    render(<StickySearchBar onSearch={mockOnSearch} />);

    const input = screen.getByLabelText('Buscar propiedades');
    const button = screen.getByLabelText('Buscar');

    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.click(button);

    expect(mockOnSearch).not.toHaveBeenCalled();
  });
});
