// RSC: Value Props con iconografía visual
type ValueProp = {
  icon: string;
  title: string;
  description: string;
  highlight?: string;
};

const valueProps: ValueProp[] = [
  {
    icon: "⚡",
    title: "Entrega en 72 horas",
    description: "Videos listos para publicar en menos de 3 días",
    highlight: "72h"
  },
  {
    icon: "🎙️",
    title: "Voz profesional",
    description: "Mejorada o clonada según tu preferencia",
    highlight: "Pro"
  },
  {
    icon: "🔄",
    title: "1 ajuste incluido",
    description: "Cambios menores sin costo adicional",
    highlight: "Gratis"
  },
  {
    icon: "📊",
    title: "260+ arriendos",
    description: "Apalancado en resultados comprobados",
    highlight: "260+"
  }
];

export default function ValueProps() {
  return (
    <section aria-labelledby="beneficios" className="mt-16 space-y-8">
      <div className="text-center">
        <h2 id="beneficios" className="text-2xl font-bold tracking-tight mb-2">
          ¿Por qué elegir este pack?
        </h2>
        <p className="text-gray-300:text-gray-300 max-w-2xl mx-auto">
          Diseñado para maximizar tus conversiones con elementos probados en el mercado inmobiliario
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {valueProps.map((prop, index) => (
          <div
            key={index}
            className="group relative p-6 rounded-xl border border-gray-700:border-gray-700 
                       hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200
                       hover:shadow-md dark:hover:shadow-gray-900/20"
          >
            {/* Icono con highlight */}
            <div className="flex items-center gap-3 mb-4">
              <div className="text-3xl group-hover:scale-110 transition-transform duration-200">
                {prop.icon}
              </div>
              {prop.highlight && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold
                                 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  {prop.highlight}
                </span>
              )}
            </div>

            {/* Contenido */}
            <div className="space-y-2">
              <h3 className="font-semibold text-lg text-white:text-gray-100">
                {prop.title}
              </h3>
              <p className="text-sm text-gray-300:text-gray-300 leading-relaxed">
                {prop.description}
              </p>
            </div>

            {/* Indicador de hover */}
            <div className="absolute inset-0 rounded-xl border-2 border-transparent 
                           group-hover:border-green-200 dark:group-hover:border-green-800 
                           transition-colors duration-200 pointer-events-none" />
          </div>
        ))}
      </div>

      {/* CTA secundario */}
      <div className="text-center pt-4">
        <p className="text-sm text-gray-400:text-gray-400 mb-2">
          ¿Necesitas más información?
        </p>
        <a
          href="#planes"
          className="inline-flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400
                     hover:text-green-700 dark:hover:text-green-300 transition-colors"
        >
          Ver planes y precios
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </a>
      </div>
    </section>
  );
}


