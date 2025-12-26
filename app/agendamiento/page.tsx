'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { VisitSchedulerModal } from '@components/flow/VisitSchedulerModal';
import { logger } from '@lib/logger';
import { Calendar, Clock, MapPin, User, Phone, CreditCard } from 'lucide-react';

export default function AgendamientoPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-100">
                <div className="max-w-4xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Sistema de Agendamiento</h1>
                                <p className="text-sm text-gray-600">Hommie - 0% Comisión</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-semibold transition-all shadow-lg hover:shadow-xl"
                        >
                            Probar Agendamiento
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-6 py-12">
                <div className="text-center mb-12">
                    <motion.h2
                        className="text-4xl font-bold text-gray-900 mb-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        Sistema de Agendamiento Moderno
                    </motion.h2>
                    <motion.p
                        className="text-xl text-gray-600 max-w-2xl mx-auto"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        Experiencia de usuario optimizada con cápsulas, animaciones suaves y validaciones robustas
                    </motion.p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                    <motion.div
                        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    >
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                            <Calendar className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Selección de Fecha</h3>
                        <p className="text-gray-600">Cápsulas interactivas para elegir el día de visita con animaciones suaves</p>
                    </motion.div>

                    <motion.div
                        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    >
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                            <Clock className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Horarios Disponibles</h3>
                        <p className="text-gray-600">Grid de horarios con disponibilidad en tiempo real y estados visuales claros</p>
                    </motion.div>

                    <motion.div
                        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                        whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    >
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                            <User className="w-6 h-6 text-purple-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Datos Obligatorios</h3>
                        <p className="text-gray-600">Validación en tiempo real de nombre, RUT y teléfono con feedback inmediato</p>
                    </motion.div>

                    <motion.div
                        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    >
                        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                            <MapPin className="w-6 h-6 text-orange-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Información de Propiedad</h3>
                        <p className="text-gray-600">Contexto visual de la propiedad durante todo el proceso de agendamiento</p>
                    </motion.div>

                    <motion.div
                        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.7 }}
                        whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    >
                        <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
                            <Phone className="w-6 h-6 text-red-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirmación</h3>
                        <p className="text-gray-600">Resumen completo de la visita con opción de modificar antes de confirmar</p>
                    </motion.div>

                    <motion.div
                        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.8 }}
                        whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    >
                        <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                            <CreditCard className="w-6 h-6 text-indigo-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Experiencia Móvil</h3>
                        <p className="text-gray-600">Diseño responsive optimizado para dispositivos móviles con gestos táctiles</p>
                    </motion.div>
                </div>

                {/* CTA Section */}
                <motion.div
                    className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 text-center text-white"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.9 }}
                >
                    <h3 className="text-2xl font-bold mb-4">¿Listo para probar?</h3>
                    <p className="text-blue-100 mb-6 max-w-md mx-auto">
                        Experimenta el sistema de agendamiento más moderno y eficiente para visitas de propiedades
                    </p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-2xl font-semibold transition-all shadow-lg hover:shadow-xl"
                    >
                        Iniciar Agendamiento
                    </button>
                </motion.div>
            </main>

            {/* Visit Scheduler Modal */}
            <VisitSchedulerModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                propertyId="demo-property"
                propertyName="Home Amengual - Unidad 207"
                propertyAddress="Av. Amengual 1234, Providencia"
                propertyImage="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                propertyDetails={{
                    bedrooms: 2,
                    bathrooms: 2,
                    parking: true,
                    area: 65,
                    price: 850000
                }}
                onConfirm={(date, time, leadData) => {
                    logger.log('Visita confirmada:', { date, time, leadData });
                    alert(`¡Visita agendada exitosamente!\n\nFecha: ${date}\nHora: ${time}\n\nTe contactaremos pronto.`);
                    setIsModalOpen(false);
                }}
            />
        </div>
    );
}
