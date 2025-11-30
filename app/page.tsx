import HeroV2 from "@/components/marketing/HeroV2";
import { FeaturedGridWithFilters } from "@/components/marketing/FeaturedGridWithFilters";
import HowItWorks from "@/components/marketing/HowItWorks";
import Trust from "@/components/marketing/Trust";
import StickyMobileCTA from "@/components/marketing/StickyMobileCTA";
import { getAllBuildings } from "@lib/data";

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export default async function Home() {
  // Obtener todos los edificios para los filtros
  const allBuildings = await getAllBuildings({});

  return (
    <>
      <main className="min-h-screen bg-bg text-text">
        <HeroV2 />
        <FeaturedGridWithFilters initialBuildings={allBuildings} />
        <HowItWorks />
        <Trust />
      </main>
      <StickyMobileCTA />
    </>
  );
}
