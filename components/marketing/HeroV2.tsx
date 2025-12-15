import MotionWrapper from "@/components/ui/MotionWrapper";
import { RotatingCommunes } from "./RotatingCommunes";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { HeroSearchForm } from "./HeroSearchForm";
import { HeroCarousel } from "./HeroCarousel";
import { getAllBuildings } from "@/lib/data";

interface HeroV2Props {
  communes?: string[];
  availableCount?: number;
  minPrice?: number;
}

// Helper para obtener imágenes de edificios destacados
function getHeroCarouselImages(buildings: Awaited<ReturnType<typeof getAllBuildings>>) {
  const images: Array<{ url: string; alt: string; buildingName?: string }> = [];

  // Obtener hasta 6 edificios con mejores imágenes
  const buildingsWithImages = buildings
    .filter((building) => {
      // Priorizar edificios con coverImage o gallery
      return building.coverImage || (building.gallery && building.gallery.length > 0);
    })
    .slice(0, 6);

  for (const building of buildingsWithImages) {
    // Prioridad: coverImage > gallery[0]
    const imageUrl = building.coverImage || building.gallery?.[0];
    if (imageUrl) {
      images.push({
        url: imageUrl,
        alt: `Edificio ${building.name} - ${building.comuna}`,
        buildingName: building.name,
      });
    }
  }

  // Si no hay suficientes imágenes de edificios, agregar imágenes locales como fallback
  if (images.length < 3) {
    const fallbackImages = [
      { url: "/images/lascondes-hero.jpg", alt: "Departamentos en Las Condes" },
      { url: "/images/nunoa-hero.jpg", alt: "Departamentos en Ñuñoa" },
      { url: "/images/mirador-hero.jpg", alt: "Departamentos destacados" },
    ];

    for (const fallback of fallbackImages) {
      if (images.length >= 6) break;
      // Solo agregar si no está ya en la lista
      if (!images.some((img) => img.url === fallback.url)) {
        images.push(fallback);
      }
    }
  }

  return images;
}

