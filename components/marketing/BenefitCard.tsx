'use client';

import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { ReactNode } from 'react';

interface BenefitCardProps {
  title: string;
  description: string;
  icon?: ReactNode;
  className?: string;
}

/**
 * Card individual de beneficio
 * Usado en BenefitsSection para mostrar cada beneficio
 */
export function BenefitCard({
  title,
  description,
  icon,
  className = '',
}: BenefitCardProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
      whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.4 }}
      whileHover={prefersReducedMotion ? {} : { scale: 1.02, y: -4 }}
      className={`group relative rounded-2xl bg-card border border-border p-8 hover:shadow-lg hover:shadow-violet-500/10 transition-all duration-300 ${className}`}
    >
      {/* Icono */}
      {icon && (
        <div className="mb-6 inline-flex p-4 rounded-2xl bg-gradient-to-br from-[#8B6CFF]/10 to-[#8B6CFF]/5 border border-[#8B6CFF]/20 group-hover:scale-110 transition-transform duration-300">
          <div className="text-[#8B6CFF]">
            {icon}
          </div>
        </div>
      )}

      {/* Contenido */}
      <div className="space-y-3">
        <h3 className="text-xl font-bold tracking-tight text-text group-hover:text-[#8B6CFF] transition-colors">
          {title}
        </h3>
        <p className="text-subtext leading-relaxed">
          {description}
        </p>
      </div>

      {/* Efecto hover sutil */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-transparent to-transparent group-hover:from-[#8B6CFF]/5 group-hover:to-transparent transition-all duration-300 opacity-0 group-hover:opacity-100 pointer-events-none" />
    </motion.div>
  );
}





