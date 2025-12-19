"use client";

import React, { useState } from "react";
import { Tag, X, Check, Loader2 } from "lucide-react";
import { useCartStore } from "@stores/cartStore";
import { notifyDiscountApplied, notifyDiscountError } from "@lib/ecommerce/toast";

interface DiscountCodeInputProps {
  className?: string;
}

export function DiscountCodeInput({ className = "" }: DiscountCodeInputProps) {
  const cart = useCartStore((state) => state.cart);
  const discountCode = useCartStore((state) => state.discountCode);
  const discountAmount = useCartStore((state) => state.discountAmount);
  const applyDiscount = useCartStore((state) => state.applyDiscount);
  const removeDiscount = useCartStore((state) => state.removeDiscount);
  
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Formatear precio
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Manejar aplicar descuento
  const handleApplyDiscount = async () => {
    if (!inputValue.trim()) {
      setError("Ingresa un código de descuento");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await applyDiscount(inputValue.trim());
      // Obtener el descuento actualizado del store después de aplicar
      setTimeout(() => {
        const updatedDiscount = useCartStore.getState().discountAmount;
        notifyDiscountApplied(inputValue.trim().toUpperCase(), formatPrice(updatedDiscount));
      }, 0);
      setInputValue("");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al aplicar descuento";
      setError(errorMessage);
      notifyDiscountError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar remover descuento
  const handleRemoveDiscount = () => {
    removeDiscount();
    setInputValue("");
    setError(null);
  };

  // Manejar Enter en input
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isLoading && !discountCode) {
      handleApplyDiscount();
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {discountCode ? (
        // Descuento aplicado
        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                Código {discountCode} aplicado
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">
                Descuento: {formatPrice(discountAmount)}
              </p>
            </div>
          </div>
          <button
            onClick={handleRemoveDiscount}
            className="p-1 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 rounded"
            aria-label="Remover descuento"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        // Input para código
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value.toUpperCase());
                  setError(null);
                }}
                onKeyPress={handleKeyPress}
                placeholder="Código de descuento"
                className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B6CFF] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading || cart.items.length === 0}
                aria-label="Código de descuento"
              />
            </div>
            <button
              onClick={handleApplyDiscount}
              disabled={isLoading || !inputValue.trim() || cart.items.length === 0}
              className="px-4 py-2.5 text-sm bg-[#8B6CFF] text-white rounded-lg hover:bg-[#7a5ce6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-[#8B6CFF] focus:ring-offset-2 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="hidden sm:inline">Aplicando...</span>
                </>
              ) : (
                "Aplicar"
              )}
            </button>
          </div>
          {error && (
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          )}
          {cart.items.length === 0 && (
            <p className="text-xs text-subtext">
              Agrega productos al carrito para aplicar un descuento
            </p>
          )}
        </div>
      )}
    </div>
  );
}

