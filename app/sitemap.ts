import { getAllBuildings } from "@lib/data";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000");
  
  let buildings: Awaited<ReturnType<typeof getAllBuildings>> = [];
  try {
    buildings = await getAllBuildings();
  } catch {
    // Si falla, retornar solo la página principal
  }

  return [
    { url: base.toString(), lastModified: new Date() },
    ...buildings.map((b) => ({ url: new URL(`/property/${b.slug}`, base).toString(), lastModified: new Date() })),
  ];
}


