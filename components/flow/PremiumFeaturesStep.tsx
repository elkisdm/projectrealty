'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
    Bell,
    MessageCircle,
    Calendar as CalendarIcon,
    BarChart3,
    Sparkles,
    Shield,
    Zap
} from 'lucide-react';

interface PremiumFeaturesStepProps {
    isDarkMode: boolean;
    notificationsEnabled: boolean;
    whatsappEnabled: boolean;
    calendarSyncEnabled: boolean;
    analyticsData: {
        conversionRate: number;
        avgTimeToComplete: number;
        userEngagement: number;
    };
    onRequestNotificationPermission: () => Promise<boolean>;
    onToggleWhatsApp: () => void;
    onToggleCalendar: () => void;
    onBack: () => void;
    onContinue: () => void;
}

export function PremiumFeaturesStep({
    isDarkMode,
    notificationsEnabled,
    whatsappEnabled,
    calendarSyncEnabled,
    analyticsData,
    onRequestNotificationPermission,
    onToggleWhatsApp,
    onToggleCalendar,
    onBack,
    onContinue
}: PremiumFeaturesStepProps) {
    const features = [
        {
            id: 'notifications',
            icon: Bell,
            title: 'Notificaciones Push',
            description: 'Recibe recordatorios automáticos 24h antes',
            color: 'from-blue-500 to-blue-600',
            bgColor: 'bg-blue-100',
            textColor: 'text-blue-700',
            borderColor: 'border-blue-200',
            enabled: notificationsEnabled,
            onToggle: onRequestNotificationPermission
        },
        {
            id: 'whatsapp',
            icon: MessageCircle,
            title: 'Confirmación WhatsApp',
            description: 'Recibe confirmación instantánea con detalles',
            color: 'from-green-500 to-green-600',
            bgColor: 'bg-green-100',
            textColor: 'text-green-700',
            borderColor: 'border-green-200',
            enabled: whatsappEnabled,
            onToggle: onToggleWhatsApp
        },
        {
            id: 'calendar',
            icon: CalendarIcon,
            title: 'Sincronizar Calendario',
            description: 'Agrega el evento a Google/Apple Calendar',
            color: 'from-purple-500 to-purple-600',
            bgColor: 'bg-purple-100',
            textColor: 'text-purple-700',
            borderColor: 'border-purple-200',
            enabled: calendarSyncEnabled,
            onToggle: onToggleCalendar
        },
        {
            id: 'analytics',
            icon: BarChart3,
            title: 'Analytics Avanzados',
            description: 'Seguimiento de tu experiencia',
            color: 'from-orange-500 to-orange-600',
            bgColor: 'bg-orange-100',
            textColor: 'text-orange-700',
            borderColor: 'border-orange-200',
            enabled: true,
            onToggle: () => {},
            isReadOnly: true
        }
    ];

    return (
        <motion.div
            key="premium"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="h-full flex flex-col"
        >
            {/* Header del paso */}
            <div className="text-center mb-6">
                <motion.div
                    className="flex items-center justify-center gap-2 mb-3"
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.05, duration: 0.1 }}
                >
                    <Sparkles className="w-6 h-6 text-yellow-500" />
                    <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Características Premium
                    </h3>
                    <Sparkles className="w-6 h-6 text-yellow-500" />
                </motion.div>
                <motion.p 
                    className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.1 }}
                >
                    Personaliza tu experiencia de agendamiento
                </motion.p>
            </div>

            {/* Características Premium */}
            <div className="flex-1 space-y-4">
                {features.map((feature, index) => (
                    <motion.div
                        key={feature.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + index * 0.03, duration: 0.1 }}
                        className={`p-4 rounded-2xl border-2 transition-all ${
                            isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
                        } hover:shadow-lg hover:scale-[1.02]`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center shadow-lg`}>
                                    <feature.icon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {feature.title}
                                    </h4>
                                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                            
                            {feature.isReadOnly ? (
                                <div className="text-right">
                                    <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {analyticsData.userEngagement} interacciones
                                    </div>
                                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Tiempo promedio: 2.3 min
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={feature.onToggle}
                                    className={`px-4 py-2 rounded-xl font-medium transition-all ${
                                        feature.enabled 
                                            ? `${feature.bgColor} ${feature.textColor} border-2 ${feature.borderColor}` 
                                            : `${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border-2 border-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-gray-200'}`
                                    }`}
                                >
                                    {feature.enabled ? '✅ Activado' : 'Activar'}
                                </button>
                            )}
                        </div>
                    </motion.div>
                ))}

                {/* Badge de seguridad */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.1 }}
                    className={`p-3 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                >
                    <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-green-600" />
                        <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Tus datos están protegidos con encriptación de nivel bancario
                        </span>
                    </div>
                </motion.div>
            </div>

            {/* Botones de navegación */}
            <motion.div 
                className="flex gap-3 mt-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.1 }}
            >
                <button
                    type="button"
                    onClick={onBack}
                    className={`flex-1 px-6 py-4 border ${isDarkMode ? 'border-gray-600 text-gray-200 hover:bg-gray-800' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} font-medium rounded-2xl transition-colors active:scale-95`}
                >
                    ← Atrás
                </button>
                <button
                    type="button"
                    onClick={onContinue}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-4 px-6 rounded-2xl transition-colors active:scale-95 shadow-lg flex items-center justify-center gap-2"
                >
                    <Zap className="w-4 h-4" />
                    Confirmar Visita ✨
                </button>
            </motion.div>
        </motion.div>
    );
}
