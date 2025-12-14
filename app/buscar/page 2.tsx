import { Metadata } from "next";
import { SearchResultsClient } from "./SearchResultsClient";
import { Suspense } from "react";

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; comuna?: string }>;
}): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const q = resolvedSearchParams?.q || "";
  const comuna = resolvedSearchParams?.comuna || "";

  const title = q
    ? `Resultados para "${q}"${comuna ? ` en ${comuna}` : ""} - Arrienda Sin Comisión`
    : "Resultados de búsqueda - Arrienda Sin Comisión";

  const description = q
    ? `Encuentra propiedades en arriendo sin comisión${comuna ? ` en ${comuna}` : ""}. ${q ? `Resultados para: ${q}` : ""}`
    : "Busca propiedades en arriendo sin comisión. Filtra por ubicación, precio y características.";

  return {
    title,
    description,
    alternates: {
      canonical: "/buscar",
    },
    openGraph: {
      title,
      description,
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
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
    banos?: string;
    sort?: string;
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
