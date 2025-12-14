import type { Metadata } from "next";
import HeroV2 from "@/components/marketing/HeroV2";
import { SearchSection } from "@/components/marketing/SearchSection";
import { FeaturedUnitsSection } from "@/components/marketing/FeaturedUnitsSection";
import { BenefitsSection } from "@/components/marketing/BenefitsSection";
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

  // Comunas fijas para el rotador (no dependen de la BD)
  const communes = ['Santiago', 'Ñuñoa', 'Las Condes', 'Providencia', 'La Florida', 'San Miguel', 'Macul'];

  return (
    <main className="min-h-screen bg-bg text-text">
      <HomePageTracker />
      <HeroV2 communes={communes} availableCount={availableCount} />

      {/* Sección de búsqueda */}
      <SearchSection />

      {/* Departamentos destacados */}
      <FeaturedUnitsSection />

      {/* Beneficios */}
      <BenefitsSection />
    </main>
  );
}
