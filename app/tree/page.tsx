import { Suspense } from "react";
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

function TreeLandingFallback() {
  return (
    <main className="min-h-screen bg-bg dark:bg-bg flex items-center justify-center">
      <div className="text-text-secondary">Cargando...</div>
    </main>
  );
}

export default function TreePage() {
  return (
    <Suspense fallback={<TreeLandingFallback />}>
      <TreeLanding />
    </Suspense>
  );
}
