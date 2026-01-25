"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { BaseModal } from "@/components/ui/BaseModal";

interface UniversalSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onParsedData?: (data: ParsedSearchData) => void;
  placeholder?: string;
  className?: string;
}

export interface ParsedSearchData {
  comuna?: string;
  beds?: "studio" | "1" | "2" | "3plus";
  price?: number;
}

const COMUNAS_PRINCIPALES = [
  'Las Condes', 'Ñuñoa', 'Providencia', 'Santiago', 'Macul',
  'La Florida', 'San Miguel', 'Maipú', 'La Reina', 'Vitacura',
  'Lo Barnechea', 'Peñalolén', 'Huechuraba', 'Recoleta', 'Independencia'
];

/**
 * Universal search input with smart parsing (Zillow-style)
 * Parses comuna, beds, and price hints from free text
 * Opens fullscreen modal on mobile
 */
export function UniversalSearchInput({
  value,
  onChange,
  onParsedData,
  placeholder = "Comuna, barrio o metro…",
  className = "",
}: UniversalSearchInputProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Parse search query to extract structured data
  const parseSearchQuery = useCallback((query: string): ParsedSearchData => {
    const parsed: ParsedSearchData = {};
    const lowerQuery = query.toLowerCase();

    // Extract comuna
    const comunaMatch = COMUNAS_PRINCIPALES.find((c) =>
      lowerQuery.includes(c.toLowerCase())
    );
    if (comunaMatch) {
      parsed.comuna = comunaMatch;
    }

    // Extract beds (studio, estudio, 1d, 2d, 3d, 3+, etc.)
    const bedsPatterns = [
      { pattern: /\b(studio|estudio)\b/i, value: "studio" as const },
      { pattern: /\b1\s*d(?:orm)?(?:itorio)?\b/i, value: "1" as const },
      { pattern: /\b2\s*d(?:orm)?(?:itorio)?\b/i, value: "2" as const },
      { pattern: /\b3\s*d(?:orm)?(?:itorio)?\b/i, value: "3plus" as const },
      { pattern: /\b3\+\b/i, value: "3plus" as const },
    ];

    for (const { pattern, value } of bedsPatterns) {
      if (pattern.test(query)) {
        parsed.beds = value;
        break;
      }
    }

    // Extract price (e.g., "650000", "650k", "1.5M")
    const pricePatterns = [
      { pattern: /(\d+(?:\.\d+)?)\s*m(?:illones?)?/i, multiplier: 1000000 },
      { pattern: /(\d+)\s*k/i, multiplier: 1000 },
      { pattern: /\b(\d{5,7})\b/, multiplier: 1 },
    ];

    for (const { pattern, multiplier } of pricePatterns) {
      const match = query.match(pattern);
      if (match) {
        const num = parseFloat(match[1]);
        if (!isNaN(num)) {
          parsed.price = num * multiplier;
          break;
        }
      }
    }

    return parsed;
  }, []);

  // Handle input change with parsing
  const handleInputChange = useCallback(
    (newValue: string) => {
      onChange(newValue);

      // Parse and notify parent
      if (onParsedData && newValue.trim()) {
        const parsed = parseSearchQuery(newValue);
        if (Object.keys(parsed).length > 0) {
          onParsedData(parsed);
        }
      }

      // Show suggestions if typing a comuna
      if (newValue.trim().length >= 2) {
        const matches = COMUNAS_PRINCIPALES.filter((c) =>
          c.toLowerCase().includes(newValue.toLowerCase())
        );
        setSuggestions(matches.slice(0, 5));
        setShowSuggestions(matches.length > 0);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    },
    [onChange, onParsedData, parseSearchQuery]
  );

  // Handle suggestion click
  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      onChange(suggestion);
      setShowSuggestions(false);
      setIsModalOpen(false);
      if (onParsedData) {
        onParsedData({ comuna: suggestion });
      }
    },
    [onChange, onParsedData]
  );

  // Mobile: Open modal on input click
  const handleMobileClick = () => {
    if (isMobile) {
      setIsModalOpen(true);
    }
  };

  // Desktop input
  const desktopInput = (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => value.trim().length >= 2 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          onClick={handleMobileClick}
          placeholder={placeholder}
          className="w-full h-[52px] px-4 pr-12 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          aria-label="Buscar por ubicación"
          readOnly={isMobile}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {value && !isMobile && (
            <button
              type="button"
              onClick={() => handleInputChange("")}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              aria-label="Limpiar búsqueda"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
          <Search className="w-5 h-5 text-gray-400" aria-hidden="true" />
        </div>
      </div>

      {/* Suggestions dropdown (desktop) */}
      {!isMobile && showSuggestions && suggestions.length > 0 && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
            className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden"
          >
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-text border-b border-gray-100 dark:border-gray-700 last:border-b-0"
              >
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-gray-400" />
                  <span>{suggestion}</span>
                </div>
              </button>
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );

  // Mobile: Show modal
  if (isMobile && isModalOpen) {
    return (
      <>
        {desktopInput}
        <BaseModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="¿Dónde quieres vivir?"
          className="md:hidden"
        >
          <div className="space-y-4">
            {/* Mobile input */}
            <div className="relative">
              <input
                type="text"
                value={value}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={placeholder}
                autoFocus
                className="w-full h-[56px] px-4 pr-12 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary text-lg"
                aria-label="Buscar por ubicación"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {value ? (
                  <button
                    type="button"
                    onClick={() => handleInputChange("")}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    aria-label="Limpiar búsqueda"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                ) : (
                  <Search className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </div>

            {/* Suggestions list */}
            {suggestions.length > 0 && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 px-2">
                  Sugerencias
                </p>
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full px-4 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <Search className="w-5 h-5 text-gray-400" />
                      <span className="text-base font-medium">{suggestion}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Popular comunas */}
            {!value && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 px-2">
                  Comunas populares
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {COMUNAS_PRINCIPALES.slice(0, 6).map((comuna) => (
                    <button
                      key={comuna}
                      type="button"
                      onClick={() => handleSuggestionClick(comuna)}
                      className="px-4 py-3 text-sm font-medium bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors text-left"
                    >
                      {comuna}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </BaseModal>
      </>
    );
  }

  return desktopInput;
}
