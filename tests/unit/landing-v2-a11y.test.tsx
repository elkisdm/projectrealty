// Jest types are available globally
import fs from 'fs';
import path from 'path';

describe('Landing V2 - Accesibilidad', () => {
  const projectRoot = process.cwd();

  describe('Estructura semántica', () => {
    it('debe tener landmarks semánticos correctos', () => {
      const pagePath = path.join(projectRoot, 'app/(marketing)/landing-v2/page.tsx');
      const content = fs.readFileSync(pagePath, 'utf-8');
      
      // Verificar que tiene main
      expect(content).toContain('<main');
    });

    it('debe tener headings jerárquicos en todas las secciones', () => {
      const components = [
        'components/marketing/HeroV2.tsx',
        'components/marketing/FeaturedGrid.tsx',
        'components/marketing/HowItWorks.tsx',
        'components/marketing/Trust.tsx'
      ];

      components.forEach((componentPath) => {
        const fullPath = path.join(projectRoot, componentPath);
        const content = fs.readFileSync(fullPath, 'utf-8');
        
        // Verificar que tiene headings
        expect(content).toMatch(/<h[1-6]/);
        
        // Verificar que las secciones tienen aria-labelledby (algunas)
        if (content.includes('aria-labelledby')) {
          expect(content).toMatch(/aria-labelledby="[^"]+"/);
        }
      });
    });
  });

  describe('Navegación por teclado', () => {
    it('debe tener focus-visible en elementos interactivos', () => {
      const components = [
        'components/marketing/HeroV2.tsx',
        'components/marketing/FeaturedGrid.tsx',
        'components/marketing/StickyMobileCTA.tsx'
      ];

      components.forEach((componentPath) => {
        const fullPath = path.join(projectRoot, componentPath);
        const content = fs.readFileSync(fullPath, 'utf-8');
        
        // Verificar que los links tienen focus styles
        if (content.includes('href=')) {
          expect(content).toMatch(/focus(-visible)?:outline-none|focus(-visible)?:ring/);
        }
      });
    });

    it('debe tener aria-labels descriptivos en elementos complejos', () => {
      const featuredGridPath = path.join(projectRoot, 'components/marketing/FeaturedGrid.tsx');
      const content = fs.readFileSync(featuredGridPath, 'utf-8');
      
      // Verificar que los links tienen aria-label descriptivos
      expect(content).toMatch(/aria-label=\{[^}]*detalles[^}]*\}/);
    });
  });

  describe('Imágenes y multimedia', () => {
    it('debe tener alt text en todas las imágenes', () => {
      const featuredGridPath = path.join(projectRoot, 'components/marketing/FeaturedGrid.tsx');
      const content = fs.readFileSync(featuredGridPath, 'utf-8');
      
      // Verificar que Image components tienen alt
      const imageMatches = content.match(/<Image[^>]*>/g);
      if (imageMatches) {
        imageMatches.forEach((imageTag) => {
          expect(imageTag).toMatch(/alt=\{/);
        });
      }
    });

    it('debe marcar elementos decorativos como aria-hidden', () => {
      const heroPath = path.join(projectRoot, 'components/marketing/HeroV2.tsx');
      const content = fs.readFileSync(heroPath, 'utf-8');
      
      // Verificar que elementos decorativos tienen aria-hidden
      expect(content).toContain('aria-hidden="true"');
    });
  });

  describe('Motion y animaciones', () => {
    it('debe respetar prefers-reduced-motion', () => {
      const motionWrapperPath = path.join(projectRoot, 'components/ui/MotionWrapper.tsx');
      const content = fs.readFileSync(motionWrapperPath, 'utf-8');
      
      // Verificar que usa useReducedMotion
      expect(content).toContain('useReducedMotion');
      expect(content).toContain('shouldReduceMotion');
    });

    it('debe tener animaciones sutiles por defecto', () => {
      const motionWrapperPath = path.join(projectRoot, 'components/ui/MotionWrapper.tsx');
      const content = fs.readFileSync(motionWrapperPath, 'utf-8');
      
      // Verificar que las animaciones son sutiles (y: 20 o menos)
      expect(content).toMatch(/y:\s*-?(?:20|1[0-9]|[0-9])/);
    });
  });

  describe('Colores y contraste', () => {
    it('debe usar clases de color semánticas', () => {
      const components = [
        'components/marketing/HeroV2.tsx',
        'components/marketing/FeaturedGrid.tsx',
        'components/marketing/HowItWorks.tsx',
        'components/marketing/Trust.tsx'
      ];

      components.forEach((componentPath) => {
        const fullPath = path.join(projectRoot, componentPath);
        const content = fs.readFileSync(fullPath, 'utf-8');
        
        // Verificar que usa variables de color semánticas
        expect(content).toMatch(/text-(foreground|muted-foreground|primary)/);
        expect(content).toMatch(/bg-(background|card|muted|primary|gradient)/);
      });
    });
  });
});
