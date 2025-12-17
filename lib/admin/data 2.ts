import type { Building, Unit } from "@schemas/models";
import { BuildingSchema, UnitSchema } from "@schemas/models";
import { createSupabaseClient } from "@lib/supabase.mock";

/**
 * Funciones de escritura para el panel de administración
 * Estas funciones permiten crear, actualizar y eliminar edificios y unidades
 */

/**
 * Crea un nuevo edificio en la base de datos
 */
export async function createBuilding(building: Building): Promise<Building> {
  // Validar con Zod
  const validated = BuildingSchema.parse(building);

  const supabase = createSupabaseClient();

  // Transformar al formato de la base de datos
  const buildingData = {
    id: validated.id,
    slug: validated.slug,
    nombre: validated.name,
    comuna: validated.comuna,
    direccion: validated.address,
    amenities: validated.amenities || [],
    gallery: validated.gallery || [],
    cover_image: validated.coverImage,
    badges: validated.badges || [],
    service_level: validated.serviceLevel,
    precio_desde: validated.precio_desde,
    precio_hasta: validated.precio_hasta,
    gc_mode: validated.gc_mode,
    featured: validated.featured,
    provider: "assetplan",
    source_building_id: validated.id,
    has_availability: validated.hasAvailability || false,
  };

  const result = await supabase
    .from("buildings")
    .insert(buildingData)
    .select()
    .single();
  
  const data = 'data' in result ? result.data : null;
  const error = 'error' in result ? result.error : null;

  if (error) {
    throw new Error(`Error al crear edificio: ${error.message}`);
  }

  // Crear unidades asociadas
  if (validated.units && validated.units.length > 0) {
    const unitsData = validated.units.map((unit) => ({
      id: unit.id,
      building_id: validated.id,
      tipologia: unit.tipologia,
      area_m2: unit.m2,
      area_interior_m2: unit.area_interior_m2,
      area_exterior_m2: unit.area_exterior_m2,
      precio: unit.price,
      gastos_comunes: unit.gastosComunes || null,
      estacionamiento: unit.estacionamiento,
      bodega: unit.bodega,
      disponible: unit.disponible,
      bedrooms: unit.bedrooms,
      bathrooms: unit.bathrooms,
      orientacion: unit.orientacion,
      piso: unit.piso,
      amoblado: unit.amoblado,
      pet_friendly: unit.petFriendly,
      parking_ids: unit.parking_ids,
      storage_ids: unit.storage_ids,
      parking_opcional: unit.parking_opcional,
      storage_opcional: unit.storage_opcional,
      guarantee_installments: unit.guarantee_installments,
      guarantee_months: unit.guarantee_months,
      rentas_necesarias: unit.rentas_necesarias,
      renta_minima: unit.renta_minima,
      provider: "assetplan",
      source_unit_id: unit.id,
      status: unit.status || "available",
    }));

    const unitsResult = await supabase.from("units").insert(unitsData);
    const unitsError = 'error' in unitsResult ? unitsResult.error : null;

    if (unitsError) {
      // Si falla la inserción de unidades, intentar eliminar el edificio creado
      await supabase.from("buildings").delete().eq("id", validated.id);
      throw new Error(`Error al crear unidades: ${unitsError.message}`);
    }
  }

  return validated;
}

/**
 * Actualiza un edificio existente
 */
