"use client";

import { useState } from 'react';
import type { VisitEvent } from '@/types/calendar';
import { Modal } from '@/components/ui/Modal';
import { PropertyQuotationPanel } from '@/components/quotation/PropertyQuotationPanel';

export type VisitQuoteModalProps = {
    visit: VisitEvent;
    open: boolean;
    onClose: () => void;
    className?: string;
};

export default function VisitQuoteModal({ visit, open, onClose }: VisitQuoteModalProps) {
    const [selectedUnitId, setSelectedUnitId] = useState<string>(visit?.unitId || '');

    // Protección contra visit undefined
    if (!visit) {
        return null;
    }

    // Mock building data basado en la visita
    const building = {
        id: visit.propertyId,
        name: visit.propertyName,
        address: visit.address,
        units: [
            {
                id: visit.unitId,
                tipologia: visit.unitLabel.split(' · ')[1] || '2D1B',
                superficie: 65,
                precio: 850000,
                disponible: true
            },
            {
                id: 'A-102',
                tipologia: '3D2B',
                superficie: 85,
                precio: 1200000,
                disponible: true
            }
        ]
    } as any;

    const selectedUnit = building.units.find((u: any) => u.id === selectedUnitId) || building.units[0];

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Cotización de visita"
            description={`Genera cotización para ${visit.clientName}`}
        >
            <div className="p-6 max-w-4xl">
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">
                        Cotización - {visit.clientName}
                    </h2>
                    <div className="text-sm text-zinc-600 dark:text-zinc-300 space-y-1">
                        <p><strong>Propiedad:</strong> {visit.propertyName}</p>
                        <p><strong>Unidad actual:</strong> {visit.unitLabel}</p>
                        <p><strong>Visita:</strong> {new Date(visit.start).toLocaleDateString()} a las {new Date(visit.start).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                </div>

                {/* Selector de unidad */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                        Cotizar unidad:
                    </label>
                    <select
                        value={selectedUnitId}
                        onChange={(e) => setSelectedUnitId(e.target.value)}
                        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                    >
                        {building.units.map((unit: any) => (
                            <option key={unit.id} value={unit.id}>
                                {unit.id} · {unit.tipologia} · ${unit.precio.toLocaleString()}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Panel de cotización */}
                <PropertyQuotationPanel
                    building={building}
                    selectedUnit={selectedUnit}
                    initialStartDate={new Date(visit.start).toISOString().slice(0, 10)}
                />
            </div>
        </Modal>
    );
}
