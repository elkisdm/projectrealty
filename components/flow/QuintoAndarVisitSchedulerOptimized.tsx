'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar,
    Clock,
    CheckCircle,
    AlertCircle,
    Loader2,
    X,
    Check,
    AlertTriangle,
    Sun,
    Moon
} from 'lucide-react';
import { useVisitScheduler } from '@/hooks/useVisitScheduler';
import { DaySlot, TimeSlot, ContactData, CreateVisitResponse } from '@/types/visit';
import { PremiumFeaturesStep } from './PremiumFeaturesStep';
import { logger } from '@lib/logger';

interface QuintoAndarVisitSchedulerProps {
    isOpen: boolean;
    onClose: () => void;
    listingId: string;
    propertyName: string;
    propertyAddress: string;
    propertyImage?: string;
    onSuccess?: (visitData: CreateVisitResponse) => void;
}

interface FieldValidation {
    name: { isValid: boolean; message: string };
    email: { isValid: boolean; message: string };
    rut: { isValid: boolean; message: string };
    phone: { isValid: boolean; message: string };
}

interface VisitData {
    date: string | null;
    time: string | null;
    name: string;
    phone: string;
    email: string;
}

export function QuintoAndarVisitScheduler({
    isOpen,
    onClose,
    listingId,
    propertyName,
    propertyAddress,
    propertyImage,
    onSuccess
}: QuintoAndarVisitSchedulerProps) {
    const [step, setStep] = useState<'selection' | 'contact' | 'premium' | 'success'>('selection');
    const [contactData, setContactData] = useState<ContactData>({
        name: '',
        email: '',
        rut: '',
        phone: ''
    });
    const [fieldValidation, setFieldValidation] = useState<FieldValidation>({
        name: { isValid: false, message: '' },
        email: { isValid: false, message: '' },
        rut: { isValid: false, message: '' },
        phone: { isValid: false, message: '' }
    });
    const [isFormValid, setIsFormValid] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    // Estados para características premium
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [whatsappEnabled, setWhatsappEnabled] = useState(false);
    const [calendarSyncEnabled, setCalendarSyncEnabled] = useState(false);
    const [analyticsData, setAnalyticsData] = useState({
        conversionRate: 0,
        avgTimeToComplete: 0,
        userEngagement: 0
    });

    const {
        isLoading,
        error,
        selectedDate,
        selectedTime,
        availableDays,
        availableSlots,
        fetchAvailability,
        selectDateTime,
        createVisit,
        clearError
    } = useVisitScheduler({ listingId });

    // Detectar modo oscuro del sistema
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        setIsDarkMode(mediaQuery.matches);

        const handleChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    // Cargar disponibilidad al abrir
    useEffect(() => {
        if (isOpen) {
            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + 7);
            fetchAvailability(startDate, endDate);
        }
    }, [isOpen, fetchAvailability]);

    // Validación en tiempo real
    useEffect(() => {
        const validateForm = () => {
            const newValidation: FieldValidation = {
                name: {
                    isValid: contactData.name.length >= 2,
                    message: contactData.name.length > 0 && contactData.name.length < 2 ? 'Nombre muy corto' : ''
                },
                email: {
                    isValid: contactData.email ? contactData.email.includes('@') && contactData.email.includes('.') : false,
                    message: contactData.email && !contactData.email.includes('@') ? 'Email inválido' : ''
                },
                rut: {
                    isValid: contactData.rut.length >= 8,
                    message: contactData.rut.length > 0 && contactData.rut.length < 8 ? 'RUT muy corto' : ''
                },
                phone: {
                    isValid: contactData.phone.length >= 8,
                    message: contactData.phone.length > 0 && contactData.phone.length < 8 ? 'Teléfono muy corto' : ''
                }
            };

            setFieldValidation(newValidation);
            setIsFormValid(
                newValidation.name.isValid &&
                newValidation.email.isValid &&
                newValidation.rut.isValid &&
                newValidation.phone.isValid
            );
        };

        validateForm();
    }, [contactData]);

    // Funciones para características premium
    const requestNotificationPermission = useCallback(async (): Promise<boolean> => {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            const granted = permission === 'granted';
            setNotificationsEnabled(granted);
            return granted;
        }
        return false;
    }, []);

    const sendWhatsAppConfirmation = useCallback((visitData: VisitData) => {
        const message = `Hola! Confirmo mi visita para ${visitData.date} a las ${visitData.time} en ${propertyName}.`;
        const whatsappUrl = `https://wa.me/56912345678?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    }, [propertyName]);

    const generateCalendarEvent = useCallback((visitData: VisitData) => {
        const startDate = new Date(`${visitData.date}T${visitData.time}`);
        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hora después

        const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Visita: ${propertyName}&dates=${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=Visita programada para ${propertyName} en ${propertyAddress}`;
        window.open(googleCalendarUrl, '_blank');
    }, [propertyName, propertyAddress]);

    const trackAnalytics = useCallback((event: string, data: VisitData) => {
        logger.log('Analytics:', event, data);
        setAnalyticsData(prev => ({
            ...prev,
            userEngagement: prev.userEngagement + 1
        }));
    }, []);

    // Manejar selección de fecha
    const handleDateSelect = (day: DaySlot) => {
        if (!day.available) return;
        selectDateTime(day.date, '');
        clearError();
    };

    // Manejar selección de hora
    const handleTimeSelect = (timeSlot: TimeSlot) => {
        if (!timeSlot.available) return;
        selectDateTime(selectedDate!, timeSlot.time);
        clearError();
    };

    // Verificar si se puede continuar
    const canContinue = selectedDate && selectedTime;

    // Continuar al formulario
    const handleContinue = () => {
        if (canContinue) {
            setStep('contact');
        }
    };

    // Continuar al éxito
    const handleContinueToSuccess = async () => {
        // Simular envío de datos
        const result = await createVisit({
            name: contactData.name,
            phone: contactData.phone,
            email: contactData.email
        });

        if (result) {
            setStep('success');

            // Características premium
            const visitData = {
                date: selectedDate,
                time: selectedTime,
                name: contactData.name,
                phone: contactData.phone,
                email: contactData.email
            };

            if (whatsappEnabled) {
                sendWhatsAppConfirmation(visitData);
            }

            if (calendarSyncEnabled) {
                generateCalendarEvent(visitData);
            }

            if (notificationsEnabled) {
                // Simular notificación programada
                setTimeout(() => {
                    new Notification('Recordatorio de visita', {
                        body: `Tu visita a ${propertyName} es en 1 hora`,
                        icon: propertyImage
                    });
                }, 1000);
            }

            trackAnalytics('visit_confirmed', visitData);
        }
    };

    // Regresar al paso anterior
    const handleBack = () => {
        if (step === 'contact') {
            setStep('selection');
        } else if (step === 'premium') {
            setStep('contact');
        } else if (step === 'success') {
            setStep('premium');
        }
    };

    // Manejar envío del formulario
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) return;

        const result = await createVisit({
            name: contactData.name,
            phone: contactData.phone,
            email: contactData.email
        });

        if (result) {
            setShowConfetti(true);
            setStep('success');
            onSuccess?.(result);

            // Características premium
            const visitData = {
                date: selectedDate,
                time: selectedTime,
                name: contactData.name,
                phone: contactData.phone,
                email: contactData.email
            };

            if (whatsappEnabled) {
                sendWhatsAppConfirmation(visitData);
            }

            if (calendarSyncEnabled) {
                generateCalendarEvent(visitData);
            }

            if (notificationsEnabled) {
                setTimeout(() => {
                    new Notification('Recordatorio de visita', {
                        body: `Tu visita a ${propertyName} es en 1 hora`,
                        icon: propertyImage
                    });
                }, 1000);
            }

            trackAnalytics('visit_confirmed', visitData);
        }
    };

    // Manejar cierre
    const handleClose = () => {
        setStep('selection');
        setShowConfetti(false);
        onClose();
    };

    // Información del paso actual
    const getStepInfo = (step: string) => {
        switch (step) {
            case 'selection':
                return { number: 1, title: 'Selecciona fecha y hora', description: 'Elige el mejor momento para tu visita' };
            case 'contact':
                return { number: 2, title: 'Datos de contacto', description: 'Completa tu información' };
            case 'premium':
                return { number: 3, title: 'Características premium', description: 'Mejora tu experiencia' };
            case 'success':
                return { number: 4, title: '¡Visita confirmada!', description: 'Todo listo para tu visita' };
            default:
                return { number: 1, title: 'Agendar visita', description: 'Programa tu visita' };
        }
    };

    const stepInfo = getStepInfo(step);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={handleClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className={`relative w-full max-w-md h-[90vh] ${isDarkMode ? 'bg-gray-900' : 'bg-white'} rounded-2xl shadow-2xl overflow-hidden`}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleClose}
                                    className={`p-2 rounded-xl ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors`}
                                    aria-label="Cerrar"
                                >
                                    <X className={`w-5 h-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`} />
                                </button>
                                <div>
                                    <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {propertyName}
                                    </h2>
                                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {propertyAddress}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsDarkMode(!isDarkMode)}
                                className={`p-2 rounded-xl ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors`}
                                aria-label="Cambiar tema"
                            >
                                {isDarkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-600" />}
                            </button>
                        </div>

                        {/* Progress bar */}
                        <div className="flex items-center gap-2 mb-2">
                            {[1, 2, 3, 4].map((stepNumber) => (
                                <div
                                    key={stepNumber}
                                    className={`flex-1 h-2 rounded-full ${stepNumber <= stepInfo.number
                                        ? 'bg-blue-600'
                                        : isDarkMode
                                            ? 'bg-gray-700'
                                            : 'bg-gray-200'
                                        }`}
                                />
                            ))}
                        </div>
                        <div className="flex items-center justify-between">
                            <h3 className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {stepInfo.title}
                            </h3>
                            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {stepInfo.number}/4
                            </span>
                        </div>
                        <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {stepInfo.description}
                        </p>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-4 overflow-y-auto">
                        {/* Step 1: Selección de fecha y hora */}
                        {step === 'selection' && (
                            <div className="h-full flex flex-col">
                                {/* Selección de fecha */}
                                <div className="mb-6">
                                    <h4 className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4 flex items-center gap-2`}>
                                        <Calendar className="w-5 h-5 text-blue-600" />
                                        Fecha
                                    </h4>
                                    <div className="grid grid-cols-5 gap-2">
                                        {availableDays.map((day) => (
                                            <button
                                                key={day.id}
                                                onClick={() => handleDateSelect(day)}
                                                disabled={!day.available}
                                                className={`p-3 rounded-xl text-center transition-colors ${selectedDate === day.date
                                                    ? 'bg-blue-600 text-white'
                                                    : day.available
                                                        ? isDarkMode
                                                            ? 'bg-gray-800 text-white hover:bg-gray-700'
                                                            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                                                        : isDarkMode
                                                            ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    }`}
                                            >
                                                <div className="text-xs font-medium">{day.day}</div>
                                                <div className="text-lg font-bold">{day.number}</div>
                                                {day.available && (
                                                    <div className="flex justify-center mt-1">
                                                        <Check className="w-2.5 h-2.5 text-white" />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Selección de hora */}
                                {selectedDate && (
                                    <div className="mb-6">
                                        <h4 className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4 flex items-center gap-2`}>
                                            <Clock className="w-5 h-5 text-green-600" />
                                            Hora
                                        </h4>
                                        <div className="grid grid-cols-2 gap-2">
                                            {availableSlots.map((timeSlot) => (
                                                <button
                                                    key={timeSlot.id}
                                                    onClick={() => handleTimeSelect(timeSlot)}
                                                    disabled={!timeSlot.available}
                                                    className={`p-3 rounded-xl text-center transition-colors ${selectedTime === timeSlot.time
                                                        ? 'bg-green-600 text-white'
                                                        : timeSlot.available
                                                            ? isDarkMode
                                                                ? 'bg-gray-800 text-white hover:bg-gray-700'
                                                                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                                                            : isDarkMode
                                                                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                        }`}
                                                >
                                                    {timeSlot.time}
                                                    {selectedTime === timeSlot.time && (
                                                        <div className="flex justify-center mt-1">
                                                            <Check className="w-2.5 h-2.5 text-white" />
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Botón continuar */}
                                <div className="mt-auto pt-4">
                                    <button
                                        onClick={handleContinue}
                                        disabled={!canContinue}
                                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-2xl transition-colors text-lg touch-manipulation disabled:cursor-not-allowed active:scale-95 shadow-lg"
                                    >
                                        Continuar →
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Formulario de contacto */}
                        {step === 'contact' && (
                            <div className="h-full flex flex-col">
                                <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
                                    <div className="space-y-4 mb-6">
                                        {/* Nombre */}
                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                Nombre completo *
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={contactData.name}
                                                    onChange={(e) => setContactData(prev => ({ ...prev, name: e.target.value }))}
                                                    className={`w-full p-3 rounded-xl border-2 transition-colors ${fieldValidation.name.isValid
                                                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                                        : fieldValidation.name.message
                                                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                                            : isDarkMode
                                                                ? 'border-gray-600 bg-gray-800 text-white focus:border-blue-500'
                                                                : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500'
                                                        }`}
                                                    placeholder="Tu nombre completo"
                                                />
                                                {fieldValidation.name.isValid && (
                                                    <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-600" />
                                                )}
                                                {fieldValidation.name.message && (
                                                    <AlertTriangle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500" />
                                                )}
                                            </div>
                                            {fieldValidation.name.message && (
                                                <p className="text-red-500 text-sm mt-1">{fieldValidation.name.message}</p>
                                            )}
                                        </div>

                                        {/* Email */}
                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                Email *
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="email"
                                                    value={contactData.email}
                                                    onChange={(e) => setContactData(prev => ({ ...prev, email: e.target.value }))}
                                                    className={`w-full p-3 rounded-xl border-2 transition-colors ${fieldValidation.email.isValid
                                                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                                        : fieldValidation.email.message
                                                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                                            : isDarkMode
                                                                ? 'border-gray-600 bg-gray-800 text-white focus:border-blue-500'
                                                                : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500'
                                                        }`}
                                                    placeholder="tu@email.com"
                                                />
                                                {fieldValidation.email.isValid && (
                                                    <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-600" />
                                                )}
                                                {fieldValidation.email.message && (
                                                    <AlertTriangle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500" />
                                                )}
                                            </div>
                                            {fieldValidation.email.message && (
                                                <p className="text-red-500 text-sm mt-1">{fieldValidation.email.message}</p>
                                            )}
                                        </div>

                                        {/* RUT */}
                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                RUT *
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={contactData.rut}
                                                    onChange={(e) => setContactData(prev => ({ ...prev, rut: e.target.value }))}
                                                    className={`w-full p-3 rounded-xl border-2 transition-colors ${fieldValidation.rut.isValid
                                                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                                        : fieldValidation.rut.message
                                                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                                            : isDarkMode
                                                                ? 'border-gray-600 bg-gray-800 text-white focus:border-blue-500'
                                                                : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500'
                                                        }`}
                                                    placeholder="12.345.678-9"
                                                />
                                                {fieldValidation.rut.isValid && (
                                                    <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-600" />
                                                )}
                                                {fieldValidation.rut.message && (
                                                    <AlertTriangle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500" />
                                                )}
                                            </div>
                                            {fieldValidation.rut.message && (
                                                <p className="text-red-500 text-sm mt-1">{fieldValidation.rut.message}</p>
                                            )}
                                        </div>

                                        {/* Teléfono */}
                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                Teléfono *
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="tel"
                                                    value={contactData.phone}
                                                    onChange={(e) => setContactData(prev => ({ ...prev, phone: e.target.value }))}
                                                    className={`w-full p-3 rounded-xl border-2 transition-colors ${fieldValidation.phone.isValid
                                                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                                        : fieldValidation.phone.message
                                                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                                            : isDarkMode
                                                                ? 'border-gray-600 bg-gray-800 text-white focus:border-blue-500'
                                                                : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500'
                                                        }`}
                                                    placeholder="+56 9 1234 5678"
                                                />
                                                {fieldValidation.phone.isValid && (
                                                    <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-600" />
                                                )}
                                                {fieldValidation.phone.message && (
                                                    <AlertTriangle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500" />
                                                )}
                                            </div>
                                            {fieldValidation.phone.message && (
                                                <p className="text-red-500 text-sm mt-1">{fieldValidation.phone.message}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Botones de navegación */}
                                    <div className="mt-auto pt-4 space-y-3">
                                        <button
                                            type="button"
                                            onClick={handleBack}
                                            className={`w-full py-3 px-6 rounded-xl font-semibold transition-colors ${isDarkMode
                                                ? 'bg-gray-800 text-white hover:bg-gray-700'
                                                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                                                }`}
                                        >
                                            ← Atrás
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={!isFormValid || isLoading}
                                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-2xl transition-colors text-lg touch-manipulation disabled:cursor-not-allowed active:scale-95 shadow-lg flex items-center justify-center gap-2"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    Procesando...
                                                </>
                                            ) : (
                                                'Continuar →'
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Step 3: Características premium */}
                        {step === 'premium' && (
                            <PremiumFeaturesStep
                                isDarkMode={isDarkMode}
                                notificationsEnabled={notificationsEnabled}
                                whatsappEnabled={whatsappEnabled}
                                calendarSyncEnabled={calendarSyncEnabled}
                                analyticsData={analyticsData}
                                onRequestNotificationPermission={requestNotificationPermission}
                                onToggleWhatsApp={() => setWhatsappEnabled(!whatsappEnabled)}
                                onToggleCalendar={() => setCalendarSyncEnabled(!calendarSyncEnabled)}
                                onBack={handleBack}
                                onContinue={handleContinueToSuccess}
                            />
                        )}

                        {/* Step 4: Éxito */}
                        {step === 'success' && (
                            <div className="h-full flex flex-col items-center justify-center text-center">
                                {/* Confeti animado */}
                                {showConfetti && (
                                    <div className="absolute inset-0 pointer-events-none">
                                        {[...Array(20)].map((_, i) => (
                                            <motion.div
                                                key={i}
                                                className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                                                initial={{
                                                    x: Math.random() * window.innerWidth,
                                                    y: -10,
                                                    rotate: 0
                                                }}
                                                animate={{
                                                    y: window.innerHeight + 10,
                                                    rotate: 360
                                                }}
                                                transition={{
                                                    duration: 1.5 + Math.random() * 0.5,
                                                    delay: Math.random() * 0.2,
                                                    ease: "easeOut"
                                                }}
                                            />
                                        ))}
                                    </div>
                                )}

                                <motion.div
                                    initial={{ scale: 0.98 }}
                                    animate={{ scale: 1 }}
                                    transition={{ duration: 0.2 }}
                                    className="mb-6"
                                >
                                    <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                                </motion.div>

                                <h3 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    ¡Visita confirmada!
                                </h3>
                                <p className={`text-base mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Tu visita ha sido programada exitosamente. Te contactaremos pronto con los detalles.
                                </p>

                                <div className={`p-4 rounded-xl mb-6 w-full ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                                    <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        Detalles de la visita:
                                    </h4>
                                    <div className="space-y-1 text-sm">
                                        <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                                            <strong>Fecha:</strong> {selectedDate}
                                        </p>
                                        <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                                            <strong>Hora:</strong> {selectedTime}
                                        </p>
                                        <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                                            <strong>Propiedad:</strong> {propertyName}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={handleClose}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-2xl transition-colors text-lg touch-manipulation active:scale-95 shadow-lg"
                                >
                                    Cerrar
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700 bg-red-900/20' : 'border-gray-200 bg-red-50'}`}>
                            <div className="flex items-center gap-2 text-red-600">
                                <AlertCircle className="w-5 h-5" />
                                <span className="text-sm">{error}</span>
                            </div>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
