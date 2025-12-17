"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Package, TrendingUp, Shield, Truck, Award } from "lucide-react";
import type { FAQItem } from "@schemas/ecommerce";
import { useReducedMotion } from "@hooks/useReducedMotion";

interface ProductFAQProps {
  faqs: FAQItem[];
  className?: string;
}

// Mapeo de iconos por categoría
const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  uso: Package,
  resultados: TrendingUp,
  miedos: Shield,
  logistica: Truck,
  certificaciones: Award,
};

export function ProductFAQ({ faqs, className = "" }: ProductFAQProps) {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set([0])); // Primer item abierto por defecto
  const shouldReduceMotion = useReducedMotion();

  // Ordenar FAQs por categoría: Uso → Resultados → Miedos → Logística → Certificaciones
  const categoryOrder: Record<string, number> = {
    uso: 1,
    resultados: 2,
    miedos: 3,
    logistica: 4,
    certificaciones: 5,
  };

  const sortedFaqs = [...faqs].sort((a, b) => {
    const aOrder = categoryOrder[a.category || ""] || 99;
    const bOrder = categoryOrder[b.category || ""] || 99;
    return aOrder - bOrder;
  });

  const toggleItem = useCallback((index: number) => {
    setOpenItems((prev) => {
      const newOpenItems = new Set(prev);
      if (newOpenItems.has(index)) {
        newOpenItems.delete(index);
      } else {
        newOpenItems.add(index);
      }
      return newOpenItems;
    });
  }, []);

  // Configuración de animaciones
  const animationConfig = shouldReduceMotion
    ? { duration: 0, ease: "linear" as const }
    : { duration: 0.3, ease: "easeInOut" as const };

  if (sortedFaqs.length === 0) {
    return null;
  }

  return (
    <section
      className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 ${className}`}
      aria-labelledby="faq-heading"
    >
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 id="faq-heading" className="text-2xl lg:text-3xl font-bold text-text mb-2">
            Preguntas frecuentes
          </h2>
          <p className="text-subtext">Resolvemos las dudas más comunes</p>
        </div>

        {/* FAQs */}
        <div className="space-y-3 max-w-3xl mx-auto">
          {sortedFaqs.map((item, index) => {
            const isOpen = openItems.has(index);
            const IconComponent =
              categoryIcons[item.category || ""] || Package;

            return (
              <motion.div
                key={item.id}
                className="bg-card border border-border rounded-lg overflow-hidden"
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: animationConfig.duration,
                  delay: index * 0.05,
                }}
              >
                {/* Pregunta clickeable */}
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full px-4 py-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2 min-h-[60px]"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${item.id}`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-8 h-8 bg-surface rounded-lg flex items-center justify-center flex-shrink-0">
                      <IconComponent className="w-4 h-4 text-subtext" />
                    </div>
                    <span className="font-medium text-text text-sm lg:text-base leading-relaxed">
                      {item.question}
                    </span>
                  </div>
                  <div className="flex-shrink-0 ml-3">
                    <ChevronDown
                      className={`w-5 h-5 text-subtext transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                      aria-hidden="true"
                    />
                  </div>
                </button>

                {/* Respuesta colapsable */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      id={`faq-answer-${item.id}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{
                        duration: animationConfig.duration,
                        ease: animationConfig.ease,
                      }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 border-t border-border">
                        <div className="pt-4">
                          <p className="text-sm sm:text-base text-subtext leading-relaxed">
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
    </section>
  );
}

