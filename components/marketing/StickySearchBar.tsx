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
  // #region agent log
  useEffect(() => {
    fetch('http://127.0.0.1:7242/ingest/bf5372fb-b70d-4713-b992-51094d7d9401', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'StickySearchBar.tsx:43', message: 'watch function reference check', data: { watchType: typeof watch, watchStringified: String(watch).substring(0, 50) }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
  }, [watch]);
  // #endregion

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
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/bf5372fb-b70d-4713-b992-51094d7d9401', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'StickySearchBar.tsx:70', message: 'useEffect sync context->form ENTRY', data: { q, comuna, dormitorios, precioMin, precioMax, contextQ, contextComuna, contextDormitorios, contextPrecioMin, contextPrecioMax, lastSynced: lastSyncedContext.current }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'post-fix', hypothesisId: 'A' }) }).catch(() => { });
    // #endregion

    // Verificar si el contexto cambió desde la última sincronización (no desde nuestro propio updateFormState)
    const contextChanged =
      lastSyncedContext.current.q !== contextQ ||
      lastSyncedContext.current.comuna !== contextComuna ||
      lastSyncedContext.current.dormitorios !== contextDormitorios ||
      lastSyncedContext.current.precioMin !== contextPrecioMin ||
      lastSyncedContext.current.precioMax !== contextPrecioMax;

    if (!contextChanged) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/bf5372fb-b70d-4713-b992-51094d7d9401', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'StickySearchBar.tsx:79', message: 'useEffect sync context->form NO CONTEXT CHANGES', data: {}, timestamp: Date.now(), sessionId: 'debug-session', runId: 'post-fix', hypothesisId: 'C' }) }).catch(() => { });
      // #endregion
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
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/bf5372fb-b70d-4713-b992-51094d7d9401', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'StickySearchBar.tsx:95', message: 'useEffect sync context->form NO FORM CHANGES', data: {}, timestamp: Date.now(), sessionId: 'debug-session', runId: 'post-fix', hypothesisId: 'C' }) }).catch(() => { });
      // #endregion
      return;
    }

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
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/bf5372fb-b70d-4713-b992-51094d7d9401', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'StickySearchBar.tsx:115', message: 'useEffect sync context->form EXIT', data: {}, timestamp: Date.now(), sessionId: 'debug-session', runId: 'post-fix', hypothesisId: 'A' }) }).catch(() => { });
    // #endregion
  }, [setValue, q, comuna, dormitorios, precioMin, precioMax, contextQ, contextComuna, contextDormitorios, contextPrecioMin, contextPrecioMax]);

  // Sincronizar cambios del formulario con el contexto
  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/bf5372fb-b70d-4713-b992-51094d7d9401', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'StickySearchBar.tsx:147', message: 'useEffect sync form->context ENTRY', data: { q, comuna, dormitorios, precioMin, precioMax, contextQ, contextComuna, contextDormitorios, contextPrecioMin, contextPrecioMax, lastSynced: lastSyncedContext.current }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'post-fix', hypothesisId: 'C' }) }).catch(() => { });
    // #endregion

    // Evitar ciclo infinito: no sincronizar si el contexto ya tiene estos valores (viene de nuestra sincronización)
    const contextMatchesForm =
      lastSyncedContext.current.q === q &&
      lastSyncedContext.current.comuna === comuna &&
      lastSyncedContext.current.dormitorios === dormitorios &&
      lastSyncedContext.current.precioMin === precioMin &&
      lastSyncedContext.current.precioMax === precioMax;

    if (contextMatchesForm) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/bf5372fb-b70d-4713-b992-51094d7d9401', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'StickySearchBar.tsx:157', message: 'useEffect sync form->context SKIP (context matches form)', data: {}, timestamp: Date.now(), sessionId: 'debug-session', runId: 'post-fix', hypothesisId: 'C' }) }).catch(() => { });
      // #endregion
      return;
    }

    // Solo actualizar si hay cambios reales para evitar loops
    const hasChanges =
      contextQ !== q ||
      contextComuna !== comuna ||
      contextDormitorios !== dormitorios ||
      contextPrecioMin !== precioMin ||
      contextPrecioMax !== precioMax;

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/bf5372fb-b70d-4713-b992-51094d7d9401', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'StickySearchBar.tsx:130', message: 'hasChanges check', data: { hasChanges, precioMin, precioMax, contextPrecioMin: contextPrecioMin, contextPrecioMax: contextPrecioMax }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'post-fix', hypothesisId: 'C' }) }).catch(() => { });
    // #endregion
    if (hasChanges) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/bf5372fb-b70d-4713-b992-51094d7d9401', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'StickySearchBar.tsx:178', message: 'updateFormState BEFORE', data: { q, comuna, dormitorios, precioMin, precioMax }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'post-fix', hypothesisId: 'C' }) }).catch(() => { });
      // #endregion
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
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/bf5372fb-b70d-4713-b992-51094d7d9401', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'StickySearchBar.tsx:191', message: 'updateFormState AFTER', data: {}, timestamp: Date.now(), sessionId: 'debug-session', runId: 'post-fix', hypothesisId: 'C' }) }).catch(() => { });
      // #endregion
    }
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/bf5372fb-b70d-4713-b992-51094d7d9401', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'StickySearchBar.tsx:147', message: 'useEffect sync form->context EXIT', data: {}, timestamp: Date.now(), sessionId: 'debug-session', runId: 'post-fix', hypothesisId: 'C' }) }).catch(() => { });
    // #endregion
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
                        onSelect={(value) => setValue("comuna", value || undefined, { shouldValidate: true })}
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
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {/* Precio Mínimo */}
                        <div>
                          <label htmlFor="precioMin" className="block text-xs font-medium text-text mb-1.5 sm:text-sm">
                            Precio Mínimo
                          </label>
                          <input
                            type="number"
                            id="precioMin"
                            {...register("precioMin")}
                            placeholder="Ej: 500000"
                            min="0"
                            className="w-full rounded-lg border border-gray-300/60 dark:border-gray-600/60 bg-white/80 dark:bg-gray-800/80 px-3 py-2 text-sm text-text ring-1 ring-gray-900/5 focus:outline-none focus:ring-2 focus:ring-[#8B6CFF] focus:border-transparent transition-colors"
                          />
                          {errors.precioMin && (
                            <p className="mt-1 text-xs text-red-500" role="alert">
                              {errors.precioMin.message}
                            </p>
                          )}
                        </div>

                        {/* Precio Máximo */}
                        <div>
                          <label htmlFor="precioMax" className="block text-xs font-medium text-text mb-1.5 sm:text-sm">
                            Precio Máximo
                          </label>
                          <input
                            type="number"
                            id="precioMax"
                            {...register("precioMax")}
                            placeholder="Ej: 2000000"
                            min="0"
                            className="w-full rounded-lg border border-gray-300/60 dark:border-gray-600/60 bg-white/80 dark:bg-gray-800/80 px-3 py-2 text-sm text-text ring-1 ring-gray-900/5 focus:outline-none focus:ring-2 focus:ring-[#8B6CFF] focus:border-transparent transition-colors"
                          />
                          {errors.precioMax && (
                            <p className="mt-1 text-xs text-red-500" role="alert">
                              {errors.precioMax.message}
                            </p>
                          )}
                        </div>
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
