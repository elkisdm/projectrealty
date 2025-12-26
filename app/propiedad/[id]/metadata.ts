import type { Metadata } from "next";
import { getBaseUrl } from "@lib/site";

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const baseUrl = getBaseUrl();
  const title = "Propiedad en arriendo 0% comisión";
  const description = "Descubre detalles de esta propiedad y agenda tu visita sin pagar comisión.";
  const url = `${baseUrl}/propiedad/${id}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "Elkis Realtor",
      type: "website",
    },
  };
}


