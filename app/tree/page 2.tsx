import { Metadata } from "next";
import { TreeLanding } from "@/components/tree/TreeLanding";

export const metadata: Metadata = {
  title: "Elkis Realtor | Link-in-bio",
  description: "Encuentra tu próximo hogar sin comisión. Arrienda o compra con Elkis Realtor.",
  openGraph: {
    title: "Elkis Realtor | Link-in-bio",
    description: "Encuentra tu próximo hogar sin comisión. Arrienda o compra con Elkis Realtor.",
    type: "website",
    locale: "es_CL",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function TreePage() {
  return <TreeLanding />;
}
