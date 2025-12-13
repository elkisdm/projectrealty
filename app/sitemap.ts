import { getAllBuildings } from "@lib/data";
import type { MetadataRoute } from "next";
import { readFileSync } from "fs";
import { join } from "path";

function readFeatureFlag(flagName: string): boolean {
  try {
    const flagsPath = join(process.cwd(), 'config', 'feature-flags.json');
    const flagsContent = readFileSync(flagsPath, 'utf8');
    const flags = JSON.parse(flagsContent);
    return Boolean(flags[flagName]);
  } catch {
    return false;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000");
  const mvpMode = readFeatureFlag('mvpMode');
  
  // En modo MVP, solo incluir rutas MVP
  const mvpRoutes: MetadataRoute.Sitemap = [
    { url: base.toString(), lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: new URL('/buscar', base).toString(), lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
  ];
  
  // Agregar propiedades solo si estamos en modo MVP o si no hay modo MVP activo
  let buildings: Awaited<ReturnType<typeof getAllBuildings>> = [];
  try {
    buildings = await getAllBuildings({});
  } catch {
    // Si falla, retornar solo las rutas base
  }

  const propertyRoutes = buildings.map((b) => ({
    url: new URL(`/property/${b.slug}`, base).toString(),
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  if (mvpMode) {
    // Solo incluir rutas MVP
    return [...mvpRoutes, ...propertyRoutes];
  }

  // Si no está en modo MVP, incluir todas las rutas (comportamiento anterior)
  return [
    ...mvpRoutes,
    ...propertyRoutes,
  ];
}


