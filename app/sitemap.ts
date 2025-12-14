import { getSupabaseProcessor } from "@lib/supabase-data-processor";
import { normalizeComunaSlug } from "@lib/utils/slug";
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
  const base = new URL(
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000"
  );
  const mvpMode = readFeatureFlag('mvpMode');
  
  // Rutas principales (prioridad 1.0, daily)
  const mainRoutes: MetadataRoute.Sitemap = [
    { 
      url: base.toString(), 
      lastModified: new Date(), 
      changeFrequency: 'daily', 
      priority: 1.0 
    },
    { 
      url: new URL('/buscar', base).toString(), 
      lastModified: new Date(), 
      changeFrequency: 'daily', 
      priority: 1.0 
    },
    { 
      url: new URL('/arriendo', base).toString(), 
      lastModified: new Date(), 
      changeFrequency: 'daily', 
      priority: 1.0 
    },
    { 
      url: new URL('/arriendo/departamento', base).toString(), 
      lastModified: new Date(), 
      changeFrequency: 'daily', 
      priority: 1.0 
    },
  ];

  // Obtener unidades y comunas dinámicamente
  let unitRoutes: MetadataRoute.Sitemap = [];
  let comunaRoutes: MetadataRoute.Sitemap = [];
  const comunasSet = new Set<string>();

  try {
    const processor = await getSupabaseProcessor();
    
    // Obtener todas las unidades disponibles (sin paginación para sitemap)
    // Usamos un límite alto para obtener todas las unidades
    const result = await processor.getUnits({}, 1, 10000);
    
    // Generar rutas de unidades y recopilar comunas únicas
    unitRoutes = result.units
      .filter(unit => unit.disponible && unit.building)
      .map((unit) => {
        const comuna = unit.building!.comuna;
        const comunaSlug = normalizeComunaSlug(comuna);
        comunasSet.add(comuna);
        
        return {
          url: new URL(`/arriendo/departamento/${comunaSlug}/${unit.slug}`, base).toString(),
          lastModified: new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.7, // Fichas: 0.7 según especificación
        };
      });

    // Generar rutas de comunas (prioridad 0.9 según especificación)
    comunaRoutes = Array.from(comunasSet).map((comuna) => {
      const comunaSlug = normalizeComunaSlug(comuna);
      return {
        url: new URL(`/arriendo/departamento/${comunaSlug}`, base).toString(),
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.9, // Comunas: 0.9 según especificación
      };
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Si falla, retornar solo las rutas principales
  }

  if (mvpMode) {
    // En modo MVP, incluir todas las rutas SEO
    return [
      ...mainRoutes,
      ...comunaRoutes,
      ...unitRoutes,
    ];
  }

  // Si no está en modo MVP, incluir todas las rutas
  return [
    ...mainRoutes,
    ...comunaRoutes,
    ...unitRoutes,
  ];
}


