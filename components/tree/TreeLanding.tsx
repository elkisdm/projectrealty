"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { track, ANALYTICS_EVENTS } from "@lib/analytics";
import { useEffect, useState } from "react";
import { Home, TrendingUp, Building2, DollarSign } from "lucide-react";
import { buildWhatsAppUrl } from "@lib/whatsapp";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { UFIndicator } from "./UFIndicator";
import { WhatsAppIcon } from "./WhatsAppIcon";
import { InstagramIcon } from "./InstagramIcon";
import { LinkedInIcon } from "./LinkedInIcon";
import { ThemeToggleCompact } from "./ThemeToggleCompact";
import { ShareButton } from "./ShareButton";
import { GamificationBadge } from "./GamificationBadge";
import { useTreeGamification } from "@/hooks/useTreeGamification";
import { NavigationLoader } from "./NavigationLoader";
import { springConfigs } from "@/lib/animations/springConfigs";
import { useTreeAnalytics } from "@/hooks/useTreeAnalytics";
import { useTreeUrlParams } from "@/hooks/useTreeUrlParams";
import { FormPreviewTooltip } from "./FormPreviewTooltip";
import { cn } from "@/lib/utils";
import { AnimatedAvatar } from "./AnimatedAvatar";
import { AnimatedCards } from "./AnimatedCards";

