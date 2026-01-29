"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Sparkles, Trophy, Calendar, Compass } from "lucide-react";
import type { BadgeType } from "@/hooks/useTreeGamification";

interface GamificationBadgeProps {
  badge: {
    type: BadgeType;
    label: string;
    description?: string;
  } | null;
  className?: string;
}

const badgeIcons = {
  first_visit: Sparkles,
  frequent_visitor: Trophy,
  consecutive_days: Calendar,
  explorer: Compass,
};

const badgeColors = {
  first_visit: "text-brand-violet bg-brand-violet/10 dark:bg-brand-violet/20 border-brand-violet/20",
  frequent_visitor: "text-brand-aqua bg-brand-aqua/10 dark:bg-brand-aqua/20 border-brand-aqua/20",
  consecutive_days: "text-amber-500 bg-amber-500/10 dark:bg-amber-500/20 border-amber-500/20",
  explorer: "text-purple-500 bg-purple-500/10 dark:bg-purple-500/20 border-purple-500/20",
};

export function GamificationBadge({ badge, className = "" }: GamificationBadgeProps) {
  const prefersReducedMotion = useReducedMotion();

  if (!badge || !badge.type) return null;

  const Icon = badgeIcons[badge.type];
  const colorClasses = badgeColors[badge.type];

  return (
    <AnimatePresence>
      <motion.div
        initial={prefersReducedMotion ? undefined : { opacity: 0, y: -10, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.9 }}
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3 }}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${colorClasses} ${className}`}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <Icon className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
        <span>{badge.label}</span>
        {badge.description && (
          <span className="text-xs opacity-75">· {badge.description}</span>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
