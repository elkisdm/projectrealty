/**
 * Loading UI para la raíz: se muestra mientras carga la página (home u otras).
 * Respeta prefers-reduced-motion (skeleton sin animación cuando el usuario lo prefiere).
 */
export default function RootLoading() {
  return (
    <main className="min-h-screen bg-bg text-text" aria-busy="true" aria-label="Cargando">
      <div className="min-h-[50vh] flex flex-col items-center justify-center px-4">
        {/* Hero / búsqueda placeholder */}
        <div className="w-full max-w-2xl space-y-4">
          <div className="h-10 w-3/4 max-w-md bg-border/50 rounded-2xl motion-reduce:animate-none animate-pulse" />
          <div className="flex gap-2 flex-wrap justify-center">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-10 w-24 bg-border/40 rounded-xl motion-reduce:animate-none animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
      {/* Secciones inferiores placeholder */}
      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-12">
        <section aria-hidden>
          <div className="h-6 w-48 bg-border/40 rounded-md mb-4 motion-reduce:animate-none animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-64 rounded-2xl bg-border/30 motion-reduce:animate-none animate-pulse"
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
