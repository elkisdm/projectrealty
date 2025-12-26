import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { generateBaseMetadata } from "@/lib/seo/metadata";

export const dynamic = 'force-dynamic';

/**
 * Página de departamentos en arriendo
 * Redirige a la búsqueda
 */
export default function DepartamentosPage() {
  redirect("/buscar");
}

export const metadata: Metadata = generateBaseMetadata({
  title: "Departamentos en Arriendo - 0% Comisión",
  description: "Busca departamentos en arriendo sin comisión de corretaje. Filtra por comuna, precio y más.",
  path: "/arriendo/departamento",
});




