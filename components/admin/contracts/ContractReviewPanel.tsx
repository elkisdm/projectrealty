'use client';

import { AlertTriangle, CheckCircle2, Clock3, FileCheck2, FileDown, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type {
  ContractDraftResponse,
  ContractIssueResponse,
  ContractValidationResponse,
} from '@/types/contracts';

interface ReviewSection {
  title: string;
  completed: boolean;
  state: 'idle' | 'valid' | 'invalid';
}

interface ContractReviewPanelProps {
  sections: ReviewSection[];
  validation: ContractValidationResponse | null;
  draftResult: ContractDraftResponse | null;
  issueResult: ContractIssueResponse | null;
  apiError: string | null;
  canIssue: boolean;
  isValidating: boolean;
  isGeneratingDraft: boolean;
  isIssuing: boolean;
  onValidate: () => void | Promise<void>;
  onGenerateDraft: () => void | Promise<void>;
  onIssue: () => void | Promise<void>;
}

function SectionStatusBadge({ section }: { section: ReviewSection }) {
  if (section.state === 'invalid') {
    return <Badge variant="destructive">Con errores</Badge>;
  }
  if (section.state === 'valid') {
    return <Badge variant="success">Validada</Badge>;
  }
  if (section.completed) {
    return <Badge variant="info">Completa</Badge>;
  }
  return <Badge variant="neutral">Pendiente</Badge>;
}

function renderErrorDetails(details: unknown): string | null {
  if (!details || typeof details !== 'object') return null;
  if (!('expectedRut' in details)) return null;

  const expectedRut = (details as { expectedRut?: unknown }).expectedRut;
  if (typeof expectedRut !== 'string' || !expectedRut.trim()) return null;
  return `RUT esperado: ${expectedRut}`;
}

export function ContractReviewPanel({
  sections,
  validation,
  draftResult,
  issueResult,
  apiError,
  canIssue,
  isValidating,
  isGeneratingDraft,
  isIssuing,
  onValidate,
  onGenerateDraft,
  onIssue,
}: ContractReviewPanelProps) {
  return (
    <div className="space-y-4">
      <Card className="border-[var(--admin-border-subtle)] bg-[var(--admin-surface-1)]">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Resumen por secciones</CardTitle>
          <CardDescription>Confirma que cada bloque del contrato esté completo antes de validar.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {sections.map((section) => (
            <div
              key={section.title}
              className="flex items-center justify-between rounded-lg border border-[var(--admin-border-subtle)] bg-[var(--admin-surface-2)] px-3 py-2"
            >
              <span className="text-sm text-[var(--text)]">{section.title}</span>
              <SectionStatusBadge section={section} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-[var(--admin-border-subtle)] bg-[var(--admin-surface-1)]">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Validacion final</CardTitle>
          <CardDescription>Ejecuta validaciones duras y luego emite PDF.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              onClick={onValidate}
              disabled={isValidating || !canIssue}
              className="inline-flex items-center gap-2"
            >
              <FileCheck2 className="h-4 w-4" />
              {isValidating ? 'Validando...' : 'Validar contrato'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onGenerateDraft}
              disabled={!canIssue || isGeneratingDraft}
              className="inline-flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              {isGeneratingDraft ? 'Generando borrador...' : 'Generar borrador'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={onIssue}
              disabled={!canIssue || isIssuing || !validation?.valid}
              className="inline-flex items-center gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              {isIssuing ? 'Emitiendo...' : 'Emitir contrato'}
            </Button>
            {!canIssue ? <Badge variant="warning">Solo lectura</Badge> : null}
          </div>

          {apiError ? (
            <div className="rounded-md border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">
              <div className="mb-1 inline-flex items-center gap-2 font-medium">
                <AlertTriangle className="h-4 w-4" />
                Error
              </div>
              <p>{apiError}</p>
            </div>
          ) : null}

          {validation ? (
            <div className="rounded-md border border-[var(--admin-border-subtle)] bg-[var(--admin-surface-2)] p-3 text-sm">
              <div className="mb-2 flex items-center gap-2">
                {validation.valid ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span className="font-medium text-emerald-400">Validación OK</span>
                  </>
                ) : (
                  <>
                    <Clock3 className="h-4 w-4 text-amber-400" />
                    <span className="font-medium text-amber-300">Validación con observaciones</span>
                  </>
                )}
              </div>
              {validation.errors?.length ? (
                <ul className="space-y-1 text-xs text-[var(--subtext)]">
                  {validation.errors.map((error, index) => {
                    const errorDetails = renderErrorDetails(error.details);
                    return (
                      <li key={`${error.code}-${index}`} className="rounded border border-[var(--admin-border-subtle)] bg-[var(--admin-surface-1)] p-2">
                        <p>
                          <span className="font-semibold text-[var(--text)]">{error.code}:</span> {error.message}
                        </p>
                        {error.hint ? <p className="mt-1 text-[11px] text-amber-300">{error.hint}</p> : null}
                        {errorDetails ? (
                          <p className="mt-1 text-[11px] text-[var(--subtext)]">{errorDetails}</p>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-xs text-[var(--subtext)]">No se detectaron errores ni placeholders faltantes.</p>
              )}
            </div>
          ) : null}

          {draftResult ? (
            <div className="rounded-md border border-sky-500/20 bg-sky-500/10 p-3 text-sm">
              <div className="mb-2 inline-flex items-center gap-2 font-medium text-sky-300">
                <FileText className="h-4 w-4" />
                Borrador generado
              </div>
              <ul className="space-y-1 text-xs text-[var(--text)]">
                <li>
                  <span className="font-semibold">Hash:</span> {draftResult.hash}
                </li>
                <li>
                  <span className="font-semibold">Generado:</span>{' '}
                  {new Date(draftResult.generatedAt).toLocaleString('es-CL')}
                </li>
              </ul>
              {draftResult.pdfUrl ? (
                <Button asChild size="sm" className="mt-3" variant="outline">
                  <a href={draftResult.pdfUrl} target="_blank" rel="noreferrer">
                    <FileDown className="mr-2 h-4 w-4" />
                    Descargar borrador PDF
                  </a>
                </Button>
              ) : null}
            </div>
          ) : null}

          {issueResult ? (
            <div className="rounded-md border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm">
              <div className="mb-2 inline-flex items-center gap-2 font-medium text-emerald-300">
                <CheckCircle2 className="h-4 w-4" />
                Contrato emitido
              </div>
              <ul className="space-y-1 text-xs text-[var(--text)]">
                <li>
                  <span className="font-semibold">ID:</span> {issueResult.contractId}
                </li>
                <li>
                  <span className="font-semibold">Hash:</span> {issueResult.hash}
                </li>
                <li>
                  <span className="font-semibold">Reuso idempotente:</span>{' '}
                  {issueResult.idempotentReused ? 'Si' : 'No'}
                </li>
              </ul>
              {issueResult.pdfUrl ? (
                <Button asChild size="sm" className="mt-3">
                  <a href={issueResult.pdfUrl} target="_blank" rel="noreferrer">
                    <FileDown className="mr-2 h-4 w-4" />
                    Descargar PDF
                  </a>
                </Button>
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
