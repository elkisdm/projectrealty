"use client";

import { useState, useEffect } from "react";
import MotionWrapper from "@/components/ui/MotionWrapper";

export default function StickyMobileCTA() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Mostrar CTA después de scroll del 30% de la página
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollPercentage = scrollPosition / (documentHeight - windowHeight);
      
      setIsVisible(scrollPercentage > 0.3);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <MotionWrapper
      direction="up"
      className="fixed bottom-4 left-4 right-4 z-50 md:hidden"
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="rounded-2xl border border-border bg-background/95 dark:bg-background/90 p-4 shadow-2xl backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">
              Tu próximo hogar te espera
            </p>
            <p className="text-xs text-muted-foreground">
              Sin comisión • Sin aval • Pet friendly
            </p>
          </div>
          
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('openContactModal'))}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber-500"
          >
            Contacto
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>
      </div>
    </MotionWrapper>
  );
}



