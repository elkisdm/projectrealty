"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { createPortal } from "react-dom";
import { ChevronDown, HelpCircle, Phone, Calendar, DollarSign, Shield, Users, X, MessageCircle } from "lucide-react";
import type { Building } from "@schemas/models";

interface PropertyFAQModalProps {
    isOpen: boolean;
    onClose: () => void;
    building: Building;
    variant?: "catalog" | "marketing" | "admin";
}

interface FAQItem {
    question: string;
    answer: string;
    category: string;
    icon: React.ComponentType<{ className?: string }>;
}

export function PropertyFAQModal({
    isOpen,
    onClose,
    building: _building,
    variant: _variant = "catalog"
}: PropertyFAQModalProps) {
    const [openItems, setOpenItems] = useState<Set<number>>(new Set([0])); // Primer item abierto por defecto
    const shouldReduceMotion = useReducedMotion();
    const modalRef = useRef<HTMLDivElement>(null);
    const previousActiveElement = useRef<HTMLElement | null>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    const faqData: FAQItem[] = [
        {
            question: "¿Cuál es el proceso para arrendar esta propiedad?",
            answer: "El proceso es simple: 1) Agenda una visita, 2) Completa la documentación (RUT, comprobantes de ingresos, aval), 3) Firma el contrato, 4) Paga el primer mes + garantía. Todo se puede hacer en línea o en persona.",
            category: "",
            icon: Calendar
        },
        {
            question: "¿Qué incluye el precio del arriendo?",
            answer: "El precio incluye el arriendo base de la unidad. Los gastos comunes (agua, luz, gas) se cobran por separado según el consumo real. La garantía equivale a un mes de arriendo y se devuelve al finalizar el contrato.",
            category: "",
            icon: DollarSign
        },
        {
            question: "¿Puedo tener mascotas en esta propiedad?",
            answer: "Sí, esta propiedad es pet-friendly. Solo requerimos que las mascotas estén registradas y tengan sus vacunas al día. No hay restricciones de tamaño o raza.",
            category: "",
            icon: Users
        },
        {
            question: "¿Qué tan segura es la zona?",
            answer: "La zona cuenta con vigilancia privada 24/7, cámaras de seguridad, y está ubicada en un sector residencial tranquilo. Además, hay una comisaría a 3 cuadras y patrullas regulares de Carabineros.",
            category: "",
            icon: Shield
        },
        {
            question: "¿Cuáles son los horarios para visitar la propiedad?",
            answer: "Ofrecemos visitas de lunes a domingo de 9:00 AM a 8:00 PM. Para horarios especiales o fuera de estos rangos, contáctanos directamente y coordinamos una visita personalizada.",
            category: "",
            icon: Phone
        },
        {
            question: "¿Qué documentos necesito para arrendar?",
            answer: "Necesitarás: RUT vigente, 3 últimas liquidaciones de sueldo, certificado de trabajo, aval con propiedades o ingresos, y antecedentes comerciales. Te ayudamos con todo el proceso.",
            category: "",
            icon: HelpCircle
        }
    ];

    const toggleItem = useCallback((index: number) => {
        setOpenItems(prev => {
            const newOpenItems = new Set(prev);
            if (newOpenItems.has(index)) {
                newOpenItems.delete(index);
            } else {
                newOpenItems.add(index);
            }
            return newOpenItems;
        });
    }, []);

    // Configuración de animaciones respetando prefers-reduced-motion
    const animationConfig = {
        duration: shouldReduceMotion ? 0 : 0.3,
        ease: shouldReduceMotion ? "linear" : "easeInOut"
    };

    // Focus trap y manejo de teclado
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
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                )
            ).filter((el) => !el.hasAttribute('disabled')) as HTMLElement[];
        };

        // Función para manejar Tab y Escape
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
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

        // Focus inicial en botón de cerrar
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

            // Restaurar focus al elemento previo
            if (previousActiveElement.current) {
                previousActiveElement.current.focus();
            }
        };
    }, [isOpen, onClose]);

    // Manejar click en overlay
    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen || typeof document === "undefined") return null;

    const overlayAnimationProps = shouldReduceMotion
        ? {}
        : {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 },
            transition: { duration: 0.2 }
        };

    const panelAnimationProps = shouldReduceMotion
        ? {}
        : {
            initial: { opacity: 0, y: 20, scale: 0.95 },
            animate: { opacity: 1, y: 0, scale: 1 },
            exit: { opacity: 0, y: 20, scale: 0.95 },
            transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] }
        };

    return createPortal(
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
                {...overlayAnimationProps}
                onClick={handleOverlayClick}
            >
                {/* Overlay */}
                <motion.div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                    aria-hidden="true"
                    {...overlayAnimationProps}
                />

                {/* Modal Panel */}
                <motion.div
                    ref={modalRef}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="faq-modal-title"
                    aria-describedby="faq-modal-description"
                    className="relative w-full max-w-3xl max-h-[95vh] sm:max-h-[90vh] rounded-2xl border border-white/10 bg-card p-4 sm:p-6 shadow-2xl backdrop-blur-sm overflow-hidden flex flex-col"
                    {...panelAnimationProps}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6 flex-shrink-0">
                        <div className="flex items-center gap-3 flex-1">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex-shrink-0">
                                <HelpCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h2 id="faq-modal-title" className="text-xl sm:text-2xl font-bold text-white">
                                    Preguntas frecuentes
                                </h2>
                                <p id="faq-modal-description" className="mt-1 text-sm sm:text-base text-gray-300">
                                    Resolvemos las dudas más comunes sobre esta propiedad
                                </p>
                            </div>
                        </div>
                        <button
                            ref={closeButtonRef}
                            onClick={onClose}
                            className="ml-4 p-2 rounded-xl hover:bg-white/10 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800 flex-shrink-0"
                            aria-label="Cerrar modal de preguntas frecuentes"
                        >
                            <X className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
                        </button>
                    </div>

                    {/* Contenido scrollable */}
                    <div className="flex-1 overflow-y-auto pr-2 -mr-2">
                        <div className="space-y-3 pb-4">
                            {faqData.map((item, index) => {
                                const isOpen = openItems.has(index);

                                return (
                                    <motion.div
                                        key={index}
                                        className="bg-gray-900 rounded-xl overflow-hidden border border-gray-700 hover:border-gray-600 transition-colors duration-200"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: animationConfig.duration, delay: index * 0.05 }}
                                    >
                                        {/* Pregunta clickeable */}
                                        <button
                                            onClick={() => toggleItem(index)}
                                            className="w-full px-4 py-4 text-left flex items-center justify-between hover:bg-gray-800 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800 min-h-[60px]"
                                            aria-expanded={isOpen}
                                            aria-controls={`faq-answer-${index}`}
                                        >
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <item.icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <span className="font-medium text-white text-sm sm:text-base leading-relaxed">
                                                    {item.question}
                                                </span>
                                            </div>
                                            <div className="flex-shrink-0 ml-3">
                                                <motion.div
                                                    animate={{ rotate: isOpen ? 180 : 0 }}
                                                    transition={{ duration: animationConfig.duration, ease: animationConfig.ease }}
                                                >
                                                    <ChevronDown className="w-5 h-5 text-gray-400" />
                                                </motion.div>
                                            </div>
                                        </button>

                                        {/* Respuesta colapsable */}
                                        <AnimatePresence>
                                            {isOpen && (
                                                <motion.div
                                                    id={`faq-answer-${index}`}
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{
                                                        duration: animationConfig.duration,
                                                        ease: animationConfig.ease
                                                    }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="px-4 pb-4 border-t border-gray-700">
                                                        <div className="pt-4">
                                                            <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                                                                {item.answer}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Footer con CTA de contacto */}
                    <div className="mt-6 pt-6 border-t border-gray-700 flex-shrink-0">
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-4 sm:p-6 border border-blue-200 dark:border-blue-700">
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-3 mb-3">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                        <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <h3 className="text-base sm:text-lg font-semibold text-white">
                                        ¿Tienes más preguntas?
                                    </h3>
                                </div>
                                <p className="text-xs sm:text-sm text-gray-300 mb-4 max-w-md mx-auto">
                                    Nuestro equipo está disponible para ayudarte con cualquier consulta sobre esta propiedad
                                </p>
                                <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                                    <button
                                        onClick={() => {
                                            window.open('tel:+56912345678', '_self');
                                        }}
                                        className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 min-h-[44px] text-sm sm:text-base"
                                        aria-label="Llamar para consultas sobre la propiedad"
                                    >
                                        <Phone className="w-4 h-4" />
                                        <span>Llamar ahora</span>
                                    </button>
                                    <button
                                        onClick={onClose}
                                        className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 min-h-[44px] border border-gray-200 dark:border-gray-600 text-sm sm:text-base"
                                        aria-label="Cerrar y volver"
                                    >
                                        <Calendar className="w-4 h-4" />
                                        <span>Cerrar</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>,
        document.body
    );
}

