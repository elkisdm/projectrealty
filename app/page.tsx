import HeroV2 from "@/components/marketing/HeroV2";
import FeaturedGrid from "@/components/marketing/FeaturedGrid";
import HowItWorks from "@/components/marketing/HowItWorks";
import Trust from "@/components/marketing/Trust";
import StickyMobileCTA from "@/components/marketing/StickyMobileCTA";
import { COMING_SOON } from '@lib/flags';
import { redirect } from 'next/navigation';

export const revalidate = 3600;

export default function Home() {
  // TEMPORAL: Sin redirección para debug
  console.log('DEBUG: Home page loading without redirect');

  // Mostrar landing directamente sin redirección
  return (
    <>
      <main className="min-h-screen bg-bg text-text">
        <HeroV2 />
        <FeaturedGrid />
        <HowItWorks />
        <Trust />
      </main>
      <StickyMobileCTA />
    </>
  );
}
