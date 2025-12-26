"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronDown,
    CheckCircle,
    XCircle,
    Building2,
    Shield,
    MapPin,
    Train,
    ShoppingBag,
    Leaf,
    Users,
    Phone,
    Clock,
    Star,
    Wifi,
    Home
} from "lucide-react";
import type { Building, Unit } from "@schemas/models";

interface AccordionSectionProps {
    id: string;
    title: string;
    icon: React.ReactNode;
    summary: string;
    isExpanded: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}

function AccordionSection({ id, title, icon, summary, isExpanded, onToggle, children }: AccordionSectionProps) {
    return (
        <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow duration-300">
            <button
                onClick={onToggle}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-expanded={isExpanded}
                aria-controls={`accordion-content-${id}`}
            >
                <div className="flex items-center gap-4 flex-1">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                        {icon}
                    </div>
                    <div className="flex-1">
                        <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-0.5">
                            {title}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {summary}
                        </p>
                    </div>
                </div>
                <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-slate-400 dark:text-slate-500 flex-shrink-0 ml-4"
                >
                    <ChevronDown className="w-5 h-5" />
                </motion.div>
            </button>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        id={`accordion-content-${id}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

interface PropertyAccordionSectionsProps {
    building: Building;
    selectedUnit: Unit | null;
}

export function PropertyAccordionSections({
    building,
    selectedUnit
}: PropertyAccordionSectionsProps) {
    const [expandedSections, setExpandedSections] = useState<string[]>([]);

    const toggleSection = (sectionId: string) => {
        setExpandedSections(prev =>
            prev.includes(sectionId)
                ? prev.filter(id => id !== sectionId)
                : [...prev, sectionId]
        );
    };

    // Datos para la sección Bairro (simplificado)
    const communeName = building.comuna || "Santiago";
    const tiempoMetro = 6; // Default metro time

    // Datos para requisitos
    const ingresoMinimo = Math.round((selectedUnit?.price || building.precio_desde || 290000) * 2.5);

    // Amenidades del edificio
    const amenities = building.amenities || [];

    // Items disponibles/indisponibles
    const itemsDisponibles = [
        { name: "Calefacción", icon: Home },
        { name: "Agua caliente", icon: Wifi },
        { name: "Conexión a gas", icon: Home },
        { name: "Internet incluido", icon: Wifi },
        { name: "Cable TV", icon: Wifi },
    ];

    const itemsIndisponibles = [
        { name: "Limpieza mensual", icon: Home },
        { name: "Servicio de conserjería", icon: Users },
    ];

    return (
        <section className="space-y-4">
            {/* Administrado pelo QuintoAndar */}
            <AccordionSection
                id="administrado"
                title="Administrado pelo QuintoAndar"
                icon={<Building2 className="w-5 h-5" />}
                summary="Servicios de administración y mantenimiento"
                isExpanded={expandedSections.includes("administrado")}
                onToggle={() => toggleSection("administrado")}
            >
                <div className="space-y-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <div className="flex items-center gap-3 mb-3">
                            <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            <h4 className="font-semibold text-blue-900 dark:text-blue-100">Assetplan</h4>
                        </div>
                        <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                <span>Administración profesional</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                <span>Mantenimiento preventivo</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                <span>Seguridad 24/7</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg">
                        <div className="flex items-center gap-3 mb-3">
                            <Clock className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                            <h4 className="font-semibold text-slate-900 dark:text-white">Horarios de atención</h4>
                        </div>
                        <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                            <p>Lunes a Viernes: 9:00 - 18:00</p>
                            <p>Sábados: 9:00 - 14:00</p>
                            <p>Emergencias: 24/7</p>
                        </div>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg">
                        <div className="flex items-center gap-3 mb-3">
                            <Phone className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                            <h4 className="font-semibold text-slate-900 dark:text-white">Contacto</h4>
                        </div>
                        <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                            <p>Teléfono: +56 2 2345 6789</p>
                            <p>Email: administracion@assetplan.cl</p>
                            <p>WhatsApp: +56 9 8765 4321</p>
                        </div>
                    </div>
                </div>
            </AccordionSection>

            {/* Condomínio */}
            <AccordionSection
                id="condominio"
                title="Condomínio"
                icon={<Star className="w-5 h-5" />}
                summary={`${amenities.length} amenidades disponibles`}
                isExpanded={expandedSections.includes("condominio")}
                onToggle={() => toggleSection("condominio")}
            >
                <div className="space-y-3">
                    {amenities.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {amenities.map((amenity, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700"
                                >
                                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                    <span className="text-sm text-slate-700 dark:text-slate-300">{amenity}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-6 text-slate-500 dark:text-slate-400">
                            <Building2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No hay amenidades registradas</p>
                        </div>
                    )}
                </div>
            </AccordionSection>

            {/* Bairro (Vecindario simplificado) */}
            <AccordionSection
                id="bairro"
                title="Bairro"
                icon={<MapPin className="w-5 h-5" />}
                summary={`Información sobre ${communeName}`}
                isExpanded={expandedSections.includes("bairro")}
                onToggle={() => toggleSection("bairro")}
            >
                <div className="space-y-4">
                    {/* Transporte */}
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <div className="flex items-center gap-3 mb-3">
                            <Train className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            <h4 className="font-semibold text-blue-900 dark:text-blue-100">Transporte</h4>
                        </div>
                        <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                            <p>• Metro a {tiempoMetro} minutos caminando</p>
                            <p>• Múltiples líneas de micros en la esquina</p>
                            <p>• Estación de bicicletas públicas</p>
                        </div>
                    </div>

                    {/* Servicios cercanos */}
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <div className="flex items-center gap-3 mb-3">
                            <ShoppingBag className="w-5 h-5 text-green-600 dark:text-green-400" />
                            <h4 className="font-semibold text-green-900 dark:text-green-100">Servicios cercanos</h4>
                        </div>
                        <div className="space-y-2 text-sm text-green-700 dark:text-green-300">
                            <p>• Supermercados a 5 minutos</p>
                            <p>• Farmacias 24 horas</p>
                            <p>• Bancos y cajeros automáticos</p>
                            <p>• Centros médicos y clínicas</p>
                        </div>
                    </div>

                    {/* Parques y áreas verdes */}
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                        <div className="flex items-center gap-3 mb-3">
                            <Leaf className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            <h4 className="font-semibold text-emerald-900 dark:text-emerald-100">Parques y áreas verdes</h4>
                        </div>
                        <div className="space-y-2 text-sm text-emerald-700 dark:text-emerald-300">
                            <p>• Parques cercanos para recreación</p>
                            <p>• Plazas y espacios públicos</p>
                            <p>• Áreas verdes para actividades al aire libre</p>
                        </div>
                    </div>
                </div>
            </AccordionSection>

            {/* Condições para alugar */}
            <AccordionSection
                id="condicoes"
                title="Condições para alugar"
                icon={<Shield className="w-5 h-5" />}
                summary="Requisitos y documentos necesarios"
                isExpanded={expandedSections.includes("condicoes")}
                onToggle={() => toggleSection("condicoes")}
            >
                <div className="space-y-4">
                    {/* Ingreso mínimo */}
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                        <div className="flex items-center gap-3 mb-2">
                            <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            <h4 className="font-semibold text-emerald-900 dark:text-emerald-100">
                                Ingreso mínimo: ${(ingresoMinimo / 1000000).toFixed(1)}M mensual
                            </h4>
                        </div>
                        <p className="text-sm text-emerald-700 dark:text-emerald-300">
                            Calculado según el valor del arriendo
                        </p>
                    </div>

                    {/* Documentos requeridos */}
                    <div className="space-y-3">
                        <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-2">Documentos requeridos</h4>
                        <div className="space-y-2">
                            <div className="flex items-start gap-2 p-2 bg-slate-50 dark:bg-slate-800/50 rounded">
                                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <div className="text-sm font-medium text-slate-900 dark:text-white">Cédula de identidad</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">Vigente y legible por ambos lados</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-2 p-2 bg-slate-50 dark:bg-slate-800/50 rounded">
                                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <div className="text-sm font-medium text-slate-900 dark:text-white">Liquidaciones de sueldo</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">Últimas 3 liquidaciones</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-2 p-2 bg-slate-50 dark:bg-slate-800/50 rounded">
                                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <div className="text-sm font-medium text-slate-900 dark:text-white">Certificado de antecedentes</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">Sin antecedentes penales (vigencia 90 días)</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-2 p-2 bg-slate-50 dark:bg-slate-800/50 rounded">
                                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <div className="text-sm font-medium text-slate-900 dark:text-white">Certificado DICOM</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">Sin morosidad vigente (vigencia 30 días)</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </AccordionSection>

            {/* Itens disponíveis/indisponíveis */}
            <AccordionSection
                id="itens"
                title="Itens disponíveis/indisponíveis"
                icon={<Home className="w-5 h-5" />}
                summary={`${itemsDisponibles.length} disponibles, ${itemsIndisponibles.length} indisponíveis`}
                isExpanded={expandedSections.includes("itens")}
                onToggle={() => toggleSection("itens")}
            >
                <div className="space-y-4">
                    {/* Items disponibles */}
                    <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-3 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            Itens disponíveis
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {itemsDisponibles.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800"
                                >
                                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                    <span className="text-sm text-green-700 dark:text-green-300">{item.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Items indisponibles */}
                    <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-3 flex items-center gap-2">
                            <XCircle className="w-4 h-4 text-slate-400" />
                            Itens indisponíveis
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {itemsIndisponibles.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800/50 rounded border border-slate-200 dark:border-slate-700"
                                >
                                    <XCircle className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                    <span className="text-sm text-slate-600 dark:text-slate-400">{item.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </AccordionSection>
        </section>
    );
}

