// RSC: FAQ optimizado para conversión - anyoneAI Style
type FAQItem = {
    question: string;
    answer: string;
};

const faqItems: FAQItem[] = [
    {
        question: "¿Hay costos ocultos o sorpresas?",
        answer: "No. El precio que ves es el precio final. Incluye todo: edición, música libre de derechos, captions automáticos y 1 ajuste gratis. Sin costos adicionales."
    },
    {
        question: "¿Qué pasa si no me gustan los videos?",
        answer: "Incluimos 1 ajuste gratis. Si aún no estás satisfecho después del ajuste, te devolvemos el 100% del dinero. Sin preguntas."
    },
    {
        question: "¿Realmente entregan en 72 horas?",
        answer: "Sí, garantizado. Si por alguna razón no cumplo el plazo, te hago un video adicional gratis. En 3 años nunca he incumplido una entrega."
    },
    {
        question: "¿Por qué solo 10 cupos? ¿Es una estrategia de marketing?",
        answer: "No es marketing. Para mantener la calidad y entrega rápida, solo puedo trabajar con 10 clientes por mes. Una vez completados, la oferta se cierra hasta el próximo mes."
    }
];

export default function FAQ() {
    return (
        <section aria-labelledby="faq" className="mt-12 space-y-6">
            <div className="text-center">
                <h2 id="faq" className="text-xl sm:text-2xl font-bold tracking-tight mb-3 text-white">
                    ❓ Preguntas frecuentes
                </h2>
                <p className="text-sm sm:text-base text-text-muted max-w-2xl mx-auto px-4">
                    Resolvemos las dudas más comunes
                </p>
            </div>

            {/* FAQ Simplificado - anyoneAI Style */}
            <div className="space-y-4 max-w-2xl mx-auto px-4">
                {faqItems.map((item, index) => (
                    <details
                        key={index}
                        className="group glass-card-hover"
                    >
                        <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors">
                            <span className="font-medium text-white text-sm sm:text-base pr-4">
                                {item.question}
                            </span>
                            <svg
                                className="w-5 h-5 text-text-muted group-open:rotate-180 transition-transform flex-shrink-0"
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
                        </summary>
                        <div className="px-4 pb-4">
                            <p className="text-sm text-text-muted leading-relaxed">
                                {item.answer}
                            </p>
                        </div>
                    </details>
                ))}
            </div>

            {/* CTA después de FAQ - anyoneAI Style */}
            <div className="text-center pt-6">
                <div className="glass-card p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-bold text-white mb-2">
                        ¿Tienes otra pregunta?
                    </h3>
                    <p className="text-xs sm:text-sm text-text-muted mb-4">
                        Escríbeme por WhatsApp y te respondo en menos de 5 minutos
                    </p>
                    <a
                        href="https://wa.me/56993481594?text=Hola,%20tengo%20una%20pregunta%20sobre%20el%20pack%20de%20videos"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cta-outline inline-flex items-center gap-2 text-sm font-medium"
                    >
                        <span>💬</span>
                        Preguntar por WhatsApp
                    </a>
                </div>
            </div>
        </section>
    );
}
