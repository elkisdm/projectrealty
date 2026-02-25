'use client';

import * as React from 'react';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
    CheckCircle,
    AlertCircle,
    Loader2,
    X,
    ChevronRight,
    Calendar as CalendarIcon,
    MessageCircle
} from 'lucide-react';
import { useVisitScheduler } from '../../hooks/useVisitScheduler';
import { DaySlot, TimeSlot, ContactData, CreateVisitResponse } from '../../types/visit';
import { logger } from '@lib/logger';
import { visitFormSchema, type VisitFormData } from '@/lib/validations/visit';
import type { Unit, Building } from '@schemas/models';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { track, ANALYTICS_EVENTS } from '@lib/analytics';
import { generateAndDownloadICS } from '@lib/calendar/ics-generator';
import { toast } from 'sonner';
import { ScrollFadeEffect } from '@/components/ncdai/scroll-fade-effect';

interface QuintoAndarVisitSchedulerProps {
    isOpen: boolean;
    onClose: () => void;
    listingId: string;
    propertyName: string;
    propertyAddress: string;
    propertyImage?: string;
    // Nuevos props para datos reales de la base de datos
    unit?: Unit;
    building?: Building;
    onSuccess?: (visitData: CreateVisitResponse) => void;
}

// TypeScript: Tipos mejorados (4 pasos: selección → contacto → calificación → éxito)
type Step = 'selection' | 'contact' | 'qualification' | 'success';

interface FormErrors {
    name?: string;
    email?: string;
    phone?: string;
    rut?: string;
}

interface RentalQualification {
    needsToMoveIn30Days: boolean | null;
    hasGuarantor: boolean | null;
    hasSufficientIncome: boolean | null;
    rentalPurpose: 'residencial' | 'inversión';
    incomeAboveArriendoX3: boolean | null;
    negativeDicom: boolean | null;
}

