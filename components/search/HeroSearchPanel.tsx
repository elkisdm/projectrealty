"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { searchFormInputSchema, type SearchFormInput } from "@/lib/validations/search";
import { useSearchFormContext } from "@/components/marketing/SearchFormContext";
import { mapFormToQueryParams } from "@/lib/utils/submitMapper";
import Image from "next/image";
import { IntentTabs } from "./IntentTabs";
import { UniversalSearchInput, type ParsedSearchData } from "./UniversalSearchInput";
import { HeroQuickPills } from "./HeroQuickPills";
import { CompactRow } from "./CompactRow";
import { HeroCTA } from "./HeroCTA";
import { FilterBottomSheet } from "./FilterBottomSheet";
import MotionWrapper from "@/components/ui/MotionWrapper";
import { formatPrice } from "@/lib/utils";
import { ErrorMessage } from "@/components/ui/ErrorMessage";

interface HeroSearchPanelProps {
  availableCount?: number;
  minPrice?: number;
  className?: string;
}

/**
 * Hero Cocktail Search Panel
 * Combines Airbnb (card + pills), Zillow (universal input), QuintoAndar (tabs + progression)
 * Replaces HeroV2 component
 */
export default function HeroSearchPanel({
  availableCount = 0,
  minPrice,
  className = "",
}: HeroSearchPanelProps) {
  const router = useRouter();
  const { formState: contextFormState, updateFormState } = useSearchFormContext();
  const [showFiltersSheet, setShowFiltersSheet] = useState(false);
  const moreFiltersButtonRef = useRef<HTMLButtonElement>(null);

  const {
    handleSubmit,
    formState: { isSubmitting, errors },
    setValue,
    watch,
  } = useForm<SearchFormInput>({
    resolver: zodResolver(searchFormInputSchema),
    defaultValues: contextFormState,
  });

  // Watch form values
  const intent = watch("intent") || "rent";
  const q = watch("q");
  const beds = watch("beds");
  const priceMax = watch("priceMax");
  const moveIn = watch("moveIn");
  const petFriendly = watch("petFriendly");
  const parking = watch("parking");

  // Handle smart parsing from UniversalSearchInput
  const handleParsedData = useCallback(
    (parsed: ParsedSearchData) => {
      if (parsed.comuna) {
        setValue("comuna", parsed.comuna);
      }
      if (parsed.beds) {
        setValue("beds", parsed.beds);
      }
      if (parsed.price) {
        setValue("priceMax", parsed.price.toString());
      }
    },
    [setValue]
  );

  // Submit handler
  const onSubmit = useCallback(
    (data: SearchFormInput) => {
      // Update context for sticky bar sync
      updateFormState(data);

      // Map to query params and navigate
      const params = mapFormToQueryParams(data);
      const queryString = params.toString();
      router.push(`/buscar${queryString ? `?${queryString}` : ""}`);
    },
    [router, updateFormState]
  );

  return (
    <section
      id="hero-section"
      className={`relative w-full overflow-hidden min-h-[520px] md:min-h-[600px] ${className}`}
    >
      {/* Background hero image */}
      <div className="absolute inset-0" aria-hidden="true">
        <Image
          src="/images/lascondes-hero.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          quality={85}
          className="object-cover"
        />
        {/* Overlay gradient for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
      </div>

      {/* Decorative blobs */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
      >
        <div
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-secondary opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
        />
      </div>

      {/* Content container */}
      <div className="relative z-10 container mx-auto px-4 py-12 flex items-center min-h-[520px] md:min-h-[600px]">
        <div className="w-full md:max-w-[560px]">
          <MotionWrapper direction="up" delay={0.1}>
            {/* Glass card */}
            <div className="rounded-3xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border border-black/5 dark:border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.18)] p-6 md:p-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Intent Tabs - reduced visual weight */}
                <IntentTabs
                  value={intent}
                  onChange={(value) => setValue("intent", value)}
                  variant="subtle"
                />

                {/* Headline - more prominent with extra spacing */}
                <div className="space-y-3 pt-2">
                  <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-[1.05] text-text">
                    Arriendos. Visitas. Check-in. Listo.
                  </h1>
                  <p className="text-lg text-text-muted">
                    Dime dónde. Yo me encargo del resto.
                  </p>
                </div>

                {/* Universal Search Input - dominant element */}
                <div className="pt-2">
                  <UniversalSearchInput
                    value={q || ""}
                    onChange={(value) => setValue("q", value)}
                    onParsedData={handleParsedData}
                    placeholder="Comuna, barrio o metro…"
                    aria-invalid={!!errors.q}
                    aria-describedby={errors.q ? "q-error" : undefined}
                  />
                  <ErrorMessage
                    error={errors.q}
                    id="q-error"
                    className="mt-1"
                  />
                </div>

                {/* Quick Pills - Tipología + Features (Airbnb-style) */}
                <HeroQuickPills
                  beds={beds}
                  petFriendly={petFriendly}
                  parking={parking}
                  onBedsChange={(value) => setValue("beds", value as SearchFormInput["beds"])}
                  onPetFriendlyChange={(value) => setValue("petFriendly", value as SearchFormInput["petFriendly"])}
                  onParkingChange={(value) => setValue("parking", value as SearchFormInput["parking"])}
                />

                {/* Compact Row - Presupuesto + Mudanza (QuintoAndar-style) */}
                <CompactRow
                  priceMax={priceMax}
                  moveIn={moveIn}
                  onPriceMaxChange={(value) => setValue("priceMax", value)}
                  onMoveInChange={(value) => setValue("moveIn", value as SearchFormInput["moveIn"])}
                />
                {errors.priceMax && (
                  <ErrorMessage
                    error={errors.priceMax}
                    id="priceMax-error"
                    className="mt-1"
                  />
                )}

                {/* Error banner general */}
                {Object.keys(errors).length > 0 && (
                  <div
                    className="rounded-xl bg-accent-error/10 dark:bg-red-900/20 border border-accent-error/20 p-3 text-sm text-accent-error"
                    role="alert"
                  >
                    Por favor corrige los errores antes de continuar
                  </div>
                )}

                {/* CTA - Primary action */}
                <HeroCTA
                  isSubmitting={isSubmitting}
                  onMoreFiltersClick={() => {
                    // Guardar elemento activo antes de abrir sheet para focus return
                    if (document.activeElement instanceof HTMLElement) {
                      moreFiltersButtonRef.current = document.activeElement as HTMLButtonElement;
                    }
                    setShowFiltersSheet(true);
                  }}
                  moreFiltersButtonRef={moreFiltersButtonRef}
                />
              </form>
            </div>
          </MotionWrapper>

          {/* Value indicators below card */}
          <MotionWrapper direction="up" delay={0.2}>
            <div className={`mt-6 grid gap-3 ${minPrice ? 'grid-cols-3' : 'grid-cols-2'}`}>
              {minPrice && (
                <div className="flex flex-col items-center justify-center gap-1 rounded-2xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-4 ring-1 ring-orange-200/50 dark:ring-orange-800/50">
                  <p className="text-xs font-medium text-orange-700/80 dark:text-orange-300/80">
                    Arriendos desde
                  </p>
                  <div className="text-lg font-bold tabular-nums text-orange-600 dark:text-orange-400">
                    {formatPrice(minPrice).replace(/\s/g, '')}
                  </div>
                </div>
              )}
              <div className="flex flex-col items-center justify-center gap-1 rounded-2xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-4 ring-1 ring-blue-200/50 dark:ring-blue-800/50">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">100%</div>
                <p className="text-xs font-medium text-blue-700/80 dark:text-blue-300/80">Digital</p>
              </div>
              <div className="flex flex-col items-center justify-center gap-1 rounded-2xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-4 ring-1 ring-purple-200/50 dark:ring-purple-800/50">
                <div className="text-2xl font-bold tabular-nums text-purple-600 dark:text-purple-400">
                  +{availableCount}
                </div>
                <p className="text-xs font-medium text-purple-700/80 dark:text-purple-300/80">
                  Disponibles
                </p>
              </div>
            </div>
          </MotionWrapper>
        </div>
      </div>

      {/* Advanced Filters Sheet - LEVEL 2 Progressive Disclosure */}
      <FilterBottomSheet
        isOpen={showFiltersSheet}
        onClose={() => setShowFiltersSheet(false)}
        triggerRef={moreFiltersButtonRef}
        filters={{
          precioMin: watch("precioMin") ? Number(watch("precioMin")) : undefined,
          precioMax: priceMax ? Number(priceMax) : undefined,
          estacionamiento: parking === "true" ? true : parking === "false" ? false : undefined,
          bodega: watch("storage") === "true" ? true : watch("storage") === "false" ? false : undefined,
          mascotas: petFriendly === "true" ? true : petFriendly === "false" ? false : undefined,
        }}
        onFiltersChange={(filters) => {
          if (filters.precioMin !== undefined) setValue("precioMin", String(filters.precioMin));
          if (filters.precioMax !== undefined) setValue("priceMax", String(filters.precioMax));
          if (filters.estacionamiento !== undefined)
            setValue("parking", filters.estacionamiento ? "true" : "false");
          if (filters.bodega !== undefined)
            setValue("storage", filters.bodega ? "true" : "false");
          if (filters.mascotas !== undefined)
            setValue("petFriendly", filters.mascotas ? "true" : "false");
        }}
        resultsCount={availableCount}
        // NEW: LEVEL 2 fields for progressive disclosure
        beds={beds}
        priceMax={priceMax}
        moveIn={moveIn}
        onBedsChange={(value) => setValue("beds", value as SearchFormInput["beds"])}
        onPriceMaxChange={(value) => setValue("priceMax", value)}
        onMoveInChange={(value) => setValue("moveIn", value as SearchFormInput["moveIn"])}
      />

      {/* Background gradient inferior */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
      >
        <div
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
          className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-secondary to-primary opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
        />
      </div>
    </section>
  );
}
