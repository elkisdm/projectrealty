"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { legalLinks, FOOTER_ANALYTICS_EVENTS } from "./footer.config";
import { track } from "@/lib/analytics";

export function FooterLegal() {
  const prefersReducedMotion = useReducedMotion();
  const currentYear = new Date().getFullYear();

  const handleLinkClick = (label: string) => {
    track(FOOTER_ANALYTICS_EVENTS.LINK_LEGAL, {
      link_label: label,
    });
  };

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
      className="border-t border-slate-200 dark:border-white/10 pt-6 mt-8"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Copyright */}
        <p className="text-slate-500 dark:text-white/50 text-sm text-center md:text-left">
          © {currentYear} Elkis Realtor. Todos los derechos reservados.
        </p>

        {/* Legal Links */}
        <nav aria-label="Enlaces legales">
          <ul className="flex flex-col md:flex-row items-center gap-2 md:gap-6">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => handleLinkClick(link.label)}
                  className="text-slate-500 dark:text-white/50 hover:text-slate-900 dark:hover:text-white/80 transition-colors text-sm"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </motion.div>
  );
}
