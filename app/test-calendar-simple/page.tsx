"use client";

import { useState, useEffect } from 'react';
import { logger } from '@lib/logger';
import type { AvailabilitySlot } from '@/types/calendar';
import { asIsoDateTime } from '@/types/calendar';

// Datos de prueba simples
const MOCK_SLOTS: AvailabilitySlot[] = [
    { start: asIsoDateTime('2024-01-15T09:00:00Z'), end: asIsoDateTime('2024-01-15T10:00:00Z'), available: true },
    { start: asIsoDateTime('2024-01-15T10:00:00Z'), end: asIsoDateTime('2024-01-15T11:00:00Z'), available: false },
    { start: asIsoDateTime('2024-01-15T11:00:00Z'), end: asIsoDateTime('2024-01-15T12:00:00Z'), available: true },
];

export default function TestCalendarSimplePage() {
    const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        logger.log('🔄 Test simple: useEffect ejecutándose');

        const timer = setTimeout(() => {
            logger.log('✅ Test simple: Cargando datos mock');
            setSlots(MOCK_SLOTS);
            setLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    const available = slots.filter(s => s.available);

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800 p-4">
            <div className="max-w-md mx-auto">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6 text-center">
                    Test Simple Calendario
                </h1>

                <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-4">
                    <div className="text-sm text-zinc-600 mb-4">
                        Debug: {slots.length} slots total, {available.length} disponibles
                    </div>

                    {loading ? (
                        <div className="text-sm text-zinc-500">Cargando...</div>
                    ) : available.length === 0 ? (
                        <div className="text-sm text-zinc-500">No hay horarios disponibles</div>
                    ) : (
                        <div className="grid grid-cols-2 gap-2">
                            {available.map((slot) => (
                                <button
                                    key={slot.start}
                                    className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm hover:bg-violet-50"
                                    onClick={() => alert(`Seleccionaste ${slot.start}`)}
                                >
                                    {new Date(slot.start).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} -
                                    {new Date(slot.end).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
