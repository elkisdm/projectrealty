import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { generateBaseMetadata } from "@/lib/seo/metadata";

export const dynamic = 'force-dynamic';

/**
 * Página principal de arriendo
 * Redirige a la búsqueda de departamentos
 */
export default function ArriendoPage() {
  redirect("/buscar");
}

export const metadata: Metadata = generateBaseMetadata({
  title: "Departamentos en Arriendo - 0% Comisión",
  description: "Encuentra departamentos en arriendo sin comisión de corretaje. Miles de opciones disponibles.",
  path: "/arriendo",
});




