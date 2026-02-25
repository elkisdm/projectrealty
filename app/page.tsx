import type { Metadata } from "next";
import { Suspense } from "react";
import HeroSearchPanel from "@/components/search/HeroSearchPanel";
import { FeaturedUnitsSection } from "@/components/marketing/FeaturedUnitsSection";
import { BenefitsSection } from "@/components/marketing/BenefitsSection";
import { SearchFormProvider } from "@/components/marketing/SearchFormContext";
import { generateBaseMetadata } from "@/lib/seo/metadata";
import { HomePageTracker } from "./HomePageTracker";
import { getAllBuildings } from "@/lib/data";
import { getAvailableUnitsCount } from "@/lib/hooks/useFeaturedUnits";

// ISR: página cacheada 1h; carga inicial más rápida tras el primer build
export const revalidate = 3600;

const DATA_FETCH_TIMEOUT_MS = 3_000;

/** Timeout para que la home no quede colgada si Supabase/red tarda */
function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

export const metadata: Metadata = generateBaseMetadata({
  title: "Elkis Realtor · Arriendos en Santiago",
  description: "Arrienda departamentos en Santiago. Compara precios, agenda visitas y encuentra tu hogar de forma fácil y transparente.",
  path: "/",
});

/** Skeleton del hero para Suspense; evita timeout del dev server en primera carga */
function HomeHeroFallback() {
  return (
    <div
      className="min-h-[280px] flex items-center justify-center bg-bg text-text"
      aria-busy="true"
      aria-live="polite"
    >
      <p className="text-muted-foreground">Cargando búsqueda…</p>
    </div>
  );
}

/** Bloque async: datos de hero + featured + benefits. En Suspense para no bloquear la respuesta inicial. */
async function HomeContent() {
  const dataPromise = Promise.all([
    getAllBuildings(),
    getAvailableUnitsCount(),
  ]);
  const fallback: [Awaited<ReturnType<typeof getAllBuildings>>, number] = [[], 0];
  const [allBuildings, availableCount] = await withTimeout(
    dataPromise,
    DATA_FETCH_TIMEOUT_MS,
    fallback
  );

  const allAvailableUnits = allBuildings.flatMap((building) =>
    building.units.filter((unit) => unit.disponible && unit.price > 0)
  );
  const minPrice =
    allAvailableUnits.length > 0
      ? Math.min(...allAvailableUnits.map((unit) => unit.price))
      : undefined;

  return (
    <>
      <HeroSearchPanel availableCount={availableCount} minPrice={minPrice} />
      <FeaturedUnitsSection />
      <BenefitsSection />
    </>
  );
}

export default function Home() {
  return (
    <SearchFormProvider>
      <main className="min-h-screen bg-bg text-text">
        <HomePageTracker />
        <Suspense fallback={<HomeHeroFallback />}>
          <HomeContent />
        </Suspense>
      </main>
    </SearchFormProvider>
  );
}
