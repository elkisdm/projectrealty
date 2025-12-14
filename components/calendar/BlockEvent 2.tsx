"use client";

import { clx } from '@lib/utils';
import type { CalendarEventType } from '@/types/calendar';

export type BlockEventProps = {
    event: CalendarEventType;
    className?: string;
};

export default function BlockEvent({ event, className }: BlockEventProps) {
    if (event.type === 'visit') return null;

    const startTime = new Date(event.data.start).toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit'
    });
    const endTime = new Date(event.data.end).toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit'
    });

    const isExternal = event.type === 'external-block';
    const isInternal = event.type === 'internal-block';

    const getBlockStyles = () => {
        if (isExternal) {
            return {
                bg: 'bg-red-50 dark:bg-red-900/20',
                border: 'border-red-200 dark:border-red-800',
                text: 'text-red-800 dark:text-red-200',
                icon: '🔴'
            };
        }

        if (isInternal) {
            const block = event.data;
            switch (block.type) {
                case 'maintenance':
                    return {
                        bg: 'bg-orange-50 dark:bg-orange-900/20',
                        border: 'border-orange-200 dark:border-orange-800',
                        text: 'text-orange-800 dark:text-orange-200',
                        icon: '🔧'
                    };
                case 'meeting':
                    return {
                        bg: 'bg-blue-50 dark:bg-blue-900/20',
                        border: 'border-blue-200 dark:border-blue-800',
                        text: 'text-blue-800 dark:text-blue-200',
                        icon: '📅'
                    };
                case 'lunch':
                    return {
                        bg: 'bg-yellow-50 dark:bg-yellow-900/20',
                        border: 'border-yellow-200 dark:border-yellow-800',
                        text: 'text-yellow-800 dark:text-yellow-200',
                        icon: '🍽️'
                    };
                default:
                    return {
                        bg: 'bg-gray-900:bg-gray-900/20',
                        border: 'border-gray-700:border-gray-800',
                        text: 'text-gray-800 dark:text-gray-200',
                        icon: '⏰'
                    };
            }
        }

        return null;
    };

    const styles = getBlockStyles();

    if (!styles) {
        return null;
    }

    return (
        <div
            className={clx(
                "absolute inset-1 rounded-lg border",
                styles.bg,
                styles.border,
                "p-2 cursor-default",
                className
            )}
            role="button"
            tabIndex={0}
            aria-label={`${event.data.title} - ${startTime} a ${endTime}`}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-1">
                <div className="flex items-center gap-1">
                    <span className="text-xs">{styles.icon}</span>
                    <span className={clx("text-xs font-medium", styles.text)}>
                        {startTime} - {endTime}
                    </span>
                </div>
                <div className={clx(
                    "text-xs px-1.5 py-0.5 rounded-full",
                    isExternal && "bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200",
                    isInternal && "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200"
                )}>
                    {isExternal && 'Externo'}
                    {isInternal && 'Interno'}
                </div>
            </div>

            {/* Título */}
            <div className="mb-1">
                <div className={clx("text-xs font-semibold truncate", styles.text)}>
                    {event.data.title}
                </div>
            </div>

            {/* Descripción */}
            {event.data.description && (
                <div className={clx("text-xs italic truncate opacity-80", styles.text)}>
                    {event.data.description}
                </div>
            )}

            {/* Fuente para eventos externos */}
            {isExternal && (
                <div className="mt-1">
                    <div className={clx("text-xs opacity-70", styles.text)}>
                        {event.data.source.kind === 'google' && '📅 Google Calendar'}
                        {event.data.source.kind === 'ics' && '📄 ICS Calendar'}
                    </div>
                </div>
            )}
        </div>
    );
}
