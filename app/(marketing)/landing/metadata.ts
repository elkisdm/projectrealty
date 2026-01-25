import type { Metadata } from "next";
import { getBaseUrl } from "@lib/site";

const baseUrl = getBaseUrl();

export const metadata: Metadata = {
  title: "Arrienda con 0% comisión",
  description:
    "Explora edificios disponibles, filtra por comuna y tipología, y agenda tu visita sin pagar comisión.",
  alternates: { canonical: `${baseUrl}/landing` },
  openGraph: {
    title: "Arrienda con 0% comisión",
    description:
      "Explora edificios disponibles, filtra por comuna y tipología, y agenda tu visita sin pagar comisión.",
    url: `${baseUrl}/landing`,
    siteName: "Elkis Realtor",
    type: "website",
  },
};


