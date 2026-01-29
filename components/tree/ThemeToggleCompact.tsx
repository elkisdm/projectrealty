"use client";

import { useTheme } from "@/lib/theme-context";
import { Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { track, ANALYTICS_EVENTS } from "@lib/analytics";

export function ThemeToggleCompact() {
  const { theme, toggleTheme, isHydrated } = useTheme();
  const prefersReducedMotion = useReducedMotion();

  const handleToggle = () => {
    toggleTheme();
    track(ANALYTICS_EVENTS.TREE_THEME_TOGGLE, {
      theme: theme === 'light' ? 'dark' : 'light'
    });
  };

  // No renderizar hasta que esté hidratado para evitar hydration mismatch
  if (!isHydrated) {
    return (
      <div className="fixed top-4 right-4 z-40 w-11 h-11 rounded-xl bg-surface dark:bg-surface border border-border animate-pulse" />
    );
  }

  return (
    <motion.button
      onClick={handleToggle}
      className="fixed top-4 right-4 z-40 w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-surface dark:bg-surface border border-border hover:border-brand-violet/50 dark:hover:border-brand-violet/40 flex items-center justify-center transition-all duration-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet focus-visible:ring-offset-2 shadow-sm"
      whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
      aria-label={`Cambiar a tema ${theme === 'light' ? 'oscuro' : 'claro'}`}
      initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2, delay: 0.4 }}
    >
      <motion.div
        initial={false}
        animate={prefersReducedMotion ? {} : { rotate: theme === 'light' ? 0 : 180 }}
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3 }}
        className="relative"
      >
        {theme === 'light' ? (
          <Sun className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 dark:text-amber-400" />
        ) : (
          <Moon className="w-5 h-5 sm:w-6 sm:h-6 text-brand-violet dark:text-brand-aqua" />
        )}
      </motion.div>
    </motion.button>
  );
}
