"use client";

import type { PublicationStep } from "./types";

const stepLabels: Array<{ key: PublicationStep; label: string }> = [
  { key: "building", label: "Condominio" },
  { key: "type", label: "Tipo" },
  { key: "media", label: "Multimedia" },
  { key: "details", label: "Detalles" },
  { key: "pricing", label: "Precio" },
  { key: "amenities", label: "Amenities" },
  { key: "review", label: "Resumen" },
];

export function PublicationStepper({
  currentStep,
  completedSteps,
}: {
  currentStep: PublicationStep;
  completedSteps: string[];
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[var(--soft)] p-4">
      <ol className="grid grid-cols-2 gap-2 md:grid-cols-7">
        {stepLabels.map((step, index) => {
          const isCurrent = currentStep === step.key;
          const isCompleted = completedSteps.includes(step.key);

          return (
            <li
              key={step.key}
              className={`rounded-xl border px-3 py-2 text-xs md:text-sm ${
                isCurrent
                  ? "border-brand-violet bg-brand-violet/15 text-white"
                  : isCompleted
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                  : "border-white/10 bg-[var(--bg)] text-[var(--subtext)]"
              }`}
            >
              <span className="mr-1.5 font-semibold">{index + 1}.</span>
              {step.label}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
