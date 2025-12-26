import fs from 'fs';
import path from 'path';
import { logger } from './logger';

export interface CSVUnit {
  op: string;
  direccion: string;
  comuna: string;
  condominio: string;
  tipologia: string;
  arriendoTotal: number;
  unidad: string;
  m2Depto: number;
  orientacion: string;
  estacionamiento: number;
  bodega: number;
  gcTotal: number;
  aceptaMascotas: boolean;
  linkListing: string;
  estado: string;
  especial: boolean;
  tremendaPromo: boolean;
  descuento: number;
  mesesDescuento: number;
}

export interface CondominioData {
  id: string;
  nombre: string;
  direccion: string;
  comuna: string;
  unidades: CSVUnit[];
  tipologias: string[];
  precioDesde: number;
  precioHasta: number;
  precioPromedio: number;
  totalUnidades: number;
  unidadesDisponibles: number;
  tienePromociones: boolean;
  promociones: string[];
  aceptaMascotas: boolean;
  amenities: string[];
}

export interface LandingBuilding {
  id: string;
  slug: string;
  name: string;
  comuna: string;
  address: string;
  coverImage: string;
  gallery: string[];
  precioDesde: number;
  hasAvailability: boolean;
  badges: Array<{
    type: string;
    label: string;
    description: string;
  }>;
  amenities: string[];
  typologySummary: Array<{
    key: string;
    label: string;
    count: number;
    minPrice: number;
  }>;
}

export interface UnitPageData {
  op: string;
  condominio: string;
  direccion: string;
  comuna: string;
  tipologia: string;
  precio: number;
  unidad: string;
  m2: number;
  orientacion: string;
  estacionamiento: number;
  bodega: number;
  gc: number;
  aceptaMascotas: boolean;
  linkListing: string;
  estado: string;
  promociones: string[];
  descuento: number;
  mesesDescuento: number;
  amenities: string[];
  gallery: string[];
}

class CSVDataProcessor {
  private csvPath: string;
  private csvData: CSVUnit[] = [];
  private condominios: Map<string, CondominioData> = new Map();

  constructor() {
    this.csvPath = path.join(process.cwd(), 'data', 'sources', 'assetplan-export-updated.csv');
  }

