"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { ChevronDown } from "lucide-react";

export function SortSelect({ value, onChange }: { value: string; onChange: (v: string)=>void }){
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="inline-flex items-center gap-3 flex-shrink-0">
      <label htmlFor="sort-select" className="text-sm font-semibold text-text whitespace-nowrap">
        Ordenar:
      </label>
      <div className="relative">
        <motion.select
          id="sort-select"
          aria-label="Ordenar resultados"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="ui-input appearance-none pr-10 cursor-pointer min-w-[140px]"
          whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
          whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
          transition={{ duration: 0.2 }}
        >
          <option value="price-asc">Precio ↑</option>
          <option value="price-desc">Precio ↓</option>
          <option value="comuna">Comuna A–Z</option>
        </motion.select>
        <ChevronDown 
          className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-subtext pointer-events-none" 
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
