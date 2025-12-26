"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MobileSearchInput } from "./MobileSearchInput";
import { MobileFilterPills } from "./MobileFilterPills";
import { FilterDescription } from "@/components/filters/FilterDescription";
import { hasActiveFilters } from "@/lib/utils/filterDescription";
import { searchFormInputSchema, type SearchFormInput } from "@/lib/validations/search";
import { useSearchFormContext } from "@/components/marketing/SearchFormContext";
import { fadeVariants, slideUpVariants } from "@/lib/animations/mobileAnimations";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface MobileSearchHeroProps {
  className?: string;
}

/**
 * Hero de búsqueda optimizado para móvil
 * - Layout vertical móvil-first
 * - Espaciado generoso (mínimo 16px)
 * - Integración de componentes móviles premium
 * - Animaciones suaves de entrada
 */
export function MobileSearchHero({ className = "" }: MobileSearchHeroProps) {
  const router = useRouter();
  const { formState: contextFormState, updateFormState } = useSearchFormContext();
  const prefersReducedMotion = useReducedMotion();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<SearchFormInput>({
    resolver: zodResolver(searchFormInputSchema),
    defaultValues: contextFormState,
  });

  // Estado local para multiselección
  const [comunasSelected, setComunasSelected] = useState<string[]>([]);
  const [dormitoriosSelected, setDormitoriosSelected] = useState<string[]>([]);
  const initializedRef = useRef(false);

  // Observar valores del formulario
  const q = watch("q");
  const dormitorios = watch("dormitorios");
  const estacionamiento = watch("estacionamiento");
  const bodega = watch("bodega");
  const mascotas = watch("mascotas");
  const precioMin = watch("precioMin");
  const precioMax = watch("precioMax");

  // Sincronizar estado local con valores iniciales
  useEffect(() => {
    if (!initializedRef.current) {
      const comuna = watch("comuna");
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
  }, [watch, dormitorios]);

  // Sincronizar cambios con contexto
  useEffect(() => {
    updateFormState({
      q,
      precioMin,
      precioMax,
    });
  }, [q, precioMin, precioMax, updateFormState]);

  const onSubmit = (data: SearchFormInput) => {
    const params = new URLSearchParams();

    if (data.q && data.q.trim()) {
      params.set("q", data.q.trim());
    }

    if (comunasSelected.length > 0) {
      params.set("comuna", comunasSelected.join(","));
    } else if (data.comuna) {
      params.set("comuna", data.comuna);
    }

    if (dormitoriosSelected.length > 0) {
      params.set("dormitorios", dormitoriosSelected.join(","));
    } else if (data.dormitorios) {
      params.set("dormitorios", data.dormitorios);
    }

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

  return (
    <motion.div
      className={`w-full px-4 py-6 space-y-6 ${className}`}
      variants={prefersReducedMotion ? {} : fadeVariants}
      initial="hidden"
      animate="visible"
    >
      <form id="mobile-hero-search-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Input de búsqueda principal */}
        <motion.div
          variants={prefersReducedMotion ? {} : slideUpVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.1 }}
        >
          <MobileSearchInput
            value={q || ""}
            onChange={(value) => setValue("q", value, { shouldValidate: true })}
            placeholder="Buscar por dirección, comuna, nombre de edificio..."
            className="w-full"
            onSubmit={() => handleSubmit(onSubmit)()}
          />
          {errors.q && (
            <p className="mt-2 text-sm text-red-500" role="alert">
              {errors.q.message}
            </p>
          )}
        </motion.div>

        {/* FilterDescription si hay filtros activos */}
        {hasActiveFilters(activeFiltersForDescription) && (
          <motion.div
            variants={prefersReducedMotion ? {} : slideUpVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
          >
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
          </motion.div>
        )}

        {/* Pills de filtros con scroll horizontal */}
        <div className="space-y-4">
          {/* Comunas */}
          <motion.div
            variants={prefersReducedMotion ? {} : slideUpVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3 }}
          >
            <MobileFilterPills
              options={comunasPrincipales}
              selected={comunasSelected}
              onSelect={(value) => {
                const newComunas = Array.isArray(value) ? value : value ? [value] : [];
                setComunasSelected(newComunas.length > 0 ? newComunas : []);
              }}
              label="Comuna"
              multiple={true}
            />
          </motion.div>

          {/* Dormitorios */}
          <motion.div
            variants={prefersReducedMotion ? {} : slideUpVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.4 }}
          >
            <MobileFilterPills
              options={dormitoriosOptions}
              selected={dormitoriosSelected}
              onSelect={(value) => {
                const newDormitorios = Array.isArray(value) ? value : value ? [value] : [];
                setDormitoriosSelected(newDormitorios.length > 0 ? newDormitorios : []);
              }}
              label="Dormitorios"
              multiple={true}
            />
          </motion.div>

          {/* Filtros booleanos en una fila */}
          <motion.div
            className="flex flex-wrap gap-4"
            variants={prefersReducedMotion ? {} : slideUpVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.5 }}
          >
            <MobileFilterPills
              options={["Sí", "No"]}
              selected={estacionamiento === "true" ? "Sí" : estacionamiento === "false" ? "No" : undefined}
              onSelect={(value) => {
                const boolValue = value === "Sí" ? "true" : value === "No" ? "false" : undefined;
                setValue("estacionamiento", boolValue as "true" | "false" | undefined, {
                  shouldValidate: true,
                });
              }}
              label="Estacionamiento"
            />

            <MobileFilterPills
              options={["Sí", "No"]}
              selected={bodega === "true" ? "Sí" : bodega === "false" ? "No" : undefined}
              onSelect={(value) => {
                const boolValue = value === "Sí" ? "true" : value === "No" ? "false" : undefined;
                setValue("bodega", boolValue as "true" | "false" | undefined, { shouldValidate: true });
              }}
              label="Bodega"
            />

            <MobileFilterPills
              options={["Sí", "No"]}
              selected={mascotas === "true" ? "Sí" : mascotas === "false" ? "No" : undefined}
              onSelect={(value) => {
                const boolValue = value === "Sí" ? "true" : value === "No" ? "false" : undefined;
                setValue("mascotas", boolValue as "true" | "false" | undefined, { shouldValidate: true });
              }}
              label="Mascotas"
            />
          </motion.div>
        </div>

        {/* Botón de búsqueda */}
        <motion.button
          type="submit"
          disabled={isSubmitting}
          className="
            w-full
            inline-flex items-center justify-center gap-2
            bg-gradient-to-r from-primary to-primary/90
            font-semibold text-primary-foreground
            shadow-lg
            transition-all duration-200
            hover:shadow-xl hover:shadow-primary/25
            focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary
            disabled:opacity-50 disabled:cursor-not-allowed
            active:scale-95
            min-h-[56px]
            rounded-2xl
            px-8 py-4
            text-base
            mobile-optimized
          "
          aria-label={isSubmitting ? "Buscando..." : "Buscar departamentos"}
          variants={prefersReducedMotion ? {} : slideUpVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.6 }}
          whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
          whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
        >
          {isSubmitting ? "Buscando..." : "Buscar Departamentos"}
        </motion.button>
      </form>
    </motion.div>
  );
}

