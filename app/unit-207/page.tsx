'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { VisitSchedulerModal } from '@components/flow/VisitSchedulerModal';
import { logger } from '@lib/logger';
import { Calendar, Clock, MapPin, User, Star, Bed, Bath, Car, Square, Home } from 'lucide-react';

export default function Unit207Page() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Mock data para la unidad 207
    const unitData = {
        id: "unit-207",
        name: "Home Amengual - Unidad 207",
        address: "Av. Amengual 1234, Providencia, Santiago",
        image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        details: {
            bedrooms: 2,
            bathrooms: 2,
            parking: true,
            area: 65,
            price: 850000,
            floor: 2,
            orientation: "Norte",
            balcony: true
        },
        features: [
            "Cocina equipada",
            "Closet empotrado",
            "Balcón privado",
            "Estacionamiento incluido",
            "Bodega",
            "Piscina",
            "Gimnasio",
            "Seguridad 24/7"
        ],
        availability: "Disponible",
        promotion: "50% OFF en gastos comunes por 6 meses"
    };

    const formatPrice = (price: number): string => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-100">
                <div className="max-w-6xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                <Home className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Unidad 207 - Demo</h1>
                                <p className="text-sm text-gray-600">Sistema de Agendamiento Premium</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-2xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                        >
                            <Calendar className="w-4 h-4" />
                            Agendar Visita
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-6 py-12">
                {/* Hero Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                    {/* Imagen */}
                    <motion.div
                        className="relative"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="relative h-96 lg:h-[500px] rounded-3xl overflow-hidden shadow-2xl">
                            <img
                                src={unitData.image}
                                alt={unitData.name}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                            {/* Badge de promoción */}
                            <div className="absolute top-4 left-4">
                                <div className="bg-purple-500 text-white px-3 py-1 rounded-lg text-sm font-medium">
                                    50% OFF
                                </div>
                            </div>

                            {/* Badge de disponibilidad */}
                            <div className="absolute top-4 right-4">
                                <div className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm font-medium">
                                    Disponible
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Información */}
                    <motion.div
                        className="flex flex-col justify-center"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <div className="mb-6">
                            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                                {unitData.name}
                            </h1>
                            <div className="flex items-center gap-2 text-gray-600 mb-4">
                                <MapPin className="w-5 h-5" />
                                <span className="text-lg">{unitData.address}</span>
                            </div>
                        </div>

                        {/* Precio */}
                        <div className="mb-8">
                            <div className="text-3xl font-bold text-green-600 mb-2">
                                {formatPrice(unitData.details.price)}
                            </div>
                            <p className="text-sm text-gray-600">{unitData.promotion}</p>
                        </div>

                        {/* Características principales */}
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Características principales</h3>
                            <div className="flex flex-wrap gap-3">
                                <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-gray-200/50 px-3 py-1.5 rounded-xl text-sm font-medium">
                                    <Bed className="w-4 h-4" />
                                    {unitData.details.bedrooms}D
                                </div>
                                <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-gray-200/50 px-3 py-1.5 rounded-xl text-sm font-medium">
                                    <Bath className="w-4 h-4" />
                                    {unitData.details.bathrooms}B
                                </div>
                                <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-gray-200/50 px-3 py-1.5 rounded-xl text-sm font-medium">
                                    <Square className="w-4 h-4" />
                                    {unitData.details.area}m²
                                </div>
                                {unitData.details.parking && (
                                    <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-gray-200/50 px-3 py-1.5 rounded-xl text-sm font-medium">
                                        <Car className="w-4 h-4" />
                                        1V
                                    </div>
                                )}
                                <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-gray-200/50 px-3 py-1.5 rounded-xl text-sm font-medium">
                                    Piso {unitData.details.floor}
                                </div>
                                <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-gray-200/50 px-3 py-1.5 rounded-xl text-sm font-medium">
                                    {unitData.details.orientation}
                                </div>
                            </div>
                        </div>

                        {/* CTA Principal */}
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all shadow-lg hover:shadow-xl text-lg flex items-center justify-center gap-3"
                        >
                            <Calendar className="w-5 h-5" />
                            Agendar Visita Premium
                        </button>
                    </motion.div>
                </div>

                {/* Features Grid */}
                <motion.div
                    className="mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
                        ¿Por qué elegir esta unidad?
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {unitData.features.map((feature, index) => (
                            <motion.div
                                key={feature}
                                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                            >
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                                    <Star className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature}</h3>
                                <p className="text-gray-600">Incluido en el precio de la unidad</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Sistema de Agendamiento */}
                <motion.div
                    className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 text-center text-white"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                >
                    <h3 className="text-3xl font-bold mb-4">Sistema de Agendamiento Premium</h3>
                    <p className="text-blue-100 mb-8 max-w-2xl mx-auto text-lg">
                        Experimenta el sistema de agendamiento más moderno y eficiente.
                        Calendario inteligente, horarios premium y reserva instantánea.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                            <Calendar className="w-8 h-8 text-white mb-3 mx-auto" />
                            <h4 className="font-semibold mb-2">Calendario Inteligente</h4>
                            <p className="text-blue-100 text-sm">Navegación mensual con disponibilidad visual</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                            <Clock className="w-8 h-8 text-white mb-3 mx-auto" />
                            <h4 className="font-semibold mb-2">Horarios Premium</h4>
                            <p className="text-blue-100 text-sm">Bloques organizados con reserva instantánea</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                            <User className="w-8 h-8 text-white mb-3 mx-auto" />
                            <h4 className="font-semibold mb-2">Auto-save</h4>
                            <p className="text-blue-100 text-sm">Tus datos se guardan automáticamente</p>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-2xl font-semibold transition-all shadow-lg hover:shadow-xl text-lg"
                    >
                        Probar Sistema Premium
                    </button>
                </motion.div>
            </main>

            {/* Visit Scheduler Modal */}
            <VisitSchedulerModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                propertyId={unitData.id}
                propertyName={unitData.name}
                propertyAddress={unitData.address}
                propertyImage={unitData.image}
                propertyDetails={unitData.details}
                onConfirm={(date, time, leadData) => {
                    logger.log('Visita confirmada:', { date, time, leadData });
                    alert(`¡Visita agendada exitosamente!\n\nFecha: ${date}\nHora: ${time}\n\nTe contactaremos pronto.`);
                    setIsModalOpen(false);
                }}
            />
        </div>
    );
}
