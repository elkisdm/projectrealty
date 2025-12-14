import { getBaseUrl } from "./metadata";

/**
 * Genera JSON-LD para breadcrumbs según Schema.org
 */
export function generateBreadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  const baseUrl = getBaseUrl();

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${baseUrl}${item.url}`,
    })),
  };
}

/**
 * Genera breadcrumbs para página de unidad
 */
export function generateUnitBreadcrumbs({
  comuna,
  comunaSlug,
  buildingName,
  tipologia,
  unitSlug,
}: {
  comuna: string;
  comunaSlug: string;
  buildingName: string;
  tipologia: string;
  unitSlug: string;
}) {
  const baseUrl = getBaseUrl();
  const tipologiaLabel = tipologia === "Studio" || tipologia === "Estudio" ? "Estudio" : tipologia;

  return generateBreadcrumbJsonLd([
    { name: "Home", url: `${baseUrl}/` },
    { name: "Arriendo Departamentos", url: `${baseUrl}/buscar` },
    { name: comuna, url: `${baseUrl}/buscar?comuna=${encodeURIComponent(comuna)}` },
    { name: buildingName, url: `${baseUrl}/arriendo/departamento/${comunaSlug}/${unitSlug}` },
    { name: tipologiaLabel, url: `${baseUrl}/arriendo/departamento/${comunaSlug}/${unitSlug}` },
  ]);
}


