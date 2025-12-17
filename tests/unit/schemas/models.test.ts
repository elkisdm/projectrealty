import { describe, test, expect } from '@jest/globals';
import { UnitSchema, BuildingSchema, SearchFiltersSchema } from '@schemas/models';
import { z } from 'zod';

describe('UnitSchema', () => {
  const baseUnit = {
    id: 'unit-123',
    slug: 'departamento-estudio-providencia-123',
    codigoUnidad: '101',
    buildingId: 'building-456',
    tipologia: 'Estudio',
    price: 500000,
    disponible: true,
    dormitorios: 1,
    banos: 1,
    garantia: 500000,
  };

  describe('valida campos requeridos', () => {
    test('valida unidad con campos mínimos requeridos', () => {
      expect(() => UnitSchema.parse(baseUnit)).not.toThrow();
    });

    test('rechaza unidad sin slug', () => {
      const invalid = { ...baseUnit, slug: '' };
      expect(() => UnitSchema.parse(invalid)).toThrow();
    });

    test('rechaza unidad sin codigoUnidad', () => {
      const invalid = { ...baseUnit, codigoUnidad: '' };
      expect(() => UnitSchema.parse(invalid)).toThrow();
    });

    test('rechaza unidad sin buildingId', () => {
      const invalid = { ...baseUnit, buildingId: '' };
      expect(() => UnitSchema.parse(invalid)).toThrow();
    });

    test('rechaza unidad sin dormitorios', () => {
      const invalid = { ...baseUnit };
      delete (invalid as any).dormitorios;
      expect(() => UnitSchema.parse(invalid)).toThrow();
    });

    test('rechaza unidad sin banos', () => {
      const invalid = { ...baseUnit };
      delete (invalid as any).banos;
      expect(() => UnitSchema.parse(invalid)).toThrow();
    });

    test('rechaza unidad sin garantia', () => {
      const invalid = { ...baseUnit };
      delete (invalid as any).garantia;
      expect(() => UnitSchema.parse(invalid)).toThrow();
    });

    test('rechaza garantia negativa o cero', () => {
      expect(() => UnitSchema.parse({ ...baseUnit, garantia: 0 })).toThrow();
      expect(() => UnitSchema.parse({ ...baseUnit, garantia: -1 })).toThrow();
    });
  });

  describe('acepta campos opcionales', () => {
    test('acepta unidad con todos los campos opcionales', () => {
      const fullUnit = {
        ...baseUnit,
        gastoComun: 50000,
        m2: 35,
        piso: 5,
        vista: 'Norte',
        amoblado: true,
        politicaMascotas: 'Permitidas',
        precioFijoMeses: 3,
        garantiaEnCuotas: true,
        cuotasGarantia: 3,
        reajuste: 'cada 3 meses según UF',
        estado: 'Disponible' as const,
        estacionamiento: true,
        bodega: true,
        images: ['image1.jpg', 'image2.jpg'],
        imagesTipologia: ['tipologia1.jpg'],
        imagesAreasComunes: ['areas-comunes1.jpg'],
      };

      expect(() => UnitSchema.parse(fullUnit)).not.toThrow();
      const parsed = UnitSchema.parse(fullUnit);
      expect(parsed.precioFijoMeses).toBe(3);
      expect(parsed.garantiaEnCuotas).toBe(true);
      expect(parsed.cuotasGarantia).toBe(3);
      expect(parsed.estado).toBe('Disponible');
      expect(parsed.imagesTipologia).toEqual(['tipologia1.jpg']);
      expect(parsed.imagesAreasComunes).toEqual(['areas-comunes1.jpg']);
    });

    test('acepta tipologia "Estudio" además de "Studio"', () => {
      expect(() => UnitSchema.parse({ ...baseUnit, tipologia: 'Estudio' })).not.toThrow();
      expect(() => UnitSchema.parse({ ...baseUnit, tipologia: 'Studio' })).not.toThrow();
    });

    test('valida cuotasGarantia entre 1-12', () => {
      expect(() => UnitSchema.parse({ ...baseUnit, cuotasGarantia: 1 })).not.toThrow();
      expect(() => UnitSchema.parse({ ...baseUnit, cuotasGarantia: 12 })).not.toThrow();
      expect(() => UnitSchema.parse({ ...baseUnit, cuotasGarantia: 0 })).toThrow();
      expect(() => UnitSchema.parse({ ...baseUnit, cuotasGarantia: 13 })).toThrow();
    });

    test('valida estado enum correcto', () => {
      expect(() => UnitSchema.parse({ ...baseUnit, estado: 'Disponible' })).not.toThrow();
      expect(() => UnitSchema.parse({ ...baseUnit, estado: 'Reservado' })).not.toThrow();
      expect(() => UnitSchema.parse({ ...baseUnit, estado: 'Arrendado' })).not.toThrow();
      expect(() => UnitSchema.parse({ ...baseUnit, estado: 'Otro' })).toThrow();
    });
  });

  describe('validaciones de tipos', () => {
    test('rechaza precio negativo o cero', () => {
      expect(() => UnitSchema.parse({ ...baseUnit, price: 0 })).toThrow();
      expect(() => UnitSchema.parse({ ...baseUnit, price: -1 })).toThrow();
    });

    test('rechaza dormitorios negativos o cero', () => {
      expect(() => UnitSchema.parse({ ...baseUnit, dormitorios: 0 })).toThrow();
      expect(() => UnitSchema.parse({ ...baseUnit, dormitorios: -1 })).toThrow();
    });

    test('rechaza banos negativos o cero', () => {
      expect(() => UnitSchema.parse({ ...baseUnit, banos: 0 })).toThrow();
      expect(() => UnitSchema.parse({ ...baseUnit, banos: -1 })).toThrow();
    });
  });
});

