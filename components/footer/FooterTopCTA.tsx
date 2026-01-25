"use client";

import Link from "next/link";
import { MessageCircle, Calendar } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { footerCTA, FOOTER_ANALYTICS_EVENTS } from "./footer.config";
import { track } from "@/lib/analytics";

export function FooterTopCTA() {
  const prefersReducedMotion = useReducedMotion();

  const handleWhatsAppClick = () => {
    track(FOOTER_ANALYTICS_EVENTS.CTA_WHATSAPP, {
      location: "footer_top_cta",
    });
  };

  const handleAgendarClick = () => {
    track(FOOTER_ANALYTICS_EVENTS.CTA_AGENDAR, {
      location: "footer_top_cta",
    });
  };

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
      className="w-full"
    >
      <div className="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* Copy */}
          <div className="text-center md:text-left">
            <h3 className="text-lg md:text-xl font-semibold text-white">
              {footerCTA.headline}
            </h3>
            <p className="text-white/70 mt-1">{footerCTA.subheadline}</p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Primary CTA - WhatsApp */}
            <a
              href={footerCTA.primaryCTA.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleWhatsAppClick}
              className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              aria-label="Contactar por WhatsApp"
            >
              <MessageCircle className="w-5 h-5" aria-hidden="true" />
              <span>{footerCTA.primaryCTA.label}</span>
            </a>

            {/* Secondary CTA - Agendar */}
            <Link
              href={footerCTA.secondaryCTA.href}
              onClick={handleAgendarClick}
              className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors border border-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              <Calendar className="w-5 h-5" aria-hidden="true" />
              <span>{footerCTA.secondaryCTA.label}</span>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
