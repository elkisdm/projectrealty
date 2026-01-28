/**
 * Unit tests for UnitCard helper functions
 * 
 * Tests pure functions that can be tested independently:
 * - getUnitImage
 * - getUnitSlug
 * - getStatusText
 * - extractFloorNumber
 * - getTipologiaColor
 * - generateUnitHref
 * - computePrimaryBadge
 * - computeChips
 * - formatSpecs
 * - computeUnitData
 */

import type { Unit, Building } from '@types';
import {
  getUnitImage,
  getUnitSlug,
  getStatusText,
  extractFloorNumber,
  getTipologiaColor,
  generateUnitHref,
  computePrimaryBadge,
  computeChips,
  formatSpecs,
  computeUnitData,
} from '../helpers';
import { DEFAULT_FALLBACK_IMAGE, DEFAULT_TIPOLOGIA_COLOR } from '../constants';

// Mock the normalizeComunaSlug function
jest.mock('@lib/utils/slug', () => ({
  normalizeComunaSlug: (comuna: string) => comuna.toLowerCase().replace(/ñ/g, 'n').replace(/\s+/g, '-'),
}));

// Mock formatPrice
jest.mock('@lib/utils', () => ({
  formatPrice: (price: number) => `$${price.toLocaleString('es-CL')}`,
}));

