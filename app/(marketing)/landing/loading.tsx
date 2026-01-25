import { BuildingCardSkeleton } from "@components/ui/BuildingCardSkeleton";

export default function Loading() {
  return (
    <main id="main-content" role="main">
      <div className="container mx-auto px-4 md:px-6 py-6">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">Arrienda con 0% de comisión</h1>
          <p className="text-[var(--subtext)]">Explora proyectos disponibles hoy</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, idx) => (
            <BuildingCardSkeleton key={`landing-skeleton-${idx}`} />
          ))}
        </div>
      </div>
    </main>
  );
}


