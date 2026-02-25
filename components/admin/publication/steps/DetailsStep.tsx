"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function DetailsStep({
  title,
  description,
  dormitorios,
  banos,
  m2,
  busy,
  onTitleChange,
  onDescriptionChange,
  onDormitoriosChange,
  onBanosChange,
  onM2Change,
  onBack,
  onNext,
}: {
  title: string;
  description: string;
  dormitorios: number;
  banos: number;
  m2?: number;
  busy?: boolean;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onDormitoriosChange: (value: number) => void;
  onBanosChange: (value: number) => void;
  onM2Change: (value?: number) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <Card className="rounded-2xl border-white/10 bg-[var(--soft)]">
      <CardHeader>
        <CardTitle className="text-xl">Paso 4. Detalles</CardTitle>
        <CardDescription className="text-[var(--subtext)]">
          Agrega título comercial, descripción y atributos principales de la unidad.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">

      <div className="space-y-1 text-sm text-[var(--text)]">
        <Label>Título de publicación</Label>
        <Input
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          className="bg-[var(--bg)]"
          placeholder="Departamento 2D2B en Providencia"
        />
      </div>

      <div className="space-y-1 text-sm text-[var(--text)]">
        <Label>Descripción</Label>
        <Textarea
          value={description}
          onChange={(event) => onDescriptionChange(event.target.value)}
          rows={5}
          className="bg-[var(--bg)]"
          placeholder="Describe características destacadas, entorno y condiciones."
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="space-y-1 text-sm text-[var(--text)]">
          <Label>Dormitorios</Label>
          <Input
            type="number"
            min={0}
            value={dormitorios}
            onChange={(event) => onDormitoriosChange(Number(event.target.value) || 0)}
            className="bg-[var(--bg)]"
          />
        </div>
        <div className="space-y-1 text-sm text-[var(--text)]">
          <Label>Baños</Label>
          <Input
            type="number"
            min={1}
            value={banos}
            onChange={(event) => onBanosChange(Number(event.target.value) || 1)}
            className="bg-[var(--bg)]"
          />
        </div>
        <div className="space-y-1 text-sm text-[var(--text)]">
          <Label>Superficie (m²)</Label>
          <Input
            type="number"
            min={0}
            value={m2 || ""}
            onChange={(event) => onM2Change(event.target.value ? Number(event.target.value) : undefined)}
            className="bg-[var(--bg)]"
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