describe('BuildingSchema', () => {
  const baseUnit = {
    id: 'unit-123',
    slug: 'departamento-estudio-providencia-123',
    codigoUnidad: '101',
    buildingId: 'building-123',
    tipologia: 'Estudio',
    price: 500000,
    disponible: true,
    dormitorios: 1,
    banos: 1,
    garantia: 500000,
  };

  const baseBuilding = {
    id: 'building-123',
    slug: 'edificio-test',
    name: 'Edificio Test',
    comuna: 'Providencia',
    address: 'Av. Test 123',
    amenities: ['Piscina', 'Gimnasio'],
    gallery: ['img1.jpg', 'img2.jpg', 'img3.jpg'],
    units: [baseUnit],
  };

  test('valida edificio con campos mínimos', () => {
    expect(() => BuildingSchema.parse(baseBuilding)).not.toThrow();
  });

  test('acepta campos extendidos opcionales', () => {
    const fullBuilding = {
      ...baseBuilding,
      region: 'Región Metropolitana',
      conectividad: {
        viaPrincipal: true,
        transporteUrbano: true,
      },
      metroCercano: {
        nombre: 'Baquedano',
        distancia: 500,
        tiempoCaminando: 5,
      },
      tipoProyecto: 'Multifamily – Propiedades nuevas',
      administracion: 'Servicio Pro Assetplan',
      descripcion: 'Descripción del edificio',
      seguridadAccesos: ['Accesos controlados', 'Conserjería'],
      estacionamientos: {
        subterraneo: true,
        visitas: true,
      },
      bodegas: {
        disponibles: true,
        descripcion: 'Bodegas disponibles',
      },
      serviciosEdificio: ['Ascensores', 'Calefacción central'],
      politicaMascotas: {
        petFriendly: true,
        pesoMaximoKg: 10,
      },
      requisitosArriendo: {
        documentacion: {
          dependiente: ['Cedula', 'Contrato'],
        },
        condicionesFinancieras: {
          avales: {
            permitidos: true,
          },
        },
      },
      infoContrato: {
        duracionAnos: 1,
        salidaAnticipada: {
          aplicaMulta: true,
        },
        despuesDelAno: {
          salidaLibre: true,
          avisoPrevio: true,
        },
      },
      ocupacion: {
        maxPersonasPorDormitorio: 2,
      },
      units: [baseUnit],
    };

    expect(() => BuildingSchema.parse(fullBuilding)).not.toThrow();
    const parsed = BuildingSchema.parse(fullBuilding);
    expect(parsed.region).toBe('Región Metropolitana');
    expect(parsed.metroCercano?.nombre).toBe('Baquedano');
    expect(parsed.politicaMascotas?.petFriendly).toBe(true);
  });

  test('rechaza comuna con dígitos', () => {
    expect(() => BuildingSchema.parse({ ...baseBuilding, comuna: 'Providencia123' })).toThrow();
  });
});

