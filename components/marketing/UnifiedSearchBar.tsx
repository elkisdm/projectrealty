'use client';

import { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clx } from '@lib/utils';
import { searchFormInputSchema, type SearchFormInput } from '@/lib/validations/search';
import { SearchPills } from './SearchPills';

export interface SearchFilters {
    q?: string;
    comuna?: string | string[];
    dormitorios?: 'Estudio' | '1' | '2' | '3' | Array<'Estudio' | '1' | '2' | '3'>;
    estacionamiento?: boolean;
    bodega?: boolean;
    petFriendly?: boolean;
    precioMin?: number;
    precioMax?: number;
}

interface UnifiedSearchBarProps {
    variant?: 'hero' | 'sticky' | 'inline';
    onSearch?: (filters: SearchFilters) => void;
    initialFilters?: Partial<SearchFilters>;
    showAdvancedFilters?: boolean;
    className?: string;
}

const COMUNAS_PRINCIPALES = ['Las Condes', 'Ñuñoa', 'Providencia', 'Santiago', 'Macul', 'La Florida'];
const DORMITORIOS_OPTIONS = ['Estudio', '1', '2', '3'] as const;

export function UnifiedSearchBar({
    variant = 'inline',
    onSearch,
    initialFilters,
    showAdvancedFilters = true,
    className = '',
}: UnifiedSearchBarProps) {
    const router = useRouter();
    const [isExpanded, setIsExpanded] = useState(false);
    const [showFiltersModal, setShowFiltersModal] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Convert SearchFilters to SearchFormInput format
    const convertFiltersToFormInput = (filters?: Partial<SearchFilters>): Partial<SearchFormInput> => {
        if (!filters) return {};
        return {
            q: filters.q,
            comuna: Array.isArray(filters.comuna) ? filters.comuna[0] : filters.comuna,
            dormitorios: Array.isArray(filters.dormitorios) ? filters.dormitorios[0] : filters.dormitorios,
            estacionamiento: filters.estacionamiento !== undefined ? (filters.estacionamiento ? "true" : "false") : undefined,
            bodega: filters.bodega !== undefined ? (filters.bodega ? "true" : "false") : undefined,
            petFriendly: filters.petFriendly !== undefined ? (filters.petFriendly ? "true" : "false") : undefined,
            precioMin: filters.precioMin !== undefined ? String(filters.precioMin) : undefined,
            precioMax: filters.precioMax !== undefined ? String(filters.precioMax) : undefined,
        };
    };

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setValue,
        watch,
        reset,
    } = useForm<SearchFormInput>({
        resolver: zodResolver(searchFormInputSchema),
        defaultValues: convertFiltersToFormInput(initialFilters),
    });

    // Watch values for UI updates
    const q = watch('q');
    const comuna = watch('comuna');
    const dormitorios = watch('dormitorios');
    const precioMin = watch('precioMin');
    const precioMax = watch('precioMax');

    // Count active filters - handle arrays for multi-select
    const activeFiltersCount = [comuna, dormitorios, precioMin, precioMax].filter(
        value => Array.isArray(value) ? value.length > 0 : Boolean(value)
    ).length;

    // Set mounted state for client-only rendering (portal)
    useEffect(() => {
        setMounted(true);
        // Detect mobile on client side
        setIsMobile(typeof window !== 'undefined' && window.innerWidth < 768);
        
        // Update on resize
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const onSubmit = useCallback(
        (data: SearchFormInput) => {
            const filters: SearchFilters = {
                q: data.q?.trim(),
                comuna: data.comuna,
                dormitorios: data.dormitorios,
                precioMin: data.precioMin ? Number(data.precioMin) : undefined,
                precioMax: data.precioMax ? Number(data.precioMax) : undefined,
            };

            if (onSearch) {
                onSearch(filters);
            } else {
                // Navigate to search results
                const params = new URLSearchParams();
                Object.entries(filters).forEach(([key, value]) => {
                    if (value !== undefined && value !== '') {
                        // Handle arrays for multi-select filters
                        if (Array.isArray(value)) {
                            value.forEach(v => params.append(key, String(v)));
                        } else {
                            params.set(key, String(value));
                        }
                    }
                });
                router.push(`/buscar${params.toString() ? `?${params.toString()}` : ''}`);
            }

            // Collapse on mobile after search
            if (isMobile) {
                setIsExpanded(false);
                setShowFiltersModal(false);
            }
        },
        [onSearch, router]
    );

    const clearFilters = useCallback(() => {
        reset();
    }, [reset]);

    // Variant-specific classes
    const containerClasses = clx(
        'w-full transition-all duration-300',
        variant === 'hero' && 'relative',
        className
    );

    const formClasses = clx(
        'relative',
        variant === 'hero' && 'max-w-4xl mx-auto',
    );

    // Mobile: Full screen modal
    if (isExpanded && isMobile) {
        return (
            <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900">
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                        <h2 className="text-lg font-semibold">Buscar Departamentos</h2>
                        <button
                            onClick={() => setIsExpanded(false)}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            aria-label="Cerrar búsqueda"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Search Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-4 space-y-6">
                        {/* Search Input */}
                        <div>
                            <input
                                type="text"
                                {...register('q')}
                                placeholder="Comuna, dirección, nombre de edificio..."
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8B6CFF] transition-colors"
                                autoFocus
                            />
                        </div>

                        {/* Filtros rápidos: Comuna */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Filtros rápidos
                            </label>
                            <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
                                {COMUNAS_PRINCIPALES.slice(0, 3).map((c) => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => setValue('comuna', comuna === c ? undefined : c)}
                                        className={clx(
                                            'flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all',
                                            comuna === c
                                                ? 'bg-[#8B6CFF] text-white'
                                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                        )}
                                    >
                                        {c}
                                    </button>
                                ))}
                                {COMUNAS_PRINCIPALES.length > 3 && (
                                    <button
                                        type="button"
                                        onClick={() => setShowFiltersModal(true)}
                                        className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                                    >
                                        +{COMUNAS_PRINCIPALES.length - 3} más
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Más filtros button */}
                        <button
                            type="button"
                            onClick={() => setShowFiltersModal(true)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            <SlidersHorizontal className="w-4 h-4" />
                            <span>Más filtros</span>
                            {activeFiltersCount > 0 && (
                                <span className="ml-auto bg-[#8B6CFF] text-white text-xs font-medium px-2 py-1 rounded-full">
                                    {activeFiltersCount}
                                </span>
                            )}
                        </button>

                        {/* Bottom Sheet - Advanced Filters */}
                        <AnimatePresence>
                            {showFiltersModal && (
                                <motion.div
                                    initial={{ y: '100%' }}
                                    animate={{ y: 0 }}
                                    exit={{ y: '100%' }}
                                    transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                                    className="fixed inset-x-0 bottom-0 bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl max-h-[80vh] overflow-y-auto z-[9999]"
                                >
                                    <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-semibold">Filtros</h3>
                                            <button
                                                onClick={() => setShowFiltersModal(false)}
                                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-4 space-y-6">
                                        {/* Dormitorios */}
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Dormitorios</label>
                                            <SearchPills
                                                options={[...DORMITORIOS_OPTIONS]}
                                                selected={dormitorios}
                                                onSelect={(value) => setValue('dormitorios', value as typeof dormitorios)}
                                                multiple={true}
                                            />
                                        </div>

                                        {/* Precio */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Precio desde</label>
                                                <input
                                                    type="number"
                                                    {...register('precioMin')}
                                                    placeholder="$"
                                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8B6CFF]"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Precio hasta</label>
                                                <input
                                                    type="number"
                                                    {...register('precioMax')}
                                                    placeholder="$"
                                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8B6CFF]"
                                                />
                                            </div>
                                        </div>

                                        {/* Comuna */}
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Comuna</label>
                                            <SearchPills
                                                options={COMUNAS_PRINCIPALES}
                                                selected={comuna}
                                                onSelect={(value) => setValue('comuna', Array.isArray(value) ? value[0] : value)}
                                                multiple={false}
                                            />
                                        </div>

                                        {/* Apply button */}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowFiltersModal(false);
                                                handleSubmit(onSubmit)();
                                            }}
                                            className="w-full bg-[#8B6CFF] hover:bg-[#7a5ce6] text-white py-3 rounded-xl font-semibold transition-colors"
                                        >
                                            Aplicar filtros
                                            {activeFiltersCount > 0 && ` (${activeFiltersCount})`}
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Submit Button (Fixed bottom) */}
                        <div className="sticky bottom-0 bg-white dark:bg-gray-900 pt-4 pb-2 -mx-4 px-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full flex items-center justify-center gap-2 bg-[#8B6CFF] hover:bg-[#7a5ce6] text-white px-6 py-4 rounded-xl font-semibold shadow-lg transition-all disabled:opacity-50"
                            >
                                <Search className="w-5 h-5" />
                                {isSubmitting ? 'Buscando...' : 'Buscar Departamentos'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    // Desktop/Tablet & Collapsed Mobile
    return (
        <div className={containerClasses}>
            <form onSubmit={handleSubmit(onSubmit)} className={formClasses}>
                <div
                    className={clx(
                        'flex items-center gap-3',
                        variant === 'hero' && [
                            'bg-white/10 dark:bg-gray-800/80 backdrop-blur-md',
                            'rounded-full border border-white/20 dark:border-gray-700/50',
                            'shadow-lg px-4 py-3',
                        ],
                        variant === 'inline' && ['bg-white dark:bg-gray-800', 'rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3']
                    )}
                >
                    {/* Search Input */}
                    <input
                        type="text"
                        {...register('q')}
                        placeholder="Buscar por comuna, dirección, nombre de edificio..."
                        onClick={() => {
                            if (isMobile) {
                                setIsExpanded(true);
                            }
                        }}
                        className={clx(
                            'flex-1 bg-transparent border-0 outline-none',
                            'text-text placeholder:text-text-muted',
                            'focus:outline-none',
                            variant === 'hero' && 'text-base'
                        )}
                        readOnly={isMobile}
                    />

                    {/* Filters Button (Desktop) */}
                    {showAdvancedFilters && (
                        <button
                            type="button"
                            onClick={() => setShowFiltersModal(true)}
                            className={clx(
                                'hidden md:flex items-center gap-2',
                                'px-4 py-2 rounded-full',
                                'border border-gray-200 dark:border-gray-700',
                                'hover:bg-gray-100 dark:hover:bg-gray-800',
                                'transition-colors text-sm font-medium'
                            )}
                        >
                            <SlidersHorizontal className="w-4 h-4" />
                            Filtros
                            {activeFiltersCount > 0 && (
                                <span className="bg-[#8B6CFF] text-white text-xs font-medium px-2 py-0.5 rounded-full">
                                    {activeFiltersCount}
                                </span>
                            )}
                        </button>
                    )}

                    {/* Search Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={clx(
                            'flex-shrink-0 rounded-full',
                            'bg-[#8B6CFF] hover:bg-[#7a5ce6]',
                            'transition-all duration-200',
                            'flex items-center justify-center',
                            'focus:outline-none focus:ring-2 focus:ring-[#8B6CFF]/50',
                            variant === 'hero' && 'w-10 h-10',
                            variant === 'sticky' && 'w-9 h-9',
                            variant === 'inline' && 'px-6 py-2 gap-2'
                        )}
                        aria-label="Buscar"
                    >
                        <Search className={variant === 'inline' ? 'w-4 h-4' : 'w-5 h-5'} color="white" />
                        {variant === 'inline' && <span className="hidden sm:inline text-white font-medium">Buscar</span>}
                    </button>
                </div>


                {/* Desktop Modal for Advanced Filters */}
                {mounted && showFiltersModal && !isMobile && createPortal(
                    <AnimatePresence>
                        {showFiltersModal && (
                            <>
                                {/* Backdrop */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setShowFiltersModal(false)}
                                    className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                                    style={{ zIndex: 9998 }}
                                />

                                {/* Modal */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, x: '-50%', y: '-50%' }}
                                    animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
                                    exit={{ opacity: 0, scale: 0.95, x: '-50%', y: '-50%' }}
                                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                                    className="fixed w-[calc(100%-2rem)] max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-h-[80vh] overflow-y-auto"
                                    style={{
                                        zIndex: 9999,
                                        top: '50%',
                                        left: '50%',
                                    }}
                                >
                                    {/* Header */}
                                    <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-6">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xl font-semibold">Filtros de Búsqueda</h3>
                                            <button
                                                onClick={() => setShowFiltersModal(false)}
                                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6 space-y-6">
                                        {/* Search Input (in modal) */}
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Buscar</label>
                                            <input
                                                type="text"
                                                {...register('q')}
                                                placeholder="Comuna, dirección, nombre de edificio..."
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8B6CFF] transition-colors"
                                            />
                                        </div>

                                        {/* Comuna */}
                                        <div>
                                            <label className="block text-sm font-medium mb-3">Comuna</label>
                                            <SearchPills
                                                options={COMUNAS_PRINCIPALES}
                                                selected={comuna}
                                                onSelect={(value) => setValue('comuna', Array.isArray(value) ? value[0] : value)}
                                                multiple={false}
                                            />
                                        </div>

                                        {/* Dormitorios */}
                                        <div>
                                            <label className="block text-sm font-medium mb-3">Dormitorios</label>
                                            <SearchPills
                                                options={[...DORMITORIOS_OPTIONS]}
                                                selected={dormitorios}
                                                onSelect={(value) => setValue('dormitorios', value as typeof dormitorios)}
                                                multiple={true}
                                            />
                                        </div>

                                        {/* Precio */}
                                        <div>
                                            <label className="block text-sm font-medium mb-3">Precio</label>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <input
                                                        type="number"
                                                        {...register('precioMin')}
                                                        placeholder="Desde $"
                                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8B6CFF] transition-colors"
                                                    />
                                                </div>
                                                <div>
                                                    <input
                                                        type="number"
                                                        {...register('precioMax')}
                                                        placeholder="Hasta $"
                                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8B6CFF] transition-colors"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-6 flex gap-3">
                                        <button
                                            type="button"
                                            onClick={clearFilters}
                                            className="flex-1 px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium transition-colors"
                                        >
                                            Limpiar filtros
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowFiltersModal(false);
                                                handleSubmit(onSubmit)();
                                            }}
                                            className="flex-1 bg-[#8B6CFF] hover:bg-[#7a5ce6] text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                                        >
                                            Buscar Departamentos
                                        </button>
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>,
                    document.body
                )}
            </form>
        </div>
    );
}
