"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CuposData {
    cuposDisponibles: number;
    total: number;
    porcentaje: number;
    timestamp: string;
}

interface CuposCounterProps {
    className?: string;
    showProgress?: boolean;
    autoUpdate?: boolean;
}

export function CuposCounter({
    className = "",
    showProgress = true,
    autoUpdate = true
}: CuposCounterProps) {
    const [cuposData, setCuposData] = useState<CuposData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCupos = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/flash-videos/cupos");

            if (!response.ok) {
                throw new Error("Error al obtener cupos");
            }

            const data = await response.json();
            setCuposData(data);
            setError(null);
        } catch (err) {
            setError("Error al cargar cupos");
            // console.error("Error fetching cupos:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCupos();
    }, []);

    useEffect(() => {
        if (!autoUpdate) return;

        const interval = setInterval(fetchCupos, 30000); // Actualizar cada 30 segundos
        return () => clearInterval(interval);
    }, [autoUpdate]);

    if (loading) {
        return (
            <div className={`flex items-center gap-2 ${className}`}>
                <div className="w-4 h-4 bg-gray-300 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-500">Cargando cupos...</span>
            </div>
        );
    }

    if (error || !cuposData) {
        return (
            <div className={`flex items-center gap-2 ${className}`}>
                <span className="text-sm text-red-500">Error al cargar cupos</span>
            </div>
        );
    }

    const { cuposDisponibles, total, porcentaje } = cuposData;
    const isLow = cuposDisponibles <= 3;
    const isCritical = cuposDisponibles <= 1;

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <AnimatePresence mode="wait">
                <motion.div
                    key={cuposDisponibles}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${isCritical
                            ? "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                            : isLow
                                ? "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400"
                                : "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                        }`}
                >
                    <span className="w-2 h-2 rounded-full bg-current"></span>
                    <span>
                        {cuposDisponibles}/{total} cupos
                    </span>
                </motion.div>
            </AnimatePresence>

            {showProgress && (
                <div className="flex-1 max-w-24">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <motion.div
                            className={`h-2 rounded-full ${isCritical
                                    ? "bg-red-500"
                                    : isLow
                                        ? "bg-orange-500"
                                        : "bg-green-500"
                                }`}
                            initial={{ width: 0 }}
                            animate={{ width: `${porcentaje}%` }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                        />
                    </div>
                </div>
            )}

            {isLow && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-xs text-red-600 dark:text-red-400 font-medium"
                >
                    ¡Últimos cupos!
                </motion.div>
            )}
        </div>
    );
}
