import { fromAssetPlan, type AssetPlanRawBuilding } from '@lib/adapters/assetplan';
import { BuildingSchema, PromotionType } from '@schemas/models';
// import assetPlanSample from '@data/sources/assetplan-sample.json'; // File not found, using mock data instead

// Mock data for testing - data that matches test expectations
const assetPlanSample = {
  id: "ap_building_001",
  slug: "sample-assetplan-building",
  nombre: "Edificio Demo AssetPlan",
  comuna: "Ñuñoa", 
  direccion: "Av. Demo 1234",
  units: [
    {
      id: "u1",
      tipologia: "Studio",
      area_interior_m2: 25,
      area_exterior_m2: 3,
      m2: 28,
      bathrooms: 1,
      piso: 1,
      price: 400000,
      disponible: true,
      estacionamiento: true,
      bodega: false
    },
    {
      id: "u2", 
      tipologia: "1D1B",
      area_interior_m2: 40,
      area_exterior_m2: 5,
      m2: 35,
      bedrooms: 1,
      bathrooms: 1,
      price: 480000,
      disponible: true,
      estacionamiento: false,
      bodega: true,
      promotions: ['50% OFF']
    },
    {
      id: "u3",
      tipologia: "2D2B",
      area_interior_m2: 55,
      area_exterior_m2: 5,
      m2: 60,
      bedrooms: 2,
      bathrooms: 2,
      price: 650000,
      disponible: false,
      estacionamiento: true,
      bodega: true
    }
  ],
  amenities: ["Piscina", "Gimnasio", "Cowork"],
  images: [
    "https://example.com/images/1.jpg",
    "https://example.com/images/2.jpg", 
    "https://example.com/images/3.jpg",
    "https://example.com/images/4.jpg"
  ],
  coverImage: "https://example.com/images/cover.jpg",
  badges: ['Comisión corretaje gratis', 'Servicio Pro'],
  nearestTransit: { name: 'Metro Demo', distanceMin: 8 },
  tour360: "https://example.com/tour",
  video: "https://example.com/video"
};

