"use client";

import { motion } from "framer-motion";
import { skeletonVariants } from "@/lib/animations/mobileAnimations";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface MobileLoadingSkeletonProps {
  count?: number;
  className?: string;
}

/**
 * Skeleton elegante para lista móvil con efecto shimmer
 */
export function MobileLoadingSkeleton({ count = 3, className = "" }: MobileLoadingSkeletonProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          className="bg-surface dark:bg-gray-800 rounded-2xl overflow-hidden border border-border dark:border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          {/* Image skeleton */}
          <div className="relative aspect-[4/3] bg-gray-200 dark:bg-gray-700 overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              style={{
                backgroundSize: "200% 100%",
              }}
              variants={prefersReducedMotion ? {} : skeletonVariants}
              animate="shimmer"
            />
          </div>

          {/* Content skeleton */}
          <div className="p-4 space-y-3">
            {/* Title */}
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
                style={{
                  backgroundSize: "200% 100%",
                }}
                variants={prefersReducedMotion ? {} : skeletonVariants}
                animate="shimmer"
              />
            </div>

            {/* Location */}
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/2 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
                style={{
                  backgroundSize: "200% 100%",
                }}
                variants={prefersReducedMotion ? {} : skeletonVariants}
                animate="shimmer"
              />
            </div>

            {/* Price and details */}
            <div className="flex items-center justify-between pt-2">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg w-32 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  style={{
                    backgroundSize: "200% 100%",
                  }}
                  variants={prefersReducedMotion ? {} : skeletonVariants}
                  animate="shimmer"
                />
              </div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-24 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  style={{
                    backgroundSize: "200% 100%",
                  }}
                  variants={prefersReducedMotion ? {} : skeletonVariants}
                  animate="shimmer"
                />
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}








