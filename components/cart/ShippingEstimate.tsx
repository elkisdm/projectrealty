"use client";

import React, { useState, useEffect } from "react";
import { Truck, MapPin } from "lucide-react";
import { useCartStore } from "@stores/cartStore";
import { calculateShipping, estimateShippingTime, type ShippingEstimate as ShippingEstimateType } from "@lib/ecommerce/shipping";

interface ShippingEstimateProps {
  className?: string;
}

export function ShippingEstimate({ className = "" }: ShippingEstimateProps) {
  const cart = useCartStore((state) => state.cart);
  const shippingEstimate = useCartStore((state) => state.shippingEstimate);
  const updateShippingEstimate = useCartStore((state) => state.updateShippingEstimate);
  const [postalCode, setPostalCode] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  // Calcular estimación inicial
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

  // Manejar cambio de código postal
  const handlePostalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 7); // Solo números, max 7 dígitos
    setPostalCode(value);
  };

  // Actualizar estimación con código postal
  const handleUpdateEstimate = () => {
    if (postalCode.length >= 5) {
      updateShippingEstimate(postalCode);
    }
  };

  if (cart.items.length === 0) {
    return null;
  }

  const estimate = shippingEstimate || calculateShipping(cart);

  return (
    <div className={`space-y-2 ${className}`} data-postal-input>
      {/* Link para calcular envío */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left text-sm text-gray-500 hover:text-[#8B6CFF] transition-colors flex items-center gap-1.5"
        aria-expanded={isExpanded}
        aria-label="Calcular envío por código postal"
      >
        <MapPin className="w-4 h-4" />
        <span>Calcular envío por código postal</span>
      </button>

      {/* Input de código postal (colapsable) */}
      {isExpanded && (
        <div className="space-y-2 pb-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={postalCode}
              onChange={handlePostalCodeChange}
              placeholder="Código postal"
              className="flex-1 px-3 py-2 text-sm border border-border rounded-lg bg-card text-text placeholder:text-subtext focus:outline-none focus:ring-2 focus:ring-[#8B6CFF]"
              maxLength={7}
            />
            <button
              onClick={handleUpdateEstimate}
              disabled={postalCode.length < 5}
              className="px-4 py-2 text-sm bg-[#8B6CFF] text-white rounded-lg hover:bg-[#7a5ce6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold focus:outline-none focus:ring-2 focus:ring-[#8B6CFF] focus:ring-offset-2"
            >
              Calcular
            </button>
          </div>
          {postalCode.length > 0 && postalCode.length < 5 && (
            <p className="text-xs text-subtext">
              Ingresa al menos 5 dígitos
            </p>
          )}
        </div>
      )}
    </div>
  );
}

