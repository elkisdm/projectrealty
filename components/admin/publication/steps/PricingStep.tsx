"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PricingStep({
  price,
  gastoComun,
  garantia,
  busy,
  onPriceChange,
  onGastoComunChange,
  onGarantiaChange,
  onBack,
  onNext,
}: {
  price: number;
  gastoComun?: number;
  garantia: number;
  busy?: boolean;
  onPriceChange: (value: number) => void;
  onGastoComunChange: (value?: number) => void;
  onGarantiaChange: (value: number) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <Card className="rounded-2xl border-white/10 bg-[var(--soft)]">
      <CardHeader>
        <CardTitle className="text-xl">Paso 5. Precio y condiciones</CardTitle>
        <CardDescription className="text-[var(--subtext)]">
          Define arriendo mensual, gastos comunes y garantía para publicar.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="space-y-1 text-sm text-[var(--text)]">
          <Label>Arriendo mensual (CLP)</Label>
          <Input
            type="number"
            min={0}
            value={price}
            onChange={(event) => onPriceChange(Number(event.target.value) || 0)}
            className="bg-[var(--bg)]"
          />
        </div>
        <div className="space-y-1 text-sm text-[var(--text)]">
          <Label>Gastos comunes (CLP)</Label>
          <Input
            type="number"
            min={0}
            value={gastoComun || ""}
            onChange={(event) =>
              onGastoComunChange(event.target.value ? Number(event.target.value) : undefined)
            }
            className="bg-[var(--bg)]"
          />
        </div>
        <div className="space-y-1 text-sm text-[var(--text)]">
          <Label>Garantía (CLP)</Label>
          <Input
            type="number"
            min={0}
            value={garantia}
            onChange={(event) => onGarantiaChange(Number(event.target.value) || 0)}
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
