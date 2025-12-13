import HeroV2 from "@/components/marketing/HeroV2";
import { SearchForm } from "@/components/marketing/SearchForm";
import Link from "next/link";

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export default async function Home() {
  return (
    <main className="min-h-screen bg-bg text-text">
      <HeroV2 />

      {/* Formulario de búsqueda */}
      <section className="mx-auto max-w-6xl px-6 py-12 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl bg-soft/30 p-8 ring-1 ring-soft/50 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-text mb-6 text-center">
              Encuentra tu propiedad ideal
            </h2>
            <SearchForm />

            {/* Botón Ver Todas las Propiedades */}
            <div className="mt-6 text-center">
              <Link
                href="/buscar"
                className="inline-flex items-center gap-2 rounded-xl border border-soft/50 bg-bg/80 px-6 py-3 text-sm font-medium text-text backdrop-blur-sm transition-colors hover:bg-soft/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring sm:px-8 sm:py-4 sm:text-base"
              >
                Ver todas las propiedades
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
