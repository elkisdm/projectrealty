'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    LiquidCapsule,
    TitleLiquidCapsule,
    PriceLiquidCapsule,
    StatusLiquidCapsule,
    FeatureLiquidCapsule,
    BadgeLiquidCapsule
} from '@components/ui/LiquidCapsule';
import {
    Home,
    Bed,
    Bath,
    Car,
    Square,
    MapPin,
    Star,
    Heart,
    Eye,
    Calendar,
    Phone,
    Mail,
    CheckCircle,
    AlertCircle,
    Info,
    Zap
} from 'lucide-react';

export default function LiquidCapsulesDemoPage() {
    const [selectedCapsule, setSelectedCapsule] = useState<string | null>(null);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-100/50">
                <div className="max-w-6xl mx-auto px-6 py-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                            <Zap className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Liquid Capsules</h1>
                            <p className="text-gray-600">Sistema de cápsulas con estilo liquid glass</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-6 py-12">
                {/* Hero Section */}
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <TitleLiquidCapsule className="mb-4">
                        Sistema de Liquid Capsules
                    </TitleLiquidCapsule>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Cápsulas elegantes con estilo liquid glass perfectamente integradas para mostrar información relevante de forma sofisticada
                    </p>
                </motion.div>

                {/* Variants Section */}
                <section className="mb-16">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8">Variantes Base</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <motion.div
                            className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 border border-gray-200/50"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                        >
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Default</h3>
                            <div className="space-y-3">
                                <LiquidCapsule>Cápsula Default</LiquidCapsule>
                                <LiquidCapsule icon={Home}>Con Icono</LiquidCapsule>
                                <LiquidCapsule onClick={() => alert('¡Click!')}>Clickeable</LiquidCapsule>
                            </div>
                        </motion.div>

                        <motion.div
                            className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 border border-gray-200/50"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Primary</h3>
                            <div className="space-y-3">
                                <LiquidCapsule variant="primary">Cápsula Primary</LiquidCapsule>
                                <LiquidCapsule variant="primary" icon={Star}>Destacado</LiquidCapsule>
                                <LiquidCapsule variant="primary" size="lg">Tamaño Grande</LiquidCapsule>
                            </div>
                        </motion.div>

                        <motion.div
                            className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 border border-gray-200/50"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                        >
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Success</h3>
                            <div className="space-y-3">
                                <LiquidCapsule variant="success">Cápsula Success</LiquidCapsule>
                                <LiquidCapsule variant="success" icon={CheckCircle}>Completado</LiquidCapsule>
                                <LiquidCapsule variant="success" size="sm">Pequeña</LiquidCapsule>
                            </div>
                        </motion.div>

                        <motion.div
                            className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 border border-gray-200/50"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                        >
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Warning</h3>
                            <div className="space-y-3">
                                <LiquidCapsule variant="warning">Cápsula Warning</LiquidCapsule>
                                <LiquidCapsule variant="warning" icon={AlertCircle}>Atención</LiquidCapsule>
                                <LiquidCapsule variant="warning" disabled>Deshabilitada</LiquidCapsule>
                            </div>
                        </motion.div>

                        <motion.div
                            className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 border border-gray-200/50"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.5 }}
                        >
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Error</h3>
                            <div className="space-y-3">
                                <LiquidCapsule variant="error">Cápsula Error</LiquidCapsule>
                                <LiquidCapsule variant="error" icon={AlertCircle}>Error</LiquidCapsule>
                                <LiquidCapsule variant="error" size="lg">Error Grande</LiquidCapsule>
                            </div>
                        </motion.div>

                        <motion.div
                            className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 border border-gray-200/50"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.6 }}
                        >
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Info</h3>
                            <div className="space-y-3">
                                <LiquidCapsule variant="info">Cápsula Info</LiquidCapsule>
                                <LiquidCapsule variant="info" icon={Info}>Información</LiquidCapsule>
                                <LiquidCapsule variant="info" animate={false}>Sin Animación</LiquidCapsule>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Specialized Capsules Section */}
                <section className="mb-16">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8">Cápsulas Especializadas</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <motion.div
                            className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 border border-gray-200/50"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.7 }}
                        >
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Títulos</h3>
                            <div className="space-y-3">
                                <TitleLiquidCapsule>Home Amengual</TitleLiquidCapsule>
                                <TitleLiquidCapsule>Unidad 207</TitleLiquidCapsule>
                                <TitleLiquidCapsule>2D2B Premium</TitleLiquidCapsule>
                            </div>
                        </motion.div>

                        <motion.div
                            className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 border border-gray-200/50"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.8 }}
                        >
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Precios</h3>
                            <div className="space-y-3">
                                <PriceLiquidCapsule price={850000} />
                                <PriceLiquidCapsule price={1200000} />
                                <PriceLiquidCapsule price={650000} />
                            </div>
                        </motion.div>

                        <motion.div
                            className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 border border-gray-200/50"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.9 }}
                        >
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Estados</h3>
                            <div className="space-y-3">
                                <StatusLiquidCapsule status="available" />
                                <StatusLiquidCapsule status="pending" />
                                <StatusLiquidCapsule status="reserved" />
                                <StatusLiquidCapsule status="sold" />
                            </div>
                        </motion.div>

                        <motion.div
                            className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 border border-gray-200/50"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 1.0 }}
                        >
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Características</h3>
                            <div className="space-y-3">
                                <FeatureLiquidCapsule feature="2 Dormitorios" icon={Bed} />
                                <FeatureLiquidCapsule feature="2 Baños" icon={Bath} />
                                <FeatureLiquidCapsule feature="1 Estacionamiento" icon={Car} />
                                <FeatureLiquidCapsule feature="65 m²" icon={Square} />
                            </div>
                        </motion.div>

                        <motion.div
                            className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 border border-gray-200/50"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 1.1 }}
                        >
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Badges</h3>
                            <div className="space-y-3">
                                <BadgeLiquidCapsule badge="Nuevo" />
                                <BadgeLiquidCapsule badge="Premium" />
                                <BadgeLiquidCapsule badge="0% Comisión" />
                                <BadgeLiquidCapsule badge="Vista Ciudad" />
                            </div>
                        </motion.div>

                        <motion.div
                            className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 border border-gray-200/50"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 1.2 }}
                        >
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Interactivas</h3>
                            <div className="space-y-3">
                                <LiquidCapsule
                                    variant="primary"
                                    icon={Heart}
                                    onClick={() => setSelectedCapsule('favorite')}
                                    className={selectedCapsule === 'favorite' ? 'ring-2 ring-blue-500' : ''}
                                >
                                    Favorito
                                </LiquidCapsule>
                                <LiquidCapsule
                                    variant="info"
                                    icon={Eye}
                                    onClick={() => setSelectedCapsule('view')}
                                    className={selectedCapsule === 'view' ? 'ring-2 ring-cyan-500' : ''}
                                >
                                    Ver Detalles
                                </LiquidCapsule>
                                <LiquidCapsule
                                    variant="success"
                                    icon={Calendar}
                                    onClick={() => setSelectedCapsule('schedule')}
                                    className={selectedCapsule === 'schedule' ? 'ring-2 ring-green-500' : ''}
                                >
                                    Agendar Visita
                                </LiquidCapsule>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Real Estate Example */}
                <section className="mb-16">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8">Ejemplo: Propiedad Inmobiliaria</h2>
                    <motion.div
                        className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-gray-200/50"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 1.3 }}
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Property Info */}
                            <div className="space-y-6">
                                <div>
                                    <TitleLiquidCapsule className="mb-3">
                                        Home Amengual - Unidad 207
                                    </TitleLiquidCapsule>
                                    <div className="flex items-center gap-2 mb-4">
                                        <MapPin className="w-4 h-4 text-gray-500" />
                                        <span className="text-gray-600">Av. Amengual 1234, Providencia</span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <PriceLiquidCapsule price={850000} />
                                    <StatusLiquidCapsule status="available" />
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <FeatureLiquidCapsule feature="2D" icon={Bed} />
                                    <FeatureLiquidCapsule feature="2B" icon={Bath} />
                                    <FeatureLiquidCapsule feature="1V" icon={Car} />
                                    <FeatureLiquidCapsule feature="65m²" icon={Square} />
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <BadgeLiquidCapsule badge="Nuevo" />
                                    <BadgeLiquidCapsule badge="Premium" />
                                    <BadgeLiquidCapsule badge="0% Comisión" />
                                </div>
                            </div>

                            {/* Contact Actions */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900">Acciones</h3>
                                <div className="space-y-3">
                                    <LiquidCapsule
                                        variant="primary"
                                        icon={Phone}
                                        size="lg"
                                        onClick={() => alert('Llamando...')}
                                    >
                                        Llamar Ahora
                                    </LiquidCapsule>
                                    <LiquidCapsule
                                        variant="success"
                                        icon={Calendar}
                                        size="lg"
                                        onClick={() => alert('Abriendo agenda...')}
                                    >
                                        Agendar Visita
                                    </LiquidCapsule>
                                    <LiquidCapsule
                                        variant="info"
                                        icon={Mail}
                                        size="lg"
                                        onClick={() => alert('Enviando email...')}
                                    >
                                        Solicitar Información
                                    </LiquidCapsule>
                                    <LiquidCapsule
                                        variant="default"
                                        icon={Heart}
                                        size="lg"
                                        onClick={() => alert('Agregado a favoritos')}
                                    >
                                        Agregar a Favoritos
                                    </LiquidCapsule>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </section>

                {/* Interactive Demo */}
                <section>
                    <h2 className="text-2xl font-bold text-gray-900 mb-8">Demo Interactivo</h2>
                    <motion.div
                        className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-gray-200/50"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 1.4 }}
                    >
                        <div className="text-center mb-6">
                            <p className="text-gray-600 mb-4">Haz clic en las cápsulas para ver las animaciones</p>
                            <div className="flex flex-wrap justify-center gap-3">
                                <LiquidCapsule
                                    variant="primary"
                                    icon={Star}
                                    onClick={() => alert('¡Cápsula Primary clickeada!')}
                                >
                                    Primary
                                </LiquidCapsule>
                                <LiquidCapsule
                                    variant="success"
                                    icon={CheckCircle}
                                    onClick={() => alert('¡Cápsula Success clickeada!')}
                                >
                                    Success
                                </LiquidCapsule>
                                <LiquidCapsule
                                    variant="warning"
                                    icon={AlertCircle}
                                    onClick={() => alert('¡Cápsula Warning clickeada!')}
                                >
                                    Warning
                                </LiquidCapsule>
                                <LiquidCapsule
                                    variant="error"
                                    icon={AlertCircle}
                                    onClick={() => alert('¡Cápsula Error clickeada!')}
                                >
                                    Error
                                </LiquidCapsule>
                                <LiquidCapsule
                                    variant="info"
                                    icon={Info}
                                    onClick={() => alert('¡Cápsula Info clickeada!')}
                                >
                                    Info
                                </LiquidCapsule>
                            </div>
                        </div>
                    </motion.div>
                </section>
            </main>
        </div>
    );
}
