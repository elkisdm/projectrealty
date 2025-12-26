import { render, screen, fireEvent } from '@testing-library/react';
import SlotPicker from '@components/calendar/SlotPicker';
import type { AvailabilitySlot } from '@/types/calendar';

function makeSlot(start: string, end: string): AvailabilitySlot {
    return { start: start as any, end: end as any, available: true } as AvailabilitySlot;
}

describe('SlotPicker', () => {
    it('renderiza slots disponibles y permite seleccionar', () => {
        const slots = [
            makeSlot('2025-01-01T09:00:00.000Z', '2025-01-01T10:00:00.000Z'),
            makeSlot('2025-01-01T10:00:00.000Z', '2025-01-01T11:00:00.000Z'),
        ];
        const onSelect = jest.fn();
        render(<SlotPicker slots={slots} onSelect={onSelect} />);

        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBe(2);

        fireEvent.click(buttons[0]);
        expect(onSelect).toHaveBeenCalledTimes(1);
    });

    it('muestra mensaje cuando no hay disponibilidad', () => {
        render(<SlotPicker slots={[]} />);
        expect(screen.getByText(/No hay horarios disponibles/i)).toBeInTheDocument();
    });
});
