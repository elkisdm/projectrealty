'use client';

import { Braces, Check, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface ContractJsonEditorProps {
  jsonText: string;
  onChangeJson: (value: string) => void;
  onSyncFromForm: () => unknown;
  onApplyToForm: () => unknown;
  onFormat: () => unknown;
  jsonError: string | null;
  readOnly?: boolean;
}

export function ContractJsonEditor({
  jsonText,
  onChangeJson,
  onSyncFromForm,
  onApplyToForm,
  onFormat,
  jsonError,
  readOnly = false,
}: ContractJsonEditorProps) {
  return (
    <Card className="border-[var(--admin-border-subtle)] bg-[var(--admin-surface-1)]">
      <CardHeader className="pb-4">
        <CardTitle className="inline-flex items-center gap-2 text-base">
          <Braces className="h-4 w-4" />
          JSON avanzado
        </CardTitle>
        <CardDescription>Utiliza este modo para soporte y casos edge sin perder sincronía con el wizard.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onSyncFromForm}>
            <Download className="mr-2 h-4 w-4" />
            Sincronizar desde formulario
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={onFormat}>
            <Check className="mr-2 h-4 w-4" />
            Formatear
          </Button>
          <Button type="button" size="sm" onClick={onApplyToForm} disabled={readOnly}>
            <Upload className="mr-2 h-4 w-4" />
            Aplicar JSON al formulario
          </Button>
        </div>

        <Textarea
          value={jsonText}
          onChange={(event) => onChangeJson(event.target.value)}
          rows={24}
          spellCheck={false}
          className="font-mono text-xs"
        />

        {jsonError ? (
          <p className="rounded-md border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">{jsonError}</p>
        ) : (
          <p className="text-xs text-[var(--subtext)]">
            Recomendación: valida primero en wizard para detectar errores por sección antes de emitir.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
