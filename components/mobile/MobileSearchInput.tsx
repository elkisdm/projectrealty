"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import { searchInputVariants, searchIconVariants, slideUpVariants } from "@/lib/animations/mobileAnimations";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export interface MobileSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  debounceMs?: number;
  suggestions?: string[];
  autoFocus?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
  onSuggestionSelect?: (suggestion: string) => void;
  maxSuggestions?: number;
  onSubmit?: () => void;
}

/**
 * Input de búsqueda móvil con animaciones premium tipo Apple
 * - Expansión al focus con animación spring
 * - Icono pulsante cuando está vacío
 * - Sugerencias con animación escalonada
 * - Micro-animaciones en todas las interacciones
 */
export function MobileSearchInput({
  value,
  onChange,
  placeholder = "Buscar por dirección, comuna, nombre de edificio...",
  className = "",
  debounceMs = 300,
  suggestions = [],
  autoFocus = false,
  isLoading = false,
  disabled = false,
  onSuggestionSelect,
  maxSuggestions = 5,
  onSubmit,
}: MobileSearchInputProps) {
  const [localValue, setLocalValue] = useState(value);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // Debounced change handler
  const debouncedOnChange = useCallback(
    (newValue: string) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        onChange(newValue);
      }, debounceMs);
    },
    [onChange, debounceMs]
  );

  // Handle input change
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setLocalValue(newValue);
      debouncedOnChange(newValue);
    },
    [debouncedOnChange]
  );

  // Handle clear
  const handleClear = useCallback(() => {
    setLocalValue("");
    onChange("");
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    inputRef.current?.focus();
  }, [onChange]);

  // Handle key press
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      const filteredSuggestions = suggestions
        .filter((s) => s.toLowerCase().includes(localValue.toLowerCase()))
        .slice(0, maxSuggestions);

      if (e.key === "Enter") {
        e.preventDefault();
        if (selectedSuggestionIndex >= 0 && filteredSuggestions[selectedSuggestionIndex]) {
          const selectedSuggestion = filteredSuggestions[selectedSuggestionIndex];
          setLocalValue(selectedSuggestion);
          onChange(selectedSuggestion);
          onSuggestionSelect?.(selectedSuggestion);
          setShowSuggestions(false);
        } else {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          onChange(localValue);
          setShowSuggestions(false);
          onSubmit?.();
        }
      } else if (e.key === "Escape") {
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        inputRef.current?.blur();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedSuggestionIndex((prev) =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : -1));
      }
    },
    [localValue, onChange, handleClear, suggestions, maxSuggestions, selectedSuggestionIndex, onSuggestionSelect, onSubmit]
  );

  // Handle focus
  const handleFocus = useCallback(() => {
    setIsFocused(true);
    if (suggestions.length > 0 && localValue.trim() !== "") {
      setShowSuggestions(true);
    }
  }, [suggestions.length, localValue]);

  // Handle blur
  const handleBlur = useCallback(() => {
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
      setIsFocused(false);
    }, 150);
  }, []);

  // Handle suggestion click
  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      setLocalValue(suggestion);
      onChange(suggestion);
      onSuggestionSelect?.(suggestion);
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
      inputRef.current?.focus();
    },
    [onChange, onSuggestionSelect]
  );

  // Sync with external value changes
  useEffect(() => {
    if (value !== localValue && value !== undefined) {
      setLocalValue(value);
    }
  }, [value, localValue]);

  // Show suggestions when typing
  useEffect(() => {
    if (isFocused && localValue.trim() !== "" && suggestions.length > 0) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
    setSelectedSuggestionIndex(-1);
  }, [isFocused, localValue, suggestions.length]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const hasValue = localValue && localValue.trim() !== "";
  const filteredSuggestions = suggestions
    .filter((s) => s.toLowerCase().includes(localValue.toLowerCase()))
    .slice(0, maxSuggestions);

  return (
    <div className={`relative ${className}`}>
      <motion.div
        className="relative"
        variants={prefersReducedMotion ? {} : searchInputVariants}
        initial="initial"
        animate={isFocused ? "focused" : "unfocused"}
      >
        <input
          ref={inputRef}
          type="text"
          role="searchbox"
          value={localValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          autoFocus={autoFocus}
          disabled={disabled}
          className="
            w-full 
            pl-12 pr-12 py-4
            min-h-[56px]
            bg-surface 
            dark:bg-gray-900 
            border-2 
            border-border 
            dark:border-gray-700 
            rounded-2xl 
            text-base
            text-text 
            dark:text-white 
            placeholder:text-subtext
            dark:placeholder:text-gray-400
            focus:outline-none 
            focus:ring-2 
            focus:ring-primary 
            focus:border-primary
            transition-all
            duration-200
            disabled:opacity-50 
            disabled:cursor-not-allowed
            mobile-optimized
          "
          aria-label="Buscar propiedades"
          aria-expanded={showSuggestions}
          aria-autocomplete="list"
          aria-haspopup="listbox"
          aria-activedescendant={
            selectedSuggestionIndex >= 0 ? `mobile-suggestion-${selectedSuggestionIndex}` : undefined
          }
        />

        {/* Search icon with pulse animation */}
        <motion.div
          className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none"
          variants={prefersReducedMotion ? {} : searchIconVariants}
          animate={!hasValue && !isFocused ? "pulsing" : "idle"}
        >
          <Search className="h-5 w-5 text-subtext" aria-hidden="true" />
        </motion.div>

        {/* Loading indicator or Clear button */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"
                aria-label="Buscando..."
              />
            ) : hasValue ? (
              <motion.button
                key="clear"
                type="button"
                onClick={handleClear}
                disabled={disabled}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={prefersReducedMotion ? {} : { scale: 1.1 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.9 }}
                className="
                  h-8 w-8
                  flex items-center justify-center
                  rounded-full
                  bg-surface
                  dark:bg-gray-800
                  text-subtext
                  hover:text-text
                  dark:hover:text-white
                  focus:outline-none 
                  focus:ring-2 
                  focus:ring-primary
                  transition-colors
                  duration-200
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                  mobile-optimized
                "
                aria-label="Limpiar búsqueda"
              >
                <X className="h-4 w-4" />
              </motion.button>
            ) : null}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Suggestions dropdown with staggered animation */}
      <AnimatePresence>
        {showSuggestions && filteredSuggestions.length > 0 && (
          <motion.div
            className="absolute top-full left-0 right-0 mt-2 bg-surface dark:bg-gray-900 border-2 border-border dark:border-gray-700 rounded-2xl shadow-xl z-50 overflow-hidden"
            variants={prefersReducedMotion ? {} : slideUpVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <ul role="listbox" className="py-2">
              {filteredSuggestions.map((suggestion, index) => (
                <motion.li
                  key={suggestion}
                  variants={
                    prefersReducedMotion
                      ? {}
                      : {
                          hidden: { opacity: 0, x: -10 },
                          visible: {
                            opacity: 1,
                            x: 0,
                            transition: { delay: index * 0.03 },
                          },
                        }
                  }
                  initial="hidden"
                  animate="visible"
                >
                  <button
                    type="button"
                    id={`mobile-suggestion-${index}`}
                    role="option"
                    aria-selected={index === selectedSuggestionIndex}
                    className={`
                      w-full text-left px-4 py-3 
                      text-base
                      cursor-pointer 
                      transition-colors
                      duration-150
                      mobile-optimized
                      ${index === selectedSuggestionIndex
                        ? "bg-primary text-primary-foreground"
                        : "text-text hover:bg-soft dark:hover:bg-gray-800"
                      }
                    `}
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </button>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}







