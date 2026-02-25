"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
    Mail,
    Phone,
    MapPin,
    MessageCircle,
    Instagram,
    Facebook,
    Linkedin,
    Shield,
    Users,
    Award
} from "lucide-react";

export function Footer() {
    const prefersReducedMotion = useReducedMotion();

    const animationConfig = {
        duration: prefersReducedMotion ? 0 : 0.6,
        ease: "easeOut" as const
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: animationConfig.duration,
                ease: animationConfig.ease,
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: animationConfig.duration,
                ease: animationConfig.ease
            }
        }
    };

    const currentYear = new Date().getFullYear();

    return (
        <footer
            className="bg-surface border-t border-soft/50 mt-auto"
            role="contentinfo"
            aria-label="Pie de página"
        >
            <motion.div
                className="container-page py-12"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Logo y descripción */}
                    <motion.div variants={itemVariants} className="lg:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-ring to-ring/80">
                                <span className="text-lg font-bold text-white">E</span>
                            </div>
                            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold text-xl">
                                Elkis Realtor
                            </span>
                        </div>
                        <p className="text-subtext text-sm leading-relaxed mb-4">
                            Arrienda departamentos en Santiago. Compara precios, agenda visitas y encuentra tu hogar de forma fácil y transparente.
                        </p>
                        <div className="flex items-center gap-2 text-xs text-subtext">
                            <Shield className="w-4 h-4" aria-hidden="true" />
                            <span>Transparencia total</span>
                        </div>
                    </motion.div>

                    {/* Enlaces rápidos */}
                    <motion.div variants={itemVariants}>
                        <h3 className="font-semibold text-text mb-4">Enlaces rápidos</h3>
                        <nav aria-label="Enlaces rápidos">
                            <ul className="space-y-2">
                                <li>
                                    <Link
                                        href="/"
                                        className="text-subtext hover:text-text transition-colors text-sm"
                                    >
                                        Inicio
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/buscar"
                                        className="text-subtext hover:text-text transition-colors text-sm"
                                    >
                                        Departamentos destacados
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/cotizador"
                                        className="text-subtext hover:text-text transition-colors text-sm"
                                    >
                                        Cotizador
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/mi-bio"
                                        className="text-subtext hover:text-text transition-colors text-sm"
                                    >
                                        Mi Bio
                                    </Link>
                                </li>
                            </ul>
                        </nav>
                    </motion.div>

                    {/* Servicios */}
                    <motion.div variants={itemVariants}>
                        <h3 className="font-semibold text-text mb-4">Servicios</h3>
                        <nav aria-label="Servicios">
                            <ul className="space-y-2">
                                <li>
                                    <Link
                                        href="/property"
                                        className="text-subtext hover:text-text transition-colors text-sm flex items-center gap-2"
                                    >
                                        <span>Buscar propiedades</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/booking"
                                        className="text-subtext hover:text-text transition-colors text-sm flex items-center gap-2"
                                    >
                                        <span>Agendar visita</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/quotation"
                                        className="text-subtext hover:text-text transition-colors text-sm flex items-center gap-2"
                                    >
                                        <span>Solicitar cotización</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/waitlist"
                                        className="text-subtext hover:text-text transition-colors text-sm flex items-center gap-2"
                                    >
                                        <span>Lista de espera</span>
                                    </Link>
                                </li>
                            </ul>
                        </nav>
                    </motion.div>

                    {/* Contacto */}
                    <motion.div variants={itemVariants}>
                        <h3 className="font-semibold text-text mb-4">Contacto</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-subtext text-sm">
                                <Phone className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                                <a
                                    href="tel:+56912345678"
                                    className="hover:text-text transition-colors"
                                    aria-label="Llamar al +56 9 1234 5678"
                                >
                                    +56 9 1234 5678
                                </a>
                            </div>
                            <div className="flex items-center gap-2 text-subtext text-sm">
                                <Mail className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                                <a
                                    href="mailto:contacto@elkisrealtor.cl"
                                    className="hover:text-text transition-colors"
                                    aria-label="Enviar email a contacto@elkisrealtor.cl"
                                >
                                    contacto@elkisrealtor.cl
                                </a>
                            </div>
                            <div className="flex items-center gap-2 text-subtext text-sm">
                                <MapPin className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                                <span>Santiago, Chile</span>
                            </div>
                        </div>

                        {/* Redes sociales */}
                        <div className="mt-6">
                            <h4 className="font-medium text-text mb-3 text-sm">Síguenos</h4>
                            <div className="flex gap-3">
                                <a
                                    href="https://wa.me/56912345678"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                                    aria-label="Contactar por WhatsApp"
                                >
                                    <MessageCircle className="w-4 h-4" aria-hidden="true" />
                                </a>
                                <a
                                    href="https://instagram.com/elkisrealtor"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transition-colors"
                                    aria-label="Seguir en Instagram"
                                >
                                    <Instagram className="w-4 h-4" aria-hidden="true" />
                                </a>
                                <a
                                    href="https://facebook.com/elkisrealtor"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                                    aria-label="Seguir en Facebook"
                                >
                                    <Facebook className="w-4 h-4" aria-hidden="true" />
                                </a>
                                <a
                                    href="https://linkedin.com/in/elkisrealtor"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-700 text-white hover:bg-blue-800 transition-colors"
                                    aria-label="Seguir en LinkedIn"
                                >
                                    <Linkedin className="w-4 h-4" aria-hidden="true" />
                                </a>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Línea divisoria */}
                <motion.div
                    className="border-t border-soft/50 mt-8 pt-8"
                    variants={itemVariants}
                >
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-2 text-subtext text-sm">
                            <span>© {currentYear} Elkis Realtor. Todos los derechos reservados.</span>
                        </div>

                        <div className="flex items-center gap-6 text-subtext text-sm">
                            <Link
                                href="/privacy"
                                className="hover:text-text transition-colors"
                            >
                                Privacidad
                            </Link>
                            <Link
                                href="/terms"
                                className="hover:text-text transition-colors"
                            >
                                Términos
                            </Link>
                            <Link
                                href="/cookies"
                                className="hover:text-text transition-colors"
                            >
                                Cookies
                            </Link>
                        </div>
                    </div>

                    {/* Badges de confianza */}
                    <motion.div
                        className="flex flex-wrap items-center justify-center gap-4 mt-6 pt-6 border-t border-soft/30"
                        variants={itemVariants}
                    >
                        <div className="flex items-center gap-2 text-xs text-subtext">
                            <Award className="w-4 h-4" aria-hidden="true" />
                            <span>Certificado SII</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-subtext">
                            <Users className="w-4 h-4" aria-hidden="true" />
                            <span>+500 clientes satisfechos</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-subtext">
                            <Shield className="w-4 h-4" aria-hidden="true" />
                            <span>Transparencia garantizada</span>
                        </div>
                    </motion.div>
                </motion.div>
            </motion.div>
        </footer>
    );
}
