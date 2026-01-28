'use client';

import Image from 'next/image';
import { useState, memo, useCallback } from 'react';
import type { CardMediaProps } from '../types';
import { DEFAULT_BLUR_DATA_URL, DEFAULT_FALLBACK_IMAGE } from '../constants';
import { CardFavoriteButton } from './CardFavoriteButton';
import { CardBadge } from './CardBadge';

/**
 * Card media section with image, badge overlay, and favorite button
 */
export const CardMedia = memo(function CardMedia({
  imageUrl,
  alt,
  priority = false,
  onImageError,
  badge,
  unitId,
  isFavorited = false,
  onFavoriteToggle,
  isPressing = false,
}: CardMediaProps) {
  const [currentImageUrl, setCurrentImageUrl] = useState(imageUrl);
  const [hasError, setHasError] = useState(false);

  const handleImageError = useCallback(() => {
    setHasError(true);
    setCurrentImageUrl(DEFAULT_FALLBACK_IMAGE);
    onImageError?.();
  }, [onImageError]);

  const finalImageUrl = hasError ? DEFAULT_FALLBACK_IMAGE : currentImageUrl;

  return (
    <div className="relative aspect-[4/3] overflow-hidden bg-slate-200 dark:bg-slate-800 rounded-t-2xl">
      {/* Hidden img for error detection before Next Image renders */}
      {!hasError && currentImageUrl !== DEFAULT_FALLBACK_IMAGE && (
        <img
          src={currentImageUrl}
          alt=""
          className="hidden"
          onError={handleImageError}
          onLoad={() => setHasError(false)}
        />
      )}

      <Image
        src={finalImageUrl}
        alt={alt}
        fill
        className={`
          object-cover 
          transition-transform duration-500 
          group-hover:scale-105 
          rounded-t-2xl
          ${isPressing ? 'scale-100' : ''}
        `}
        sizes="(max-width: 640px) 280px, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        priority={priority}
        loading={priority ? 'eager' : 'lazy'}
        placeholder="blur"
        blurDataURL={DEFAULT_BLUR_DATA_URL}
      />

      {/* Badge overlay (top left) */}
      {badge && (
        <div className="absolute top-3 left-3">
          <CardBadge text={badge.text} type={badge.type} />
        </div>
      )}

      {/* Favorite button (top right) */}
      <div className="absolute top-3 right-3">
        <CardFavoriteButton
          unitId={unitId}
          isFavorited={isFavorited}
          onToggle={onFavoriteToggle}
        />
      </div>
    </div>
  );
});

export default CardMedia;
