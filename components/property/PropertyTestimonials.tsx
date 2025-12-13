"use client";
import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Star, Quote, User, Calendar, MapPin } from "lucide-react";
import type { Building } from "@schemas/models";

interface PropertyTestimonialsProps {
    building: Building;
    variant?: "catalog" | "marketing" | "admin";
    className?: string;
}

interface Testimonial {
    id: number;
    name: string;
    role: string;
    rating: number;
    comment: string;
    date: string;
    location: string;
    avatar?: string;
    verified: boolean;
}

export function PropertyTestimonials({ building: _building, variant: _variant = "catalog", className = "" }: PropertyTestimonialsProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Testimonios mock (en producción vendrían de la base de datos)
    const testimonials: Testimonial[] = [
        {
            id: 1,
            name: "María González",
            role: "Inquilina actual",
            rating: 5,
            comment: "Excelente ubicación y muy buena administración. El edificio está impecable y los vecinos son muy amables. La zona es súper segura y tiene todo lo necesario cerca.",
            date: "Enero 2024",
            location: "Departamento 205",
            verified: true
        },
        {
            id: 2,
            name: "Carlos Mendoza",
            role: "Ex inquilino",
            rating: 5,
            comment: "Viví aquí por 2 años y fue una experiencia fantástica. El proceso de arriendo fue transparente, sin comisiones ocultas. La propiedad está en perfecto estado y la zona es ideal para familias.",
            date: "Diciembre 2023",
            location: "Departamento 112",
            verified: true
        },
        {
            id: 3,
            name: "Ana Silva",
            role: "Inquilina actual",
            rating: 5,
            comment: "Me encanta vivir aquí. El departamento es exactamente como se ve en las fotos, muy luminoso y bien distribuido. Los gastos comunes son razonables y el servicio de mantenimiento es rápido.",
            date: "Febrero 2024",
            location: "Departamento 308",
            verified: true
        },
        {
            id: 4,
            name: "Roberto Torres",
            role: "Ex inquilino",
            rating: 4,
            comment: "Buena experiencia en general. La propiedad está bien mantenida y la administración responde rápido a las consultas. La zona es tranquila y tiene buena conectividad.",
            date: "Noviembre 2023",
            location: "Departamento 156",
            verified: true
        }
    ];

    const nextTestimonial = () => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    };

    const prevTestimonial = () => {
        setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    };

    const goToTestimonial = (index: number) => {
        setCurrentIndex(index);
    };

    const currentTestimonial = testimonials[currentIndex];

    return (
        <section className={`bg-gray-800:bg-gray-800 rounded-2xl shadow-lg border border-gray-700:border-gray-700 p-6 lg:p-8 ${className}`}>
            {/* Header */}
            <div className="text-center mb-8">
                <h2 className="text-2xl lg:text-3xl font-bold text-white:text-white mb-4">
                    Lo que dicen nuestros inquilinos
                </h2>
                <p className="text-base lg:text-lg text-gray-300:text-gray-300">
                    Experiencias reales de personas que han vivido en {building.name}
                </p>
            </div>

            {/* Testimonio principal */}
            <div className="relative mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 lg:p-8 border border-blue-200 dark:border-blue-700">
                    {/* Quote icon */}
                    <div className="flex justify-center mb-6">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                            <Quote className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>

                    {/* Testimonio */}
                    <div className="text-center mb-6">
                        <p className="text-lg lg:text-xl text-gray-700 dark:text-gray-200 leading-relaxed italic mb-6">
                            "{currentTestimonial.comment}"
                        </p>

                        {/* Rating */}
                        <div className="flex justify-center items-center gap-1 mb-4">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={`w-5 h-5 ${i < currentTestimonial.rating
                                        ? "text-yellow-400 fill-current"
                                        : "text-gray-300 dark:text-gray-600"
                                        }`}
                                />
                            ))}
                            <span className="ml-2 text-sm text-gray-300:text-gray-400">
                                {currentTestimonial.rating}/5
                            </span>
                        </div>

                        {/* Información del autor */}
                        <div className="flex items-center justify-center gap-3">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="text-left">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-white:text-white">
                                        {currentTestimonial.name}
                                    </h3>
                                    {currentTestimonial.verified && (
                                        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                            <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                                <p className="text-sm text-gray-300:text-gray-400">{currentTestimonial.role}</p>
                                <div className="flex items-center gap-2 text-xs text-gray-400:text-gray-500">
                                    <Calendar className="w-3 h-3" />
                                    {currentTestimonial.date}
                                    <MapPin className="w-3 h-3" />
                                    {currentTestimonial.location}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navegación */}
                <div className="flex justify-center gap-4 mt-6">
                    <button
                        onClick={prevTestimonial}
                        className="w-10 h-10 bg-gray-800:bg-gray-700 rounded-full flex items-center justify-center border border-gray-700:border-gray-600 hover:bg-gray-900:hover:bg-gray-600 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        aria-label="Testimonio anterior"
                    >
                        <ChevronLeft className="w-5 h-5 text-gray-300:text-gray-400" />
                    </button>

                    <button
                        onClick={nextTestimonial}
                        className="w-10 h-10 bg-gray-800:bg-gray-700 rounded-full flex items-center justify-center border border-gray-700:border-gray-600 hover:bg-gray-900:hover:bg-gray-600 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        aria-label="Testimonio siguiente"
                    >
                        <ChevronRight className="w-5 h-5 text-gray-300:text-gray-400" />
                    </button>
                </div>
            </div>

            {/* Indicadores de paginación */}
            <div className="flex justify-center gap-2">
                {testimonials.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToTestimonial(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${index === currentIndex
                            ? "bg-blue-600 w-6"
                            : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
                            }`}
                        aria-label={`Ir al testimonio ${index + 1}`}
                        aria-current={index === currentIndex ? "true" : "false"}
                    />
                ))}
            </div>

            {/* Estadísticas de confianza */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-900:bg-gray-700 rounded-xl">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                        {testimonials.filter(t => t.rating === 5).length}/{testimonials.length}
                    </div>
                    <div className="text-sm text-gray-300:text-gray-400">
                        Calificación 5 estrellas
                    </div>
                </div>
                <div className="text-center p-4 bg-gray-900:bg-gray-700 rounded-xl">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                        {testimonials.filter(t => t.verified).length}
                    </div>
                    <div className="text-sm text-gray-300:text-gray-400">
                        Testimonios verificados
                    </div>
                </div>
                <div className="text-center p-4 bg-gray-900:bg-gray-700 rounded-xl">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                        {testimonials.length}
                    </div>
                    <div className="text-sm text-gray-300:text-gray-400">
                        Experiencias compartidas
                    </div>
                </div>
            </div>

            {/* CTA para dejar testimonio */}
            <div className="mt-8 text-center">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border border-green-200 dark:border-green-700">
                    <h3 className="text-lg font-semibold text-white:text-white mb-2">
                        ¿Vives o viviste aquí?
                    </h3>
                    <p className="text-sm text-gray-300:text-gray-300 mb-4">
                        Comparte tu experiencia y ayuda a otros a tomar la mejor decisión
                    </p>
                    <button className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors duration-200">
                        <Quote className="w-4 h-4" />
                        Dejar mi testimonio
                    </button>
                </div>
            </div>
        </section>
    );
}









