"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { SearchInput } from "@/components/filters/SearchInput";

interface SearchFormProps {
  className?: string;
}

export function SearchForm({ className = "" }: SearchFormProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [comuna, setComuna] = useState("");
  const [precioMin, setPrecioMin] = useState("");
  const [precioMax, setPrecioMax] = useState("");
  const [dormitorios, setDormitorios] = useState("");
  const [banos, setBanos] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Construir query params
    const params = new URLSearchParams();

    if (searchQuery.trim()) {
      params.set("q", searchQuery.trim());
    }
    if (comuna && comuna !== "Todas") {
      params.set("comuna", comuna);
    }
    if (precioMin) {
      params.set("precioMin", precioMin);
    }
    if (precioMax) {
      params.set("precioMax", precioMax);
    }
    if (dormitorios && dormitorios !== "Todas") {
      params.set("dormitorios", dormitorios);
    }
    if (banos && banos !== "Todas") {
      params.set("banos", banos);
    }

    // Redirigir a página de resultados
    const queryString = params.toString();
    router.push(`/buscar${queryString ? `?${queryString}` : ""}`);
  };

  const comunas = ["Todas", "Las Condes", "Ñuñoa", "Providencia", "Santiago", "Macul", "La Florida", "Estación Central"];
  const dormitoriosOptions = ["Todas", "1", "2", "3", "4+"];
  const banosOptions = ["Todas", "1", "2", "3", "4+"];

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      {/* Búsqueda por texto */}
      <div>
        <label htmlFor="search" className="sr-only">
          Buscar propiedades
        </label>
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Buscar por dirección, comuna, nombre de edificio..."
          className="w-full"
        />
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {/* Comuna */}
        <div>
          <label htmlFor="comuna" className="block text-sm font-medium text-text mb-2">
            Comuna
          </label>
          <select
            id="comuna"
            value={comuna}
            onChange={(e) => setComuna(e.target.value)}
            className="w-full rounded-xl border border-soft/50 bg-bg px-4 py-3 text-text ring-1 ring-soft/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
          >
            {comunas.map((c) => (
              <option key={c} value={c === "Todas" ? "" : c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Precio Mínimo */}
        <div>
          <label htmlFor="precioMin" className="block text-sm font-medium text-text mb-2">
            Precio Mín.
          </label>
          <input
            type="number"
            id="precioMin"
            value={precioMin}
            onChange={(e) => setPrecioMin(e.target.value)}
            placeholder="Ej: 500000"
            min="0"
            className="w-full rounded-xl border border-soft/50 bg-bg px-4 py-3 text-text ring-1 ring-soft/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
          />
        </div>

        {/* Precio Máximo */}
        <div>
          <label htmlFor="precioMax" className="block text-sm font-medium text-text mb-2">
            Precio Máx.
          </label>
          <input
            type="number"
            id="precioMax"
            value={precioMax}
            onChange={(e) => setPrecioMax(e.target.value)}
            placeholder="Ej: 2000000"
            min="0"
            className="w-full rounded-xl border border-soft/50 bg-bg px-4 py-3 text-text ring-1 ring-soft/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
          />
        </div>

        {/* Dormitorios */}
        <div>
          <label htmlFor="dormitorios" className="block text-sm font-medium text-text mb-2">
            Dormitorios
          </label>
          <select
            id="dormitorios"
            value={dormitorios}
            onChange={(e) => setDormitorios(e.target.value)}
            className="w-full rounded-xl border border-soft/50 bg-bg px-4 py-3 text-text ring-1 ring-soft/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
          >
            {dormitoriosOptions.map((d) => (
              <option key={d} value={d === "Todas" ? "" : d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Baños */}
        <div>
          <label htmlFor="banos" className="block text-sm font-medium text-text mb-2">
            Baños
          </label>
          <select
            id="banos"
            value={banos}
            onChange={(e) => setBanos(e.target.value)}
            className="w-full rounded-xl border border-soft/50 bg-bg px-4 py-3 text-text ring-1 ring-soft/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
          >
            {banosOptions.map((b) => (
              <option key={b} value={b === "Todas" ? "" : b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Botón de búsqueda */}
      <div className="flex justify-center pt-2">
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-primary/90 px-8 py-4 text-base font-semibold text-primary-foreground shadow-lg transition-all duration-200 hover:shadow-xl hover:shadow-primary/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary sm:px-10 sm:py-5 sm:text-lg"
        >
          <Search className="w-5 h-5" aria-hidden="true" />
          Buscar Propiedades
        </button>
      </div>
    </form>
  );
}
