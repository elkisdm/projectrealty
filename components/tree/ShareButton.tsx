"use client";

import { Share2 } from "lucide-react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { track, ANALYTICS_EVENTS } from "@lib/analytics";
import { toast } from "sonner";

interface ShareButtonProps {
  className?: string;
}

export function ShareButton({ className = "" }: ShareButtonProps) {
  const prefersReducedMotion = useReducedMotion();

  const handleShare = async () => {
    const shareData = {
      title: 'Elkis Daza - Realtor',
      text: 'Encuentra tu próximo hogar con Elkis Realtor',
      url: typeof window !== 'undefined' ? window.location.href : '',
    };

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
        track(ANALYTICS_EVENTS.TREE_SHARE, { method: 'native' });
      } catch (err) {
        // Usuario canceló o error - no hacer nada
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    } else {
      // Fallback: copiar al clipboard
      try {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
          await navigator.clipboard.writeText(shareData.url);
          toast.success('Link copiado al portapapeles', {
            duration: 2000,
          });
          track(ANALYTICS_EVENTS.TREE_SHARE, { method: 'clipboard' });
        }
      } catch (err) {
        console.error('Error copying to clipboard:', err);
        toast.error('No se pudo copiar el link', {
          duration: 2000,
        });
      }
    }
  };

  return (
    <motion.button
      onClick={handleShare}
      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 motion-reduce:hover:scale-100 motion-reduce:active:scale-100 text-blue-600 hover:text-blue-700 bg-surface dark:bg-surface border border-border hover:border-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 shadow-sm hover:shadow-md ${className}`}
      whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
      aria-label="Compartir página"
      initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2 }}
    >
      <Share2 className="w-6 h-6 sm:w-7 sm:h-7" aria-hidden="true" />
    </motion.button>
  );
}
