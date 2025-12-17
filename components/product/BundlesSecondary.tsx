"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Sparkles } from "lucide-react";
import type { Product, Bundle } from "@schemas/ecommerce";
import { motion } from "framer-motion";
import { useReducedMotion } from "@hooks/useReducedMotion";

interface BundlesSecondaryProps {
  product: Product;
  relatedBundles: Bundle[];
  className?: string;
}

export function BundlesSecondary({
  product,
  relatedBundles,
  className = "",
}: BundlesSecondaryProps) {
  const shouldReduceMotion = useReducedMotion();

  // Filtrar bundles que sean complementarios (nunca más baratos que el producto principal)
  const complementaryBundles = relatedBundles.filter((bundle) => {
    const bundlePrice = bundle.price ?? (product.price * bundle.quantity);
    return bundlePrice >= product.price; // Solo bundles iguales o más caros
  });

  if (complementaryBundles.length === 0) {
    return null;
  }

  // Formatear precio
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Calcular precio del bundle
  const getBundlePrice = (bundle: Bundle) => {
    return bundle.price ?? (product.price * bundle.quantity);
  };

  return (
    <section className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 ${className}`}>
      <div className="space-y-12">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold text-text mb-2">
            Combos complementarios
          </h2>
          <p className="text-subtext">Perfectos para complementar tu compra</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {complementaryBundles.map((bundle, index) => {
            const bundlePrice = getBundlePrice(bundle);

            return (
              <motion.div
                key={bundle.id}
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: shouldReduceMotion ? 0.2 : 0.4,
                  delay: index * 0.1,
                }}
                className="bg-card border border-border rounded-lg overflow-hidden hover:border-subtext transition-colors"
              >
                {/* Imagen */}
                <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <Image
                    src={product.images[0] || ""}
                    alt={bundle.label}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  {bundle.isRecommended && (
                    <div className="absolute top-4 right-4">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-action/20 text-action-text rounded text-xs font-medium">
                        <Sparkles className="w-3 h-3" />
                        Recomendado
                      </span>
                    </div>
                  )}
                </div>

                {/* Contenido */}
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="font-semibold text-text text-lg mb-2">{bundle.label}</h3>
                    {bundle.perks && bundle.perks.length > 0 && (
                      <ul className="space-y-1">
                        {bundle.perks.slice(0, 2).map((perk, idx) => (
                          <li key={idx} className="text-sm text-subtext flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-subtext rounded-full" />
                            {perk}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Precio */}
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-text">
                      {formatPrice(bundlePrice)}
                    </span>
                    {bundle.discount && bundle.discount > 0 && (
                      <span className="px-2 py-0.5 bg-red-500 text-white rounded text-xs font-semibold">
                        -{bundle.discount}%
                      </span>
                    )}
                  </div>

                  {/* CTA */}
                  <Link
                    href={`/product/${product.handle}?bundle=${bundle.id}`}
                    className="w-full px-4 py-3 bg-action text-action-text rounded-lg hover:bg-action-hover transition-colors font-semibold flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-action focus:ring-offset-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Ver detalles
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

