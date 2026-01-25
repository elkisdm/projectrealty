"use client";
import { useEffect } from "react";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Optional: log error to monitoring
    // console.error(error);
  }, [error]);

  return (
    <main id="main-content" role="main" className="container mx-auto px-4 md:px-6 py-16">
      <div role="alert" className="max-w-xl mx-auto text-center">
        <h1 className="text-2xl font-semibold mb-2">Ocurrió un problema</h1>
        <p className="text-[var(--subtext)] mb-6">
          {error?.message || "No pudimos cargar esta sección."}
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-[var(--text)] text-[var(--bg)] hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]"
        >
          Reintentar
        </button>
      </div>
    </main>
  );
}


