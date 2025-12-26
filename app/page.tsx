import type { Metadata } from "next";
import HeroV2 from "@/components/marketing/HeroV2";
import { FeaturedUnitsSection } from "@/components/marketing/FeaturedUnitsSection";
import { BenefitsSection } from "@/components/marketing/BenefitsSection";
import { StickySearchWrapper } from "@/components/marketing/StickySearchWrapper";
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

  // Comunas fijas para el rotador (no dependen de la BD)
  const communes = ['Santiago', 'Ñuñoa', 'Las Condes', 'Providencia', 'La Florida', 'San Miguel', 'Macul'];

  return (
    <SearchFormProvider>
      <main className="min-h-screen bg-bg text-text">
        <HomePageTracker />
        {/* Sticky Search Bar - aparece cuando el hero completo ha pasado */}
        <StickySearchWrapper heroId="hero-section" />
        <HeroV2 communes={communes} availableCount={availableCount} minPrice={minPrice} />

        {/* Departamentos destacados */}
        <FeaturedUnitsSection />

        {/* Beneficios */}
        <BenefitsSection />
      </main>
    </SearchFormProvider>
  );
}
