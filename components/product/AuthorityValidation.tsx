"use client";

import React from "react";
import Image from "next/image";
import { Quote } from "lucide-react";
import type { ExpertQuote } from "@schemas/ecommerce";
import { motion } from "framer-motion";
import { useReducedMotion } from "@hooks/useReducedMotion";

interface AuthorityValidationProps {
  expertQuotes: ExpertQuote[];
  className?: string;
}

export function AuthorityValidation({
  expertQuotes,
  className = "",
}: AuthorityValidationProps) {
  const shouldReduceMotion = useReducedMotion();

  // Limitar a 4 expertos máximo
  const displayQuotes = expertQuotes.slice(0, 4);

  if (displayQuotes.length === 0) {
    return null;
  }

  return (
    <section className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 ${className}`}>
      <div className="space-y-12">
        <div className="text-center">
          <h2 className="text-2xl lg:text-3xl font-bold text-text mb-2">
            Respaldado por expertos
          </h2>
          <p className="text-subtext">Lo que dicen los profesionales</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {displayQuotes.map((quote, index) => (
            <motion.div
              key={quote.id}
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: shouldReduceMotion ? 0.2 : 0.4,
                delay: index * 0.1,
              }}
              className="bg-card border border-border rounded-lg p-6"
            >
              {/* Quote icon */}
              <div className="mb-4">
                <Quote className="w-8 h-8 text-subtext opacity-50" aria-hidden="true" />
              </div>

              {/* Texto de la cita */}
              <p className="text-text text-lg leading-relaxed mb-6 italic">
                "{quote.text}"
              </p>

              {/* Info del experto */}
              <div className="flex items-center gap-4 pt-4 border-t border-border">
                <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border border-border">
                  <Image
                    src={quote.image}
                    alt={quote.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-text">{quote.name}</div>
                  <div className="text-sm text-subtext truncate">{quote.title}</div>
                  {quote.credentials && (
                    <div className="text-xs text-subtext mt-1">{quote.credentials}</div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

