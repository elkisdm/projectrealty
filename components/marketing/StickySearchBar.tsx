"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search, ChevronDown, ChevronUp, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { SearchInput } from "@/components/filters/SearchInput";
import { SearchPills } from "./SearchPills";
import { searchFormInputSchema, searchFormSchema, type SearchFormInput } from "@/lib/validations/search";
import { useSearchFormContext } from "./SearchFormContext";
import { useScrollPosition } from "@/hooks/useScrollPosition";

interface StickySearchBarProps {
  className?: string;
}

/**
 * Barra de búsqueda sticky que aparece al hacer scroll
 * Inspirado en Airbnb, Booking.com y otras startups líderes
 * Diseño mobile-first con transiciones suaves
 * Con animación fluida tipo "gota" desde el hero
 */
export function StickySearchBar({ className = "" }: StickySearchBarProps) {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const { formState: contextFormState, updateFormState } = useSearchFormContext();
  const { isScrolled } = useScrollPosition({ threshold: 250 });
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  // Ref para evitar ciclo infinito: rastrear los últimos valores sincronizados del contexto
  const lastSyncedContext = useRef<SearchFormInput>({
    q: contextFormState.q,
    comuna: contextFormState.comuna,
    dormitorios: contextFormState.dormitorios,
    precioMin: contextFormState.precioMin,
    precioMax: contextFormState.precioMax,
  });
  // Ref para evitar sincronización bidireccional simultánea
  const isSyncingFromContext = useRef(false);
  const isSyncingFromForm = useRef(false);

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    setError,
    watch,
    register,
  } = useForm<SearchFormInput>({
    resolver: zodResolver(searchFormInputSchema),
    defaultValues: contextFormState,
  });

  // Observar valores para sincronizar pills
  const comuna = watch("comuna");
  const dormitorios = watch("dormitorios");
  const q = watch("q");
  const precioMin = watch("precioMin");
  const precioMax = watch("precioMax");

  // Extraer valores individuales del contexto para evitar re-renders por cambio de referencia del objeto
  const contextQ = contextFormState.q;
  const contextComuna = contextFormState.comuna;
  const contextDormitorios = contextFormState.dormitorios;
  const contextPrecioMin = contextFormState.precioMin;
  const contextPrecioMax = contextFormState.precioMax;

  // Sincronizar valores del contexto al formulario cuando cambian
  useEffect(() => {
    // Evitar sincronización si estamos sincronizando desde el formulario
    if (isSyncingFromForm.current) {
      return;
    }

    // Verificar si el contexto cambió desde la última sincronización
    const contextChanged =
      lastSyncedContext.current.q !== contextQ ||
      lastSyncedContext.current.comuna !== contextComuna ||
      lastSyncedContext.current.dormitorios !== contextDormitorios ||
      lastSyncedContext.current.precioMin !== contextPrecioMin ||
      lastSyncedContext.current.precioMax !== contextPrecioMax;

    if (!contextChanged) {
      return;
    }

    // Verificar si hay cambios reales entre contexto y formulario antes de sincronizar
    const hasFormChanges =
      (contextQ !== undefined && contextQ !== q) ||
      (contextComuna !== undefined && contextComuna !== comuna) ||
      (contextDormitorios !== undefined && contextDormitorios !== dormitorios) ||
      (contextPrecioMin !== undefined && contextPrecioMin !== precioMin) ||
      (contextPrecioMax !== undefined && contextPrecioMax !== precioMax);

    if (!hasFormChanges) {
      // Actualizar la referencia aunque no haya cambios en el formulario
      lastSyncedContext.current = {
        q: contextQ,
        comuna: contextComuna,
        dormitorios: contextDormitorios,
        precioMin: contextPrecioMin,
        precioMax: contextPrecioMax,
      };
      return;
    }

    // Marcar que estamos sincronizando desde el contexto
    isSyncingFromContext.current = true;

    // Sincronizar valores del contexto al formulario
    if (contextQ !== undefined && contextQ !== q) {
      setValue("q", contextQ, { shouldDirty: false });
    }
    if (contextComuna !== undefined && contextComuna !== comuna) {
      setValue("comuna", contextComuna, { shouldDirty: false });
    }
    if (contextDormitorios !== undefined && contextDormitorios !== dormitorios) {
      setValue("dormitorios", contextDormitorios, { shouldDirty: false });
    }
    if (contextPrecioMin !== undefined && contextPrecioMin !== precioMin) {
      setValue("precioMin", contextPrecioMin, { shouldDirty: false });
    }
    if (contextPrecioMax !== undefined && contextPrecioMax !== precioMax) {
      setValue("precioMax", contextPrecioMax, { shouldDirty: false });
    }

    // Actualizar la referencia con los valores sincronizados
    lastSyncedContext.current = {
      q: contextQ,
      comuna: contextComuna,
      dormitorios: contextDormitorios,
      precioMin: contextPrecioMin,
      precioMax: contextPrecioMax,
    };

    // Resetear el flag después de un pequeño delay para permitir que React procese los cambios
    setTimeout(() => {
      isSyncingFromContext.current = false;
    }, 0);
  }, [setValue, q, comuna, dormitorios, precioMin, precioMax, contextQ, contextComuna, contextDormitorios, contextPrecioMin, contextPrecioMax]);

  // Sincronizar cambios del formulario con el contexto
  useEffect(() => {
    // Evitar sincronización si estamos sincronizando desde el contexto
    if (isSyncingFromContext.current) {
      return;
    }

    // Evitar ciclo infinito: no sincronizar si el contexto ya tiene estos valores
    const contextMatchesForm =
      lastSyncedContext.current.q === q &&
      lastSyncedContext.current.comuna === comuna &&
      lastSyncedContext.current.dormitorios === dormitorios &&
      lastSyncedContext.current.precioMin === precioMin &&
      lastSyncedContext.current.precioMax === precioMax;

    if (contextMatchesForm) {
      return;
    }

    // Solo actualizar si hay cambios reales para evitar loops
    const hasChanges =
      contextQ !== q ||
      contextComuna !== comuna ||
      contextDormitorios !== dormitorios ||
      contextPrecioMin !== precioMin ||
      contextPrecioMax !== precioMax;

    if (hasChanges) {
      // Marcar que estamos sincronizando desde el formulario
      isSyncingFromForm.current = true;

      updateFormState({
        q,
        comuna,
        dormitorios,
        precioMin,
        precioMax,
      });

      // Actualizar la referencia después de actualizar el contexto
      lastSyncedContext.current = {
        q,
        comuna,
        dormitorios,
        precioMin,
        precioMax,
      };

      // Resetear el flag después de un pequeño delay
      setTimeout(() => {
        isSyncingFromForm.current = false;
      }, 0);
    }
  }, [q, comuna, dormitorios, precioMin, precioMax, updateFormState, contextQ, contextComuna, contextDormitorios, contextPrecioMin, contextPrecioMax]);

  // Opciones para pills
  const comunasPrincipales = ["Las Condes", "Ñuñoa", "Providencia", "Santiago", "Macul", "La Florida"];
  const dormitoriosOptions = ["Estudio", "1", "2", "3"];

  const onSubmit = (data: SearchFormInput) => {
    // Validar con Zod
    const result = searchFormSchema.safeParse(data);
    if (!result.success) {
      result.error.errors.forEach((error) => {
        if (error.path.length > 0) {
          const field = error.path[0] as keyof SearchFormInput;
          setError(field, {
            type: "manual",
            message: error.message,
          });
        }
      });
      return;
    }

    const validatedData = result.data;
    const params = new URLSearchParams();

    if (validatedData.q && validatedData.q.trim()) {
      params.set("q", validatedData.q.trim());
    }
    if (validatedData.comuna) {
      params.set("comuna", validatedData.comuna);
    }
    if (validatedData.precioMin !== undefined) {
      params.set("precioMin", validatedData.precioMin.toString());
    }
    if (validatedData.precioMax !== undefined) {
      params.set("precioMax", validatedData.precioMax.toString());
    }
    if (validatedData.dormitorios) {
      params.set("dormitorios", validatedData.dormitorios);
    }

    const queryString = params.toString();
    router.push(`/buscar${queryString ? `?${queryString}` : ""}`);
  };

  const searchValue = watch("q") || "";


  return (
    <AnimatePresence>
      {isScrolled && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={
            prefersReducedMotion
              ? {}
              : {
                duration: 0.2,
                ease: "easeOut",
              }
          }
          className={`fixed top-3 left-0 right-0 z-[100] w-full px-3 sm:top-4 sm:px-6 lg:px-8 safe-area-top ${className}`}
          role="banner"
          aria-label="Barra de búsqueda sticky"
        >
          <div className="mx-auto max-w-7xl rounded-xl sm:rounded-2xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200/60 dark:border-gray-700/60 shadow-xl shadow-gray-900/10 dark:shadow-gray-900/30 ring-1 ring-gray-900/5 dark:ring-gray-100/10 transition-all duration-300">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-0"
              role="search"
              aria-label="Buscar departamentos"
            >
              {/* Fila principal: Input + Botones */}
              <div className="flex items-center gap-2 px-4 py-3 sm:px-5 sm:py-3.5">
                {/* Input de búsqueda - ocupa todo el espacio disponible */}
                <div className="flex-1 min-w-0">
                  <label htmlFor="sticky-search-input" className="sr-only">
                    Buscar departamentos
                  </label>
                  <div className="relative">
                    <SearchInput
                      value={searchValue}
                      onChange={(value) => setValue("q", value, { shouldValidate: true })}
                      placeholder="Buscar departamentos..."
                      className="w-full text-sm sm:text-base"
                      autoFocus={false}
                    />
                    {errors.q && (
                      <p className="absolute top-full left-0 mt-1 text-xs text-red-500 z-50" role="alert">
                        {errors.q.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Botón de búsqueda - compacto en mobile, solo icono */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative flex-shrink-0 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-primary to-primary/90 px-3 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition-all duration-200 hover:shadow-lg hover:shadow-primary/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 sm:px-5 sm:py-3 min-h-[44px] min-w-[44px] sm:min-w-[100px]"
                  aria-label={isSubmitting ? "Buscando..." : "Buscar departamentos"}
                >
                  <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary to-secondary opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                  <Search className="w-5 h-5 relative z-10 sm:w-4 sm:h-4" aria-hidden="true" />
                  <span className="relative z-10 hidden sm:inline ml-1.5">
                    {isSubmitting ? "Buscando..." : "Buscar"}
                  </span>
                </button>

                {/* Botón de filtros */}
                <button
                  type="button"
                  onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                  aria-expanded={isFiltersOpen}
                  aria-controls="sticky-filters-panel"
                  className="flex-shrink-0 inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-300/60 dark:border-gray-600/60 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm px-3 py-2.5 text-sm font-medium text-text transition-all duration-200 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary min-h-[44px] min-w-[44px] sm:min-w-[auto]"
                  aria-label={isFiltersOpen ? "Ocultar filtros" : "Mostrar filtros"}
                >
                  {isFiltersOpen ? (
                    <>
                      <ChevronUp className="w-4 h-4" aria-hidden="true" />
                      <span className="hidden sm:inline text-xs">Filtros</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" aria-hidden="true" />
                      <span className="hidden sm:inline text-xs">Filtros</span>
                    </>
                  )}
                </button>
              </div>

              {/* Panel de filtros desplegable */}
              <AnimatePresence>
                {isFiltersOpen && (
                  <motion.div
                    id="sticky-filters-panel"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={
                      prefersReducedMotion
                        ? {}
                        : {
                          duration: 0.3,
                          ease: "easeInOut",
                        }
                    }
                    className="overflow-hidden border-t border-gray-200/60 dark:border-gray-700/60"
                  >
                    <div className="px-4 py-4 space-y-4 sm:px-5">
                      {/* Pills de Comuna */}
                      <SearchPills
                        options={comunasPrincipales}
                        selected={comuna}
                        onSelect={(value) => {
                          const stringValue = Array.isArray(value) ? value[0] : value;
                          setValue("comuna", stringValue || undefined, { shouldValidate: true });
                        }}
                        label=""
                        className="justify-start"
                      />

                      {/* Pills de Dormitorios */}
                      <SearchPills
                        options={dormitoriosOptions}
                        selected={dormitorios}
                        onSelect={(value) =>
                          setValue("dormitorios", (value as "Estudio" | "1" | "2" | "3") || undefined, {
                            shouldValidate: true,
                          })
                        }
                        label=""
                        className="justify-start"
                      />

                      {/* Inputs de Precio */}
                      <div className="flex items-center gap-3 flex-wrap">
                        <label htmlFor="precioMin" className="text-sm font-semibold text-text whitespace-nowrap">
                          Precio:
                        </label>
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <motion.input
                            type="number"
                            id="precioMin"
                            {...register("precioMin")}
                            placeholder="Mín $"
                            min="0"
                            className="ui-input w-full min-w-[100px]"
                            whileFocus={prefersReducedMotion ? {} : { scale: 1.02 }}
                            transition={{ duration: 0.2 }}
                          />
                          <span className="text-subtext font-medium flex-shrink-0">-</span>
                          <motion.input
                            type="number"
                            id="precioMax"
                            {...register("precioMax")}
                            placeholder="Máx $"
                            min="0"
                            className="ui-input w-full min-w-[100px]"
                            whileFocus={prefersReducedMotion ? {} : { scale: 1.02 }}
                            transition={{ duration: 0.2 }}
                          />
                        </div>
                        {(errors.precioMin || errors.precioMax) && (
                          <div className="w-full">
                            {errors.precioMin && (
                              <p className="text-xs text-red-500" role="alert">
                                {errors.precioMin.message}
                              </p>
                            )}
                            {errors.precioMax && (
                              <p className="text-xs text-red-500" role="alert">
                                {errors.precioMax.message}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
