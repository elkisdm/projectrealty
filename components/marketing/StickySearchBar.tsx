'use client';

import { Search } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface StickySearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  className?: string;
  initialValue?: string;
  integrated?: boolean; // Si está integrado en Header, no maneja su propio sticky
}

export function StickySearchBar({
  onSearch,
  placeholder = 'Buscar por comuna, dirección...',
  className = '',
  initialValue = '',
  integrated = false,
}: StickySearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialValue);
  const [isSticky, setIsSticky] = useState(false);
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check for prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setShouldReduceMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setShouldReduceMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Handle scroll detection for sticky behavior (solo si no está integrado)
  useEffect(() => {
    if (integrated) {
      // Cuando está integrado, siempre está sticky
      setIsSticky(true);
      return;
    }

    const handleScroll = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        // Activate sticky when scrolled past initial position
        setIsSticky(window.scrollY > 100);
      }
    };

    // Initial check
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [integrated]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  const handleSearch = () => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    if (onSearch) {
      onSearch(trimmedQuery);
    } else {
      // Navigate to search page
      router.push(`/buscar?q=${encodeURIComponent(trimmedQuery)}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div
      ref={containerRef}
      className={`
        w-full max-w-2xl mx-auto
        ${!integrated && isSticky ? 'sticky top-4 z-50' : 'relative'}
        transition-all duration-300
        ${shouldReduceMotion ? '' : 'ease-out'}
        ${className}
      `}
    >
      <form
        onSubmit={handleSubmit}
        className={`
          glass-strong
          rounded-full
          border border-white/20
          shadow-lg
          px-4 py-3
          flex items-center gap-3
          ${isSticky && !shouldReduceMotion ? 'shadow-xl scale-[1.02]' : ''}
          transition-all duration-300
        `}
      >
        {/* Search Input */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="
            bg-transparent
            border-0
            outline-none
            flex-1
            text-text
            placeholder:text-text-muted
            text-base
            focus:outline-none
            focus-visible:ring-0
          "
          aria-label="Buscar propiedades"
        />

        {/* Search Button */}
        <button
          type="submit"
          className="
            rounded-full
            bg-[#8B6CFF]
            hover:bg-[#7a5ce6]
            w-12 h-12
            flex items-center justify-center
            text-white
            active:scale-95
            transition-all duration-200
            focus:outline-none
            focus-visible:ring-2
            focus-visible:ring-brand-violet
            focus-visible:ring-offset-2
            focus-visible:ring-offset-transparent
            disabled:opacity-50
            disabled:cursor-not-allowed
          "
          aria-label="Buscar"
          disabled={!query.trim()}
        >
          <Search className="w-5 h-5" aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}
