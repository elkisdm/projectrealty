import type { Building, Unit, PromotionBadge } from "@schemas/models";
import { PromotionType } from "@schemas/models";
import { deriveBuildingAggregates } from "./derive";
import type { LucideIcon } from "lucide-react";

/**
 * Tipos de tags disponibles
 */
export type PropertyTagType = 
  | "exclusivo" 
  | "price_drop" 
  | "coming_soon" 
  | "recently_published";

/**
 * Configuración de un tag
 */
export interface PropertyTag {
  type: PropertyTagType;
  label: string;
  color: string; // Tailwind gradient classes
  icon?: LucideIcon;
}

/**
 * Determina si una unidad o edificio tiene promoción de comisión gratuita
 */
function hasFreeCommission(building: Building, unit?: Unit): boolean {
  // Verificar badges del building
  const buildingHasFreeCommission = building.badges?.some(
    (badge: PromotionBadge) => badge.type === PromotionType.FREE_COMMISSION
  ) ?? false;

  // Verificar promotions de la unidad
  const unitHasFreeCommission = unit?.promotions?.some(
    (promo: PromotionBadge) => promo.type === PromotionType.FREE_COMMISSION
  ) ?? false;

  // Verificar si algún badge tiene label que indique comisión gratuita
  const hasFreeCommissionLabel = building.badges?.some(
    (badge: PromotionBadge) => 
      badge.label.toLowerCase().includes("0% comisión") ||
      badge.label.toLowerCase().includes("sin comisión") ||
      badge.label.toLowerCase().includes("comisión gratis")
  ) ?? false;

  return buildingHasFreeCommission || unitHasFreeCommission || hasFreeCommissionLabel;
}

/**
 * Determina si el building tiene badge "Exclusivo"
 */
function hasExclusiveBadge(building: Building): boolean {
  return building.badges?.some(
    (badge: PromotionBadge) => 
      badge.label.toLowerCase().includes("exclusivo") ||
      badge.tag?.toLowerCase().includes("exclusivo")
  ) ?? false;
}

/**
 * Determina si una propiedad es "Exclusivo" basado en criterios
 */
function isExclusive(building: Building, unit?: Unit): boolean {
  // Criterio 1: Building tiene featured: true
  const buildingWithAggregates = deriveBuildingAggregates(building);
  if (buildingWithAggregates.featured) {
    return true;
  }

  // Criterio 2: Unit o Building tiene promoción de comisión gratuita
  if (hasFreeCommission(building, unit)) {
    return true;
  }

  // Criterio 3: Building tiene badge con label que contiene "Exclusivo" o "0% comisión"
  if (hasExclusiveBadge(building)) {
    return true;
  }

  return false;
}

/**
 * Determina si una unidad está "Em breve" (disponible pronto)
 * Basado en estado "RE - Acondicionamiento" desde AssetPlan
 */
function isComingSoon(unit?: Unit): boolean {
  if (!unit) return false;

  // Verificar campo estado con valor "RE - Acondicionamiento"
  if (unit.estado === "RE - Acondicionamiento") {
    return true;
  }

  // Verificar campo estadoRaw (preservado desde AssetPlan)
  const estadoRaw = (unit as { estadoRaw?: string }).estadoRaw;
  if (estadoRaw) {
    const estadoLower = estadoRaw.toLowerCase();
    if (
      estadoLower.includes("re - acondicionamiento") ||
      estadoLower.includes("reacondicionamiento") ||
      estadoLower.includes("acondicionamiento")
    ) {
      return true;
    }
  }

  // Verificar si disponible es true pero status no es "available" (puede estar en reacondicionamiento)
  // Esto es un fallback si el estado no está bien mapeado
  if (unit.disponible && unit.status !== "available" && unit.status !== "reserved" && unit.status !== "rented") {
    return true;
  }

  return false;
}

/**
 * Obtiene los tags aplicables para una propiedad
 * 
 * @param building - Edificio de la propiedad
 * @param unit - Unidad específica (opcional)
 * @returns Array de tags aplicables
 */
export function getPropertyTags(building: Building, unit?: Unit): PropertyTag[] {
  const tags: PropertyTag[] = [];

  // Tag "Exclusivo" (verde)
  if (isExclusive(building, unit)) {
    tags.push({
      type: "exclusivo",
      label: "Exclusivo",
      color: "from-green-500 to-emerald-500",
    });
  }

  // TODO: Implementar tag "Baixou o preço" (naranja) cuando se implemente detección de caída de precio
  // if (hasPriceDrop(building, unit)) {
  //   tags.push({
  //     type: "price_drop",
  //     label: "Baixou o preço",
  //     color: "from-orange-500 to-red-500",
  //   });
  // }

  // Tag "Em breve" (amarillo) - Disponible pronto
  if (isComingSoon(unit)) {
    tags.push({
      type: "coming_soon",
      label: "Em breve",
      color: "from-yellow-500 to-amber-500",
    });
  }

  // TODO: Implementar tag "Publicado há X horas" cuando se implemente timestamp de publicación
  // const publishedHours = getPublishedHours(building, unit);
  // if (publishedHours !== null && publishedHours < 24) {
  //   tags.push({
  //     type: "recently_published",
  //     label: `Publicado há ${publishedHours} horas`,
  //     color: "from-blue-500 to-cyan-500",
  //   });
  // }

  return tags;
}

