"use client";

import React, { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, MapPin, CheckCircle, X, ChevronLeft, Phone, MessageCircle, Shield } from "lucide-react";
import { track } from "@lib/analytics";
import { LeadLiteForm } from "./LeadLiteForm";

interface TimeSlot {
    id: string;
    time: string;
    available: boolean;
    label?: string;
}

interface DateSlot {
    date: string;
    day: string;
    month: string;
    available: boolean;
    slots: TimeSlot[];
}

interface VisitSchedulerProps {
    propertyId: string;
    propertyName: string;
    propertyAddress: string;
    onConfirm: (date: string, time: string, leadData?: { name: string; email: string; phone: string }) => void;
    onCancel: () => void;
    className?: string;
}

const QUICK_SLOTS = [
    { label: "Hoy", days: 0, priority: true },
    { label: "Mañana", days: 1, priority: true },
    { label: "Sábado", days: 5, priority: false },
    { label: "Domingo", days: 6, priority: false }
];

const TIME_SLOTS: TimeSlot[] = [
    { id: "09:00", time: "09:00", available: true, label: "9:00 AM" },
    { id: "10:00", time: "10:00", available: true, label: "10:00 AM" },
    { id: "11:00", time: "11:00", available: true, label: "11:00 AM" },
    { id: "12:00", time: "12:00", available: true, label: "12:00 PM" },
    { id: "14:00", time: "14:00", available: true, label: "2:00 PM" },
    { id: "15:00", time: "15:00", available: true, label: "3:00 PM" },
    { id: "16:00", time: "16:00", available: true, label: "4:00 PM" },
    { id: "17:00", time: "17:00", available: true, label: "5:00 PM" },
    { id: "18:00", time: "18:00", available: true, label: "6:00 PM" }
];

