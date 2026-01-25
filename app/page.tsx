import type { Metadata } from "next";
import HeroSearchPanel from "@/components/search/HeroSearchPanel";
import { FeaturedUnitsSection } from "@/components/marketing/FeaturedUnitsSection";
import { BenefitsSection } from "@/components/marketing/BenefitsSection";
// StickySearchWrapper removed - hero is now clean with progressive disclosure
import { SearchFormProvider } from "@/components/marketing/SearchFormContext";
import { generateBaseMetadata } from "@/lib/seo/metadata";
import { HomePageTracker } from "./HomePageTracker";
import { getAllBuildings } from "@/lib/data";
import { getAvailableUnitsCount } from "@/lib/hooks/useFeaturedUnits";

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export const metadata: Metadata = generateBaseMetadata({
  title: "Elkis Realtor · 0% Comisión",
  description: "Arrienda departamentos con 0% de comisión. Compara, agenda visita y arrienda fácil.",
  path: "/",
});

export default async function Home() {
  // Obtener datos para Hero
  const [allBuildings, availableCount] = await Promise.all([
    getAllBuildings(),
    getAvailableUnitsCount(),
  ]);

  // Calcular precio mínimo de todas las unidades disponibles
  const allAvailableUnits = allBuildings.flatMap(building =>
    building.units.filter(unit => unit.disponible && unit.price > 0)
  );
  const minPrice = allAvailableUnits.length > 0
    ? Math.min(...allAvailableUnits.map(unit => unit.price))
    : undefined;

  return (
    <SearchFormProvider>
      <main className="min-h-screen bg-bg text-text">
        <HomePageTracker />
        {/* Hero Cocktail - combines Airbnb, Zillow, QuintoAndar patterns */}
        <HeroSearchPanel availableCount={availableCount} minPrice={minPrice} />

        {/* Departamentos destacados */}
        <FeaturedUnitsSection />

        {/* Beneficios */}
        <BenefitsSection />
      </main>
    </SearchFormProvider>
  );
}
