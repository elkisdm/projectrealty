'use client';

import { memo } from 'react';
import { isUnitCardV2Enabled } from '@lib/flags';

interface UnitCardSkeletonProps {
  variant?: 'v1' | 'v2' | 'auto';
  className?: string;
}

/**
 * Skeleton loader for UnitCard
 * Matches the layout of the active variant to prevent layout shift
 */
export const UnitCardSkeleton = memo(function UnitCardSkeleton({
  variant = 'auto',
  className = '',
}: UnitCardSkeletonProps) {
  // Determine which skeleton to show
  const effectiveVariant = variant === 'auto'
    ? (isUnitCardV2Enabled() ? 'v2' : 'v1')
    : variant;

  if (effectiveVariant === 'v2') {
    return <UnitCardSkeletonV2 className={className} />;
  }

  return <UnitCardSkeletonV1 className={className} />;
});

/**
 * V1 Skeleton - matches legacy layout
 */
function UnitCardSkeletonV1({ className = '' }: { className?: string }) {
  return (
    <div
      className={`
        group relative 
        bg-card 
        border border-border 
        rounded-2xl 
        overflow-hidden
        ${className}
      `}
    >
      {/* Image Section Skeleton */}
      <div className="relative aspect-[4/3] overflow-hidden bg-surface animate-pulse">
        <div className="w-full h-full bg-soft" />

        {/* Badge Skeleton */}
        <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-soft animate-pulse">
          <div className="w-16 h-3 bg-border rounded" />
        </div>

        {/* Favorite Button Skeleton */}
        <div className="absolute top-3 right-3 w-9 h-9 rounded-full bg-soft animate-pulse" />
      </div>

      {/* Content Section Skeleton */}
      <div className="p-4">
        {/* Header Skeleton */}
        <div className="mb-2">
          <div className="h-5 w-3/4 bg-soft rounded animate-pulse mb-2" />
          <div className="h-4 w-1/2 bg-soft rounded animate-pulse" />
        </div>

        {/* Pills Skeleton */}
        <div className="flex gap-2 mb-2">
          <div className="h-6 w-16 bg-soft rounded-full animate-pulse" />
          <div className="h-6 w-20 bg-soft rounded-full animate-pulse" />
        </div>

        {/* Address Skeleton */}
        <div className="h-3 w-2/3 bg-soft rounded animate-pulse mb-3" />

        {/* Separator */}
        <div className="my-3 h-px w-full bg-border" />

        {/* Price Section Skeleton */}
        <div className="flex justify-between items-end">
          <div className="flex-1">
            <div className="h-7 w-32 bg-soft rounded animate-pulse mb-1" />
            <div className="h-3 w-24 bg-soft rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * V2 Skeleton - matches new minimal layout
 */
function UnitCardSkeletonV2({ className = '' }: { className?: string }) {
  return (
    <div
      className={`
        group relative 
        bg-card 
        border border-border 
        rounded-2xl 
        overflow-hidden
        ${className}
      `}
    >
      {/* Image Section Skeleton */}
      <div className="relative aspect-[4/3] overflow-hidden bg-surface animate-pulse">
        <div className="w-full h-full bg-soft" />

        {/* Badge Skeleton */}
        <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-soft animate-pulse">
          <div className="w-16 h-3 bg-border rounded" />
        </div>

        {/* Favorite Button Skeleton */}
        <div className="absolute top-3 right-3 w-9 h-9 rounded-full bg-soft animate-pulse" />
      </div>

      {/* Content Section Skeleton - V2 Layout */}
      <div className="p-4 space-y-2">
        {/* Price Skeleton */}
        <div className="space-y-1">
          <div className="h-6 w-28 bg-soft rounded animate-pulse" />
          <div className="h-3 w-24 bg-soft rounded animate-pulse" />
        </div>

        {/* Specs Skeleton */}
        <div className="h-4 w-32 bg-soft rounded animate-pulse" />

        {/* Address Skeleton */}
        <div className="h-3 w-2/3 bg-soft rounded animate-pulse" />

        {/* Chips Skeleton */}
        <div className="flex gap-1.5">
          <div className="h-5 w-16 bg-soft rounded-full animate-pulse" />
          <div className="h-5 w-14 bg-soft rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default UnitCardSkeleton;
