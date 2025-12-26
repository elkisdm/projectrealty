"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

/**
 * Breadcrumb simple para la página de resultados
 */
export function ResultsBreadcrumb() {
  return (
    <nav
      aria-label="Navegación de migas de pan"
      className="mb-4"
    >
      <ol className="flex items-center space-x-2 text-sm text-subtext">
        <li>
          <Link
            href="/"
            className="flex items-center gap-1 hover:text-text transition-colors"
            aria-label="Ir al inicio"
          >
            <Home className="w-4 h-4" aria-hidden="true" />
            Home
          </Link>
        </li>
        <ChevronRight className="w-4 h-4 text-subtext" aria-hidden="true" />
        <li className="text-text font-medium" aria-current="page">
          Resultados
        </li>
      </ol>
    </nav>
  );
}




