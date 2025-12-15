"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search } from "lucide-react";
import { useEffect, useRef } from "react";
import { SearchInput } from "@/components/filters/SearchInput";
import { SearchPills } from "./SearchPills";
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

  // Observar valores para sincronizar pills
  const comuna = watch("comuna");
  const dormitorios = watch("dormitorios");
  const estacionamiento = watch("estacionamiento");
  const bodega = watch("bodega");
  const mascotas = watch("mascotas");
  const q = watch("q");
  const precioMin = watch("precioMin");
  const precioMax = watch("precioMax");

  // Extraer valores individuales del contexto para evitar re-renders por cambio de referencia del objeto
  const contextQ = contextFormState.q;
  const contextComuna = contextFormState.comuna;
  const contextDormitorios = contextFormState.dormitorios;
  const contextPrecioMin = contextFormState.precioMin;
  const contextPrecioMax = contextFormState.precioMax;

  // Ref para evitar ciclo infinito: rastrear los últimos valores sincronizados del contexto
  const lastSyncedContext = useRef<SearchFormInput>({
    q: contextQ,
    comuna: contextComuna,
    dormitorios: contextDormitorios,
    precioMin: contextPrecioMin,
    precioMax: contextPrecioMax,
  });

  // Sincronizar cambios del formulario con el contexto
  useEffect(() => {

    // Evitar ciclo infinito: no sincronizar si el contexto ya tiene estos valores (viene de nuestra sincronización)
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
    }
  }, [q, comuna, dormitorios, precioMin, precioMax, updateFormState, contextQ, contextComuna, contextDormitorios, contextPrecioMin, contextPrecioMax]);

  // Sincronizar valores del contexto al formulario cuando cambian externamente
  useEffect(() => {
    // Verificar si el contexto cambió desde la última sincronización (no desde nuestro propio updateFormState)
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
  }, [setValue, q, comuna, dormitorios, precioMin, precioMax, contextQ, contextComuna, contextDormitorios, contextPrecioMin, contextPrecioMax]);

  const onSubmit = (data: SearchFormInput) => {
    // Validar con Zod para obtener los datos transformados
    const result = searchFormSchema.safeParse(data);
    if (!result.success) {
      // Manejar errores de validación
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
    // Construir query params
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
    if (validatedData.estacionamiento !== undefined) {
      params.set("estacionamiento", validatedData.estacionamiento.toString());
    }
    if (validatedData.bodega !== undefined) {
      params.set("bodega", validatedData.bodega.toString());
    }
    if (validatedData.mascotas !== undefined) {
      params.set("mascotas", validatedData.mascotas.toString());
    }

    // Redirigir a página de resultados
    const queryString = params.toString();
    router.push(`/buscar${queryString ? `?${queryString}` : ""}`);
  };

  // Opciones para pills
  const comunasPrincipales = ["Las Condes", "Ñuñoa", "Providencia", "Santiago", "Macul", "La Florida"];
  const dormitoriosOptions = ["Estudio", "1", "2", "3"];

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

        {/* Pills de filtros - siempre disponibles */}
        <div className="space-y-3">
          {/* Pills de Comuna */}
          <SearchPills
            options={comunasPrincipales}
            selected={comuna}
            onSelect={(value) => {
              const stringValue = Array.isArray(value) ? value[0] : value;
              setValue("comuna", stringValue || undefined, { shouldValidate: true });
            }}
            label="Comuna"
          />

          {/* Fila de filtros: Dormitorios, Estacionamiento, Bodega, Mascotas */}
          <div className="flex flex-wrap items-center gap-4 lg:gap-6">
            <SearchPills
              options={dormitoriosOptions}
              selected={dormitorios}
              onSelect={(value) =>
                setValue("dormitorios", (value as "Estudio" | "1" | "2" | "3") || undefined, {
                  shouldValidate: true,
                })
              }
              label="Dormitorios"
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


