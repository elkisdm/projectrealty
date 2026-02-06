"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react";
import {
  footerBrand,
  exploreLinks,
  helpLinks,
  footerContact,
  socialLinks,
  FOOTER_ANALYTICS_EVENTS,
} from "./footer.config";
import { FooterAccordion } from "./FooterAccordion";
import { track } from "@/lib/analytics";

export function FooterGrid() {
  const prefersReducedMotion = useReducedMotion();

  const animationConfig = {
    duration: prefersReducedMotion ? 0 : 0.6,
    ease: "easeOut" as const,
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: animationConfig.duration,
        ease: animationConfig.ease,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: animationConfig.duration,
        ease: animationConfig.ease,
      },
    },
  };

  const handleLinkClick = (type: "explore" | "help", label: string) => {
    const event =
      type === "explore"
        ? FOOTER_ANALYTICS_EVENTS.LINK_EXPLORE
        : FOOTER_ANALYTICS_EVENTS.LINK_HELP;

    track(event, {
      link_label: label,
      section: type,
    });
  };

  const handleSocialClick = (label: string) => {
    track(FOOTER_ANALYTICS_EVENTS.SOCIAL_CLICK, {
      platform: label.toLowerCase(),
    });
  };

  const handleWhatsAppClick = () => {
    track(FOOTER_ANALYTICS_EVENTS.CTA_WHATSAPP, {
      location: "footer_contact",
    });
  };

  // WhatsApp URL
  const whatsappUrl = `https://wa.me/${footerContact.whatsapp.phoneE164}?text=${encodeURIComponent(footerContact.whatsapp.message)}`;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
    >
      {/* Desktop Grid - Hidden on mobile */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Columna 1 - Marca */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-ring to-ring/80">
              <span className="text-lg font-bold text-white">E</span>
            </div>
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-bold text-xl">
              {footerBrand.name}
            </span>
          </div>

          {/* Tagline */}
          <p className="text-slate-600 dark:text-white/70 text-sm leading-relaxed mb-4">
            {footerBrand.tagline}
          </p>

          {/* Bullets */}
          <ul className="space-y-2 mb-4">
            {footerBrand.bullets.map((bullet, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-slate-600 dark:text-white/60 text-xs"
              >
                <span className="text-emerald-500 dark:text-emerald-400 mt-0.5">✓</span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>

          {/* Microbadge */}
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-white/50">
            <footerBrand.microBadge.icon
              className="w-4 h-4"
              aria-hidden="true"
            />
            <span>{footerBrand.microBadge.label}</span>
          </div>
        </motion.div>

        {/* Columna 2 - Explorar */}
        <motion.div variants={itemVariants}>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Explorar</h3>
          <nav aria-label="Explorar">
            <ul className="space-y-2">
              {exploreLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => handleLinkClick("explore", link.label)}
                    className="text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </motion.div>

        {/* Columna 3 - Ayuda */}
        <motion.div variants={itemVariants}>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Ayuda</h3>
          <nav aria-label="Ayuda">
            <ul className="space-y-2">
              {helpLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => handleLinkClick("help", link.label)}
                    className="text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </motion.div>

        {/* Columna 4 - Contacto */}
        <motion.div variants={itemVariants}>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Contacto</h3>

          {/* WhatsApp Button - Dominante */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleWhatsAppClick}
            className="inline-flex items-center justify-center gap-2 w-full h-11 px-4 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors mb-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            aria-label="Contactar por WhatsApp"
          >
            <MessageCircle className="w-5 h-5" aria-hidden="true" />
            <span>WhatsApp</span>
          </a>

          {/* Contact Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-600 dark:text-white/70 text-sm">
              <Phone
                className="w-4 h-4 flex-shrink-0"
                aria-hidden="true"
              />
              <a
                href={`tel:${footerContact.phone.number}`}
                className="hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                {footerContact.phone.display}
              </a>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-white/70 text-sm">
              <Mail
                className="w-4 h-4 flex-shrink-0"
                aria-hidden="true"
              />
              <a
                href={`mailto:${footerContact.email}`}
                className="hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                {footerContact.email}
              </a>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-white/70 text-sm">
              <MapPin
                className="w-4 h-4 flex-shrink-0"
                aria-hidden="true"
              />
              <span>{footerContact.location}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-white/70 text-sm">
              <Clock
                className="w-4 h-4 flex-shrink-0"
                aria-hidden="true"
              />
              <span>{footerContact.hours}</span>
            </div>
          </div>

          {/* Social Links */}
          <div className="mt-6">
            <h4 className="font-medium text-slate-900 dark:text-white mb-2 text-sm">Sígueme</h4>
            <p className="text-slate-500 dark:text-white/50 text-xs mb-3">
              Tips de arriendo + oportunidades + edificios nuevos.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleSocialClick(social.label)}
                  className={`flex items-center justify-center w-10 h-10 rounded-lg text-white transition-colors ${social.bgClass} ${social.hoverClass} focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:focus-visible:ring-white/50`}
                  aria-label={`Seguir en ${social.label}`}
                >
                  <social.icon className="w-5 h-5" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Mobile Accordions - Hidden on desktop */}
      <div className="md:hidden space-y-0">
        {/* Brand section - Always visible on mobile */}
        <div className="pb-6 mb-2">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-ring to-ring/80">
              <span className="text-lg font-bold text-white">E</span>
            </div>
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-bold text-xl">
              {footerBrand.name}
            </span>
          </div>

          {/* Tagline */}
          <p className="text-slate-600 dark:text-white/70 text-sm leading-relaxed mb-4">
            {footerBrand.tagline}
          </p>

          {/* WhatsApp Button - Dominante en mobile */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleWhatsAppClick}
            className="inline-flex items-center justify-center gap-2 w-full h-12 px-4 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            aria-label="Contactar por WhatsApp"
          >
            <MessageCircle className="w-5 h-5" aria-hidden="true" />
            <span>Hablar por WhatsApp</span>
          </a>
        </div>

        {/* Accordions */}
        <FooterAccordion
          title="Explorar"
          links={exploreLinks}
          trackingType="explore"
        />
        <FooterAccordion
          title="Ayuda"
          links={helpLinks}
          trackingType="help"
        />

        {/* Contact Accordion-like (always open on mobile for accessibility) */}
        <div className="border-b border-slate-200 dark:border-white/10 py-4">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Contacto</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-600 dark:text-white/70 text-sm">
              <Phone
                className="w-4 h-4 flex-shrink-0"
                aria-hidden="true"
              />
              <a
                href={`tel:${footerContact.phone.number}`}
                className="hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                {footerContact.phone.display}
              </a>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-white/70 text-sm">
              <Mail
                className="w-4 h-4 flex-shrink-0"
                aria-hidden="true"
              />
              <a
                href={`mailto:${footerContact.email}`}
                className="hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                {footerContact.email}
              </a>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-white/70 text-sm">
              <MapPin
                className="w-4 h-4 flex-shrink-0"
                aria-hidden="true"
              />
              <span>{footerContact.location}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-white/70 text-sm">
              <Clock
                className="w-4 h-4 flex-shrink-0"
                aria-hidden="true"
              />
              <span>{footerContact.hours}</span>
            </div>
          </div>

          {/* Social Links Mobile */}
          <div className="mt-4">
            <h4 className="font-medium text-slate-900 dark:text-white mb-2 text-sm">Sígueme</h4>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleSocialClick(social.label)}
                  className={`flex items-center justify-center w-11 h-11 rounded-lg text-white transition-colors ${social.bgClass} ${social.hoverClass} focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:focus-visible:ring-white/50`}
                  aria-label={`Seguir en ${social.label}`}
                >
                  <social.icon className="w-5 h-5" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
