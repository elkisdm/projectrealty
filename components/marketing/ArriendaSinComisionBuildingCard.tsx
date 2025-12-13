"use client";

import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Home, Zap, ArrowRight, Percent, Shield, Clock, CreditCard, UserCheck, ChevronLeft, ChevronRight, Bed, Building2, Castle, Hotel, Flame } from "lucide-react";
import Link from "next/link";
import type { BuildingSummary } from "@/hooks/useFetchBuildings";

interface ArriendaSinComisionBuildingCardProps {
  building: BuildingSummary;
}

// Memoizar funciones utilitarias para mejor performance
const getMaxPrice = (typologySummary: BuildingSummary['typologySummary']) => {
  if (!typologySummary) return 0;
  return Math.max(...typologySummary.map(t => t.minPrice || 0));
};

const getMinPrice = (typologySummary: BuildingSummary['typologySummary']) => {
  if (!typologySummary) return 0;
  return Math.min(...typologySummary.map(t => t.minPrice || 0));
};

const getTypologyIcon = (label: string) => {
  const labelLower = label.toLowerCase();

  if (labelLower.includes('estudio')) return <Home className="w-4 h-4" aria-hidden="true" />;
  if (labelLower.includes('1 dormitorio') || labelLower.includes('1d')) return <Bed className="w-4 h-4" aria-hidden="true" />;
  if (labelLower.includes('2 dormitorios') || labelLower.includes('2d')) return <Building2 className="w-4 h-4" aria-hidden="true" />;
  if (labelLower.includes('3 dormitorios') || labelLower.includes('3d')) return <Hotel className="w-4 h-4" aria-hidden="true" />;
  if (labelLower.includes('4 dormitorios') || labelLower.includes('4d')) return <Castle className="w-4 h-4" aria-hidden="true" />;
  return <Home className="w-4 h-4" aria-hidden="true" />;
};

const getBadgeIcon = (label: string) => {
  if (label.includes('Sin comisión') || label.includes('Comisión gratis')) return <Percent className="w-3 h-3" aria-hidden="true" />;
  if (label.includes('Garantía en cuotas')) return <Shield className="w-3 h-3" aria-hidden="true" />;
  if (label.includes('Opción sin garantía')) return <Shield className="w-3 h-3" aria-hidden="true" />;
  if (label.includes('Precio fijo') || label.includes('12 meses')) return <Clock className="w-3 h-3" aria-hidden="true" />;
  if (label.includes('cuotas')) return <CreditCard className="w-3 h-3" aria-hidden="true" />;
  if (label.includes('sin aval')) return <UserCheck className="w-3 h-3" aria-hidden="true" />;
  if (label.includes('OFF') || label.includes('%')) return <Zap className="w-3 h-3" aria-hidden="true" />;
  return <Zap className="w-3 h-3" aria-hidden="true" />;
};

const getBadgeColor = (label: string) => {
  if (label.includes('Sin comisión') || label.includes('Comisión gratis')) {
    return "bg-gradient-to-r from-emerald-500 to-teal-500 text-white";
  }
  if (label.includes('Garantía en cuotas')) {
    return "bg-gradient-to-r from-blue-500 to-indigo-500 text-white";
  }
  if (label.includes('Opción sin garantía')) {
    return "bg-gradient-to-r from-amber-500 to-orange-500 text-white";
  }
  if (label.includes('Precio fijo') || label.includes('12 meses')) {
    return "bg-gradient-to-r from-purple-500 to-violet-500 text-white";
  }
  if (label.includes('cuotas')) {
    return "bg-gradient-to-r from-cyan-500 to-blue-500 text-white";
  }
  if (label.includes('sin aval')) {
    return "bg-gradient-to-r from-orange-500 to-red-500 text-white";
  }
  if (label.includes('OFF') || label.includes('%')) {
    return "bg-gradient-to-r from-red-500 to-pink-500 text-white";
  }
  return "bg-gradient-to-r from-gray-500 to-gray-600 text-white";
};

const getTypologyOrder = (label: string) => {
  if (label.includes('Estudio')) return 1;
  if (label.includes('1 dormitorio')) return 2;
  if (label.includes('2 dormitorios')) return 3;
  if (label.includes('3 dormitorios')) return 4;
  if (label.includes('4 dormitorios')) return 5;
  return 6;
};

