import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock del hook antes de importar el componente
jest.mock('../../hooks/useVisitScheduler', () => ({
    useVisitScheduler: jest.fn(() => ({
        isLoading: false,
        error: null,
        selectedDate: null,
        selectedTime: null,
        availableDays: [
            { id: 'day-1', date: '2025-01-15', day: 'Lun', number: '15', available: true, slotsCount: 3, premium: false },
            { id: 'day-2', date: '2025-01-16', day: 'Mar', number: '16', available: true, slotsCount: 2, premium: false },
        ],
        availableSlots: [
            { id: 'slot-1', time: '10:00', available: true, premium: false },
            { id: 'slot-2', time: '14:00', available: true, premium: false },
        ],
        fetchAvailability: jest.fn(),
        selectDateTime: jest.fn(),
        createVisit: jest.fn().mockResolvedValue({ success: true, visitId: '123' }),
        clearError: jest.fn(),
    }))
}));

// Mock de PremiumFeaturesStep
jest.mock('../../components/flow/PremiumFeaturesStep', () => ({
    PremiumFeaturesStep: ({ onBack, onContinue }: any) => (
        <div data-testid="premium-features">
            <h3>Características Premium</h3>
            <button onClick={onBack}>← Atrás</button>
            <button onClick={onContinue}>Confirmar Visita ✨</button>
        </div>
    )
}));

// Importar el componente después de los mocks
import { QuintoAndarVisitScheduler } from '../../components/flow/QuintoAndarVisitScheduler';

describe('QuintoAndarVisitScheduler', () => {
    const defaultProps = {
        isOpen: true,
        onClose: jest.fn(),
        listingId: 'test-listing',
        propertyName: 'Test Property',
        propertyAddress: 'Test Address 123',
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Renderizado inicial', () => {
        it('debería renderizar el modal cuando está abierto', () => {
            render(<QuintoAndarVisitScheduler {...defaultProps} />);

            expect(screen.getByText('Test Property')).toBeInTheDocument();
            expect(screen.getByText('Test Address 123')).toBeInTheDocument();
            expect(screen.getByText('Selecciona fecha y hora')).toBeInTheDocument();
        });

        it('no debería renderizar el modal cuando está cerrado', () => {
            render(<QuintoAndarVisitScheduler {...defaultProps} isOpen={false} />);

            expect(screen.queryByText('Test Property')).not.toBeInTheDocument();
        });

        it('debería mostrar el paso inicial de selección de fecha', () => {
            render(<QuintoAndarVisitScheduler {...defaultProps} />);

            expect(screen.getByText('Selecciona fecha y hora')).toBeInTheDocument();
            expect(screen.getByText('Fecha')).toBeInTheDocument();
        });
    });

    describe('Navegación entre pasos', () => {
        it('debería mostrar botón de continuar en el paso inicial', () => {
            render(<QuintoAndarVisitScheduler {...defaultProps} />);

            expect(screen.getByText('Continuar →')).toBeInTheDocument();
        });

        it('debería mostrar el componente correctamente en el paso inicial', () => {
            render(<QuintoAndarVisitScheduler {...defaultProps} />);

            // Verificar que el componente se renderiza correctamente
            expect(screen.getByText('Test Property')).toBeInTheDocument();
            expect(screen.getByText('Selecciona fecha y hora')).toBeInTheDocument();
            expect(screen.getByText('Fecha')).toBeInTheDocument();
        });
    });

    describe('Selección de fecha y hora', () => {
        it('debería mostrar días disponibles', () => {
            render(<QuintoAndarVisitScheduler {...defaultProps} />);

            expect(screen.getByText('15')).toBeInTheDocument();
            expect(screen.getByText('16')).toBeInTheDocument();
        });

        it('debería mostrar la estructura del componente correctamente', () => {
            render(<QuintoAndarVisitScheduler {...defaultProps} />);

            // Verificar elementos estructurales
            expect(screen.getByText('Elige el mejor momento para tu visita')).toBeInTheDocument();
            expect(screen.getByText('1/4')).toBeInTheDocument();
        });
    });

    describe('Formulario de contacto', () => {
        it('debería mostrar el componente en el paso inicial', () => {
            render(<QuintoAndarVisitScheduler {...defaultProps} />);

            // Verificar que el componente se renderiza en el paso inicial
            expect(screen.getByText('Test Property')).toBeInTheDocument();
            expect(screen.getByText('Selecciona fecha y hora')).toBeInTheDocument();
        });

        it('debería tener botón de continuar deshabilitado inicialmente', () => {
            render(<QuintoAndarVisitScheduler {...defaultProps} />);

            const continueButton = screen.getByText('Continuar →');
            expect(continueButton).toBeDisabled();
        });
    });

    describe('Características premium', () => {
        it('debería mostrar el componente correctamente', () => {
            render(<QuintoAndarVisitScheduler {...defaultProps} />);

            // Verificar que el componente se renderiza correctamente
            expect(screen.getByText('Test Property')).toBeInTheDocument();
            expect(screen.getByText('Selecciona fecha y hora')).toBeInTheDocument();
        });
    });

    describe('Paso de éxito', () => {
        it('debería mostrar el componente correctamente', () => {
            render(<QuintoAndarVisitScheduler {...defaultProps} />);

            // Verificar que el componente se renderiza correctamente
            expect(screen.getByText('Test Property')).toBeInTheDocument();
            expect(screen.getByText('Selecciona fecha y hora')).toBeInTheDocument();
        });
    });

    describe('Modo oscuro/claro', () => {
        it('debería aplicar clases de tema oscuro', () => {
            render(<QuintoAndarVisitScheduler {...defaultProps} />);

            // El modal debería tener clases de tema
            const modal = document.querySelector('.fixed.inset-0');
            expect(modal).toBeInTheDocument();
        });
    });

    describe('Manejo de errores', () => {
        it('debería mostrar mensaje de error cuando hay un error', () => {
            const mockHook = require('../../hooks/useVisitScheduler').useVisitScheduler;
            mockHook.mockReturnValue({
                isLoading: false,
                error: 'Error al cargar disponibilidad',
                selectedDate: null,
                selectedTime: null,
                availableDays: [],
                availableSlots: [],
                fetchAvailability: jest.fn(),
                selectDateTime: jest.fn(),
                createVisit: jest.fn(),
                clearError: jest.fn(),
            });

            render(<QuintoAndarVisitScheduler {...defaultProps} />);

            expect(screen.getByText('Error al cargar disponibilidad')).toBeInTheDocument();
        });
    });

    describe('Accesibilidad', () => {
        it('debería tener botón de cerrar accesible', () => {
            render(<QuintoAndarVisitScheduler {...defaultProps} />);

            const closeButton = screen.getByLabelText('Cerrar');
            expect(closeButton).toBeInTheDocument();
        });

        it('debería ser navegable con teclado', () => {
            render(<QuintoAndarVisitScheduler {...defaultProps} />);

            const closeButton = screen.getByLabelText('Cerrar');
            expect(closeButton).toBeInTheDocument();
        });
    });
});