'use client';

import { CheckCircle2, Circle, CircleAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepItem {
  title: string;
  description: string;
}

type StepState = 'idle' | 'valid' | 'invalid';

interface ContractWizardStepperProps {
  steps: readonly StepItem[];
  currentStep: number;
  stepState: StepState[];
  sectionCompletion: boolean[];
  onStepClick: (stepIndex: number) => void;
  readOnly?: boolean;
}

function StepIcon({ state, active, completed }: { state: StepState; active: boolean; completed: boolean }) {
  if (state === 'invalid') {
    return <CircleAlert className="h-4 w-4 text-rose-500" aria-hidden />;
  }
  if (state === 'valid' || completed) {
    return <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden />;
  }
  if (active) {
    return <Circle className="h-4 w-4 text-sky-500" aria-hidden />;
  }
  return <Circle className="h-4 w-4 text-slate-400" aria-hidden />;
}

export function ContractWizardStepper({
  steps,
  currentStep,
  stepState,
  sectionCompletion,
  onStepClick,
  readOnly = false,
}: ContractWizardStepperProps) {
  return (
    <ol className="grid grid-cols-1 gap-2 md:grid-cols-3 xl:grid-cols-6" aria-label="Pasos configurador">
      {steps.map((step, index) => {
        const active = currentStep === index;
        const completed = sectionCompletion[index] ?? false;
        const state = stepState[index] ?? 'idle';
        const canGo = readOnly || index <= currentStep;

        return (
          <li key={step.title}>
            <button
              type="button"
              onClick={() => onStepClick(index)}
              disabled={!canGo}
              className={cn(
                'group flex w-full items-start gap-3 rounded-xl border p-3 text-left transition',
                active
                  ? 'border-sky-500/60 bg-sky-500/10'
                  : 'border-[var(--admin-border-subtle)] bg-[var(--admin-surface-1)] hover:border-sky-500/40',
                !canGo && 'cursor-not-allowed opacity-60'
              )}
            >
              <span className="mt-0.5">
                <StepIcon state={state} active={active} completed={completed} />
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-semibold uppercase tracking-wide text-[var(--subtext)]">
                  Paso {index + 1}
                </span>
                <span className="block truncate text-sm font-semibold text-[var(--text)]">{step.title}</span>
                <span className="line-clamp-2 text-xs text-[var(--subtext)]">{step.description}</span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
