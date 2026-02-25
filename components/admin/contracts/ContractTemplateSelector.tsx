'use client';

import { Download, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import type { ContractTemplateItem } from '@/types/contracts';

interface ContractTemplateSelectorProps {
  templates: ContractTemplateItem[];
  selectedTemplateId: string;
  selectedTemplate: ContractTemplateItem | null;
  isLoading: boolean;
  error: string | null;
  onSelect: (templateId: string) => void;
  onReload: () => void | Promise<void>;
  onDownloadSource: () => void | Promise<void>;
}

export function ContractTemplateSelector({
  templates,
  selectedTemplateId,
  selectedTemplate,
  isLoading,
  error,
  onSelect,
  onReload,
  onDownloadSource,
}: ContractTemplateSelectorProps) {
  return (
    <Card className="border-[var(--admin-border-subtle)] bg-[var(--admin-surface-1)]">
      <CardHeader className="pb-4">
        <CardTitle className="text-base">Plantilla activa</CardTitle>
        <CardDescription>Selecciona versión oficial y descarga el DOCX fuente cuando necesites revisar.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <Select value={selectedTemplateId} onValueChange={onSelect}>
            <SelectTrigger aria-label="Seleccionar plantilla">
              <SelectValue placeholder={isLoading ? 'Cargando templates...' : 'Selecciona plantilla'} />
            </SelectTrigger>
            <SelectContent>
              {templates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name} · {template.version} {template.isActive ? '(activa)' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            onClick={onReload}
            className="inline-flex items-center gap-2"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Recargar
          </Button>
        </div>

        {error ? <p className="rounded-md border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">{error}</p> : null}

        {selectedTemplate ? (
          <div className="rounded-xl border border-[var(--admin-border-subtle)] bg-[var(--admin-surface-2)] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[var(--text)]">{selectedTemplate.name}</p>
                <p className="text-xs text-[var(--subtext)]">Version {selectedTemplate.version}</p>
              </div>
              <div className="flex items-center gap-2">
                {selectedTemplate.isActive ? <Badge variant="success">Activa</Badge> : <Badge variant="warning">Inactiva</Badge>}
                <Button type="button" variant="secondary" size="sm" onClick={onDownloadSource}>
                  <Download className="mr-2 h-4 w-4" />
                  Descargar fuente
                </Button>
              </div>
            </div>
            {selectedTemplate.description ? (
              <p className="mt-3 text-sm text-[var(--subtext)]">{selectedTemplate.description}</p>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-[var(--subtext)]">No hay plantilla seleccionada.</p>
        )}
      </CardContent>
    </Card>
  );
}
