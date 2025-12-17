import type { Metadata } from "next";
import { SearchResultsClient } from "./SearchResultsClient";
import { Suspense } from "react";
import { generateSearchMetadata } from "@/lib/seo/metadata";

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    comuna?: string;
    precioMin?: string;
    precioMax?: string;
    dormitorios?: string;
  }>;
}): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;

  return generateSearchMetadata({
    comuna: resolvedSearchParams?.comuna,
    dormitorios: resolvedSearchParams?.dormitorios,
    precioMin: resolvedSearchParams?.precioMin,
    precioMax: resolvedSearchParams?.precioMax,
    q: resolvedSearchParams?.q,
  });
}

export default async function SearchResultsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    comuna?: string;
    precioMin?: string;
    precioMax?: string;
    dormitorios?: string;
    sort?: string;
    page?: string;
  }>;
}) {
  // El componente cliente maneja los searchParams
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg text-text flex items-center justify-center">
        <div className="text-center">
          <div className="text-subtext">Cargando resultados...</div>
        </div>
      </div>
    }>
      <SearchResultsClient />
    </Suspense>
  );
}
