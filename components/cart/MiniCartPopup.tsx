"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { useCartStore } from "@stores/cartStore";
import Image from "next/image";
import Link from "next/link";
import type { CartItem } from "@schemas/ecommerce";

interface MiniCartPopupProps {
  onViewCart: () => void;
  triggerRef?: React.RefObject<HTMLElement>;
}

export function MiniCartPopup({ onViewCart, triggerRef }: MiniCartPopupProps) {
  const cart = useCartStore((state) => state.cart);
  const [isHovered, setIsHovered] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const internalTriggerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Usar triggerRef externo o interno
  const actualTriggerRef = triggerRef || internalTriggerRef;

  // Mostrar últimos 2-3 items
  const recentItems = cart.items.slice(-3);

  // Formatear precio
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Manejar hover del trigger
  const handleTriggerMouseEnter = () => {
    if (cart.items.length > 0) {
      setIsHovered(true);
    }
  };

  const handleTriggerMouseLeave = () => {
    setIsHovered(false);
  };

  // Cerrar popup al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        actualTriggerRef.current &&
        !actualTriggerRef.current.contains(event.target as Node)
      ) {
        setIsHovered(false);
      }
    };

    if (isHovered) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isHovered, actualTriggerRef]);

  // Agregar event listeners al trigger externo si existe
  useEffect(() => {
    const trigger = actualTriggerRef.current;
    if (!trigger) return;

    const handleEnter = () => {
      if (cart.items.length > 0) {
        setIsHovered(true);
      }
    };

    const handleLeave = () => {
      setIsHovered(false);
    };

    trigger.addEventListener("mouseenter", handleEnter);
    trigger.addEventListener("mouseleave", handleLeave);

    return () => {
      trigger.removeEventListener("mouseenter", handleEnter);
      trigger.removeEventListener("mouseleave", handleLeave);
    };
  }, [actualTriggerRef, cart.items.length]);

  if (cart.items.length === 0) {
    return null;
  }

  return (
    <>
      {/* Trigger invisible para hover (solo si no hay trigger externo) */}
      {!triggerRef && (
        <div
          ref={internalTriggerRef}
          onMouseEnter={handleTriggerMouseEnter}
          onMouseLeave={handleTriggerMouseLeave}
          className="hidden md:block"
        />
      )}

      {/* Popup */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            ref={popupRef}
            initial={
              shouldReduceMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 10, scale: 0.95 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={
              shouldReduceMotion
                ? { duration: 0.1 }
                : { type: "spring", damping: 25, stiffness: 300 }
            }
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="hidden md:block absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden"
            style={{ marginTop: "0.5rem" }}
          >
            {/* Header */}
            <div className="p-4 border-b border-border bg-gray-50 dark:bg-gray-900">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-text flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  Carrito ({cart.items.length})
                </h3>
              </div>
            </div>

            {/* Items */}
            <div className="max-h-64 overflow-y-auto p-4 space-y-3">
              {recentItems.map((item: CartItem) => {
                const imageUrl =
                  item.product.images[0] || "/images/placeholder-product.jpg";
                return (
                  <div
                    key={item.id}
                    className="flex gap-3 items-start"
                  >
                    <Link
                      href={`/product/${item.product.handle}`}
                      onClick={onViewCart}
                      className="relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200"
                    >
                      <Image
                        src={imageUrl}
                        alt={item.product.title}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/product/${item.product.handle}`}
                        onClick={onViewCart}
                        className="block"
                      >
                        <p className="text-sm font-medium text-text line-clamp-1 hover:text-[#8B6CFF] transition-colors">
                          {item.product.title}
                        </p>
                      </Link>
                      <p className="text-xs text-subtext">
                        {item.quantity}x {formatPrice(item.variant.price)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border bg-gray-50 dark:bg-gray-900 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-text">Total</span>
                <span className="text-lg font-bold text-[#8B6CFF]">
                  {formatPrice(cart.total)}
                </span>
              </div>
              <button
                onClick={onViewCart}
                className="w-full px-4 py-2 bg-[#8B6CFF] text-white rounded-lg hover:bg-[#7a5ce6] transition-colors font-semibold text-sm flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#8B6CFF] focus:ring-offset-2"
              >
                Ver carrito completo
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