describe('helpers', () => {
  // ============================================
  // getUnitImage tests
  // ============================================
  describe('getUnitImage', () => {
    const mockUnit = {
      id: 'unit-1',
      tipologia: '2D1B',
      price: 500000,
      dormitorios: 2,
      banos: 1,
    } as Unit;

    const mockBuilding = {
      id: 'building-1',
      name: 'Edificio Test',
    } as Building;

    it('prioriza imagesTipologia sobre gallery', () => {
      const unitWithTipologia = {
        ...mockUnit,
        imagesTipologia: ['tipologia-1.jpg', 'tipologia-2.jpg'],
        images: ['interior-1.jpg'],
      };
      const buildingWithGallery = {
        ...mockBuilding,
        gallery: ['gallery-1.jpg'],
        coverImage: 'cover.jpg',
      };

      expect(getUnitImage(unitWithTipologia, buildingWithGallery)).toBe('tipologia-1.jpg');
    });

    it('usa imagesAreasComunes si no hay imagesTipologia', () => {
      const unitWithAreas = {
        ...mockUnit,
        imagesAreasComunes: ['areas-1.jpg', 'areas-2.jpg'],
        images: ['interior-1.jpg'],
      };

      expect(getUnitImage(unitWithAreas, mockBuilding)).toBe('areas-1.jpg');
    });

    it('usa building gallery si no hay imagenes de tipologia ni areas', () => {
      const buildingWithGallery = {
        ...mockBuilding,
        gallery: ['gallery-1.jpg', 'gallery-2.jpg'],
        coverImage: 'cover.jpg',
      };

      expect(getUnitImage(mockUnit, buildingWithGallery)).toBe('gallery-1.jpg');
    });

    it('usa building coverImage si no hay gallery', () => {
      const buildingWithCover = {
        ...mockBuilding,
        coverImage: 'cover.jpg',
      };

      expect(getUnitImage(mockUnit, buildingWithCover)).toBe('cover.jpg');
    });

    it('usa unit images como ultimo recurso', () => {
      const unitWithImages = {
        ...mockUnit,
        images: ['interior-1.jpg', 'interior-2.jpg'],
      };

      expect(getUnitImage(unitWithImages, mockBuilding)).toBe('interior-1.jpg');
    });

    it('retorna fallback cuando no hay imagenes', () => {
      expect(getUnitImage(mockUnit, mockBuilding)).toBe(DEFAULT_FALLBACK_IMAGE);
    });

    it('retorna fallback si imagesTipologia es array vacio', () => {
      const unitWithEmptyArray = {
        ...mockUnit,
        imagesTipologia: [],
      };

      expect(getUnitImage(unitWithEmptyArray, mockBuilding)).toBe(DEFAULT_FALLBACK_IMAGE);
    });

    it('funciona sin building', () => {
      const unitWithImages = {
        ...mockUnit,
        images: ['interior-1.jpg'],
      };

      expect(getUnitImage(unitWithImages)).toBe('interior-1.jpg');
    });
  });

  // ============================================
  // extractFloorNumber tests
  // ============================================
  describe('extractFloorNumber', () => {
    it('extrae piso de codigo 2201 -> 22', () => {
      expect(extractFloorNumber('2201')).toBe(22);
    });

    it('extrae piso de codigo 301 -> 3', () => {
      expect(extractFloorNumber('301')).toBe(3);
    });

    it('extrae piso de codigo 1205 -> 12', () => {
      expect(extractFloorNumber('1205')).toBe(12);
    });

    it('extrae piso de codigo 101 -> 1', () => {
      expect(extractFloorNumber('101')).toBe(1);
    });

    it('extrae piso de codigo 501 -> 5', () => {
      expect(extractFloorNumber('501')).toBe(5);
    });

    it('extrae piso de codigo con letras A2201 -> 22', () => {
      expect(extractFloorNumber('A2201')).toBe(22);
    });

    it('retorna null si codigo es vacio', () => {
      expect(extractFloorNumber('')).toBe(null);
    });

    it('retorna null si codigo es muy corto', () => {
      expect(extractFloorNumber('1')).toBe(null);
      expect(extractFloorNumber('12')).toBe(null);
    });

    it('retorna null para codigo invalido', () => {
      expect(extractFloorNumber('ABC')).toBe(null);
    });
  });

  // ============================================
  // getStatusText tests
  // ============================================
  describe('getStatusText', () => {
    it('retorna Disponible para status available', () => {
      const unit = { status: 'available' } as Unit;
      expect(getStatusText(unit)).toBe('Disponible');
    });

    it('retorna Disponible para disponible true', () => {
      const unit = { disponible: true } as Unit;
      expect(getStatusText(unit)).toBe('Disponible');
    });

    it('retorna Reservado para status reserved', () => {
      const unit = { status: 'reserved' } as Unit;
      expect(getStatusText(unit)).toBe('Reservado');
    });

    it('retorna Arrendado para status rented', () => {
      const unit = { status: 'rented' } as Unit;
      expect(getStatusText(unit)).toBe('Arrendado');
    });

    it('retorna Disponible por defecto', () => {
      const unit = {} as Unit;
      expect(getStatusText(unit)).toBe('Disponible');
    });
  });

  // ============================================
  // getTipologiaColor tests
  // ============================================
  describe('getTipologiaColor', () => {
    it('retorna color para studio', () => {
      const color = getTipologiaColor('studio');
      expect(color.bg).toBe('bg-[#8B6CFF]');
      expect(color.text).toBe('text-white');
    });

    it('retorna color para estudio (español)', () => {
      const color = getTipologiaColor('estudio');
      expect(color.bg).toBe('bg-[#8B6CFF]');
    });

    it('retorna color para 2D1B', () => {
      const color = getTipologiaColor('2d1b');
      expect(color.bg).toBe('bg-[#3B82F6]');
    });

    it('retorna color default para tipologia desconocida', () => {
      const color = getTipologiaColor('unknown');
      expect(color.bg).toBe(DEFAULT_TIPOLOGIA_COLOR.bg);
    });

    it('es case-insensitive', () => {
      expect(getTipologiaColor('STUDIO').bg).toBe('bg-[#8B6CFF]');
      expect(getTipologiaColor('Studio').bg).toBe('bg-[#8B6CFF]');
    });

    it('ignora espacios', () => {
      expect(getTipologiaColor(' studio ').bg).toBe('bg-[#8B6CFF]');
    });
  });

  // ============================================
  // computePrimaryBadge tests
  // ============================================
  describe('computePrimaryBadge', () => {
    const mockUnit = {
      id: 'unit-1',
      tipologia: '2D1B',
      price: 500000,
      dormitorios: 2,
      banos: 1,
      disponible: true,
    } as Unit;

    it('prioriza promotions sobre pet_friendly', () => {
      const unitWithPromo = {
        ...mockUnit,
        promotions: [{ label: '50% OFF' }],
        pet_friendly: true,
      } as Unit;

      const badge = computePrimaryBadge(unitWithPromo);
      expect(badge?.text).toBe('50% OFF');
      expect(badge?.type).toBe('promo');
    });

    it('usa building badges si no hay unit promotions', () => {
      const building = {
        id: 'building-1',
        badges: [{ label: 'Exclusivo' }],
      } as Building;

      const badge = computePrimaryBadge(mockUnit, building);
      expect(badge?.text).toBe('Exclusivo');
      expect(badge?.type).toBe('promo');
    });

    it('usa pet_friendly si no hay promotions ni badges', () => {
      const unitPet = {
        ...mockUnit,
        pet_friendly: true,
      } as Unit;

      const badge = computePrimaryBadge(unitPet);
      expect(badge?.text).toBe('Pet Friendly');
      expect(badge?.type).toBe('pet_friendly');
    });

    it('usa petFriendly (camelCase) también', () => {
      const unitPet = {
        ...mockUnit,
        petFriendly: true,
      } as Unit;

      const badge = computePrimaryBadge(unitPet);
      expect(badge?.text).toBe('Pet Friendly');
    });

    it('retorna status disponible por defecto', () => {
      const badge = computePrimaryBadge(mockUnit);
      expect(badge?.text).toBe('Disponible');
      expect(badge?.type).toBe('available');
    });
  });

  // ============================================
  // computeChips tests
  // ============================================
  describe('computeChips', () => {
    const mockUnit = {
      id: 'unit-1',
      tipologia: '2D1B',
      price: 500000,
      dormitorios: 2,
      banos: 1,
    } as Unit;

    it('incluye chip de mascotas si pet_friendly', () => {
      const unitPet = { ...mockUnit, pet_friendly: true };
      const chips = computeChips(unitPet);
      expect(chips).toContainEqual(expect.objectContaining({ type: 'pet', label: 'Mascotas' }));
    });

    it('incluye chip de estacionamiento', () => {
      const unitParking = { ...mockUnit, estacionamiento: true };
      const chips = computeChips(unitParking);
      expect(chips).toContainEqual(expect.objectContaining({ type: 'parking', label: 'Estacionamiento' }));
    });

    it('incluye chip de bodega', () => {
      const unitStorage = { ...mockUnit, bodega: true };
      const chips = computeChips(unitStorage);
      expect(chips).toContainEqual(expect.objectContaining({ type: 'storage', label: 'Bodega' }));
    });

    it('incluye chip de terraza con m2', () => {
      const unitTerrace = { ...mockUnit, m2_terraza: 15 };
      const chips = computeChips(unitTerrace);
      expect(chips).toContainEqual(expect.objectContaining({ type: 'terrace', label: 'Terraza 15m²' }));
    });

    it('limita a maxChips (default 2)', () => {
      const unitFull = {
        ...mockUnit,
        pet_friendly: true,
        estacionamiento: true,
        bodega: true,
        m2_terraza: 15,
      };
      const chips = computeChips(unitFull);
      expect(chips.length).toBe(2);
    });

    it('respeta maxChips custom', () => {
      const unitFull = {
        ...mockUnit,
        pet_friendly: true,
        estacionamiento: true,
        bodega: true,
      };
      const chips = computeChips(unitFull, 3);
      expect(chips.length).toBe(3);
    });

    it('retorna array vacio si no hay features', () => {
      const chips = computeChips(mockUnit);
      expect(chips).toEqual([]);
    });
  });

  // ============================================
  // formatSpecs tests
  // ============================================
  describe('formatSpecs', () => {
    it('formatea specs completos', () => {
      expect(formatSpecs(65, 2, 1)).toBe('65 m² · 2D · 1B');
    });

    it('incluye terraza si existe', () => {
      expect(formatSpecs(65, 2, 1, 10)).toBe('65 m² · 2D · 1B · +10m² terraza');
    });

    it('omite m2 si no existe', () => {
      expect(formatSpecs(undefined, 2, 1)).toBe('2D · 1B');
    });

    it('funciona con estudio (0 dormitorios)', () => {
      expect(formatSpecs(35, 0, 1)).toBe('35 m² · 0D · 1B');
    });

    it('no incluye terraza si es 0', () => {
      expect(formatSpecs(65, 2, 1, 0)).toBe('65 m² · 2D · 1B');
    });
  });

  // ============================================
  // generateUnitHref tests
  // ============================================
  describe('generateUnitHref', () => {
    const mockUnit = {
      id: 'unit-1',
      slug: 'edificio-test-unit-1',
      tipologia: '2D1B',
      price: 500000,
    } as Unit;

    it('genera ruta SEO con comuna', () => {
      const building = {
        id: 'building-1',
        comuna: 'Ñuñoa',
      } as Building;

      const href = generateUnitHref(mockUnit, building);
      expect(href).toBe('/arriendo/departamento/nunoa/edificio-test-unit-1');
    });

    it('usa /property/[slug] si no hay comuna', () => {
      const building = {
        id: 'building-1',
      } as Building;

      const href = generateUnitHref(mockUnit, building);
      expect(href).toBe('/property/edificio-test-unit-1');
    });

    it('funciona sin building', () => {
      const href = generateUnitHref(mockUnit);
      expect(href).toBe('/property/edificio-test-unit-1');
    });
  });

  // ============================================
  // getUnitSlug tests
  // ============================================
  describe('getUnitSlug', () => {
    it('usa unit.slug si existe', () => {
      const unit = { id: 'unit-1', slug: 'custom-slug' } as Unit;
      expect(getUnitSlug(unit)).toBe('custom-slug');
    });

    it('genera slug desde building.slug + unit.id', () => {
      const unit = { id: 'abcd1234-5678' } as Unit;
      const building = { slug: 'edificio-test' } as Building;
      expect(getUnitSlug(unit, building)).toBe('edificio-test-abcd1234');
    });

    it('usa unit.id como fallback', () => {
      const unit = { id: 'unit-12345' } as Unit;
      expect(getUnitSlug(unit)).toBe('unit-12345');
    });
  });

  // ============================================
  // computeUnitData integration test
  // ============================================
  describe('computeUnitData', () => {
    it('computa todos los datos derivados correctamente', () => {
      const unit = {
        id: 'unit-1',
        slug: 'test-unit',
        tipologia: '2D1B',
        price: 500000,
        gastoComun: 50000,
        m2: 65,
        dormitorios: 2,
        banos: 1,
        m2_terraza: 10,
        pet_friendly: true,
        estacionamiento: true,
        disponible: true,
        codigoUnidad: '1201',
        imagesTipologia: ['tipologia.jpg'],
      } as Unit;

      const building = {
        id: 'building-1',
        name: 'Edificio Test',
        comuna: 'Ñuñoa',
        address: 'Av. Test 123',
      } as Building;

      const data = computeUnitData(unit, building);

      expect(data.imageUrl).toBe('tipologia.jpg');
      expect(data.href).toBe('/arriendo/departamento/nunoa/test-unit');
      expect(data.slug).toBe('test-unit');
      expect(data.statusText).toBe('Disponible');
      expect(data.buildingName).toBe('Edificio Test');
      expect(data.comuna).toBe('Ñuñoa');
      expect(data.address).toBe('Av. Test 123');
      expect(data.floorNumber).toBe(12);
      expect(data.gastoComun).toBe(50000);
      expect(data.totalMensual).toBe(550000);
      expect(data.badge?.text).toBe('Pet Friendly');
      expect(data.chips.length).toBe(2);
      expect(data.specs.m2).toBe(65);
      expect(data.specs.dormitorios).toBe(2);
      expect(data.specs.banos).toBe(1);
      expect(data.specs.terraza).toBe(10);
    });
  });
});
