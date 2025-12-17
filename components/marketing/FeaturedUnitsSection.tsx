import { getFeaturedUnits } from '@lib/hooks/useFeaturedUnits';
import { FeaturedUnitsGridClient } from './FeaturedUnitsGridClient';
import type { UnitWithBuilding } from '@lib/hooks/useFeaturedUnits';

/**
 * Server Component que contiene múltiples grids de unidades destacadas
 * Cada grid muestra unidades según diferentes filtros (comuna, dormitorios, precio, featured)
 */
export async function FeaturedUnitsSection() {
  // Obtener unidades para cada grid en paralelo
  const [
    nunoaUnits,
    lasCondesUnits,
    providenciaUnits,
    dorm1Units,
    dorm2Units,
    economicUnits,
    featuredUnits,
  ] = await Promise.all([
    getFeaturedUnits({ type: 'comuna', value: 'Ñuñoa' }, 6),
    getFeaturedUnits({ type: 'comuna', value: 'Las Condes' }, 6),
    getFeaturedUnits({ type: 'comuna', value: 'Providencia' }, 6),
    getFeaturedUnits({ type: 'dormitorios', value: '1' }, 6),
    getFeaturedUnits({ type: 'dormitorios', value: '2' }, 6),
    getFeaturedUnits({ type: 'precio', value: 800000 }, 6),
    getFeaturedUnits({ type: 'featured', value: 'featured' }, 6),
  ]);

  // Debug: Log para verificar qué se está obteniendo
  console.log('[FeaturedUnitsSection] Unidades encontradas:', {
    nunoa: nunoaUnits.length,
    lasCondes: lasCondesUnits.length,
    providencia: providenciaUnits.length,
    dorm1: dorm1Units.length,
    dorm2: dorm2Units.length,
    economic: economicUnits.length,
    featured: featuredUnits.length,
  });

  // Solo mostrar grids que tengan unidades
  const grids: Array<{
    title: string;
    units: UnitWithBuilding[];
    filterType: 'comuna' | 'dormitorios' | 'precio' | 'featured';
    filterValue: string | number;
  }> = [];

  if (nunoaUnits.length > 0) {
    grids.push({
      title: 'Departamentos en Ñuñoa',
      units: nunoaUnits,
      filterType: 'comuna',
      filterValue: 'Ñuñoa',
    });
  }

  if (lasCondesUnits.length > 0) {
    grids.push({
      title: 'Departamentos en Las Condes',
      units: lasCondesUnits,
      filterType: 'comuna',
      filterValue: 'Las Condes',
    });
  }

  if (providenciaUnits.length > 0) {
    grids.push({
      title: 'Departamentos en Providencia',
      units: providenciaUnits,
      filterType: 'comuna',
      filterValue: 'Providencia',
    });
  }

  if (dorm1Units.length > 0) {
    grids.push({
      title: 'Departamentos 1 dormitorio',
      units: dorm1Units,
      filterType: 'dormitorios',
      filterValue: '1',
    });
  }

  if (dorm2Units.length > 0) {
    grids.push({
      title: 'Departamentos 2 dormitorios',
      units: dorm2Units,
      filterType: 'dormitorios',
      filterValue: '2',
    });
  }

  if (economicUnits.length > 0) {
    grids.push({
      title: 'Departamentos económicos',
      units: economicUnits,
      filterType: 'precio',
      filterValue: 800000,
    });
  }

  if (featuredUnits.length > 0) {
    grids.push({
      title: 'Propiedades destacadas',
      units: featuredUnits,
      filterType: 'featured',
      filterValue: 'featured',
    });
  }

  // TEMPORAL: Si no hay grids pero hay unidades disponibles, crear un grid genérico
  if (grids.length === 0) {
    // Recopilar todas las unidades disponibles de todos los filtros
    const allAvailableUnits = [
      ...nunoaUnits,
      ...lasCondesUnits,
      ...providenciaUnits,
      ...dorm1Units,
      ...dorm2Units,
      ...economicUnits,
      ...featuredUnits,
    ];

    // Eliminar duplicados por ID de unidad
    const uniqueUnits = Array.from(
      new Map(allAvailableUnits.map(item => [item.unit.id, item])).values()
    );

    if (uniqueUnits.length > 0) {
      // Si hay unidades disponibles pero ningún grid específico, crear un grid genérico
      grids.push({
        title: 'Departamentos disponibles',
        units: uniqueUnits.slice(0, 12),
        filterType: 'featured',
        filterValue: 'featured',
      });
    } else {
      // TEMPORAL: Mostrar información de debug
      console.error('[FeaturedUnitsSection] No hay grids. Unidades encontradas:', {
        nunoa: nunoaUnits.length,
        lasCondes: lasCondesUnits.length,
        providencia: providenciaUnits.length,
        dorm1: dorm1Units.length,
        dorm2: dorm2Units.length,
        economic: economicUnits.length,
        featured: featuredUnits.length,
      });

      return null;
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
      <div className="space-y-16">
        {grids.map((grid) => (
          <FeaturedUnitsGridClient
            key={grid.title}
            title={grid.title}
            units={grid.units}
            filterType={grid.filterType}
            filterValue={grid.filterValue}
          />
        ))}
      </div>
    </section>
  );
}



