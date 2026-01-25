import type { Metadata } from "next";
import { getBaseUrl } from "@lib/site";
import { LinkGrid } from "@components/linktree/LinkGrid";
import { BioHeader } from "@components/bio/BioHeader";
import { buildWhatsAppUrl } from "@lib/whatsapp";
import { MI_BIO_CONSTANTS } from "./constants";

const baseUrl = getBaseUrl();

export const metadata: Metadata = {
  title: MI_BIO_CONSTANTS.METADATA.TITLE,
  description: MI_BIO_CONSTANTS.METADATA.DESCRIPTION,
  alternates: { canonical: `${baseUrl}/mi-bio` },
};

export default function MiBioPage() {
  return (
    <main id="main-content" role="main" className="min-h-screen bg-background">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 max-w-sm">
        <nav aria-label="Navegación principal" className="mb-6">
          {/* TODO: Integrar componente de navegación */}
          <div className="flex items-center justify-between">
            <a 
              href="/" 
              className="text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg px-2 py-1"
            >
              Elkis Realtor
            </a>
            {/* TODO: Menú de navegación */}
          </div>
        </nav>
      </header>

      {/* Bio Section */}
      <section aria-labelledby="bio-heading" className="container mx-auto px-4 py-8 max-w-sm">
        <BioHeader />
      </section>

      {/* Destacadas Section */}
      <section aria-labelledby="destacadas-heading" className="container mx-auto px-4 py-8 max-w-sm">
        <h2 id="destacadas-heading" className="text-xl font-semibold mb-6">
          Propiedades Destacadas
        </h2>
        <div className="space-y-4">
          {/* TODO: Integrar componente de lista de propiedades destacadas */}
          <div className="bg-card rounded-2xl p-6 shadow-sm">
            <p className="text-muted-foreground">
              [Placeholder: Lista de propiedades destacadas]
            </p>
          </div>
        </div>
      </section>

      {/* Testimonios Section */}
      <section aria-labelledby="testimonios-heading" className="container mx-auto px-4 py-8 max-w-sm">
        <h2 id="testimonios-heading" className="text-xl font-semibold mb-6">
          Testimonios de Clientes
        </h2>
        <div className="space-y-4">
          {/* TODO: Integrar componente de testimonios */}
          <div className="bg-card rounded-2xl p-6 shadow-sm">
            <p className="text-muted-foreground">
              [Placeholder: Testimonios de clientes satisfechos]
            </p>
          </div>
        </div>
      </section>

      {/* CTAs Linktree Section */}
      <section aria-labelledby="ctas-heading" className="container mx-auto px-4 py-8 max-w-sm">
        <h2 id="ctas-heading" className="text-xl font-semibold mb-6">
          Conecta conmigo
        </h2>
        <div className="space-y-4">
          {(() => {
            const whatsAppLink = buildWhatsAppUrl({ 
                              message: "Hola, me interesa conocer más sobre tus propiedades" 
            });
            
            const linkItems = [
              // WhatsApp (siempre presente)
              {
                label: "WhatsApp",
                href: whatsAppLink || "#",
                aria: "Abrir chat de WhatsApp",
                icon: "whatsapp" as const,
                external: true
              },
              // Teléfono (solo si existe WA_PHONE_E164)
              ...(process.env.WA_PHONE_E164 ? [{
                label: "Llamar ahora",
                href: `tel:${process.env.WA_PHONE_E164}`,
                aria: `Llamar al ${process.env.WA_PHONE_E164}`,
                icon: "phone" as const,
                external: true
              }] : []),
              // Ver catálogo
              {
                label: "Ver catálogo",
                href: "/catalogo",
                aria: "Ver catálogo de propiedades",
                icon: "catalog" as const
              },
              // Agendar
              {
                label: "Agendar visita",
                href: "/agenda",
                aria: "Agendar visita a propiedades",
                icon: "calendar" as const
              }
            ];

            return <LinkGrid items={linkItems} />;
          })()}
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 max-w-sm border-t">
        <p className="text-sm text-muted-foreground text-center">
          Beneficios según disponibilidad
        </p>
      </footer>
    </main>
  );
}
