"use client";

import { useTheme } from "@/lib/theme-context";
import { Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";

export function ThemeToggle() {
  const { theme, toggleTheme, isHydrated } = useTheme();

  // No renderizar hasta que esté hidratado para evitar hydration mismatch
  if (!isHydrated) {
    return (
      <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
    );
  }

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative w-10 h-10 rounded-full bg-gray-800:bg-gray-800 border border-gray-700:border-gray-700 flex items-center justify-center transition-all duration-300 hover:bg-gray-900:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 shadow-sm hover:shadow-md"
      whileTap={{ scale: 0.95 }}
      aria-label={`Cambiar a tema ${theme === 'light' ? 'oscuro' : 'claro'}`}
    >
      <motion.div
        initial={false}
        animate={{ rotate: theme === 'light' ? 0 : 180 }}
        transition={{ duration: 0.3 }}
        className="relative"
      >
        {theme === 'light' ? (
          <Sun className="w-5 h-5 text-amber-500" />
        ) : (
          <Moon className="w-5 h-5 text-cyan-400" />
        )}
      </motion.div>

      {/* Indicador de estado */}
      <motion.div
        className="absolute right-0 bottom-0 rounded-full border-2 border-transparent"
        initial={false}
        animate={{
          borderColor: theme === 'light' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(14, 165, 233, 0.3)',
        }}
        transition={{ duration: 0.2 }}
      />
    </motion.button>
  );
}
