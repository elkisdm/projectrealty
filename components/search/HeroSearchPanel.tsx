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
import { Card, CardContent } from "@/components/ui/card";

interface HeroSearchPanelProps {
  availableCount?: number;
  minPrice?: number;
  className?: string;
}

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

  const intent = watch("intent") === "buy" ? "buy" : "rent";
  const q = watch("q");
  const beds = watch("beds");
  const priceMax = watch("priceMax");
  const moveIn = watch("moveIn");
  const petFriendly = watch("petFriendly");
  const parking = watch("parking");

  const handleParsedData = useCallback(
    (parsed: ParsedSearchData) => {
      if (parsed.comuna) setValue("comuna", parsed.comuna);
      if (parsed.beds) setValue("beds", parsed.beds);
      if (parsed.price) setValue("priceMax", parsed.price.toString());
    },
    [setValue]
  );

  const onSubmit = useCallback(
    (data: SearchFormInput) => {
      updateFormState(data);
      const params = mapFormToQueryParams(data);
      router.push(`/buscar${params.toString() ? `?${params.toString()}` : ""}`);
    },
    [router, updateFormState]
  );

  const bedsToDormitoriosMin = (value: SearchFormInput["beds"] | undefined): number | undefined => {
    if (!value) return undefined;
    const token = Array.isArray(value) ? value[0] : value;
    if (token === "studio") return 0;
    if (token === "1") return 1;
    if (token === "2") return 2;
    if (token === "3plus") return 3;
    return undefined;
  };

  return (
    <section
      id="hero-section"
      className={`relative w-full overflow-hidden min-h-[520px] md:min-h-[600px] ${className}`}
    >
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
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
      </div>

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

      <div className="relative z-10 container mx-auto px-4 py-12 flex items-center min-h-[520px] md:min-h-[600px]">
        <div className="w-full md:max-w-[500px]">
          <MotionWrapper direction="up" delay={0.1}>
            <Card className="rounded-2xl border-border/50 bg-card/95 backdrop-blur-md shadow-xl">
              <CardContent className="p-5 md:p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <IntentTabs
                  value={intent}
                  onChange={(value) => setValue("intent", value as SearchFormInput["intent"])}
                  variant="subtle"
                />

                <div className="space-y-1">
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                    Arriendos. Visitas. Check-in. Listo.
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Dime dónde. Yo me encargo del resto.
                  </p>
                </div>
                <div>
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

                <HeroQuickPills
                  beds={beds}
                  petFriendly={petFriendly}
                  parking={parking}
                  onBedsChange={(value) => setValue("beds", value as SearchFormInput["beds"])}
                  onPetFriendlyChange={(value) => setValue("petFriendly", value as SearchFormInput["petFriendly"])}
                  onParkingChange={(value) => setValue("parking", value as SearchFormInput["parking"])}
                />

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

                {Object.keys(errors).length > 0 && (
                  <div
                    className="rounded-xl bg-accent-error/10 dark:bg-red-900/20 border border-accent-error/20 p-3 text-sm text-accent-error"
                    role="alert"
                  >
                    Por favor corrige los errores antes de continuar
                  </div>
                )}

                <HeroCTA
                  isSubmitting={isSubmitting}
                  onMoreFiltersClick={() => {
                    if (document.activeElement instanceof HTMLElement) {
                      moreFiltersButtonRef.current = document.activeElement as HTMLButtonElement;
                    }
                    setShowFiltersSheet(true);
                  }}
                  moreFiltersButtonRef={moreFiltersButtonRef}
                />
              </form>
              </CardContent>
            </Card>
          </MotionWrapper>

          <MotionWrapper direction="up" delay={0.2}>
            <div className={`mt-4 grid gap-2 ${minPrice ? "grid-cols-3" : "grid-cols-2"}`}>
              {minPrice && (
                <div className="rounded-xl bg-card/80 backdrop-blur-sm border border-border/50 p-3 text-center">
                  <p className="text-xs text-muted-foreground">Desde</p>
                  <p className="text-sm font-semibold tabular-nums">{formatPrice(minPrice).replace(/\s/g, "")}</p>
                </div>
              )}
              <div className="rounded-xl bg-card/80 backdrop-blur-sm border border-border/50 p-3 text-center">
                <p className="text-sm font-semibold">100%</p>
                <p className="text-xs text-muted-foreground">Digital</p>
              </div>
              <div className="rounded-xl bg-card/80 backdrop-blur-sm border border-border/50 p-3 text-center">
                <p className="text-sm font-semibold tabular-nums">+{availableCount}</p>
                <p className="text-xs text-muted-foreground">Disponibles</p>
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
          operation: "rent",
          precioMin: watch("precioMin") ? Number(watch("precioMin")) : undefined,
          precioMax: priceMax ? Number(priceMax) : undefined,
          dormitoriosMin: bedsToDormitoriosMin(beds),
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
