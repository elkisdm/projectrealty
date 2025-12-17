"use client";

import React from "react";
import { Award, Zap, Heart, Brain, Shield } from "lucide-react";
import type { Benefit } from "@schemas/ecommerce";
import { motion } from "framer-motion";
import { useReducedMotion } from "@hooks/useReducedMotion";

interface CoreBenefitsProps {
  benefits: Benefit[];
  className?: string;
}

// Mapeo de iconos por nombre
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Award,
  Zap,
  Heart,
  Brain,
  Shield,
};

export function CoreBenefits({ benefits, className = "" }: CoreBenefitsProps) {
  const shouldReduceMotion = useReducedMotion();

  // Limitar a 5 beneficios máximo
  const displayBenefits = benefits.slice(0, 5);

  if (displayBenefits.length === 0) {
    return null;
  }

  return (
    <section className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 ${className}`}>
      <div className="space-y-12">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold text-text mb-2">
            ¿Por qué elegir este producto?
          </h2>
          <p className="text-subtext">Beneficios que marcan la diferencia</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayBenefits.map((benefit, index) => {
            const IconComponent = benefit.icon
              ? iconMap[benefit.icon] || Award
              : Award;

            return (
              <motion.div
                key={benefit.id}
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: shouldReduceMotion ? 0.2 : 0.4,
                  delay: index * 0.1,
                }}
                className="bg-card border border-border rounded-lg p-6"
              >
                <div className="flex items-start gap-4">
                  {/* Icono */}
                  <div className="flex-shrink-0 w-12 h-12 bg-surface rounded-lg flex items-center justify-center">
                    <IconComponent className="w-6 h-6 text-subtext" aria-hidden="true" />
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 space-y-2">
                    <h3 className="font-semibold text-text text-lg">{benefit.title}</h3>
                    <p className="text-subtext leading-relaxed">{benefit.description}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

