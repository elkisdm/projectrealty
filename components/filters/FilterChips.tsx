"use client";

import { AnimatePresence } from "framer-motion";
import { FilterChip } from "./FilterChip";
import { formatPrice } from "@lib/utils";

interface ActiveFilters {
  comuna?: string | string[];
  precioMin?: number;
  precioMax?: number;
  dormitorios?: string | string[];
  estacionamiento?: boolean;
  bodega?: boolean;
  mascotas?: boolean;
}

interface FilterChipsProps {
  filters: ActiveFilters;
  onRemoveFilter: (key: keyof ActiveFilters) => void;
  className?: string;
}

/**
 * Componente para mostrar chips de filtros activos
 * Muestra chips removibles para cada filtro activo aplicado
 */
export function FilterChips({
  filters,
  onRemoveFilter,
  className = "",
}: FilterChipsProps) {
  const activeFilters: Array<{ key: keyof ActiveFilters; label: string; value: string }> = [];

  // Comuna (soporta array)
  if (filters.comuna) {
    if (Array.isArray(filters.comuna) && filters.comuna.length > 0) {
      activeFilters.push({
        key: "comuna",
        label: "Comuna",
        value: filters.comuna.length === 1 
          ? filters.comuna[0] 
          : `${filters.comuna.length} comunas`,
      });
    } else if (typeof filters.comuna === 'string' && filters.comuna !== "Todas") {
      activeFilters.push({
        key: "comuna",
        label: "Comuna",
        value: filters.comuna,
      });
    }
  }

  // Precio
  if (filters.precioMin || filters.precioMax) {
    let precioValue = "";
    if (filters.precioMin && filters.precioMax) {
      precioValue = `${formatPrice(filters.precioMin)} - ${formatPrice(filters.precioMax)}`;
    } else if (filters.precioMin) {
      precioValue = `Desde ${formatPrice(filters.precioMin)}`;
    } else if (filters.precioMax) {
      precioValue = `Hasta ${formatPrice(filters.precioMax)}`;
    }

    activeFilters.push({
      key: "precioMin" as keyof ActiveFilters, // Usamos precioMin como key para remover ambos
      label: "Precio",
      value: precioValue,
    });
  }

  // Dormitorios (soporta array)
  if (filters.dormitorios) {
    if (Array.isArray(filters.dormitorios) && filters.dormitorios.length > 0) {
      const dormitoriosText = filters.dormitorios.length === 1
        ? filters.dormitorios[0] === "Estudio" 
          ? "Estudio" 
          : `${filters.dormitorios[0]} dormitorio${filters.dormitorios[0] !== "1" ? "s" : ""}`
        : `${filters.dormitorios.length} tipos`;
      activeFilters.push({
        key: "dormitorios",
        label: "Dormitorios",
        value: dormitoriosText,
      });
    } else if (typeof filters.dormitorios === 'string') {
      activeFilters.push({
        key: "dormitorios",
        label: "Dormitorios",
        value: filters.dormitorios === "Estudio" ? "Estudio" : `${filters.dormitorios} dormitorio${filters.dormitorios !== "1" ? "s" : ""}`,
      });
    }
  }

  // Estacionamiento
  if (filters.estacionamiento !== undefined) {
    activeFilters.push({
      key: "estacionamiento",
      label: "Estacionamiento",
      value: filters.estacionamiento ? "Sí" : "No",
    });
  }

  // Bodega
  if (filters.bodega !== undefined) {
    activeFilters.push({
      key: "bodega",
      label: "Bodega",
      value: filters.bodega ? "Sí" : "No",
    });
  }

  // Mascotas
  if (filters.mascotas !== undefined) {
    activeFilters.push({
      key: "mascotas",
      label: "Mascotas",
      value: filters.mascotas ? "Sí" : "No",
    });
  }

  // No mostrar nada si no hay filtros activos
  if (activeFilters.length === 0) {
    return null;
  }

  const handleRemove = (key: keyof ActiveFilters) => {
    // Si es precio, necesitamos manejar precioMin y precioMax por separado
    if (key === "precioMin") {
      onRemoveFilter("precioMin");
      onRemoveFilter("precioMax");
    } else {
      onRemoveFilter(key);
    }
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <AnimatePresence mode="popLayout">
        {activeFilters.map((filter) => (
          <FilterChip
            key={filter.key}
            label={filter.label}
            value={filter.value}
            onRemove={() => handleRemove(filter.key)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}