export async function updateBuilding(
  id: string,
  updates: Partial<Building>
): Promise<Building> {
  const supabase = createSupabaseClient();

  // Obtener el edificio actual
  const fetchResult = await supabase
    .from("buildings")
    .select("*")
    .eq("id", id)
    .single();
  
  const current = 'data' in fetchResult ? fetchResult.data : null;
  const fetchError = 'error' in fetchResult ? fetchResult.error : null;

  if (fetchError || !current) {
    throw new Error(`Edificio no encontrado: ${id}`);
  }

  // Construir el edificio actualizado
  const updatedBuilding: Building = {
    id: current.id,
    slug: updates.slug ?? current.slug,
    name: updates.name ?? current.nombre,
    comuna: updates.comuna ?? current.comuna,
    address: updates.address ?? current.direccion,
    amenities: updates.amenities ?? current.amenities ?? [],
    gallery: updates.gallery ?? current.gallery ?? [],
    coverImage: updates.coverImage ?? current.cover_image,
    badges: updates.badges ?? current.badges ?? [],
    serviceLevel: updates.serviceLevel ?? current.service_level,
    units: current.units || [],
    precio_desde: updates.precio_desde ?? current.precio_desde,
    precio_hasta: updates.precio_hasta ?? current.precio_hasta,
    gc_mode: updates.gc_mode ?? current.gc_mode,
    featured: updates.featured ?? current.featured,
    hasAvailability: updates.hasAvailability ?? current.has_availability,
  };

  // Validar con Zod
  const validated = BuildingSchema.parse(updatedBuilding);

  // Actualizar en la base de datos
  const buildingData = {
    slug: validated.slug,
    nombre: validated.name,
    comuna: validated.comuna,
    direccion: validated.address,
    amenities: validated.amenities,
    gallery: validated.gallery,
    cover_image: validated.coverImage,
    badges: validated.badges,
    service_level: validated.serviceLevel,
    precio_desde: validated.precio_desde,
    precio_hasta: validated.precio_hasta,
    gc_mode: validated.gc_mode,
    featured: validated.featured,
    has_availability: validated.hasAvailability,
    updated_at: new Date().toISOString(),
  };

  const updateResult = await supabase
    .from("buildings")
    .update(buildingData)
    .eq("id", id);
  
  const error = 'error' in updateResult ? updateResult.error : null;

  if (error) {
    throw new Error(`Error al actualizar edificio: ${error.message}`);
  }

  return validated;
}

/**
 * Elimina un edificio y todas sus unidades asociadas
 */
export async function deleteBuilding(id: string): Promise<void> {
  const supabase = createSupabaseClient();

  // Eliminar unidades primero (por la relación CASCADE)
  const unitsDeleteResult = await supabase
    .from("units")
    .delete()
    .eq("building_id", id);
  
  const unitsError = 'error' in unitsDeleteResult ? unitsDeleteResult.error : null;

  if (unitsError) {
    throw new Error(`Error al eliminar unidades: ${unitsError.message}`);
  }

  // Eliminar el edificio
  const deleteResult = await supabase.from("buildings").delete().eq("id", id);
  const error = 'error' in deleteResult ? deleteResult.error : null;

  if (error) {
    throw new Error(`Error al eliminar edificio: ${error.message}`);
  }
}

/**
 * Crea una nueva unidad
 */
export async function createUnit(unit: Unit, buildingId: string): Promise<Unit> {
  // Validar con Zod
  const validated = UnitSchema.parse(unit);

  const supabase = createSupabaseClient();

  // Verificar que el edificio existe
  const buildingFetchResult = await supabase
    .from("buildings")
    .select("id")
    .eq("id", buildingId)
    .single();
  
  const building = 'data' in buildingFetchResult ? buildingFetchResult.data : null;
  const buildingError = 'error' in buildingFetchResult ? buildingFetchResult.error : null;

  if (buildingError || !building) {
    throw new Error(`Edificio no encontrado: ${buildingId}`);
  }

  const unitData = {
    id: validated.id,
    building_id: buildingId,
    tipologia: validated.tipologia,
    area_m2: validated.m2,
    area_interior_m2: validated.area_interior_m2,
    area_exterior_m2: validated.area_exterior_m2,
    precio: validated.price,
    gastos_comunes: validated.gastosComunes || null,
    estacionamiento: validated.estacionamiento,
    bodega: validated.bodega,
    disponible: validated.disponible,
    bedrooms: validated.bedrooms,
    bathrooms: validated.bathrooms,
    orientacion: validated.orientacion,
    piso: validated.piso,
    amoblado: validated.amoblado,
    pet_friendly: validated.petFriendly,
    parking_ids: validated.parking_ids,
    storage_ids: validated.storage_ids,
    parking_opcional: validated.parking_opcional,
    storage_opcional: validated.storage_opcional,
    guarantee_installments: validated.guarantee_installments,
    guarantee_months: validated.guarantee_months,
    rentas_necesarias: validated.rentas_necesarias,
    renta_minima: validated.renta_minima,
    provider: "assetplan",
    source_unit_id: validated.id,
    status: validated.status || "available",
  };

  const insertResult = await supabase.from("units").insert(unitData).select().single();
  const error = 'error' in insertResult ? insertResult.error : null;

  if (error) {
    throw new Error(`Error al crear unidad: ${error.message}`);
  }

  return validated;
}

/**
 * Actualiza una unidad existente
 */
