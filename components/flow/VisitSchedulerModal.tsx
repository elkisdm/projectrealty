'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X, Calendar, Clock, MapPin, User, Bed, Bath, Car, Square, Check, Star, ChevronRight } from 'lucide-react';
import {
    PriceLiquidCapsule,
    FeatureLiquidCapsule,
} from '@components/ui/LiquidCapsule';
import type { Unit, Building } from '@schemas/models';

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
        gastoComun?: number;
    };
    // Nuevos props para datos reales de la base de datos
    unit?: Unit;
    building?: Building;
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

interface QualificationAnswers {
    needsToMoveIn30Days: boolean | null;
    hasGuarantor: boolean | null;
    hasSufficientIncome: boolean | null;
}

type Step = 'date' | 'time' | 'qualification' | 'contact' | 'confirm';

// Generar próximos 6-7 días disponibles (sin domingos)
const generateAvailableDays = (): DaySlot[] => {
    const days: DaySlot[] = [];
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    let count = 0;
    let dayOffset = 1;

    while (count < 7 && dayOffset <= 14) {
        const date = new Date();
        date.setDate(date.getDate() + dayOffset);
        
        // Excluir domingos
        if (date.getDay() !== 0) {
            const isPremium = Math.random() > 0.7;
            const available = Math.random() > 0.15; // 85% disponibilidad
            
            if (available) {
        days.push({
                    id: `day-${dayOffset}`,
            date: date.toISOString().split('T')[0],
            day: dayNames[date.getDay()],
            number: date.getDate().toString(),
                    available: true,
                    premium: isPremium,
            price: isPremium ? Math.floor(Math.random() * 50000) + 50000 : undefined
        });
                count++;
            }
        }
        dayOffset++;
    }

    return days;
};

// Generar horarios agrupados por bloques (solo disponibles)
const generateTimeBlocks = (): { [key: string]: TimeSlot[] } => {
    const blocks = {
        morning: [] as TimeSlot[],
        afternoon: [] as TimeSlot[],
        evening: [] as TimeSlot[]
    };

    // Mañana: 9:00 - 12:00 (solo cada hora)
    for (let hour = 9; hour <= 12; hour++) {
        const timeString = `${hour.toString().padStart(2, '0')}:00`;
            const isPremium = Math.random() > 0.8;
        if (Math.random() > 0.3) { // Solo disponibles
            blocks.morning.push({
                id: `time-morning-${hour}`,
                time: timeString,
                available: true,
                premium: isPremium,
                instantBooking: isPremium
            });
        }
    }

    // Tarde: 13:00 - 17:00
    for (let hour = 13; hour <= 17; hour++) {
        const timeString = `${hour.toString().padStart(2, '0')}:00`;
            const isPremium = Math.random() > 0.8;
        if (Math.random() > 0.2) {
            blocks.afternoon.push({
                id: `time-afternoon-${hour}`,
                time: timeString,
                available: true,
                premium: isPremium,
                instantBooking: isPremium
            });
        }
    }

    // Noche: 18:00 - 19:00
    for (let hour = 18; hour <= 19; hour++) {
        const timeString = `${hour.toString().padStart(2, '0')}:00`;
        const isPremium = Math.random() > 0.9;
        if (Math.random() > 0.4) {
            blocks.evening.push({
                id: `time-evening-${hour}`,
                time: timeString,
                available: true,
                premium: isPremium,
                instantBooking: isPremium
            });
        }
    }

    return blocks;
};

const qualificationQuestions = [
    {
        key: 'needsToMoveIn30Days' as const,
        title: '¿Necesitas mudarte en los próximos 30 días?',
    },
    {
        key: 'hasGuarantor' as const,
        title: '¿Tienes aval o garantía?',
    },
    {
        key: 'hasSufficientIncome' as const,
        title: '¿Tienes ingresos suficientes para el arriendo?',
    },
];

