"use client";

import { motion, useReducedMotion } from "framer-motion";
import { trustBadges } from "./footer.config";

export function FooterTrustBar() {
  const prefersReducedMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: prefersReducedMotion ? 0 : 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: prefersReducedMotion ? 0 : 0.4,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="border-t border-white/10 pt-8"
    >
      {/* Desktop: flex row */}
      <div className="hidden md:flex md:items-center md:justify-center md:gap-8 lg:gap-12">
        {trustBadges.map((badge, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className="flex items-center gap-2 text-white/60"
          >
            <badge.icon className="w-5 h-5 text-emerald-400" aria-hidden="true" />
            <span className="text-sm font-medium">{badge.label}</span>
          </motion.div>
        ))}
      </div>

      {/* Mobile: grid 2x2 */}
      <div className="grid grid-cols-2 gap-4 md:hidden">
        {trustBadges.map((badge, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className="flex items-center gap-2 text-white/60"
          >
            <badge.icon className="w-4 h-4 text-emerald-400 flex-shrink-0" aria-hidden="true" />
            <span className="text-xs font-medium">{badge.label}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
