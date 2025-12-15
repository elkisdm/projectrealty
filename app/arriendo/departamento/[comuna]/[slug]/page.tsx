import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { UnitDetailResponse } from "@/schemas/models";
import { normalizeComunaSlug } from "@/lib/utils/slug";
import { generateUnitMetadata, getBaseUrl } from "@/lib/seo/metadata";
import { generateUnitBreadcrumbs } from "@/lib/seo/breadcrumbs";
import { safeJsonLd } from "@/lib/seo/jsonld";
import { UnitDetailClient } from "./UnitDetailClient";

type UnitPageProps = {
  params: Promise<{ comuna: string; slug: string }>;
};

export const revalidate = 3600; // 1 hour

/**
 * Página de unidad específica en estructura SEO
 * Ruta: /arriendo/departamento/[comuna]/[slug]
 */
export default async function UnitPage({ params }: UnitPageProps) {
  const { comuna, slug } = await params;

  // Obtener unidad desde la API
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "http://localhost:3000";
  let unitData: UnitDetailResponse;

  try {
    const response = await fetch(`${baseUrl}/api/buildings/${slug}`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      if (response.status === 404) {
        notFound();
      }
      throw new Error(`API error: ${response.status}`);
    }

    unitData = await response.json();
  } catch (error) {
    console.error('Error fetching unit:', error);
    notFound();
  }

  // Verificar que la comuna coincida
  const normalizedComuna = normalizeComunaSlug(unitData.building.comuna);
  if (normalizedComuna !== comuna) {
    // Redirigir a la URL correcta si la comuna no coincide
    notFound();
  }

  // Generar JSON-LD para breadcrumbs
  const breadcrumbJsonLd = generateUnitBreadcrumbs({
    comuna: unitData.building.comuna,
    comunaSlug: comuna,
    buildingName: unitData.building.name,
    tipologia: unitData.unit.tipologia,
    unitSlug: slug,
  });

  return (
    <>
      <script type="application/ld+json">
        {safeJsonLd(breadcrumbJsonLd)}
      </script>
      <UnitDetailClient
        unit={unitData.unit}
        building={unitData.building}
        similarUnits={unitData.similarUnits}
      />
    </>
  );
}

export async function generateMetadata({ params }: UnitPageProps): Promise<Metadata> {
  const { comuna, slug } = await params;

  const baseUrl = getBaseUrl();
  let unitData: UnitDetailResponse | null = null;

  try {
    const response = await fetch(`${baseUrl}/api/buildings/${slug}`, {
      next: { revalidate: 3600 },
    });

    if (response.ok) {
      unitData = await response.json();
    }
  } catch (error) {
    // Si falla, usar metadata genérica
  }

  if (!unitData) {
    return {
      title: "Departamento no encontrado",
      description: "El departamento que buscas no está disponible.",
    };
  }

  const { unit, building } = unitData;
  // Prioridad: tipología > áreas comunes > galería edificio > portada edificio > imágenes unidad
  const primaryImage =
    unit.imagesTipologia?.[0] ||
    unit.imagesAreasComunes?.[0] ||
    building.gallery?.[0] ||
    building.coverImage ||
    unit.images?.[0];

  return generateUnitMetadata({
    tipologia: unit.tipologia,
    comuna: building.comuna,
    price: unit.price,
    dormitorios: unit.dormitorios,
    banos: unit.banos,
    slug,
    comunaSlug: comuna,
    image: primaryImage,
  });
}


