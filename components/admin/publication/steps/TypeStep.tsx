"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const TIPOLOGIAS = ["Studio", "Estudio", "1D1B", "2D1B", "2D2B", "3D2B"] as const;

export function TypeStep({
  tipologia,
  codigoUnidad,
  slug,
  busy,
  onTipologiaChange,
  onCodigoUnidadChange,
  onSlugChange,
  onBack,
  onNext,
}: {
  tipologia: string;
  codigoUnidad: string;
  slug: string;
  busy?: boolean;
  onTipologiaChange: (value: string) => void;
  onCodigoUnidadChange: (value: string) => void;
  onSlugChange: (value: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <Card className="rounded-2xl border-white/10 bg-[var(--soft)]">
      <CardHeader>
        <CardTitle className="text-xl">Paso 2. Tipo y operación</CardTitle>
        <CardDescription className="text-[var(--subtext)]">
          Define tipología y código de unidad. La operación queda fija como arriendo para este MVP.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-1 text-sm text-[var(--text)]">
          <Label>Tipología</Label>
          <Select value={tipologia} onValueChange={onTipologiaChange}>
            <SelectTrigger className="bg-[var(--bg)]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
            {TIPOLOGIAS.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1 text-sm text-[var(--text)]">
          <Label>Operación</Label>
          <Input
            value="Arriendo"
            disabled
            className="cursor-not-allowed bg-[var(--bg)] text-[var(--subtext)]"
          />
        </div>

        <div className="space-y-1 text-sm text-[var(--text)]">
          <Label>Código unidad</Label>
          <Input
            value={codigoUnidad}
            onChange={(event) => onCodigoUnidadChange(event.target.value)}
            className="bg-[var(--bg)]"
            placeholder="305"
          />
        </div>

        <div className="space-y-1 text-sm text-[var(--text)]">
          <Label>Slug</Label>
          <Input
            value={slug}
            onChange={(event) => onSlugChange(event.target.value)}
            className="bg-[var(--bg)]"
            placeholder="condominio-305"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Button
          type="button"
          onClick={onBack}
          variant="outline"
          className="bg-[var(--bg)]"
        >
          Volver
        </Button>
        <Button
          type="button"
          onClick={onNext}
          disabled={Boolean(busy)}
        >
          {busy ? "Guardando..." : "Continuar"}
        </Button>
      </div>
      </CardContent>
    </Card>
  );
}
