import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description: "Política de privacidad de Elkis Realtor - Cómo protegemos y manejamos tus datos personales",
};

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-bg py-6 sm:py-12 safe-area-bottom">
      <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
        {/* Botón volver */}
        <div className="mb-6">
          <Link href="/tree">
            <Button
              variant="ghost"
              className="text-subtext hover:text-text"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </Link>
        </div>

        {/* Contenido principal */}
        <Card className="rounded-2xl border-border bg-card shadow-sm">
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="text-2xl sm:text-3xl text-text">
              Política de Privacidad
            </CardTitle>
            <p className="text-sm sm:text-base text-subtext mt-2">
              Última actualización: {new Date().toLocaleDateString("es-CL", {
                year: "numeric",
                month: "long",
                day: "numeric"
              })}
            </p>
          </CardHeader>
          <CardContent className="prose prose-sm sm:prose-base dark:prose-invert max-w-none">
            <div className="space-y-6 sm:space-y-8 text-text">
              {/* Introducción */}
              <section>
                <h2 className="text-lg sm:text-xl font-semibold text-text mb-3">
                  1. Introducción
                </h2>
                <p className="text-sm sm:text-base text-subtext leading-relaxed">
                  En Elkis Realtor ("nosotros", "nuestro", "la empresa"), nos comprometemos a proteger tu privacidad y
                  garantizar la seguridad de tus datos personales. Esta Política de Privacidad explica cómo recopilamos,
                  utilizamos, almacenamos y protegemos tu información cuando utilizas nuestros servicios, incluyendo nuestro
                  sitio web y formularios de contacto.
                </p>
              </section>

              {/* Información que recopilamos */}
              <section>
                <h2 className="text-lg sm:text-xl font-semibold text-text mb-3">
                  2. Información que Recopilamos
                </h2>
                <p className="text-sm sm:text-base text-subtext leading-relaxed mb-3">
                  Recopilamos la siguiente información cuando utilizas nuestros servicios:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-subtext ml-4">
                  <li>
                    <strong className="text-text">Información de contacto:</strong> Nombre completo, número de WhatsApp,
                    dirección de correo electrónico (opcional)
                  </li>
                  <li>
                    <strong className="text-text">Información de propiedades:</strong> Comuna de interés, presupuesto,
                    preferencias de vivienda (dormitorios, estacionamiento, bodega, mascotas), fecha de mudanza
                  </li>
                  <li>
                    <strong className="text-text">Información de inversión:</strong> Situación financiera, capacidad de ahorro,
                    renta mensual, preferencias de contacto
                  </li>
                  <li>
                    <strong className="text-text">Información de propiedades a publicar:</strong> Dirección, tipo de propiedad,
                    características, precio aproximado, disponibilidad
                  </li>
                  <li>
                    <strong className="text-text">Datos técnicos:</strong> Dirección IP, tipo de navegador, páginas visitadas,
                    tiempo de permanencia, parámetros UTM (si aplica)
                  </li>
                </ul>
              </section>

              {/* Cómo usamos tu información */}
              <section>
                <h2 className="text-lg sm:text-xl font-semibold text-text mb-3">
                  3. Cómo Utilizamos tu Información
                </h2>
                <p className="text-sm sm:text-base text-subtext leading-relaxed mb-3">
                  Utilizamos tu información personal para los siguientes propósitos:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-subtext ml-4">
                  <li>
                    <strong className="text-text">Prestación de servicios:</strong> Procesar tus solicitudes de arriendo,
                    compra o publicación de propiedades, y contactarte con opciones que se ajusten a tus necesidades
                  </li>
                  <li>
                    <strong className="text-text">Comunicación:</strong> Responder a tus consultas, enviar información sobre
                    propiedades disponibles y mantenerte informado sobre nuestros servicios
                  </li>
                  <li>
                    <strong className="text-text">Mejora de servicios:</strong> Analizar el uso del sitio web para mejorar
                    la experiencia del usuario y optimizar nuestros servicios
                  </li>
                  <li>
                    <strong className="text-text">Cumplimiento legal:</strong> Cumplir con obligaciones legales y regulatorias
                    aplicables
                  </li>
                  <li>
                    <strong className="text-text">Marketing:</strong> Enviar comunicaciones promocionales (solo con tu
                    consentimiento explícito)
                  </li>
                </ul>
              </section>

              {/* Base legal */}
              <section>
                <h2 className="text-lg sm:text-xl font-semibold text-text mb-3">
                  4. Base Legal para el Procesamiento
                </h2>
                <p className="text-sm sm:text-base text-subtext leading-relaxed">
                  Procesamos tu información personal basándonos en:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-subtext ml-4 mt-3">
                  <li>Tu consentimiento explícito al completar nuestros formularios</li>
                  <li>La ejecución de un contrato o medidas precontractuales</li>
                  <li>El cumplimiento de obligaciones legales</li>
                  <li>Nuestro interés legítimo en mejorar nuestros servicios</li>
                </ul>
              </section>

              {/* Compartir información */}
              <section>
                <h2 className="text-lg sm:text-xl font-semibold text-text mb-3">
                  5. Compartir tu Información
                </h2>
                <p className="text-sm sm:text-base text-subtext leading-relaxed">
                  No vendemos ni alquilamos tu información personal a terceros. Podemos compartir tu información únicamente
                  en las siguientes circunstancias:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-subtext ml-4 mt-3">
                  <li>
                    <strong className="text-text">Proveedores de servicios:</strong> Con proveedores que nos ayudan a operar
                    nuestro negocio (hosting, bases de datos, servicios de comunicación), bajo estrictos acuerdos de confidencialidad
                  </li>
                  <li>
                    <strong className="text-text">Requisitos legales:</strong> Cuando sea requerido por ley, orden judicial o
                    autoridades gubernamentales
                  </li>
                  <li>
                    <strong className="text-text">Protección de derechos:</strong> Para proteger nuestros derechos, propiedad
                    o seguridad, o la de nuestros usuarios
                  </li>
                </ul>
              </section>

              {/* Seguridad */}
              <section>
                <h2 className="text-lg sm:text-xl font-semibold text-text mb-3">
                  6. Seguridad de tus Datos
                </h2>
                <p className="text-sm sm:text-base text-subtext leading-relaxed">
                  Implementamos medidas técnicas y organizativas apropiadas para proteger tu información personal contra
                  acceso no autorizado, alteración, divulgación o destrucción. Esto incluye:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-subtext ml-4 mt-3">
                  <li>Encriptación de datos en tránsito y en reposo</li>
                  <li>Acceso restringido a información personal solo para personal autorizado</li>
                  <li>Monitoreo regular de nuestros sistemas de seguridad</li>
                  <li>Almacenamiento seguro en servidores con certificaciones de seguridad</li>
                </ul>
              </section>

              {/* Retención de datos */}
              <section>
                <h2 className="text-lg sm:text-xl font-semibold text-text mb-3">
                  7. Retención de Datos
                </h2>
                <p className="text-sm sm:text-base text-subtext leading-relaxed">
                  Conservamos tu información personal durante el tiempo necesario para cumplir con los propósitos descritos
                  en esta política, a menos que la ley requiera o permita un período de retención más largo. Los datos de
                  formularios se almacenan de forma segura y se eliminan cuando ya no son necesarios para los fines para los
                  que fueron recopilados.
                </p>
              </section>

              {/* Tus derechos */}
              <section>
                <h2 className="text-lg sm:text-xl font-semibold text-text mb-3">
                  8. Tus Derechos
                </h2>
                <p className="text-sm sm:text-base text-subtext leading-relaxed mb-3">
                  Tienes los siguientes derechos respecto a tu información personal:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-subtext ml-4">
                  <li>
                    <strong className="text-text">Acceso:</strong> Solicitar una copia de la información personal que tenemos sobre ti
                  </li>
                  <li>
                    <strong className="text-text">Rectificación:</strong> Corregir información inexacta o incompleta
                  </li>
                  <li>
                    <strong className="text-text">Eliminación:</strong> Solicitar la eliminación de tu información personal
                    cuando ya no sea necesaria
                  </li>
                  <li>
                    <strong className="text-text">Oposición:</strong> Oponerte al procesamiento de tu información personal
                    en ciertas circunstancias
                  </li>
                  <li>
                    <strong className="text-text">Portabilidad:</strong> Recibir tu información personal en un formato
                    estructurado y de uso común
                  </li>
                  <li>
                    <strong className="text-text">Retirar consentimiento:</strong> Retirar tu consentimiento en cualquier momento
                  </li>
                </ul>
                <p className="text-sm sm:text-base text-subtext leading-relaxed mt-4">
                  Para ejercer cualquiera de estos derechos, puedes contactarnos a través de los medios indicados en la
                  sección de contacto.
                </p>
              </section>

              {/* Cookies y tecnologías similares */}
              <section>
                <h2 className="text-lg sm:text-xl font-semibold text-text mb-3">
                  9. Cookies y Tecnologías Similares
                </h2>
                <p className="text-sm sm:text-base text-subtext leading-relaxed">
                  Utilizamos cookies y tecnologías similares para mejorar tu experiencia en nuestro sitio web, analizar el
                  tráfico y personalizar el contenido. Puedes gestionar tus preferencias de cookies a través de la configuración
                  de tu navegador. Algunas funcionalidades del sitio pueden no estar disponibles si desactivas las cookies.
                </p>
              </section>

              {/* Enlaces a terceros */}
              <section>
                <h2 className="text-lg sm:text-xl font-semibold text-text mb-3">
                  10. Enlaces a Sitios de Terceros
                </h2>
                <p className="text-sm sm:text-base text-subtext leading-relaxed">
                  Nuestro sitio web puede contener enlaces a sitios web de terceros. No somos responsables de las prácticas
                  de privacidad o el contenido de estos sitios externos. Te recomendamos revisar las políticas de privacidad
                  de cualquier sitio web que visites.
                </p>
              </section>

              {/* Cambios a esta política */}
              <section>
                <h2 className="text-lg sm:text-xl font-semibold text-text mb-3">
                  11. Cambios a esta Política
                </h2>
                <p className="text-sm sm:text-base text-subtext leading-relaxed">
                  Podemos actualizar esta Política de Privacidad ocasionalmente para reflejar cambios en nuestras prácticas
                  o por otras razones operativas, legales o regulatorias. Te notificaremos sobre cambios significativos
                  publicando la nueva política en esta página y actualizando la fecha de "Última actualización". Te
                  recomendamos revisar esta política periódicamente.
                </p>
              </section>

              {/* Contacto */}
              <section>
                <h2 className="text-lg sm:text-xl font-semibold text-text mb-3">
                  12. Contacto
                </h2>
                <p className="text-sm sm:text-base text-subtext leading-relaxed mb-3">
                  Si tienes preguntas, inquietudes o deseas ejercer tus derechos respecto a esta Política de Privacidad,
                  puedes contactarnos a través de:
                </p>
                <div className="bg-surface dark:bg-surface rounded-xl p-4 sm:p-6 border border-border">
                  <ul className="space-y-2 text-sm sm:text-base text-subtext">
                    <li>
                      <strong className="text-text">WhatsApp:</strong> Disponible en nuestro sitio web
                    </li>
                    <li>
                      <strong className="text-text">Correo electrónico:</strong> A través del formulario de contacto en nuestro sitio
                    </li>
                    <li>
                      <strong className="text-text">Sitio web:</strong>{" "}
                      <Link href="/tree" className="text-brand-violet hover:text-brand-violet/80 underline">
                        elkisrealtor.cl/tree
                      </Link>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Consentimiento */}
              <section className="pt-4 border-t border-border">
                <p className="text-sm sm:text-base text-subtext leading-relaxed">
                  Al utilizar nuestros servicios y completar nuestros formularios, confirmas que has leído, entendido y
                  aceptas esta Política de Privacidad. Si no estás de acuerdo con esta política, por favor no utilices
                  nuestros servicios.
                </p>
              </section>
            </div>
          </CardContent>
        </Card>

        {/* Botón volver al final */}
        <div className="mt-6 text-center">
          <Link href="/tree">
            <Button
              variant="outline"
              className="rounded-xl"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al inicio
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
