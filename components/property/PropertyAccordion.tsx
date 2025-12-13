"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, CheckCircle, AlertCircle, Info, Building2, Shield, Star, MapPin, Clock, Home, Car, Package, Wifi, Users, Phone, FileText } from "lucide-react";
import { logger } from "@lib/logger";
import type { Building, Unit } from "@schemas/models";

interface SubSectionProps {
    id: string;
    title: string;
    icon: React.ReactNode;
    summary: string;
    isExpanded: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}

function SubSection({ id, title, icon, summary, isExpanded, onToggle, children }: SubSectionProps) {
    return (
        <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
            <button
                onClick={onToggle}
                className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                aria-expanded={isExpanded}
            >
                <div className="flex items-center gap-3 flex-1">
                    <div className="text-slate-600 dark:text-slate-400">
                        {icon}
                    </div>
                    <div className="flex-1">
                        <h5 className="text-sm font-medium text-slate-900 dark:text-white">
                            {title}
                        </h5>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {summary}
                        </p>
                    </div>
                </div>
                <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-slate-400 dark:text-slate-500"
                >
                    <ChevronDown className="w-4 h-4" />
                </motion.div>
            </button>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-3 border-t border-slate-200 dark:border-slate-700">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

interface PropertyAccordionProps {
    building: Building;
    selectedUnit: Unit | null;
    onScheduleVisit: () => void;
    onPreapproval?: () => void;
}

export function PropertyAccordion({
    building,
    selectedUnit,
    onScheduleVisit,
    onPreapproval
}: PropertyAccordionProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [expandedSections, setExpandedSections] = useState<string[]>([]);

    const toggleSubSection = (sectionId: string) => {
        setExpandedSections(prev =>
            prev.includes(sectionId)
                ? prev.filter(id => id !== sectionId)
                : [...prev, sectionId]
        );
    };

    // Datos para el resumen
    const tipologia = selectedUnit?.tipologia || "2D";
    const m2 = selectedUnit?.area_interior_m2 || selectedUnit?.m2 || 48;
    const orientacion = selectedUnit?.orientacion || "Norte";
    const bedrooms = selectedUnit?.bedrooms || 1;
    const bathrooms = selectedUnit?.bathrooms || 1;

    // Datos para requisitos
    const ingresoMinimo = Math.round((selectedUnit?.price || building.precio_desde || 290000) * 2.5);

    // Datos para info del edificio
    const amenities = building.amenities || [];
    const tiempoMetro = 6; // Default metro time

    return (
        <section className="space-y-4">
            {/* Sección principal simplificada */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                {/* Header principal */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-800"
                    aria-expanded={isExpanded}
                >
                    <div className="flex items-center gap-4 flex-1">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                            <Info className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                                Información completa
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                                {tipologia} · {m2} m² · {bedrooms}D{bathrooms}B · {orientacion}
                            </p>
                        </div>
                    </div>

                    <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-slate-400 dark:text-slate-500"
                    >
                        <ChevronDown className="w-5 h-5" />
                    </motion.div>
                </button>

                {/* Contenido expandible */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden"
                        >
                            <div className="px-6 pb-6 space-y-6">
                                {/* Características de la unidad */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Star className="w-5 h-5 text-amber-500" />
                                        <h4 className="text-base font-semibold text-slate-900 dark:text-white">Características de la unidad</h4>
                                    </div>

                                    {/* Resumen rápido */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        <div className="text-center p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                            <div className="font-semibold text-slate-900 dark:text-white">{tipologia}</div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400">Tipología</div>
                                        </div>
                                        <div className="text-center p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                            <div className="font-semibold text-slate-900 dark:text-white">{m2} m²</div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400">Superficie</div>
                                        </div>
                                        <div className="text-center p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                            <div className="font-semibold text-slate-900 dark:text-white">{bedrooms}D{bathrooms}B</div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400">Distribución</div>
                                        </div>
                                        <div className="text-center p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                            <div className="font-semibold text-slate-900 dark:text-white">{orientacion}</div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400">Orientación</div>
                                        </div>
                                    </div>

                                    {/* Sub-secciones desplegables */}
                                    <div className="space-y-3">
                                        <SubSection
                                            id="detalles-tecnicos"
                                            title="Detalles técnicos"
                                            icon={<Home className="w-4 h-4" />}
                                            summary="Dimensiones, materiales y especificaciones"
                                            isExpanded={expandedSections.includes("detalles-tecnicos")}
                                            onToggle={() => toggleSubSection("detalles-tecnicos")}
                                        >
                                            <div className="space-y-3 pt-2">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    <div className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-800/50 rounded">
                                                        <span className="text-sm text-slate-600 dark:text-slate-400">Área total</span>
                                                        <span className="text-sm font-medium text-slate-900 dark:text-white">{m2} m²</span>
                                                    </div>
                                                    <div className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-800/50 rounded">
                                                        <span className="text-sm text-slate-600 dark:text-slate-400">Área útil</span>
                                                        <span className="text-sm font-medium text-slate-900 dark:text-white">{Math.round(m2 * 0.85)} m²</span>
                                                    </div>
                                                    <div className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-800/50 rounded">
                                                        <span className="text-sm text-slate-600 dark:text-slate-400">Altura de techo</span>
                                                        <span className="text-sm font-medium text-slate-900 dark:text-white">2.7 m</span>
                                                    </div>
                                                    <div className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-800/50 rounded">
                                                        <span className="text-sm text-slate-600 dark:text-slate-400">Piso</span>
                                                        <span className="text-sm font-medium text-slate-900 dark:text-white">{selectedUnit?.piso || "3"}</span>
                                                    </div>
                                                </div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                                    * Las dimensiones pueden variar ligeramente según la unidad específica
                                                </div>
                                            </div>
                                        </SubSection>

                                        <SubSection
                                            id="servicios-incluidos"
                                            title="Servicios incluidos"
                                            icon={<Wifi className="w-4 h-4" />}
                                            summary="Servicios básicos y comodidades"
                                            isExpanded={expandedSections.includes("servicios-incluidos")}
                                            onToggle={() => toggleSubSection("servicios-incluidos")}
                                        >
                                            <div className="space-y-3 pt-2">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle className="w-3 h-3 text-green-500" />
                                                        <span className="text-sm text-slate-700 dark:text-slate-300">Calefacción eléctrica</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle className="w-3 h-3 text-green-500" />
                                                        <span className="text-sm text-slate-700 dark:text-slate-300">Agua caliente</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle className="w-3 h-3 text-green-500" />
                                                        <span className="text-sm text-slate-700 dark:text-slate-300">Conexión a gas</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle className="w-3 h-3 text-green-500" />
                                                        <span className="text-sm text-slate-700 dark:text-slate-300">Internet incluido</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle className="w-3 h-3 text-green-500" />
                                                        <span className="text-sm text-slate-700 dark:text-slate-300">Cable TV</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle className="w-3 h-3 text-green-500" />
                                                        <span className="text-sm text-slate-700 dark:text-slate-300">Limpieza mensual</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </SubSection>

                                        <SubSection
                                            id="estacionamiento-bodega"
                                            title="Estacionamiento y bodega"
                                            icon={<Car className="w-4 h-4" />}
                                            summary="Espacios adicionales disponibles"
                                            isExpanded={expandedSections.includes("estacionamiento-bodega")}
                                            onToggle={() => toggleSubSection("estacionamiento-bodega")}
                                        >
                                            <div className="space-y-3 pt-2">
                                                {selectedUnit?.estacionamiento ? (
                                                    <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Car className="w-4 h-4 text-green-600 dark:text-green-400" />
                                                            <span className="font-medium text-green-900 dark:text-green-100">Estacionamiento incluido</span>
                                                        </div>
                                                        <div className="text-sm text-green-700 dark:text-green-300">
                                                            <p>• Estacionamiento cubierto</p>
                                                            <p>• Acceso directo al edificio</p>
                                                            <p>• Sin costo adicional</p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Car className="w-4 h-4 text-slate-500" />
                                                            <span className="font-medium text-slate-700 dark:text-slate-300">Sin estacionamiento</span>
                                                        </div>
                                                        <div className="text-sm text-slate-600 dark:text-slate-400">
                                                            Estacionamientos disponibles en el sector con tarifas desde $50.000/mes
                                                        </div>
                                                    </div>
                                                )}

                                                {selectedUnit?.bodega ? (
                                                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                            <span className="font-medium text-blue-900 dark:text-blue-100">Bodega incluida</span>
                                                        </div>
                                                        <div className="text-sm text-blue-700 dark:text-blue-300">
                                                            <p>• Bodega de 2 m²</p>
                                                            <p>• Acceso 24/7</p>
                                                            <p>• Sin costo adicional</p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Package className="w-4 h-4 text-slate-500" />
                                                            <span className="font-medium text-slate-700 dark:text-slate-300">Sin bodega</span>
                                                        </div>
                                                        <div className="text-sm text-slate-600 dark:text-slate-400">
                                                            Bodegas disponibles en el edificio con tarifas desde $30.000/mes
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </SubSection>
                                    </div>
                                </div>

                                {/* Requisitos para arrendar */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Shield className="w-5 h-5 text-emerald-500" />
                                        <h4 className="text-base font-semibold text-slate-900 dark:text-white">Requisitos para arrendar</h4>
                                    </div>

                                    {/* Resumen de ingreso mínimo */}
                                    <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                                                <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                            </div>
                                            <div>
                                                <div className="font-semibold text-emerald-900 dark:text-emerald-100">
                                                    Ingreso mínimo: ${(ingresoMinimo / 1000000).toFixed(1)}M mensual
                                                </div>
                                                <div className="text-sm text-emerald-700 dark:text-emerald-300">
                                                    Calculado según el valor del arriendo
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Sub-secciones desplegables */}
                                    <div className="space-y-3">
                                        <SubSection
                                            id="documentos-requeridos"
                                            title="Documentos requeridos"
                                            icon={<FileText className="w-4 h-4" />}
                                            summary="Lista completa de documentos necesarios"
                                            isExpanded={expandedSections.includes("documentos-requeridos")}
                                            onToggle={() => toggleSubSection("documentos-requeridos")}
                                        >
                                            <div className="space-y-3 pt-2">
                                                <div className="space-y-2">
                                                    <div className="flex items-start gap-2 p-2 bg-slate-50 dark:bg-slate-800/50 rounded">
                                                        <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                                                        <div>
                                                            <div className="text-sm font-medium text-slate-900 dark:text-white">Cédula de identidad</div>
                                                            <div className="text-xs text-slate-500 dark:text-slate-400">Vigente y legible por ambos lados</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-start gap-2 p-2 bg-slate-50 dark:bg-slate-800/50 rounded">
                                                        <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                                                        <div>
                                                            <div className="text-sm font-medium text-slate-900 dark:text-white">Liquidaciones de sueldo</div>
                                                            <div className="text-xs text-slate-500 dark:text-slate-400">Últimas 3 liquidaciones (originales o certificadas)</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-start gap-2 p-2 bg-slate-50 dark:bg-slate-800/50 rounded">
                                                        <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                                                        <div>
                                                            <div className="text-sm font-medium text-slate-900 dark:text-white">Certificado de antecedentes</div>
                                                            <div className="text-xs text-slate-500 dark:text-slate-400">Sin antecedentes penales (vigencia 90 días)</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-start gap-2 p-2 bg-slate-50 dark:bg-slate-800/50 rounded">
                                                        <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                                                        <div>
                                                            <div className="text-sm font-medium text-slate-900 dark:text-white">Certificado DICOM</div>
                                                            <div className="text-xs text-slate-500 dark:text-slate-400">Sin morosidad vigente (vigencia 30 días)</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </SubSection>

                                        <SubSection
                                            id="proceso-evaluacion"
                                            title="Proceso de evaluación"
                                            icon={<Users className="w-4 h-4" />}
                                            summary="Cómo funciona la evaluación de postulantes"
                                            isExpanded={expandedSections.includes("proceso-evaluacion")}
                                            onToggle={() => toggleSubSection("proceso-evaluacion")}
                                        >
                                            <div className="space-y-3 pt-2">
                                                <div className="space-y-3">
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                                                            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">1</span>
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-medium text-slate-900 dark:text-white">Revisión de documentos</div>
                                                            <div className="text-xs text-slate-500 dark:text-slate-400">Verificación de completitud y autenticidad</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                                                            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">2</span>
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-medium text-slate-900 dark:text-white">Verificación de ingresos</div>
                                                            <div className="text-xs text-slate-500 dark:text-slate-400">Confirmación con empleador y análisis de capacidad de pago</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                                                            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">3</span>
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-medium text-slate-900 dark:text-white">Evaluación crediticia</div>
                                                            <div className="text-xs text-slate-500 dark:text-slate-400">Análisis de DICOM y historial crediticio</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                                                            <span className="text-xs font-semibold text-green-600 dark:text-green-400">✓</span>
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-medium text-slate-900 dark:text-white">Aprobación final</div>
                                                            <div className="text-xs text-slate-500 dark:text-slate-400">Tiempo promedio: 2-3 días hábiles</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </SubSection>

                                        <SubSection
                                            id="garantias-alternativas"
                                            title="Garantías alternativas"
                                            icon={<Shield className="w-4 h-4" />}
                                            summary="Opciones si no cumples todos los requisitos"
                                            isExpanded={expandedSections.includes("garantias-alternativas")}
                                            onToggle={() => toggleSubSection("garantias-alternativas")}
                                        >
                                            <div className="space-y-3 pt-2">
                                                <div className="space-y-3">
                                                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                                            <span className="font-medium text-amber-900 dark:text-amber-100">Garantía bancaria</span>
                                                        </div>
                                                        <div className="text-sm text-amber-700 dark:text-amber-300">
                                                            Depósito equivalente a 3 meses de arriendo en banco
                                                        </div>
                                                    </div>
                                                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                            <span className="font-medium text-blue-900 dark:text-blue-100">Codeudor solidario</span>
                                                        </div>
                                                        <div className="text-sm text-blue-700 dark:text-blue-300">
                                                            Persona que cumpla todos los requisitos y se haga responsable
                                                        </div>
                                                    </div>
                                                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                                            <span className="font-medium text-purple-900 dark:text-purple-100">Seguro de arriendo</span>
                                                        </div>
                                                        <div className="text-sm text-purple-700 dark:text-purple-300">
                                                            Póliza que cubra el riesgo de impago (opcional)
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </SubSection>
                                    </div>

                                    {/* CTA de preaprobación */}
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                                <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div className="flex-1">
                                                <h5 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                                                    ¿Cumples con todos los requisitos?
                                                </h5>
                                                <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                                                    Haz tu preaprobación en solo 30 segundos y asegura tu visita.
                                                </p>
                                                <button
                                                    onClick={onPreapproval || (() => logger.log("Preaprobación"))}
                                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                                >
                                                    Preaprobación en 30s
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Información del edificio */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Building2 className="w-5 h-5 text-indigo-500" />
                                        <h4 className="text-base font-semibold text-slate-900 dark:text-white">Información del edificio</h4>
                                    </div>

                                    {/* Ubicación destacada */}
                                    <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                                                <MapPin className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                            </div>
                                            <div>
                                                <div className="font-semibold text-indigo-900 dark:text-indigo-100">
                                                    {building.comuna}
                                                </div>
                                                <div className="text-sm text-indigo-700 dark:text-indigo-300">
                                                    Metro a {tiempoMetro} minutos
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Sub-secciones desplegables */}
                                    <div className="space-y-3">
                                        <SubSection
                                            id="amenidades-completas"
                                            title="Amenidades del edificio"
                                            icon={<Star className="w-4 h-4" />}
                                            summary={`${amenities.length} amenidades disponibles`}
                                            isExpanded={expandedSections.includes("amenidades-completas")}
                                            onToggle={() => toggleSubSection("amenidades-completas")}
                                        >
                                            <div className="space-y-3 pt-2">
                                                {amenities.length > 0 ? (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                        {amenities.map((amenity, index) => (
                                                            <div key={index} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800/50 rounded border border-slate-200 dark:border-slate-700">
                                                                <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                                                                <span className="text-sm text-slate-700 dark:text-slate-300">{amenity}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-4 text-slate-500 dark:text-slate-400">
                                                        <Building2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                                        <p className="text-sm">No hay amenidades registradas</p>
                                                    </div>
                                                )}
                                            </div>
                                        </SubSection>

                                        <SubSection
                                            id="ubicacion-transporte"
                                            title="Ubicación y transporte"
                                            icon={<MapPin className="w-4 h-4" />}
                                            summary="Conectividad y servicios cercanos"
                                            isExpanded={expandedSections.includes("ubicacion-transporte")}
                                            onToggle={() => toggleSubSection("ubicacion-transporte")}
                                        >
                                            <div className="space-y-3 pt-2">
                                                <div className="space-y-3">
                                                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                            <span className="font-medium text-blue-900 dark:text-blue-100">Transporte público</span>
                                                        </div>
                                                        <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                                                            <p>• Metro a {tiempoMetro} minutos caminando</p>
                                                            <p>• Múltiples líneas de micros en la esquina</p>
                                                            <p>• Estación de bicicletas públicas</p>
                                                        </div>
                                                    </div>
                                                    <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Building2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                                                            <span className="font-medium text-green-900 dark:text-green-100">Servicios cercanos</span>
                                                        </div>
                                                        <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
                                                            <p>• Supermercados a 5 minutos</p>
                                                            <p>• Farmacias 24 horas</p>
                                                            <p>• Bancos y cajeros automáticos</p>
                                                            <p>• Centros médicos y clínicas</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </SubSection>

                                        <SubSection
                                            id="administracion-contacto"
                                            title="Administración y contacto"
                                            icon={<Phone className="w-4 h-4" />}
                                            summary="Información de contacto y horarios"
                                            isExpanded={expandedSections.includes("administracion-contacto")}
                                            onToggle={() => toggleSubSection("administracion-contacto")}
                                        >
                                            <div className="space-y-3 pt-2">
                                                <div className="space-y-3">
                                                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Building2 className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                                                            <span className="font-medium text-slate-900 dark:text-white">Assetplan</span>
                                                        </div>
                                                        <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                                                            <p>• Administración profesional</p>
                                                            <p>• Mantenimiento preventivo</p>
                                                            <p>• Seguridad 24/7</p>
                                                        </div>
                                                    </div>
                                                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Clock className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                                                            <span className="font-medium text-slate-900 dark:text-white">Horarios de atención</span>
                                                        </div>
                                                        <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                                                            <p>• Lunes a Viernes: 9:00 - 18:00</p>
                                                            <p>• Sábados: 9:00 - 14:00</p>
                                                            <p>• Emergencias: 24/7</p>
                                                        </div>
                                                    </div>
                                                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                            <span className="font-medium text-blue-900 dark:text-blue-100">Contacto</span>
                                                        </div>
                                                        <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                                                            <p>• Teléfono: +56 2 2345 6789</p>
                                                            <p>• Email: administracion@assetplan.cl</p>
                                                            <p>• WhatsApp: +56 9 8765 4321</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </SubSection>

                                        <SubSection
                                            id="reglas-edificio"
                                            title="Reglas del edificio"
                                            icon={<FileText className="w-4 h-4" />}
                                            summary="Normativas y políticas del edificio"
                                            isExpanded={expandedSections.includes("reglas-edificio")}
                                            onToggle={() => toggleSubSection("reglas-edificio")}
                                        >
                                            <div className="space-y-3 pt-2">
                                                <div className="space-y-3">
                                                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Users className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                                            <span className="font-medium text-amber-900 dark:text-amber-100">Mascotas</span>
                                                        </div>
                                                        <div className="text-sm text-amber-700 dark:text-amber-300">
                                                            <p>• Mascotas permitidas (máximo 2 por unidad)</p>
                                                            <p>• Registro obligatorio en administración</p>
                                                            <p>• Responsabilidad por daños y ruidos</p>
                                                        </div>
                                                    </div>
                                                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                                            <span className="font-medium text-purple-900 dark:text-purple-100">Horarios de silencio</span>
                                                        </div>
                                                        <div className="text-sm text-purple-700 dark:text-purple-300">
                                                            <p>• 22:00 - 08:00 (días hábiles)</p>
                                                            <p>• 23:00 - 09:00 (fines de semana)</p>
                                                            <p>• Respeto por fiestas y celebraciones</p>
                                                        </div>
                                                    </div>
                                                    <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Building2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                                                            <span className="font-medium text-green-900 dark:text-green-100">Áreas comunes</span>
                                                        </div>
                                                        <div className="text-sm text-green-700 dark:text-green-300">
                                                            <p>• Uso responsable de amenidades</p>
                                                            <p>• Reserva previa para eventos</p>
                                                            <p>• Mantenimiento de limpieza</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </SubSection>
                                    </div>

                                    {/* CTA para ver más unidades */}
                                    <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h6 className="font-medium text-slate-900 dark:text-white">Más unidades disponibles</h6>
                                                <p className="text-sm text-slate-600 dark:text-slate-400">Explora otras opciones en este edificio</p>
                                            </div>
                                            <button
                                                onClick={() => logger.log("Ver todas las unidades")}
                                                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                            >
                                                Ver todas →
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
}