"use client";

import { useState, useEffect } from 'react';
import { clx } from '@lib/utils';
import type { WeekViewProps, WeekViewData, CalendarEventType } from '@/types/calendar';
import { generateWeekView, formatWeekRange, getWeekStart } from '@/lib/calendar/week-view';
import VisitCard from './VisitCard';
import BlockEvent from './BlockEvent';
// import VisitQuoteModal from './VisitQuoteModal';

export default function WeekView({
    startDate,
    googleCalendarId,
    icsUrl,
    internalBlocks = [],
    visits = [],
    className
}: WeekViewProps) {
    const [weekData, setWeekData] = useState<WeekViewData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedVisit, setSelectedVisit] = useState<CalendarEventType | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        try {
            const mockData = generateWeekView(
                startDate,
                MOCK_VISITS,
                MOCK_EXTERNAL_EVENTS,
                [...internalBlocks, ...MOCK_INTERNAL_BLOCKS]
            );
            setWeekData(mockData);
        } catch (error) {
            console.error('❌ Error en generateWeekView:', error);
            setError('Error generando datos del calendario');
        }
    }, [startDate, googleCalendarId, icsUrl, internalBlocks, visits]);

    function handleVisitClick(event: CalendarEventType) {
        if (event.type === 'visit') {
            setSelectedVisit(event);
            setModalOpen(true);
        }
    }

    if (loading) {
        return (
            <div className={clx("flex items-center justify-center p-8", className)}>
                <div className="text-sm text-zinc-500">Cargando calendario...</div>
            </div>
        );
    }

    if (error || !weekData) {
        return (
            <div className={clx("flex items-center justify-center p-8", className)}>
                <div className="text-sm text-red-500">{error || 'Error desconocido'}</div>
            </div>
        );
    }

    return (
        <div className={clx("w-full", className)}>
            {/* Debug info */}
            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Debug Info:</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                    startDate: {startDate} |
                    days: {weekData.days.length} |
                    timeSlots: {weekData.timeSlots.length} |
                    total events: {weekData.days.reduce((sum, day) => sum + day.events.length, 0)}
                </p>
            </div>

            {/* Header de la semana */}
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
                    {formatWeekRange(startDate)}
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            const prevWeek = new Date(startDate);
                            prevWeek.setDate(prevWeek.getDate() - 7);
                            // TODO: Navigate to previous week
                        }}
                        className="rounded-lg px-3 py-1 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                        ← Semana anterior
                    </button>
                    <button
                        onClick={() => {
                            const nextWeek = new Date(startDate);
                            nextWeek.setDate(nextWeek.getDate() + 7);
                            // TODO: Navigate to next week
                        }}
                        className="rounded-lg px-3 py-1 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                        Siguiente semana →
                    </button>
                </div>
            </div>

            {/* Grid del calendario */}
            <div className="rounded-2xl border border-zinc-200 bg-gray-800:border-zinc-700 dark:bg-zinc-900 overflow-hidden">
                {/* Header de días */}
                <div className="grid grid-cols-8 border-b border-zinc-200 dark:border-zinc-700">
                    <div className="p-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                        Hora
                    </div>
                    {weekData.days.map((day) => (
                        <div
                            key={day.date}
                            className={clx(
                                "p-3 text-center border-l border-zinc-200 dark:border-zinc-700",
                                day.isToday && "bg-violet-50 dark:bg-violet-900/20"
                            )}
                        >
                            <div className="text-sm font-medium text-zinc-900 dark:text-white">
                                {day.dayName}
                            </div>
                            <div className={clx(
                                "text-lg font-bold",
                                day.isToday
                                    ? "text-violet-600 dark:text-violet-400"
                                    : "text-zinc-600 dark:text-zinc-300"
                            )}>
                                {day.dayNumber}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Cuerpo del calendario */}
                <div className="relative">
                    {weekData.timeSlots.map((time) => (
                        <div key={time} className="grid grid-cols-8 border-b border-zinc-100 dark:border-zinc-800">
                            <div className="p-2 text-xs text-zinc-500 dark:text-zinc-400 border-r border-zinc-100 dark:border-zinc-800">
                                {time}
                            </div>
                            {weekData.days.map((day) => (
                                <div
                                    key={`${day.date}-${time}`}
                                    className="relative min-h-[60px] border-r border-zinc-100 dark:border-zinc-800 last:border-r-0"
                                >
                                    {/* Eventos en este slot */}
                                    {day.events.map((event) => {
                                        const eventStart = new Date(event.data.start);
                                        const eventTime = eventStart.toTimeString().slice(0, 5);

                                        if (eventTime === time) {
                                            if (event.type === 'visit') {
                                                return (
                                                    <VisitCard
                                                        key={event.data.id}
                                                        visit={event.data}
                                                        onClick={() => handleVisitClick(event)}
                                                    />
                                                );
                                            } else {
                                                return (
                                                    <BlockEvent
                                                        key={event.data.id}
                                                        event={event}
                                                    />
                                                );
                                            }
                                        }
                                        return null;
                                    })}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal de cotización - Simplificado */}
            {/* TODO: Implementar modal cuando esté listo */}
        </div>
    );
}

// Datos de prueba
const MOCK_VISITS = [
    {
        id: 'visit-1' as any,
        clientName: 'María González',
        clientEmail: 'maria@email.com',
        clientPhone: '+56912345678',
        propertyId: 'prop-1',
        propertyName: 'Edificio Premium Las Condes',
        unitId: 'A-101',
        unitLabel: 'A-101 · 2D1B',
        address: 'Av. Apoquindo 1234, Las Condes',
        start: '2025-01-15T10:00:00Z' as any,
        end: '2025-01-15T11:00:00Z' as any,
        status: 'confirmed' as const,
        notes: 'Cliente interesado en 2 dormitorios',
        createdAt: '2025-01-10T09:00:00Z' as any
    },
    {
        id: 'visit-2' as any,
        clientName: 'Carlos Rodríguez',
        clientEmail: 'carlos@email.com',
        clientPhone: '+56987654321',
        propertyId: 'prop-1',
        propertyName: 'Edificio Premium Las Condes',
        unitId: 'A-102',
        unitLabel: 'A-102 · 3D2B',
        address: 'Av. Apoquindo 1234, Las Condes',
        start: '2025-01-16T14:00:00Z' as any,
        end: '2025-01-16T15:00:00Z' as any,
        status: 'confirmed' as const,
        notes: 'Familia con 2 niños',
        createdAt: '2025-01-11T14:30:00Z' as any
    }
];

const MOCK_EXTERNAL_EVENTS = [
    {
        id: 'google-1',
        title: 'Reunión externa',
        start: '2025-01-15T13:00:00Z' as any,
        end: '2025-01-15T14:00:00Z' as any,
        busy: true,
        source: { kind: 'google' as const, calendarId: 'primary' },
        description: 'Reunión con proveedor'
    }
];

const MOCK_INTERNAL_BLOCKS = [
    {
        id: 'block-1',
        title: 'Mantenimiento',
        start: '2025-01-17T09:00:00Z' as any,
        end: '2025-01-17T11:00:00Z' as any,
        busy: true,
        type: 'maintenance' as const,
        description: 'Mantenimiento de ascensores'
    }
];
