'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, MapPin, User, ChevronLeft, ChevronRight, Bed, Bath, Car, Square, Check, Star } from 'lucide-react';
import {
    PriceLiquidCapsule,
    FeatureLiquidCapsule,
    BadgeLiquidCapsule
} from '@components/ui/LiquidCapsule';
import { ScrollFadeEffect } from '@/components/ncdai/scroll-fade-effect';

interface VisitSchedulerModalProps {
    isOpen: boolean;
    onClose: () => void;
    propertyId: string;
    propertyName: string;
    propertyAddress: string;
    propertyImage?: string;
    propertyDetails?: {
        bedrooms?: number;
        bathrooms?: number;
        parking?: boolean;
        area?: number;
        price?: number;
    };
    onConfirm: (date: string, time: string, leadData: { name: string; email: string; phone: string; rut?: string }) => void;
}

interface TimeSlot {
    id: string;
    time: string;
    available: boolean;
    premium?: boolean;
    instantBooking?: boolean;
}

interface DaySlot {
    id: string;
    date: string;
    day: string;
    number: string;
    available: boolean;
    premium?: boolean;
    price?: number;
}

interface ContactData {
    name: string;
    rut: string;
    phone: string;
    email?: string;
}

const DESIGN_TOKENS = {
    colors: {
        primary: {
            50: '#eff6ff',
            500: '#3b82f6',
            600: '#2563eb',
            700: '#1d4ed8'
        },
        success: {
            50: '#f0fdf4',
            500: '#22c55e',
            600: '#16a34a',
            700: '#15803d'
        },
        premium: {
            50: '#faf5ff',
            500: '#a855f7',
            600: '#9333ea',
            700: '#7c3aed'
        },
        gray: {
            50: '#f9fafb',
            100: '#f3f4f6',
            200: '#e5e7eb',
            300: '#d1d5db',
            400: '#9ca3af',
            500: '#6b7280',
            600: '#4b5563',
            700: '#374151',
            800: '#1f2937',
            900: '#111827'
        }
    },
    animations: {
        slideUp: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
        fadeIn: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
        scale: { duration: 0.15, ease: [0.4, 0, 0.2, 1] },
        stagger: { delay: 0.05, duration: 0.4, ease: [0.4, 0, 0.2, 1] }
    }
} as const;

// Generar calendario inteligente (próximos 30 días)
const generateSmartCalendar = (): DaySlot[] => {
    const days: DaySlot[] = [];
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    for (let i = 1; i <= 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);

        // Lógica de disponibilidad inteligente
        const isPremium = Math.random() > 0.7; // 30% días premium
        const available = Math.random() > 0.2; // 80% disponibilidad

        days.push({
            id: `day-${i}`,
            date: date.toISOString().split('T')[0],
            day: dayNames[date.getDay()],
            number: date.getDate().toString(),
            available,
            premium: isPremium && available,
            price: isPremium ? Math.floor(Math.random() * 50000) + 50000 : undefined
        });
    }

    return days;
};

// Generar horarios agrupados por bloques
const generateTimeBlocks = (): { [key: string]: TimeSlot[] } => {
    const blocks = {
        morning: [] as TimeSlot[],
        afternoon: [] as TimeSlot[],
        evening: [] as TimeSlot[]
    };

    // Mañana: 8:00 - 12:00
    for (let hour = 8; hour <= 12; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
            const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            const isPremium = Math.random() > 0.8;
            blocks.morning.push({
                id: `time-morning-${hour}-${minute}`,
                time: timeString,
                available: Math.random() > 0.3,
                premium: isPremium,
                instantBooking: isPremium
            });
        }
    }

    // Tarde: 13:00 - 17:00
    for (let hour = 13; hour <= 17; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
            const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            const isPremium = Math.random() > 0.8;
            blocks.afternoon.push({
                id: `time-afternoon-${hour}-${minute}`,
                time: timeString,
                available: Math.random() > 0.2,
                premium: isPremium,
                instantBooking: isPremium
            });
        }
    }

    // Noche: 17:30 - 19:00
    for (let hour = 17; hour <= 19; hour++) {
        for (let minute = hour === 17 ? 30 : 0; minute < 60; minute += 30) {
            const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            const isPremium = Math.random() > 0.9; // Menos premium en la noche
            blocks.evening.push({
                id: `time-evening-${hour}-${minute}`,
                time: timeString,
                available: Math.random() > 0.4,
                premium: isPremium,
                instantBooking: isPremium
            });
        }
    }

    return blocks;
};

