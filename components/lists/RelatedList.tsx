import { motion } from "framer-motion";
import { BuildingCard } from "@components/BuildingCard";
import type { Building } from "@schemas/models";
import type { BuildingSummary } from "@hooks/useFetchBuildings";

type RelatedListProps = {
  buildings: (Building & { precioDesde: number | null })[];
};

// Convert Building to BuildingSummary for card compatibility
function toBuildingSummary(building: Building & { precioDesde: number | null }): BuildingSummary {
  const availableUnits = building.units.filter((u) => u.disponible);
  const hasAvailability = availableUnits.length > 0;

  return {
    id: building.id,
    slug: building.slug,
    name: building.name,
    comuna: building.comuna,
    address: building.address,
    gallery: building.gallery,
    coverImage: building.coverImage,
    badges: building.badges,
    serviceLevel: building.serviceLevel,
    precioDesde: building.precioDesde || 0,
    precioRango: building.precioRango,
    hasAvailability,
    typologySummary: building.typologySummary,
  };
}

export function RelatedList({ buildings }: RelatedListProps) {
  if (!buildings || buildings.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center py-12"
      >
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-800:bg-gray-800 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white:text-white mb-2">
            No hay propiedades relacionadas
          </h3>
          <p className="text-gray-300:text-gray-400">
            Explora otras propiedades en nuestra plataforma
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header con título y descripción */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center"
      >
        <h2 className="text-3xl font-bold text-white:text-white mb-3">
          Propiedades similares
        </h2>
        <p className="text-gray-300:text-gray-400 max-w-2xl mx-auto">
          Descubre otras opciones que podrían interesarte en la misma zona
        </p>
      </motion.div>

      {/* Grid de propiedades */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {buildings.map((building, index) => (
          <motion.div
            key={building.id}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.4,
              delay: 0.1 + index * 0.1,
              ease: "easeOut"
            }}
            whileHover={{
              y: -8,
              transition: { duration: 0.2 }
            }}
            className="group"
          >
            <BuildingCard
              building={toBuildingSummary(building)}
              showBadge={true}
              priority={index === 0} // Priorizar la primera imagen
            />
          </motion.div>
        ))}
      </motion.div>

      {/* CTA adicional */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
        className="text-center pt-8"
      >
        <div className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors cursor-pointer group">
          <span className="font-medium">Ver todas las propiedades</span>
          <svg
            className="w-4 h-4 transition-transform group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </motion.div>
    </div>
  );
}