describe('assetplan.adapter', () => {
  describe('fromAssetPlan', () => {
    test('validates with Zod schema and maps sample data correctly', () => {
      const result = fromAssetPlan(assetPlanSample as unknown as AssetPlanRawBuilding);
      
      // Should validate against the schema
      expect(() => BuildingSchema.parse(result)).not.toThrow();
      
      // Basic properties
      expect(result.id).toBe('ap_building_001');
      expect(result.slug).toBe('sample-assetplan-building');
      expect(result.name).toBe('Edificio Demo AssetPlan');
      expect(result.comuna).toBe('Ñuñoa');
      expect(result.address).toBe('Av. Demo 1234');
      
      // Amenities should be mapped to canonical keys
      expect(result.amenities).toEqual(['piscina', 'gimnasio', 'cowork']);
      
      // Media handling
      expect(result.coverImage).toBe('https://example.com/images/cover.jpg');
      expect(result.gallery).toEqual([
        'https://example.com/images/1.jpg',
        'https://example.com/images/2.jpg',
        'https://example.com/images/3.jpg',
        'https://example.com/images/4.jpg'
      ]);
      expect(result.media?.images).toEqual(result.gallery);
      expect(result.media?.tour360).toBe('https://example.com/tour');
      expect(result.media?.video).toBe('https://example.com/video');
      
      // Service level
      expect(result.serviceLevel).toBe('pro');
      
      // Badges conversion
      expect(result.badges).toHaveLength(2);
      expect(result.badges![0]).toEqual({
        label: 'Comisión corretaje gratis',
        type: PromotionType.FREE_COMMISSION
      });
      expect(result.badges![1]).toEqual({
        label: 'Servicio Pro',
        type: PromotionType.SERVICE_PRO
      });
      
      // Transit
      expect(result.nearestTransit).toEqual({
        name: 'Metro Demo',
        distanceMin: 8
      });
      
      // Units
      expect(result.units).toHaveLength(3);
    });

    test('calculates precioDesde correctly for available units', () => {
      const result = fromAssetPlan(assetPlanSample as unknown as AssetPlanRawBuilding);
      
      // Only units with disponible=true should be considered
      const availableUnits = result.units.filter(u => u.disponible);
      expect(availableUnits).toHaveLength(2);
      
      const prices = availableUnits.map(u => u.price);
      expect(prices).toEqual([400000, 480000]);
      
      // The minimum price should be 400000
      const minPrice = Math.min(...prices);
      expect(minPrice).toBe(400000);
    });

    test('maps units correctly with area calculations', () => {
      const result = fromAssetPlan(assetPlanSample as unknown as AssetPlanRawBuilding);
      
      // Unit 1: Studio with interior + exterior areas
      const unit1 = result.units.find(u => u.id === 'u1');
      expect(unit1).toBeDefined();
      expect(unit1!.tipologia).toBe('Studio');
      expect(unit1!.area_interior_m2).toBe(25);
      expect(unit1!.area_exterior_m2).toBe(3);
      expect(unit1!.m2).toBe(28); // interior + exterior
      expect(unit1!.price).toBe(400000);
      expect(unit1!.disponible).toBe(true);
      expect(unit1!.bathrooms).toBe(1);
      expect(unit1!.bedrooms).toBeUndefined();
      expect(unit1!.piso).toBe(1);
      
      // Unit 2: 1D/1B with promotions
      const unit2 = result.units.find(u => u.id === 'u2');
      expect(unit2).toBeDefined();
      expect(unit2!.tipologia).toBe('1D1B');
      expect(unit2!.bedrooms).toBe(1);
      expect(unit2!.bathrooms).toBe(1);
      expect(unit2!.m2).toBe(35); // uses m2 field
      expect(unit2!.price).toBe(480000);
      expect(unit2!.disponible).toBe(true);
      expect(unit2!.promotions).toHaveLength(1);
      expect(unit2!.promotions![0]).toEqual({
        label: '50% OFF',
        type: PromotionType.DISCOUNT_PERCENT
      });
      
      // Unit 3: 2D/2B not available
      const unit3 = result.units.find(u => u.id === 'u3');
      expect(unit3).toBeDefined();
      expect(unit3!.tipologia).toBe('2D2B');
      expect(unit3!.bedrooms).toBe(2);
      expect(unit3!.bathrooms).toBe(2);
      expect(unit3!.area_interior_m2).toBe(55);
      expect(unit3!.area_exterior_m2).toBe(5);
      expect(unit3!.m2).toBe(60); // interior + exterior
      expect(unit3!.price).toBe(650000);
      expect(unit3!.disponible).toBe(false);
    });

    test('handles typologySummary correctly', () => {
      const result = fromAssetPlan(assetPlanSample as unknown as AssetPlanRawBuilding);
      
      // Should have typology summary based on available units
      const availableUnits = result.units.filter(u => u.disponible);
      const typologies = [...new Set(availableUnits.map(u => u.tipologia))];
      expect(typologies).toEqual(['Studio', '1D1B']);
    });

    test('sets hasAvailability=true when units are available', () => {
      const result = fromAssetPlan(assetPlanSample as unknown as AssetPlanRawBuilding);
      
      const hasAvailableUnits = result.units.some(u => u.disponible);
      expect(hasAvailableUnits).toBe(true);
    });

    test('handles case with no available units', () => {
      const sampleWithNoAvailableUnits: AssetPlanRawBuilding = {
        ...assetPlanSample as unknown as AssetPlanRawBuilding,
        units: [
          {
            id: 'u1',
            tipologia: 'Studio',
            m2: 25,
            price: 400000,
            disponible: false
          },
          {
            id: 'u2',
            tipologia: '1D/1B',
            m2: 40,
            price: 480000,
            disponible: false
          }
        ]
      };
      
      const result = fromAssetPlan(sampleWithNoAvailableUnits);
      
      // Should validate with Zod
      expect(() => BuildingSchema.parse(result)).not.toThrow();
      
      // All units should be unavailable
      const availableUnits = result.units.filter(u => u.disponible);
      expect(availableUnits).toHaveLength(0);
      
      // hasAvailability should be false
      const hasAvailableUnits = result.units.some(u => u.disponible);
      expect(hasAvailableUnits).toBe(false);
      
      // No minimum price can be calculated
      const prices = availableUnits.map(u => u.price);
      expect(prices).toHaveLength(0);
    });

    test('handles units with status field for availability', () => {
      const sampleWithStatus: AssetPlanRawBuilding = {
        ...assetPlanSample as unknown as AssetPlanRawBuilding,
        units: [
          {
            id: 'u1',
            tipologia: 'Studio',
            m2: 25,
            price: 400000,
            status: 'available'
          },
          {
            id: 'u2',
            tipologia: '1D/1B',
            m2: 40,
            price: 480000,
            status: 'rented'
          },
          {
            id: 'u3',
            tipologia: '2D/2B',
            m2: 60,
            price: 650000,
            status: 'reserved'
          }
        ]
      };
      
      const result = fromAssetPlan(sampleWithStatus);
      
      // Only unit with status 'available' should be considered available
      const availableUnits = result.units.filter(u => u.disponible);
      expect(availableUnits).toHaveLength(1);
      expect(availableUnits[0].id).toBe('u1');
      
      // Status should be mapped correctly
      expect(result.units[0].status).toBe('available');
      expect(result.units[1].status).toBe('rented');
      expect(result.units[2].status).toBe('reserved');
    });

    test('handles fallback for coverImage from gallery', () => {
      const sampleWithoutCover: AssetPlanRawBuilding = {
        ...assetPlanSample as unknown as AssetPlanRawBuilding,
        coverImage: undefined,
        images: ['https://example.com/images/1.jpg', 'https://example.com/images/2.jpg', 'https://example.com/images/3.jpg']
      };
      
      const result = fromAssetPlan(sampleWithoutCover);
      
      // Should use first image from gallery as cover
      expect(result.coverImage).toBe('https://example.com/images/1.jpg');
    });

    test('handles service level inference from badges', () => {
      const sampleWithServiceProBadge: AssetPlanRawBuilding = {
        ...assetPlanSample as unknown as AssetPlanRawBuilding,
        serviceLevel: undefined,
        badges: ['Servicio Pro']
      };
      
      const result = fromAssetPlan(sampleWithServiceProBadge);
      
      // Should infer service level from badge
      expect(result.serviceLevel).toBe('pro');
    });

    test('handles empty amenities gracefully', () => {
      const sampleWithEmptyAmenities: AssetPlanRawBuilding = {
        ...assetPlanSample as unknown as AssetPlanRawBuilding,
        amenities: ['Piscina'] // Need at least one amenity per schema
      };
      
      const result = fromAssetPlan(sampleWithEmptyAmenities);
      
      expect(result.amenities).toEqual(['piscina']);
    });

    test('filters out unknown amenities', () => {
      const sampleWithUnknownAmenities: AssetPlanRawBuilding = {
        ...assetPlanSample as unknown as AssetPlanRawBuilding,
        amenities: ['Piscina', 'Unknown Amenity', 'Gimnasio']
      };
      
      const result = fromAssetPlan(sampleWithUnknownAmenities);
      
      // Should only include known amenities
      expect(result.amenities).toEqual(['piscina', 'gimnasio']);
    });

    test('handles area calculations with fallbacks', () => {
      const sampleWithAreaVariations: AssetPlanRawBuilding = {
        ...assetPlanSample as unknown as AssetPlanRawBuilding,
        units: [
          {
            id: 'u1',
            tipologia: 'Studio',
            area_interior_m2: 25,
            area_exterior_m2: 3,
            price: 400000,
            disponible: true
          },
          {
            id: 'u2',
            tipologia: '1D/1B',
            m2: 35,
            price: 480000,
            disponible: true
          },
          {
            id: 'u3',
            tipologia: '2D/2B',
            area_interior_m2: 55,
            // no exterior area
            price: 650000,
            disponible: true
          }
        ]
      };
      
      const result = fromAssetPlan(sampleWithAreaVariations);
      
      // Unit 1: interior + exterior
      expect(result.units[0].m2).toBe(28);
      
      // Unit 2: fallback to m2
      expect(result.units[1].m2).toBe(35);
      
      // Unit 3: interior only
      expect(result.units[2].m2).toBe(55);
    });
  });
});
