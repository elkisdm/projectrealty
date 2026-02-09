"use client";

import { PublicationWizard } from "@components/admin/publication";
import { PageHeader } from "@components/admin/ui";

export default function ListarPropiedadPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Listar propiedad nueva"
        description="Crea y publica propiedades en flujo guiado con guardado automático por paso."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Listar propiedad" },
        ]}
      />
      <section className="rounded-2xl border border-[var(--admin-border-subtle)] bg-[var(--admin-surface-1)] p-4 md:p-6">
        <PublicationWizard />
      </section>
    </div>
  );
}
