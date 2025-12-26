import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuintoAndarVisitScheduler } from '@/components/flow/QuintoAndarVisitScheduler';
import { useVisitScheduler } from '@/hooks/useVisitScheduler';

// Mock del hook
jest.mock('@/hooks/useVisitScheduler');
const mockUseVisitScheduler = useVisitScheduler as jest.MockedFunction<typeof useVisitScheduler>;

// Mock de APIs
global.fetch = jest.fn();

describe('Flujo simplificado de agendamiento de visitas', () => {
    const defaultProps = {
        isOpen: true,
        onClose: jest.fn(),
        listingId: 'test-listing',
        propertyName: 'Casa Test',
        propertyAddress: 'Av. Test 123, Santiago',
        propertyImage: 'test-image.jpg',
        onSuccess: jest.fn(),
    };

    const mockAvailableDays = [
        {
            id: 'day-1',
            date: '2025-01-16',
            day: 'Jue',
            number: '16',
            available: true,
            slotsCount: 3,
            premium: false
        },
        {
            id: 'day-2',
            date: '2025-01-17',
            day: 'Vie',
            number: '17',
            available: true,
            slotsCount: 2,
            premium: false
        }
    ];

    const mockAvailableSlots = [
        { id: 'slot-1', time: '10:00', available: true, premium: false },
        { id: 'slot-2', time: '14:00', available: true, premium: false },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        (fetch as jest.Mock).mockClear();
    });

    it('debería renderizar el componente correctamente', async () => {
        mockUseVisitScheduler.mockReturnValue({
            isLoading: false,
            error: null,
            selectedDate: null,
            selectedTime: null,
            selectedSlot: null,
            availableDays: mockAvailableDays,
            availableSlots: mockAvailableSlots,
            fetchAvailability: jest.fn(),
            selectDateTime: jest.fn(),
            createVisit: jest.fn(),
            clearSelection: jest.fn(),
            clearError: jest.fn(),
        });

        render(<QuintoAndarVisitScheduler {...defaultProps} />);

        // Verificar que el componente se renderiza correctamente
        expect(screen.getByText('Casa Test')).toBeInTheDocument();
        expect(screen.getByText('Selecciona fecha y hora')).toBeInTheDocument();
    });

    it('debería manejar errores de API correctamente', async () => {
        mockUseVisitScheduler.mockReturnValue({
            isLoading: false,
            error: 'Error de red',
            selectedDate: '2025-01-16',
            selectedTime: '10:00',
            selectedSlot: { id: 'slot-1' },
            availableDays: mockAvailableDays,
            availableSlots: mockAvailableSlots,
            fetchAvailability: jest.fn(),
            selectDateTime: jest.fn(),
            createVisit: jest.fn(),
            clearSelection: jest.fn(),
            clearError: jest.fn(),
        });

        render(<QuintoAndarVisitScheduler {...defaultProps} />);

        // Verificar que se muestra el error
        expect(screen.getByText('Error de red')).toBeInTheDocument();
    });

    it('debería permitir navegación básica', async () => {
        mockUseVisitScheduler.mockReturnValue({
            isLoading: false,
            error: null,
            selectedDate: null,
            selectedTime: null,
            selectedSlot: null,
            availableDays: mockAvailableDays,
            availableSlots: mockAvailableSlots,
            fetchAvailability: jest.fn(),
            selectDateTime: jest.fn(),
            createVisit: jest.fn(),
            clearSelection: jest.fn(),
            clearError: jest.fn(),
        });

        render(<QuintoAndarVisitScheduler {...defaultProps} />);

        // Verificar que se puede hacer clic en los botones
        const dayButton = screen.getByText('16');
        fireEvent.click(dayButton);
        expect(dayButton).toBeInTheDocument();
    });

    it('debería ser accesible', async () => {
        mockUseVisitScheduler.mockReturnValue({
            isLoading: false,
            error: null,
            selectedDate: null,
            selectedTime: null,
            selectedSlot: null,
            availableDays: mockAvailableDays,
            availableSlots: mockAvailableSlots,
            fetchAvailability: jest.fn(),
            selectDateTime: jest.fn(),
            createVisit: jest.fn(),
            clearSelection: jest.fn(),
            clearError: jest.fn(),
        });

        render(<QuintoAndarVisitScheduler {...defaultProps} />);

        // Verificar accesibilidad básica
        expect(screen.getByLabelText('Cerrar')).toBeInTheDocument();
        expect(screen.getByLabelText('Cambiar tema')).toBeInTheDocument();
    });
});
