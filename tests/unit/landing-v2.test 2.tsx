// Jest types are available globally
import fs from 'fs';
import path from 'path';

describe('Landing V2 - Smoke Tests', () => {
  const projectRoot = process.cwd();

  describe('Archivos de Landing V2', () => {
    it('debe existir la página landing-v2', () => {
      const pagePath = path.join(projectRoot, 'app/(marketing)/landing-v2/page.tsx');
      expect(fs.existsSync(pagePath)).toBe(true);
    });

    it('debe existir el componente HeroV2', () => {
      const componentPath = path.join(projectRoot, 'components/marketing/HeroV2.tsx');
      expect(fs.existsSync(componentPath)).toBe(true);
    });

    it('debe existir el componente FeaturedGrid', () => {
      const componentPath = path.join(projectRoot, 'components/marketing/FeaturedGrid.tsx');
      expect(fs.existsSync(componentPath)).toBe(true);
    });

    it('debe existir el endpoint featured', () => {
      const endpointPath = path.join(projectRoot, 'app/api/landing/featured/route.ts');
      expect(fs.existsSync(endpointPath)).toBe(true);
    });
  });

  describe('Feature Flag Landing V2', () => {
    it('debe tener la flag landingV2 definida', () => {
      const featureFlagsPath = path.join(projectRoot, 'config/feature-flags.ts');
      const content = fs.readFileSync(featureFlagsPath, 'utf-8');

      expect(content).toContain('landingV2');
      expect(content).toContain('// nueva landing con datos reales');
    });
  });

  describe('Estructura de archivos', () => {
    it('el endpoint featured debe tener la estructura correcta', () => {
      const endpointPath = path.join(projectRoot, 'app/api/landing/featured/route.ts');
      const content = fs.readFileSync(endpointPath, 'utf-8');

      // Verificar que tiene las importaciones básicas
      expect(content).toContain('NextResponse');
      expect(content).toContain('createRateLimiter');
      expect(content).toContain('export async function GET');

      // Verificar que usa el sistema de datos
      expect(content).toContain('getAllBuildings');
      expect(content).toContain('featured');
      expect(content).toContain('has_availability');
    });

    it('FeaturedGrid debe tener importaciones necesarias', () => {
      const componentPath = path.join(projectRoot, 'components/marketing/FeaturedGrid.tsx');
      const content = fs.readFileSync(componentPath, 'utf-8');

      expect(content).toContain('import Image from "next/image"');
      expect(content).toContain('import Link from "next/link"');
      expect(content).toContain('getFeaturedBuildings');
    });

    it('la página landing-v2 debe importar todos los componentes', () => {
      const pagePath = path.join(projectRoot, 'app/(marketing)/landing-v2/page.tsx');
      const content = fs.readFileSync(pagePath, 'utf-8');

      expect(content).toContain('HeroV2');
      expect(content).toContain('FeaturedGrid');
      expect(content).toContain('HowItWorks');
      expect(content).toContain('Trust');
      expect(content).toContain('export default async function LandingV2Page');
    });
  });
});
