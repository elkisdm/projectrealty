"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { MapPin, Users, Car, Leaf, Star, ArrowRight } from "lucide-react";

interface CommuneHighlight {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
}

interface CommuneLifeSectionProps {
    commune: string;
    heroImage: string;
    highlights: CommuneHighlight[];
    testimonial: {
        text: string;
        author: string;
        rating: number;
    };
    mapPins: Array<{
        name: string;
        type: 'metro' | 'plaza' | 'universidad' | 'shopping' | 'hospital';
        coordinates: [number, number];
    }>;
}

const DEFAULT_HIGHLIGHTS: CommuneHighlight[] = [
    {
        icon: Car,
        title: "Excelente conectividad",
        description: "Metro, buses y vías principales a minutos"
    },
    {
        icon: Users,
        title: "Vida urbana vibrante",
        description: "Restaurantes, cafés y entretenimiento cerca"
    },
    {
        icon: Leaf,
        title: "Áreas verdes",
        description: "Parques y plazas para recreación"
    },
    {
        icon: Star,
        title: "Servicios completos",
        description: "Supermercados, farmacias y bancos"
    }
];

export function CommuneLifeSection({
    commune,
    heroImage,
    highlights = DEFAULT_HIGHLIGHTS,
    testimonial = {
        text: "Excelente lugar para vivir",
        author: "Residente",
        rating: 5
    },
    mapPins = []
}: CommuneLifeSectionProps) {
    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
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

    const getPinIcon = (type: string) => {
        switch (type) {
            case 'metro':
                return '🚇';
            case 'plaza':
                return '🌳';
            case 'universidad':
                return '🎓';
            case 'shopping':
                return '🛍️';
            case 'hospital':
                return '🏥';
            default:
                return '📍';
        }
    };

    return (
        <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="space-y-8 lg:space-y-12"
        >
            {/* Header */}
            <div className="text-center">
                <h2 className="text-3xl lg:text-4xl font-bold text-white:text-white mb-4">
                    Cómo es vivir en {commune}
                </h2>
                <p className="text-lg text-gray-300:text-gray-400 max-w-2xl mx-auto">
                    Descubre por qué {commune} es uno de los lugares más atractivos para vivir en Santiago
                </p>
            </div>

            {/* Hero Image */}
            <motion.div
                variants={itemVariants}
                className="relative h-64 lg:h-80 rounded-2xl overflow-hidden"
            >
                <Image
                    src={heroImage}
                    alt={`Vista de ${commune}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 text-white">
                    <h3 className="text-2xl font-bold mb-2">{commune}</h3>
                    <p className="text-white/90">Un lugar increíble para vivir</p>
                </div>
            </motion.div>

            {/* Highlights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {highlights.map((highlight, index) => (
                    <motion.div
                        key={index}
                        variants={itemVariants}
                        className="bg-gray-800:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-700:border-gray-700"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <highlight.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="font-semibold text-white:text-white">
                                {highlight.title}
                            </h3>
                        </div>
                        <p className="text-gray-300:text-gray-400 text-sm">
                            {highlight.description}
                        </p>
                    </motion.div>
                ))}
            </div>

            {/* Map Section */}
            <motion.div
                variants={itemVariants}
                className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 lg:p-8"
            >
                <div className="flex items-center gap-3 mb-6">
                    <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-xl font-semibold text-white:text-white">
                        Puntos de interés cercanos
                    </h3>
                </div>

                {/* Mock Map */}
                <div className="relative bg-gray-800:bg-gray-700 rounded-xl p-4 h-48 lg:h-64 mb-6">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4 mx-auto">
                                <MapPin className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                            </div>
                            <p className="text-gray-300:text-gray-400 text-sm">
                                Mapa interactivo de {commune}
                            </p>
                        </div>
                    </div>

                    {/* Mock Pins */}
                    {mapPins.slice(0, 3).map((pin, index) => (
                        <div
                            key={index}
                            className="absolute"
                            style={{
                                left: `${20 + index * 25}%`,
                                top: `${30 + (index % 2) * 30}%`
                            }}
                        >
                            <div className="bg-gray-800:bg-gray-800 rounded-lg px-2 py-1 text-xs shadow-lg border border-gray-700:border-gray-600">
                                <span className="mr-1">{getPinIcon(pin.type)}</span>
                                {pin.name}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pins List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {mapPins.map((pin, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-2 text-sm text-gray-300:text-gray-400"
                        >
                            <span>{getPinIcon(pin.type)}</span>
                            <span>{pin.name}</span>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Testimonial */}
            <motion.div
                variants={itemVariants}
                className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 lg:p-8 text-white"
            >
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                            <Users className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-1 mb-3">
                            {[...Array(testimonial.rating)].map((_, i) => (
                                <Star key={i} className="w-4 h-4 fill-current" />
                            ))}
                        </div>
                        <blockquote className="text-lg mb-4 italic">
                            "{testimonial.text}"
                        </blockquote>
                        <cite className="text-white/90 font-medium">
                            — {testimonial.author}
                        </cite>
                    </div>
                </div>
            </motion.div>

            {/* CTA */}
            <motion.div
                variants={itemVariants}
                className="text-center"
            >
                <a
                    href={`/arrienda-sin-comision/${commune.toLowerCase().replace(/\s+/g, '-')}`}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 shadow-lg hover:shadow-xl"
                >
                    Ver más propiedades en {commune}
                    <ArrowRight className="w-5 h-5" />
                </a>
            </motion.div>
        </motion.section>
    );
}

export default CommuneLifeSection;