export default function ArriendaSinComisionBuildingCard({ building }: ArriendaSinComisionBuildingCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Memoizar cálculos costosos
  const {
    minPrice,
    maxPrice,
    totalUnits: _totalUnits,
    sinComisionBadge,
    otherBadges,
    sortedTypologies,
    allImages
  } = useMemo(() => {
    const minPrice = getMinPrice(building.typologySummary);
    const maxPrice = getMaxPrice(building.typologySummary);
    const totalUnits = building.typologySummary?.reduce((sum, t) => sum + t.count, 0) || 0;

    // Encontrar el badge de "Comisión gratis" para el principal
    const sinComisionBadge = building.badges?.find(badge =>
      badge.label.includes('Comisión gratis') || badge.label.includes('0% Comisión')
    );

    // Resto de badges para mostrar debajo (hasta 5 badges)
    const otherBadges = building.badges?.filter(badge =>
      !badge.label.includes('Comisión gratis') && !badge.label.includes('0% Comisión')
    ).slice(0, 5) || [];

    // Ordenar tipologías de la más pequeña a la más grande
    const sortedTypologies = building.typologySummary?.sort((a, b) =>
      getTypologyOrder(a.label) - getTypologyOrder(b.label)
    ) || [];

    // Obtener todas las imágenes disponibles
    const allImages = building.gallery && building.gallery.length > 0
      ? building.gallery.filter((img): img is string => Boolean(img))
      : building.coverImage
        ? [building.coverImage]
        : ['/images/nunoa-cover.jpg'];

    return {
      minPrice,
      maxPrice,
      totalUnits,
      sinComisionBadge,
      otherBadges,
      sortedTypologies,
      allImages
    };
  }, [building]);

  // Memoizar funciones de navegación
  const nextImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  }, [allImages.length]);

  const prevImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  }, [allImages.length]);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="group relative bg-gray-800:bg-gray-900 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-800 w-full max-w-sm flex flex-col h-[750px]"
      role="article"
      aria-labelledby={`building-${building.id}-title`}
    >
      {/* Imagen principal con carrusel - altura fija */}
      <div className="relative h-64 overflow-hidden flex-shrink-0" role="region" aria-label="Galería de imágenes del edificio">
        {allImages.length > 0 && (
          <Image
            src={allImages[currentImageIndex] || allImages[0]}
            alt={`Imagen ${currentImageIndex + 1} de ${allImages.length} del edificio ${building.name}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-all duration-150"
            priority={currentImageIndex === 0}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Badge principal: Comisión gratis */}
        {sinComisionBadge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="absolute top-4 left-4 z-10"
          >
            <div className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-white px-4 py-2 text-sm font-bold rounded-full shadow-lg flex items-center gap-2 backdrop-blur-sm border border-cyan-300/50">
              <div className="relative">
                {/* Fuego principal */}
                <motion.div
                  animate={{
                    scale: [1, 1.2, 0.8, 1.1, 1],
                    rotate: [0, 10, -8, 5, 0],
                    y: [0, -2, 1, -1, 0]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="relative z-10"
                >
                  <Flame className="w-4 h-4 text-cyan-200 drop-shadow-lg" aria-hidden="true" />
                </motion.div>

                {/* Chispas de magma y humo */}
                <motion.div
                  animate={{
                    scale: [0, 1.2, 0],
                    opacity: [0, 1, 0],
                    y: [0, -15, -30],
                    x: [0, 4, -3],
                    rotate: [0, 45, 90, 180]
                  }}
                  transition={{
                    duration: 1.4,
                    repeat: Infinity,
                    delay: 0.3,
                    ease: "easeOut"
                  }}
                  className="absolute top-0 left-0 w-1 h-3 bg-gradient-to-t from-cyan-400 to-transparent rounded-full drop-shadow-lg"
                  style={{ transformOrigin: 'center bottom' }}
                />
                <motion.div
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [0, 0.8, 0],
                    y: [0, -8, -20],
                    x: [0, -3, 2],
                    rotate: [0, -30, 60, -90]
                  }}
                  transition={{
                    duration: 1.6,
                    repeat: Infinity,
                    delay: 0.7,
                    ease: "easeOut"
                  }}
                  className="absolute top-0 left-0 w-0.5 h-2 bg-gradient-to-t from-blue-400 to-transparent rounded-full drop-shadow-lg"
                  style={{ transformOrigin: 'center bottom' }}
                />
                <motion.div
                  animate={{
                    scale: [0, 1.5, 0],
                    opacity: [0, 0.6, 0],
                    y: [0, -25, -40],
                    x: [0, 2, -4],
                    rotate: [0, 90, 180, 270]
                  }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    delay: 1.1,
                    ease: "easeOut"
                  }}
                  className="absolute top-0 left-0 w-0.5 h-4 bg-gradient-to-t from-purple-400 to-transparent rounded-full drop-shadow-lg"
                  style={{ transformOrigin: 'center bottom' }}
                />
                <motion.div
                  animate={{
                    scale: [0, 1.1, 0],
                    opacity: [0, 0.7, 0],
                    y: [0, -12, -25],
                    x: [0, -2, 3],
                    rotate: [0, -45, 90, -135]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: 0.5,
                    ease: "easeOut"
                  }}
                  className="absolute top-0 left-0 w-0.5 h-2.5 bg-gradient-to-t from-cyan-200 to-transparent rounded-full drop-shadow-lg"
                  style={{ transformOrigin: 'center bottom' }}
                />

                {/* Humo sutil */}
                <motion.div
                  animate={{
                    scale: [0, 1.3, 0],
                    opacity: [0, 0.4, 0],
                    y: [0, -5, -15],
                    x: [0, 1, -1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: 0.2,
                    ease: "easeOut"
                  }}
                  className="absolute top-0 left-0 w-2 h-1 bg-gradient-to-r from-gray-400/30 to-transparent rounded-full blur-sm"
                />
              </div>
              <span className="drop-shadow-sm">{sinComisionBadge.label}</span>
            </div>
          </motion.div>
        )}

        {/* Controles del carrusel */}
        {allImages.length > 1 && (
          <>
            {/* Botón anterior */}
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 backdrop-blur-sm z-20"
              aria-label="Imagen anterior"
            >
              <ChevronLeft className="w-5 h-5" aria-hidden="true" />
            </button>

            {/* Botón siguiente */}
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 backdrop-blur-sm z-20"
              aria-label="Imagen siguiente"
            >
              <ChevronRight className="w-5 h-5" aria-hidden="true" />
            </button>

            {/* Indicador de posición */}
            <div className="absolute bottom-4 right-4 bg-black/40 backdrop-blur-sm rounded-full px-2 py-1 text-white text-xs font-medium z-10">
              {currentImageIndex + 1} / {allImages.length}
            </div>
          </>
        )}
      </div>

      {/* Contenido - se expande para llenar el espacio restante */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        {/* Contenido principal */}
        <div className="space-y-4">
          {/* Nombre del edificio */}
          <motion.h3
            id={`building-${building.id}-title`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-lg font-bold text-white:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
          >
            <Link href={`/arrienda-sin-comision/${building.slug}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              {building.name}
            </Link>
          </motion.h3>

          {/* Dirección */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="text-sm text-gray-300:text-gray-400 flex items-center gap-1"
          >
            <span role="img" aria-label="ubicación">📍</span> {building.address}, {building.comuna}
          </motion.p>

          {/* Badges principales con colores modernos */}
          {otherBadges.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap gap-1.5"
              role="list"
              aria-label="Promociones disponibles"
            >
              {otherBadges.map((badge, index) => (
                <div
                  key={index}
                  className={`${getBadgeColor(badge.label)} px-2.5 py-1 text-xs font-semibold rounded-full shadow-md flex items-center gap-1.5`}
                  role="listitem"
                >
                  {getBadgeIcon(badge.label)}
                  <span>{badge.label}</span>
                </div>
              ))}
            </motion.div>
          )}

          {/* Precio */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="space-y-1"
          >
            <p className="text-sm text-gray-300:text-gray-400">
              Arriendo mensual desde:
            </p>
            <p className="text-xl font-bold text-white:text-white">
              ${minPrice.toLocaleString('es-CL')} - ${maxPrice.toLocaleString('es-CL')}
            </p>
          </motion.div>

          {/* Tipologías disponibles */}
          {sortedTypologies.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-3"
            >
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Tipologías disponibles:
              </p>
              <div className="grid grid-cols-2 gap-2" role="list" aria-label="Tipologías de departamentos">
                {sortedTypologies.map((typology, index) => (
                  <div
                    key={typology.key}
                    className="flex items-center justify-between p-2.5 bg-gray-900:bg-gray-800 rounded-lg border border-gray-700:border-gray-700 hover:bg-gray-800:hover:bg-gray-700 transition-colors group cursor-pointer"
                    role="listitem"
                    tabIndex={0}
                    aria-label={`${typology.label}, ${typology.count} unidades disponibles`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-md">
                        {getTypologyIcon(typology.label)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white:text-white truncate">
                          {typology.label}
                        </p>
                        <p className="text-xs text-gray-300:text-gray-400">
                          {typology.count} disp.
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors flex-shrink-0" aria-hidden="true" />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* CTA - posición fija al final */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="pt-4 pb-2 flex-shrink-0"
        >
          <Link href={`/arrienda-sin-comision/${building.slug}`}>
            <button
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label={`Ver detalles completos del edificio ${building.name}`}
            >
              Ver detalles del edificio
            </button>
          </Link>
        </motion.div>
      </div>


    </motion.article>
  );
}

