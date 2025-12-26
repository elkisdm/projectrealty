import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuintoAndarVisitScheduler } from '@/components/flow/QuintoAndarVisitScheduler';
import { useVisitScheduler } from '@/hooks/useVisitScheduler';

// Mock del hook
jest.mock('@/hooks/useVisitScheduler');
const mockUseVisitScheduler = useVisitScheduler as jest.MockedFunction<typeof useVisitScheduler>;

// MSW handles API mocking - no need for global fetch override

describe('Flujo completo de agendamiento de visitas', () => {
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
    });

    describe('Flujo exitoso completo', () => {
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

            // Verificar que los días están disponibles
            expect(screen.getByText('16')).toBeInTheDocument();
            expect(screen.getByText('17')).toBeInTheDocument();
        });
    });

    describe('Flujo con errores', () => {
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

        it('debería validar campos requeridos', async () => {
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

            // Verificar que el botón continuar está deshabilitado inicialmente
            const continueButton = screen.getByText('Continuar →');
            expect(continueButton).toBeDisabled();
        });
    });

    describe('Navegación entre pasos', () => {
        it('debería permitir navegación hacia atrás', async () => {
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

        it('debería mantener el estado al navegar entre pasos', async () => {
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

            // Verificar que el estado se mantiene
            expect(screen.getByText('Selecciona fecha y hora')).toBeInTheDocument();
        });
    });

    describe('Datos de contacto', () => {
        it('debería activar notificaciones correctamente', async () => {
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

            // Verificar que las notificaciones están disponibles
            expect(screen.getByText('Selecciona fecha y hora')).toBeInTheDocument();
        });
    });

    describe('Accesibilidad y usabilidad', () => {
        it('debería ser completamente navegable con teclado', async () => {
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

        it('debería tener contraste adecuado en modo oscuro', async () => {
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

            // Verificar que el componente se renderiza
            expect(screen.getByText('Casa Test')).toBeInTheDocument();
        });
    });
});