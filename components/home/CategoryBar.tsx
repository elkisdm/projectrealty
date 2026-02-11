'use client';

import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import {
  Building2,
  Home,
  Landmark,
  TreePine,
  Waves,
  Dumbbell,
  Dog,
  Star,
  TrendingDown,
  BedDouble,
  Sparkles,
} from 'lucide-react';

export type CategoryFilter = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const categories: CategoryFilter[] = [
  { id: 'all', label: 'Todos', icon: Sparkles },
  { id: 'featured', label: 'Destacados', icon: Star },
  { id: 'studio', label: 'Estudios', icon: Home },
  { id: '1d', label: '1 Dormitorio', icon: BedDouble },
  { id: '2d', label: '2 Dormitorios', icon: Building2 },
  { id: 'economic', label: 'Economicos', icon: TrendingDown },
  { id: 'pool', label: 'Con Piscina', icon: Waves },
  { id: 'gym', label: 'Con Gimnasio', icon: Dumbbell },
  { id: 'pet', label: 'Pet Friendly', icon: Dog },
  { id: 'park', label: 'Cerca de Parques', icon: TreePine },
  { id: 'metro', label: 'Cerca del Metro', icon: Landmark },
];

interface CategoryBarProps {
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

export function CategoryBar({ activeCategory, onCategoryChange }: CategoryBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeftArrow(scrollLeft > 10);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = 200;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <div className="sticky top-0 z-30 bg-bg border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center gap-4 py-3">
          {/* Left scroll arrow */}
          {showLeftArrow && (
            <button
              onClick={() => scroll('left')}
              className="hidden md:flex absolute left-0 z-10 items-center justify-center w-8 h-8 rounded-full border border-border bg-bg shadow-sm hover:shadow-md transition-shadow"
              aria-label="Desplazar categorias a la izquierda"
            >
              <ChevronLeft className="w-4 h-4 text-text" />
            </button>
          )}

          {/* Scrollable categories */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex-1 flex items-center gap-6 overflow-x-auto scrollbar-hide px-1"
            role="tablist"
            aria-label="Filtrar por categoria"
          >
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = activeCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => onCategoryChange(category.id)}
                  role="tab"
                  aria-selected={isActive}
                  className={`category-chip flex-shrink-0 min-h-[48px] ${isActive ? 'active' : ''}`}
                >
                  <Icon className="w-6 h-6" aria-hidden="true" />
                  <span className="whitespace-nowrap">{category.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right scroll arrow */}
          {showRightArrow && (
            <button
              onClick={() => scroll('right')}
              className="hidden md:flex absolute right-16 z-10 items-center justify-center w-8 h-8 rounded-full border border-border bg-bg shadow-sm hover:shadow-md transition-shadow"
              aria-label="Desplazar categorias a la derecha"
            >
              <ChevronRight className="w-4 h-4 text-text" />
            </button>
          )}

          {/* Filters button */}
          <button
            className="hidden md:flex items-center gap-2 flex-shrink-0 px-4 py-3 rounded-xl border border-border hover:shadow-md transition-all text-sm font-medium text-text min-h-[48px]"
            aria-label="Abrir filtros avanzados"
          >
            <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
            <span>Filtros</span>
          </button>
        </div>
      </div>
    </div>
  );
}
