"use client";

import { useState } from "react";
import { UpsellStepper } from "./UpsellStepper";
import { flashOfferContent } from "@/lib/content/flashOffer";
import { logger } from "@lib/logger";

export function FlashVideosClient() {
    const [isStepperOpen, setIsStepperOpen] = useState(false);

    const handleStepperComplete = (selections: { chatbot: boolean; metaAds: boolean }) => {
        // Aquí se manejaría la lógica de pago
        logger.log('Selecciones completadas:', selections);
        setIsStepperOpen(false);
    };

    return (
        <>
            <UpsellStepper
                isOpen={isStepperOpen}
                onClose={() => setIsStepperOpen(false)}
                onComplete={handleStepperComplete}
            />

            {/* CTA Button - anyoneAI Style */}
            <button
                onClick={() => setIsStepperOpen(true)}
                className="cta-primary w-full min-h-[48px] sm:min-h-[56px] text-base sm:text-lg"
                aria-label="Reservar plaza para pack de videos"
            >
                {flashOfferContent.offer.cta}
            </button>
        </>
    );
}
