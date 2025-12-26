"use client";

import { clx } from '@lib/utils';
import type { VisitEvent } from '@/types/calendar';

export type VisitCardProps = {
    visit: VisitEvent;
    onClick?: () => void;
    className?: string;
};

export default function VisitCard({ visit, onClick, className }: VisitCardProps) {
    const startTime = new Date(visit.start).toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit'
    });
    const endTime = new Date(visit.end).toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <div
            className={clx(
                "absolute inset-1 rounded-lg border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20",
                "p-2 cursor-pointer transition-all duration-200",
                "hover:shadow-md hover:scale-[1.02] hover:border-emerald-300 dark:hover:border-emerald-700",
                "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1",
                className
            )}
            onClick={onClick}
            role="button"
            tabIndex={0}
            aria-label={`Visita con ${visit.clientName} - ${startTime} a ${endTime}`}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-1">
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-xs font-medium text-emerald-800 dark:text-emerald-200">
                        {startTime} - {endTime}
                    </span>
                </div>
                <div className={clx(
                    "text-xs px-1.5 py-0.5 rounded-full",
                    visit.status === 'confirmed' && "bg-emerald-100 text-emerald-700 dark:bg-emerald-800 dark:text-emerald-200",
                    visit.status === 'pending' && "bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-200",
                    visit.status === 'cancelled' && "bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200"
                )}>
                    {visit.status === 'confirmed' && 'Confirmada'}
                    {visit.status === 'pending' && 'Pendiente'}
                    {visit.status === 'cancelled' && 'Cancelada'}
                </div>
            </div>

            {/* Cliente */}
            <div className="mb-1">
                <div className="text-xs font-semibold text-emerald-900 dark:text-emerald-100 truncate">
                    {visit.clientName}
                </div>
                <div className="text-xs text-emerald-700 dark:text-emerald-300 truncate">
                    {visit.clientEmail}
                </div>
            </div>

            {/* Propiedad */}
            <div className="mb-1">
                <div className="text-xs font-medium text-emerald-800 dark:text-emerald-200 truncate">
                    {visit.propertyName}
                </div>
                <div className="text-xs text-emerald-600 dark:text-emerald-400 truncate">
                    {visit.unitLabel} • {visit.address.split(',')[0]}
                </div>
            </div>

            {/* Notas */}
            {visit.notes && (
                <div className="text-xs text-emerald-600 dark:text-emerald-400 italic truncate">
                    "{visit.notes}"
                </div>
            )}

            {/* Acciones rápidas */}
            <div className="mt-2 flex gap-1">
                <button
                    className="flex-1 text-xs bg-emerald-600 text-white px-2 py-1 rounded hover:bg-emerald-700 transition-colors"
                    onClick={(e) => {
                        e.stopPropagation();
                        // TODO: Abrir modal de cotización
                    }}
                >
                    Cotizar
                </button>
                <button
                    className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded hover:bg-emerald-200 transition-colors dark:bg-emerald-800 dark:text-emerald-200 dark:hover:bg-emerald-700"
                    onClick={(e) => {
                        e.stopPropagation();
                        // TODO: Ver detalles
                    }}
                >
                    Ver
                </button>
            </div>
        </div>
    );
}
