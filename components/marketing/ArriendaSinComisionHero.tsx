"use client";

import MotionWrapper from "@/components/ui/MotionWrapper";

export default function ArriendaSinComisionHero() {
  return (
    <section className="relative isolate overflow-hidden px-6 py-24 sm:py-32 lg:px-8">
      {/* Background gradient */}
      <div 
        aria-hidden="true"
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
      >
        <div
          style={{
            clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-amber-500 to-orange-600 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
        />
      </div>

      <div className="mx-auto max-w-4xl text-center">
        {/* Badge dinámico */}
        <MotionWrapper direction="down" delay={0.1}>
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 dark:from-amber-400/20 dark:to-orange-400/20 blur-lg" />
              <p className="relative inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-red-600/10 dark:from-amber-400/10 dark:via-orange-400/5 dark:to-red-500/10 px-4 py-2 text-sm font-semibold text-amber-600 dark:text-amber-400 ring-1 ring-inset ring-amber-500/20 dark:ring-amber-400/20 backdrop-blur-sm">
                <span className="flex h-2 w-2 items-center justify-center">
                  <span className="absolute h-2 w-2 animate-ping rounded-full bg-amber-500 dark:bg-amber-400 opacity-75" />
                  <span className="relative h-1.5 w-1.5 rounded-full bg-amber-500 dark:bg-amber-400" />
                </span>
                +1000 disponibles en Santiago
              </p>
            </div>
          </div>
        </MotionWrapper>

        {/* Título principal */}
        <MotionWrapper direction="up" delay={0.2}>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            Tu próximo hogar está{" "}
            <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 dark:from-amber-400 dark:via-orange-400 dark:to-red-500 bg-clip-text text-transparent">
              más cerca
            </span>
            <br />
            <span className="text-3xl sm:text-4xl lg:text-5xl">de lo que imaginas</span>
          </h1>
        </MotionWrapper>

        {/* Subtítulo */}
        <MotionWrapper direction="up" delay={0.3}>
          <p className="mt-6 text-lg leading-8 text-muted-foreground sm:text-xl lg:text-2xl lg:leading-9">
            Departamentos listos para ti, con{" "}
            <br className="hidden sm:block" />
            <strong>precios claros</strong> y beneficios que te dan libertad.
          </p>
        </MotionWrapper>

        {/* CTAs */}
        <MotionWrapper direction="up" delay={0.4}>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
            <a
              href="#buildings-grid"
              className="group relative inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 dark:from-amber-600 dark:to-orange-700 dark:hover:from-amber-700 dark:hover:to-orange-800 px-8 py-4 text-base font-semibold text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:shadow-amber-500/25 dark:hover:shadow-amber-600/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber-500 sm:px-10 sm:py-5 sm:text-lg"
            >
              <span className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 dark:from-amber-600 dark:to-orange-700 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
              <span className="relative">Explorar departamentos</span>
            </a>
            
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('openContactModal'))}
              className="inline-flex items-center gap-2 rounded-2xl border border-border/50 bg-background/80 dark:bg-background/60 px-6 py-3 text-sm font-medium text-foreground backdrop-blur-sm transition-colors hover:bg-muted/50 dark:hover:bg-muted/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber-500 sm:px-8 sm:py-4 sm:text-base"
            >
              Quiero ser contactado
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </button>
          </div>
        </MotionWrapper>

        {/* Indicadores de valor */}
        <MotionWrapper direction="up" delay={0.6}>
          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-8">
            <div className="flex flex-col items-center">
              <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/30 p-4 ring-1 ring-amber-200/50 dark:ring-amber-800/50">
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">0%</div>
              </div>
              <p className="mt-2 text-sm font-medium text-muted-foreground">Comisión</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/30 p-4 ring-1 ring-orange-200/50 dark:ring-orange-800/50">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">100%</div>
              </div>
              <p className="mt-2 text-sm font-medium text-muted-foreground">Digital</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="rounded-2xl bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/30 p-4 ring-1 ring-red-200/50 dark:ring-red-800/50">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">Pet</div>
              </div>
              <p className="mt-2 text-sm font-medium text-muted-foreground">Friendly</p>
            </div>
          </div>
        </MotionWrapper>
      </div>
    </section>
  );
}

