import { Metadata } from "next";
import { LinksPage } from "@/components/links/LinksPage";

export const metadata: Metadata = {
  title: "Links | Inversión Inmobiliaria",
  description: "Conecta conmigo y descubre oportunidades de inversión inmobiliaria. Formulario instantáneo para solicitar información.",
  openGraph: {
    title: "Links | Inversión Inmobiliaria",
    description: "Conecta conmigo y descubre oportunidades de inversión inmobiliaria. Formulario instantáneo para solicitar información.",
    type: "website",
    locale: "es_CL",
  },
  twitter: {
    card: "summary_large_image",
    title: "Links | Inversión Inmobiliaria",
    description: "Conecta conmigo y descubre oportunidades de inversión inmobiliaria.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function LinksPageRoute() {
  return <LinksPage />;
}
