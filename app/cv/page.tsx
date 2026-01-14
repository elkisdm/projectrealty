import { Metadata } from 'next';
import { Mail, Phone, Linkedin, ExternalLink, Github } from 'lucide-react';
import { DownloadPDFButton } from './components/DownloadPDFButton';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

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
            <div className="min-h-screen bg-bg text-text antialiased transition-colors duration-300">
                {/* Background decorativo */}
                <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(139,108,255,0.08),transparent_40%),radial-gradient(circle_at_70%_60%,rgba(0,230,179,0.06),transparent_45%)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(139,108,255,0.12),transparent_40%),radial-gradient(circle_at_70%_60%,rgba(0,230,179,0.08),transparent_45%)]" />
                    <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.02),rgba(0,0,0,0.1))] dark:bg-[linear-gradient(to_bottom,rgba(0,0,0,0.2),rgba(0,0,0,0.6))]" />
                </div>

                <main id="cv-content" className="relative z-10 mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10 lg:py-12">
                    {/* Header con ThemeToggle */}
                    <div className="mb-6 flex justify-end sm:mb-8">
                        <ThemeToggle />
                    </div>

                    {/* DATOS BÁSICOS */}
                    <section className="rounded-2xl border border-border bg-card p-4 shadow-card transition-colors duration-300 sm:p-6 md:p-8 lg:p-10">
                        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl">
                            ELKIS DAZA
                        </h1>
                        <p className="mt-2 text-sm text-text-secondary sm:text-base md:text-lg">
                            Estratega de Marketing Digital & Automatización - Asesor Inmobiliario
                        </p>

                        <div className="mt-4 flex flex-col gap-3 sm:mt-6 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                            <p className="text-xs text-text-secondary sm:text-sm">Santiago, Chile</p>

                            <div className="flex flex-wrap gap-2">
                                <a
                                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-text px-3 py-1.5 text-xs font-medium text-bg transition-colors hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 sm:gap-2 sm:px-4 sm:py-2 sm:text-sm"
                                    href="mailto:hola@elkisrealtor.cl"
                                    aria-label="Enviar email a hola@elkisrealtor.cl"
                                >
                                    <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
                                    <span className="hidden sm:inline">hola@elkisrealtor.cl</span>
                                    <span className="sm:hidden">Email</span>
                                </a>
                                <a
                                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text transition-colors hover:bg-soft focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 sm:gap-2 sm:px-4 sm:py-2 sm:text-sm"
                                    href="tel:+56993481594"
                                    aria-label="Llamar al +56 9 9348 1594"
                                >
                                    <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
                                    <span className="hidden sm:inline">+56 9 9348 1594</span>
                                    <span className="sm:hidden">Teléfono</span>
                                </a>
                                <a
                                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text transition-colors hover:bg-soft focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 sm:gap-2 sm:px-4 sm:py-2 sm:text-sm"
                                    href="https://www.linkedin.com/in/elkis-daza-2b30311a6/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Perfil de LinkedIn"
                                >
                                    <Linkedin className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
                                    <span className="hidden sm:inline">LinkedIn</span>
                                    <span className="sm:hidden">LinkedIn</span>
                                </a>
                                <div className="hidden sm:block">
                                    <DownloadPDFButton />
                                </div>
                            </div>
                        </div>

                        {/* Botón PDF en mobile */}
                        <div className="mt-3 sm:hidden">
                            <DownloadPDFButton />
                        </div>
                    </section>

                    {/* SECTIONS GRID */}
                    <section className="mt-6 grid gap-4 sm:mt-8 sm:gap-6 lg:grid-cols-12 lg:gap-8">
                        {/* LEFT (content) */}
                        <div className="lg:col-span-8 space-y-4 sm:space-y-6">
                            {/* PERFIL PROFESIONAL */}
                            <article className="rounded-2xl border border-border bg-card p-4 shadow-card transition-colors duration-300 sm:p-6 md:p-8">
                                <h2 className="text-base font-semibold tracking-tight sm:text-lg">PERFIL PROFESIONAL</h2>
                                <div className="mt-3 space-y-2 text-sm leading-relaxed text-text-secondary sm:mt-4 sm:space-y-3 sm:text-base">
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
                            <article className="rounded-2xl border border-border bg-card p-4 shadow-card transition-colors duration-300 sm:p-6 md:p-8">
                                <h2 className="text-base font-semibold tracking-tight sm:text-lg">ÁREAS DE ESPECIALIZACIÓN</h2>

                                <div className="mt-3 flex flex-wrap gap-2 sm:mt-4">
                                    {[
                                        'Estrategia digital y marketing de performance',
                                        'Automatización de marketing y chatbots',
                                        'Lanzamiento y venta de infoproductos',
                                        'Affiliate marketing',
                                        'Publicidad digital (Meta Ads)',
                                        'Email marketing',
                                        'Desarrollo web orientado a conversión',
                                        'Analítica digital',
                                        'Vibe Coding',
                                    ].map((item) => (
                                        <span
                                            key={item}
                                            className="rounded-full border border-border bg-surface px-2.5 py-1 text-xs text-text-secondary transition-colors hover:bg-soft hover:border-border-secondary sm:px-3 sm:text-sm"
                                        >
                                            {item}
                                        </span>
                                    ))}
                                </div>
                            </article>

                            {/* EXPERIENCIA PROFESIONAL */}
                            <article className="rounded-2xl border border-border bg-card p-4 shadow-card transition-colors duration-300 sm:p-6 md:p-8">
                                <h2 className="text-base font-semibold tracking-tight sm:text-lg">EXPERIENCIA PROFESIONAL</h2>

                                <div className="mt-4 space-y-4 sm:mt-6 sm:space-y-6">
                                    <div className="rounded-xl border border-border bg-surface p-4 transition-colors duration-300 sm:p-5">
                                        <div className="space-y-1">
                                            <p className="text-sm font-semibold text-text sm:text-base">Estratega de Marketing Digital</p>
                                            <p className="text-xs text-text-secondary sm:text-sm">
                                                Infinity Esthetic - Santa Marta/Cartagena Colombia (Clínica Estética)
                                            </p>
                                            <p className="text-xs text-text-secondary sm:text-sm">3 años</p>
                                            <p className="text-xs text-text-secondary sm:text-sm">Sindy Claro - Santa Marta Colombia (Clínica Estética)</p>
                                            <p className="text-xs text-text-secondary sm:text-sm">1 año</p>
                                        </div>

                                        <ul className="mt-3 space-y-1.5 text-xs text-text-secondary list-disc pl-4 leading-relaxed sm:mt-4 sm:space-y-2 sm:text-sm sm:pl-5">
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

                                        <p className="mt-3 text-xs text-text-secondary sm:mt-4 sm:text-sm">
                                            + US$ 200.000 de inversión en meta ads gestionados
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-border bg-surface p-4 transition-colors duration-300 sm:p-5">
                                        <div className="space-y-1">
                                            <p className="text-sm font-semibold text-text sm:text-base">Creador de contenido inmobiliario</p>
                                            <p className="text-xs text-text-secondary sm:text-sm">Marca Personal</p>
                                        </div>

                                        <p className="mt-3 text-xs text-text-secondary sm:mt-4 sm:text-sm">
                                            Diseño y producción de vídeos de edificios de renta residenciales, alcanzando hasta 200k
                                            reproducciones orgánicas y más de 3000 leads captados.
                                        </p>
                                    </div>
                                </div>
                            </article>

                            {/* PORTAFOLIO */}
                            <article className="rounded-2xl border border-border bg-card p-4 shadow-card transition-colors duration-300 sm:p-6 md:p-8">
                                <h2 className="text-base font-semibold tracking-tight sm:text-lg">PORTAFOLIO DE PROYECTOS (EN DESARROLLO)</h2>

                                <div className="mt-4 grid gap-3 sm:mt-6 sm:grid-cols-2 sm:gap-4 lg:gap-5">
                                    {[
                                        {
                                            title: 'REDIFY CRM',
                                            description: 'CRM para gestión de clientes de fibra óptica, factibilizador automático en desarrollo.',
                                            projectUrl: 'https://redify-tau.vercel.app/login',
                                            repoUrl: 'https://github.com/elkisdm/redify',
                                        },
                                        {
                                            title: 'CALCULADORA DE RENTABILIDAD INMOBILIARIA',
                                            description: 'Herramienta para calcular rentabilidad en inversión inmobiliaria y exportar informes.',
                                            projectUrl: 'https://app.selectcapital.cl/',
                                            repoUrl: 'https://github.com/elkisdm/selectcapital/tree/main/investment-engine-v1',
                                        },
                                        {
                                            title: 'ELKIS REALTOR APP',
                                            description: 'Plataforma para listar propiedades, próximamente impulsada con IA.',
                                            projectUrl: 'https://elkisrealtor.cl/',
                                            repoUrl: 'https://github.com/elkisdm/projectrealty',
                                        },
                                        {
                                            title: 'SELECT CAPITAL LANDING PAGE',
                                            description: 'Landing page para asesoría inmobiliaria y calculadora de rentabilidad.',
                                            projectUrl: 'https://selectcapital.cl/',
                                        },
                                    ].map((project) => (
                                        <div
                                            key={project.title}
                                            className="group rounded-xl border border-border bg-surface p-4 transition-all duration-300 hover:bg-soft sm:p-5"
                                        >
                                            <p className="text-xs font-semibold text-text sm:text-sm">{project.title}</p>
                                            <p className="mt-2 text-xs text-text-secondary sm:text-sm">{project.description}</p>
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                <a
                                                    href={project.projectUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2 py-1 text-xs font-medium text-text-secondary transition-colors hover:bg-soft hover:text-text focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                                    aria-label={`Ver proyecto ${project.title}`}
                                                >
                                                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                                                    <span>Ver proyecto</span>
                                                </a>
                                                {project.repoUrl && (
                                                    <a
                                                        href={project.repoUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2 py-1 text-xs font-medium text-text-secondary transition-colors hover:bg-soft hover:text-text focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                                        aria-label={`Ver repositorio en GitHub - ${project.title}`}
                                                    >
                                                        <Github className="h-3 w-3" aria-hidden="true" />
                                                        <span>Ver repo</span>
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </article>

                            {/* CIERRE */}
                            <footer className="rounded-2xl border border-border bg-card p-4 shadow-card transition-colors duration-300 sm:p-6 md:p-8">
                                <p className="text-sm leading-relaxed text-text-secondary sm:text-base">
                                    Veo el negocio como un sistema completo: conecto datos, sistemas y experiencia de usuario para tomar
                                    decisiones que tengan impacto real y propósito.
                                </p>

                                <div className="mt-4 flex flex-wrap gap-2 sm:mt-6">
                                    <a
                                        className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-text px-3 py-1.5 text-xs font-medium text-bg transition-colors hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 sm:gap-2 sm:px-4 sm:py-2 sm:text-sm"
                                        href="mailto:hola@elkisrealtor.cl"
                                        aria-label="Enviar email a hola@elkisrealtor.cl"
                                    >
                                        <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
                                        <span className="hidden sm:inline">hola@elkisrealtor.cl</span>
                                        <span className="sm:hidden">Email</span>
                                    </a>
                                    <a
                                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text transition-colors hover:bg-soft focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 sm:gap-2 sm:px-4 sm:py-2 sm:text-sm"
                                        href="tel:+56993481594"
                                        aria-label="Llamar al +56 9 9348 1594"
                                    >
                                        <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
                                        <span className="hidden sm:inline">+56 9 9348 1594</span>
                                        <span className="sm:hidden">Teléfono</span>
                                    </a>
                                    <a
                                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text transition-colors hover:bg-soft focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 sm:gap-2 sm:px-4 sm:py-2 sm:text-sm"
                                        href="https://www.linkedin.com/in/elkis-daza-2b30311a6/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label="Perfil de LinkedIn"
                                    >
                                        <Linkedin className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
                                        <span>LinkedIn</span>
                                    </a>
                                </div>
                            </footer>
                        </div>

                        {/* RIGHT (sidebar) */}
                        <aside className="lg:col-span-4 space-y-4 sm:space-y-6">
                            {/* FORMACIÓN */}
                            <section className="rounded-2xl border border-border bg-card p-4 shadow-card transition-colors duration-300 sm:p-6 md:p-8">
                                <h2 className="text-base font-semibold tracking-tight sm:text-lg">FORMACIÓN</h2>
                                <div className="mt-3 space-y-3 text-xs text-text-secondary sm:mt-4 sm:space-y-4 sm:text-sm">
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
                            <section className="rounded-2xl border border-border bg-card p-4 shadow-card transition-colors duration-300 sm:p-6 md:p-8">
                                <h2 className="text-base font-semibold tracking-tight sm:text-lg">HERRAMIENTAS DOMINADAS</h2>
                                <div className="mt-3 space-y-3 text-xs text-text-secondary sm:mt-4 sm:space-y-4 sm:text-sm">
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
                            <section className="rounded-2xl border border-border bg-card p-4 shadow-card transition-colors duration-300 sm:p-6 md:p-8">
                                <h2 className="text-base font-semibold tracking-tight sm:text-lg">HABILIDADES CLAVE</h2>
                                <ul className="mt-3 space-y-1.5 text-xs text-text-secondary list-disc pl-4 leading-relaxed sm:mt-4 sm:space-y-2 sm:text-sm sm:pl-5">
                                    <li>Pensamiento estratégico</li>
                                    <li>Resolución de problemas</li>
                                    <li>Comunicación efectiva</li>
                                    <li>Aprendizaje autónomo</li>
                                    <li>Inglés nivel B1</li>
                                </ul>
                            </section>
                        </aside>
                    </section>

                    <p className="mt-6 text-center text-xs text-text-muted sm:mt-8 sm:text-sm">ELKIS DAZA</p>
                </main>
            </div>
        </>
    );
}
