"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface UFData {
  codigo: string;
  nombre: string;
  unidad_medida: string;
  fecha: string;
  valor: number;
}

export function UFIndicator() {
  const [ufValue, setUfValue] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const fetchUF = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Usar mindicador.cl API (gratuita y open source)
        const response = await fetch("https://mindicador.cl/api/uf", {
          cache: "no-store", // Siempre obtener el valor más reciente
        });

        if (!response.ok) {
          throw new Error("Error al obtener valor de UF");
        }

        const data = await response.json();

        // La API de mindicador.cl retorna: { uf: { codigo, nombre, unidad_medida, fecha, valor } }
        if (data.uf && data.uf.valor) {
          setUfValue(data.uf.valor);
        } else if (data.serie && Array.isArray(data.serie) && data.serie.length > 0) {
          // Formato alternativo con serie histórica
          const latestUF = data.serie[data.serie.length - 1];
          setUfValue(latestUF.valor);
        } else if (data.valor) {
          // Formato directo
          setUfValue(data.valor);
        } else {
          throw new Error("Formato de respuesta inválido");
        }
      } catch (err) {
        console.error("Error fetching UF:", err);
        setError("Error al cargar UF");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUF();
  }, []);

  if (error) {
    return null; // No mostrar nada si hay error
  }

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3, delay: 0.5 }}
      className="flex items-center justify-center gap-2 text-xs sm:text-sm text-subtext mb-3"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
          <span>Cargando UF...</span>
        </>
      ) : (
        <>
          <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-brand-aqua" aria-hidden="true" />
          <span>
            UF hoy: <span className="font-semibold text-text">${ufValue?.toLocaleString("es-CL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </span>
        </>
      )}
    </motion.div>
  );
}
