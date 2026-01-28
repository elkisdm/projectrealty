"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, X } from "lucide-react";
import { searchCommunes, isValidCommune, normalizeCommuneName } from "@/lib/data/chilean-communes";
import { cn } from "@/lib/utils";

interface CommuneAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  label?: string;
  id?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  error?: string;
}

export function CommuneAutocomplete({
  value,
  onChange,
  onBlur,
  placeholder = "Ej: Las Condes, Providencia...",
  className = "",
  label,
  id = "comuna",
  autoFocus = false,
  disabled = false,
  error,
}: CommuneAutocompleteProps) {
  const [localValue, setLocalValue] = useState(value);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Actualizar sugerencias cuando cambia el valor
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      if (localValue.length >= 2) {
        const matches = searchCommunes(localValue, 8);
        setSuggestions(matches);
        setShowSuggestions(matches.length > 0 && localValue.trim() !== "");
      } else if (localValue.length === 0) {
        setSuggestions([]);
        setShowSuggestions(false);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }

      // Validar si el valor actual es una comuna válida
      if (localValue.trim().length >= 2) {
        setIsValid(isValidCommune(localValue));
      } else {
        setIsValid(null);
      }
    }, 200); // Debounce de 200ms

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [localValue]);

  // Sincronizar con valor externo
  useEffect(() => {
    if (value !== localValue) {
      setLocalValue(value);
    }
  }, [value]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange(newValue);
    setSelectedIndex(-1);
  }, [onChange]);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setLocalValue(suggestion);
    onChange(suggestion);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    setIsValid(true);
    inputRef.current?.focus();
  }, [onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === "Enter" && selectedIndex >= 0 && suggestions[selectedIndex]) {
      e.preventDefault();
      handleSuggestionClick(suggestions[selectedIndex]);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  }, [suggestions, selectedIndex, handleSuggestionClick]);

  const handleFocus = useCallback(() => {
    if (localValue.length >= 2 && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  }, [localValue, suggestions]);

  const handleBlur = useCallback(() => {
    // Delay para permitir clicks en sugerencias
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedIndex(-1);
      onBlur?.();
    }, 200);
  }, [onBlur]);

  // Cerrar sugerencias al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasError = error || (localValue.length >= 2 && isValid === false);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {label && (
        <Label htmlFor={id} className="text-sm sm:text-base text-text font-medium mb-2 block">
          {label}
        </Label>
      )}
      <div className="relative">
        <Input
          ref={inputRef}
          id={id}
          value={localValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          autoFocus={autoFocus}
          disabled={disabled}
          className={cn(
            "mt-2 rounded-xl min-h-[44px] bg-surface dark:bg-surface border-border text-text placeholder:text-subtext focus-visible:ring-brand-violet pr-10",
            hasError && "border-accent-error focus-visible:ring-accent-error",
            isValid === true && localValue.length >= 2 && "border-accent-success"
          )}
          aria-autocomplete="list"
          aria-expanded={showSuggestions}
          aria-haspopup="listbox"
          aria-invalid={hasError}
        />
        {isValid === true && localValue.length >= 2 && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <CheckCircle className="w-5 h-5 text-accent-success" aria-hidden="true" />
          </div>
        )}
      </div>

      {/* Sugerencias */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-xl shadow-lg max-h-64 overflow-y-auto">
          <ul role="listbox" className="py-2">
            {suggestions.map((suggestion, index) => (
              <li key={suggestion} role="option" aria-selected={index === selectedIndex}>
                <button
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={cn(
                    "w-full text-left px-4 py-2.5 text-sm sm:text-base transition-colors",
                    index === selectedIndex
                      ? "bg-brand-violet/10 dark:bg-brand-violet/20 text-brand-violet dark:text-brand-aqua"
                      : "text-text hover:bg-surface dark:hover:bg-surface"
                  )}
                >
                  {suggestion}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Mensaje de error o ayuda */}
      {hasError && (
        <p className="mt-1.5 text-xs sm:text-sm text-accent-error">
          {error || "Ingresa una comuna válida"}
        </p>
      )}
      {localValue.length > 0 && localValue.length < 2 && !error && (
        <p className="mt-1.5 text-xs text-subtext">
          Escribe al menos 2 caracteres para ver sugerencias
        </p>
      )}
    </div>
  );
}
