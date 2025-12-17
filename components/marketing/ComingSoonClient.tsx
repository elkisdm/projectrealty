'use client';

import dynamic from "next/dynamic";
import { BackgroundFX } from '@components/visual/BackgroundFX';

// Dynamic import con ssr: false solo funciona en Client Components
const ComingSoonHero = dynamic(
  () => import('@components/marketing/ComingSoonHero').then(m => m.ComingSoonHero), 
  { 
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="animate-pulse text-white text-xl">Cargando...</div>
      </div>
    )
  }
);

export function ComingSoonClient() {
  return (
    <div className="relative min-h-screen w-full">
      <BackgroundFX />
      <ComingSoonHero />
    </div>
  );
}
