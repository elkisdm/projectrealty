'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar,
    Clock,
    MapPin,
    User,
    MessageSquare,
    CheckCircle,
    XCircle,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { Visit, Agent } from '@/types/visit';
import { logger } from '@lib/logger';

interface UserVisitsPanelProps {
    userId: string;
    className?: string;
}

interface VisitWithDetails extends Visit {
    agent?: Agent;
    propertyName?: string;
    propertyAddress?: string;
    slotStartTime?: string;
    slotEndTime?: string;
}

export function UserVisitsPanel({ userId, className = '' }: UserVisitsPanelProps) {
    const [visits, setVisits] = useState<VisitWithDetails[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'canceled'>('upcoming');

    // Mock data para desarrollo
    const mockVisits: VisitWithDetails[] = [
        {
            id: 'visit_001',
            listingId: 'guillermo-mann-74012ca7',
            slotId: 'slot_001',
            userId: 'user_001',
            status: 'confirmed',
            createdAt: new Date().toISOString(),
            idempotencyKey: 'key_001',
            agentId: 'agent_001',
            agent: {
                id: 'agent_001',
                name: 'María González',
                phone: '+56912345678',
                whatsappNumber: '+56912345678',
                email: 'maria@hommie.cl'
            },
            propertyName: 'Guillermo Mann - Unidad 2201-B',
            propertyAddress: 'Av. Vicuña Mackenna 2362, Ñuñoa',
            slotStartTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Mañana
            slotEndTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString()
        },
        {
            id: 'visit_002',
            listingId: 'guillermo-mann-74012ca7',
            slotId: 'slot_002',
            userId: 'user_001',
            status: 'completed',
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // Hace 1 semana
            idempotencyKey: 'key_002',
            agentId: 'agent_001',
            agent: {
                id: 'agent_001',
                name: 'María González',
                phone: '+56912345678',
                whatsappNumber: '+56912345678',
                email: 'maria@hommie.cl'
            },
            propertyName: 'Guillermo Mann - Unidad 2201-B',
            propertyAddress: 'Av. Vicuña Mackenna 2362, Ñuñoa',
            slotStartTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            slotEndTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString()
        }
    ];

    // Cargar visitas del usuario
    const fetchUserVisits = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // En desarrollo usar mock data
            // En producción: const response = await fetch(`/api/visits?userId=${userId}`);
            // const data = await response.json();

            await new Promise(resolve => setTimeout(resolve, 1000)); // Simular delay
            setVisits(mockVisits);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al cargar visitas';
            setError(errorMessage);
            logger.error('Error fetching visits:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Cargar visitas al montar
    useEffect(() => {
        fetchUserVisits();
        // eslint-disable-next-line react-hooks/exhaustive-deps -- Only fetch on userId change, not on fetchUserVisits recreation
    }, [userId]);

    // Filtrar visitas por estado
    const upcomingVisits = visits.filter(visit =>
        visit.status === 'confirmed' &&
        new Date(visit.slotStartTime || '') > new Date()
    );

    const pastVisits = visits.filter(visit =>
        visit.status === 'completed' ||
        new Date(visit.slotStartTime || '') <= new Date()
    );

    const canceledVisits = visits.filter(visit => visit.status === 'canceled');

    // Cancelar visita
    const handleCancelVisit = async (visitId: string) => {
        try {
            // En producción: await fetch(`/api/visits/${visitId}/cancel`, { method: 'POST' });

            // Simular cancelación
            setVisits(prev => prev.map(visit =>
                visit.id === visitId
                    ? { ...visit, status: 'canceled' as const }
                    : visit
            ));

            // Mostrar confirmación
            alert('Visita cancelada exitosamente');

        } catch (err) {
            logger.error('Error canceling visit:', err);
            alert('Error al cancelar la visita');
        }
    };

    // Formatear fecha y hora
    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString('es-CL', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
            time: date.toLocaleTimeString('es-CL', {
                hour: '2-digit',
                minute: '2-digit'
            })
        };
    };

    // Obtener color del estado
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed':
                return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'completed':
                return 'text-green-600 bg-green-50 border-green-200';
            case 'canceled':
                return 'text-red-600 bg-red-50 border-red-200';
            case 'no_show':
                return 'text-orange-600 bg-orange-50 border-orange-200';
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    // Obtener texto del estado
    const getStatusText = (status: string) => {
        switch (status) {
            case 'confirmed':
                return 'Confirmada';
            case 'completed':
                return 'Completada';
            case 'canceled':
                return 'Cancelada';
            case 'no_show':
                return 'No asistió';
            default:
                return 'Pendiente';
        }
    };

    if (isLoading) {
        return (
            <div className={`flex items-center justify-center py-12 ${className}`}>
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className={`text-center py-12 ${className}`}>
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar visitas</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                    onClick={fetchUserVisits}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-colors"
                >
                    Reintentar
                </button>
            </div>
        );
    }

    return (
        <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 ${className}`}>
            {/* Header */}
            <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Mis Visitas</h2>
                        <p className="text-sm text-gray-600">Gestiona tus visitas programadas</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex space-x-1 mt-4">
                    <button
                        onClick={() => setActiveTab('upcoming')}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === 'upcoming'
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Próximas ({upcomingVisits.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('past')}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === 'past'
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Historial ({pastVisits.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('canceled')}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === 'canceled'
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Canceladas ({canceledVisits.length})
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                <AnimatePresence mode="wait">
                    {/* Tab: Próximas visitas */}
                    {activeTab === 'upcoming' && (
                        <motion.div
                            key="upcoming"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-4"
                        >
                            {upcomingVisits.length === 0 ? (
                                <div className="text-center py-12">
                                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes visitas programadas</h3>
                                    <p className="text-gray-600">Agenda una visita para ver propiedades disponibles</p>
                                </div>
                            ) : (
                                upcomingVisits.map((visit) => (
                                    <VisitCard
                                        key={visit.id}
                                        visit={visit}
                                        onCancel={handleCancelVisit}
                                        showActions={true}
                                        formatDateTime={formatDateTime}
                                        getStatusColor={getStatusColor}
                                        getStatusText={getStatusText}
                                    />
                                ))
                            )}
                        </motion.div>
                    )}

                    {/* Tab: Historial */}
                    {activeTab === 'past' && (
                        <motion.div
                            key="past"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-4"
                        >
                            {pastVisits.length === 0 ? (
                                <div className="text-center py-12">
                                    <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No hay visitas completadas</h3>
                                    <p className="text-gray-600">Aquí aparecerán tus visitas realizadas</p>
                                </div>
                            ) : (
                                pastVisits.map((visit) => (
                                    <VisitCard
                                        key={visit.id}
                                        visit={visit}
                                        onCancel={handleCancelVisit}
                                        showActions={false}
                                        formatDateTime={formatDateTime}
                                        getStatusColor={getStatusColor}
                                        getStatusText={getStatusText}
                                    />
                                ))
                            )}
                        </motion.div>
                    )}

                    {/* Tab: Canceladas */}
                    {activeTab === 'canceled' && (
                        <motion.div
                            key="canceled"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-4"
                        >
                            {canceledVisits.length === 0 ? (
                                <div className="text-center py-12">
                                    <XCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No hay visitas canceladas</h3>
                                    <p className="text-gray-600">Aquí aparecerán las visitas que hayas cancelado</p>
                                </div>
                            ) : (
                                canceledVisits.map((visit) => (
                                    <VisitCard
                                        key={visit.id}
                                        visit={visit}
                                        onCancel={handleCancelVisit}
                                        showActions={false}
                                        formatDateTime={formatDateTime}
                                        getStatusColor={getStatusColor}
                                        getStatusText={getStatusText}
                                    />
                                ))
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

// Componente de tarjeta de visita
interface VisitCardProps {
    visit: VisitWithDetails;
    onCancel: (visitId: string) => void;
    showActions: boolean;
    formatDateTime: (dateString: string) => { date: string; time: string };
    getStatusColor: (status: string) => string;
    getStatusText: (status: string) => string;
}

function VisitCard({ visit, onCancel, showActions, formatDateTime, getStatusColor, getStatusText }: VisitCardProps) {
    const { date, time } = formatDateTime(visit.slotStartTime || '');

    return (
        <div className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(visit.status)}`}>
                            {getStatusText(visit.status)}
                        </span>
                        <span className="text-sm text-gray-500">
                            {new Date(visit.createdAt).toLocaleDateString('es-CL')}
                        </span>
                    </div>

                    {/* Propiedad */}
                    <h4 className="font-semibold text-gray-900 mb-1">
                        {visit.propertyName || 'Propiedad'}
                    </h4>
                    <p className="text-sm text-gray-600 mb-3 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {visit.propertyAddress || 'Dirección no disponible'}
                    </p>

                    {/* Fecha y hora */}
                    <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            {date}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4" />
                            {time}
                        </div>
                    </div>

                    {/* Agente */}
                    {visit.agent && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <User className="w-4 h-4" />
                            <span>{visit.agent.name}</span>
                            <span>•</span>
                            <span>{visit.agent.phone}</span>
                        </div>
                    )}
                </div>

                {/* Acciones */}
                {showActions && (
                    <div className="flex flex-col gap-2 ml-4">
                        <button
                            onClick={() => onCancel(visit.id)}
                            className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 border border-red-200 rounded-xl transition-colors"
                        >
                            Cancelar
                        </button>
                        {visit.agent?.whatsappNumber && (
                            <a
                                href={`https://wa.me/${visit.agent.whatsappNumber.replace('+', '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 text-sm text-green-600 hover:bg-green-50 border border-green-200 rounded-xl transition-colors flex items-center gap-2"
                            >
                                <MessageSquare className="w-4 h-4" />
                                WhatsApp
                            </a>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
