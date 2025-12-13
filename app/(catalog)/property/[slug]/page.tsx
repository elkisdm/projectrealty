import { notFound } from "next/navigation";
import { getBuildingBySlug, getRelatedBuildings } from "@lib/data";
import { PropertyClient } from "./PropertyClient";
import { safeJsonLd } from "@lib/seo/jsonld";
import { PROPERTY_PAGE_CONSTANTS } from "@lib/constants/property";

type PropertyPageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 3600; // 1 hour

export default async function PropertyPage({ params, searchParams }: PropertyPageProps & { searchParams?: Promise<{ fail?: string; unit?: string; tipologia?: string; ver?: string }> }) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  // Simulate a failure to verify error.tsx boundary
  if (resolvedSearchParams?.fail === "1") {
    throw new Error("Falló carga de propiedad (simulada)");
  }
  const building = await getBuildingBySlug(slug);

  if (!building) {
    notFound();
  }

  const relatedBuildings = await getRelatedBuildings(slug, PROPERTY_PAGE_CONSTANTS.RELATED_BUILDINGS_LIMIT);

  // Build JSON-LD (Schema.org) for this property
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "http://localhost:3000";
  const canonicalUrl = `${baseUrl}/property/${slug}`;
  const primaryImage =
    building.media?.images?.[0] ||
    building.coverImage ||
    building.gallery?.[0] ||
    PROPERTY_PAGE_CONSTANTS.DEFAULT_IMAGE;
  const toAbsoluteUrl = (url: string) => (url.startsWith("http") ? url : `${baseUrl}${url}`);

  const jsonLd = {
    "@context": PROPERTY_PAGE_CONSTANTS.JSON_LD_CONTEXT,
    "@type": PROPERTY_PAGE_CONSTANTS.JSON_LD_TYPE,
    name: building.name,
    address: {
      "@type": "PostalAddress",
      addressLocality: building.comuna,
    },
    image: toAbsoluteUrl(primaryImage),
    url: canonicalUrl,
    offers: building.units.map((unit) => ({
      "@type": "Offer",
      price: unit.price,
      priceCurrency: PROPERTY_PAGE_CONSTANTS.PRICE_CURRENCY,
      ...(unit.disponible ? { availability: PROPERTY_PAGE_CONSTANTS.AVAILABILITY_IN_STOCK } : {}),
    })),
  } as const;

  return (
    <>
      <script type="application/ld+json">
        {safeJsonLd(jsonLd)}
      </script>
      <PropertyClient
        building={building}
        relatedBuildings={relatedBuildings}
        defaultUnitId={resolvedSearchParams?.unit}
        tipologiaFilter={resolvedSearchParams?.tipologia}
        showAllUnits={resolvedSearchParams?.ver === "unidades"}
      />
    </>
  );
}

export async function generateMetadata({ params }: PropertyPageProps) {
  const { slug } = await params;
  const building = await getBuildingBySlug(slug);

  if (!building) {
    return {
      title: "Propiedad no encontrada",
    };
  }

  return {
    title: `${building.name} - 0% Comisión | Elkis Realtor`,
    description: `Arrienda ${building.name} en ${building.comuna} sin comisión de corretaje. ${building.amenities.join(", ")}.`,
    alternates: { canonical: `/property/${slug}` },
    openGraph: {
      title: `${building.name} - 0% Comisión`.
        replace(/\s+/g, " "),
      description: `Arrienda ${building.name} en ${building.comuna} sin comisión de corretaje.`,
      type: "website",
      images: [building.coverImage ?? building.gallery?.[0] ?? PROPERTY_PAGE_CONSTANTS.DEFAULT_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: `${building.name} - 0% Comisión`.
        replace(/\s+/g, " "),
      images: [building.coverImage ?? building.gallery?.[0] ?? PROPERTY_PAGE_CONSTANTS.DEFAULT_IMAGE],
    },
  };
}
