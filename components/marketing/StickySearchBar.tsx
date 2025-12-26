'use client';

import { useState, useEffect, FormEvent } from 'react';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { clx } from '@lib/utils';

interface StickySearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  className?: string;
  integrated?: boolean;
}

export function StickySearchBar({
  onSearch,
  placeholder = "Buscar por comuna, dirección, nombre de edificio...",
  className = '',
  integrated = false
}: StickySearchBarProps) {
  const [query, setQuery] = useState('');
  const [isSticky, setIsSticky] = useState(false);
  const router = useRouter();

  // Detectar scroll para activar sticky
  useEffect(() => {
    if (integrated) {
      // Si está integrado, el sticky se maneja desde el componente padre
      return;
    }

    const handleScroll = () => {
      const shouldBeSticky = window.scrollY > 100;
      setIsSticky(shouldBeSticky);
    };

    // Verificar posición inicial
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [integrated]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!query.trim()) {
      return;
    }

    if (onSearch) {
      onSearch(query.trim());
    } else {
      // Navegar a página de búsqueda
      router.push(`/buscar?q=${encodeURIComponent(query.trim())}`);
    }

    setQuery('');
  };

  const containerClasses = clx(
    'relative w-full max-w-2xl mx-auto',
    !integrated && isSticky && 'sticky top-4 z-50',
    className
  );

  return (
    <form
      onSubmit={handleSubmit}
      className={containerClasses}
      role="search"
      aria-label="Búsqueda de propiedades"
    >
      <div
        className={clx(
          'relative flex items-center gap-3',
          'bg-white/10 dark:bg-gray-800/80',
          'backdrop-blur-md',
          'rounded-full',
          'border border-white/20 dark:border-gray-700/50',
          'shadow-lg',
          'px-4 py-3',
          'transition-all duration-300',
          !integrated && isSticky && 'shadow-xl scale-[1.02]'
        )}
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className={clx(
            'flex-1',
            'bg-transparent',
            'border-0',
            'outline-none',
            'text-text',
            'placeholder:text-text-muted',
            'text-base',
            'focus:outline-none'
          )}
          aria-label="Buscar propiedades"
        />
        <button
          type="submit"
          className={clx(
            'flex-shrink-0',
            'w-10 h-10',
            'rounded-full',
            'bg-[#8B6CFF]',
            'hover:bg-[#7a5ce6]',
            'active:scale-95',
            'transition-all duration-200',
            'flex items-center justify-center',
            'focus:outline-none focus:ring-2 focus:ring-[#8B6CFF]/50 focus:ring-offset-2'
          )}
          aria-label="Buscar"
        >
          <Search className="w-5 h-5 text-white" />
        </button>
      </div>
    </form>
  );
}


