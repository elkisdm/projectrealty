"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Building2, ArrowRight, Users } from "lucide-react";

interface BuildingLinkCardProps {
  buildingName: string;
  photo: string;
  href: string;
  unitCount?: number;
  commune?: string;
  description?: string;
  className?: string;
}

export const BuildingLinkCard: React.FC<BuildingLinkCardProps> = ({
  buildingName,
  photo,
  href,
  unitCount,
  commune,
  description,
  className = ""
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{
        y: -4,
        scale: 1.02,
        transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
      }}
      whileTap={{
        scale: 0.98,
        transition: { duration: 0.1, ease: [0.4, 0, 0.2, 1] }
      }}
      className={`group relative overflow-hidden rounded-2xl border border-gray-700:border-gray-700 bg-gray-800:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 ${className}`}
    >
      <Link href={href} className="block">
        {/* Image Container */}
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={photo}
            alt={`Edificio ${buildingName}`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false}
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          {/* Badge con contador de unidades */}
          {unitCount && (
            <div className="absolute top-3 right-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
              <Users className="w-3 h-3 text-gray-300:text-gray-400" />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {unitCount} unidades
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              {/* Building Icon and Name */}
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-white:text-white truncate">
                    {buildingName}
                  </h3>
                  {commune && (
                    <p className="text-xs text-gray-400:text-gray-400 truncate">
                      {commune}
                    </p>
                  )}
                </div>
              </div>

              {/* Description */}
              {description && (
                <p className="text-xs text-gray-300:text-gray-300 line-clamp-2 mb-3">
                  {description}
                </p>
              )}

              {/* CTA Text */}
              <div className="flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-200">
                <span>Ver edificio completo</span>
                <ArrowRight className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-1" />
              </div>
            </div>
          </div>
        </div>

        {/* Hover Effect Overlay */}
        <div className="absolute inset-0 bg-blue-600/5 dark:bg-blue-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
      </Link>
    </motion.div>
  );
};

// Componente de skeleton para loading
export const BuildingLinkCardSkeleton: React.FC = () => {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-700:border-gray-700 bg-gray-800:bg-gray-800 shadow-lg">
      {/* Image skeleton */}
      <div className="aspect-video bg-gray-200 dark:bg-gray-700 animate-pulse" />

      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          <div className="flex-1 space-y-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-5/6" />
        </div>

        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/3" />
      </div>
    </div>
  );
};

// Componente compacto para listas
export const BuildingLinkCardCompact: React.FC<BuildingLinkCardProps> = ({
  buildingName,
  photo,
  href,
  unitCount: _unitCount,
  commune,
  className = ""
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      className={`group relative overflow-hidden rounded-xl border border-gray-700:border-gray-700 bg-gray-800:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-200 ${className}`}
    >
      <Link href={href} className="flex items-center p-3">
        {/* Image */}
        <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
          <Image
            src={photo}
            alt={`Edificio ${buildingName}`}
            fill
            className="object-cover"
            sizes="48px"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 ml-3">
          <h4 className="text-sm font-medium text-white:text-white truncate">
            {buildingName}
          </h4>
          {commune && (
            <p className="text-xs text-gray-400:text-gray-400 truncate">
              {commune}
            </p>
          )}
        </div>

        {/* Arrow */}
        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 flex-shrink-0" />
      </Link>
    </motion.div>
  );
};
