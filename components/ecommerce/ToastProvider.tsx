"use client";

import React from "react";
import { Toaster } from "sonner";

/**
 * ToastProvider - Sistema global de notificaciones para ecommerce
 * 
 * Proporciona feedback inmediato y elegante para todas las acciones del usuario:
 * - Producto agregado al carrito
 * - Producto agregado a favoritos
 * - Errores en operaciones
 * - Alertas de stock
 * - Confirmaciones de acciones
 * 
 * Características:
 * - Auto-dismiss configurable
 * - Posicionamiento inteligente
 * - Animaciones suaves con prefers-reduced-motion
 * - Accesibilidad completa (ARIA)
 * - Temas dark/light automáticos
 */
export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      expand={true}
      duration={4000}
      toastOptions={{
        style: {
          background: "var(--card, hsl(var(--card)))",
          border: "1px solid hsl(var(--border))",
          color: "hsl(var(--foreground))",
          borderRadius: "1rem",
          padding: "1rem",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        },
        className: "toast",
        classNames: {
          toast: "group toast group-[.toaster]:bg-card group-[.toaster]:text-text group-[.toaster]:border-border",
          description: "group-[.toast]:text-subtext",
          actionButton: "group-[.toast]:bg-[#8B6CFF] group-[.toast]:text-white",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
    />
  );
}




