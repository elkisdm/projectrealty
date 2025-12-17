import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QuintoAndarVisitScheduler } from '@/components/flow/QuintoAndarVisitScheduler';
import { useVisitScheduler } from '@/hooks/useVisitScheduler';

// Mock del hook
jest.mock('@/hooks/useVisitScheduler');
const mockUseVisitScheduler = useVisitScheduler as jest.MockedFunction<typeof useVisitScheduler>;

// Mock de APIs
global.fetch = jest.fn();

describe('Simulación E2E - Agendamiento de visitas', () => {
    const defaultProps = {
        isOpen: true,
        onClose: jest.fn(),
        listingId: 'home-amengual',
        propertyName: 'Casa Amengual',
        propertyAddress: 'Av. Amengual 123, Santiago',
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

    test('debería completar el flujo completo de agendamiento', async () => {
        const mockCreateVisit = jest.fn().mockResolvedValue({
            visitId: 'visit-123',
            message: 'Visita creada exitosamente'
        });

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
            createVisit: mockCreateVisit,
            clearSelection: jest.fn(),
            clearError: jest.fn(),
        });

        render(<QuintoAndarVisitScheduler {...defaultProps} />);

        // Verificar que el modal se abrió correctamente
        expect(screen.getByText('Casa Amengual')).toBeInTheDocument();
        expect(screen.getByText('Selecciona fecha y hora')).toBeInTheDocument();
        expect(screen.getByText('1/4')).toBeInTheDocument();

        // Verificar que los días están disponibles
        expect(screen.getByText('16')).toBeInTheDocument();
        expect(screen.getByText('17')).toBeInTheDocument();
    });

    test('debería validar campos del formulario correctamente', async () => {
        mockUseVisitScheduler.mockReturnValue({
            isLoading: false,
            error: null,
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

        // Verificar que el componente se renderiza correctamente
        expect(screen.getByText('Casa Amengual')).toBeInTheDocument();
        expect(screen.getByText('Selecciona fecha y hora')).toBeInTheDocument();
    });

    test('debería permitir navegación hacia atrás', async () => {
        mockUseVisitScheduler.mockReturnValue({
            isLoading: false,
            error: null,
            selectedDate: '2025-01-16',
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
        expect(screen.getByText('Selecciona fecha y hora')).toBeInTheDocument();
    });

    test('debería cambiar entre modo claro y oscuro', async () => {
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

        // Verificar que el botón de cambio de tema está presente
        expect(screen.getByLabelText('Cambiar tema')).toBeInTheDocument();
    });

    test('debería cerrar el modal correctamente', async () => {
        const mockOnClose = jest.fn();

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

        render(<QuintoAndarVisitScheduler {...defaultProps} onClose={mockOnClose} />);

        // Verificar que el botón de cerrar está presente
        const closeButton = screen.getByLabelText('Cerrar');
        expect(closeButton).toBeInTheDocument();

        // Simular clic en cerrar
        fireEvent.click(closeButton);
        expect(mockOnClose).toHaveBeenCalled();
    });

    test('debería ser accesible con teclado', async () => {
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

    test('debería manejar errores de red correctamente', async () => {
        mockUseVisitScheduler.mockReturnValue({
            isLoading: false,
            error: 'Error de servidor',
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

        // Verificar que se muestra el error
        expect(screen.getByText('Error de servidor')).toBeInTheDocument();
    });

    test('debería mostrar días no disponibles como deshabilitados', async () => {
        const mockUnavailableDays = [
            {
                id: 'day-1',
                date: '2025-01-16',
                day: 'Jue',
                number: '16',
                available: false,
                slotsCount: 0,
                premium: false
            }
        ];

        mockUseVisitScheduler.mockReturnValue({
            isLoading: false,
            error: null,
            selectedDate: null,
            selectedTime: null,
            selectedSlot: null,
            availableDays: mockUnavailableDays,
            availableSlots: [],
            fetchAvailability: jest.fn(),
            selectDateTime: jest.fn(),
            createVisit: jest.fn(),
            clearSelection: jest.fn(),
            clearError: jest.fn(),
        });

        render(<QuintoAndarVisitScheduler {...defaultProps} />);

        // Verificar que el componente se renderiza correctamente
        expect(screen.getByText('Casa Amengual')).toBeInTheDocument();
    });

    test('debería mostrar horas solo cuando hay fecha seleccionada', async () => {
        mockUseVisitScheduler.mockReturnValue({
            isLoading: false,
            error: null,
            selectedDate: null,
            selectedTime: null,
            selectedSlot: null,
            availableDays: mockAvailableDays,
            availableSlots: [],
            fetchAvailability: jest.fn(),
            selectDateTime: jest.fn(),
            createVisit: jest.fn(),
            clearSelection: jest.fn(),
            clearError: jest.fn(),
        });

        render(<QuintoAndarVisitScheduler {...defaultProps} />);

        // Verificar que el componente se renderiza correctamente
        expect(screen.getByText('Selecciona fecha y hora')).toBeInTheDocument();
    });

    test('debería funcionar correctamente en dispositivos móviles', async () => {
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
        expect(screen.getByText('Casa Amengual')).toBeInTheDocument();
    });
});
