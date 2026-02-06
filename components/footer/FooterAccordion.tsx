"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import type { FooterLink } from "./footer.config";
import { FOOTER_ANALYTICS_EVENTS } from "./footer.config";
import { track } from "@/lib/analytics";

interface FooterAccordionProps {
  title: string;
  links: FooterLink[];
  /** Tipo de tracking: 'explore' | 'help' */
  trackingType: "explore" | "help";
  /** Si está abierto por defecto */
  defaultOpen?: boolean;
}

export function FooterAccordion({
  title,
  links,
  trackingType,
  defaultOpen = false,
}: FooterAccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const prefersReducedMotion = useReducedMotion();

  const handleLinkClick = (label: string) => {
    const event =
      trackingType === "explore"
        ? FOOTER_ANALYTICS_EVENTS.LINK_EXPLORE
        : FOOTER_ANALYTICS_EVENTS.LINK_HELP;

    track(event, {
      link_label: label,
      section: trackingType,
    });
  };

  return (
    <div className="border-b border-slate-200 dark:border-white/10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:focus-visible:ring-white/50 rounded-lg"
        aria-expanded={isOpen}
      >
        <span className="font-semibold text-slate-900 dark:text-white">{title}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
        >
          <ChevronDown
            className="w-5 h-5 text-slate-600 dark:text-white/60"
            aria-hidden="true"
          />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.nav
            initial={prefersReducedMotion ? {} : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={prefersReducedMotion ? {} : { height: 0, opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
            className="overflow-hidden"
            aria-label={title}
          >
            <ul className="pb-4 space-y-2">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => handleLinkClick(link.label)}
                    className="block py-1 text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white transition-colors text-sm"
                    {...(link.external && {
                      target: "_blank",
                      rel: "noopener noreferrer",
                    })}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  );
}
