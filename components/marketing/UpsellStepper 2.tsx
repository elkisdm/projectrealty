"use client";

import React, { useState } from "react";
import { flashOfferContent, formatPrice } from "@/lib/content/flashOffer";

interface UpsellStepperProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: (selections: { chatbot: boolean; metaAds: boolean }) => void;
}

export function UpsellStepper({ isOpen, onClose, onComplete }: UpsellStepperProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [selections, setSelections] = useState({ chatbot: false, metaAds: false });

    if (!isOpen) return null;

    const handleSelection = (type: 'chatbot' | 'metaAds', selected: boolean) => {
        setSelections(prev => ({ ...prev, [type]: selected }));
    };

    const handleNext = () => {
        if (currentStep < 3) {
            setCurrentStep(currentStep + 1);
        } else {
            onComplete(selections);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const getTotalPrice = () => {
        let total = flashOfferContent.totals.base;
        if (selections.chatbot) total += flashOfferContent.upsells.chatbot.price;
        if (selections.metaAds) total += flashOfferContent.upsells.metaAds.price;

        // Apply bundle discount if both are selected
        if (selections.chatbot && selections.metaAds) {
            total = flashOfferContent.totals.fullBundle;
        }

        return total;
    };

    const renderStep1 = () => (
        <div className="space-y-6">
            <div className="text-center">
                <h3 className="text-2xl font-bold tracking-tight mb-4">
                    {flashOfferContent.upsells.chatbot.title}
                </h3>
                <p className="text-gray-300:text-gray-300 mb-6">
                    {flashOfferContent.upsells.chatbot.description}
                </p>
            </div>

            <div className="space-y-4">
                {flashOfferContent.upsells.chatbot.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </div>
                ))}
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                    {flashOfferContent.upsells.chatbot.disclaimer}
                </p>
            </div>

            <div className="flex space-x-4">
                <button
                    onClick={() => handleSelection('chatbot', false)}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${!selections.chatbot
                        ? 'border-gray-300 bg-gray-900:border-gray-600 dark:bg-gray-800'
                        : 'border-gray-200 bg-gray-800:border-gray-700 dark:bg-gray-900'
                        }`}
                >
                    <span className="text-sm text-gray-300:text-gray-400">(opcional) Puedo agregarlo más tarde</span>
                </button>
                <button
                    onClick={() => handleSelection('chatbot', true)}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${selections.chatbot
                        ? 'border-green-500 bg-green-50 dark:border-green-400 dark:bg-green-900/20'
                        : 'border-gray-200 bg-gray-800:border-gray-700 dark:bg-gray-900'
                        }`}
                >
                    <span className="text-sm font-medium">Sí, quiero el asistente</span>
                </button>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-6">
            <div className="text-center">
                <h3 className="text-2xl font-bold tracking-tight mb-4">
                    {flashOfferContent.upsells.metaAds.title}
                </h3>
                <p className="text-gray-300:text-gray-300 mb-6">
                    {flashOfferContent.upsells.metaAds.description}
                </p>
            </div>

            {selections.chatbot && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                        {flashOfferContent.upsells.metaAds.bundleNote}
                    </p>
                </div>
            )}

            <div className="flex space-x-4">
                <button
                    onClick={() => handleSelection('metaAds', false)}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${!selections.metaAds
                        ? 'border-gray-300 bg-gray-900:border-gray-600 dark:bg-gray-800'
                        : 'border-gray-200 bg-gray-800:border-gray-700 dark:bg-gray-900'
                        }`}
                >
                    <span className="text-sm text-gray-300:text-gray-400">(opcional) Puedo agregarlo más tarde</span>
                </button>
                <button
                    onClick={() => handleSelection('metaAds', true)}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${selections.metaAds
                        ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
                        : 'border-gray-200 bg-gray-800:border-gray-700 dark:bg-gray-900'
                        }`}
                >
                    <span className="text-sm font-medium">Quiero el impulso con Ads</span>
                </button>
            </div>
        </div>
    );

    const renderSummary = () => (
        <div className="space-y-6">
            <div className="text-center">
                <h3 className="text-2xl font-bold tracking-tight mb-4">Resumen de tu pedido</h3>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-700:border-gray-700">
                    <span className="text-gray-700 dark:text-gray-300">Pack Base</span>
                    <span className="font-semibold">{formatPrice(flashOfferContent.totals.base)}</span>
                </div>

                {selections.chatbot && (
                    <div className="flex justify-between items-center py-3 border-b border-gray-700:border-gray-700">
                        <span className="text-gray-700 dark:text-gray-300">+ Chatbot</span>
                        <span className="font-semibold">{formatPrice(flashOfferContent.upsells.chatbot.price)}</span>
                    </div>
                )}

                {selections.metaAds && (
                    <div className="flex justify-between items-center py-3 border-b border-gray-700:border-gray-700">
                        <span className="text-gray-700 dark:text-gray-300">+ Meta Ads</span>
                        <span className="font-semibold">{formatPrice(flashOfferContent.upsells.metaAds.price)}</span>
                    </div>
                )}

                {selections.chatbot && selections.metaAds && (
                    <div className="flex justify-between items-center py-3 border-b border-gray-700:border-gray-700">
                        <span className="text-green-600 dark:text-green-400">Descuento Bundle (10%)</span>
                        <span className="text-green-600 dark:text-green-400 font-semibold">
                            -{formatPrice(flashOfferContent.totals.base + flashOfferContent.upsells.chatbot.price + flashOfferContent.upsells.metaAds.price - flashOfferContent.totals.fullBundle)}
                        </span>
                    </div>
                )}

                <div className="flex justify-between items-center py-3 text-lg font-bold">
                    <span>Total</span>
                    <span>{formatPrice(getTotalPrice())}</span>
                </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                    {flashOfferContent.totals.urgencyNote}
                </p>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            <div className="relative bg-gray-800:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-700:border-gray-700">
                    <div className="flex items-center space-x-4">
                        <div className="flex space-x-2">
                            <div className={`w-3 h-3 rounded-full ${currentStep >= 1 ? 'bg-green-500' : 'bg-gray-300'}`} />
                            <div className={`w-3 h-3 rounded-full ${currentStep >= 2 ? 'bg-green-500' : 'bg-gray-300'}`} />
                            <div className={`w-3 h-3 rounded-full ${currentStep >= 3 ? 'bg-green-500' : 'bg-gray-300'}`} />
                        </div>
                        <span className="text-sm text-gray-300:text-gray-400">
                            Paso {currentStep} de 3
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-300:hover:text-gray-300"
                        aria-label="Cerrar"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {currentStep === 1 && renderStep1()}
                    {currentStep === 2 && renderStep2()}
                    {currentStep === 3 && renderSummary()}
                </div>

                {/* Footer */}
                <div className="flex justify-between p-6 border-t border-gray-700:border-gray-700">
                    {currentStep > 1 && (
                        <button
                            onClick={handleBack}
                            className="px-4 py-2 text-gray-300:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                        >
                            Atrás
                        </button>
                    )}
                    <div className="flex-1" />
                    <button
                        onClick={handleNext}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        {currentStep < 3 ? 'Siguiente' : 'Completar pedido'}
                    </button>
                </div>
            </div>
        </div>
    );
}
