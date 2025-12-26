"use client";
import React, { useState, useEffect } from "react";
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
    // Estructura mejorada según QuintoAndar: Home > Región > Comuna > Dirección > Edificio > Tipología
    const baseUrl = typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'http://localhost:3000';

    const items: BreadcrumbItem[] = [
      { label: "Home", href: "/", ariaLabel: "Ir al inicio" },
      { label: "Arriendo Departamentos", href: "/buscar", ariaLabel: "Ver departamentos en arriendo" }
    ];

    // Añadir región si está disponible
    if (building.region) {
      items.push({
        label: building.region,
        href: `/buscar?region=${encodeURIComponent(building.region)}`,
        ariaLabel: `Ver departamentos en ${building.region}`
      });
    }

    // Añadir comuna
    items.push({
      label: building.comuna || "Santiago",
      href: `/buscar?comuna=${encodeURIComponent(building.comuna || "Santiago")}`,
      ariaLabel: `Ver departamentos en ${building.comuna}`
    });

    // Añadir dirección si está disponible
    if (building.address) {
      items.push({
        label: building.address,
        href: `/buscar?direccion=${encodeURIComponent(building.address)}`,
        ariaLabel: `Ver departamentos en ${building.address}`
      });
    }

    // Añadir edificio
    items.push({
      label: building.name,
      href: `/property/${building.slug}`,
      ariaLabel: `Ver detalles de ${building.name}`
    });

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
      
      // Opcionalmente añadir código de unidad si está disponible
      if (unit.codigoUnidad) {
        items.push({
          label: unit.codigoUnidad,
          href: null,
          ariaLabel: `Unidad ${unit.codigoUnidad}`
        });
      }
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
  const [isMobile, setIsMobile] = useState(false);
  const [showFullBreadcrumb, setShowFullBreadcrumb] = useState(false);

  // Detectar si es móvil y manejar truncamiento
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Lógica de truncamiento para móvil
  const getVisibleItems = () => {
    if (!isMobile || showFullBreadcrumb || breadcrumbItems.length <= 4) {
      return breadcrumbItems;
    }
    
    // Mostrar primero, último y "..." en medio
    const first = breadcrumbItems[0];
    const last = breadcrumbItems[breadcrumbItems.length - 1];
    const secondLast = breadcrumbItems[breadcrumbItems.length - 2];
    
    return [
      first,
      { label: "...", href: null, ariaLabel: "Más niveles" },
      secondLast,
      last
    ];
  };

  const visibleItems = getVisibleItems();
  const baseUrl = typeof window !== 'undefined'
    ? window.location.origin
    : process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'http://localhost:3000';

  return (
    <nav
      aria-label="Navegación de migas de pan"
      className="mb-4 lg:mb-6"
      itemScope
      itemType="https://schema.org/BreadcrumbList"
    >
      <ol className={`flex items-center gap-2 text-sm text-text-muted ${
        isMobile && breadcrumbItems.length > 4 && !showFullBreadcrumb
          ? 'overflow-x-auto scrollbar-hide snap-x snap-mandatory'
          : 'flex-wrap'
      }`}>
        {visibleItems.map((item, index) => {
          const isLast = index === visibleItems.length - 1;
          const originalIndex = item.label === "..." 
            ? -1 
            : breadcrumbItems.findIndex(bi => bi.label === item.label && bi.href === item.href);
          const position = originalIndex >= 0 ? originalIndex + 1 : index + 1;
          const itemUrl = item.href 
            ? (item.href.startsWith('http') ? item.href : `${baseUrl}${item.href}`)
            : (typeof window !== 'undefined' ? window.location.href : baseUrl);

          return (
            <React.Fragment key={`${item.label}-${index}`}>
              <li
                itemScope
                itemType="https://schema.org/ListItem"
                itemProp="itemListElement"
                className={isMobile && breadcrumbItems.length > 4 && !showFullBreadcrumb ? 'flex-shrink-0 snap-start' : ''}
              >
                {item.label === "..." ? (
                  <button
                    onClick={() => setShowFullBreadcrumb(true)}
                    className="text-text-muted hover:text-text transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8B6CFF] focus-visible:rounded px-1"
                    aria-label="Mostrar todos los niveles"
                  >
                    ...
                  </button>
                ) : item.href ? (
                  <Link
                    href={item.href}
                    className="hover:text-text transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8B6CFF] focus-visible:rounded"
                    aria-label={item.ariaLabel || item.label}
                    itemProp="item"
                  >
                    <span itemProp="name">{item.label}</span>
                    <meta itemProp="position" content={position.toString()} />
                  </Link>
                ) : (
                  <span
                    className="text-text font-medium"
                    aria-current="page"
                    aria-label={item.ariaLabel || item.label}
                    itemProp="item"
                  >
                    <span itemProp="name">{item.label}</span>
                    <meta itemProp="position" content={position.toString()} />
                  </span>
                )}
              </li>
              {!isLast && (
                <li className={isMobile && breadcrumbItems.length > 4 && !showFullBreadcrumb ? 'flex-shrink-0' : ''}>
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









