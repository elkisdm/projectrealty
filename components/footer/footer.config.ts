/**
 * Footer Configuration
 * Centraliza todo el contenido del footer para evitar hardcode en JSX
 */

import type { LucideIcon } from "lucide-react";
import {
  MessageCircle,
  Instagram,
  Facebook,
  Linkedin,
  Award,
  Users,
  Shield,
  CheckCircle,
} from "lucide-react";

// ============================================================================
// Types
// ============================================================================

export interface FooterLink {
  label: string;
  href: string;
  /** Si true, abre en nueva pestaña */
  external?: boolean;
}

export interface SocialLink {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Color de fondo del botón */
  bgClass: string;
  /** Color de hover */
  hoverClass: string;
}

export interface TrustBadge {
  label: string;
  icon: LucideIcon;
}

export interface FooterContact {
  whatsapp: {
    /** Número en formato E.164 (sin +) - e.g. "56912345678" */
    phoneE164: string;
    /** Texto a mostrar */
    display: string;
    /** Mensaje predeterminado para WhatsApp */
    message: string;
  };
  phone: {
    /** Número para href tel: */
    number: string;
    /** Texto a mostrar */
    display: string;
  };
  email: string;
  location: string;
  hours: string;
}

export interface FooterBrand {
  name: string;
  tagline: string;
  bullets: string[];
  microBadge: {
    label: string;
    icon: LucideIcon;
  };
}

// ============================================================================
// Configuration
// ============================================================================

export const footerBrand: FooterBrand = {
  name: "Elkis Realtor",
  tagline: "Arriendos en Santiago, sin vueltas.",
  bullets: [
    "Beneficios en unidades seleccionadas",
    "Requisitos claros desde el inicio",
    "Acompañamiento en visitas y check-in",
  ],
  microBadge: {
    label: "Transparencia total",
    icon: Shield,
  },
};

export const exploreLinks: FooterLink[] = [
  { label: "Edificios", href: "/edificios" },
  { label: "Departamentos destacados", href: "/buscar" },
  { label: "Proyectos destacados", href: "/proyectos" },
  // Top comunas
  { label: "Providencia", href: "/comuna/providencia" },
  { label: "Las Condes", href: "/comuna/las-condes" },
  { label: "Ñuñoa", href: "/comuna/nunoa" },
];

export const helpLinks: FooterLink[] = [
  { label: "Requisitos para postular", href: "/requisitos" },
  { label: "Cómo funciona el proceso", href: "/proceso" },
  { label: "Garantía en cuotas", href: "/garantia" },
  { label: "Preguntas frecuentes", href: "/faq" },
];

export const footerContact: FooterContact = {
  whatsapp: {
    phoneE164: process.env.NEXT_PUBLIC_WA_PHONE_E164 || "56912345678",
    display: "+56 9 1234 5678",
    message: "Hola, quiero información sobre arriendos",
  },
  phone: {
    number: "+56912345678",
    display: "+56 9 1234 5678",
  },
  email: "contacto@elkisrealtor.cl",
  location: "Santiago, Chile",
  hours: "Lun–Vie 9:00–19:00",
};

export const socialLinks: SocialLink[] = [
  {
    label: "WhatsApp",
    href: `https://wa.me/${footerContact.whatsapp.phoneE164}`,
    icon: MessageCircle,
    bgClass: "bg-emerald-600",
    hoverClass: "hover:bg-emerald-700",
  },
  {
    label: "Instagram",
    href: "https://instagram.com/elkisrealtor",
    icon: Instagram,
    bgClass: "bg-gradient-to-br from-purple-600 to-pink-600",
    hoverClass: "hover:from-purple-700 hover:to-pink-700",
  },
  {
    label: "Facebook",
    href: "https://facebook.com/elkisrealtor",
    icon: Facebook,
    bgClass: "bg-blue-600",
    hoverClass: "hover:bg-blue-700",
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/in/elkisrealtor",
    icon: Linkedin,
    bgClass: "bg-blue-700",
    hoverClass: "hover:bg-blue-800",
  },
];

export const trustBadges: TrustBadge[] = [
  { label: "Certificado SII", icon: Award },
  { label: "+500 clientes satisfechos", icon: Users },
  { label: "Transparencia garantizada", icon: Shield },
  { label: "Unidades verificadas", icon: CheckCircle },
];

export const legalLinks: FooterLink[] = [
  { label: "Privacidad", href: "/privacy" },
  { label: "Términos", href: "/terms" },
  { label: "Cookies", href: "/cookies" },
];

// ============================================================================
// CTA Configuration
// ============================================================================

export const footerCTA = {
  headline: "¿Buscas arriendo hoy?",
  subheadline: "Te envío 3 opciones verificadas.",
  primaryCTA: {
    label: "Hablar por WhatsApp",
    href: `https://wa.me/${footerContact.whatsapp.phoneE164}?text=${encodeURIComponent(footerContact.whatsapp.message)}`,
  },
  secondaryCTA: {
    label: "Agendar visita",
    href: "/booking",
  },
};

// ============================================================================
// Analytics Events
// ============================================================================

export const FOOTER_ANALYTICS_EVENTS = {
  CTA_WHATSAPP: "footer_cta_whatsapp",
  CTA_AGENDAR: "footer_cta_agendar",
  LINK_EXPLORE: "footer_link_explore",
  LINK_HELP: "footer_link_help",
  LINK_LEGAL: "footer_link_legal",
  SOCIAL_CLICK: "footer_social_click",
} as const;
