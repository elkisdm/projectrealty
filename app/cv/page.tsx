import { Metadata } from 'next';
import { Mail, Phone, Linkedin, ExternalLink, Github } from 'lucide-react';
import { DownloadPDFButton } from './components/DownloadPDFButton';

export const metadata: Metadata = {
    title: 'ELKIS DAZA - Estratega de Marketing Digital & Automatización',
    description: 'Estratega de Marketing Digital & Automatización - Asesor Inmobiliario',
    openGraph: {
        title: 'ELKIS DAZA - Estratega de Marketing Digital & Automatización',
        description: 'Estratega de Marketing Digital & Automatización - Asesor Inmobiliario',
        type: 'profile',
    },
    alternates: {
        canonical: '/cv',
    },
};

export default function CVPage() {
    return (
        <>
            {/* Ocultar Header y Footer del layout raíz usando CSS */}
            <style
                dangerouslySetInnerHTML={{
                    __html: `
          header,
          footer {
            display: none !important;
          }
          main#main-content {
            padding: 0 !important;
            margin: 0 !important;
          }
        `,
                }}
            />
            <div className="min-h-screen bg-neutral-950 text-neutral-100 antialiased">
                {/* Background */}
                <div className="pointer-events-none fixed inset-0" aria-hidden="true">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.06),transparent_40%),radial-gradient(circle_at_70%_60%,rgba(255,255,255,0.05),transparent_45%)]" />
                    <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.25),rgba(0,0,0,0.85))]" />
                </div>

                <main className="relative mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
                    {/* DATOS BÁSICOS */}
                    <section className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-10">
                        <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl mb-2">ELKIS DAZA</h1>
                        <p className="text-base text-neutral-300 sm:text-lg mb-6">
                            Estratega de Marketing Digital & Automatización - Asesor Inmobiliario
                        </p>

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm text-neutral-300">
                                Santiago, Chile
                            </p>

                            <div className="flex flex-wrap gap-2">
                                <a
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-neutral-950 hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-neutral-950 transition"
                                    href="mailto:hola@elkisrealtor.cl"
                                    aria-label="Enviar email a hola@elkisrealtor.cl"
                                >
                                    <Mail className="w-4 h-4" aria-hidden="true" />
                                    <span>hola@elkisrealtor.cl</span>
                                </a>
                                <a
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-neutral-950 transition"
                                    href="tel:+56993481594"
                                    aria-label="Llamar al +56 9 9348 1594"
                                >
                                    <Phone className="w-4 h-4" aria-hidden="true" />
                                    <span>+56 9 9348 1594</span>
                                </a>
                                <a
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-neutral-950 transition"
                                    href="https://www.linkedin.com/in/elkis-daza-2b30311a6/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Perfil de LinkedIn"
                                >
                                    <Linkedin className="w-4 h-4" aria-hidden="true" />
                                    <span>LinkedIn</span>
                                </a>
                                <DownloadPDFButton />
                            </div>
                        </div>
                    </section>

                    {/* SECTIONS GRID */}
                    <section className="mt-10 grid gap-6 lg:grid-cols-12">
                        {/* LEFT (content) */}
                        <div className="lg:col-span-8 space-y-6">
                            {/* PERFIL PROFESIONAL */}
                            <article className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
                                <h2 className="text-lg font-semibold tracking-tight">PERFIL PROFESIONAL</h2>
                                <div className="mt-4 space-y-3 text-neutral-200 leading-relaxed">
                                    <p>
                                        Estratega de marketing digital con enfoque en sistemas de conversión, automatización y experiencia
                                        de usuario.
                                    </p>
                                    <p>
                                        Especializado en transformar ideas, ofertas y procesos dispersos en sistemas funcionales de
                                        marketing y ventas.
                                    </p>
                                </div>
                            </article>

                            {/* ÁREAS DE ESPECIALIZACIÓN */}
                            <article className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
                                <h2 className="text-lg font-semibold tracking-tight">ÁREAS DE ESPECIALIZACIÓN</h2>

                                <div className="mt-4 flex flex-wrap gap-2">
                                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-neutral-200 break-words transition-colors hover:bg-white/10 hover:border-white/20">
                                        Estrategia digital y marketing de performance
                                    </span>
                                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-neutral-200 break-words transition-colors hover:bg-white/10 hover:border-white/20">
                                        Automatización de marketing y chatbots
                                    </span>
                                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-neutral-200 break-words transition-colors hover:bg-white/10 hover:border-white/20">
                                        Lanzamiento y venta de infoproductos
                                    </span>
                                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-neutral-200 break-words transition-colors hover:bg-white/10 hover:border-white/20">
                                        Affiliate marketing
                                    </span>
                                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-neutral-200 break-words transition-colors hover:bg-white/10 hover:border-white/20">
                                        Publicidad digital (Meta Ads)
                                    </span>
                                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-neutral-200 break-words transition-colors hover:bg-white/10 hover:border-white/20">
                                        Email marketing
                                    </span>
                                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-neutral-200 break-words transition-colors hover:bg-white/10 hover:border-white/20">
                                        Desarrollo web orientado a conversión
                                    </span>
                                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-neutral-200 break-words transition-colors hover:bg-white/10 hover:border-white/20">
                                        Analítica digital
                                    </span>
                                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-neutral-200 break-words transition-colors hover:bg-white/10 hover:border-white/20">
                                        Vibe Coding
                                    </span>
                                </div>
                            </article>

                            {/* EXPERIENCIA PROFESIONAL */}
                            <article className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
                                <h2 className="text-lg font-semibold tracking-tight">EXPERIENCIA PROFESIONAL</h2>

                                <div className="mt-6 space-y-6">
                                    <div className="rounded-xl border border-white/10 bg-black/20 p-5">
                                        <div className="space-y-1">
                                            <p className="text-base font-semibold">Estratega de Marketing Digital</p>
                                            <p className="text-sm text-neutral-300">
                                                Infinity Esthetic - Santa Marta/Cartagena Colombia (Clínica Estética)
                                            </p>
                                            <p className="text-sm text-neutral-300">3 años</p>
                                            <p className="text-sm text-neutral-300">Sindy Claro - Santa Marta Colombia (Clínica Estética)</p>
                                            <p className="text-sm text-neutral-300">1 año</p>
                                        </div>

                                        <ul className="mt-4 space-y-2 text-sm text-neutral-200 list-disc pl-5 leading-relaxed">
                                            <li>
                                                Diseño y ejecución de estrategias digitales orientadas a conversión y generación de
                                                leads calificados.
                                            </li>
                                            <li>
                                                Implementación de automatizaciones con chatbots para captación, calificación y
                                                seguimiento de usuarios.
                                            </li>
                                            <li>Creación y optimización de embudos de venta.</li>
                                            <li>
                                                Análisis de métricas clave para la toma de decisiones y mejora continua del rendimiento.
                                            </li>
                                        </ul>

                                        <p className="mt-4 text-sm text-neutral-200">
                                            + US$ 200.000 de inversión en meta ads gestionados
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-white/10 bg-black/20 p-5">
                                        <div className="space-y-1">
                                            <p className="text-base font-semibold">Creador de contenido inmobiliario</p>
                                            <p className="text-sm text-neutral-300">Marca Personal</p>
                                        </div>

                                        <p className="mt-4 text-sm text-neutral-200">
                                            Diseño y producción de vídeos de edificios de renta residenciales, alcanzando hasta 200k
                                            reproducciones orgánicas y más de 3000 leads captados.
                                        </p>
                                    </div>
                                </div>
                            </article>

                            {/* PORTAFOLIO */}
                            <article className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
                                <h2 className="text-lg font-semibold tracking-tight">PORTAFOLIO DE PROYECTOS (EN DESARROLLO)</h2>

                                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:gap-5">
                                    <div className="group rounded-xl border border-white/10 bg-black/20 p-5 hover:bg-white/5 transition-all">
                                        <p className="text-sm font-semibold">REDIFY CRM</p>
                                        <p className="mt-2 text-sm text-neutral-200">
                                            CRM para gestión de clientes de fibra óptica, factibilizador automático en desarrollo.
                                        </p>
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            <a
                                                href="https://redify-tau.vercel.app/login"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-neutral-300 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black/20 transition-colors"
                                                aria-label="Ver proyecto REDIFY CRM"
                                            >
                                                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                                                <span>Ver proyecto</span>
                                            </a>
                                            <a
                                                href="https://github.com/elkisdm/redify"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-neutral-300 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black/20 transition-colors"
                                                aria-label="Ver repositorio en GitHub - redify"
                                            >
                                                <Github className="w-3.5 h-3.5" aria-hidden="true" />
                                                <span>Ver repo</span>
                                            </a>
                                        </div>
                                    </div>

                                    <div className="group rounded-xl border border-white/10 bg-black/20 p-5 hover:bg-white/5 transition-all">
                                        <p className="text-sm font-semibold">CALCULADORA DE RENTABILIDAD INMOBILIARIA</p>
                                        <p className="mt-2 text-sm text-neutral-200">
                                            Herramienta para calcular rentabilidad en inversión inmobiliaria y exportar informes.
                                        </p>
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            <a
                                                href="https://app.selectcapital.cl/"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-neutral-300 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black/20 transition-colors"
                                                aria-label="Ver proyecto Calculadora de Rentabilidad Inmobiliaria"
                                            >
                                                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                                                <span>Ver proyecto</span>
                                            </a>
                                            <a
                                                href="https://github.com/elkisdm/selectcapital/tree/main/investment-engine-v1"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-neutral-300 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black/20 transition-colors"
                                                aria-label="Ver repositorio en GitHub - selectcapital"
                                            >
                                                <Github className="w-3.5 h-3.5" aria-hidden="true" />
                                                <span>Ver repo</span>
                                            </a>
                                        </div>
                                    </div>

                                    <div className="group rounded-xl border border-white/10 bg-black/20 p-5 hover:bg-white/5 transition-all">
                                        <p className="text-sm font-semibold">ELKIS REALTOR APP</p>
                                        <p className="mt-2 text-sm text-neutral-200">
                                            Plataforma para listar propiedades, próximamente impulsada con IA.
                                        </p>
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            <a
                                                href="https://elkisrealtor.cl/"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-neutral-300 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black/20 transition-colors"
                                                aria-label="Ver proyecto Elkis Realtor App"
                                            >
                                                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                                                <span>Ver proyecto</span>
                                            </a>
                                            <a
                                                href="https://github.com/elkisdm/projectrealty"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-neutral-300 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black/20 transition-colors"
                                                aria-label="Ver repositorio en GitHub - projectrealty"
                                            >
                                                <Github className="w-3.5 h-3.5" aria-hidden="true" />
                                                <span>Ver repo</span>
                                            </a>
                                        </div>
                                    </div>

                                    <div className="group rounded-xl border border-white/10 bg-black/20 p-5 hover:bg-white/5 transition-all">
                                        <p className="text-sm font-semibold">SELECT CAPITAL LANDING PAGE</p>
                                        <p className="mt-2 text-sm text-neutral-200">
                                            Landing page para asesoría inmobiliaria y calculadora de rentabilidad.
                                        </p>
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            <a
                                                href="https://selectcapital.cl/"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-neutral-300 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black/20 transition-colors"
                                                aria-label="Ver proyecto Select Capital Landing Page"
                                            >
                                                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                                                <span>Ver proyecto</span>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </article>

                            {/* CIERRE */}
                            <footer className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
                                <p className="text-neutral-200 leading-relaxed">
                                    Veo el negocio como un sistema completo: conecto datos, sistemas y experiencia de usuario para tomar
                                    decisiones que tengan impacto real y propósito.
                                </p>

                                <div className="mt-6 flex flex-wrap gap-2">
                                    <a
                                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-neutral-950 hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-neutral-950 transition"
                                        href="mailto:hola@elkisrealtor.cl"
                                        aria-label="Enviar email a hola@elkisrealtor.cl"
                                    >
                                        <Mail className="w-4 h-4" aria-hidden="true" />
                                        <span>hola@elkisrealtor.cl</span>
                                    </a>
                                    <a
                                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-neutral-950 transition"
                                        href="tel:+56993481594"
                                        aria-label="Llamar al +56 9 9348 1594"
                                    >
                                        <Phone className="w-4 h-4" aria-hidden="true" />
                                        <span>+56 9 9348 1594</span>
                                    </a>
                                    <a
                                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-neutral-950 transition"
                                        href="https://www.linkedin.com/in/elkis-daza-2b30311a6/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label="Perfil de LinkedIn"
                                    >
                                        <Linkedin className="w-4 h-4" aria-hidden="true" />
                                        <span>LinkedIn</span>
                                    </a>
                                </div>
                            </footer>
                        </div>

                        {/* RIGHT (sidebar) */}
                        <aside className="lg:col-span-4 space-y-6">
                            {/* FORMACIÓN */}
                            <section className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
                                <h2 className="text-lg font-semibold tracking-tight">FORMACIÓN</h2>
                                <div className="mt-4 space-y-4 text-sm text-neutral-200">
                                    <p className="whitespace-pre-line break-words">
                                        {`Convierte Más – BMS (Business Marketing Strategy)
Formación en negocios, analítica digital y pensamiento estratégico aplicado.`}
                                    </p>
                                    <p className="whitespace-pre-line break-words">
                                        {`Convierte Más – Especialización en publicidad online
Automatización con chatbots y creación de ofertas irresistibles.`}
                                    </p>
                                    <p className="whitespace-pre-line break-words">
                                        {`Prompt Engineering – Udemy
Especializado en comunicación estratégica con IA para obtener respuestas más precisas, relevantes y contextualizadas.`}
                                    </p>
                                </div>
                            </section>

                            {/* HERRAMIENTAS DOMINADAS */}
                            <section className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
                                <h2 className="text-lg font-semibold tracking-tight">HERRAMIENTAS DOMINADAS</h2>
                                <div className="mt-4 space-y-4 text-sm text-neutral-200">
                                    <p className="whitespace-pre-line break-words leading-relaxed">
                                        {`Marketing & Analítica
Meta Ads · Google Analytics · Google Tag Manager · Hotjar · Metricool`}
                                    </p>

                                    <p className="whitespace-pre-line break-words leading-relaxed">
                                        {`Automatización de chat & Gestión de proyectos
ManyChat · ChatGPT API · Trello · Notion · Jira · Linear`}
                                    </p>

                                    <p className="whitespace-pre-line break-words leading-relaxed">
                                        {`Web, Pagos & E-commerce
WordPress · WooCommerce · Shopify · Webpay · Flow · Stripe`}
                                    </p>

                                    <p className="whitespace-pre-line break-words leading-relaxed">
                                        {`Entornos de Desarrollo & Deploy
Cursor · Docker · Vercel · Supabase · Github`}
                                    </p>

                                    <p className="whitespace-pre-line break-words leading-relaxed">
                                        {`IA, Agentes & Automatización
Codex · NotebookLM · ElevenLabs · Higgsfield · N8N`}
                                    </p>
                                </div>
                            </section>

                            {/* HABILIDADES CLAVE */}
                            <section className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
                                <h2 className="text-lg font-semibold tracking-tight">HABILIDADES CLAVE</h2>
                                <ul className="mt-4 space-y-2 text-sm text-neutral-200 list-disc pl-5 leading-relaxed">
                                    <li>Pensamiento estratégico</li>
                                    <li>Resolución de problemas</li>
                                    <li>Comunicación efectiva</li>
                                    <li>Aprendizaje autónomo</li>
                                    <li>Inglés nivel B1</li>
                                </ul>
                            </section>
                        </aside>
                    </section>

                    <p className="mt-10 text-center text-xs text-neutral-500">ELKIS DAZA</p>
                </main>
            </div>
        </>
    );
}
