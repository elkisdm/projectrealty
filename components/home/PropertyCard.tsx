'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface PropertyCardProps {
  id: string;
  slug: string;
  buildingName: string;
  comuna: string;
  tipologia: string;
  m2?: number;
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  images: string[];
  amenities?: string[];
  priority?: boolean;
}

export function PropertyCard({
  id,
  slug,
  buildingName,
  comuna,
  tipologia,
  m2,
  price,
  bedrooms,
  bathrooms,
  images,
  amenities = [],
  priority = false,
}: PropertyCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const displayImages = images.length > 0 ? images : ['/images/property-santiago.jpg'];

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % displayImages.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  const toggleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  const bedroomLabel = bedrooms === 0 ? 'Estudio' : `${bedrooms} dorm.`;
  const bathroomLabel = bathrooms ? `${bathrooms} bano${bathrooms > 1 ? 's' : ''}` : '';

  return (
    <Link
      href={`/arrienda-sin-comision/${slug}?unit=${id}`}
      className="group block"
    >
      <article className="property-card">
        {/* Image Carousel */}
        <div className="relative aspect-square rounded-xl overflow-hidden bg-surface">
          {/* Image */}
          <Image
            src={displayImages[currentImageIndex]}
            alt={`${buildingName} en ${comuna} - ${tipologia}`}
            fill
            className={`object-cover transition-opacity duration-300 ${
              isImageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            priority={priority}
            onLoad={() => setIsImageLoaded(true)}
          />

          {/* Skeleton while loading */}
          {!isImageLoaded && (
            <div className="absolute inset-0 loading-skeleton" />
          )}

          {/* Like button */}
          <button
            onClick={toggleLike}
            className="absolute top-3 right-3 z-10 p-2 rounded-full transition-transform active:scale-90"
            aria-label={isLiked ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          >
            <Heart
              className={`w-6 h-6 drop-shadow-md transition-colors ${
                isLiked
                  ? 'fill-accent text-accent'
                  : 'fill-black/40 text-white stroke-[2.5]'
              }`}
            />
          </button>

          {/* Carousel arrows */}
          {displayImages.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-white/90 shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hover:scale-105 min-h-[44px] min-w-[44px]"
                aria-label="Imagen anterior"
              >
                <ChevronLeft className="w-4 h-4 text-text" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-white/90 shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hover:scale-105 min-h-[44px] min-w-[44px]"
                aria-label="Imagen siguiente"
              >
                <ChevronRight className="w-4 h-4 text-text" />
              </button>
            </>
          )}

          {/* Dots indicator */}
          {displayImages.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5">
              {displayImages.slice(0, 5).map((_, index) => (
                <div
                  key={index}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    index === currentImageIndex
                      ? 'bg-white w-2'
                      : 'bg-white/60'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Badge: 0% comision */}
          <div className="absolute top-3 left-3 z-10">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white text-xs font-semibold text-text shadow-sm">
              0% comision
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="pt-3 pb-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-semibold text-text leading-snug line-clamp-1">
              {buildingName}, {comuna}
            </h3>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Star className="w-3.5 h-3.5 fill-text text-text" aria-hidden="true" />
              <span className="text-sm font-medium text-text">4.8</span>
            </div>
          </div>

          <p className="mt-0.5 text-sm text-subtext line-clamp-1">
            {bedroomLabel}
            {bathroomLabel && ` - ${bathroomLabel}`}
            {m2 && ` - ${m2} m\u00B2`}
          </p>

          {amenities.length > 0 && (
            <p className="mt-0.5 text-sm text-subtext line-clamp-1">
              {amenities.slice(0, 3).join(' - ')}
            </p>
          )}

          <p className="mt-1.5">
            <span className="text-base font-semibold text-text">
              {formatPrice(price)}
            </span>
            <span className="text-sm text-subtext">{' / mes'}</span>
          </p>
        </div>
      </article>
    </Link>
  );
}
