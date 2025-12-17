import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { UnitDetailResponse } from "@/schemas/models";
import { normalizeComunaSlug } from "@/lib/utils/slug";
import { generateUnitMetadata, getBaseUrl } from "@/lib/seo/metadata";
import { generateUnitBreadcrumbs } from "@/lib/seo/breadcrumbs";
import { safeJsonLd } from "@/lib/seo/jsonld";
import { getSupabaseProcessor } from "@/lib/supabase-data-processor";
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

  // Obtener unidad directamente usando el processor (más eficiente que fetch interno)
  let unitData: UnitDetailResponse;

  try {
    const processor = await getSupabaseProcessor();
    const result = await processor.getUnitBySlug(slug);

    if (!result) {
      notFound();
    }

    // Mapear al formato esperado por UnitDetailResponse
    unitData = {
      unit: result.unit,
      building: result.building,
      ...(result.similarUnits && result.similarUnits.length > 0 && { similarUnits: result.similarUnits }),
    };

    // Verificar que la comuna coincida
    const normalizedComuna = normalizeComunaSlug(unitData.building.comuna);
    if (normalizedComuna !== comuna) {
      // La comuna no coincide, redirigir o mostrar 404
      notFound();
    }
  } catch (error) {
    console.error('[UnitPage] Error fetching unit:', error);
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

  let unitData: UnitDetailResponse | null = null;

  try {
    const processor = await getSupabaseProcessor();
    const result = await processor.getUnitBySlug(slug);

    if (result) {
      unitData = {
        unit: result.unit,
        building: result.building,
        ...(result.similarUnits && result.similarUnits.length > 0 && { similarUnits: result.similarUnits }),
      };
    }
  } catch (error) {
    // Si falla, usar metadata genérica
    console.error('Error fetching unit metadata:', error);
  }

  if (!unitData) {
    return {
      title: "Departamento no encontrado",
      description: "El departamento que buscas no está disponible.",
    };
  }

  const { unit, building } = unitData;
  const primaryImage = unit.images?.[0] || building.gallery?.[0];

  return generateUnitMetadata({
    tipologia: unit.tipologia,
    comuna: building.comuna,
    price: unit.price,
    dormitorios: unit.dormitorios,
    banos: unit.banos,
    slug,
    comunaSlug: comuna,
    image: primaryImage,
    codigoUnidad: unit.codigoUnidad,
  });
}


