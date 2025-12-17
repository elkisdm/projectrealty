"use client";

import React from "react";
import { Truck, CreditCard } from "lucide-react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@hooks/useReducedMotion";

interface AnnouncementBarProps {
  freeShippingThreshold?: number;
  installments?: string;
  className?: string;
}

export function AnnouncementBar({
  freeShippingThreshold = 50000,
  installments = "Hasta 12 cuotas sin interés",
  className = "",
}: AnnouncementBarProps) {
  const shouldReduceMotion = useReducedMotion();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-bg-secondary dark:bg-surface border-b border-border ${className}`}
      role="banner"
      aria-label="Anuncios promocionales"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-6 py-2 text-sm">
          {/* Envío gratis */}
          <div className="flex items-center gap-2 text-text">
            <Truck className="w-4 h-4 text-subtext" aria-hidden="true" />
            <span className="text-subtext">
              Envío gratis sobre {formatPrice(freeShippingThreshold)}
            </span>
          </div>

          {/* Separador */}
          <div className="h-4 w-px bg-border" aria-hidden="true" />

          {/* Cuotas */}
          <div className="flex items-center gap-2 text-text">
            <CreditCard className="w-4 h-4 text-subtext" aria-hidden="true" />
            <span className="text-subtext">{installments}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

