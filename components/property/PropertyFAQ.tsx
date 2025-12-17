"use client";
import React, { useState, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronDown, HelpCircle, Phone, Calendar, DollarSign, Shield, Users, MessageCircle } from "lucide-react";
import type { Building } from "@schemas/models";

interface PropertyFAQProps {
    building: Building;
    variant?: "catalog" | "marketing" | "admin";
    className?: string;
}

interface FAQItem {
    question: string;
    answer: string;
    category: string;
    icon: React.ComponentType<{ className?: string }>;
}

export function PropertyFAQ({ building: _building, variant: _variant = "catalog", className = "" }: PropertyFAQProps) {
    const [openItems, setOpenItems] = useState<Set<number>>(new Set([0])); // Primer item abierto por defecto
    const shouldReduceMotion = useReducedMotion();

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

    // Ya no agrupamos por categoría, usamos directamente faqData

    // Configuración de animaciones respetando prefers-reduced-motion
    const animationConfig = (() => {
        if (shouldReduceMotion) {
            return { duration: 0, ease: "linear" as const };
        }
        return { duration: 0.3, ease: "easeInOut" as const };
    })();

    return (
        <section
            className={`bg-gray-800 rounded-2xl shadow-lg border border-gray-700 p-6 lg:p-8 ${className}`}
            aria-labelledby="faq-heading"
        >
            {/* Header */}
            <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                        <HelpCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h2 id="faq-heading" className="text-2xl lg:text-3xl font-bold text-white">
                        Preguntas frecuentes
                    </h2>
                </div>
                <p className="text-base lg:text-lg text-gray-300 max-w-2xl mx-auto">
                    Resolvemos las dudas más comunes sobre esta propiedad
                </p>
            </div>

            {/* FAQs simplificadas */}
            <div className="space-y-3">
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
                                <div className="flex items-center gap-3 flex-1">
                                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <item.icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <span className="font-medium text-white text-sm lg:text-base leading-relaxed">
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
                                                <p className="text-sm lg:text-base text-gray-300 leading-relaxed">
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

            {/* CTA de contacto mejorado */}
            <motion.div
                className="mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: animationConfig.duration, delay: 0.2 }}
            >
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 lg:p-8 border border-blue-200 dark:border-blue-700">
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="text-lg lg:text-xl font-semibold text-white">
                                ¿Tienes más preguntas?
                            </h3>
                        </div>
                        <p className="text-sm lg:text-base text-gray-300 mb-6 max-w-md mx-auto">
                            Nuestro equipo está disponible para ayudarte con cualquier consulta sobre esta propiedad
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                            <button
                                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 min-h-[48px]"
                                aria-label="Llamar para consultas sobre la propiedad"
                            >
                                <Phone className="w-4 h-4" />
                                <span>Llamar ahora</span>
                            </button>
                            <button
                                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 min-h-[48px] border border-gray-200 dark:border-gray-600"
                                aria-label="Agendar una visita a la propiedad"
                            >
                                <Calendar className="w-4 h-4" />
                                <span>Agendar visita</span>
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </section>
    );
}
