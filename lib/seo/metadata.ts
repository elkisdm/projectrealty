import type { Metadata } from "next";
import { extractFloorNumber } from "@/lib/utils/unit";

/**
 * Utilidades para generar metadata SEO consistente
 */

const SITE_NAME = "Elkis Realtor";
const SITE_DESCRIPTION = "Arrienda departamentos con 0% de comisión. Compara, agenda visita y arrienda fácil.";
const DEFAULT_IMAGE = "/images/og-default.jpg";

/**
 * Obtiene la URL base del sitio
 */
export function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  if (process.env.SITE_URL) {
    return process.env.SITE_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

/**
 * Genera URL canónica
 */
export function generateCanonicalUrl(path: string): string {
  const baseUrl = getBaseUrl();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

/**
 * Genera metadata base reutilizable
 */
export function generateBaseMetadata({
  title,
  description,
  path,
  image,
  noindex = false,
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
  noindex?: boolean;
}): Metadata {
  const baseUrl = getBaseUrl();
  const canonicalUrl = generateCanonicalUrl(path);
  const ogImage = image
    ? (image.startsWith("http") ? image : `${baseUrl}${image}`)
    : `${baseUrl}${DEFAULT_IMAGE}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      type: "website",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    ...(noindex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  };
}

/**
 * Genera metadata para página de unidad
 */
export function generateUnitMetadata({
  tipologia,
  comuna,
  price,
  dormitorios,
  banos,
  slug,
  comunaSlug,
  image,
  codigoUnidad,
}: {
  tipologia: string;
  comuna: string;
  price: number;
  dormitorios: number;
  banos: number;
  slug: string;
  comunaSlug: string;
  image?: string;
  codigoUnidad?: string;
}): Metadata {
  const tipologiaLabel = tipologia === "Studio" || tipologia === "Estudio" ? "Estudio" : tipologia;
  
  // Extraer piso del código de unidad si está disponible
  const floorNumber = codigoUnidad ? extractFloorNumber(codigoUnidad) : null;
  
  // Construir título con formato: "Departamento de [tipologia] en [Comuna] - Piso [X]"
  let title: string;
  if (floorNumber !== null) {
    title = `Departamento de ${tipologiaLabel} en ${comuna} - Piso ${floorNumber} | 0% Comisión`;
  } else {
    title = `${tipologiaLabel} en Arriendo en ${comuna} | 0% Comisión`;
  }
  
  const description = `Arrienda ${tipologiaLabel} en ${comuna} sin comisión de corretaje. ${dormitorios} dormitorio${dormitorios > 1 ? "s" : ""}, ${banos} baño${banos > 1 ? "s" : ""}. Precio: $${price.toLocaleString("es-CL")}.`;

  return generateBaseMetadata({
    title,
    description,
    path: `/arriendo/departamento/${comunaSlug}/${slug}`,
    image,
  });
}

/**
 * Genera metadata para página de búsqueda
 */
export function generateSearchMetadata({
  comuna,
  dormitorios,
  precioMin,
  precioMax,
  q,
}: {
  comuna?: string;
  dormitorios?: string;
  precioMin?: string;
  precioMax?: string;
  q?: string;
}): Metadata {
  const baseUrl = getBaseUrl();
  const searchParams = new URLSearchParams();
  
  if (comuna) searchParams.set("comuna", comuna);
  if (dormitorios) searchParams.set("dormitorios", dormitorios);
  if (precioMin) searchParams.set("precioMin", precioMin);
  if (precioMax) searchParams.set("precioMax", precioMax);
  if (q) searchParams.set("q", q);

  const path = `/buscar${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
  
  // Construir título dinámico
  const titleParts: string[] = [];
  if (q) {
    titleParts.push(`"${q}"`);
  }
  if (comuna && comuna !== "Todas") {
    titleParts.push(`en ${comuna}`);
  }
  if (dormitorios) {
    const dormLabel =
      dormitorios === "Estudio"
        ? "Estudio"
        : `${dormitorios} dormitorio${dormitorios !== "1" ? "s" : ""}`;
    titleParts.push(dormLabel);
  }

  const title = titleParts.length > 0
    ? `Departamentos ${titleParts.join(" ")} - Arrienda Sin Comisión`
    : "Departamentos en arriendo - Arrienda Sin Comisión";

  // Construir descripción dinámica
  let description = "Busca departamentos en arriendo sin comisión. ";
  const descParts: string[] = [];
  if (comuna && comuna !== "Todas") {
    descParts.push(`en ${comuna}`);
  }
  if (dormitorios) {
    descParts.push(`con ${dormitorios} dormitorio${dormitorios !== "1" ? "s" : ""}`);
  }
  if (precioMin || precioMax) {
    const precioText = precioMin && precioMax
      ? `entre $${Number(precioMin).toLocaleString("es-CL")} y $${Number(precioMax).toLocaleString("es-CL")}`
      : precioMin
      ? `desde $${Number(precioMin).toLocaleString("es-CL")}`
      : `hasta $${Number(precioMax).toLocaleString("es-CL")}`;
    descParts.push(precioText);
  }

  if (descParts.length > 0) {
    description += descParts.join(", ") + ".";
  } else {
    description += "Filtra por comuna, precio, dormitorios y más.";
  }

  return generateBaseMetadata({
    title,
    description,
    path,
  });
}

/**
 * Genera metadata para página de comuna
 */
export function generateComunaMetadata({
  comuna,
  comunaSlug,
}: {
  comuna: string;
  comunaSlug: string;
}): Metadata {
  const title = `Departamentos en Arriendo en ${comuna} - 0% Comisión`;
  const description = `Encuentra departamentos en arriendo en ${comuna} sin comisión de corretaje. Miles de opciones disponibles.`;

  return generateBaseMetadata({
    title,
    description,
    path: `/arriendo/departamento/${comunaSlug}`,
  });
}


