"use client";

import type { Building } from "@schemas/models";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type BuildingMode = "existing" | "new";

interface NewBuildingForm {
  id: string;
  slug: string;
  name: string;
  comuna: string;
  address: string;
}

export function BuildingStep({
  buildings,
  mode,
  selectedBuildingId,
  newBuilding,
  busy,
  onModeChange,
  onSelectedBuildingChange,
  onNewBuildingChange,
  onContinue,
}: {
  buildings: Building[];
  mode: BuildingMode;
  selectedBuildingId: string;
  newBuilding: NewBuildingForm;
  busy?: boolean;
  onModeChange: (mode: BuildingMode) => void;
  onSelectedBuildingChange: (buildingId: string) => void;
  onNewBuildingChange: (value: NewBuildingForm) => void;
  onContinue: () => void;
}) {
  return (
    <Card className="rounded-2xl border-white/10 bg-[var(--soft)]">
      <CardHeader>
        <CardTitle className="text-xl">Paso 1. Condominio</CardTitle>
        <CardDescription className="text-[var(--subtext)]">
          Selecciona un condominio existente o crea uno nuevo para iniciar el borrador.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
      <RadioGroup value={mode} onValueChange={(value) => onModeChange(value as BuildingMode)} className="grid gap-3 md:grid-cols-2">
        <Label className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-[var(--bg)] px-4 py-3">
          <RadioGroupItem value="existing" />
          Condominio existente
        </Label>
        <Label className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-[var(--bg)] px-4 py-3">
          <RadioGroupItem value="new" />
          Nuevo condominio
        </Label>
      </RadioGroup>

      {mode === "existing" ? (
        <div className="space-y-2">
          <Label htmlFor="wizard-building">Condominio</Label>
          <Select value={selectedBuildingId} onValueChange={onSelectedBuildingChange}>
            <SelectTrigger id="wizard-building" className="bg-[var(--bg)]">
              <SelectValue placeholder="Seleccionar..." />
            </SelectTrigger>
            <SelectContent>
            {buildings.map((building) => (
              <SelectItem key={building.id} value={building.id}>
                {building.name} — {building.comuna}
              </SelectItem>
            ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-1 text-sm text-[var(--text)]">
            <Label>ID</Label>
            <Input
              value={newBuilding.id}
              onChange={(event) =>
                onNewBuildingChange({
                  ...newBuilding,
                  id: event.target.value,
                })
              }
              className="bg-[var(--bg)]"
              placeholder="bld-mi-condominio"
            />
          </div>
          <div className="space-y-1 text-sm text-[var(--text)]">
            <Label>Slug</Label>
            <Input
              value={newBuilding.slug}
              onChange={(event) =>
                onNewBuildingChange({
                  ...newBuilding,
                  slug: event.target.value,
                })
              }
              className="bg-[var(--bg)]"
              placeholder="mi-condominio"
            />
          </div>
          <div className="space-y-1 text-sm text-[var(--text)] md:col-span-2">
            <Label>Nombre</Label>
            <Input
              value={newBuilding.name}
              onChange={(event) =>
                onNewBuildingChange({
                  ...newBuilding,
                  name: event.target.value,
                })
              }
              className="bg-[var(--bg)]"
              placeholder="Condominio Demo"
            />
          </div>
          <div className="space-y-1 text-sm text-[var(--text)]">
            <Label>Comuna</Label>
            <Input
              value={newBuilding.comuna}
              onChange={(event) =>
                onNewBuildingChange({
                  ...newBuilding,
                  comuna: event.target.value,
                })
              }
              className="bg-[var(--bg)]"
              placeholder="Providencia"
            />
          </div>
          <div className="space-y-1 text-sm text-[var(--text)]">
            <Label>Dirección</Label>
            <Input
              value={newBuilding.address}
              onChange={(event) =>
                onNewBuildingChange({
                  ...newBuilding,
                  address: event.target.value,
                })
              }
              className="bg-[var(--bg)]"
              placeholder="Av. Ejemplo 1234"
            />
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button
          type="button"
          onClick={onContinue}
          disabled={Boolean(busy)}
        >
          {busy ? "Guardando..." : "Continuar"}
        </Button>
      </div>
      </CardContent>
    </Card>
  );
}
