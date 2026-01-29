"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { track, ANALYTICS_EVENTS } from "@lib/analytics";
import { useEffect } from "react";

export function TreeLanding() {
  const router = useRouter();

  useEffect(() => {
    // Track page view
    track(ANALYTICS_EVENTS.TREE_VIEW);
  }, []);

  const handleCTAClick = (flow: "rent" | "buy") => {
    track(ANALYTICS_EVENTS.TREE_CLICK_CTA, { flow });
    router.push(`/tree/${flow === "rent" ? "arrendar" : "comprar"}`);
  };

  return (
    <main id="main-content" role="main" className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-md">
        {/* Header */}
        <header className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-6"
          >
            {/* Foto placeholder - reemplazar con imagen real */}
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
              <span className="text-3xl font-bold text-primary">ED</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Elkis Daza
            </h1>
            <p className="text-lg text-muted-foreground mb-1">
              Elkis Realtor
            </p>
            <p className="text-sm text-muted-foreground">
              Encuentra tu próximo hogar sin comisión
            </p>
          </motion.div>
        </header>

        {/* CTAs */}
        <div className="space-y-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card className="rounded-2xl border-2 hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent className="p-6">
                <button
                  onClick={() => handleCTAClick("rent")}
                  className="w-full text-left"
                  aria-label="Quiero arrendar"
                >
                  <h2 className="text-xl font-semibold text-foreground mb-2">
                    Quiero arrendar
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Formulario rápido paso a paso
                  </p>
                </button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card className="rounded-2xl border-2 hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent className="p-6">
                <button
                  onClick={() => handleCTAClick("buy")}
                  className="w-full text-left"
                  aria-label="Quiero comprar"
                >
                  <h2 className="text-xl font-semibold text-foreground mb-2">
                    Quiero comprar
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Formulario de inversión inmobiliaria
                  </p>
                </button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Footer */}
        <footer className="text-center">
          <p className="text-xs text-muted-foreground mb-2">
            Respuesta en menos de 24h
          </p>
          <a
            href="/privacidad"
            className="text-xs text-muted-foreground hover:text-foreground underline"
          >
            Política de privacidad
          </a>
        </footer>
      </div>
    </main>
  );
}
