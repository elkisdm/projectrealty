"use client";

import { LinkGrid } from "@/components/linktree/LinkGrid";
import { InvestmentForm } from "@/components/links/InvestmentForm";
import { BioHeader } from "@/components/bio/BioHeader";
import { motion } from "framer-motion";

interface LinkItem {
  label: string;
  href: string;
  aria: string;
  external?: boolean;
  icon?: "whatsapp" | "phone" | "calendar" | "catalog" | "external";
}

// Links configurables - el usuario los definirá después
const defaultLinks: LinkItem[] = [
  {
    label: "WhatsApp",
    href: "https://wa.me/56912345678",
    aria: "Contactar por WhatsApp",
    icon: "whatsapp",
    external: true,
  },
  {
    label: "Instagram",
    href: "https://instagram.com/tu_perfil",
    aria: "Seguir en Instagram",
    icon: "external",
    external: true,
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/in/tu_perfil",
    aria: "Conectar en LinkedIn",
    icon: "external",
    external: true,
  },
  {
    label: "Ver Propiedades",
    href: "/buscar",
    aria: "Ver catálogo de propiedades",
    icon: "catalog",
  },
];

interface LinksPageProps {
  links?: LinkItem[];
  name?: string;
  subtitle?: string;
}

export function LinksPage({ 
  links = defaultLinks, 
  name = "Elkis Daza",
  subtitle = "Inversión Inmobiliaria • Asesoría Personalizada"
}: LinksPageProps) {
  return (
    <div className="min-h-screen bg-bg">
      <div className="container mx-auto px-4 py-8 sm:py-12 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Header */}
          <BioHeader name={name} subtitle={subtitle} />

          {/* Links Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <LinkGrid items={links} />
          </motion.div>

          {/* Investment Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <InvestmentForm />
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center pt-8"
          >
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Hommie. Todos los derechos reservados.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