export function VisitSchedulerModal({
    isOpen,
    onClose,
    propertyId: _propertyId,
    propertyName,
    propertyAddress,
    propertyImage = "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    propertyDetails = {
        bedrooms: 2,
        bathrooms: 2,
        parking: true,
        area: 65,
        price: 850000
    },
    onConfirm
}: VisitSchedulerModalProps) {
    const [step, setStep] = useState<'schedule' | 'confirm'>('schedule');
    const [selectedDay, setSelectedDay] = useState<DaySlot | null>(null);
    const [selectedTime, setSelectedTime] = useState<TimeSlot | null>(null);
    const [contactData, setContactData] = useState<ContactData>({
        name: '',
        rut: '',
        phone: '',
        email: ''
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const calendarDays = useMemo(() => generateSmartCalendar(), []);
    const timeBlocks = useMemo(() => generateTimeBlocks(), []);

    // Auto-save en localStorage
    useEffect(() => {
        if (isOpen) {
            const saved = localStorage.getItem('visitSchedulerData');
            if (saved) {
                try {
                    const data = JSON.parse(saved);
                    setContactData(prev => ({ ...prev, ...data }));
                } catch {
                    // Ignore invalid data
                }
            }
        }
    }, [isOpen]);

    // Validar RUT chileno
    const validateRut = (rut: string): boolean => {
        if (!/^[0-9]{7,8}-[0-9kK]{1}$/.test(rut)) return false;

        const rutClean = rut.replace(/[.-]/g, '');
        const dv = rutClean.slice(-1);
        const rutNumber = parseInt(rutClean.slice(0, -1));

        let sum = 0;
        let multiplier = 2;

        for (let i = rutNumber.toString().split('').reverse().join(''); i; i = i.slice(1)) {
            sum += parseInt(i) * multiplier;
            multiplier = multiplier === 7 ? 2 : multiplier + 1;
        }

        const expectedDv = 11 - (sum % 11);
        const calculatedDv = expectedDv === 11 ? '0' : expectedDv === 10 ? 'K' : expectedDv.toString();

        return dv.toUpperCase() === calculatedDv;
    };

    // Validar teléfono chileno
    const validatePhone = (phone: string): boolean => {
        const cleanPhone = phone.replace(/\s/g, '');
        return /^(\+56|56)?[9][0-9]{8}$/.test(cleanPhone);
    };

    // Validar email
    const validateEmail = (email: string): boolean => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const validateContactData = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        if (!contactData.name.trim()) {
            newErrors.name = 'El nombre es obligatorio';
        } else if (contactData.name.trim().length < 2) {
            newErrors.name = 'El nombre debe tener al menos 2 caracteres';
        }

        if (!contactData.rut.trim()) {
            newErrors.rut = 'El RUT es obligatorio';
        } else if (!validateRut(contactData.rut)) {
            newErrors.rut = 'El RUT no es válido';
        }

        if (!contactData.phone.trim()) {
            newErrors.phone = 'El teléfono es obligatorio';
        } else if (!validatePhone(contactData.phone)) {
            newErrors.phone = 'El teléfono no es válido';
        }

        if (contactData.email && !validateEmail(contactData.email)) {
            newErrors.email = 'El email no es válido';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (selectedDay && selectedTime && validateContactData()) {
            // Auto-save
            localStorage.setItem('visitSchedulerData', JSON.stringify(contactData));
            setStep('confirm');
        }
    };

    const handleBack = () => {
        setStep('schedule');
    };

    const handleConfirm = () => {
        if (selectedDay && selectedTime && validateContactData()) {
            onConfirm(selectedDay.date, selectedTime.time, {
                name: contactData.name,
                email: contactData.email ?? '',
                phone: contactData.phone,
                rut: contactData.rut
            });
            onClose();
            // Reset form
            setStep('schedule');
            setSelectedDay(null);
            setSelectedTime(null);
            setContactData({ name: '', rut: '', phone: '', email: '' });
            setErrors({});
            localStorage.removeItem('visitSchedulerData');
        }
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        const options: Intl.DateTimeFormatOptions = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        return date.toLocaleDateString('es-CL', options);
    };

    const getCurrentMonthDays = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        return calendarDays.filter(day => {
            const dayDate = new Date(day.date);
            return dayDate.getFullYear() === year && dayDate.getMonth() === month;
        });
    };

    const nextMonth = () => {
        setCurrentMonth(prev => {
            const next = new Date(prev);
            next.setMonth(next.getMonth() + 1);
            return next;
        });
    };

    const prevMonth = () => {
        setCurrentMonth(prev => {
            const next = new Date(prev);
            next.setMonth(next.getMonth() - 1);
            return next;
        });
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={DESIGN_TOKENS.animations.fadeIn}
            >
                <motion.div
                    className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl border border-gray-100"
                    initial={{ scale: 0.95, y: 10 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, y: 10 }}
                    transition={DESIGN_TOKENS.animations.slideUp}
                >
                    {/* Header con imagen */}
                    <div className="relative h-48 overflow-hidden">
                        <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: `url(${propertyImage})` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-150"
                        >
                            <X className="w-5 h-5 text-white" />
                        </button>

                        <div className="absolute bottom-4 left-4 right-4">
                            <h3 className="font-bold text-white text-xl mb-1">{propertyName}</h3>
                            <p className="text-white/90 text-sm">{propertyAddress}</p>
                        </div>
                    </div>

                    {/* Información de la propiedad */}
                    <div className="px-6 py-4 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FeatureLiquidCapsule feature={`${propertyDetails.bedrooms}D`} icon={Bed} />
                                <FeatureLiquidCapsule feature={`${propertyDetails.bathrooms}B`} icon={Bath} />
                                <FeatureLiquidCapsule feature={`${propertyDetails.area}m²`} icon={Square} />
                                {propertyDetails.parking && (
                                    <FeatureLiquidCapsule feature="1V" icon={Car} />
                                )}
                            </div>

                            {propertyDetails.price && (
                                <PriceLiquidCapsule price={propertyDetails.price} />
                            )}
                        </div>
                    </div>

                    {/* Progreso visual sutil */}
                    <div className="px-6 py-3 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {step !== 'schedule' && (
                                    <button
                                        onClick={handleBack}
                                        className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-150"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                )}
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">
                                        {step === 'schedule' ? 'Agenda tu visita' : 'Confirma tu visita'}
                                    </h2>
                                    <p className="text-gray-600 text-sm">
                                        {step === 'schedule' ? 'Selecciona fecha, horario y completa tus datos' : 'Revisa los detalles antes de confirmar'}
                                    </p>
                                </div>
                            </div>

                            {/* Dots de progreso */}
                            <div className="flex gap-1">
                                <div className={`w-2 h-2 rounded-full transition-all duration-300 ${step === 'schedule' ? 'bg-blue-500' : 'bg-gray-300'
                                    }`} />
                                <div className={`w-2 h-2 rounded-full transition-all duration-300 ${step === 'confirm' ? 'bg-blue-500' : 'bg-gray-300'
                                    }`} />
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <ScrollFadeEffect orientation="vertical" className="max-h-[50vh]">
                        <div className="p-6">
                        <AnimatePresence mode="wait">
                            {step === 'schedule' && (
                                <motion.div
                                    key="schedule"
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    transition={DESIGN_TOKENS.animations.slideUp}
                                >
                                    <div className="space-y-6">
                                        {/* Calendario inteligente */}
                                        <div>
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-2 text-gray-700">
                                                    <Calendar className="w-4 h-4" />
                                                    <span className="font-medium">Selecciona una fecha</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={prevMonth}
                                                        className="p-1 rounded-full hover:bg-gray-100 transition-all duration-150"
                                                    >
                                                        <ChevronLeft className="w-4 h-4" />
                                                    </button>
                                                    <span className="text-sm font-medium text-gray-600">
                                                        {currentMonth.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })}
                                                    </span>
                                                    <button
                                                        onClick={nextMonth}
                                                        className="p-1 rounded-full hover:bg-gray-100 transition-all duration-150"
                                                    >
                                                        <ChevronRight className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Grid de días */}
                                            <div className="grid grid-cols-7 gap-2 mb-4">
                                                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                                                    <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                                                        {day}
                                                    </div>
                                                ))}
                                                {getCurrentMonthDays().map((day) => (
                                                    <button
                                                        key={day.id}
                                                        className={`relative p-3 rounded-2xl border-2 transition-all duration-200 ${selectedDay?.id === day.id
                                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                            : day.available
                                                                ? 'border-gray-200 hover:border-blue-300 text-gray-700'
                                                                : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                                                            } ${day.premium && day.available ? 'ring-2 ring-purple-200' : ''}`}
                                                        onClick={() => day.available && setSelectedDay(day)}
                                                        disabled={!day.available}
                                                    >
                                                        <div className="text-center">
                                                            <div className="text-xs font-medium">{day.day}</div>
                                                            <div className="text-lg font-bold">{day.number}</div>
                                                            {day.premium && (
                                                                <div className="absolute -top-1 -right-1">
                                                                    <Star className="w-3 h-3 text-purple-500 fill-current" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Leyenda */}
                                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <div className="w-3 h-3 rounded-full bg-gray-200" />
                                                    <span>Disponible</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <div className="w-3 h-3 rounded-full bg-purple-200 ring-2 ring-purple-200" />
                                                    <span>Premium</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Horarios agrupados */}
                                        {selectedDay && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.1 }}
                                            >
                                                <div className="flex items-center gap-2 text-gray-700 mb-3">
                                                    <Clock className="w-4 h-4" />
                                                    <span className="font-medium">Selecciona un horario</span>
                                                </div>

                                                <div className="space-y-4">
                                                    {Object.entries(timeBlocks).map(([blockName, times]) => (
                                                        <div key={blockName}>
                                                            <h4 className="text-sm font-medium text-gray-600 mb-2 capitalize">
                                                                {blockName === 'morning' ? 'Mañana' :
                                                                    blockName === 'afternoon' ? 'Tarde' : 'Noche'}
                                                            </h4>
                                                            <div className="flex flex-wrap gap-2">
                                                                {times.map((time) => (
                                                                    <button
                                                                        key={time.id}
                                                                        className={`px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all duration-200 ${selectedTime?.id === time.id
                                                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                                            : time.available
                                                                                ? 'border-gray-200 hover:border-blue-300 text-gray-700'
                                                                                : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                                                                            } ${time.premium && time.available ? 'ring-2 ring-purple-200' : ''}`}
                                                                        onClick={() => time.available && setSelectedTime(time)}
                                                                        disabled={!time.available}
                                                                    >
                                                                        <div className="flex items-center gap-1">
                                                                            <span>{time.time}</span>
                                                                            {time.premium && (
                                                                                <Star className="w-3 h-3 text-purple-500 fill-current" />
                                                                            )}
                                                                            {time.instantBooking && (
                                                                                <BadgeLiquidCapsule badge="Instant" size="xs" />
                                                                            )}
                                                                        </div>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* Formulario de contacto */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                        >
                                            <div className="flex items-center gap-2 text-gray-700 mb-4">
                                                <User className="w-4 h-4" />
                                                <span className="font-medium">Tus datos de contacto</span>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Nombre completo *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={contactData.name}
                                                        onChange={(e) => setContactData({ ...contactData, name: e.target.value })}
                                                        className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-blue-500 bg-white'
                                                            }`}
                                                        placeholder="Tu nombre completo"
                                                    />
                                                    {errors.name && (
                                                        <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        RUT *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={contactData.rut}
                                                        onChange={(e) => setContactData({ ...contactData, rut: e.target.value })}
                                                        className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${errors.rut ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-blue-500 bg-white'
                                                            }`}
                                                        placeholder="12.345.678-9"
                                                    />
                                                    {errors.rut && (
                                                        <p className="text-red-500 text-sm mt-1">{errors.rut}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Teléfono *
                                                    </label>
                                                    <input
                                                        type="tel"
                                                        value={contactData.phone}
                                                        onChange={(e) => setContactData({ ...contactData, phone: e.target.value })}
                                                        className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-blue-500 bg-white'
                                                            }`}
                                                        placeholder="+56 9 1234 5678"
                                                    />
                                                    {errors.phone && (
                                                        <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Email (opcional)
                                                    </label>
                                                    <input
                                                        type="email"
                                                        value={contactData.email}
                                                        onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                                                        className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-blue-500 bg-white'
                                                            }`}
                                                        placeholder="tu@email.com"
                                                    />
                                                    {errors.email && (
                                                        <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    </div>
                                </motion.div>
                            )}

                            {step === 'confirm' && (
                                <motion.div
                                    key="confirm"
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    transition={DESIGN_TOKENS.animations.slideUp}
                                >
                                    <div className="space-y-6">
                                        {/* Resumen de la visita */}
                                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
                                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                                <Check className="w-5 h-5 text-green-500" />
                                                Resumen de tu visita
                                            </h3>

                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <Calendar className="w-5 h-5 text-blue-500" />
                                                    <div>
                                                        <p className="text-sm text-gray-600">Fecha y horario</p>
                                                        <p className="font-semibold text-gray-900">
                                                            {selectedDay && formatDate(selectedDay.date)} a las {selectedTime?.time}
                                                        </p>
                                                        {selectedTime?.premium && (
                                                            <BadgeLiquidCapsule badge="Horario Premium" variant="premium" size="sm" />
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <MapPin className="w-5 h-5 text-blue-500" />
                                                    <div>
                                                        <p className="text-sm text-gray-600">Propiedad</p>
                                                        <p className="font-semibold text-gray-900">{propertyName}</p>
                                                        <p className="text-sm text-gray-600">{propertyAddress}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <User className="w-5 h-5 text-blue-500" />
                                                    <div>
                                                        <p className="text-sm text-gray-600">Contacto</p>
                                                        <p className="font-semibold text-gray-900">{contactData.name}</p>
                                                        <p className="text-sm text-gray-600">{contactData.phone}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Información adicional */}
                                        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <User className="w-4 h-4 text-blue-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900 mb-1">¿Qué esperar?</h4>
                                                    <p className="text-sm text-gray-600">
                                                        Un corredor asociado Hommie organizará la visita y puede resolver todas tus dudas sobre la propiedad.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {selectedTime?.instantBooking && (
                                            <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                        <Check className="w-4 h-4 text-green-600" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium text-gray-900 mb-1">Reserva Instantánea</h4>
                                                        <p className="text-sm text-gray-600">
                                                            Este horario está disponible para reserva inmediata. Recibirás confirmación al instante.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        </div>
                    </ScrollFadeEffect>

                    {/* Footer */}
                    <div className="p-6 border-t border-gray-100/50">
                        <motion.button
                            onClick={step === 'confirm' ? handleConfirm : handleNext}
                            disabled={
                                (step === 'schedule' && (!selectedDay || !selectedTime)) ||
                                (step === 'schedule' && Object.keys(errors).length > 0)
                            }
                            className={`w-full py-4 px-6 rounded-2xl font-semibold transition-all duration-150 ${(step === 'schedule' && (!selectedDay || !selectedTime)) ||
                                (step === 'schedule' && Object.keys(errors).length > 0)
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                                }`}
                            whileHover={{
                                scale: ((step === 'schedule' && (!selectedDay || !selectedTime)) ||
                                    (step === 'schedule' && Object.keys(errors).length > 0)) ? 1 : 1.02
                            }}
                            whileTap={{
                                scale: ((step === 'schedule' && (!selectedDay || !selectedTime)) ||
                                    (step === 'schedule' && Object.keys(errors).length > 0)) ? 1 : 0.98
                            }}
                        >
                            {step === 'confirm' ? 'Confirmar visita' : 'Continuar'}
                        </motion.button>

                        {step === 'schedule' && (
                            <p className="text-center text-xs text-gray-500 mt-3">
                                Tus datos se guardan automáticamente para futuras visitas
                            </p>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

