"use client";

import { useMemo, useState } from "react";
import type { FilterField } from "@/types/admin-ui";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface FilterDrawerProps {
  fields: FilterField[];
  values: Record<string, string | number | boolean>;
  onChange: (key: string, value: string | number | boolean) => void;
  onClear: () => void;
}

function getActiveChips(values: Record<string, string | number | boolean>) {
  return Object.entries(values).filter(([, value]) => value !== "" && value !== undefined && value !== null && value !== false);
}

export function FilterDrawer({ fields, values, onChange, onClear }: FilterDrawerProps) {
  const [open, setOpen] = useState(false);
  const activeChips = useMemo(() => getActiveChips(values), [values]);

  return (
    <div className="relative">
      <Button
        onClick={() => setOpen((prev) => !prev)}
        variant={activeChips.length > 0 ? "default" : "outline"}
        className={`inline-flex min-h-[40px] items-center gap-2 ${
          activeChips.length > 0
            ? "bg-brand-violet text-white hover:bg-brand-violet/90"
            : "bg-[var(--admin-surface-2)] text-[var(--text)]"
        }`}
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.6a1 1 0 01-.3.7L14 14v5l-4 2v-7L3.3 7.3A1 1 0 013 6.6V4z" />
        </svg>
        Filtros
        {activeChips.length > 0 ? <span className="rounded-full bg-brand-violet px-2 py-0.5 text-xs text-white">{activeChips.length}</span> : null}
      </Button>

      {activeChips.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {activeChips.map(([key, value]) => (
            <Button
              key={key}
              onClick={() => onChange(key, "")}
              variant="outline"
              size="sm"
              className="h-auto rounded-full px-2.5 py-1 text-xs"
            >
              {key}: {String(value)}
              <span aria-hidden>×</span>
            </Button>
          ))}
        </div>
      ) : null}

      {open ? (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="right" className="w-[92vw] max-w-[360px] border-[var(--admin-border-subtle)] bg-[var(--admin-surface-1)] p-4">
            <SheetHeader className="mb-3">
              <SheetTitle className="text-left text-sm">Filtrar resultados</SheetTitle>
            </SheetHeader>
            <div className="space-y-4">
              {fields
                .filter((field) => (field.visibleWhen ? field.visibleWhen(values) : true))
                .map((field) => (
                  <div key={field.key}>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--subtext)]">{field.label}</label>

                    {field.controlType === "select" ? (
                      <Select value={String(values[field.key] || "__all")} onValueChange={(value) => onChange(field.key, value === "__all" ? "" : value)}>
                        <SelectTrigger className="bg-[var(--bg)]">
                          <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="__all">Todos</SelectItem>
                        {(field.options || []).map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                        </SelectContent>
                      </Select>
                    ) : null}

                    {field.controlType === "checkbox" ? (
                      <label className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-[var(--admin-border-subtle)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)]">
                        <Checkbox
                          checked={Boolean(values[field.key])}
                          onCheckedChange={(checked) => onChange(field.key, Boolean(checked))}
                        />
                        {field.label}
                      </label>
                    ) : null}

                    {field.controlType === "range" ? (
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="number"
                          min={field.min}
                          max={field.max}
                          placeholder="Min"
                          value={String(values[`${field.key}_min`] || "")}
                          onChange={(event) => onChange(`${field.key}_min`, event.target.value ? Number(event.target.value) : "")}
                          className="bg-[var(--bg)]"
                        />
                        <Input
                          type="number"
                          min={field.min}
                          max={field.max}
                          placeholder="Max"
                          value={String(values[`${field.key}_max`] || "")}
                          onChange={(event) => onChange(`${field.key}_max`, event.target.value ? Number(event.target.value) : "")}
                          className="bg-[var(--bg)]"
                        />
                      </div>
                    ) : null}
                  </div>
                ))}
            </div>

            <div className="mt-5 flex items-center justify-between gap-2 border-t border-[var(--admin-border-subtle)] pt-4">
              <Button
                onClick={onClear}
                variant="outline"
                className="bg-[var(--admin-surface-2)]"
              >
                Limpiar
              </Button>
              <Button
                onClick={() => setOpen(false)}
              >
                Aplicar
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      ) : null}
    </div>
  );
}
