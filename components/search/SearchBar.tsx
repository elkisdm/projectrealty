"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, X, Clock } from "lucide-react";
// import { searchProducts } from "@workspace/data/ecommerce.mock"; // Deshabilitado - no es parte del MVP
// import type { Product } from "@schemas/ecommerce"; // Deshabilitado - no es parte del MVP
import Link from "next/link";

interface SearchBarProps {
  onSearch?: (query: string) => void;
  className?: string;
  placeholder?: string;
}

export function SearchBar({
  onSearch,
  className = "",
  placeholder = "Buscar productos...",
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Array<{ id: string; title: string; handle: string; vendor?: string; categoryName?: string }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Cargar historial desde localStorage
  useEffect(() => {
    const history = localStorage.getItem("elkisecom-search-history");
    if (history) {
      try {
        setSearchHistory(JSON.parse(history));
      } catch {
        setSearchHistory([]);
      }
    }
  }, []);

  // Buscar productos mientras escribe
  useEffect(() => {
    if (query.length >= 2) {
      // Deshabilitado - no es parte del MVP
      const results: Array<{ id: string; title: string; handle: string; vendor?: string; categoryName?: string }> = [];
      setSuggestions(results);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(query.length > 0);
    }
  }, [query]);

  // Cerrar sugerencias al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      // Guardar en historial
      const newHistory = [
        query.trim(),
        ...searchHistory.filter((h) => h !== query.trim()),
      ].slice(0, 5);
      setSearchHistory(newHistory);
      localStorage.setItem("elkisecom-search-history", JSON.stringify(newHistory));

      if (onSearch) {
        onSearch(query.trim());
      } else {
        window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
      }
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (product: { id: string; title: string; handle: string; vendor?: string; categoryName?: string }) => {
    setQuery("");
    setShowSuggestions(false);
    window.location.href = `/product/${product.handle}`;
  };

  const handleHistoryClick = (term: string) => {
    setQuery(term);
    if (onSearch) {
      onSearch(term);
    } else {
      window.location.href = `/search?q=${encodeURIComponent(term)}`;
    }
    setShowSuggestions(false);
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem("elkisecom-search-history");
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          placeholder={placeholder}
          className="w-full px-4 py-3 pl-12 pr-10 bg-bg border border-border rounded-lg text-text placeholder-subtext focus:outline-none focus:ring-2 focus:ring-[#8B6CFF] focus:border-transparent"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-subtext" />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="absolute right-12 top-1/2 -translate-y-1/2 p-1 text-subtext hover:text-text transition-colors"
            aria-label="Limpiar búsqueda"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-[#8B6CFF] text-white rounded-lg hover:bg-[#7a5ce6] transition-colors text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#8B6CFF] focus:ring-offset-2"
        >
          Buscar
        </button>
      </form>

      {/* Sugerencias y historial */}
      {showSuggestions && (suggestions.length > 0 || searchHistory.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          {/* Sugerencias */}
          {suggestions.length > 0 && (
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-semibold text-subtext uppercase">
                Sugerencias
              </div>
              {suggestions.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleSuggestionClick(product)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-text truncate">
                      {product.title}
                    </div>
                    <div className="text-sm text-subtext truncate">
                      {product.vendor || product.categoryName}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Historial */}
          {searchHistory.length > 0 && (
            <div className="p-2 border-t border-border">
              <div className="flex items-center justify-between px-3 py-2">
                <div className="text-xs font-semibold text-subtext uppercase flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  Historial
                </div>
                <button
                  onClick={clearHistory}
                  className="text-xs text-subtext hover:text-text transition-colors"
                >
                  Limpiar
                </button>
              </div>
              {searchHistory.map((term, index) => (
                <button
                  key={index}
                  onClick={() => handleHistoryClick(term)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-sm text-text"
                >
                  {term}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

