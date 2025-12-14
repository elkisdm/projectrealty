"use client";
import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Building, Unit } from "@schemas/models";

interface PropertyBreadcrumbProps {
  building: Building;
  unit?: Unit;
  variant?: "catalog" | "marketing" | "admin";
}

interface BreadcrumbItem {
  label: string;
  href: string | null; // null para último item (no clickeable)
  ariaLabel?: string;
}

export function PropertyBreadcrumb({ building, unit, variant = "catalog" }: PropertyBreadcrumbProps) {
  const getBreadcrumbItems = (): BreadcrumbItem[] => {
    // Estructura según especificación: Home > Arriendo Departamentos > [Comuna] > [Edificio] > [Tipología]
    const baseUrl = typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'http://localhost:3000';

    const items: BreadcrumbItem[] = [
      { label: "Home", href: "/", ariaLabel: "Ir al inicio" },
      { label: "Arriendo Departamentos", href: "/buscar", ariaLabel: "Ver departamentos en arriendo" },
      {
        label: building.comuna || "Santiago",
        href: `/buscar?comuna=${encodeURIComponent(building.comuna || "Santiago")}`,
        ariaLabel: `Ver departamentos en ${building.comuna}`
      },
      {
        label: building.name,
        href: `/property/${building.slug}`,
        ariaLabel: `Ver detalles de ${building.name}`
      }
    ];

    // Agregar tipología de la unidad si está disponible
    if (unit?.tipologia) {
      // Convertir tipología a formato legible
      const tipologiaLabel = unit.tipologia === "Studio" || unit.tipologia === "Estudio"
        ? "Estudio"
        : unit.tipologia;
      items.push({
        label: tipologiaLabel,
        href: null, // Último item, no clickeable
        ariaLabel: `Tipología ${tipologiaLabel}`
      });
    } else if (building.units && building.units.length > 0) {
      // Fallback: usar primera unidad del edificio
      const firstUnit = building.units[0];
      if (firstUnit?.tipologia) {
        const tipologiaLabel = firstUnit.tipologia === "Studio" || firstUnit.tipologia === "Estudio"
          ? "Estudio"
          : firstUnit.tipologia;
        items.push({
          label: tipologiaLabel,
          href: null,
          ariaLabel: `Tipología ${tipologiaLabel}`
        });
      } else {
        // Último fallback: "Departamento"
        items.push({
          label: "Departamento",
          href: null,
          ariaLabel: "Departamento"
        });
      }
    } else {
      // Último fallback: "Departamento"
      items.push({
        label: "Departamento",
        href: null,
        ariaLabel: "Departamento"
      });
    }

    // Variantes especiales (mantener compatibilidad)
    if (variant === "marketing") {
      return [
        { label: "Home", href: "/", ariaLabel: "Ir al inicio" },
        { label: "Arrienda sin comisión", href: "/arrienda-sin-comision", ariaLabel: "Ver arriendos sin comisión" },
        { label: building.name, href: null, ariaLabel: building.name }
      ];
    }

    if (variant === "admin") {
      return [
        { label: "Admin", href: "/admin", ariaLabel: "Panel de administración" },
        { label: "Propiedades", href: "/admin/properties", ariaLabel: "Gestionar propiedades" },
        { label: building.name, href: null, ariaLabel: building.name }
      ];
    }

    return items;
  };

  const breadcrumbItems = getBreadcrumbItems();

  return (
    <nav
      aria-label="Navegación de migas de pan"
      className="mb-4 lg:mb-6"
    >
      <ol className="flex items-center flex-wrap gap-2 text-sm text-text-muted">
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;

          return (
            <React.Fragment key={`${item.label}-${index}`}>
              <li>
                {item.href ? (
                  <Link
                    href={item.href}
                    className="hover:text-text transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8B6CFF] focus-visible:rounded"
                    aria-label={item.ariaLabel || item.label}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className="text-text font-medium"
                    aria-current="page"
                    aria-label={item.ariaLabel || item.label}
                  >
                    {item.label}
                  </span>
                )}
              </li>
              {!isLast && (
                <li>
                  <ChevronRight className="w-4 h-4 text-text-muted" aria-hidden="true" />
                </li>
              )}
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}









