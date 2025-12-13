"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Phone, ArrowRight, CheckCircle, Shield } from "lucide-react";
import { track } from "@lib/analytics";
import { logger } from "@lib/logger";

interface LeadLiteFormProps {
    propertyId: string;
    propertyName: string;
    selectedDate: string;
    selectedTime: string;
    onComplete: (leadData: LeadData) => void;
    onBack: () => void;
    className?: string;
}

interface LeadData {
    name: string;
    email: string;
    phone: string;
}

export function LeadLiteForm({
    propertyId,
    propertyName,
    selectedDate,
    selectedTime,
    onComplete,
    onBack,
    className = ""
}: LeadLiteFormProps) {
    const [formData, setFormData] = useState<LeadData>({
        name: "",
        email: "",
        phone: ""
    });
    const [currentField, setCurrentField] = useState<"name" | "email" | "phone">("name");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFieldChange = useCallback((field: keyof LeadData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    const handleNext = useCallback(() => {
        if (currentField === "name" && formData.name.trim()) {
            setCurrentField("email");
            track('lead_form_progress', {
                propertyId,
                step: 'name_completed',
                field: 'name'
            });
        } else if (currentField === "email" && formData.email.trim()) {
            setCurrentField("phone");
            track('lead_form_progress', {
                propertyId,
                step: 'email_completed',
                field: 'email'
            });
        } else if (currentField === "phone" && formData.phone.trim()) {
            handleSubmit();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- handleSubmit is stable, avoid re-render loops
    }, [currentField, formData, propertyId]);

    const handleSubmit = useCallback(async () => {
        setIsSubmitting(true);

        try {
            // Simular envío a API
            await new Promise(resolve => setTimeout(resolve, 800));

            track('lead_form_completed', {
                propertyId,
                propertyName,
                date: selectedDate,
                time: selectedTime,
                hasName: !!formData.name,
                hasEmail: !!formData.email,
                hasPhone: !!formData.phone
            });

            onComplete(formData);
        } catch (error) {
            logger.error('Error submitting lead:', error);
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, propertyId, propertyName, selectedDate, selectedTime, onComplete]);

    const handleBack = useCallback(() => {
        if (currentField === "email") {
            setCurrentField("name");
        } else if (currentField === "phone") {
            setCurrentField("email");
        } else {
            onBack();
        }
    }, [currentField, onBack]);

    const isFieldValid = (field: keyof LeadData) => {
        const value = formData[field];
        if (field === "email") {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        }
        if (field === "phone") {
            return value.length >= 8;
        }
        return value.trim().length > 0;
    };

    const getFieldIcon = (field: keyof LeadData) => {
        switch (field) {
            case "name": return User;
            case "email": return Mail;
            case "phone": return Phone;
        }
    };

    const getFieldLabel = (field: keyof LeadData) => {
        switch (field) {
            case "name": return "Nombre completo";
            case "email": return "Email";
            case "phone": return "Teléfono";
        }
    };

    const getFieldPlaceholder = (field: keyof LeadData) => {
        switch (field) {
            case "name": return "Tu nombre";
            case "email": return "tu@email.com";
            case "phone": return "+56 9 1234 5678";
        }
    };

    const progress = {
        name: 33,
        email: 66,
        phone: 100
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`bg-gray-800:bg-gray-900 rounded-2xl shadow-2xl border border-gray-700:border-gray-700 overflow-hidden max-w-md w-full mx-4 sm:mx-0 ${className}`}
        >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 sm:p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Completar datos</h2>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-blue-100">Paso {currentField === "name" ? 1 : currentField === "email" ? 2 : 3} de 3</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <h3 className="font-semibold text-lg">{propertyName}</h3>
                    <div className="text-sm text-blue-100">
                        {selectedDate} • {selectedTime}
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="px-4 sm:px-6 pt-4">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <motion.div
                        className="bg-blue-600 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress[currentField]}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentField}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-6"
                    >
                        {/* Current Field */}
                        <div className="space-y-4">
                            <label className="block">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {getFieldLabel(currentField)}
                                </span>
                                <div className="mt-1 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        {React.createElement(getFieldIcon(currentField), {
                                            className: "h-5 w-5 text-gray-400"
                                        })}
                                    </div>
                                    <input
                                        type={currentField === "email" ? "email" : currentField === "phone" ? "tel" : "text"}
                                        value={formData[currentField]}
                                        onChange={(e) => handleFieldChange(currentField, e.target.value)}
                                        placeholder={getFieldPlaceholder(currentField)}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-800:bg-gray-800 text-white:text-white"
                                        autoFocus
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter' && isFieldValid(currentField)) {
                                                handleNext();
                                            }
                                        }}
                                    />
                                </div>
                            </label>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleBack}
                                className="flex-1 px-4 py-3 text-gray-300:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-900:hover:bg-gray-800 transition-colors"
                            >
                                Atrás
                            </button>

                            <button
                                onClick={handleNext}
                                disabled={!isFieldValid(currentField) || isSubmitting}
                                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                        <span>Enviando...</span>
                                    </>
                                ) : currentField === "phone" ? (
                                    <>
                                        <CheckCircle className="w-4 h-4" />
                                        <span>Confirmar visita</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Continuar</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Trust Indicators */}
                        <div className="text-center space-y-2">
                            <div className="flex items-center justify-center gap-2 text-sm text-gray-400:text-gray-400">
                                <Shield className="w-4 h-4" />
                                <span>Datos protegidos</span>
                            </div>
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                                Sin comisión • Respaldado por Assetplan
                            </p>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

export default LeadLiteForm;
