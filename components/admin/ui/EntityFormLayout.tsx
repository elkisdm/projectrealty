"use client";

import type { ReactNode } from "react";
import type { FormSection } from "@/types/admin-ui";

interface EntityFormLayoutProps {
  title: string;
  description?: string;
  sections: FormSection[];
  completionBySection?: Record<string, number>;
  children: ReactNode;
  aside?: ReactNode;
}

export function EntityFormLayout({
  title,
  description,
  sections,
  completionBySection = {},
  children,
  aside,
}: EntityFormLayoutProps) {
  const avgCompletion =
    sections.length === 0
      ? 0
      : Math.round(
          sections.reduce((acc, section) => acc + (completionBySection[section.id] || 0), 0) / sections.length
        );

  return (
    <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr,280px]">
      <div className="rounded-2xl border border-[var(--admin-border-subtle)] bg-[var(--admin-surface-1)] p-5">
        <header className="mb-6">
          <h2 className="text-xl font-semibold text-[var(--text)]">{title}</h2>
          {description ? <p className="mt-1 text-sm text-[var(--subtext)]">{description}</p> : null}
        </header>
        {children}
      </div>

      <aside className="space-y-4">
        <div className="rounded-2xl border border-[var(--admin-border-subtle)] bg-[var(--admin-surface-1)] p-4">
          <p className="text-xs uppercase tracking-wide text-[var(--subtext)]">Completitud</p>
          <p className="mt-1 text-2xl font-bold text-[var(--text)]">{avgCompletion}%</p>
          <div className="mt-3 h-2 rounded-full bg-[var(--admin-surface-2)]">
            <div className="h-2 rounded-full bg-brand-violet transition-all" style={{ width: `${avgCompletion}%` }} />
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--admin-border-subtle)] bg-[var(--admin-surface-1)] p-4">
          <h3 className="text-sm font-semibold text-[var(--text)]">Secciones</h3>
          <ul className="mt-3 space-y-2">
            {sections.map((section) => {
              const completion = completionBySection[section.id] || 0;
              return (
                <li key={section.id} className="rounded-lg border border-[var(--admin-border-subtle)] bg-[var(--admin-surface-2)] px-3 py-2">
                  <p className="text-sm font-medium text-[var(--text)]">{section.title}</p>
                  {section.description ? <p className="text-xs text-[var(--subtext)]">{section.description}</p> : null}
                  <p className="mt-1 text-xs text-[var(--subtext)]">{completion}%</p>
                </li>
              );
            })}
          </ul>
        </div>
        {aside}
      </aside>
    </section>
  );
}

