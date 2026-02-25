import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { UnitDetailResponse } from "@/schemas/models";
import { normalizeComunaSlug } from "@/lib/utils/slug";
import { generateUnitMetadata, getBaseUrl } from "@/lib/seo/metadata";
import { generateUnitBreadcrumbs } from "@/lib/seo/breadcrumbs";
import { safeJsonLd } from "@/lib/seo/jsonld";
import { getSupabaseProcessor } from "@/lib/supabase-data-processor";
import { getBuildingBySlug } from "@/lib/data";
import { UnitDetailClient } from "./UnitDetailClient";

type UnitPageProps = {
  params: Promise<{ comuna: string; slug: string }>;
};

// Revalidar cada hora; 0 mientras se verifica que terminaciones/equipamiento lleguen desde Supabase
export const revalidate = 0;

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

    // Obtener el building completo por slug; si no hay match (ej. slug en DB distinto), intentar por id
    let fullBuilding = await getBuildingBySlug(result.building.slug);
    if (!fullBuilding && result.building.id) {
      fullBuilding = await getBuildingBySlug(result.building.id);
    }

    // Usar fullBuilding como base para tener terminaciones, equipamiento y units; preservar datos del processor si faltan
    const buildingWithAllUnits = fullBuilding
      ? {
          ...fullBuilding,
          // Asegurar terminaciones/equipamiento (por si fullBuilding los trae vacíos por caché)
          terminaciones: (fullBuilding.terminaciones?.length ? fullBuilding.terminaciones : (result.building as { terminaciones?: string[] }).terminaciones) ?? [],
          equipamiento: (fullBuilding.equipamiento?.length ? fullBuilding.equipamiento : (result.building as { equipamiento?: string[] }).equipamiento) ?? [],
          // Preservar campos que el processor puede tener más actualizados (ej. gallery, amenities del join)
          ...(result.building.amenities?.length && { amenities: result.building.amenities }),
          ...(result.building.gallery?.length && { gallery: result.building.gallery }),
          allUnits: fullBuilding.units || [],
        }
      : result.building;

    unitData = {
      unit: result.unit,
      building: buildingWithAllUnits,
      ...(result.similarUnits && result.similarUnits.length > 0 && { similarUnits: result.similarUnits }),
    };

    if (process.env.NODE_ENV === "development") {
      const t = (unitData.building as { terminaciones?: string[] }).terminaciones;
      const e = (unitData.building as { equipamiento?: string[] }).equipamiento;
      console.debug("[UnitPage] building.terminaciones:", t?.length ?? 0, "equipamiento:", e?.length ?? 0);
    }

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