describe('SearchFiltersSchema', () => {
  test('valida filtros básicos', () => {
    const filters = {
      q: 'departamento',
      comuna: 'Providencia',
      precioMin: 500000,
      precioMax: 1000000,
      dormitorios: 2,
      sort: 'precio' as const,
      page: 1,
      limit: 12,
    };

    expect(() => SearchFiltersSchema.parse(filters)).not.toThrow();
    const parsed = SearchFiltersSchema.parse(filters);
    expect(parsed.dormitorios).toBe(2);
    expect(parsed.sort).toBe('precio');
  });

  test('NO incluye campo banos', () => {
    // Intentar agregar banos directamente falla (Zod rechaza campos no definidos si pasamos strict)
    // Pero si no usamos strict, simplemente lo ignora
    const filtersWithBanos = {
      q: 'test',
      banos: 2, // Este campo NO debería estar en el schema
    };

    const parsed = SearchFiltersSchema.parse(filtersWithBanos);
    // El campo banos no debería estar en el resultado
    expect(parsed).not.toHaveProperty('banos');
  });

  test('valida que precioMax >= precioMin', () => {
    expect(() =>
      SearchFiltersSchema.parse({ precioMin: 500000, precioMax: 1000000 })
    ).not.toThrow();

    expect(() =>
      SearchFiltersSchema.parse({ precioMin: 1000000, precioMax: 500000 })
    ).toThrow('precioMax debe ser mayor o igual a precioMin');
  });

  test('acepta valores por defecto para page y limit', () => {
    const filters = { comuna: 'Providencia' };
    const parsed = SearchFiltersSchema.parse(filters);
    expect(parsed.page).toBe(1);
    expect(parsed.limit).toBe(12);
  });

  test('valida límites de limit (máximo 100)', () => {
    expect(() => SearchFiltersSchema.parse({ limit: 100 })).not.toThrow();
    expect(() => SearchFiltersSchema.parse({ limit: 101 })).toThrow();
  });

  test('valida sort enum', () => {
    expect(() => SearchFiltersSchema.parse({ sort: 'precio' })).not.toThrow();
    expect(() => SearchFiltersSchema.parse({ sort: 'ubicacion' })).not.toThrow();
    expect(() => SearchFiltersSchema.parse({ sort: 'relevancia' })).not.toThrow();
    expect(() => SearchFiltersSchema.parse({ sort: 'otro' })).toThrow();
  });

  test('valida dormitorios debe ser positivo', () => {
    expect(() => SearchFiltersSchema.parse({ dormitorios: 1 })).not.toThrow();
    expect(() => SearchFiltersSchema.parse({ dormitorios: 0 })).toThrow();
    expect(() => SearchFiltersSchema.parse({ dormitorios: -1 })).toThrow();
  });

  test('valida precioMin y precioMax deben ser no negativos', () => {
    expect(() => SearchFiltersSchema.parse({ precioMin: 0 })).not.toThrow();
    expect(() => SearchFiltersSchema.parse({ precioMin: -1 })).toThrow();
    expect(() => SearchFiltersSchema.parse({ precioMax: 0 })).not.toThrow();
    expect(() => SearchFiltersSchema.parse({ precioMax: -1 })).toThrow();
  });
});


