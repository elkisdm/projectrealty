"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search } from "lucide-react";
import { SearchInput } from "@/components/filters/SearchInput";
import { SearchPills } from "./SearchPills";
import { searchFormInputSchema, searchFormSchema, type SearchFormInput, type SearchFormData } from "@/lib/validations/search";

interface SearchFormProps {
  className?: string;
}

/**
 * Formulario de búsqueda completo con pills y validación
 * Según especificación: incluye pills para Comuna y Dormitorios
 * NO incluye filtro de baños (removido según especificación)
 */
export function SearchForm({ className = "" }: SearchFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    setError,
    watch,
  } = useForm<SearchFormInput>({
    resolver: zodResolver(searchFormInputSchema),
    defaultValues: {
      q: searchParams.get("q") || undefined,
      comuna: searchParams.get("comuna") || undefined,
      precioMin: searchParams.get("precioMin") || undefined,
      precioMax: searchParams.get("precioMax") || undefined,
      dormitorios: (searchParams.get("dormitorios") as "Estudio" | "1" | "2" | "3" | null) || undefined,
      estacionamiento: searchParams.get("estacionamiento") || undefined,
      bodega: searchParams.get("bodega") || undefined,
      mascotas: searchParams.get("mascotas") || undefined,
    },
  });

  // Observar valores para sincronizar pills
  const comuna = watch("comuna");
  const dormitorios = watch("dormitorios");
  const estacionamiento = watch("estacionamiento");
  const bodega = watch("bodega");
  const mascotas = watch("mascotas");

  // Sincronizar con URL params al montar
  useEffect(() => {
    const q = searchParams.get("q");
    const comunaParam = searchParams.get("comuna");
    const precioMinParam = searchParams.get("precioMin");
    const precioMaxParam = searchParams.get("precioMax");
    const dormitoriosParam = searchParams.get("dormitorios");

    if (q) setValue("q", q);
    if (comunaParam) setValue("comuna", comunaParam);
    if (precioMinParam) setValue("precioMin", precioMinParam, { shouldValidate: false });
    if (precioMaxParam) setValue("precioMax", precioMaxParam, { shouldValidate: false });
    if (dormitoriosParam) {
      setValue("dormitorios", dormitoriosParam as "Estudio" | "1" | "2" | "3");
    }
  }, [searchParams, setValue]);

  const onSubmit = (data: SearchFormInput) => {
    // Validar con Zod para obtener los datos transformados
    const result = searchFormSchema.safeParse(data);
    if (!result.success) {
      // Manejar errores de validación, especialmente los de .refine()
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
  const booleanOptions = ["true", "false"];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={`space-y-6 ${className}`}>
      {/* Búsqueda por texto */}
      <div>
        <label htmlFor="search" className="sr-only">
          Buscar propiedades
        </label>
        <SearchInput
          value={watch("q") || ""}
          onChange={(value) => setValue("q", value, { shouldValidate: true })}
          placeholder="Buscar por dirección, comuna, nombre de edificio..."
          className="w-full"
        />
        {errors.q && (
          <p className="mt-1 text-sm text-red-500" role="alert">
            {errors.q.message}
          </p>
        )}
      </div>

      {/* Pills de Comuna */}
      <SearchPills
        options={comunasPrincipales}
        selected={comuna}
        onSelect={(value) => setValue("comuna", value || undefined, { shouldValidate: true })}
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

      {/* Inputs de Precio */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Precio Mínimo */}
        <div>
          <label htmlFor="precioMin" className="block text-sm font-medium text-text mb-2">
            Precio Mínimo
          </label>
          <input
            type="number"
            id="precioMin"
            {...register("precioMin")}
            placeholder="Ej: 500000"
            min="0"
            className="w-full rounded-xl border border-soft/50 bg-bg px-4 py-3 text-text ring-1 ring-soft/50 focus:outline-none focus:ring-2 focus:ring-[#8B6CFF] focus:border-transparent transition-colors"
          />
          {errors.precioMin && (
            <p className="mt-1 text-sm text-red-500" role="alert">
              {errors.precioMin.message}
            </p>
          )}
        </div>

        {/* Precio Máximo */}
        <div>
          <label htmlFor="precioMax" className="block text-sm font-medium text-text mb-2">
            Precio Máximo
          </label>
          <input
            type="number"
            id="precioMax"
            {...register("precioMax")}
            placeholder="Ej: 2000000"
            min="0"
            className="w-full rounded-xl border border-soft/50 bg-bg px-4 py-3 text-text ring-1 ring-soft/50 focus:outline-none focus:ring-2 focus:ring-[#8B6CFF] focus:border-transparent transition-colors"
          />
          {errors.precioMax && (
            <p className="mt-1 text-sm text-red-500" role="alert">
              {errors.precioMax.message}
            </p>
          )}
        </div>
      </div>

      {/* Botón de búsqueda */}
      <div className="flex justify-center pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-2xl bg-[#8B6CFF] hover:bg-[#7a5ce6] text-white px-8 py-4 text-base font-semibold shadow-lg shadow-violet-500/25 transition-all duration-200 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#8B6CFF] disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 sm:px-10 sm:py-5 sm:text-lg min-h-[44px]"
        >
          <Search className="w-5 h-5" aria-hidden="true" />
          {isSubmitting ? "Buscando..." : "Buscar Departamentos"}
        </button>
      </div>
    </form>
  );
}
