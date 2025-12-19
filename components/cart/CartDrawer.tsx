"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X, Plus, Minus, ShoppingBag, Trash2, Truck, MapPin, Check } from "lucide-react";
import { useCartStore } from "@stores/cartStore";
import Image from "next/image";
import Link from "next/link";
import {
  notifyCartUpdated,
  notifyCartCleared,
  notifyCheckoutStarted,
  notifyCheckoutError,
  notifyItemRemoved,
} from "@lib/ecommerce/toast";
import type { CartItem } from "@schemas/ecommerce";
import { ShippingEstimate } from "./ShippingEstimate";
import { DiscountCodeInput } from "./DiscountCodeInput";
import { CartUpsell } from "./CartUpsell";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const cart = useCartStore((state) => state.cart);
  const discountAmount = useCartStore((state) => state.discountAmount);
  const shippingEstimate = useCartStore((state) => state.shippingEstimate);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const updateShippingEstimate = useCartStore((state) => state.updateShippingEstimate);
  const shouldReduceMotion = useReducedMotion();
  const previousItemsRef = useRef<CartItem[]>([]);
  
  // Detectar items agregados para animación
  useEffect(() => {
    if (cart.items.length > previousItemsRef.current.length) {
      // Item agregado - la animación se maneja en el render
    }
    previousItemsRef.current = cart.items;
  }, [cart.items]);

  // Calcular estimación de envío inicial
  useEffect(() => {
    if (cart.items.length > 0 && !shippingEstimate) {
      updateShippingEstimate();
    }
  }, [cart.items.length, shippingEstimate, updateShippingEstimate]);

  // Formatear precio
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Manejar checkout (redirige a Shopify)
  const handleCheckout = () => {
    if (cart.items.length === 0) {
      notifyCheckoutError("Tu carrito está vacío");
      return;
    }

    try {
      notifyCheckoutStarted();
      // TODO: Integrar con Shopify checkout
      // Por ahora, solo loguear
      console.log("Checkout:", cart);
      // En producción: window.location.href = `https://${shopifyStore}.myshopify.com/cart/${cart.id}`
    } catch (error) {
      notifyCheckoutError("Error al procesar el checkout");
    }
  };

  // Manejar actualización de cantidad
  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
      notifyCartUpdated(cart.items.length - 1);
    } else {
      updateQuantity(itemId, newQuantity);
      notifyCartUpdated(cart.items.length);
    }
  };

  // Manejar limpiar carrito
  const handleClearCart = () => {
    if (cart.items.length === 0) return;
    clearCart();
    notifyCartCleared();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={
              shouldReduceMotion
                ? { duration: 0.2 }
                : { type: "spring", damping: 25, stiffness: 400 }
            }
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white border-l border-gray-200 z-50 flex flex-col shadow-xl h-screen"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 bg-white">
              <h2 className="text-lg font-bold text-gray-900">
                Carrito ({cart.items.length})
              </h2>
              <button
                onClick={onClose}
                className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-[#8B6CFF]"
                aria-label="Cerrar carrito"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items list */}
            <div className="flex-1 overflow-y-auto p-4 bg-white min-h-0">
              {cart.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag className="w-16 h-16 text-gray-400 mb-4" />
                  <p className="text-lg font-semibold text-gray-900 mb-2">
                    Tu carrito está vacío
                  </p>
                  <p className="text-sm text-gray-500 mb-6">
                    Agrega productos para comenzar
                  </p>
                  <Link
                    href="/search"
                    onClick={onClose}
                    className="px-6 py-3 bg-[#8B6CFF] text-white rounded-lg hover:bg-[#7a5ce6] transition-colors font-semibold"
                  >
                    Ver productos
                  </Link>
                </div>
              ) : (
                <div className="space-y-3 pb-2">
                  {cart.items.map((item, index) => {
                    const imageUrl = item.product.images[0] || "/images/placeholder-product.jpg";
                    const isNewItem = !previousItemsRef.current.find((prev) => prev.id === item.id);
                    return (
                      <motion.div
                        key={item.id}
                        initial={
                          shouldReduceMotion
                            ? false
                            : isNewItem
                            ? { scale: 0.8, opacity: 0, y: 20 }
                            : { opacity: 0, x: -20 }
                        }
                        animate={{ scale: 1, opacity: 1, x: 0, y: 0 }}
                        exit={
                          shouldReduceMotion
                            ? { opacity: 0 }
                            : { opacity: 0, x: 100, scale: 0.8 }
                        }
                        transition={
                          shouldReduceMotion
                            ? { duration: 0.1 }
                            : {
                                type: "spring",
                                damping: 20,
                                stiffness: 300,
                                delay: index * 0.05,
                              }
                        }
                        layout
                        className="flex gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        {/* Imagen */}
                        <Link
                          href={`/product/${item.product.handle}`}
                          onClick={onClose}
                          className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-gray-200"
                        >
                          <Image
                            src={imageUrl}
                            alt={item.product.title}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </Link>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/product/${item.product.handle}`}
                            onClick={onClose}
                            className="block"
                          >
                            <h3 className="text-sm font-medium text-text line-clamp-2 mb-1 hover:text-[#8B6CFF] transition-colors">
                              {item.product.title}
                            </h3>
                          </Link>
                          {item.variant.option1 && (
                            <p className="text-xs text-subtext mb-1">
                              {item.variant.option1}
                              {item.variant.option2 && ` - ${item.variant.option2}`}
                            </p>
                          )}
                          <p className="text-sm font-semibold text-text mb-2">
                            {formatPrice(item.variant.price)}
                          </p>

                          {/* Controles */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  handleUpdateQuantity(item.id, item.quantity - 1)
                                }
                                className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-[#8B6CFF]"
                                aria-label="Reducir cantidad"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-8 text-center text-sm font-semibold text-text">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  handleUpdateQuantity(item.id, item.quantity + 1)
                                }
                                className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-[#8B6CFF]"
                                aria-label="Aumentar cantidad"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <button
                              onClick={() => {
                                const itemToRemove = cart.items.find((i) => i.id === item.id);
                                removeItem(item.id);
                                if (itemToRemove) {
                                  notifyItemRemoved(itemToRemove);
                                }
                                notifyCartUpdated(cart.items.length - 1);
                              }}
                              className="p-1.5 text-subtext hover:text-red-500 hover:bg-red-50 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                              aria-label="Eliminar producto"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Upsell de productos relacionados - removido temporalmente para mejor UX */}
            </div>

            {/* Footer con total y checkout */}
            {cart.items.length > 0 && (
              <div className="border-t border-gray-200 p-4 space-y-4 bg-white flex-shrink-0">
                {/* Código de descuento */}
                <DiscountCodeInput />

                {/* Información de envío */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#8B6CFF]" />
                    <div>
                      <p className="text-sm font-medium text-text">
                        {shippingEstimate && shippingEstimate.cost === 0 ? (
                          <span className="text-green-600">Envío gratis</span>
                        ) : (
                          formatPrice(shippingEstimate?.cost || 5000)
                        )}
                      </p>
                      <p className="text-xs text-gray-500">
                        {shippingEstimate?.time || "3-5 días hábiles"}
                      </p>
                    </div>
                  </div>
                  <ShippingEstimate />
                </div>

                {/* Totales */}
                <div className="space-y-2 pt-3 border-t border-gray-200">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span className="text-gray-900">{formatPrice(cart.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Envío</span>
                    <span>
                      {shippingEstimate && shippingEstimate.cost === 0 ? (
                        <span className="text-green-600 font-medium">Gratis</span>
                      ) : (
                        <span className="text-gray-900">{formatPrice(shippingEstimate?.cost || 5000)}</span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                    <span>Total</span>
                    <span>{formatPrice(cart.total)}</span>
                  </div>
                </div>

                {/* Botones */}
                <div className="space-y-2 pt-2">
                  <button
                    onClick={handleCheckout}
                    className="w-full px-6 py-3 bg-[#8B6CFF] text-white rounded-lg hover:bg-[#7a5ce6] transition-colors font-semibold focus:outline-none focus:ring-2 focus:ring-[#8B6CFF] focus:ring-offset-2 flex items-center justify-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    Proceder al Checkout
                  </button>
                  <Link
                    href="/search"
                    onClick={onClose}
                    className="block w-full px-6 py-3 text-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700"
                  >
                    Seguir comprando
                  </Link>
                  <button
                    onClick={handleClearCart}
                    className="w-full px-6 py-2 text-sm text-gray-500 hover:text-red-500 transition-colors text-center"
                  >
                    Vaciar carrito
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

