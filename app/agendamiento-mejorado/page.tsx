'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { QuintoAndarVisitScheduler } from '@components/flow/QuintoAndarVisitScheduler';
import { UserVisitsPanel } from '@components/flow/UserVisitsPanel';
import { Calendar, Clock, MapPin, User, Phone, MessageSquare, CheckCircle } from 'lucide-react';

export default function AgendamientoMejoradoPage() {
    const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
    const [lastVisitData, setLastVisitData] = useState<unknown>(null);

    const handleVisitSuccess = (visitData: unknown) => {
        setLastVisitData(visitData);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                                <Calendar className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Sistema de Agendamiento Mejorado</h1>
                                <p className="text-gray-600">Inspirado en QuintoAndar - Hommie 0% Comisión</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsSchedulerOpen(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                        >
                            <Calendar className="w-5 h-5" />
                            Agendar Visita
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Panel de visitas del usuario */}
                    <div className="lg:col-span-2">
                        <UserVisitsPanel userId="user_001" />
                    </div>

                    {/* Sidebar con información y estadísticas */}
                    <div className="space-y-6">
                        {/* Información de la propiedad */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                    <MapPin className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Home Amengual</h3>
                                    <p className="text-sm text-gray-600">Unidad 207</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <MapPin className="w-4 h-4" />
                                    <span>Av. Amengual 1234, Providencia</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <User className="w-4 h-4" />
                                    <span>María González</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Phone className="w-4 h-4" />
                                    <span>+56 9 1234 5678</span>
                                </div>
                            </div>
                        </div>

                        {/* Estadísticas rápidas */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Estadísticas</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Visitas programadas</span>
                                    <span className="font-semibold text-blue-600">2</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Visitas completadas</span>
                                    <span className="font-semibold text-green-600">1</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Tasa de asistencia</span>
                                    <span className="font-semibold text-purple-600">100%</span>
                                </div>
                            </div>
                        </div>

                        {/* Acciones rápidas */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
                            <div className="space-y-3">
                                <button
                                    onClick={() => setIsSchedulerOpen(true)}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 justify-center"
                                >
                                    <Calendar className="w-4 h-4" />
                                    Nueva Visita
                                </button>
                                <a
                                    href="https://wa.me/56912345678"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 justify-center"
                                >
                                    <MessageSquare className="w-4 h-4" />
                                    Contactar Agente
                                </a>
                            </div>
                        </div>

                        {/* Última visita confirmada */}
                        {lastVisitData && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-green-50 border border-green-200 rounded-2xl p-6"
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                    <h3 className="font-semibold text-green-800">¡Visita Confirmada!</h3>
                                </div>
                                <p className="text-sm text-green-700 mb-3">
                                    Tu visita ha sido programada exitosamente. Te hemos enviado una confirmación por WhatsApp.
                                </p>
                                <div className="text-xs text-green-600">
                                    <p>ID: {lastVisitData.visitId}</p>
                                    <p>Agente: {lastVisitData.agent.name}</p>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Características del sistema */}
                <div className="mt-16">
                    <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">
                        Características del Sistema Mejorado
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center"
                        >
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <Calendar className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Calendario de 5 Días</h3>
                            <p className="text-sm text-gray-600">
                                Solo días laborales disponibles con slots de 30 minutos
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center"
                        >
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Idempotencia</h3>
                            <p className="text-sm text-gray-600">
                                Prevención de dobles reservas con transacciones seguras
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center"
                        >
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <MessageSquare className="w-6 h-6 text-purple-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">WhatsApp Integration</h3>
                            <p className="text-sm text-gray-600">
                                Confirmaciones y recordatorios automáticos por WhatsApp
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center"
                        >
                            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <Clock className="w-6 h-6 text-orange-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Optimistic UI</h3>
                            <p className="text-sm text-gray-600">
                                Respuesta inmediata con rollback automático en errores
                            </p>
                        </motion.div>
                    </div>
                </div>
            </main>

            {/* Modal de agendamiento */}
            <QuintoAndarVisitScheduler
                isOpen={isSchedulerOpen}
                onClose={() => setIsSchedulerOpen(false)}
                listingId="home-amengual"
                propertyName="Home Amengual - Unidad 207"
                propertyAddress="Av. Amengual 1234, Providencia"
                onSuccess={handleVisitSuccess}
            />
        </div>
    );
}