export default async function HeroV2({ communes = [], availableCount = 0, minPrice }: HeroV2Props) {
  // Obtener edificios para el carrusel
  const buildings = await getAllBuildings();
  const carouselImages = getHeroCarouselImages(buildings);

  return (
    <>
      <section id="hero-section" className="relative isolate overflow-hidden px-4 py-8 sm:py-24 lg:px-6 lg:py-32">
        {/* Background gradient */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        >
          <div
            style={{
              clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-secondary opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          />
        </div>

        <div className="mx-auto max-w-6xl text-center">
          {/* Badge destacado */}
          <MotionWrapper direction="down" delay={0.1}>
            <div className="mb-4 flex justify-center sm:mb-8">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 blur-lg" />
                <p className="relative inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 px-3 py-1.5 text-xs font-semibold text-primary ring-1 ring-inset ring-primary/20 backdrop-blur-sm sm:gap-2 sm:px-4 sm:py-2 sm:text-sm">
                  <span className="flex h-1.5 w-1.5 items-center justify-center sm:h-2 sm:w-2">
                    <span className="absolute h-1.5 w-1.5 animate-ping rounded-full bg-primary opacity-75 sm:h-2 sm:w-2" />
                    <span className="relative h-1 w-1 rounded-full bg-primary sm:h-1.5 sm:w-1.5" />
                  </span>
                  La forma más fácil de encontrar arriendo
                </p>
              </div>
            </div>
          </MotionWrapper>

          {/* Título principal */}
          <MotionWrapper direction="up" delay={0.2}>
            <h1 className="text-3xl font-bold tracking-tight text-text sm:text-6xl lg:text-7xl">
              Arrienda departamentos en{" "}
              <RotatingCommunes communes={communes} interval={1500} />
            </h1>
          </MotionWrapper>

          {/* Carrusel de imágenes destacadas */}
          {carouselImages.length > 0 && (
            <MotionWrapper direction="up" delay={0.25}>
              <div className="mt-6 sm:mt-8 lg:mt-12">
                <HeroCarousel
                  images={carouselImages}
                  autoplayInterval={5000}
                  className="mx-auto max-w-5xl"
                />
              </div>
            </MotionWrapper>
          )}

          {/* Buscador integrado */}
          <MotionWrapper direction="up" delay={0.3}>
            <div className="mt-4 sm:mt-12">
              <HeroSearchForm variant="compact" />

              {/* Link secundario */}
              <div className="mt-3 flex justify-center sm:mt-4">
                <Link
                  href="/buscar"
                  className="inline-flex items-center gap-2 rounded-2xl border border-soft/50 bg-bg/80 px-5 py-2.5 text-xs font-medium text-text backdrop-blur-sm transition-colors hover:bg-soft/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring sm:px-8 sm:py-4 sm:text-base"
                >
                  Ver todos los departamentos
                  <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </MotionWrapper>

          {/* Subtítulo */}
          <MotionWrapper direction="up" delay={0.4}>
            <div className="mt-3 sm:mt-6">
              <p className="mx-auto max-w-4xl text-base font-semibold leading-tight text-text sm:text-xl sm:font-medium lg:text-2xl lg:leading-9">
                Agenda visitas, compara precios y arrienda 100% online.
              </p>
            </div>
          </MotionWrapper>

          {/* Indicadores de valor */}
          <MotionWrapper direction="up" delay={0.6}>
            <div className={`mt-6 grid gap-2 sm:mt-20 sm:gap-10 ${minPrice ? 'grid-cols-3' : 'grid-cols-2'}`}>
              {minPrice && (
                <div className="flex h-12 w-full flex-col items-center justify-center gap-0.5 rounded-lg bg-gradient-to-br from-orange-50 to-amber-50 p-2 ring-1 ring-orange-200/50 dark:from-orange-950/20 dark:to-amber-950/20 dark:ring-orange-800/50 sm:h-20 sm:gap-1 sm:rounded-2xl sm:p-4">
                  <p className="text-[9px] font-medium leading-tight text-orange-700/80 dark:text-orange-300/80 sm:text-xs sm:leading-normal">Arriendos desde</p>
                  <div className="flex items-center justify-center gap-1 sm:gap-2">
                    <svg className="h-3 w-3 flex-shrink-0 text-orange-600 dark:text-orange-400 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-[9px] font-bold leading-none tabular-nums text-orange-600 dark:text-orange-400 sm:text-lg sm:leading-tight">
                      {formatPrice(minPrice).replace(/\s/g, '')}
                    </div>
                  </div>
                </div>
              )}
              <div className="flex h-12 w-full flex-col items-center justify-center gap-0.5 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 p-2 ring-1 ring-blue-200/50 dark:from-blue-950/20 dark:to-indigo-950/20 dark:ring-blue-800/50 sm:h-20 sm:gap-1 sm:rounded-2xl sm:p-4">
                <div className="text-[11px] font-bold text-blue-600 dark:text-blue-400 sm:text-2xl">100%</div>
                <p className="text-[9px] font-medium leading-tight text-blue-700/80 dark:text-blue-300/80 sm:text-xs sm:leading-normal">Digital</p>
              </div>
              <div className="flex h-12 w-full flex-col items-center justify-center gap-0.5 rounded-lg bg-gradient-to-br from-purple-50 to-violet-50 p-2 ring-1 ring-purple-200/50 dark:from-purple-950/20 dark:to-violet-950/20 dark:ring-purple-800/50 sm:h-20 sm:gap-1 sm:rounded-2xl sm:p-4">
                <div className="text-[11px] font-bold tabular-nums text-purple-600 dark:text-purple-400 sm:text-2xl">
                  +{availableCount}
                </div>
                <p className="text-[9px] font-medium leading-tight text-purple-700/80 dark:text-purple-300/80 sm:text-xs sm:leading-normal">Propiedades disponibles</p>
              </div>
            </div>
          </MotionWrapper>
        </div>

        {/* Background gradient inferior */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
        >
          <div
            style={{
              clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
            className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-secondary to-primary opacity-10 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
          />
        </div>
      </section>
    </>
  );
}


