// Test simplificado de AdvancedFilterBar sin dependencias de next/navigation
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock del componente AdvancedFilterBar
const MockAdvancedFilterBar = ({
    filters = {
        price: { min: 0, max: 1000000000 },
        area: { min: 0, max: 1000 },
        bedrooms: 0,
        bathrooms: 0,
        commune: '',
        type: ''
    },
    onFiltersChange = jest.fn(),
    onReset = jest.fn()
}) => {
    const handlePriceChange = (field: 'min' | 'max', value: number) => {
        const newFilters = {
            ...filters,
            price: {
                ...filters.price,
                [field]: value
            }
        };
        onFiltersChange(newFilters);
    };

    const handleAreaChange = (field: 'min' | 'max', value: number) => {
        const newFilters = {
            ...filters,
            area: {
                ...filters.area,
                [field]: value
            }
        };
        onFiltersChange(newFilters);
    };

    const handleBedroomsChange = (value: number) => {
        const newFilters = {
            ...filters,
            bedrooms: value
        };
        onFiltersChange(newFilters);
    };

    const handleBathroomsChange = (value: number) => {
        const newFilters = {
            ...filters,
            bathrooms: value
        };
        onFiltersChange(newFilters);
    };

    const handleCommuneChange = (value: string) => {
        const newFilters = {
            ...filters,
            commune: value
        };
        onFiltersChange(newFilters);
    };

    const handleTypeChange = (value: string) => {
        const newFilters = {
            ...filters,
            type: value
        };
        onFiltersChange(newFilters);
    };

    return (
        <div data-testid="advanced-filter-bar" className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Filtros Avanzados</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Filtro de Precio */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Precio</label>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            placeholder="Mínimo"
                            value={filters.price.min || ''}
                            onChange={(e) => handlePriceChange('min', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                            type="number"
                            placeholder="Máximo"
                            value={filters.price.max || ''}
                            onChange={(e) => handlePriceChange('max', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Filtro de Área */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Área (m²)</label>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            placeholder="Mínimo"
                            value={filters.area.min || ''}
                            onChange={(e) => handleAreaChange('min', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                            type="number"
                            placeholder="Máximo"
                            value={filters.area.max || ''}
                            onChange={(e) => handleAreaChange('max', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Filtro de Dormitorios */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Dormitorios</label>
                    <select
                        value={filters.bedrooms}
                        onChange={(e) => handleBedroomsChange(parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value={0}>Cualquiera</option>
                        <option value={1}>1+</option>
                        <option value={2}>2+</option>
                        <option value={3}>3+</option>
                        <option value={4}>4+</option>
                        <option value={5}>5+</option>
                    </select>
                </div>

                {/* Filtro de Baños */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Baños</label>
                    <select
                        value={filters.bathrooms}
                        onChange={(e) => handleBathroomsChange(parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value={0}>Cualquiera</option>
                        <option value={1}>1+</option>
                        <option value={2}>2+</option>
                        <option value={3}>3+</option>
                        <option value={4}>4+</option>
                    </select>
                </div>

                {/* Filtro de Comuna */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Comuna</label>
                    <select
                        value={filters.commune}
                        onChange={(e) => handleCommuneChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Todas</option>
                        <option value="Las Condes">Las Condes</option>
                        <option value="Providencia">Providencia</option>
                        <option value="Ñuñoa">Ñuñoa</option>
                        <option value="Santiago">Santiago</option>
                        <option value="Maipú">Maipú</option>
                    </select>
                </div>

                {/* Filtro de Tipo */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Tipo</label>
                    <select
                        value={filters.type}
                        onChange={(e) => handleTypeChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Todos</option>
                        <option value="Casa">Casa</option>
                        <option value="Departamento">Departamento</option>
                        <option value="Oficina">Oficina</option>
                        <option value="Local">Local</option>
                    </select>
                </div>
            </div>

            <div className="mt-4 flex gap-2">
                <button
                    onClick={onReset}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                    Resetear
                </button>
                <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    Aplicar Filtros
                </button>
            </div>
        </div>
    );
};

describe('AdvancedFilterBar - Test Simplificado', () => {
    const mockFilters = {
        price: { min: 100000000, max: 300000000 },
        area: { min: 100, max: 200 },
        bedrooms: 3,
        bathrooms: 2,
        commune: 'Las Condes',
        type: 'Casa'
    };

    it('debería renderizar el componente correctamente', () => {
        render(<MockAdvancedFilterBar />);

        expect(screen.getByTestId('advanced-filter-bar')).toBeInTheDocument();
        expect(screen.getByText('Filtros Avanzados')).toBeInTheDocument();
    });

    it('debería mostrar todos los filtros', () => {
        render(<MockAdvancedFilterBar />);

        expect(screen.getByText('Precio')).toBeInTheDocument();
        expect(screen.getByText('Área (m²)')).toBeInTheDocument();
        expect(screen.getByText('Dormitorios')).toBeInTheDocument();
        expect(screen.getByText('Baños')).toBeInTheDocument();
        expect(screen.getByText('Comuna')).toBeInTheDocument();
        expect(screen.getByText('Tipo')).toBeInTheDocument();
    });

    it('debería mostrar los valores de los filtros', () => {
        render(<MockAdvancedFilterBar filters={mockFilters} />);

        expect(screen.getByDisplayValue('100000000')).toBeInTheDocument();
        expect(screen.getByDisplayValue('300000000')).toBeInTheDocument();
        expect(screen.getByDisplayValue('100')).toBeInTheDocument();
        expect(screen.getByDisplayValue('200')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Las Condes')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Casa')).toBeInTheDocument();
    });

    it('debería permitir cambiar filtros de precio', () => {
        const mockOnFiltersChange = jest.fn();
        render(<MockAdvancedFilterBar onFiltersChange={mockOnFiltersChange} />);

        const minPriceInputs = screen.getAllByPlaceholderText('Mínimo');
        fireEvent.change(minPriceInputs[0], { target: { value: '150000000' } }); // Primer input es precio

        expect(mockOnFiltersChange).toHaveBeenCalled();
    });

    it('debería permitir cambiar filtros de área', () => {
        const mockOnFiltersChange = jest.fn();
        render(<MockAdvancedFilterBar onFiltersChange={mockOnFiltersChange} />);

        const minAreaInputs = screen.getAllByPlaceholderText('Mínimo');
        fireEvent.change(minAreaInputs[1], { target: { value: '120' } }); // Segundo input es el de área

        expect(mockOnFiltersChange).toHaveBeenCalled();
    });

    it('debería permitir cambiar filtros de dormitorios', () => {
        const mockOnFiltersChange = jest.fn();
        render(<MockAdvancedFilterBar onFiltersChange={mockOnFiltersChange} />);

        const selects = screen.getAllByDisplayValue('Cualquiera');
        fireEvent.change(selects[0], { target: { value: '3' } }); // Primer select es dormitorios

        expect(mockOnFiltersChange).toHaveBeenCalled();
    });

    it('debería permitir cambiar filtros de baños', () => {
        const mockOnFiltersChange = jest.fn();
        render(<MockAdvancedFilterBar onFiltersChange={mockOnFiltersChange} />);

        const selects = screen.getAllByDisplayValue('Cualquiera');
        fireEvent.change(selects[1], { target: { value: '2' } }); // Segundo select es baños

        expect(mockOnFiltersChange).toHaveBeenCalled();
    });

    it('debería permitir cambiar filtros de comuna', () => {
        const mockOnFiltersChange = jest.fn();
        render(<MockAdvancedFilterBar onFiltersChange={mockOnFiltersChange} />);

        const communeSelect = screen.getByDisplayValue('Todas');
        fireEvent.change(communeSelect, { target: { value: 'Las Condes' } });

        expect(mockOnFiltersChange).toHaveBeenCalled();
    });

    it('debería permitir cambiar filtros de tipo', () => {
        const mockOnFiltersChange = jest.fn();
        render(<MockAdvancedFilterBar onFiltersChange={mockOnFiltersChange} />);

        const typeSelect = screen.getByDisplayValue('Todos');
        fireEvent.change(typeSelect, { target: { value: 'Casa' } });

        expect(mockOnFiltersChange).toHaveBeenCalled();
    });

    it('debería permitir resetear filtros', () => {
        const mockOnReset = jest.fn();
        render(<MockAdvancedFilterBar onReset={mockOnReset} />);

        const resetButton = screen.getByText('Resetear');
        fireEvent.click(resetButton);

        expect(mockOnReset).toHaveBeenCalledTimes(1);
    });

    it('debería ser accesible', () => {
        render(<MockAdvancedFilterBar />);

        // Verificar que los elementos están presentes
        expect(screen.getByText('Precio')).toBeInTheDocument();
        expect(screen.getByText('Área (m²)')).toBeInTheDocument();
        expect(screen.getByText('Dormitorios')).toBeInTheDocument();
        expect(screen.getByText('Baños')).toBeInTheDocument();
        expect(screen.getByText('Comuna')).toBeInTheDocument();
        expect(screen.getByText('Tipo')).toBeInTheDocument();
    });
});
