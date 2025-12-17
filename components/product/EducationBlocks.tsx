"use client";

import React from "react";
import Image from "next/image";
import type { EducationBlock } from "@schemas/ecommerce";
import { motion } from "framer-motion";
import { useReducedMotion } from "@hooks/useReducedMotion";

interface EducationBlocksProps {
  educationBlocks: EducationBlock[];
  className?: string;
}

export function EducationBlocks({
  educationBlocks,
  className = "",
}: EducationBlocksProps) {
  const shouldReduceMotion = useReducedMotion();

  // Ordenar por order
  const sortedBlocks = [...educationBlocks].sort((a, b) => a.order - b.order);

  if (sortedBlocks.length === 0) {
    return null;
  }

  return (
    <section className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 ${className}`}>
      <div className="space-y-12">
        {sortedBlocks.map((block, index) => (
          <motion.div
            key={block.id}
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{
              duration: shouldReduceMotion ? 0.2 : 0.5,
              delay: index * 0.1,
            }}
            className="bg-card border border-border rounded-lg p-6 lg:p-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Contenido */}
              <div className={`space-y-4 ${index % 2 === 1 ? "lg:order-2" : ""}`}>
                <h3 className="text-2xl font-semibold text-text">{block.title}</h3>
                <div
                  className="text-subtext leading-relaxed prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: block.explanation }}
                />
              </div>

              {/* Visual Support */}
              {block.visualSupport && (
                <div className={`relative aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border border-border ${index % 2 === 1 ? "lg:order-1" : ""}`}>
                  <Image
                    src={block.visualSupport}
                    alt={block.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

