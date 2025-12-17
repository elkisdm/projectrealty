"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Heart, Eye, MoreVertical, X } from "lucide-react";

export interface ContextMenuOption {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  destructive?: boolean;
}

export interface ContextMenuProps {
  isOpen: boolean;
  onClose: () => void;
  options: ContextMenuOption[];
  position?: { x: number; y: number };
  anchor?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  className?: string;
}

/**
 * Componente de menú contextual que aparece en long press
 * Posicionamiento inteligente para evitar bordes de pantalla
 */
export function ContextMenu({
  isOpen,
  onClose,
  options,
  position,
  anchor = "top-left",
  className = "",
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState(position || { x: 0, y: 0 });

  // Ajustar posición para evitar bordes de pantalla
  useEffect(() => {
    if (!isOpen || !menuRef.current || !position) return;

    const menu = menuRef.current;
    const rect = menu.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const padding = 16; // Padding mínimo desde bordes

    let x = position.x;
    let y = position.y;

    // Ajustar horizontalmente
    if (x + rect.width > viewportWidth - padding) {
      x = viewportWidth - rect.width - padding;
    }
    if (x < padding) {
      x = padding;
    }

    // Ajustar verticalmente
    if (y + rect.height > viewportHeight - padding) {
      y = viewportHeight - rect.height - padding;
    }
    if (y < padding) {
      y = padding;
    }

    setAdjustedPosition({ x, y });
  }, [isOpen, position]);

  // Cerrar al hacer click fuera
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    // Delay para evitar cerrar inmediatamente al abrir
    const timeout = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }, 100);

    return () => {
      clearTimeout(timeout);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  // Prevenir scroll del body cuando el menú está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay oscuro */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={onClose}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Menú contextual */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`fixed z-50 bg-card border border-border rounded-2xl shadow-xl py-2 min-w-[200px] ${className}`}
            style={{
              left: `${adjustedPosition.x}px`,
              top: `${adjustedPosition.y}px`,
            }}
            role="menu"
            aria-label="Menú contextual"
          >
            {options.map((option, index) => {
              const Icon = option.icon || MoreVertical;
              return (
                <button
                  key={option.id}
                  onClick={() => {
                    option.onClick();
                    onClose();
                  }}
                  className={`
                    w-full px-4 py-3 flex items-center gap-3 text-left
                    hover:bg-surface transition-colors duration-150
                    ${index === 0 ? "rounded-t-2xl" : ""}
                    ${index === options.length - 1 ? "rounded-b-2xl" : ""}
                    ${option.destructive ? "text-red-500 hover:bg-red-500/10" : "text-text"}
                    focus:outline-none focus:bg-surface
                  `}
                  role="menuitem"
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/**
 * Hook helper para crear opciones comunes del menú contextual
 */
export function useContextMenuOptions(
  onShare?: () => void,
  onFavorite?: () => void,
  onQuickView?: () => void,
  onMore?: () => void
): ContextMenuOption[] {
  return [
    ...(onShare
      ? [
          {
            id: "share",
            label: "Compartir",
            icon: Share2,
            onClick: onShare,
          },
        ]
      : []),
    ...(onFavorite
      ? [
          {
            id: "favorite",
            label: "Agregar a favoritos",
            icon: Heart,
            onClick: onFavorite,
          },
        ]
      : []),
    ...(onQuickView
      ? [
          {
            id: "quick-view",
            label: "Vista rápida",
            icon: Eye,
            onClick: onQuickView,
          },
        ]
      : []),
    ...(onMore
      ? [
          {
            id: "more",
            label: "Más opciones",
            icon: MoreVertical,
            onClick: onMore,
          },
        ]
      : []),
  ];
}

