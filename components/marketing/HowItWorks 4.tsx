"use client";

import MotionWrapper from "@/components/ui/MotionWrapper";

export default function HowItWorks() {

  const steps = [
    {
      number: "01",
      title: "Explora Home Amengual",
      description: "Descubre este increíble edificio en Estación Central con 4 tipologías disponibles y las mejores amenidades.",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      color: "text-cyan-600 dark:text-cyan-400",
      bgColor: "bg-cyan-50 dark:bg-cyan-950/20",
      borderColor: "border-cyan-200 dark:border-cyan-800/30",
    },
    {
      number: "02",
      title: "Ahorra la comisión",
      description: "Selecciona tu tipología ideal y ahorra el 100% de la comisión. Precios desde $450,000.",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
      borderColor: "border-blue-200 dark:border-blue-800/30",
    },
    {
      number: "03",
      title: "Reserva tu departamento",
      description: "Te acompañamos en todo el proceso hasta la firma. Soporte personalizado y sin complicaciones.",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950/20",
      borderColor: "border-purple-200 dark:border-purple-800/30",
    },
  ];

  return (
    <>
      <section aria-labelledby="how-heading" className="px-6 py-16 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-6xl">
          {/* Header minimalista */}
          <MotionWrapper direction="up" delay={0.1}>
            <div className="text-center mb-16">
              <h2 id="how-heading" className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
                ¿Cómo funciona?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Proceso simple para arrendar en Home Amengual
              </p>
            </div>
          </MotionWrapper>
          
          {/* Steps - diseño minimalista y simétrico */}
          <div className="grid gap-12 md:grid-cols-3">
            {steps.map((step, index) => (
              <MotionWrapper key={step.number} direction="up" delay={0.2 + index * 0.1}>
                <div className="relative group">
                  {/* Línea conectora en desktop */}
                  {index < steps.length - 1 && (
                    <div className="absolute left-full top-8 hidden h-px w-12 bg-gradient-to-r from-border to-transparent md:block" />
                  )}
                  
                  {/* Contenedor principal - más cuadrado y minimalista */}
                  <div className="relative bg-card border border-border/50 rounded-3xl p-8 h-full transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20">
                    
                    {/* Icono - diseño minimalista */}
                    <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6">
                      <div className={`w-full h-full rounded-2xl ${step.bgColor} ${step.borderColor} border-2 flex items-center justify-center ${step.color}`}>
                        {step.icon}
                      </div>
                    </div>
                    
                    {/* Número del paso - minimalista */}
                    <div className="text-center mb-6">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${step.color} ${step.bgColor} ${step.borderColor} border`}>
                        {step.number.slice(-1)}
                      </span>
                    </div>
                    
                    {/* Contenido */}
                    <div className="text-center">
                      <h3 className="text-xl font-semibold text-foreground mb-4">
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              </MotionWrapper>
            ))}
          </div>

          {/* CTA */}
          <MotionWrapper direction="up" delay={0.6}>
            <div className="mt-16 text-center">
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('openContactModal'))}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-4 text-base font-semibold shadow-lg transition-all duration-200 hover:shadow-xl hover:shadow-cyan-500/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-cyan-500"
              >
                Quiero más información
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </button>
            </div>
          </MotionWrapper>
        </div>
      </section>
    </>
  );
}


