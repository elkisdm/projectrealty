import type { MetadataRoute } from 'next';
import { readFileSync } from 'fs';
import { join } from 'path';

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

export default function robots(): MetadataRoute.Robots {
  const comingSoon = readFeatureFlag('comingSoon');
  const mvpMode = readFeatureFlag('mvpMode');
  
  if (comingSoon) {
    return { 
      rules: { 
        userAgent: '*', 
        disallow: '/' 
      } 
    };
  }
  
  // En modo MVP, permitir rutas MVP y nuevas rutas SEO
  if (mvpMode) {
    return {
      rules: [
        {
          userAgent: '*',
          allow: [
            '/',
            '/buscar',
            '/arriendo',
            '/arriendo/departamento',
            '/arriendo/departamento/*',
            '/property/',
          ],
          disallow: [
            '/coming-soon',
            '/arrienda-sin-comision',
            '/flash-videos',
            '/landing-v2',
            '/cotizador',
            '/agendamiento',
            '/agendamiento-mejorado',
            '/propiedad',
            '/admin',
          ],
        },
      ],
    };
  }
  
  return { 
    rules: { 
      userAgent: '*', 
      allow: '/' 
    } 
  };
}