  async loadCSVData(): Promise<void> {
    try {
      const csvContent = fs.readFileSync(this.csvPath, 'utf-8');
      const lines = csvContent.split('\n').filter(line => line.trim());
      const headers = lines[0].split(';');

      // Mapear índices de columnas
      const indices = {
        especial: headers.findIndex(h => h === 'Especial'),
        op: headers.findIndex(h => h === 'OP'),
        direccion: headers.findIndex(h => h === 'Direccion'),
        comuna: headers.findIndex(h => h === 'Comuna'),
        condominio: headers.findIndex(h => h === 'Condominio'),
        tipologia: headers.findIndex(h => h === 'Tipologia'),
        arriendoTotal: headers.findIndex(h => h === 'Arriendo Total'),
        unidad: headers.findIndex(h => h === 'Unidad'),
        m2Depto: headers.findIndex(h => h === 'm2 Depto'),
        orientacion: headers.findIndex(h => h === 'Orientacion'),
        estacionamiento: headers.findIndex(h => h === 'Estac'),
        bodega: headers.findIndex(h => h === 'Bod'),
        gcTotal: headers.findIndex(h => h === 'GC Total'),
        aceptaMascotas: headers.findIndex(h => h === 'Acepta Mascotas?'),
        linkListing: headers.findIndex(h => h === 'Link Listing'),
        estado: headers.findIndex(h => h === 'Estado'),
        tremendaPromo: headers.findIndex(h => h === 'Tremenda promo'),
        descuento: headers.findIndex(h => h === '% Descuento'),
        mesesDescuento: headers.findIndex(h => h === 'Cant. Meses Descuento'),
      };

      // Procesar líneas de datos
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const values = line.split(';');

        if (values.length < Math.max(...Object.values(indices)) + 1) {
          continue; // Línea incompleta
        }

        const unit: CSVUnit = {
          op: values[indices.op]?.trim() || '',
          direccion: values[indices.direccion]?.trim() || '',
          comuna: values[indices.comuna]?.trim() || '',
          condominio: values[indices.condominio]?.trim() || '',
          tipologia: values[indices.tipologia]?.trim() || '',
          arriendoTotal: this.parsePrice(values[indices.arriendoTotal]),
          unidad: values[indices.unidad]?.trim() || '',
          m2Depto: this.parseNumber(values[indices.m2Depto]),
          orientacion: values[indices.orientacion]?.trim() || '',
          estacionamiento: this.parseNumber(values[indices.estacionamiento]),
          bodega: this.parseNumber(values[indices.bodega]),
          gcTotal: this.parsePrice(values[indices.gcTotal]),
          aceptaMascotas: values[indices.aceptaMascotas]?.toLowerCase() === 'si',
          linkListing: values[indices.linkListing]?.trim() || '',
          estado: values[indices.estado]?.trim() || '',
          especial: values[indices.especial]?.toLowerCase() === 'si',
          tremendaPromo: values[indices.tremendaPromo]?.toLowerCase() === 'si',
          descuento: this.parseNumber(values[indices.descuento]),
          mesesDescuento: this.parseNumber(values[indices.mesesDescuento]),
        };

        this.csvData.push(unit);
      }

      logger.log(`📊 CSV cargado: ${this.csvData.length} unidades`);
    } catch (error) {
      logger.error('❌ Error cargando CSV:', error);
      throw error;
    }
  }

  private parsePrice(value: string): number {
    if (!value) return 0;
    // Remover caracteres no numéricos excepto puntos y comas
    const cleanValue = value.replace(/[^\d.,]/g, '');
    // Convertir formato chileno (1.234.567) a número
    return parseInt(cleanValue.replace(/\./g, '')) || 0;
  }

  private parseNumber(value: string): number {
    if (!value) return 0;
    return parseInt(value.replace(/[^\d]/g, '')) || 0;
  }

  async processCondominios(): Promise<void> {
    // Agrupar unidades por condominio
    const condominiosMap = new Map<string, CSVUnit[]>();

    this.csvData.forEach(unit => {
      if (unit.condominio) {
        if (!condominiosMap.has(unit.condominio)) {
          condominiosMap.set(unit.condominio, []);
        }
        condominiosMap.get(unit.condominio)!.push(unit);
      }
    });

    // Procesar cada condominio
    condominiosMap.forEach((unidades, condominioNombre) => {
      const precios = unidades.map(u => u.arriendoTotal).filter(p => p > 0);
      const tipologias = [...new Set(unidades.map(u => u.tipologia).filter(t => t))];
      // Considerar disponibles las unidades con estado vacío o "disponible"
      const unidadesDisponibles = unidades.filter(u => 
        !u.estado || u.estado.toLowerCase() === 'disponible'
      ).length;
      const tienePromociones = unidades.some(u => u.especial || u.tremendaPromo || u.descuento > 0);
      const aceptaMascotas = unidades.some(u => u.aceptaMascotas);

      // Generar promociones
      const promociones: string[] = [];
      if (tienePromociones) {
        if (unidades.some(u => u.tremendaPromo)) {
          promociones.push('Tremenda Promo');
        }
        if (unidades.some(u => u.descuento > 0)) {
          const maxDescuento = Math.max(...unidades.map(u => u.descuento));
          promociones.push(`${maxDescuento}% Descuento`);
        }
        if (unidades.some(u => u.especial)) {
          promociones.push('Oferta Especial');
        }
      }

      // Generar amenities basados en características del condominio
      const amenities: string[] = [];
      if (aceptaMascotas) amenities.push('Pet Friendly');
      if (unidades.some(u => u.estacionamiento > 0)) amenities.push('Estacionamiento');
      if (unidades.some(u => u.bodega > 0)) amenities.push('Bodega');
      if (tipologias.length > 2) amenities.push('Múltiples Tipologías');
      amenities.push('Seguridad 24/7', 'Áreas Comunes');

      const condominioData: CondominioData = {
        id: this.generateSlug(condominioNombre),
        nombre: condominioNombre,
        direccion: unidades[0]?.direccion || '',
        comuna: unidades[0]?.comuna || '',
        unidades,
        tipologias,
        precioDesde: precios.length > 0 ? Math.min(...precios) : 0,
        precioHasta: precios.length > 0 ? Math.max(...precios) : 0,
        precioPromedio: precios.length > 0 ? precios.reduce((a, b) => a + b, 0) / precios.length : 0,
        totalUnidades: unidades.length,
        unidadesDisponibles,
        tienePromociones,
        promociones,
        aceptaMascotas,
        amenities,
      };

      this.condominios.set(condominioNombre, condominioData);
    });

    logger.log(`🏢 Condominios procesados: ${this.condominios.size}`);
  }

  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  getLandingBuildings(): LandingBuilding[] {
    const buildings: LandingBuilding[] = [];

    this.condominios.forEach((condominio) => {
      if (condominio.unidadesDisponibles > 0) {
        const typologySummary = condominio.tipologias.map(tipologia => {
          const unidadesTipologia = condominio.unidades.filter(u => u.tipologia === tipologia);
          const preciosTipologia = unidadesTipologia.map(u => u.arriendoTotal).filter(p => p > 0);
          return {
            key: tipologia,
            label: tipologia,
            count: unidadesTipologia.length,
            minPrice: preciosTipologia.length > 0 ? Math.min(...preciosTipologia) : 0,
          };
        });

        const building: LandingBuilding = {
          id: condominio.id,
          slug: condominio.id,
          name: condominio.nombre,
          comuna: condominio.comuna,
          address: condominio.direccion,
          coverImage: this.getCoverImage(condominio.comuna),
          gallery: this.getGallery(condominio.comuna),
          precioDesde: condominio.precioDesde,
          hasAvailability: condominio.unidadesDisponibles > 0,
          badges: condominio.promociones.map(promo => ({
            type: 'promotion',
            label: promo,
            description: promo,
          })),
          amenities: condominio.amenities.slice(0, 6),
          typologySummary,
        };

        buildings.push(building);
      }
    });

    // Ordenar por precio desde menor a mayor
    return buildings.sort((a, b) => a.precioDesde - b.precioDesde);
  }

  getCondominioBySlug(slug: string): CondominioData | null {
    for (const condominio of this.condominios.values()) {
      if (condominio.id === slug) {
        return condominio;
      }
    }
    return null;
  }

  getUnitByOP(op: string): CSVUnit | null {
    return this.csvData.find(unit => unit.op === op) || null;
  }

  getUnitsByCondominio(condominioSlug: string): CSVUnit[] {
    const condominio = this.getCondominioBySlug(condominioSlug);
    return condominio ? condominio.unidades : [];
  }

  private getCoverImage(comuna: string): string {
    // Mapear comunas a imágenes de portada
    const comunaImages: Record<string, string> = {
      'Las Condes': '/images/lascondes-cover.jpg',
      'Providencia': '/images/providencia-cover.jpg',
      'Ñuñoa': '/images/nunoa-cover.jpg',
      'Santiago': '/images/santiago-cover.jpg',
      'La Florida': '/images/laflorida-cover.jpg',
      'Estación Central': '/images/estacioncentral-cover.jpg',
      'San Miguel': '/images/sanmiguel-cover.jpg',
      'Independencia': '/images/independencia-cover.jpg',
    };

    return comunaImages[comuna] || '/images/default-cover.jpg';
  }

  private getGallery(comuna: string): string[] {
    // Galería de imágenes por comuna
    const comunaGalleries: Record<string, string[]> = {
      'Las Condes': [
        '/images/lascondes-1.jpg',
        '/images/lascondes-2.jpg',
        '/images/lascondes-3.jpg',
      ],
      'Providencia': [
        '/images/providencia-1.jpg',
        '/images/providencia-2.jpg',
        '/images/providencia-3.jpg',
      ],
      'Ñuñoa': [
        '/images/nunoa-1.jpg',
        '/images/nunoa-2.jpg',
        '/images/nunoa-3.jpg',
      ],
    };

    return comunaGalleries[comuna] || [
      '/images/default-1.jpg',
      '/images/default-2.jpg',
      '/images/default-3.jpg',
    ];
  }

  async initialize(): Promise<void> {
    await this.loadCSVData();
    await this.processCondominios();
  }
}

// Instancia singleton
let processor: CSVDataProcessor | null = null;

export async function getCSVProcessor(): Promise<CSVDataProcessor> {
  if (!processor) {
    processor = new CSVDataProcessor();
    await processor.initialize();
  }
  return processor;
}

export { CSVDataProcessor };
