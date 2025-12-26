import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { getBuildingBySlug, getRelatedBuildings } from "@lib/data";
import { PropertyClient } from "./PropertyClientV3";
import { safeJsonLd } from "@lib/seo/jsonld";
import { PROPERTY_PAGE_CONSTANTS } from "@lib/constants/property";
import { normalizeComunaSlug } from "@/lib/utils/slug";

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

  // Intentar obtener unidad primero (nueva estructura)
  // Si el slug es de una unidad, redirigir a la nueva URL
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "http://localhost:3000";
  let redirectUrl: string | null = null;

  try {
    const unitResponse = await fetch(`${baseUrl}/api/buildings/${slug}`, {
      next: { revalidate: 3600 },
    });

    if (unitResponse.ok) {
      const unitData = await unitResponse.json();
      if (unitData.unit && unitData.building) {
        // Es una unidad, preparar redirect a la nueva estructura
        const comunaSlug = normalizeComunaSlug(unitData.building.comuna);
        redirectUrl = `/arriendo/departamento/${comunaSlug}/${slug}`;
      }
    }
  } catch (error) {
    // Si falla fetch, continuar con el comportamiento de edificio
    console.error('Error checking unit:', error);
  }

  // Ejecutar redirect fuera del try-catch para que no sea capturado
  if (redirectUrl) {
    redirect(redirectUrl);
  }

  // Si no es una unidad, buscar como edificio (compatibilidad backward)
  const building = await getBuildingBySlug(slug);

  if (!building) {
    notFound();
  }

  const relatedBuildings = await getRelatedBuildings(slug, PROPERTY_PAGE_CONSTANTS.RELATED_BUILDINGS_LIMIT);

  // Build JSON-LD (Schema.org) for this property
  const canonicalUrl = `${baseUrl}/property/${slug}`;
  const primaryImage =
    building.media?.images?.[0] ||
    building.coverImage ||
    building.gallery?.[0] ||
    PROPERTY_PAGE_CONSTANTS.DEFAULT_IMAGE;
  const toAbsoluteUrl = (url: string) => (url.startsWith("http") ? url : `${baseUrl}${url}`);

  // Get first unit for breadcrumb (or use unit from searchParams if available)
  const unitId = resolvedSearchParams?.unit;
  const selectedUnit = unitId
    ? building.units.find(u => u.id === unitId)
    : building.units[0];

  // Build breadcrumb items for JSON-LD (matching PropertyBreadcrumb structure)
  const breadcrumbItems = [
    { name: "Home", item: `${baseUrl}/` },
    { name: "Arriendo Departamentos", item: `${baseUrl}/buscar` },
  ];

  // Add región if available
  if (building.region) {
    breadcrumbItems.push({
      name: building.region,
      item: `${baseUrl}/buscar?region=${encodeURIComponent(building.region)}`
    });
  }

  // Add comuna
  breadcrumbItems.push({
    name: building.comuna || "Santiago",
    item: `${baseUrl}/buscar?comuna=${encodeURIComponent(building.comuna || "Santiago")}`
  });

  // Add dirección if available
  if (building.address) {
    breadcrumbItems.push({
      name: building.address,
      item: `${baseUrl}/buscar?direccion=${encodeURIComponent(building.address)}`
    });
  }

  // Add edificio
  breadcrumbItems.push({
    name: building.name,
    item: canonicalUrl
  });

  // Add tipología if unit is available
  if (selectedUnit?.tipologia) {
    const tipologiaLabel = selectedUnit.tipologia === "Studio" || selectedUnit.tipologia === "Estudio"
      ? "Estudio"
      : selectedUnit.tipologia;
    breadcrumbItems.push({ name: tipologiaLabel, item: canonicalUrl });
    
    // Optionally add código de unidad if available
    if (selectedUnit.codigoUnidad) {
      breadcrumbItems.push({
        name: selectedUnit.codigoUnidad,
        item: canonicalUrl
      });
    }
  } else {
    breadcrumbItems.push({ name: "Departamento", item: canonicalUrl });
  }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.item,
    })),
  };

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

  // Loading skeleton para Suspense fallback
  const PropertySkeleton = () => (
    <div className="min-h-screen bg-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-8 bg-white/10 rounded-xl animate-pulse"></div>
            <div className="h-64 bg-white/10 rounded-2xl animate-pulse"></div>
            <div className="space-y-4">
              <div className="h-6 bg-white/10 rounded animate-pulse"></div>
              <div className="h-6 bg-white/10 rounded animate-pulse w-3/4"></div>
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="bg-white/5 rounded-2xl p-6 space-y-4">
              <div className="h-8 bg-white/10 rounded animate-pulse"></div>
              <div className="h-12 bg-white/10 rounded-xl animate-pulse"></div>
              <div className="h-12 bg-white/10 rounded-xl animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <script type="application/ld+json">
        {safeJsonLd(jsonLd)}
      </script>
      <script type="application/ld+json">
        {safeJsonLd(breadcrumbJsonLd)}
      </script>
      <Suspense fallback={<PropertySkeleton />}>
        <PropertyClient
          building={building}
          relatedBuildings={relatedBuildings}
          defaultUnitId={resolvedSearchParams?.unit}
          tipologiaFilter={resolvedSearchParams?.tipologia}
          showAllUnits={resolvedSearchParams?.ver === "unidades"}
        />
      </Suspense>
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
      title: `${building.name} - 0% Comisión`.replace(/\s+/g, " "),
      description: `Arrienda ${building.name} en ${building.comuna} sin comisión de corretaje.`,
      type: "website",
      images: [building.coverImage ?? building.gallery?.[0] ?? PROPERTY_PAGE_CONSTANTS.DEFAULT_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: `${building.name} - 0% Comisión`.replace(/\s+/g, " "),
      images: [building.coverImage ?? building.gallery?.[0] ?? PROPERTY_PAGE_CONSTANTS.DEFAULT_IMAGE],
    },
  };
}
