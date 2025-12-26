"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { SearchInput } from "@/components/filters/SearchInput";
import { SearchPills } from "./SearchPills";
import { FilterDescription } from "@/components/filters/FilterDescription";
import { hasActiveFilters } from "@/lib/utils/filterDescription";
import { searchFormInputSchema, searchFormSchema, type SearchFormInput } from "@/lib/validations/search";
import { useSearchFormContext } from "./SearchFormContext";

interface HeroSearchFormProps {
  className?: string;
  variant?: "compact" | "expanded";
}

/**
 * Formulario de búsqueda compacto para el hero/above the fold
 * Versión simplificada con solo los campos esenciales
 * Versión simplificada sin animaciones complejas
 */
export function HeroSearchForm({ className = "", variant = "compact" }: HeroSearchFormProps) {
  const router = useRouter();
  const { formState: contextFormState, updateFormState } = useSearchFormContext();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    setError,
    watch,
  } = useForm<SearchFormInput>({
    resolver: zodResolver(searchFormInputSchema),
    defaultValues: contextFormState,
  });

  // Estado local para multiselección (arrays)
  const [comunasSelected, setComunasSelected] = useState<string[]>([]);
  const [dormitoriosSelected, setDormitoriosSelected] = useState<string[]>([]);
  const initializedRef = useRef(false);

  // Observar valores para sincronizar pills
  const comuna = watch("comuna");
  const dormitorios = watch("dormitorios");
  const estacionamiento = watch("estacionamiento");
  const bodega = watch("bodega");
  const mascotas = watch("mascotas");
  const q = watch("q");
  const precioMin = watch("precioMin");
  const precioMax = watch("precioMax");

  // Sincronizar estado local con valores iniciales del formulario (solo una vez)
  useEffect(() => {
    if (!initializedRef.current) {
      if (comuna) {
        const comunasArray = Array.isArray(comuna) ? comuna : [comuna];
        setComunasSelected(comunasArray);
      }
      if (dormitorios) {
        const dormitoriosArray = Array.isArray(dormitorios) ? dormitorios : [dormitorios];
        setDormitoriosSelected(dormitoriosArray);
      }
      initializedRef.current = true;
    }
  }, [comuna, dormitorios]);

  // Extraer valores individuales del contexto para evitar re-renders por cambio de referencia del objeto
  const contextQ = contextFormState.q;
  const contextPrecioMin = contextFormState.precioMin;
  const contextPrecioMax = contextFormState.precioMax;

  // Ref para evitar ciclo infinito: rastrear los últimos valores sincronizados del contexto
  const lastSyncedContext = useRef<Partial<SearchFormInput>>({
    q: contextQ,
    precioMin: contextPrecioMin,
    precioMax: contextPrecioMax,
  });

  // Sincronizar cambios del formulario con el contexto (excluyendo multiselección que usa estado local)
  useEffect(() => {
    // Evitar ciclo infinito: no sincronizar si el contexto ya tiene estos valores
    const contextMatchesForm =
      lastSyncedContext.current.q === q &&
      lastSyncedContext.current.precioMin === precioMin &&
      lastSyncedContext.current.precioMax === precioMax;

    if (contextMatchesForm) {
      return;
    }

    // Solo actualizar si hay cambios reales (solo q y precios, no comuna/dormitorios que usan estado local)
    const hasChanges =
      contextQ !== q ||
      contextPrecioMin !== precioMin ||
      contextPrecioMax !== precioMax;

    if (hasChanges) {
      updateFormState({
        q,
        precioMin,
        precioMax,
      });
      // Actualizar la referencia después de actualizar el contexto
      lastSyncedContext.current = {
        ...lastSyncedContext.current,
        q,
        precioMin,
        precioMax,
      };
    }
  }, [q, precioMin, precioMax, updateFormState, contextQ, contextPrecioMin, contextPrecioMax]);

  // Sincronizar valores del contexto al formulario cuando cambian externamente (solo q y precios)
  useEffect(() => {
    // Verificar si el contexto cambió desde la última sincronización
    const contextChanged =
      lastSyncedContext.current.q !== contextQ ||
      lastSyncedContext.current.precioMin !== contextPrecioMin ||
      lastSyncedContext.current.precioMax !== contextPrecioMax;

    if (!contextChanged) {
      return;
    }

    // Verificar si hay cambios reales entre contexto y formulario antes de sincronizar
    const hasFormChanges =
      (contextQ !== undefined && contextQ !== q) ||
      (contextPrecioMin !== undefined && contextPrecioMin !== precioMin) ||
      (contextPrecioMax !== undefined && contextPrecioMax !== precioMax);

    if (!hasFormChanges) {
      // Actualizar la referencia aunque no haya cambios en el formulario
      lastSyncedContext.current = {
        ...lastSyncedContext.current,
        q: contextQ,
        precioMin: contextPrecioMin,
        precioMax: contextPrecioMax,
      };
      return;
    }

    // Sincronizar valores del contexto al formulario (solo q y precios)
    if (contextQ !== undefined && contextQ !== q) {
      setValue("q", contextQ, { shouldDirty: false });
    }
    if (contextPrecioMin !== undefined && contextPrecioMin !== precioMin) {
      setValue("precioMin", contextPrecioMin, { shouldDirty: false });
    }
    if (contextPrecioMax !== undefined && contextPrecioMax !== precioMax) {
      setValue("precioMax", contextPrecioMax, { shouldDirty: false });
    }

    // Actualizar la referencia con los valores sincronizados
    lastSyncedContext.current = {
      ...lastSyncedContext.current,
      q: contextQ,
      precioMin: contextPrecioMin,
      precioMax: contextPrecioMax,
    };
  }, [setValue, q, precioMin, precioMax, contextQ, contextPrecioMin, contextPrecioMax]);

  const onSubmit = (data: SearchFormInput) => {
    // Construir query params directamente usando estado local y datos del formulario
    const params = new URLSearchParams();

    if (data.q && data.q.trim()) {
      params.set("q", data.q.trim());
    }
    
    // Usar estado local de multiselección para construir params
    if (comunasSelected.length > 0) {
      params.set("comuna", comunasSelected.join(","));
    } else if (data.comuna) {
      params.set("comuna", data.comuna);
    }
    
    // Usar estado local de multiselección para dormitorios
    if (dormitoriosSelected.length > 0) {
      params.set("dormitorios", dormitoriosSelected.join(","));
    } else if (data.dormitorios) {
      params.set("dormitorios", data.dormitorios);
    }
    
    // Precios
    if (data.precioMin && data.precioMin.trim()) {
      const precioMinNum = Number(data.precioMin);
      if (!isNaN(precioMinNum)) {
        params.set("precioMin", precioMinNum.toString());
      }
    }
    if (data.precioMax && data.precioMax.trim()) {
      const precioMaxNum = Number(data.precioMax);
      if (!isNaN(precioMaxNum)) {
        params.set("precioMax", precioMaxNum.toString());
      }
    }
    if (data.estacionamiento !== undefined) {
      params.set("estacionamiento", data.estacionamiento.toString());
    }
    if (data.bodega !== undefined) {
      params.set("bodega", data.bodega.toString());
    }
    if (data.mascotas !== undefined) {
      params.set("mascotas", data.mascotas.toString());
    }

    // Redirigir a página de resultados
    const queryString = params.toString();
    router.push(`/buscar${queryString ? `?${queryString}` : ""}`);
  };

  // Opciones para pills
  const comunasPrincipales = ["Las Condes", "Ñuñoa", "Providencia", "Santiago", "Macul", "La Florida"];
  const dormitoriosOptions = ["Estudio", "1", "2", "3"];

  // Preparar filtros para FilterDescription
  const activeFiltersForDescription = {
    comuna: comunasSelected.length > 0 ? comunasSelected : undefined,
    precioMin: precioMin ? Number(precioMin) : undefined,
    precioMax: precioMax ? Number(precioMax) : undefined,
    dormitorios: dormitoriosSelected.length > 0 ? dormitoriosSelected : undefined,
    estacionamiento: estacionamiento === "true" ? true : estacionamiento === "false" ? false : undefined,
    bodega: bodega === "true" ? true : bodega === "false" ? false : undefined,
    mascotas: mascotas === "true" ? true : mascotas === "false" ? false : undefined,
  };

  const isExpanded = variant === "expanded";

  return (
    <form
      id="hero-search-form"
      onSubmit={handleSubmit(onSubmit)}
      className={`w-full mx-auto ${className}`}
    >
      <div className="space-y-4">
        {/* Input de búsqueda principal con botón integrado */}
        <div className="relative flex flex-col gap-3 sm:flex-row sm:gap-2">
          <div className="flex-1">
            <SearchInput
              value={watch("q") || ""}
              onChange={(value) => setValue("q", value, { shouldValidate: true })}
              placeholder="Buscar por dirección, comuna, nombre de edificio..."
              className="w-full"
              autoFocus={false}
            />
            {errors.q && (
              <p className="mt-1 text-sm text-red-500 z-50" role="alert">
                {errors.q.message}
              </p>
            )}
          </div>

          {/* Botón de búsqueda - adapta tamaño según modo */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="group relative inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary/90 font-semibold text-primary-foreground shadow-lg transition-all duration-200 hover:shadow-xl hover:shadow-primary/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 min-h-[44px] w-full rounded-2xl px-8 py-4 text-base sm:w-auto sm:px-10 sm:py-4 sm:text-lg"
            aria-label={isSubmitting ? "Buscando..." : "Buscar departamentos"}
          >
            <span className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-0 transition-opacity duration-200 group-hover:opacity-100 rounded-2xl" />
            <Search className="relative z-10 w-5 h-5" aria-hidden="true" />
            <span className="relative z-10">
              {isSubmitting ? "Buscando..." : "Buscar Departamentos"}
            </span>
          </button>
        </div>

        {/* FilterDescription */}
        {hasActiveFilters(activeFiltersForDescription) && (
          <div>
            <FilterDescription
              filters={activeFiltersForDescription}
              onClear={() => {
                setComunasSelected([]);
                setDormitoriosSelected([]);
                setValue("comuna", undefined);
                setValue("dormitorios", undefined);
                setValue("estacionamiento", undefined);
                setValue("bodega", undefined);
                setValue("mascotas", undefined);
                setValue("precioMin", undefined);
                setValue("precioMax", undefined);
              }}
            />
          </div>
        )}

        {/* Pills de filtros - siempre disponibles */}
        <div className="space-y-3">
          {/* Pills de Comuna con multiselección */}
          <SearchPills
            options={comunasPrincipales}
            selected={comunasSelected}
            onSelect={(value) => {
              // Multiselección: manejar array
              const newComunas = Array.isArray(value) ? value : value ? [value] : [];
              setComunasSelected(newComunas.length > 0 ? newComunas : []);
              // NO actualizar el formulario aquí para evitar loops - solo mantener estado local
            }}
            label="Comuna"
            multiple={true}
          />

          {/* Fila de filtros: Dormitorios, Estacionamiento, Bodega, Mascotas */}
          <div className="flex flex-wrap items-center gap-4 lg:gap-6">
            <SearchPills
              options={dormitoriosOptions}
              selected={dormitoriosSelected}
              onSelect={(value) => {
                // Multiselección: manejar array
                const newDormitorios = Array.isArray(value) ? value : value ? [value] : [];
                setDormitoriosSelected(newDormitorios.length > 0 ? newDormitorios : []);
                // NO actualizar el formulario aquí para evitar loops - solo mantener estado local
              }}
              label="Dormitorios"
              multiple={true}
            />

            <SearchPills
              options={["Sí", "No"]}
              selected={estacionamiento === "true" ? "Sí" : estacionamiento === "false" ? "No" : undefined}
              onSelect={(value) => {
                const boolValue = value === "Sí" ? "true" : value === "No" ? "false" : undefined;
                setValue("estacionamiento", boolValue as "true" | "false" | undefined, { shouldValidate: true });
              }}
              label="Estacionamiento"
            />

            <SearchPills
              options={["Sí", "No"]}
              selected={bodega === "true" ? "Sí" : bodega === "false" ? "No" : undefined}
              onSelect={(value) => {
                const boolValue = value === "Sí" ? "true" : value === "No" ? "false" : undefined;
                setValue("bodega", boolValue as "true" | "false" | undefined, { shouldValidate: true });
              }}
              label="Bodega"
            />

            <SearchPills
              options={["Sí", "No"]}
              selected={mascotas === "true" ? "Sí" : mascotas === "false" ? "No" : undefined}
              onSelect={(value) => {
                const boolValue = value === "Sí" ? "true" : value === "No" ? "false" : undefined;
                setValue("mascotas", boolValue as "true" | "false" | undefined, { shouldValidate: true });
              }}
              label="Mascotas"
            />
          </div>
        </div>
      </div>
    </form>
  );
}