export function QuintoAndarVisitScheduler({
    isOpen,
    onClose,
    listingId,
    propertyName,
    propertyAddress,
    propertyImage,
    unit,
    building,
    onSuccess
}: QuintoAndarVisitSchedulerProps) {
    // A11y: Hook para reducir movimiento
    const shouldReduceMotion = useReducedMotion();

    // A11y: Referencias para focus trap
    const modalRef = useRef<HTMLDivElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const previousActiveElement = useRef<HTMLElement | null>(null);

    // Performance: Referencias para confeti
    const windowSizeRef = useRef({ width: 0, height: 0 });

    // Usar datos reales de la base de datos si están disponibles
    const finalPropertyImage = unit?.images?.[0]
        || building?.gallery?.[0]
        || building?.coverImage
        || propertyImage;

    const arriendo = unit?.price || 0;
    const gastoComun = unit?.gastoComun ?? unit?.gc ?? unit?.gastosComunes ?? 0;
    const area = unit?.m2 || unit?.area_interior_m2;
    const dormitorios = unit?.dormitorios || unit?.bedrooms || 0;
    const estacionamiento = unit?.estacionamiento || unit?.parking_opcional ? 1 : 0;
    const [step, setStep] = useState<Step>('selection');

    type ContactFormData = {
        name: string;
        email: string;
        phone: string;
        rut: string;
    };

    const [contactData, setContactData] = useState<ContactFormData>({
        name: '',
        email: '',
        phone: '',
        rut: ''
    });
    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [isFormValid, setIsFormValid] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [visitResponse, setVisitResponse] = useState<CreateVisitResponse | null>(null);

    // Estados para calificación de arriendo (paso 3: 3 preguntas deslizables)
    const [rentalQualification, setRentalQualification] = useState<RentalQualification>({
        needsToMoveIn30Days: null,
        hasGuarantor: null,
        hasSufficientIncome: null,
        rentalPurpose: 'residencial',
        incomeAboveArriendoX3: null,
        negativeDicom: null,
    });

    // Estado para controlar qué pregunta está visible
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    // Estado para controlar qué campo del formulario está visible
    const [currentFieldIndex, setCurrentFieldIndex] = useState(0);

    // Estado para confirmación antes de cerrar
    const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);

    // Configuración de las 3 preguntas del paso calificación (una a la vez)
    const qualificationQuestions = useMemo(() => {
        const arriendoX3 = (arriendo * 3).toLocaleString('es-CL');
        return [
            {
                key: 'incomeAboveArriendoX3' as const,
                title: `Entre tú y tu aval, ¿tienen una renta superior a $${arriendoX3}?`,
                options: ['Sí', 'No'] as const,
            },
            {
                key: 'needsToMoveIn30Days' as const,
                title: '¿Te mudas en los próximos 30 días?',
                options: ['Sí', 'No'] as const,
            },
            {
                key: 'negativeDicom' as const,
                title: '¿Tienes reporte negativo en Dicom?',
                options: ['Sí', 'No'] as const,
            },
        ];
    }, [arriendo]);

    // Configuración de campos del formulario: nombre, celular, RUT; email opcional al final
    const formFields = [
        {
            key: 'name',
            title: '¿Cuál es tu nombre completo?',
            type: 'text',
            placeholder: 'Tu nombre completo',
        },
        {
            key: 'phone',
            title: '¿Cuál es tu teléfono?',
            type: 'tel',
            placeholder: '+56 9 1234 5678',
        },
        {
            key: 'rut',
            title: 'RUT',
            type: 'text',
            placeholder: '12.345.678-9',
        },
        {
            key: 'email',
            title: '¿Cuál es tu email? (opcional)',
            type: 'email',
            placeholder: 'tu@email.com',
        }
    ];


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

    // Persistencia en localStorage
    const STORAGE_KEY = `visit_scheduler_${listingId}`;
    const STORAGE_EXPIRY_HOURS = 24;

    interface PersistedData {
        selectedDate: string | null;
        selectedTime: string | null;
        rentalQualification: RentalQualification;
        contactData: ContactFormData;
        step: Step;
        currentQuestionIndex: number;
        currentFieldIndex: number;
        timestamp: number;
    }

    // Guardar progreso en localStorage
    const saveProgress = useCallback(() => {
        try {
            const data: PersistedData = {
                selectedDate,
                selectedTime,
                rentalQualification,
                contactData,
                step,
                currentQuestionIndex,
                currentFieldIndex,
                timestamp: Date.now()
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (error) {
            // Silenciar errores de localStorage (puede fallar en modo privado)
            if (process.env.NODE_ENV === 'development') {
                logger.log('⚠️ Error guardando progreso:', error);
            }
        }
    }, [selectedDate, selectedTime, rentalQualification, contactData, step, currentQuestionIndex, currentFieldIndex, STORAGE_KEY]);

    // Cargar progreso desde localStorage
    const loadProgress = useCallback((): PersistedData | null => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (!stored) return null;

            const data: PersistedData = JSON.parse(stored);
            const now = Date.now();
            const ageHours = (now - data.timestamp) / (1000 * 60 * 60);

            // Validar que no esté expirado
            if (ageHours > STORAGE_EXPIRY_HOURS) {
                localStorage.removeItem(STORAGE_KEY);
                return null;
            }

            return data;
        } catch (error) {
            // Silenciar errores de localStorage
            if (process.env.NODE_ENV === 'development') {
                logger.log('⚠️ Error cargando progreso:', error);
            }
            return null;
        }
    }, [STORAGE_KEY]);

    // Limpiar progreso guardado
    const clearProgress = useCallback(() => {
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            // Silenciar errores
        }
    }, [STORAGE_KEY]);

    // Guardar progreso cuando cambian los datos relevantes (debounced para evitar demasiadas escrituras)
    const saveProgressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    useEffect(() => {
        if (isOpen && step !== 'success') {
            if (saveProgressTimeoutRef.current) {
                clearTimeout(saveProgressTimeoutRef.current);
            }
            saveProgressTimeoutRef.current = setTimeout(() => {
                saveProgress();
            }, 500); // Debounce de 500ms
        }

        return () => {
            if (saveProgressTimeoutRef.current) {
                clearTimeout(saveProgressTimeoutRef.current);
            }
        };
    }, [isOpen, step, selectedDate, selectedTime, rentalQualification, contactData, currentQuestionIndex, currentFieldIndex, saveProgress]);

    // Cargar progreso al abrir modal (solo una vez)
    const hasLoadedProgress = useRef(false);
    useEffect(() => {
        if (isOpen && !hasLoadedProgress.current) {
            const saved = loadProgress();
            if (saved) {
                // Restaurar datos guardados
                if (saved.selectedDate && saved.selectedTime) {
                    selectDateTime(saved.selectedDate, saved.selectedTime);
                } else if (saved.selectedDate) {
                    selectDateTime(saved.selectedDate, '');
                }
                const defaultQual: RentalQualification = { needsToMoveIn30Days: null, hasGuarantor: null, hasSufficientIncome: null, rentalPurpose: 'residencial', incomeAboveArriendoX3: null, negativeDicom: null };
                setRentalQualification({ ...defaultQual, ...saved.rentalQualification });
                const defaultContact: ContactFormData = { name: '', email: '', phone: '', rut: '' };
                setContactData({ ...defaultContact, ...saved.contactData });
                setCurrentQuestionIndex(saved.currentQuestionIndex);
                setCurrentFieldIndex(saved.currentFieldIndex);

                // Restaurar step si estaba más avanzado
                if (saved.step !== 'selection') {
                    setStep(saved.step);
                }

                if (process.env.NODE_ENV === 'development') {
                    logger.log('📦 Progreso restaurado desde localStorage:', saved);
                }
            }
            hasLoadedProgress.current = true;
        }

        if (!isOpen) {
            hasLoadedProgress.current = false;
        }
    }, [isOpen, loadProgress, selectDateTime]);

    // Cargar disponibilidad al abrir
    useEffect(() => {
        if (isOpen) {
            // Analytics: Track modal abierto
            track(ANALYTICS_EVENTS.VISIT_SCHEDULER_OPENED, {
                listing_id: listingId,
                property_name: propertyName
            });

            const startDate = new Date();
            const endDate = new Date();
            // Generar 6 días válidos (excluyendo domingos)
            // Necesitamos buscar hasta encontrar 6 días no-domingos
            let dayCount = 0;
            let validDays = 0;
            while (validDays < 6) {
                const checkDate = new Date();
                checkDate.setDate(checkDate.getDate() + dayCount);
                if (checkDate.getDay() !== 0) { // No es domingo
                    validDays++;
                }
                dayCount++;
            }
            endDate.setDate(endDate.getDate() + dayCount - 1);
            fetchAvailability(startDate, endDate);
        }
    }, [isOpen, fetchAvailability, listingId, propertyName]);

    // Performance: Solo loggear en desarrollo
    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            logger.log('📅 Available days updated:', availableDays);
        }
    }, [availableDays]);

    // Analytics: Track errores del scheduler
    useEffect(() => {
        if (error) {
            track(ANALYTICS_EVENTS.VISIT_SCHEDULER_ERROR, {
                listing_id: listingId,
                step,
                error_message: error.substring(0, 100), // Limitar longitud
                error_type: 'scheduler_error'
            });
        }
    }, [error, listingId, step]);


    // Manejar selección de fecha
    const handleDateSelect = (day: DaySlot) => {
        if (process.env.NODE_ENV === 'development') {
            logger.log('🗓️ Date selected:', { day, available: day.available });
        }
        if (!day.available) {
            if (process.env.NODE_ENV === 'development') {
                logger.log('❌ Day not available, ignoring selection');
            }
            return;
        }
        selectDateTime(day.date, '');
        clearError();

        // Analytics: Track fecha seleccionada
        track(ANALYTICS_EVENTS.VISIT_SCHEDULER_DATE_SELECTED, {
            listing_id: listingId,
            date: day.date,
            day_of_week: day.day
        });
    };

    // Manejar selección de hora
    const handleTimeSelect = (timeSlot: TimeSlot) => {
        if (!timeSlot.available) return;
        selectDateTime(selectedDate!, timeSlot.time);
        clearError();

        // Analytics: Track hora seleccionada
        track(ANALYTICS_EVENTS.VISIT_SCHEDULER_TIME_SELECTED, {
            listing_id: listingId,
            date: selectedDate,
            time: timeSlot.time
        });
    };

    // Code cleanup: Timeout ref para cleanup
    const questionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Manejar respuesta de calificación
    const handleQualificationAnswer = (questionKey: string, answer: boolean | string) => {
        if (process.env.NODE_ENV === 'development') {
            logger.log('📝 Answering question:', { questionKey, answer, currentQuestionIndex });
        }

        setRentalQualification(prev => ({
            ...prev,
            [questionKey]: answer
        }));

        // Analytics: Track respuesta de calificación
        track(ANALYTICS_EVENTS.VISIT_SCHEDULER_QUALIFICATION_ANSWERED, {
            listing_id: listingId,
            question_key: questionKey,
            question_index: currentQuestionIndex,
            answer: String(answer)
        });

        // Cleanup timeout anterior si existe
        if (questionTimeoutRef.current) {
            clearTimeout(questionTimeoutRef.current);
        }

        // Avanzar a la siguiente pregunta después de un pequeño delay
        questionTimeoutRef.current = setTimeout(() => {
            if (currentQuestionIndex < qualificationQuestions.length - 1) {
                setCurrentQuestionIndex(prev => {
                    const newIndex = prev + 1;
                    if (process.env.NODE_ENV === 'development') {
                        logger.log('➡️ Moving to next question:', newIndex);
                    }
                    return newIndex;
                });
            } else {
                if (process.env.NODE_ENV === 'development') {
                    logger.log('✅ All questions completed');
                }
            }
        }, 300);
    };

    // Cleanup timeouts en unmount
    useEffect(() => {
        return () => {
            if (questionTimeoutRef.current) {
                clearTimeout(questionTimeoutRef.current);
            }
        };
    }, []);

    // Flow: Función unificada para avanzar al siguiente campo
    const handleNextField = useCallback(() => {
        const currentField = formFields[currentFieldIndex];
        const value = contactData[currentField.key as keyof typeof contactData] || '';

        if (!value) return;

        // Validar campo específico con Zod
        const testData = { ...contactData, [currentField.key]: value };
        const fieldResult = visitFormSchema.safeParse({
            name: testData.name,
            email: testData.email || undefined,
            phone: testData.phone,
            rut: testData.rut,
        });

        // Si el campo actual es válido o es email (opcional), avanzar
        if (fieldResult.success || !fieldResult.error.errors.some(e => e.path[0] === currentField.key) || (currentField.key === 'email' && !value)) {
            // Analytics: Track campo completado
            track(ANALYTICS_EVENTS.VISIT_SCHEDULER_FIELD_COMPLETED, {
                listing_id: listingId,
                field_key: currentField.key,
                field_index: currentFieldIndex
            });

            if (currentFieldIndex < formFields.length - 1) {
                setCurrentFieldIndex(prev => {
                    const newIndex = prev + 1;
                    if (process.env.NODE_ENV === 'development') {
                        logger.log('➡️ Moving to next field:', newIndex);
                    }
                    return newIndex;
                });
            } else {
                if (process.env.NODE_ENV === 'development') {
                    logger.log('✅ All fields completed');
                }
            }
        }
    }, [currentFieldIndex, contactData, listingId]);

    // Manejar respuesta de campo del formulario
    const handleFieldAnswer = (fieldKey: string, value: string) => {
        if (process.env.NODE_ENV === 'development') {
            logger.log('📝 Answering field:', { fieldKey, value, currentFieldIndex });
        }

        // Analytics: Track inicio de campo (primera vez que se escribe)
        const previousValue = contactData[fieldKey as keyof typeof contactData] || '';
        if (!previousValue && value) {
            track(ANALYTICS_EVENTS.VISIT_SCHEDULER_FIELD_STARTED, {
                listing_id: listingId,
                field_key: fieldKey,
                field_index: currentFieldIndex
            });
        }

        // Actualizar datos
        setContactData(prev => ({
            ...prev,
            [fieldKey]: value
        }));
    };

    // Flow: Verificar si se puede continuar del paso de selección (preguntas opcionales)
    const canContinue = useMemo(() => {
        // Solo requiere fecha y hora seleccionadas
        // Las preguntas de calificación son opcionales
        return !!(selectedDate && selectedTime);
    }, [selectedDate, selectedTime]);

    // Performance: Memoizar validación del formulario (incluye RUT)
    const canContinueForm = useMemo(() => {
        const result = visitFormSchema.safeParse({
            name: contactData.name,
            email: contactData.email || undefined,
            phone: contactData.phone,
            rut: contactData.rut,
        });
        return result.success;
    }, [contactData]);

    // Performance: Memoizar validación del campo actual
    const isCurrentFieldValid = useMemo(() => {
        const currentField = formFields[currentFieldIndex];
        const value = contactData[currentField.key as keyof typeof contactData] || '';

        // Email es opcional, siempre se considera válido
        if (currentField.key === 'email') return true;

        // Si está vacío, no es válido (excepto email)
        if (!value) return false;

        // Validar campo específico con Zod
        const testData = { ...contactData, [currentField.key]: value };
        const result = visitFormSchema.safeParse({
            name: testData.name,
            email: testData.email || undefined,
            phone: testData.phone,
            rut: testData.rut,
        });

        // Si la validación completa es exitosa, el campo es válido
        if (result.success) return true;

        // Si hay errores, verificar si el error es del campo actual
        return !result.error.errors.some(e => e.path[0] === currentField.key);
    }, [currentFieldIndex, contactData]);

    // Performance: Solo loggear en desarrollo
    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            logger.log('🔍 Debug canContinue:', {
                selectedDate,
                selectedTime,
                needsToMoveIn30Days: rentalQualification.needsToMoveIn30Days,
                hasGuarantor: rentalQualification.hasGuarantor,
                hasSufficientIncome: rentalQualification.hasSufficientIncome,
                canContinue
            });
        }
    }, [selectedDate, selectedTime, rentalQualification, canContinue]);

    // Continuar al formulario
    const handleContinue = () => {
        if (canContinue) {
            setCurrentFieldIndex(0); // Resetear índice del formulario
            setStep('contact');
        }
    };


    // Code refactor: Función unificada para submit de formulario (crear visita)
    const handleFormSubmit = useCallback(async () => {
        // Validar y normalizar con Zod antes de enviar
        const validationResult = visitFormSchema.safeParse({
            name: contactData.name,
            email: contactData.email || undefined,
            phone: contactData.phone,
            rut: contactData.rut,
        });

        if (!validationResult.success) {
            // Mostrar errores
            const errors: FormErrors = {};
            validationResult.error.errors.forEach((error) => {
                if (error.path[0]) {
                    errors[error.path[0] as keyof FormErrors] = error.message;
                }
            });
            setFormErrors(errors);
            return;
        }

        // Usar datos normalizados (el teléfono ya está normalizado por Zod)
        const normalizedData = validationResult.data;

        const result = await createVisit({
            name: normalizedData.name,
            phone: normalizedData.phone, // Ya normalizado
            email: normalizedData.email,
            rut: normalizedData.rut
        });

        if (result) {
            setVisitResponse(result);
            setStep('success');
            setShowConfetti(true);
            onSuccess?.(result);

            // Limpiar progreso guardado al completar
            clearProgress();

            // Analytics: Track visita completada exitosamente
            track(ANALYTICS_EVENTS.VISIT_SCHEDULER_COMPLETED, {
                listing_id: listingId,
                visit_id: result.visitId,
                date: selectedDate,
                time: selectedTime,
                has_email: !!normalizedData.email
            });
        } else {
            // Analytics: Track error al crear visita
            track(ANALYTICS_EVENTS.VISIT_SCHEDULER_ERROR, {
                listing_id: listingId,
                step: 'form_submit',
                error_type: 'creation_failed'
            });
        }
    }, [contactData, createVisit, onSuccess, listingId, selectedDate, selectedTime, clearProgress]);

    // Paso contact → qualification: validar formulario y avanzar (no enviar visita aún)
    const handleContactContinue = () => {
        const validationResult = visitFormSchema.safeParse({
            name: contactData.name,
            email: contactData.email || undefined,
            phone: contactData.phone,
            rut: contactData.rut,
        });
        if (!validationResult.success) {
            const errors: FormErrors = {};
            validationResult.error.errors.forEach((error) => {
                if (error.path[0]) {
                    errors[error.path[0] as keyof FormErrors] = error.message;
                }
            });
            setFormErrors(errors);
            return;
        }
        setFormErrors({});
        setCurrentQuestionIndex(0);
        setStep('qualification');
    };

    // Paso qualification: Continuar (siguiente pregunta o enviar visita)
    const handleQualificationContinue = () => {
        if (currentQuestionIndex < qualificationQuestions.length - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
        } else {
            handleFormSubmit();
        }
    };

    // Regresar al paso anterior (4 pasos: selection → contact → qualification → success)
    const handleBack = () => {
        if (step === 'contact') {
            setCurrentFieldIndex(0);
            setStep('selection');
        } else if (step === 'qualification') {
            setCurrentQuestionIndex(0);
            setStep('contact');
        } else if (step === 'success') {
            setStep('qualification');
        }
    };

    // Manejar envío del formulario (usa función unificada)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) return;
        await handleFormSubmit();
    };

    // Generar evento de calendario para Google Calendar
    const generateCalendarEvent = useCallback(() => {
        if (!selectedDate || !selectedTime) return;

        const startDate = new Date(`${selectedDate}T${selectedTime}:00-03:00`);
        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hora después

        const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Visita: ${propertyName}&dates=${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=Visita programada para ${propertyName} en ${propertyAddress}`;
        window.open(googleCalendarUrl, '_blank');
    }, [selectedDate, selectedTime, propertyName, propertyAddress]);

    // Generar y descargar archivo ICS
    const handleDownloadICS = useCallback(() => {
        if (!selectedDate || !selectedTime || !visitResponse) return;

        const startDate = new Date(`${selectedDate}T${selectedTime}:00-03:00`);
        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hora después

        generateAndDownloadICS({
            title: `Visita: ${propertyName}`,
            description: `Visita programada para ${propertyName} en ${propertyAddress}.${visitResponse.agent.name ? ` Agente: ${visitResponse.agent.name}.` : ''}`,
            startDate,
            endDate,
            location: propertyAddress,
            organizer: visitResponse.agent.name ? {
                name: visitResponse.agent.name,
                email: visitResponse.agent.phone ? undefined : undefined
            } : undefined
        });
    }, [selectedDate, selectedTime, propertyName, propertyAddress, visitResponse]);

    // Contactar por WhatsApp
    const handleWhatsAppContact = useCallback(() => {
        if (!visitResponse?.agent.whatsappNumber) return;
        const message = encodeURIComponent(`Hola, tengo una consulta sobre la visita agendada para ${propertyName}`);
        window.open(`https://wa.me/${visitResponse.agent.whatsappNumber.replace(/[^0-9]/g, '')}?text=${message}`, '_blank');
    }, [visitResponse, propertyName]);

    // Reintentar envío
    const handleRetry = useCallback(() => {
        clearError();
        // Volver al paso de contacto para reintentar
        setStep('contact');
    }, [clearError]);

    // Verificar si hay datos ingresados que se perderían al cerrar
    const hasUnsavedData = useMemo(() => {
        if (step === 'success') return false; // No necesita confirmación si ya completó
        return !!(selectedDate || selectedTime || contactData.name || contactData.phone || contactData.email || contactData.rut);
    }, [step, selectedDate, selectedTime, contactData]);

    const performClose = useCallback(() => {
        // Analytics: Track abandono si no está en success
        if (step !== 'success') {
            const hasData = !!(selectedDate || selectedTime || contactData.name || contactData.phone);
            track(ANALYTICS_EVENTS.VISIT_SCHEDULER_ABANDONED, {
                listing_id: listingId,
                step,
                current_question_index: currentQuestionIndex,
                current_field_index: currentFieldIndex,
                has_date: !!selectedDate,
                has_time: !!selectedTime,
                has_contact_data: hasData
            });
        }

        setStep('selection');
        setShowCloseConfirmation(false);
        setShowConfetti(false);
        // Limpiar timeouts
        if (questionTimeoutRef.current) {
            clearTimeout(questionTimeoutRef.current);
        }
        onClose();
    }, [step, listingId, selectedDate, selectedTime, contactData, currentQuestionIndex, currentFieldIndex, onClose]);

    const handleClose = useCallback(() => {
        // Si hay datos sin guardar y no está en success, mostrar confirmación
        if (hasUnsavedData && step !== 'success') {
            setShowCloseConfirmation(true);
            return;
        }

        // Cerrar directamente si no hay datos o ya completó
        performClose();
    }, [hasUnsavedData, step, performClose]);

    // Ref para desacoplar handleClose del focus trap (evita re-ejecutar el effect en cada tecla)
    const handleCloseRef = useRef(handleClose);
    useEffect(() => {
        handleCloseRef.current = handleClose;
    }, [handleClose]);

    const handleConfirmClose = useCallback(() => {
        performClose();
    }, [performClose]);

    const handleCancelClose = useCallback(() => {
        setShowCloseConfirmation(false);
    }, []);

    // TypeScript: Información del paso actual con tipado estricto (4 pasos)
    const getStepInfo = useCallback((currentStep: Step) => {
        switch (currentStep) {
            case 'selection':
                return { number: 1, title: 'Selecciona fecha y hora', description: 'Elige el mejor momento para tu visita' };
            case 'contact':
                return { number: 2, title: 'Datos de contacto', description: 'Completa tus datos para confirmar la visita' };
            case 'qualification':
                return { number: 3, title: 'Calificación', description: 'Responde unas breves preguntas' };
            case 'success':
                return { number: 4, title: '¡Visita confirmada!', description: 'Todo listo para tu visita' };
            default:
                return { number: 1, title: 'Agendar visita', description: 'Programa tu visita' };
        }
    }, []);

    const stepInfo = getStepInfo(step);

    // A11y: Configuración de animaciones respetando prefers-reduced-motion
    const animationConfig = useMemo(() => {
        if (shouldReduceMotion) {
            return { duration: 0, ease: "linear" as const };
        }
        return { duration: 0.3, ease: "easeInOut" as const };
    }, [shouldReduceMotion]);

    // A11y: Focus trap y scroll lock
    useEffect(() => {
        if (!isOpen) return;

        // Guardar elemento activo previo
        previousActiveElement.current = document.activeElement as HTMLElement;

        // Scroll lock
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        // Función para obtener elementos focusables
        const getFocusableElements = () => {
            if (!modalRef.current) return [];
            return Array.from(
                modalRef.current.querySelectorAll(
                    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
                )
            ).filter((el) => {
                const element = el as HTMLElement;
                return element.offsetParent !== null &&
                    !element.getAttribute('aria-hidden');
            }) as HTMLElement[];
        };

        // Función para manejar Tab y Escape (usa ref para no re-ejecutar effect al escribir)
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                handleCloseRef.current?.();
                return;
            }

            if (e.key === 'Tab') {
                const focusableElements = getFocusableElements();
                if (focusableElements.length === 0) return;

                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];

                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        // Focus inicial
        const focusTimer = setTimeout(() => {
            if (closeButtonRef.current) {
                closeButtonRef.current.focus();
            } else {
                const focusableElements = getFocusableElements();
                if (focusableElements.length > 0) {
                    focusableElements[0].focus();
                }
            }
        }, 10);

        return () => {
            clearTimeout(focusTimer);
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = originalOverflow;

            // Restaurar focus solo si el foco ya no está dentro del modal (evita robar foco al escribir)
            const activeEl = document.activeElement as HTMLElement | null;
            const focusInsideModal = modalRef.current?.contains(activeEl);
            if (!focusInsideModal && previousActiveElement.current) {
                previousActiveElement.current.focus();
            }
        };
    }, [isOpen]);

    // Performance: Actualizar dimensiones de ventana para confeti
    useEffect(() => {
        if (typeof window !== 'undefined') {
            windowSizeRef.current = {
                width: window.innerWidth,
                height: window.innerHeight
            };

            const handleResize = () => {
                windowSizeRef.current = {
                    width: window.innerWidth,
                    height: window.innerHeight
                };
            };

            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
        }
    }, []);

    if (!isOpen) return null;

    return (
        <>
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={animationConfig}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    onClick={handleClose}
                >
                    <motion.div
                        ref={modalRef}
                        initial={shouldReduceMotion ? { opacity: 0 } : { scale: 0.98, opacity: 0 }}
                        animate={shouldReduceMotion ? { opacity: 1 } : { scale: 1, opacity: 1 }}
                        exit={shouldReduceMotion ? { opacity: 0 } : { scale: 0.98, opacity: 0 }}
                        transition={animationConfig}
                        className="fixed inset-0 w-full h-full bg-white dark:bg-gray-900 flex flex-col overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="modal-title"
                        aria-describedby="modal-description"
                    >
                        {/* Header: compacto, minimalista */}
                        <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 space-y-3">
                            <div className="flex items-start justify-between gap-2">
                                <h1 id="modal-title" className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white leading-tight pr-2">
                                    ¿Cuándo quieres visitar esta propiedad?
                                </h1>
                                <button
                                    ref={closeButtonRef}
                                    onClick={handleClose}
                                    className="flex-shrink-0 min-h-11 min-w-11 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                    aria-label="Cerrar modal"
                                >
                                    <X className="w-5 h-5 text-gray-500 dark:text-gray-300" />
                                </button>
                            </div>

                            {/* Card de propiedad: compacta, imagen y texto equilibrados */}
                            <div className={`p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 ${finalPropertyImage ? 'grid grid-cols-2 gap-3 sm:gap-4 items-stretch' : 'block'}`}>
                                {finalPropertyImage && (
                                    <div className="relative min-h-0 w-full aspect-square rounded-xl overflow-hidden">
                                        <Image
                                            src={finalPropertyImage}
                                            alt={propertyName}
                                            fill
                                            sizes="(max-width: 640px) 50vw, 200px"
                                            className="object-cover"
                                            loading="lazy"
                                            placeholder="blur"
                                            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                                        />
                                    </div>
                                )}
                                <div className={`flex flex-col justify-between gap-2 min-w-0 ${finalPropertyImage ? 'py-0.5' : ''}`}>
                                    {/* Bloque Ubicación */}
                                    <div className="space-y-0.5">
                                        {(unit?.codigoUnidad || unit?.tipologia) && (
                                            <p className="text-xs font-semibold text-gray-900 dark:text-white leading-tight">
                                                {[unit?.codigoUnidad && `Unidad ${unit.codigoUnidad}`, unit?.tipologia].filter(Boolean).join(' · ')}
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-snug">
                                            {building?.address || propertyAddress}
                                        </p>
                                        {building?.comuna && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {building.comuna}
                                            </p>
                                        )}
                                    </div>
                                    {/* Bloque Precio y detalles */}
                                    <div className="pt-1.5 mt-auto border-t border-gray-200 dark:border-gray-600 space-y-0.5">
                                        {arriendo > 0 && (
                                            <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                                                ${arriendo.toLocaleString('es-CL')} <span className="font-normal text-gray-600 dark:text-gray-400">arriendo</span>
                                            </p>
                                        )}
                                        {(gastoComun !== undefined && gastoComun > 0) && (
                                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                                ${gastoComun.toLocaleString('es-CL')} gastos comunes
                                            </p>
                                        )}
                                        {(area || dormitorios > 0 || estacionamiento > 0) && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {[
                                                    area && `${area} m²`,
                                                    dormitorios > 0 && `${dormitorios} dormitorio${dormitorios > 1 ? 's' : ''}`,
                                                    estacionamiento > 0 && `${estacionamiento} estacionamiento`
                                                ].filter(Boolean).join(' · ')}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div id="modal-description" className="sr-only">
                                Modal de agendamiento de visita para {propertyName}
                            </div>

                            {/* Progress bar y paso actual - solo en pasos 2 y 3 */}
                            {step !== 'selection' && (
                                <div className="space-y-2 pt-1">
                                    <div className="flex gap-2" aria-hidden="true">
                                        {[1, 2, 3, 4].map((stepNumber) => (
                                            <div
                                                key={stepNumber}
                                                className={`flex-1 h-2 rounded-full transition-colors ${stepNumber <= stepInfo.number
                                                    ? 'bg-blue-600'
                                                    : 'bg-gray-200 dark:bg-gray-700'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                                            {stepInfo.title}
                                        </h2>
                                        <span className="text-sm text-gray-600 dark:text-gray-400" aria-hidden="true">
                                            {stepInfo.number}/4
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {stepInfo.description}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Content: área central con scroll por paso */}
                        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                            {/* Step 1: Selección de fecha y hora */}
                            {step === 'selection' && (
                                <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                                    <ScrollFadeEffect orientation="vertical" className="flex-1 min-h-0">
                                    <div className="p-3 sm:p-4 space-y-4">
                                        {/* UX: Loading state mientras carga disponibilidad */}
                                        {isLoading && !availableDays.length && (
                                            <div className="flex items-center justify-center py-6">
                                                <Loader2 className="w-5 h-5 animate-spin text-blue-600" aria-hidden />
                                                <span className="ml-2 text-xs text-gray-600 dark:text-gray-400">Cargando disponibilidad...</span>
                                            </div>
                                        )}
                                        {/* Selección de fecha */}
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                                Elige un día
                                            </h4>
                                            <div className="flex gap-2 overflow-x-auto pb-1">
                                                {availableDays.map((day) => (
                                                    <button
                                                        key={day.id}
                                                        onClick={() => handleDateSelect(day)}
                                                        disabled={!day.available}
                                                        className={`flex-shrink-0 w-12 h-12 rounded-full text-center transition-colors ${selectedDate === day.date
                                                            ? 'bg-blue-500 text-white'
                                                            : day.available
                                                                ? 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700'
                                                                : 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-500'
                                                            }`}
                                                    >
                                                        <div className="text-[10px] font-medium leading-tight">{day.day}</div>
                                                        <div className="text-sm font-bold leading-tight">{day.number}</div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Selección de hora */}
                                        {selectedDate && (
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                                    Elige un horario
                                                </h4>
                                                <div className="flex gap-2 overflow-x-auto pb-1">
                                                    {availableSlots.map((timeSlot) => (
                                                        <button
                                                            key={timeSlot.id}
                                                            onClick={() => handleTimeSelect(timeSlot)}
                                                            disabled={!timeSlot.available}
                                                            className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm text-center transition-colors min-w-[72px] ${selectedTime === timeSlot.time
                                                                ? 'bg-blue-500 text-white'
                                                                : timeSlot.available
                                                                    ? 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700'
                                                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-500'
                                                                }`}
                                                        >
                                                            {timeSlot.time}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Enlace para solicitar otra fecha/horario (referencia QuintoAndar) */}
                                        {selectedDate && (
                                            <div className="pt-1">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        toast.info('Pronto podrás solicitar otra fecha. Mientras tanto, elige entre las opciones disponibles.');
                                                        handleClose();
                                                    }}
                                                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded"
                                                >
                                                    Solicitar otra fecha y horario
                                                </button>
                                            </div>
                                        )}

                                    </div>
                                    </ScrollFadeEffect>

                                    {/* Botón continuar - ancho reducido, texto ligeramente suave */}
                                    <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex-shrink-0 flex justify-center">
                                        <button
                                            onClick={handleContinue}
                                            disabled={!canContinue || isLoading}
                                            className="w-full max-w-[92%] min-h-11 py-2.5 px-4 rounded-full text-sm font-medium text-white/90 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors touch-manipulation active:scale-[0.98] flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                        >
                                            {isLoading && (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            )}
                                            {canContinue ? 'Continuar' : 'Completa todas las opciones'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Datos de contacto – compacto, minimalista, campos visibles sin scroll */}
                            {step === 'contact' && (
                                <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                                    <ScrollFadeEffect orientation="vertical" className="flex-1 min-h-0">
                                    <div className="p-3 sm:p-4 space-y-3">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            2/4 – Datos de contacto
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                            Completa tus datos para confirmar la visita.
                                        </p>
                                        <div className="space-y-2.5">
                                            {formFields.map((field) => (
                                                <div key={field.key}>
                                                    <label htmlFor={`contact-${field.key}`} className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-0.5">
                                                        {field.title}
                                                    </label>
                                                    <input
                                                        id={`contact-${field.key}`}
                                                        type={field.type}
                                                        value={contactData[field.key as keyof ContactFormData] || ''}
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            setContactData(prev => ({ ...prev, [field.key]: value }));
                                                            if (formErrors[field.key as keyof FormErrors]) {
                                                                setFormErrors(prev => ({ ...prev, [field.key]: undefined }));
                                                            }
                                                        }}
                                                        className="w-full p-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white transition-colors"
                                                        placeholder={field.placeholder}
                                                        aria-invalid={!!formErrors[field.key as keyof FormErrors]}
                                                        aria-describedby={formErrors[field.key as keyof FormErrors] ? `contact-${field.key}-error` : undefined}
                                                        autoFocus={field.key === 'name'}
                                                    />
                                                    {formErrors[field.key as keyof FormErrors] && (
                                                        <p id={`contact-${field.key}-error`} className="mt-0.5 text-xs text-red-600 dark:text-red-400" role="alert">
                                                            {formErrors[field.key as keyof FormErrors]}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    </ScrollFadeEffect>

                                    <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex-shrink-0 flex gap-3 items-center justify-between">
                                        <button
                                            type="button"
                                            onClick={handleBack}
                                            className="flex-1 min-h-11 py-2.5 px-4 rounded-full text-sm font-bold text-gray-900 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                        >
                                            Atrás
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleContactContinue}
                                            disabled={!canContinueForm}
                                            className="flex-1 min-h-11 py-2.5 px-4 rounded-full text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors touch-manipulation active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                        >
                                            {canContinueForm ? 'Sí, solicitar visita' : 'Completa nombre, teléfono y RUT'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Calificación (3 preguntas deslizables) */}
                            {step === 'qualification' && (
                                <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                                    <ScrollFadeEffect orientation="vertical" className="flex-1 min-h-0">
                                    <div className="p-4 sm:p-5 space-y-4">
                                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                            Pregunta {currentQuestionIndex + 1} de {qualificationQuestions.length}
                                        </p>
                                        <AnimatePresence mode="wait">
                                            <motion.div
                                                key={currentQuestionIndex}
                                                initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 20 }}
                                                animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
                                                exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -20 }}
                                                transition={animationConfig}
                                            >
                                                <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                                                    {qualificationQuestions[currentQuestionIndex].title}
                                                </h4>
                                                <div className="space-y-3">
                                                    <div className="flex gap-2 sm:gap-3">
                                                        {qualificationQuestions[currentQuestionIndex].options.map((option) => {
                                                            const questionKey = qualificationQuestions[currentQuestionIndex].key;
                                                            const currentValue = rentalQualification[questionKey as keyof RentalQualification];
                                                            const isSelected = currentValue === (option === 'Sí');

                                                            return (
                                                                <button
                                                                    key={option}
                                                                    type="button"
                                                                    onClick={() => handleQualificationAnswer(questionKey, option === 'Sí')}
                                                                    className={`flex-1 min-w-[100px] py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl text-center transition-colors font-medium text-sm sm:text-base ${isSelected
                                                                        ? 'bg-blue-500 text-white'
                                                                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700'
                                                                        } focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500`}
                                                                >
                                                                    {option}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (currentQuestionIndex < qualificationQuestions.length - 1) {
                                                                setCurrentQuestionIndex((prev) => prev + 1);
                                                            }
                                                        }}
                                                        className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors underline"
                                                    >
                                                        Saltar
                                                    </button>
                                                </div>
                                            </motion.div>
                                        </AnimatePresence>
                                    </div>
                                    </ScrollFadeEffect>
                                    <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex-shrink-0 flex gap-3 items-center justify-between">
                                        <button
                                            type="button"
                                            onClick={handleBack}
                                            className="flex-1 min-h-11 py-2.5 px-4 rounded-full text-sm font-bold text-gray-900 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                        >
                                            Atrás
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleQualificationContinue}
                                            disabled={isLoading}
                                            className="flex-1 min-h-11 py-2.5 px-4 rounded-full text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors touch-manipulation active:scale-[0.98] flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Procesando...
                                                </>
                                            ) : (
                                                currentQuestionIndex < qualificationQuestions.length - 1 ? 'Continuar' : 'Sí, solicitar visita'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Éxito */}
                            {step === 'success' && (
                                <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                                    <div className="flex-1 p-3 sm:p-4 overflow-y-auto flex flex-col items-center justify-center text-center">
                                        {/* Performance: Lazy render del confeti solo cuando se muestra */}
                                        {showConfetti && !shouldReduceMotion && (
                                            <div className="absolute inset-0 pointer-events-none">
                                                {[...Array(20)].map((_, i) => (
                                                    <motion.div
                                                        key={i}
                                                        className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                                                        initial={{
                                                            x: Math.random() * (windowSizeRef.current.width || window.innerWidth),
                                                            y: -10,
                                                            rotate: 0
                                                        }}
                                                        animate={{
                                                            y: (windowSizeRef.current.height || window.innerHeight) + 10,
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
                                            initial={shouldReduceMotion ? { opacity: 0 } : { scale: 0.98, opacity: 0 }}
                                            animate={shouldReduceMotion ? { opacity: 1 } : { scale: 1, opacity: 1 }}
                                            transition={animationConfig}
                                            className="mb-4 sm:mb-6"
                                        >
                                            <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-green-600 mx-auto mb-3 sm:mb-4" />
                                        </motion.div>

                                        <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                                            ¡Visita confirmada!
                                        </h3>
                                        <p className="text-base mb-6 text-gray-600 dark:text-gray-400">
                                            Tu visita ha sido programada exitosamente. Te contactaremos pronto con los detalles.
                                        </p>

                                        <div className="p-4 rounded-xl mb-6 w-full bg-gray-100 dark:bg-gray-800">
                                            <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">
                                                Detalles de la visita:
                                            </h4>
                                            <div className="space-y-1 text-sm">
                                                <p className="text-gray-600 dark:text-gray-300">
                                                    <strong>Fecha:</strong> {selectedDate ? new Date(selectedDate).toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                                                </p>
                                                <p className="text-gray-600 dark:text-gray-300">
                                                    <strong>Hora:</strong> {selectedTime}
                                                </p>
                                                <p className="text-gray-600 dark:text-gray-300">
                                                    <strong>Propiedad:</strong> {propertyName}
                                                </p>
                                                {visitResponse?.agent && (
                                                    <>
                                                        <p className="text-gray-600 dark:text-gray-300">
                                                            <strong>Agente:</strong> {visitResponse.agent.name}
                                                        </p>
                                                        <p className="text-gray-600 dark:text-gray-300">
                                                            <strong>Teléfono:</strong> {visitResponse.agent.phone}
                                                        </p>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* Botones de acción */}
                                        <div className="mb-6 space-y-3">
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={generateCalendarEvent}
                                                    className="flex-1 flex items-center justify-center gap-3 py-3 px-6 rounded-xl border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors font-semibold"
                                                >
                                                    <CalendarIcon className="w-5 h-5" />
                                                    Google Calendar
                                                </button>
                                                <button
                                                    onClick={handleDownloadICS}
                                                    className="flex-1 flex items-center justify-center gap-3 py-3 px-6 rounded-xl border-2 border-gray-600 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-500 dark:text-gray-400 transition-colors font-semibold"
                                                    title="Descargar archivo ICS para Outlook, Apple Calendar, etc."
                                                >
                                                    <CalendarIcon className="w-5 h-5" />
                                                    Descargar ICS
                                                </button>
                                            </div>
                                            {visitResponse?.agent.whatsappNumber && (
                                                <button
                                                    onClick={handleWhatsAppContact}
                                                    className="w-full flex items-center justify-center gap-3 py-3 px-6 rounded-xl border-2 border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors font-semibold"
                                                >
                                                    <MessageCircle className="w-5 h-5" />
                                                    Contactar por WhatsApp
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Botón cerrar - fijo en la parte inferior */}
                                    <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex-shrink-0">
                                        <button
                                            onClick={handleClose}
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 sm:py-4 px-6 rounded-2xl transition-colors text-base sm:text-lg touch-manipulation active:scale-95 shadow-lg"
                                        >
                                            Cerrar
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* UX: Error message mejorado - más visible */}
                        {error && (
                            <div className="p-3 sm:p-4 border-t border-gray-200 bg-red-50 dark:border-gray-700 dark:bg-red-900/20 flex-shrink-0">
                                <div className="flex items-start gap-3 mb-4">
                                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-red-800 dark:text-red-400 mb-1">
                                            {error.includes('disponible') || error.includes('horario')
                                                ? 'Horario no disponible'
                                                : error.includes('solicitudes') || error.includes('Rate limit')
                                                    ? 'Demasiadas solicitudes'
                                                    : 'Error al agendar visita'}
                                        </h4>
                                        <p className="text-sm text-red-600 dark:text-red-400 mb-2">{error}</p>
                                        {error.includes('disponible') && (
                                            <p className="text-xs text-red-500 dark:text-red-500 mt-1">
                                                💡 Sugerencia: Selecciona otra fecha u hora disponible
                                            </p>
                                        )}
                                        {error.includes('solicitudes') && (
                                            <p className="text-xs text-red-500 dark:text-red-500 mt-1">
                                                💡 Sugerencia: Espera unos segundos antes de intentar nuevamente
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 mt-4">
                                    <button
                                        onClick={handleRetry}
                                        className="w-full py-2 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors text-sm"
                                    >
                                        Reintentar
                                    </button>
                                    <button
                                        onClick={() => {
                                            // Contactar directamente - abrir WhatsApp o teléfono
                                            const phone = visitResponse?.agent?.whatsappNumber || visitResponse?.agent?.phone || '';
                                            if (phone) {
                                                const cleanPhone = phone.replace(/[^0-9]/g, '');
                                                const message = encodeURIComponent(`Hola, tuve un problema al agendar una visita para ${propertyName}. ¿Pueden ayudarme?`);
                                                window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
                                            }
                                        }}
                                        className="w-full py-2 px-4 rounded-lg border-2 border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-semibold transition-colors text-sm flex items-center justify-center gap-2"
                                    >
                                        <MessageCircle className="w-4 h-4" />
                                        Contactar directamente
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            </AnimatePresence>

            {/* Modal de confirmación antes de cerrar */}
            <AnimatePresence>
                {showCloseConfirmation && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
                        onClick={handleCancelClose}
                        aria-modal="true"
                        aria-labelledby="close-confirmation-title"
                        role="dialog"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
                            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 id="close-confirmation-title" className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                                ¿Seguro que quieres cerrar?
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Tienes información sin guardar. Si cierras ahora, perderás tu progreso, pero puedes continuar más tarde.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleCancelClose}
                                    className="flex-1 py-3 px-4 rounded-xl border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    Continuar agendando
                                </button>
                                <button
                                    onClick={handleConfirmClose}
                                    className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

