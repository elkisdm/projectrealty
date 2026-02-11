'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, CalendarDays, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface HeroSectionProps {
  communes: string[];
  availableCount: number;
  minPrice?: number;
}

export function HeroSection({ communes, availableCount, minPrice }: HeroSectionProps) {
  const router = useRouter();
  const [currentCommuneIndex, setCurrentCommuneIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  useEffect(() => {
    if (communes.length === 0) return;
    const interval = setInterval(() => {
      setCurrentCommuneIndex((prev) => (prev + 1) % communes.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [communes]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/buscar?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/buscar');
    }
  };

  return (
    <section className="relative overflow-hidden">
      {/* Hero Image Background */}
      <div className="relative h-[70vh] min-h-[500px] max-h-[720px]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/images/hero-santiago.jpg)' }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
        </div>

        {/* Hero Content */}
        <div className="relative flex flex-col items-center justify-center h-full px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            className="max-w-3xl mx-auto"
          >
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl text-balance leading-tight">
              Encuentra tu hogar ideal en{' '}
              <span className="relative inline-block">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={communes[currentCommuneIndex]}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.35 }}
                    className="inline-block text-white"
                    style={{ textDecoration: 'underline', textDecorationColor: 'var(--accent)', textUnderlineOffset: '6px', textDecorationThickness: '3px' }}
                  >
                    {communes[currentCommuneIndex]}
                  </motion.span>
                </AnimatePresence>
              </span>
            </h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-4 text-base text-white/90 sm:text-lg lg:text-xl max-w-2xl mx-auto font-medium"
            >
              Arrienda departamentos con 0% de comision. Agenda visitas, compara precios y arrienda 100% online.
            </motion.p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-8 w-full max-w-2xl px-4"
          >
            <form onSubmit={handleSearch}>
              <div className="search-pill px-2 py-2 bg-white shadow-xl">
                {/* Mobile: Simple search */}
                <div className="flex items-center w-full md:hidden">
                  <div className="flex-1 flex items-center gap-3 px-4 py-2">
                    <Search className="w-5 h-5 text-accent flex-shrink-0" aria-hidden="true" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Busca por comuna o edificio..."
                      className="w-full bg-transparent text-text text-base outline-none placeholder:text-subtext"
                      aria-label="Buscar departamentos"
                    />
                  </div>
                  <button
                    type="submit"
                    className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-accent text-white transition-colors hover:bg-accent-secondary"
                    aria-label="Buscar"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                </div>

                {/* Desktop: Segmented search bar */}
                <div className="hidden md:flex items-center w-full">
                  <button
                    type="button"
                    onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                    className="flex-1 flex items-center gap-3 px-6 py-3 rounded-full hover:bg-bg-secondary transition-colors text-left"
                  >
                    <MapPin className="w-4 h-4 text-accent flex-shrink-0" aria-hidden="true" />
                    <div>
                      <div className="text-xs font-semibold text-text">Ubicacion</div>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Busca por comuna..."
                        className="w-full bg-transparent text-sm text-subtext outline-none placeholder:text-text-muted"
                        onClick={(e) => e.stopPropagation()}
                        aria-label="Buscar por ubicacion"
                      />
                    </div>
                  </button>

                  <div className="w-px h-8 bg-border" role="separator" />

                  <button
                    type="button"
                    className="flex items-center gap-3 px-6 py-3 rounded-full hover:bg-bg-secondary transition-colors text-left"
                  >
                    <CalendarDays className="w-4 h-4 text-accent flex-shrink-0" aria-hidden="true" />
                    <div>
                      <div className="text-xs font-semibold text-text">Fecha</div>
                      <div className="text-sm text-subtext">Agenda visita</div>
                    </div>
                  </button>

                  <div className="w-px h-8 bg-border" role="separator" />

                  <button
                    type="button"
                    className="flex items-center gap-3 px-6 py-3 rounded-full hover:bg-bg-secondary transition-colors text-left"
                  >
                    <Users className="w-4 h-4 text-accent flex-shrink-0" aria-hidden="true" />
                    <div>
                      <div className="text-xs font-semibold text-text">Dormitorios</div>
                      <div className="text-sm text-subtext">1, 2 o 3+</div>
                    </div>
                  </button>

                  <button
                    type="submit"
                    className="flex-shrink-0 flex items-center justify-center gap-2 px-6 h-12 rounded-full bg-accent text-white font-semibold transition-all hover:bg-accent-secondary hover:shadow-lg"
                    aria-label="Buscar departamentos"
                  >
                    <Search className="w-4 h-4" />
                    <span>Buscar</span>
                  </button>
                </div>
              </div>
            </form>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-6 flex items-center gap-4 sm:gap-8"
          >
            <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-2">
              <span className="text-sm font-bold text-white">+{availableCount}</span>
              <span className="text-xs text-white/80">disponibles</span>
            </div>
            <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-2">
              <span className="text-sm font-bold text-white">0%</span>
              <span className="text-xs text-white/80">comision</span>
            </div>
            {minPrice && (
              <div className="hidden sm:flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-2">
                <span className="text-sm font-bold text-white">
                  ${minPrice.toLocaleString('es-CL')}
                </span>
                <span className="text-xs text-white/80">desde</span>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
