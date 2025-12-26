import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { slugToComunaName, normalizeComunaSlug } from "@/lib/utils/slug";
import { generateComunaMetadata } from "@/lib/seo/metadata";

type ComunaPageProps = {
  params: Promise<{ comuna: string }>;
};

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // 1 hour

/**
 * Página de departamentos por comuna
 * Redirige a la búsqueda con filtro de comuna
 */
export default async function ComunaPage({ params }: ComunaPageProps) {
  const { comuna } = await params;
  const comunaName = slugToComunaName(comuna);

  // Redirigir a búsqueda con filtro de comuna
  redirect(`/buscar?comuna=${encodeURIComponent(comunaName)}`);
}

export async function generateMetadata({ params }: ComunaPageProps): Promise<Metadata> {
  const { comuna } = await params;
  const comunaName = slugToComunaName(comuna);

  return generateComunaMetadata({
    comuna: comunaName,
    comunaSlug: comuna,
  });
}




