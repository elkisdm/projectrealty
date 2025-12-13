"use client";

import React from "react";
import { motion } from "framer-motion";
import { BuildingLinkCard, BuildingLinkCardCompact } from "@components/building/BuildingLinkCard";
import type { Building } from "@schemas/models";

interface RelatedPropertiesProps {
    currentBuilding: Building;
    relatedBuildings: Building[];
    maxItems?: number;
    compact?: boolean;
}

export function RelatedProperties({
    currentBuilding,
    relatedBuildings,
    maxItems = 4,
    compact = false
}: RelatedPropertiesProps) {
    // Filtrar edificios relacionados (excluir el actual)
    const filteredBuildings = relatedBuildings
        .filter(building => building.id !== currentBuilding.id)
        .slice(0, maxItems);

    if (filteredBuildings.length === 0) {
        return null;
    }

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: [0.4, 0, 0.2, 1],
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20, scale: 0.95 },
        visible: {
            opacity: 1,
            x: 0,
            scale: 1,
            transition: {
                duration: 0.4,
                ease: [0.4, 0, 0.2, 1]
            }
        }
    };

    return (
        <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="space-y-6"
        >
            {/* Header */}
            <div className="text-center lg:text-left">
                <h2 className="text-2xl lg:text-3xl font-bold text-white:text-white mb-2">
                    Propiedades relacionadas
                </h2>
                <p className="text-gray-300:text-gray-400">
                    Descubre más opciones en {currentBuilding.comuna}
                </p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {filteredBuildings.map((building) => (
                    <motion.div
                        key={building.id}
                        variants={itemVariants}
                        whileHover={{
                            y: -4,
                            transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
                        }}
                    >
                        {compact ? (
                            <BuildingLinkCardCompact
                                buildingName={building.name}
                                commune={building.comuna}
                                unitCount={building.units?.length || 0}
                                photo={building.coverImage || building.gallery?.[0]}
                                href={`/property/${building.slug}`}
                                className="h-full"
                            />
                        ) : (
                            <BuildingLinkCard
                                buildingName={building.name}
                                commune={building.comuna}
                                unitCount={building.units?.length || 0}
                                photo={building.coverImage || building.gallery?.[0]}
                                href={`/property/${building.slug}`}
                                className="h-full"
                            />
                        )}
                    </motion.div>
                ))}
            </div>

            {/* View All Button */}
            {relatedBuildings.length > maxItems && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="text-center"
                >
                    <a
                        href={`/arrienda-sin-comision/${currentBuilding.comuna.toLowerCase().replace(/\s+/g, '-')}`}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 shadow-lg hover:shadow-xl"
                    >
                        Ver todas las propiedades en {currentBuilding.comuna}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </a>
                </motion.div>
            )}
        </motion.section>
    );
}

export default RelatedProperties;
