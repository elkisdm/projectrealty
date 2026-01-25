"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import type { SearchFormInput } from "@/lib/validations/search";

interface SearchFormContextValue {
  formState: SearchFormInput;
  updateFormState: (updates: Partial<SearchFormInput>) => void;
  resetFormState: () => void;
}

const SearchFormContext = createContext<SearchFormContextValue | undefined>(undefined);

const defaultFormState: SearchFormInput = {
  q: undefined,
  comuna: undefined,
  precioMin: undefined,

  // New Hero Cocktail fields
  intent: "rent",
  moveIn: undefined,
  beds: undefined,
  priceMax: undefined,
  petFriendly: undefined,
  parking: undefined,
  storage: undefined,

  // Legacy fields (backwards compatibility)
  precioMax: undefined,
  dormitorios: undefined,
  estacionamiento: undefined,
  bodega: undefined,
  mascotas: undefined,
};

interface SearchFormProviderProps {
  children: ReactNode;
}

/**
 * Provider para sincronizar el estado del formulario de búsqueda
 * entre el HeroSearchForm y el StickySearchBar
 */
export function SearchFormProvider({ children }: SearchFormProviderProps) {
  const [formState, setFormState] = useState<SearchFormInput>(defaultFormState);

  const updateFormState = useCallback((updates: Partial<SearchFormInput>) => {
    setFormState((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetFormState = useCallback(() => {
    setFormState(defaultFormState);
  }, []);

  return (
    <SearchFormContext.Provider
      value={{
        formState,
        updateFormState,
        resetFormState,
      }}
    >
      {children}
    </SearchFormContext.Provider>
  );
}

/**
 * Hook para acceder al contexto del formulario de búsqueda
 */
export function useSearchFormContext(): SearchFormContextValue {
  const context = useContext(SearchFormContext);
  if (context === undefined) {
    throw new Error("useSearchFormContext must be used within a SearchFormProvider");
  }
  return context;
}

