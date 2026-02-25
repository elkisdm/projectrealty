import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Departamentos destacados | Elkis Realtor",
  description: "Departamentos listos para ti: pet friendly, garantía en cuotas y proceso 100% digital.",
  keywords: [
    "arriendo Santiago",
    "departamentos pet friendly",
    "garantía en cuotas",
    "vivir en Santiago",
    "arriendo sin aval",
    "departamentos disponibles",
    "hogar en Santiago",
    "arriendo digital"
  ],
  openGraph: {
    title: "Departamentos destacados | Elkis Realtor",
    description: "Departamentos listos para ti: pet friendly, garantía en cuotas y proceso 100% digital.",
    type: "website",
    locale: "es_CL",
    siteName: "Elkis Realtor",
    images: [
      {
        url: "/images/og-arriendo-sin-comision.jpg",
        width: 1200,
        height: 630,
        alt: "Departamentos destacados - Elkis Realtor"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Departamentos destacados | Elkis Realtor",
    description: "Departamentos listos para ti: pet friendly, garantía en cuotas y proceso 100% digital.",
    images: ["/images/og-arriendo-sin-comision.jpg"]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/arrienda-sin-comision",
  },
};