export function TreeLanding() {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const { currentBadge, recordVisit, recordFlowClick, isHydrated: gamificationHydrated } = useTreeGamification();
  const [isNavigating, setIsNavigating] = useState(false);
  const { trackCardHoverStart, trackCardHoverEnd } = useTreeAnalytics();
  const urlParams = useTreeUrlParams();

  useEffect(() => {
    track(ANALYTICS_EVENTS.TREE_VIEW);
  }, []);

  // Registrar visita cuando el componente se monta (solo una vez)
  useEffect(() => {
    if (gamificationHydrated) {
      recordVisit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gamificationHydrated]);

  // Trackear badge cuando cambia
  useEffect(() => {
    if (gamificationHydrated && currentBadge?.type) {
      track(ANALYTICS_EVENTS.TREE_BADGE_EARNED, { badge: currentBadge.type });
    }
  }, [gamificationHydrated, currentBadge]);

  const handleCTAClick = (flow: "rent" | "buy" | "rent-property" | "sell-property") => {
    setIsNavigating(true);
    track(ANALYTICS_EVENTS.TREE_CLICK_CTA, { flow });
    if (gamificationHydrated) {
      recordFlowClick(flow);
    }
    const routes = {
      rent: "arrendar",
      buy: "comprar",
      "rent-property": "arrendar-propiedad",
      "sell-property": "vender-propiedad",
    };
    router.push(`/tree/${routes[flow]}`);

    // Timeout de seguridad
    setTimeout(() => setIsNavigating(false), 5000);
  };

  const whatsappUrl = buildWhatsAppUrl({ message: "Hola, me interesa conocer más sobre tus propiedades." });

  const socialLinks = [
    {
      label: "WhatsApp",
      href: whatsappUrl || "https://wa.me/56912345678",
      icon: WhatsAppIcon,
      color: "text-emerald-500 hover:text-emerald-600",
    },
    {
      label: "Instagram",
      href: "https://instagram.com/elkisrealtor",
      icon: InstagramIcon,
      color: "text-pink-500 hover:text-pink-600",
    },
    {
      label: "LinkedIn",
      href: "https://linkedin.com/in/elkisrealtor",
      icon: LinkedInIcon,
      color: "text-blue-600 hover:text-blue-700",
    },
  ];

  return (
    <main id="main-content" role="main" className="min-h-screen bg-bg dark:bg-bg safe-area-bottom transition-colors duration-300">
      {/* Navigation Loader */}
      <NavigationLoader isNavigating={isNavigating} />

      {/* Theme Toggle - Fixed en esquina superior derecha */}
      <ThemeToggleCompact />

      {/* Skip link para accesibilidad */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand-violet focus:text-white focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-violet focus:ring-offset-2"
      >
        Saltar al contenido principal
      </a>
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-sm">
        <header className="text-center mb-6 sm:mb-8" role="banner">
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3 }}
            className="mb-4"
          >
            {/* Avatar más pequeño y minimalista con animación anime.js */}
            <AnimatedAvatar className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-brand-violet/20 via-brand-violet/30 to-brand-aqua/20 dark:from-brand-violet/30 dark:via-brand-violet/40 dark:to-brand-aqua/30 flex items-center justify-center ring-1 ring-brand-violet/10 dark:ring-brand-violet/20 transition-colors duration-300">
              <span className="text-xl sm:text-2xl font-bold text-brand-violet dark:text-brand-aqua">ED</span>
            </AnimatedAvatar>
            <h1 className="text-xl sm:text-2xl font-bold text-text mb-2 transition-colors duration-300 font-display">
              {urlParams.name || "Elkis Daza"}
            </h1>
            <p className="text-sm sm:text-base text-text-secondary mb-2 transition-colors duration-300">Realtor · Encuentra tu próximo hogar</p>
            {/* Badge de gamificación */}
            {gamificationHydrated && currentBadge && (
              <div className="mb-2 flex justify-center">
                <GamificationBadge badge={currentBadge} />
              </div>
            )}
            <UFIndicator />
          </motion.div>
        </header>

        {/* Opciones más pequeñas y minimalistas con animación anime.js */}
        <AnimatedCards className="space-y-3 sm:space-y-4 mb-6 sm:mb-8" role="navigation" aria-label="Opciones de servicio">
          <FormPreviewTooltip flow="rent">
            <motion.div
              initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={prefersReducedMotion ? {} : { y: -6, scale: 1.02 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { ...springConfigs.gentle, delay: 0.1 }
              }
              className="will-change-transform"
              onMouseEnter={() => trackCardHoverStart("rent")}
              onMouseLeave={() => trackCardHoverEnd("rent")}
            >
              <Card
                data-card
                className={cn(
                  "rounded-xl border transition-all duration-200 cursor-pointer group bg-card hover:shadow-xl active:scale-[0.98] motion-reduce:active:scale-100",
                  urlParams.highlight === "rent"
                    ? "border-brand-violet dark:border-brand-violet ring-2 ring-brand-violet/20 dark:ring-brand-violet/30"
                    : "border-border hover:border-brand-violet/50 dark:hover:border-brand-violet/40"
                )}
              >
                <CardContent className="p-4 sm:p-5">
                  <button
                    onClick={() => handleCTAClick("rent")}
                    className="w-full text-left min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet focus-visible:ring-offset-2 focus-visible:rounded-lg"
                    aria-label="Quiero arrendar - Encuentra tu próximo hogar"
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-brand-violet/10 dark:bg-brand-violet/20 flex items-center justify-center group-hover:bg-brand-violet/20 dark:group-hover:bg-brand-violet/30 transition-colors">
                        <Home className="w-4 h-4 sm:w-5 sm:h-5 text-brand-violet" aria-hidden="true" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 id="rent-title" className="text-sm sm:text-base font-semibold text-text leading-relaxed font-display">Quiero arrendar</h2>
                        <p id="rent-desc" className="text-xs sm:text-sm text-text-secondary leading-relaxed" aria-describedby="rent-title">Encuentra tu próximo hogar</p>
                      </div>
                    </div>
                  </button>
                </CardContent>
              </Card>
            </motion.div>
          </FormPreviewTooltip>

          <FormPreviewTooltip flow="buy">
            <motion.div
              initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={prefersReducedMotion ? {} : { y: -6, scale: 1.02 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { ...springConfigs.gentle, delay: 0.15 }
              }
              className="will-change-transform"
              onMouseEnter={() => trackCardHoverStart("buy")}
              onMouseLeave={() => trackCardHoverEnd("buy")}
            >
              <Card
                data-card
                className={cn(
                  "rounded-xl border transition-all duration-200 cursor-pointer group bg-card hover:shadow-xl active:scale-[0.98] motion-reduce:active:scale-100",
                  urlParams.highlight === "buy"
                    ? "border-brand-aqua dark:border-brand-aqua ring-2 ring-brand-aqua/20 dark:ring-brand-aqua/30"
                    : "border-border hover:border-brand-aqua/50 dark:hover:border-brand-aqua/40"
                )}
              >
                <CardContent className="p-4 sm:p-5">
                  <button
                    onClick={() => handleCTAClick("buy")}
                    className="w-full text-left min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-aqua focus-visible:ring-offset-2 focus-visible:rounded-lg"
                    aria-label="Quiero comprar - Invierte en tu futuro con la mejor asesoría"
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-brand-aqua/10 dark:bg-brand-aqua/20 flex items-center justify-center group-hover:bg-brand-aqua/20 dark:group-hover:bg-brand-aqua/30 transition-colors">
                        <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-brand-aqua" aria-hidden="true" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 id="buy-title" className="text-sm sm:text-base font-semibold text-text leading-relaxed font-display">Quiero comprar</h2>
                        <p id="buy-desc" className="text-xs sm:text-sm text-text-secondary leading-relaxed" aria-describedby="buy-title">Invierte en tu futuro con la mejor asesoría</p>
                      </div>
                    </div>
                  </button>
                </CardContent>
              </Card>
            </motion.div>
          </FormPreviewTooltip>

          <FormPreviewTooltip flow="rent-property">
            <motion.div
              initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={prefersReducedMotion ? {} : { y: -6, scale: 1.02 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { ...springConfigs.gentle, delay: 0.2 }
              }
              className="will-change-transform"
              onMouseEnter={() => trackCardHoverStart("rent-property")}
              onMouseLeave={() => trackCardHoverEnd("rent-property")}
            >
              <Card
                data-card
                className={cn(
                  "rounded-xl border transition-all duration-200 cursor-pointer group bg-card hover:shadow-xl active:scale-[0.98] motion-reduce:active:scale-100",
                  urlParams.highlight === "rent-property"
                    ? "border-brand-violet dark:border-brand-violet ring-2 ring-brand-violet/20 dark:ring-brand-violet/30"
                    : "border-border hover:border-brand-violet/50 dark:hover:border-brand-violet/40"
                )}
              >
                <CardContent className="p-4 sm:p-5">
                  <button
                    onClick={() => handleCTAClick("rent-property")}
                    className="w-full text-left min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet focus-visible:ring-offset-2 focus-visible:rounded-lg"
                    aria-label="Tengo una propiedad y la quiero arrendar - Publica tu propiedad"
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-brand-violet/10 dark:bg-brand-violet/20 flex items-center justify-center group-hover:bg-brand-violet/20 dark:group-hover:bg-brand-violet/30 transition-colors">
                        <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-brand-violet" aria-hidden="true" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 id="rent-property-title" className="text-sm sm:text-base font-semibold text-text leading-relaxed font-display">Tengo una propiedad y la quiero arrendar</h2>
                        <p id="rent-property-desc" className="text-xs sm:text-sm text-text-secondary leading-relaxed" aria-describedby="rent-property-title">Publica tu propiedad</p>
                      </div>
                    </div>
                  </button>
                </CardContent>
              </Card>
            </motion.div>
          </FormPreviewTooltip>

          <FormPreviewTooltip flow="sell-property">
            <motion.div
              initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={prefersReducedMotion ? {} : { y: -6, scale: 1.02 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { ...springConfigs.gentle, delay: 0.25 }
              }
              className="will-change-transform"
              onMouseEnter={() => trackCardHoverStart("sell-property")}
              onMouseLeave={() => trackCardHoverEnd("sell-property")}
            >
              <Card
                data-card
                className={cn(
                  "rounded-xl border transition-all duration-200 cursor-pointer group bg-card hover:shadow-xl active:scale-[0.98] motion-reduce:active:scale-100",
                  urlParams.highlight === "sell-property"
                    ? "border-brand-aqua dark:border-brand-aqua ring-2 ring-brand-aqua/20 dark:ring-brand-aqua/30"
                    : "border-border hover:border-brand-aqua/50 dark:hover:border-brand-aqua/40"
                )}
              >
                <CardContent className="p-4 sm:p-5">
                  <button
                    onClick={() => handleCTAClick("sell-property")}
                    className="w-full text-left min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-aqua focus-visible:ring-offset-2 focus-visible:rounded-lg"
                    aria-label="Quiero vender mi propiedad - Asesoría para venta de propiedades"
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-brand-aqua/10 dark:bg-brand-aqua/20 flex items-center justify-center group-hover:bg-brand-aqua/20 dark:group-hover:bg-brand-aqua/30 transition-colors">
                        <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-brand-aqua" aria-hidden="true" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 id="sell-title" className="text-sm sm:text-base font-semibold text-text leading-relaxed font-display">Quiero vender mi propiedad</h2>
                        <p id="sell-desc" className="text-xs sm:text-sm text-text-secondary leading-relaxed" aria-describedby="sell-title">Asesoría para venta de propiedades</p>
                      </div>
                    </div>
                  </button>
                </CardContent>
              </Card>
            </motion.div>
          </FormPreviewTooltip>
        </AnimatedCards>

        {/* Iconos de RRSS, WhatsApp y Compartir */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3, delay: 0.3 }}
          className="flex justify-center items-center gap-3 sm:gap-4 mb-6 sm:mb-8 flex-wrap"
          role="list"
          aria-label="Redes sociales, contacto y compartir"
        >
          {socialLinks.map((social) => {
            const Icon = social.icon;
            return (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 motion-reduce:hover:scale-100 motion-reduce:active:scale-100 ${social.color} bg-surface dark:bg-surface border border-border hover:border-current focus:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2 shadow-sm hover:shadow-md transition-colors duration-300`}
                aria-label={`${social.label} - Abre en nueva ventana`}
                role="listitem"
                onClick={() => {
                  if (social.label === "WhatsApp") {
                    track(ANALYTICS_EVENTS.CTA_WHATSAPP_CLICK, { flow: "tree_landing" });
                  }
                }}
              >
                <Icon className="w-6 h-6 sm:w-7 sm:h-7" aria-hidden="true" />
              </a>
            );
          })}
          <div role="listitem">
            <ShareButton />
          </div>
        </motion.div>

        {/* Footer minimalista */}
        <footer className="text-center pt-6 sm:pt-8 border-t border-border mt-8 sm:mt-10" role="contentinfo">
          <p className="text-xs sm:text-sm text-text-secondary mb-3 leading-relaxed">Respuesta en menos de 24h</p>
          <a
            href="/privacidad"
            className="text-xs sm:text-sm text-text-secondary hover:text-text underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet focus-visible:ring-offset-2 focus-visible:rounded min-h-[44px] inline-flex items-center justify-center px-3 py-2"
            aria-label="Política de privacidad"
          >
            Política de privacidad
          </a>
        </footer>
      </div>
    </main>
  );
}
