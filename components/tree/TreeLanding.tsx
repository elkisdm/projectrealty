"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { track, ANALYTICS_EVENTS } from "@lib/analytics";
import { useEffect } from "react";
import { Home, TrendingUp, Building2, DollarSign, MessageSquare, Instagram, Linkedin } from "lucide-react";
import { buildWhatsAppUrl } from "@lib/whatsapp";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { UFIndicator } from "./UFIndicator";

export function TreeLanding() {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    track(ANALYTICS_EVENTS.TREE_VIEW);
  }, []);

  const handleCTAClick = (flow: "rent" | "buy" | "rent-property" | "sell-property") => {
    track(ANALYTICS_EVENTS.TREE_CLICK_CTA, { flow });
    const routes = {
      rent: "arrendar",
      buy: "comprar",
      "rent-property": "arrendar-propiedad",
      "sell-property": "vender-propiedad",
    };
    router.push(`/tree/${routes[flow]}`);
  };

  const whatsappUrl = buildWhatsAppUrl({ message: "Hola, me interesa conocer más sobre tus propiedades." });

  const socialLinks = [
    {
      label: "WhatsApp",
      href: whatsappUrl || "https://wa.me/56912345678",
      icon: MessageSquare,
      color: "text-emerald-500 hover:text-emerald-600",
    },
    {
      label: "Instagram",
      href: "https://instagram.com/elkisrealtor",
      icon: Instagram,
      color: "text-pink-500 hover:text-pink-600",
    },
    {
      label: "LinkedIn",
      href: "https://linkedin.com/in/elkisrealtor",
      icon: Linkedin,
      color: "text-blue-600 hover:text-blue-700",
    },
  ];

  return (
    <main id="main-content" role="main" className="min-h-screen bg-bg safe-area-bottom">
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 max-w-sm">
        <header className="text-center mb-4 sm:mb-6">
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.4 }}
            className="mb-4"
          >
            {/* Avatar más pequeño y minimalista */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-brand-violet/20 via-brand-violet/30 to-brand-aqua/20 dark:from-brand-violet/30 dark:via-brand-violet/40 dark:to-brand-aqua/30 flex items-center justify-center ring-1 ring-brand-violet/10 dark:ring-brand-violet/20">
              <span className="text-xl sm:text-2xl font-bold text-brand-violet dark:text-brand-aqua">ED</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-text mb-1">Elkis Daza</h1>
            <p className="text-xs text-subtext mb-2">Realtor · Encuentra tu próximo hogar</p>
            <UFIndicator />
          </motion.div>
        </header>

        {/* Opciones más pequeñas y minimalistas */}
        <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.4, delay: 0.1 }}
          >
            <Card className="rounded-xl border border-border hover:border-brand-violet/50 dark:hover:border-brand-violet/40 transition-all duration-200 cursor-pointer group bg-card hover:shadow-md active:scale-[0.98] motion-reduce:active:scale-100">
              <CardContent className="p-3 sm:p-4">
                <button
                  onClick={() => handleCTAClick("rent")}
                  className="w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet focus-visible:ring-offset-2 focus-visible:rounded-lg"
                  aria-label="Quiero arrendar"
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-brand-violet/10 dark:bg-brand-violet/20 flex items-center justify-center group-hover:bg-brand-violet/20 dark:group-hover:bg-brand-violet/30 transition-colors">
                      <Home className="w-4 h-4 sm:w-5 sm:h-5 text-brand-violet" aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-sm sm:text-base font-semibold text-text">Quiero arrendar</h2>
                      <p className="text-xs text-subtext">Encuentra tu próximo hogar</p>
                    </div>
                  </div>
                </button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.4, delay: 0.2 }}
          >
            <Card className="rounded-xl border border-border hover:border-brand-aqua/50 dark:hover:border-brand-aqua/40 transition-all duration-200 cursor-pointer group bg-card hover:shadow-md active:scale-[0.98] motion-reduce:active:scale-100">
              <CardContent className="p-3 sm:p-4">
                <button
                  onClick={() => handleCTAClick("buy")}
                  className="w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-aqua focus-visible:ring-offset-2 focus-visible:rounded-lg"
                  aria-label="Quiero comprar"
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-brand-aqua/10 dark:bg-brand-aqua/20 flex items-center justify-center group-hover:bg-brand-aqua/20 dark:group-hover:bg-brand-aqua/30 transition-colors">
                      <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-brand-aqua" aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-sm sm:text-base font-semibold text-text">Quiero comprar</h2>
                      <p className="text-xs text-subtext">Invierte en tu futuro con la mejor asesoría</p>
                    </div>
                  </div>
                </button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.4, delay: 0.3 }}
          >
            <Card className="rounded-xl border border-border hover:border-brand-violet/50 dark:hover:border-brand-violet/40 transition-all duration-200 cursor-pointer group bg-card hover:shadow-md active:scale-[0.98] motion-reduce:active:scale-100">
              <CardContent className="p-3 sm:p-4">
                <button
                  onClick={() => handleCTAClick("rent-property")}
                  className="w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet focus-visible:ring-offset-2 focus-visible:rounded-lg"
                  aria-label="Tengo una propiedad y la quiero arrendar"
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-brand-violet/10 dark:bg-brand-violet/20 flex items-center justify-center group-hover:bg-brand-violet/20 dark:group-hover:bg-brand-violet/30 transition-colors">
                      <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-brand-violet" aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-sm sm:text-base font-semibold text-text">Tengo una propiedad y la quiero arrendar</h2>
                      <p className="text-xs text-subtext">Publica tu propiedad</p>
                    </div>
                  </div>
                </button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.4, delay: 0.4 }}
          >
            <Card className="rounded-xl border border-border hover:border-brand-aqua/50 dark:hover:border-brand-aqua/40 transition-all duration-200 cursor-pointer group bg-card hover:shadow-md active:scale-[0.98] motion-reduce:active:scale-100">
              <CardContent className="p-3 sm:p-4">
                <button
                  onClick={() => handleCTAClick("sell-property")}
                  className="w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-aqua focus-visible:ring-offset-2 focus-visible:rounded-lg"
                  aria-label="Quiero vender mi propiedad"
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-brand-aqua/10 dark:bg-brand-aqua/20 flex items-center justify-center group-hover:bg-brand-aqua/20 dark:group-hover:bg-brand-aqua/30 transition-colors">
                      <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-brand-aqua" aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-sm sm:text-base font-semibold text-text">Quiero vender mi propiedad</h2>
                      <p className="text-xs text-subtext">Asesoría para venta de propiedades</p>
                    </div>
                  </div>
                </button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Iconos de RRSS y WhatsApp */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.4, delay: 0.3 }}
          className="flex justify-center gap-3 sm:gap-4 mb-4 sm:mb-6"
        >
          {socialLinks.map((social) => {
            const Icon = social.icon;
            return (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 motion-reduce:hover:scale-100 motion-reduce:active:scale-100 ${social.color} bg-surface dark:bg-surface border border-border hover:border-current focus:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2`}
                aria-label={social.label}
                onClick={() => {
                  if (social.label === "WhatsApp") {
                    track(ANALYTICS_EVENTS.CTA_WHATSAPP_CLICK, { flow: "tree_landing" });
                  }
                }}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
              </a>
            );
          })}
        </motion.div>

        {/* Footer minimalista */}
        <footer className="text-center pt-3 border-t border-border">
          <p className="text-xs text-subtext mb-1.5">Respuesta en menos de 24h</p>
          <a
            href="/privacidad"
            className="text-xs text-subtext hover:text-text-secondary underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet focus-visible:ring-offset-2 focus-visible:rounded"
          >
            Política de privacidad
          </a>
        </footer>
      </div>
    </main>
  );
}
