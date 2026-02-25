"use client";

import { FooterGrid } from "./FooterGrid";
import { FooterTrustBar } from "./FooterTrustBar";
import { FooterLegal } from "./FooterLegal";

/**
 * Footer v2 - Premium Conversor
 *
 * Estructura:
 * 1. FooterGrid - Grid de 4 columnas (Marca, Explorar, Ayuda, Contacto)
 *    - En mobile: Acordeones colapsables
 * 2. FooterTrustBar - Trust badges (Certificado SII, +500 clientes, etc.)
 * 3. FooterLegal - Copyright + links legales
 */
export function Footer() {
  return (
    <footer
      className="bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-white/10 mt-auto"
      role="contentinfo"
      aria-label="Pie de página"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <FooterGrid />

        {/* Trust Bar */}
        <FooterTrustBar />

        {/* Legal */}
        <FooterLegal />
      </div>
    </footer>
  );
}
