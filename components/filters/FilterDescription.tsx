"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface ActiveFilters {
  comuna?: string | string[];
  precioMin?: number;
  precioMax?: number;
  dormitorios?: string | string[];
  estacionamiento?: boolean;
  bodega?: boolean;
  mascotas?: boolean;
}

interface FilterDescriptionProps {
  filters: ActiveFilters;
  onClear: () => void;
  className?: string;
}

/**
 * Genera una descripción dinámica de los filtros activos
 * Formato: "Departamentos de [dormitorios] en [comunas] [con servicios]"
 */
function generateFilterDescription(filters: ActiveFilters): string {
  const parts: string[] = [];
  
  // Parte fija
  parts.push("Departamentos");
  
  // Dormitorios
  if (filters.dormitorios) {
    const dormitoriosArray = Array.isArray(filters.dormitorios)
      ? filters.dormitorios
      : [filters.dormitorios];
    
    if (dormitoriosArray.length > 0) {
      let dormitoriosText = "";
      
      if (dormitoriosArray.length === 1) {
        // Un solo dormitorio
        if (dormitoriosArray[0] === "Estudio") {
          dormitoriosText = "Estudio";
        } else {
          dormitoriosText = `${dormitoriosArray[0]} dormitorio${dormitoriosArray[0] !== "1" ? "s" : ""}`;
        }
      } else if (dormitoriosArray.length === 2) {
        // Dos dormitorios: "1 y 2 dormitorios"
        const d1 = dormitoriosArray[0] === "Estudio" ? "Estudio" : dormitoriosArray[0];
        const d2 = dormitoriosArray[1] === "Estudio" ? "Estudio" : dormitoriosArray[1];
        dormitoriosText = `${d1} y ${d2} dormitorios`;
      } else {
        // Tres o más: "1, 2 y 3 dormitorios"
        const formatted = dormitoriosArray.map(d => d === "Estudio" ? "Estudio" : d);
        dormitoriosText = `${formatted.slice(0, -1).join(", ")} y ${formatted[formatted.length - 1]} dormitorios`;
      }
      
      parts.push(`de ${dormitoriosText}`);
    }
  }
  
  // Comunas
  if (filters.comuna) {
    const comunasArray = Array.isArray(filters.comuna)
      ? filters.comuna
      : filters.comuna !== "Todas"
        ? [filters.comuna]
        : [];
    
    if (comunasArray.length > 0) {
      const comunasText = comunasArray.length === 1
        ? comunasArray[0]
        : comunasArray.length === 2
          ? `${comunasArray[0]} o ${comunasArray[1]}`
          : `${comunasArray.slice(0, -1).join(", ")} y ${comunasArray[comunasArray.length - 1]}`;
      
      parts.push(`en ${comunasText}`);
    }
  }
  
  // Servicios (estacionamiento, bodega, mascotas)
  const servicios: string[] = [];
  if (filters.estacionamiento === true) servicios.push("estacionamiento");
  if (filters.bodega === true) servicios.push("bodega");
  if (filters.mascotas === true) servicios.push("mascotas");
  
  if (servicios.length > 0) {
    const serviciosText = servicios.length === 1
      ? servicios[0]
      : servicios.length === 2
        ? `${servicios[0]} y ${servicios[1]}`
        : `${servicios.slice(0, -1).join(", ")} y ${servicios[servicios.length - 1]}`;
    
    parts.push(`con ${serviciosText}`);
  }
  
  // Precio (opcional, solo si está presente)
  if (filters.precioMin || filters.precioMax) {
    let precioText = "";
    if (filters.precioMin && filters.precioMax) {
      precioText = `entre $${filters.precioMin.toLocaleString('es-CL')} y $${filters.precioMax.toLocaleString('es-CL')}`;
    } else if (filters.precioMin) {
      precioText = `desde $${filters.precioMin.toLocaleString('es-CL')}`;
    } else if (filters.precioMax) {
      precioText = `hasta $${filters.precioMax.toLocaleString('es-CL')}`;
    }
    
    if (precioText) {
      parts.push(precioText);
    }
  }
  
  return parts.join(" ");
}

/**
 * Componente que muestra una descripción dinámica de los filtros activos
 * en formato de texto natural dentro de una pill larga
 */
export function FilterDescription({
  filters,
  onClear,
  className = "",
}: FilterDescriptionProps) {
  const prefersReducedMotion = useReducedMotion();
  
  const description = generateFilterDescription(filters);
  
  // Si no hay filtros activos, no mostrar nada
  const hasFilters = 
    (Array.isArray(filters.comuna) && filters.comuna.length > 0) ||
    (typeof filters.comuna === 'string' && filters.comuna !== "Todas") ||
    filters.dormitorios !== undefined ||
    filters.estacionamiento !== undefined ||
    filters.bodega !== undefined ||
    filters.mascotas !== undefined ||
    filters.precioMin !== null ||
    filters.precioMax !== null;
  
  if (!hasFilters) {
    return null;
  }
  
  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={prefersReducedMotion ? {} : { opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className={`
        inline-flex items-center gap-3
        px-6 py-3 rounded-full
        bg-[#8B6CFF] text-white text-base font-medium
        shadow-md shadow-violet-500/25
        ${className}
      `}
    >
      <span className="whitespace-normal break-words">{description}</span>
      <button
        onClick={onClear}
        aria-label="Limpiar filtros"
        className="
          flex-shrink-0
          p-1.5 rounded-full
          hover:bg-white/20
          focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#8B6CFF]
          transition-colors duration-200
          min-w-[28px] min-h-[28px] flex items-center justify-center
        "
      >
        <X className="w-4 h-4" aria-hidden="true" />
      </button>
    </motion.div>
  );
}