export async function updateUnit(id: string, updates: Partial<Unit>): Promise<Unit> {
  const supabase = createSupabaseClient();

  // Obtener la unidad actual
  const fetchResult = await supabase
    .from("units")
    .select("*")
    .eq("id", id)
    .single();
  
  const current = 'data' in fetchResult ? fetchResult.data : null;
  const fetchError = 'error' in fetchResult ? fetchResult.error : null;

  if (fetchError || !current) {
    throw new Error(`Unidad no encontrada: ${id}`);
  }

  // Construir la unidad actualizada
  const tipologia = updates.tipologia ?? current.tipologia ?? 'Studio';
  const buildingId = current.building_id || current.id.split('-')[0] || current.id;
  const codigoUnidad = current.codigo_unidad || current.id.substring(0, 8);
  const slug = current.slug || `${buildingId}-${tipologia.toLowerCase()}-${current.id.substring(0, 8)}`;
  
  const updatedUnit: Unit = {
    id: current.id,
    slug,
    codigoUnidad,
    buildingId,
    tipologia,
    price: updates.price ?? current.precio ?? 0,
    disponible: updates.disponible ?? current.disponible ?? true,
    dormitorios: updates.bedrooms ?? current.bedrooms ?? (tipologia === 'Studio' || tipologia === 'Estudio' ? 0 : parseInt(tipologia[0]) || 1),
    banos: updates.bathrooms ?? current.bathrooms ?? 1,
    garantia: updates.price ?? current.precio ?? 0,
    m2: updates.m2 ?? current.area_m2 ?? 50,
    estacionamiento: updates.estacionamiento ?? current.estacionamiento ?? false,
    bodega: updates.bodega ?? current.bodega ?? false,
    bedrooms: updates.bedrooms ?? current.bedrooms,
    bathrooms: updates.bathrooms ?? current.bathrooms,
    area_interior_m2: updates.area_interior_m2 ?? current.area_interior_m2,
    area_exterior_m2: updates.area_exterior_m2 ?? current.area_exterior_m2,
    orientacion: updates.orientacion ?? current.orientacion,
    piso: updates.piso ?? current.piso,
    amoblado: updates.amoblado ?? current.amoblado,
    petFriendly: updates.petFriendly ?? current.pet_friendly,
    parking_ids: updates.parking_ids ?? current.parking_ids,
    storage_ids: updates.storage_ids ?? current.storage_ids,
    parking_opcional: updates.parking_opcional ?? current.parking_opcional,
    storage_opcional: updates.storage_opcional ?? current.storage_opcional,
    guarantee_installments:
      updates.guarantee_installments ?? current.guarantee_installments,
    guarantee_months: updates.guarantee_months ?? current.guarantee_months,
    rentas_necesarias: updates.rentas_necesarias ?? current.rentas_necesarias,
    renta_minima: updates.renta_minima ?? current.renta_minima,
    status: updates.status ?? current.status,
  };

  // Validar con Zod
  const validated = UnitSchema.parse(updatedUnit);

  // Actualizar en la base de datos
  const unitData = {
    tipologia: validated.tipologia,
    area_m2: validated.m2,
    area_interior_m2: validated.area_interior_m2,
    area_exterior_m2: validated.area_exterior_m2,
    precio: validated.price,
    estacionamiento: validated.estacionamiento,
    bodega: validated.bodega,
    disponible: validated.disponible,
    bedrooms: validated.bedrooms,
    bathrooms: validated.bathrooms,
    orientacion: validated.orientacion,
    piso: validated.piso,
    amoblado: validated.amoblado,
    pet_friendly: validated.petFriendly,
    parking_ids: validated.parking_ids,
    storage_ids: validated.storage_ids,
    parking_opcional: validated.parking_opcional,
    storage_opcional: validated.storage_opcional,
    guarantee_installments: validated.guarantee_installments,
    guarantee_months: validated.guarantee_months,
    rentas_necesarias: validated.rentas_necesarias,
    renta_minima: validated.renta_minima,
    status: validated.status,
    updated_at: new Date().toISOString(),
  };

  const updateResult = await supabase.from("units").update(unitData).eq("id", id);
  const error = 'error' in updateResult ? updateResult.error : null;

  if (error) {
    throw new Error(`Error al actualizar unidad: ${error.message}`);
  }

  return validated;
}

/**
 * Elimina una unidad
 */
export async function deleteUnit(id: string): Promise<void> {
  const supabase = createSupabaseClient();

  const deleteResult = await supabase.from("units").delete().eq("id", id);
  const error = 'error' in deleteResult ? deleteResult.error : null;

  if (error) {
    throw new Error(`Error al eliminar unidad: ${error.message}`);
  }
}