export function VisitScheduler({
    propertyId,
    propertyName,
    propertyAddress,
    onConfirm,
    onCancel,
    className = ""
}: VisitSchedulerProps) {
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [selectedTime, setSelectedTime] = useState<string>("");
    const [currentStep, setCurrentStep] = useState<"date" | "time" | "confirm" | "form">("date");
    const [isLoading, setIsLoading] = useState(false);
    const [_leadData, setLeadData] = useState<{ name: string; email: string; phone: string } | null>(null);

    // Generar fechas disponibles para los próximos 5 días (QuintoAndar pattern)
    const availableDates = useMemo(() => {
        const dates: DateSlot[] = [];
        const today = new Date();

        for (let i = 0; i < 5; i++) { // Reducido de 14 a 5 días para urgencia
            const date = new Date(today);
            date.setDate(today.getDate() + i);

            const isWeekend = date.getDay() === 0 || date.getDay() === 6;

            dates.push({
                date: date.toISOString().split('T')[0],
                day: date.toLocaleDateString('es-ES', { weekday: 'short' }),
                month: date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
                available: true, // En producción esto vendría de la API
                slots: TIME_SLOTS.map(slot => ({
                    ...slot,
                    available: isWeekend ? slot.time >= "10:00" && slot.time <= "17:00" : true
                }))
            });
        }

        return dates;
    }, []);

    const handleQuickSlotSelect = useCallback((days: number) => {
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + days);
        const dateString = targetDate.toISOString().split('T')[0];

        setSelectedDate(dateString);
        setCurrentStep("time");

        track('visit_scheduler_quick_slot_selected', {
            propertyId,
            days,
            date: dateString
        });
    }, [propertyId]);

    const handleDateSelect = useCallback((date: string) => {
        setSelectedDate(date);
        setCurrentStep("time");

        track('visit_scheduler_date_selected', {
            propertyId,
            date
        });
    }, [propertyId]);

    const handleTimeSelect = useCallback((time: string) => {
        setSelectedTime(time);
        setCurrentStep("confirm");

        track('visit_scheduler_time_selected', {
            propertyId,
            date: selectedDate,
            time
        });
    }, [propertyId, selectedDate]);

    const handleConfirm = useCallback(async () => {
        setCurrentStep("form");
    }, []);

    const handleFormComplete = useCallback(async (formData: { name: string; email: string; phone: string }) => {
        setIsLoading(true);
        setLeadData(formData);

        try {
            // Simular llamada a API
            await new Promise(resolve => setTimeout(resolve, 1000));

            track('visit_scheduler_confirmed', {
                propertyId,
                date: selectedDate,
                time: selectedTime,
                hasName: !!formData.name,
                hasEmail: !!formData.email,
                hasPhone: !!formData.phone
            });

            onConfirm(selectedDate, selectedTime, formData);
        } catch (_error) {
            // console.error('Error confirming visit:', error);
        } finally {
            setIsLoading(false);
        }
    }, [propertyId, selectedDate, selectedTime, onConfirm]);

    const handleBack = useCallback(() => {
        if (currentStep === "time") {
            setCurrentStep("date");
            setSelectedDate("");
        } else if (currentStep === "confirm") {
            setCurrentStep("time");
            setSelectedTime("");
        }
    }, [currentStep]);

    const selectedDateData = availableDates.find(d => d.date === selectedDate);
    const selectedTimeData = selectedDateData?.slots.find(s => s.time === selectedTime);

    const containerVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.2, // Reducido de 0.3 a 0.2 para INP < 200ms
                ease: [0.4, 0, 0.2, 1]
            }
        }
    };

    const stepVariants = {
        hidden: { opacity: 0, x: 20 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.2, // Reducido para INP < 200ms
                ease: [0.4, 0, 0.2, 1]
            }
        },
        exit: {
            opacity: 0,
            x: -20,
            transition: {
                duration: 0.15, // Reducido para respuesta más rápida
                ease: [0.4, 0, 0.2, 1]
            }
        }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className={`bg-gray-800:bg-gray-900 rounded-2xl shadow-2xl border border-gray-700:border-gray-700 overflow-hidden max-w-md w-full mx-4 sm:mx-0 ${className}`}
        >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 sm:p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Agendar visita</h2>
                    <button
                        onClick={onCancel}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        aria-label="Cerrar"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-2">
                    <h3 className="font-semibold text-lg">{propertyName}</h3>
                    <div className="flex items-center gap-2 text-blue-100">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{propertyAddress}</span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6">
                <AnimatePresence mode="wait">
                    {currentStep === "date" && (
                        <motion.div
                            key="date"
                            variants={stepVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="space-y-6"
                        >
                            {/* Quick Slots */}
                            <div>
                                <h3 className="font-semibold text-white:text-white mb-3">
                                    Opciones rápidas
                                </h3>
                                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                                    {QUICK_SLOTS.map((slot) => (
                                        <button
                                            key={slot.label}
                                            onClick={() => handleQuickSlotSelect(slot.days)}
                                            className="p-2 sm:p-3 bg-gray-900:bg-gray-800 rounded-xl border border-gray-700:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 text-left active:scale-95"
                                        >
                                            <div className="font-medium text-white:text-white">
                                                {slot.label}
                                            </div>
                                            <div className="text-sm text-gray-400:text-gray-400">
                                                {new Date(Date.now() + slot.days * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES', {
                                                    weekday: 'long',
                                                    day: 'numeric',
                                                    month: 'long'
                                                })}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Calendar */}
                            <div>
                                <h3 className="font-semibold text-white:text-white mb-3">
                                    Seleccionar fecha
                                </h3>
                                <div className="grid grid-cols-7 gap-2">
                                    {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day) => (
                                        <div key={day} className="text-center text-sm font-medium text-gray-400:text-gray-400 py-2">
                                            {day}
                                        </div>
                                    ))}

                                    {availableDates.slice(0, 7).map((dateSlot) => (
                                        <button
                                            key={dateSlot.date}
                                            onClick={() => handleDateSelect(dateSlot.date)}
                                            className="p-2 text-center rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                        >
                                            <div className="text-sm font-medium text-white:text-white">
                                                {dateSlot.month.split(' ')[0]}
                                            </div>
                                            <div className="text-xs text-gray-400:text-gray-400">
                                                {dateSlot.day}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {currentStep === "time" && (
                        <motion.div
                            key="time"
                            variants={stepVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="space-y-6"
                        >
                            {/* Back Button */}
                            <button
                                onClick={handleBack}
                                className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                <span>Volver</span>
                            </button>

                            {/* Selected Date */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                                <div className="flex items-center gap-3">
                                    <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    <div>
                                        <div className="font-semibold text-white:text-white">
                                            {selectedDateData?.month}
                                        </div>
                                        <div className="text-sm text-gray-300:text-gray-400">
                                            {selectedDateData?.day}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Time Slots */}
                            <div>
                                <h3 className="font-semibold text-white:text-white mb-3">
                                    Seleccionar horario
                                </h3>
                                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                                    {selectedDateData?.slots.map((slot) => (
                                        <button
                                            key={slot.id}
                                            onClick={() => handleTimeSelect(slot.time)}
                                            disabled={!slot.available}
                                            className={`p-2 sm:p-3 rounded-xl border transition-all duration-200 text-center active:scale-95 ${slot.available
                                                ? "bg-gray-800:bg-gray-800 border-gray-700:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600"
                                                : "bg-gray-800:bg-gray-800 border-gray-700:border-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                                                }`}
                                        >
                                            <div className="font-medium text-white:text-white">
                                                {slot.label}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {currentStep === "confirm" && (
                        <motion.div
                            key="confirm"
                            variants={stepVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="space-y-6"
                        >
                            {/* Back Button */}
                            <button
                                onClick={handleBack}
                                className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                <span>Volver</span>
                            </button>

                            {/* Confirmation Summary */}
                            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                                <div className="flex items-center gap-3 mb-3">
                                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                                    <h3 className="font-semibold text-white:text-white">
                                        Confirmar visita
                                    </h3>
                                </div>

                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-500" />
                                        <span className="text-gray-700 dark:text-gray-300">
                                            {selectedDateData?.month} ({selectedDateData?.day})
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-gray-500" />
                                        <span className="text-gray-700 dark:text-gray-300">
                                            {selectedTimeData?.label}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-gray-500" />
                                        <span className="text-gray-700 dark:text-gray-300">
                                            {propertyAddress}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Trust Indicators */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                                <div className="flex items-center gap-2 mb-2">
                                    <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                        Sin comisión • Respaldado por Assetplan
                                    </span>
                                </div>
                                <p className="text-xs text-blue-600 dark:text-blue-400">
                                    Contrato digital • Datos protegidos
                                </p>
                            </div>

                            {/* Contact Options */}
                            <div className="space-y-3">
                                <h4 className="font-medium text-white:text-white">
                                    ¿Prefieres que te contactemos?
                                </h4>

                                <div className="grid grid-cols-2 gap-3">
                                    <button className="flex items-center justify-center gap-2 p-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors">
                                        <Phone className="w-4 h-4" />
                                        <span className="text-sm font-medium">Llamar</span>
                                    </button>

                                    <button className="flex items-center justify-center gap-2 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors">
                                        <MessageCircle className="w-4 h-4" />
                                        <span className="text-sm font-medium">WhatsApp</span>
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Button */}
                            <button
                                onClick={handleConfirm}
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                        <span>Confirmando...</span>
                                    </div>
                                ) : (
                                    "Completar datos"
                                )}
                            </button>
                        </motion.div>
                    )}

                    {currentStep === "form" && (
                        <motion.div
                            key="form"
                            variants={stepVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="space-y-6"
                        >
                            <LeadLiteForm
                                propertyId={propertyId}
                                propertyName={propertyName}
                                selectedDate={selectedDate}
                                selectedTime={selectedTime}
                                onComplete={handleFormComplete}
                                onBack={() => setCurrentStep("confirm")}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

export default VisitScheduler;
