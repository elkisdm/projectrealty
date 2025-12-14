"use client";

import { useState, useMemo, useEffect } from 'react';
import type { AvailabilitySlot } from '@/types/calendar';
import type { Building, Unit } from '@schemas/models';
import { clx } from '@lib/utils';
import SlotPicker from './SlotPicker';
import VisitPanel from './VisitPanel';
import VisitQuoteModal from './VisitQuoteModal';

export type CalendarVisitFlowProps = {
    building: Building;
    unit: Unit;
    date: string; // YYYY-MM-DD
    slots?: AvailabilitySlot[]; // opcional si se inyectan; si no, se hace fetch
    googleCalendarId?: string;
    icsUrl?: string;
    className?: string;
};

// Datos de prueba para testing completo
const MOCK_SLOTS: AvailabilitySlot[] = [
    { start: '2024-01-15T09:00:00Z' as any, end: '2024-01-15T10:00:00Z' as any, available: true },
    { start: '2024-01-15T10:00:00Z' as any, end: '2024-01-15T11:00:00Z' as any, available: false },
    { start: '2024-01-15T11:00:00Z' as any, end: '2024-01-15T12:00:00Z' as any, available: true },
    { start: '2024-01-15T12:00:00Z' as any, end: '2024-01-15T13:00:00Z' as any, available: false },
    { start: '2024-01-15T14:00:00Z' as any, end: '2024-01-15T15:00:00Z' as any, available: true },
    { start: '2024-01-15T15:00:00Z' as any, end: '2024-01-15T16:00:00Z' as any, available: true },
    { start: '2024-01-15T16:00:00Z' as any, end: '2024-01-15T17:00:00Z' as any, available: false },
    { start: '2024-01-15T17:00:00Z' as any, end: '2024-01-15T18:00:00Z' as any, available: true },
];

export default function CalendarVisitFlow({ building, unit, date, slots: initialSlots, googleCalendarId, icsUrl, className }: CalendarVisitFlowProps) {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<AvailabilitySlot | null>(null);
    const [slots, setSlots] = useState<AvailabilitySlot[]>(initialSlots ?? []);
    const [loading, setLoading] = useState(!initialSlots);
    const [error, setError] = useState<string | null>(null);

    const unitLabel = useMemo(() => `${unit?.id} · ${unit?.tipologia ?? ''}`.trim(), [unit]);

    useEffect(() => {
        console.log('🔄 useEffect ejecutándose...', { initialSlots, googleCalendarId, icsUrl });

        if (initialSlots) {
            console.log('✅ Usando slots iniciales:', initialSlots);
            setSlots(initialSlots);
            setLoading(false);
            return;
        }

        let cancelled = false;
        async function load() {
            try {
                setLoading(true);
                setError(null);

                // En desarrollo, usar datos de prueba si no hay googleCalendarId/icsUrl
                if (!googleCalendarId && !icsUrl) {
                    console.log('🔍 Cargando datos mock...');
                    // Simular delay de red
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    if (!cancelled) {
                        console.log('✅ Datos mock cargados:', MOCK_SLOTS);
                        setSlots(MOCK_SLOTS);
                        setLoading(false);
                    }
                    return;
                }

                console.log('🌐 Haciendo fetch a API...');
                const res = await fetch('/api/calendar/availability', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        date,
                        visibleHours: { start: '09:00', end: '18:00' },
                        googleCalendarId,
                        icsUrl,
                        // Datos de prueba para bloques internos
                        internalBlocks: [
                            { id: 'block-1', title: 'Mantenimiento', start: '2024-01-15T10:00:00Z', end: '2024-01-15T11:00:00Z', busy: true },
                            { id: 'block-2', title: 'Reunión', start: '2024-01-15T12:00:00Z', end: '2024-01-15T13:00:00Z', busy: true },
                            { id: 'block-3', title: 'Almuerzo', start: '2024-01-15T16:00:00Z', end: '2024-01-15T17:00:00Z', busy: true },
                        ]
                    })
                });
                if (!res.ok) throw new Error(String(res.status));
                const data = await res.json();
                if (!cancelled) {
                    console.log('✅ Datos de API cargados:', data.slots);
                    setSlots(data.slots ?? []);
                }
            } catch (error) {
                console.error('❌ Error cargando datos:', error);
                if (!cancelled) setError('No se pudo cargar la disponibilidad');
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        load();
        return () => { cancelled = true; };
    }, [date, initialSlots, googleCalendarId, icsUrl]);

    function handleSelect(slot: AvailabilitySlot) {
        setSelected(slot);
        setOpen(true);
    }

    return (
        <div className={clx('space-y-4', className)}>
            <VisitPanel
                propertyTitle={building.name}
                unitLabel={unitLabel}
                address={building.address ? `${(building.address as any).street}, ${(building.address as any).commune}` : undefined}
                visitDate={date}
                visitHour={selected ? new Date(selected.start).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : undefined}
                onQuoteHref="#"
            />
            {error && <p className="px-4 text-sm text-red-600" role="alert">{error}</p>}
            {loading ? (
                <div className="px-4 py-3 text-sm text-zinc-500" aria-live="polite">Cargando horarios…</div>
            ) : (
                <>
                    <div className="px-4 text-xs text-zinc-400">
                        Debug: {slots.length} slots cargados | Loading: {loading.toString()} | Error: {error || 'none'}
                    </div>
                    <SlotPicker slots={slots} onSelect={handleSelect} />
                </>
            )}
            {/* Modal de cotización - TODO: Implementar con VisitEvent */}
            {/* <VisitQuoteModal
        visit={visitEvent}
        open={open}
        onClose={() => setOpen(false)}
      /> */}
        </div>
    );
}
