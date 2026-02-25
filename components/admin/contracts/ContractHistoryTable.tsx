'use client';

import { Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type {
  ContractHistoryFilters,
  ContractHistoryItem,
  ContractTemplateItem,
} from '@/types/contracts';

interface ContractHistoryTableProps {
  contracts: ContractHistoryItem[];
  templates: ContractTemplateItem[];
  filters: ContractHistoryFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  loading: boolean;
  downloading: boolean;
  error: string | null;
  onFiltersChange: (filters: ContractHistoryFilters) => void;
  onPageChange: (page: number) => void;
  onRefresh: () => void | Promise<void>;
  onDownload: (contractId: string) => void | Promise<void>;
}

function shortHash(value: string): string {
  if (value.length <= 16) return value;
  return `${value.slice(0, 10)}...${value.slice(-6)}`;
}

function templateLabel(templates: ContractTemplateItem[], templateId: string): string {
  return templates.find((template) => template.id === templateId)?.name ?? templateId;
}

function StatusPill({ status }: { status: string }) {
  if (status === 'issued') return <Badge variant="success">Issued</Badge>;
  if (status === 'void') return <Badge variant="warning">Void</Badge>;
  return <Badge variant="neutral">{status}</Badge>;
}

export function ContractHistoryTable({
  contracts,
  templates,
  filters,
  pagination,
  loading,
  downloading,
  error,
  onFiltersChange,
  onPageChange,
  onRefresh,
  onDownload,
}: ContractHistoryTableProps) {
  return (
    <Card className="border-[var(--admin-border-subtle)] bg-[var(--admin-surface-1)]">
      <CardHeader className="pb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base">Historial reciente</CardTitle>
            <CardDescription>Consulta emisiones recientes y descarga contratos emitidos.</CardDescription>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualizar
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-4">
          <div className="space-y-1.5">
            <Label>Template</Label>
            <Select
              value={filters.templateId ?? 'all'}
              onValueChange={(value) =>
                onFiltersChange({ ...filters, templateId: value === 'all' ? undefined : value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name} · {template.version}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Estado</Label>
            <Select
              value={filters.status ?? 'all'}
              onValueChange={(value) =>
                onFiltersChange({
                  ...filters,
                  status: value === 'all' ? undefined : (value as 'issued' | 'void'),
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="issued">Issued</SelectItem>
                <SelectItem value="void">Void</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Desde</Label>
            <Input
              type="date"
              value={filters.dateFrom ?? ''}
              onChange={(event) => onFiltersChange({ ...filters, dateFrom: event.target.value || undefined })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Hasta</Label>
            <Input
              type="date"
              value={filters.dateTo ?? ''}
              onChange={(event) => onFiltersChange({ ...filters, dateTo: event.target.value || undefined })}
            />
          </div>
        </div>

        {error ? <p className="rounded-md border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">{error}</p> : null}

        <div className="rounded-xl border border-[var(--admin-border-subtle)]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Hash</TableHead>
                <TableHead>Creado por</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-sm text-[var(--subtext)]">
                    Cargando historial...
                  </TableCell>
                </TableRow>
              ) : contracts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-sm text-[var(--subtext)]">
                    No hay contratos para los filtros seleccionados.
                  </TableCell>
                </TableRow>
              ) : (
                contracts.map((contract) => (
                  <TableRow key={contract.id}>
                    <TableCell className="whitespace-nowrap text-xs text-[var(--subtext)]">
                      {new Date(contract.createdAt).toLocaleString('es-CL')}
                    </TableCell>
                    <TableCell className="text-sm">{templateLabel(templates, contract.templateId)}</TableCell>
                    <TableCell className="text-xs text-[var(--subtext)]">{contract.templateVersion}</TableCell>
                    <TableCell>
                      <StatusPill status={contract.status} />
                    </TableCell>
                    <TableCell className="font-mono text-xs">{shortHash(contract.hash)}</TableCell>
                    <TableCell className="font-mono text-xs text-[var(--subtext)]">
                      {contract.createdBy.slice(0, 8)}...
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={downloading}
                        onClick={() => onDownload(contract.id)}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Ver/Descargar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-[var(--subtext)]">
          <p>
            Página {pagination.page} de {pagination.totalPages} · {pagination.total} contratos
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1 || loading}
              onClick={() => onPageChange(pagination.page - 1)}
            >
              Anterior
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages || loading}
              onClick={() => onPageChange(pagination.page + 1)}
            >
              Siguiente
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
