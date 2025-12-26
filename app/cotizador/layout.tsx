import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cotizador de Arriendos | Elkis Realtor",
  description: "Genera cotizaciones detalladas y personalizadas para cualquier unidad disponible. Sistema automatizado con cálculos precisos de arriendos, garantías y promociones.",
  keywords: ["cotizador", "arriendo", "cotización", "calculadora", "precio", "garantía", "comisión"],
};

export default function CotizadorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
