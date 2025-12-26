// RSC: Prueba social y credenciales
type Credential = {
    icon: string;
    number: string;
    label: string;
    description: string;
};

type Testimonial = {
    quote: string;
    author: string;
    role: string;
    avatar?: string;
};

const credentials: Credential[] = [
    {
        icon: "🏠",
        number: "260+",
        label: "Arriendos",
        description: "Completados en el último año"
    },
    {
        icon: "📱",
        number: "15k+",
        label: "Seguidores",
        description: "En redes sociales"
    },
    {
        icon: "⭐",
        number: "4.9",
        label: "Rating",
        description: "Promedio de satisfacción"
    },
    {
        icon: "🎯",
        number: "72h",
        label: "Entrega",
        description: "Garantizada en todos los packs"
    }
];

const testimonial: Testimonial = {
    quote: "Los videos que me hizo generaron leads constantes para mi arriendo. En 2 semanas ya tenía 3 visitas programadas. Excelente servicio y entrega rápida.",
    author: "María González",
    role: "Propietaria en Providencia"
};

export default function SocialProof() {
    return (
        <section aria-labelledby="confianza" className="mt-16 space-y-12">
            {/* Credenciales principales */}
            <div className="text-center">
                <h2 id="confianza" className="text-2xl font-bold tracking-tight mb-4">
                    ¿Por qué confiar en mí?
                </h2>
                <p className="text-gray-300:text-gray-300 max-w-2xl mx-auto mb-8">
                    Apalancado en resultados reales y testimonios de clientes satisfechos
                </p>
            </div>

            {/* Grid de credenciales */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {credentials.map((credential, index) => (
                    <div
                        key={index}
                        className="text-center p-6 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 
                       dark:from-gray-800 dark:to-gray-900 border border-gray-700:border-gray-700
                       hover:shadow-lg transition-all duration-300 hover:scale-105"
                    >
                        <div className="text-4xl mb-3">{credential.icon}</div>
                        <div className="text-3xl font-bold text-white:text-gray-100 mb-1">
                            {credential.number}
                        </div>
                        <div className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            {credential.label}
                        </div>
                        <div className="text-sm text-gray-300:text-gray-400">
                            {credential.description}
                        </div>
                    </div>
                ))}
            </div>

            {/* Ejemplos de clips y testimonio */}
            <div className="grid gap-8 lg:grid-cols-2">
                {/* Ejemplos de clips */}
                <div className="space-y-6">
                    <h3 className="text-xl font-bold text-center lg:text-left">
                        Ejemplos de videos realizados
                    </h3>
                    <div className="space-y-4">
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 
                            rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                                    <span className="text-2xl">🎬</span>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-white:text-gray-100">
                                        Video para TikTok
                                    </h4>
                                    <p className="text-sm text-gray-300:text-gray-400">
                                        Arriendo en Las Condes
                                    </p>
                                </div>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                <strong>Resultado:</strong> 2.3k visualizaciones, 15 leads en 48h
                            </p>
                        </div>

                        <div className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 
                            rounded-xl p-6 border border-green-200 dark:border-green-800">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                                    <span className="text-2xl">📱</span>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-white:text-gray-100">
                                        Reel para Instagram
                                    </h4>
                                    <p className="text-sm text-gray-300:text-gray-400">
                                        Arriendo en Providencia
                                    </p>
                                </div>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                <strong>Resultado:</strong> 1.8k reproducciones, 8 visitas programadas
                            </p>
                        </div>
                    </div>
                </div>

                {/* Testimonio */}
                <div className="space-y-6">
                    <h3 className="text-xl font-bold text-center lg:text-left">
                        Lo que dicen mis clientes
                    </h3>
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 
                          rounded-xl p-8 border border-yellow-200 dark:border-yellow-800 relative">
                        {/* Quote icon */}
                        <div className="absolute -top-3 -left-3 w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                            <span className="text-yellow-600 dark:text-yellow-400 text-lg">"</span>
                        </div>

                        <blockquote className="text-gray-800 dark:text-gray-200 mb-6 leading-relaxed">
                            {testimonial.quote}
                        </blockquote>

                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-lg">
                                    {testimonial.author.charAt(0)}
                                </span>
                            </div>
                            <div>
                                <div className="font-semibold text-white:text-gray-100">
                                    {testimonial.author}
                                </div>
                                <div className="text-sm text-gray-300:text-gray-400">
                                    {testimonial.role}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Garantía badge */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 
                          rounded-xl p-6 border border-green-200 dark:border-green-800 text-center">
                        <div className="flex items-center justify-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                                <span className="text-green-600 dark:text-green-400 text-xl">✓</span>
                            </div>
                            <h4 className="text-lg font-bold text-white:text-gray-100">
                                Garantía 10 interacciones
                            </h4>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                            Si no generas al menos 10 interacciones en 7 días, te hago un video adicional gratis.
                        </p>
                    </div>
                </div>
            </div>

            {/* CTA de confianza */}
            <div className="text-center pt-6">
                <p className="text-sm text-gray-400:text-gray-400 mb-4">
                    ¿Listo para generar leads constantes?
                </p>
                <a
                    href="#planes"
                    className="inline-flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400
                     hover:text-green-700 dark:hover:text-green-300 transition-colors"
                >
                    Ver planes y reservar mi cupo
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
                            d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                    </svg>
                </a>
            </div>
        </section>
    );
}