export function VisitSchedulerModal({
    isOpen,
    onClose,
    propertyId: _propertyId,
    propertyName,
    propertyAddress,
    propertyImage,
    propertyDetails,
    unit,
    building,
    onConfirm
}: VisitSchedulerModalProps) {
    // Usar datos reales de la base de datos si están disponibles, sino usar props legacy
    const finalPropertyName = unit && building 
        ? building.name
        : propertyName;
    
    const finalPropertyAddress = building?.address || propertyAddress;
    
    const finalPropertyImage = unit?.images?.[0] 
        || building?.gallery?.[0] 
        || building?.coverImage 
        || propertyImage 
        || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80";
    
    // Extraer detalles de la unidad si está disponible
    const finalPropertyDetails = unit ? {
        bedrooms: unit.dormitorios || unit.bedrooms || 0,
        bathrooms: unit.banos || unit.bathrooms || 1,
        parking: unit.estacionamiento || unit.parking_opcional || false,
        area: unit.m2 || unit.area_interior_m2 || undefined,
        price: unit.price,
        gastoComun: unit.gastoComun || unit.gc || unit.gastosComunes || 0,
    } : propertyDetails || {
        bedrooms: 2,
        bathrooms: 2,
        parking: false,
        area: undefined,
        price: undefined,
        gastoComun: 0,
    };
    const shouldReduceMotion = useReducedMotion();
    
    const [step, setStep] = useState<Step>('date');
    const [selectedDay, setSelectedDay] = useState<DaySlot | null>(null);
    const [selectedTime, setSelectedTime] = useState<TimeSlot | null>(null);
    const [qualificationAnswers, setQualificationAnswers] = useState<QualificationAnswers>({
        needsToMoveIn30Days: null,
        hasGuarantor: null,
        hasSufficientIncome: null,
    });
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [contactData, setContactData] = useState<ContactData>({
        name: '',
        rut: '',
        phone: '',
        email: ''
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isValidating, setIsValidating] = useState(false);

    const modalRef = useRef<HTMLDivElement>(null);
    const firstInputRef = useRef<HTMLInputElement>(null);

    const availableDays = useMemo(() => generateAvailableDays(), []);
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

    // Cleanup timeouts on unmount
    useEffect(() => {
        return () => {
            Object.values(timeoutRefs.current).forEach(timeout => clearTimeout(timeout));
        };
    }, []);

    // Focus trap y manejo de teclado
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
            if (e.key === 'Tab' && modalRef.current) {
                const focusableElements = modalRef.current.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                const firstElement = focusableElements[0] as HTMLElement;
                const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

                if (e.shiftKey && document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement?.focus();
                } else if (!e.shiftKey && document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement?.focus();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // Validar RUT chileno
    const validateRut = useCallback((rut: string): boolean => {
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
    }, []);

    // Validar teléfono chileno
    const validatePhone = useCallback((phone: string): boolean => {
        const cleanPhone = phone.replace(/\s/g, '');
        return /^(\+56|56)?[9][0-9]{8}$/.test(cleanPhone);
    }, []);

    // Validar email
    const validateEmail = useCallback((email: string): boolean => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }, []);

    // Validación en tiempo real con debounce
    const validateField = useCallback((field: keyof ContactData, value: string) => {
        setIsValidating(true);
        const newErrors: { [key: string]: string } = { ...errors };

        switch (field) {
            case 'name':
                if (!value.trim()) {
                    newErrors.name = 'El nombre es obligatorio';
                } else if (value.trim().length < 2) {
                    newErrors.name = 'El nombre debe tener al menos 2 caracteres';
                } else {
                    delete newErrors.name;
                }
                break;
            case 'rut':
                if (!value.trim()) {
                    newErrors.rut = 'El RUT es obligatorio';
                } else if (!validateRut(value)) {
                    newErrors.rut = 'El RUT no es válido';
                } else {
                    delete newErrors.rut;
                }
                break;
            case 'phone':
                if (!value.trim()) {
                    newErrors.phone = 'El teléfono es obligatorio';
                } else if (!validatePhone(value)) {
                    newErrors.phone = 'El teléfono no es válido';
                } else {
                    delete newErrors.phone;
                }
                break;
            case 'email':
                if (value && !validateEmail(value)) {
                    newErrors.email = 'El email no es válido';
                } else {
                    delete newErrors.email;
                }
                break;
        }

        setErrors(newErrors);
        setIsValidating(false);
    }, [errors, validateRut, validatePhone, validateEmail]);

    const validateContactData = useCallback((): boolean => {
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
    }, [contactData, validateRut, validatePhone, validateEmail]);

    const handleDateSelect = (day: DaySlot) => {
        setSelectedDay(day);
        setSelectedTime(null);
        setStep('time');
    };

    const handleTimeSelect = (time: TimeSlot) => {
        setSelectedTime(time);
        setStep('qualification');
    };

    const handleQualificationAnswer = (answer: boolean) => {
        const currentQuestion = qualificationQuestions[currentQuestionIndex];
        setQualificationAnswers(prev => ({
            ...prev,
            [currentQuestion.key]: answer
        }));

        if (currentQuestionIndex < qualificationQuestions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            setStep('contact');
            // Focus en primer input después de animación
            setTimeout(() => firstInputRef.current?.focus(), 300);
        }
    };

    const timeoutRefs = useRef<{ [key: string]: NodeJS.Timeout }>({});

    const handleContactFieldChange = (field: keyof ContactData, value: string) => {
        setContactData(prev => ({ ...prev, [field]: value }));
        // Validación en tiempo real con debounce
        if (timeoutRefs.current[field]) {
            clearTimeout(timeoutRefs.current[field]);
        }
        timeoutRefs.current[field] = setTimeout(() => {
            validateField(field, value);
        }, 500);
    };

    const handleNext = () => {
        if (validateContactData()) {
            localStorage.setItem('visitSchedulerData', JSON.stringify(contactData));
            setStep('confirm');
        }
    };

    const handleBack = () => {
        if (step === 'time') {
            setStep('date');
            setSelectedTime(null);
        } else if (step === 'qualification') {
            if (currentQuestionIndex > 0) {
                const prevIndex = currentQuestionIndex - 1;
                const prevQuestion = qualificationQuestions[prevIndex];
                setCurrentQuestionIndex(prevIndex);
                setQualificationAnswers(prev => ({
                    ...prev,
                    [prevQuestion.key]: null
                }));
            } else {
                setStep('time');
                setCurrentQuestionIndex(0);
                setQualificationAnswers({
                    needsToMoveIn30Days: null,
                    hasGuarantor: null,
                    hasSufficientIncome: null,
                });
            }
        } else if (step === 'contact') {
            setStep('qualification');
            setCurrentQuestionIndex(qualificationQuestions.length - 1);
        } else if (step === 'confirm') {
            setStep('contact');
        }
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
            setStep('date');
            setSelectedDay(null);
            setSelectedTime(null);
            setCurrentQuestionIndex(0);
            setQualificationAnswers({
                needsToMoveIn30Days: null,
                hasGuarantor: null,
                hasSufficientIncome: null,
            });
            setContactData({ name: '', rut: '', phone: '', email: '' });
            setErrors({});
            localStorage.removeItem('visitSchedulerData');
        }
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-CL', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getStepNumber = (): number => {
        const stepOrder: Step[] = ['date', 'time', 'qualification', 'contact', 'confirm'];
        return stepOrder.indexOf(step) + 1;
    };

    const getTotalSteps = (): number => {
        return 5;
    };

    const canProceed = (): boolean => {
        if (step === 'date') return selectedDay !== null;
        if (step === 'time') return selectedTime !== null;
        if (step === 'qualification') return currentQuestionIndex === qualificationQuestions.length - 1 && qualificationAnswers.hasSufficientIncome !== null;
        if (step === 'contact') return validateContactData();
        return true;
    };

    if (!isOpen) return null;

    const animationProps = shouldReduceMotion
        ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
        : {
            initial: { opacity: 0, scale: 0.95, y: 10 },
            animate: { opacity: 1, scale: 1, y: 0 },
            exit: { opacity: 0, scale: 0.95, y: 10 },
            transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] }
        };

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-0 md:p-4 z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={shouldReduceMotion ? { duration: 0.1 } : { duration: 0.2 }}
                onClick={(e) => e.target === e.currentTarget && onClose()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
            >
                <motion.div
                    ref={modalRef}
                    className="bg-white rounded-none md:rounded-3xl w-full h-full md:h-auto md:max-w-2xl md:max-h-[85vh] overflow-hidden shadow-2xl border-0 md:border border-gray-100 flex flex-col"
                    {...animationProps}
                >
                    {/* Header compacto con información de propiedad */}
                    <div className="relative h-32 overflow-hidden flex-shrink-0">
                        <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: `url(${finalPropertyImage})` }}
                            aria-hidden="true"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />

                        <button
                            onClick={onClose}
                            className="absolute top-3 right-3 md:top-4 md:right-4 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-white/50"
                            aria-label="Cerrar modal"
                        >
                            <X className="w-5 h-5 text-white" />
                        </button>

                        <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex-1 min-w-0">
                                    <h3 id="modal-title" className="font-bold text-white text-lg md:text-xl mb-1 truncate">{finalPropertyName}</h3>
                                    <p className="text-white/90 text-xs md:text-sm truncate">{finalPropertyAddress}</p>
                        </div>
                                {finalPropertyDetails.price && (
                                    <div className="flex-shrink-0">
                                        <PriceLiquidCapsule price={finalPropertyDetails.price} />
                    </div>
                                )}
                            </div>
                            {/* Información de precio y gastos comunes */}
                            {finalPropertyDetails.price && (
                                <div className="mb-2">
                                    <div className="flex items-center gap-2 text-white/90 text-xs">
                                        <span className="font-semibold">${finalPropertyDetails.price.toLocaleString('es-CL')} arriendo</span>
                                        {finalPropertyDetails.gastoComun > 0 && (
                                            <>
                                                <span>·</span>
                                                <span>${finalPropertyDetails.gastoComun.toLocaleString('es-CL')} gastos comunes</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                            <div className="flex items-center gap-1.5 flex-wrap">
                                {finalPropertyDetails.bedrooms !== undefined && (
                                    <FeatureLiquidCapsule feature={`${finalPropertyDetails.bedrooms}D`} icon={Bed} size="xs" />
                                )}
                                {finalPropertyDetails.bathrooms !== undefined && (
                                    <FeatureLiquidCapsule feature={`${finalPropertyDetails.bathrooms}B`} icon={Bath} size="xs" />
                                )}
                                {finalPropertyDetails.area && (
                                    <FeatureLiquidCapsule feature={`${finalPropertyDetails.area} m²`} icon={Square} size="xs" />
                                )}
                                {finalPropertyDetails.parking && (
                                    <FeatureLiquidCapsule feature="1V" icon={Car} size="xs" />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Barra de progreso */}
                    <div className="px-4 md:px-5 py-3 border-b border-gray-100 flex-shrink-0">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                {step !== 'date' && (
                                    <button
                                        onClick={handleBack}
                                        className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                        aria-label="Volver al paso anterior"
                                    >
                                        <ChevronRight className="w-4 h-4 rotate-180" />
                                    </button>
                                )}
                                <div>
                                    <h2 className="text-base md:text-lg font-bold text-gray-900">
                                        {step === 'date' && 'Elige un día'}
                                        {step === 'time' && 'Elige un horario'}
                                        {step === 'qualification' && 'Preguntas rápidas'}
                                        {step === 'contact' && 'Tus datos'}
                                        {step === 'confirm' && 'Confirma tu visita'}
                                    </h2>
                                    <p className="text-gray-600 text-xs md:text-sm">
                                        Paso {getStepNumber()} de {getTotalSteps()}
                                    </p>
                                </div>
                            </div>
                        </div>
                            <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((num) => (
                                <div
                                    key={num}
                                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                                        num <= getStepNumber() ? 'bg-blue-500' : 'bg-gray-200'
                                    }`}
                                    aria-hidden="true"
                                />
                            ))}
                        </div>
                    </div>

                    {/* Contenido scrollable */}
                    <div className="flex-1 overflow-y-auto px-4 md:px-5 py-4 md:py-5">
                        <AnimatePresence mode="wait">
                            {step === 'date' && (
                                <motion.div
                                    key="date"
                                    initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 10 }}
                                    animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
                                    exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -10 }}
                                    transition={shouldReduceMotion ? { duration: 0.1 } : { duration: 0.2 }}
                                >
                                    <div className="flex items-center gap-2 text-gray-700 mb-3">
                                                    <Calendar className="w-4 h-4" />
                                        <span className="font-medium text-sm md:text-base">Próximos días disponibles</span>
                                                </div>
                                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                                        {availableDays.map((day) => (
                                                    <button
                                                        key={day.id}
                                                onClick={() => handleDateSelect(day)}
                                                className={`flex-shrink-0 w-20 md:w-24 p-3 rounded-xl border-2 transition-all duration-200 snap-start focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                                                    selectedDay?.id === day.id
                                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                        : 'border-gray-200 hover:border-blue-300 text-gray-700 bg-white'
                                                } ${day.premium ? 'ring-2 ring-purple-200' : ''}`}
                                                aria-pressed={selectedDay?.id === day.id}
                                                    >
                                                        <div className="text-center">
                                                            <div className="text-xs font-medium">{day.day}</div>
                                                    <div className="text-xl md:text-2xl font-bold mt-1">{day.number}</div>
                                                            {day.premium && (
                                                        <div className="flex justify-center mt-1">
                                                                    <Star className="w-3 h-3 text-purple-500 fill-current" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                </motion.div>
                            )}

                            {step === 'time' && selectedDay && (
                                            <motion.div
                                    key="time"
                                    initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 10 }}
                                    animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
                                    exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -10 }}
                                    transition={shouldReduceMotion ? { duration: 0.1 } : { duration: 0.2 }}
                                            >
                                                <div className="flex items-center gap-2 text-gray-700 mb-3">
                                                    <Clock className="w-4 h-4" />
                                        <span className="font-medium text-sm md:text-base">Horarios disponibles</span>
                                                </div>
                                    <div className="space-y-3">
                                                    {Object.entries(timeBlocks).map(([blockName, times]) => (
                                            times.length > 0 && (
                                                        <div key={blockName}>
                                                    <h4 className="text-xs md:text-sm font-medium text-gray-600 mb-2 capitalize">
                                                                {blockName === 'morning' ? 'Mañana' :
                                                                    blockName === 'afternoon' ? 'Tarde' : 'Noche'}
                                                            </h4>
                                                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                                                                {times.map((time) => (
                                                                    <button
                                                                        key={time.id}
                                                                onClick={() => handleTimeSelect(time)}
                                                                className={`flex-shrink-0 px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all duration-200 snap-start focus:outline-none focus:ring-2 focus:ring-blue-500/20 min-h-[44px] ${
                                                                    selectedTime?.id === time.id
                                                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                                        : 'border-gray-200 hover:border-blue-300 text-gray-700 bg-white'
                                                                } ${time.premium ? 'ring-2 ring-purple-200' : ''}`}
                                                                aria-pressed={selectedTime?.id === time.id}
                                                            >
                                                                <div className="flex items-center gap-1.5">
                                                                            <span>{time.time}</span>
                                                                            {time.premium && (
                                                                                <Star className="w-3 h-3 text-purple-500 fill-current" />
                                                                            )}
                                                                        </div>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                            )
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}

                            {step === 'qualification' && (
                                        <motion.div
                                    key="qualification"
                                    initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 10 }}
                                    animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
                                    exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -10 }}
                                    transition={shouldReduceMotion ? { duration: 0.1 } : { duration: 0.2 }}
                                >
                                    <div className="text-center mb-6">
                                        <p className="text-xs text-gray-500 mb-4">
                                            Pregunta {currentQuestionIndex + 1} de {qualificationQuestions.length}
                                        </p>
                                        <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-8">
                                            {qualificationQuestions[currentQuestionIndex].title}
                                        </h3>
                                        <div className="flex gap-3 justify-center">
                                            <button
                                                onClick={() => handleQualificationAnswer(true)}
                                                className={`px-8 py-4 rounded-2xl font-semibold text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 min-h-[52px] min-w-[120px] ${
                                                    qualificationAnswers[qualificationQuestions[currentQuestionIndex].key] === true
                                                        ? 'bg-blue-600 text-white shadow-lg'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                                aria-pressed={qualificationAnswers[qualificationQuestions[currentQuestionIndex].key] === true}
                                            >
                                                Sí
                                            </button>
                                            <button
                                                onClick={() => handleQualificationAnswer(false)}
                                                className={`px-8 py-4 rounded-2xl font-semibold text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 min-h-[52px] min-w-[120px] ${
                                                    qualificationAnswers[qualificationQuestions[currentQuestionIndex].key] === false
                                                        ? 'bg-blue-600 text-white shadow-lg'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                                aria-pressed={qualificationAnswers[qualificationQuestions[currentQuestionIndex].key] === false}
                                            >
                                                No
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {step === 'contact' && (
                                <motion.div
                                    key="contact"
                                    initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 10 }}
                                    animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
                                    exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -10 }}
                                    transition={shouldReduceMotion ? { duration: 0.1 } : { duration: 0.2 }}
                                        >
                                            <div className="flex items-center gap-2 text-gray-700 mb-4">
                                                <User className="w-4 h-4" />
                                        <span className="font-medium text-sm md:text-base">Completa tus datos</span>
                                            </div>
                                    <div className="space-y-4">
                                                <div>
                                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                                                        Nombre completo *
                                                    </label>
                                                    <input
                                                ref={firstInputRef}
                                                id="name"
                                                        type="text"
                                                        value={contactData.name}
                                                onChange={(e) => handleContactFieldChange('name', e.target.value)}
                                                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-base min-h-[44px] ${
                                                    errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-blue-500 bg-white'
                                                            }`}
                                                        placeholder="Tu nombre completo"
                                                aria-invalid={!!errors.name}
                                                aria-describedby={errors.name ? 'name-error' : undefined}
                                                    />
                                                    {errors.name && (
                                                <p id="name-error" className="text-red-500 text-sm mt-1" role="alert">
                                                    {errors.name}
                                                </p>
                                                    )}
                                                </div>

                                                <div>
                                            <label htmlFor="rut" className="block text-sm font-medium text-gray-700 mb-1.5">
                                                        RUT *
                                                    </label>
                                                    <input
                                                id="rut"
                                                        type="text"
                                                        value={contactData.rut}
                                                onChange={(e) => handleContactFieldChange('rut', e.target.value)}
                                                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-base min-h-[44px] ${
                                                    errors.rut ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-blue-500 bg-white'
                                                            }`}
                                                        placeholder="12.345.678-9"
                                                aria-invalid={!!errors.rut}
                                                aria-describedby={errors.rut ? 'rut-error' : undefined}
                                                    />
                                                    {errors.rut && (
                                                <p id="rut-error" className="text-red-500 text-sm mt-1" role="alert">
                                                    {errors.rut}
                                                </p>
                                                    )}
                                                </div>

                                                <div>
                                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                                                        Teléfono *
                                                    </label>
                                                    <input
                                                id="phone"
                                                        type="tel"
                                                        value={contactData.phone}
                                                onChange={(e) => handleContactFieldChange('phone', e.target.value)}
                                                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-base min-h-[44px] ${
                                                    errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-blue-500 bg-white'
                                                            }`}
                                                        placeholder="+56 9 1234 5678"
                                                aria-invalid={!!errors.phone}
                                                aria-describedby={errors.phone ? 'phone-error' : undefined}
                                                    />
                                                    {errors.phone && (
                                                <p id="phone-error" className="text-red-500 text-sm mt-1" role="alert">
                                                    {errors.phone}
                                                </p>
                                                    )}
                                                </div>

                                                <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                                                        Email (opcional)
                                                    </label>
                                                    <input
                                                id="email"
                                                        type="email"
                                                        value={contactData.email}
                                                onChange={(e) => handleContactFieldChange('email', e.target.value)}
                                                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-base min-h-[44px] ${
                                                    errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-blue-500 bg-white'
                                                            }`}
                                                        placeholder="tu@email.com"
                                                aria-invalid={!!errors.email}
                                                aria-describedby={errors.email ? 'email-error' : undefined}
                                                    />
                                                    {errors.email && (
                                                <p id="email-error" className="text-red-500 text-sm mt-1" role="alert">
                                                    {errors.email}
                                                </p>
                                                    )}
                                                </div>
                                    </div>
                                </motion.div>
                            )}

                            {step === 'confirm' && (
                                <motion.div
                                    key="confirm"
                                    initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 10 }}
                                    animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
                                    exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -10 }}
                                    transition={shouldReduceMotion ? { duration: 0.1 } : { duration: 0.2 }}
                                >
                                    <div className="space-y-4">
                                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 md:p-6 border border-blue-200">
                                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                                <Check className="w-5 h-5 text-green-500" />
                                                Resumen de tu visita
                                            </h3>
                                            <div className="space-y-3">
                                                <div className="flex items-start gap-3">
                                                    <Calendar className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                                    <div>
                                                        <p className="text-xs text-gray-600">Fecha y horario</p>
                                                        <p className="font-semibold text-gray-900 text-sm md:text-base">
                                                            {selectedDay && formatDate(selectedDay.date)} a las {selectedTime?.time}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <MapPin className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                                    <div>
                                                        <p className="text-xs text-gray-600">Propiedad</p>
                                                        <p className="font-semibold text-gray-900 text-sm md:text-base">{finalPropertyName}</p>
                                                        <p className="text-xs text-gray-600">{finalPropertyAddress}</p>
                                                        {finalPropertyDetails.price && (
                                                            <div className="mt-1">
                                                                <p className="text-xs text-gray-600">
                                                                    ${finalPropertyDetails.price.toLocaleString('es-CL')} arriendo
                                                                    {finalPropertyDetails.gastoComun > 0 && (
                                                                        <> · ${finalPropertyDetails.gastoComun.toLocaleString('es-CL')} gastos comunes</>
                                                                    )}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <User className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                                    <div>
                                                        <p className="text-xs text-gray-600">Contacto</p>
                                                        <p className="font-semibold text-gray-900 text-sm md:text-base">{contactData.name}</p>
                                                        <p className="text-xs text-gray-600">{contactData.phone}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <User className="w-4 h-4 text-blue-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900 mb-1 text-sm md:text-base">¿Qué esperar?</h4>
                                                    <p className="text-xs md:text-sm text-gray-600">
                                                        Un corredor asociado Hommie organizará la visita y puede resolver todas tus dudas sobre la propiedad.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Footer compacto */}
                    <div className="px-4 md:px-5 py-4 border-t border-gray-100 flex-shrink-0">
                        <motion.button
                            onClick={step === 'confirm' ? handleConfirm : handleNext}
                            disabled={!canProceed() || isValidating}
                            className={`w-full py-3 md:py-4 px-6 rounded-2xl font-semibold transition-all duration-150 text-base min-h-[52px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                                !canProceed() || isValidating
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                                }`}
                            whileHover={!shouldReduceMotion && !canProceed() ? {} : { scale: canProceed() ? 1.02 : 1 }}
                            whileTap={!shouldReduceMotion && !canProceed() ? {} : { scale: canProceed() ? 0.98 : 1 }}
                            aria-disabled={!canProceed() || isValidating}
                        >
                            {step === 'confirm' ? 'Confirmar visita' : 'Continuar →'}
                        </motion.button>
                        {step === 'contact' && (
                            <p className="text-center text-xs text-gray-500 mt-2">
                                Tus datos se guardan automáticamente
                            </p>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
