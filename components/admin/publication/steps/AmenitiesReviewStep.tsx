"use client";

import type { PublicationDraft } from "../types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AmenitiesReviewStep({
  draft,
  amenities,
  busy,
  onAmenitiesChange,
  onBack,
  onSave,
  onPublish,
  onArchive,
}: {
  draft: PublicationDraft;
  amenities: string[];
  busy?: boolean;
  onAmenitiesChange: (value: string[]) => void;
  onBack: () => void;
  onSave: () => void;
  onPublish: () => void;
  onArchive: () => void;
}) {
  return (
    <Card className="rounded-2xl border-white/10 bg-[var(--soft)]">
      <CardHeader>
        <CardTitle className="text-xl">Paso 6-7. Amenities y resumen</CardTitle>
        <CardDescription className="text-[var(--subtext)]">
          Define amenities y revisa el resumen final antes de publicar.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">

      <div className="space-y-1 text-sm text-[var(--text)]">
        <Label>Amenities (separadas por coma)</Label>
        <Input
          value={amenities.join(", ")}
          onChange={(event) =>
            onAmenitiesChange(
              event.target.value
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean)
            )
          }
          className="bg-[var(--bg)]"
          placeholder="Piscina, Gimnasio, Quincho"
        />
      </div>

      <div className="rounded-xl border border-white/10 bg-[var(--bg)] p-4 text-sm text-[var(--text)]">
        <h4 className="mb-2 font-semibold">Resumen de publicación</h4>
        <ul className="space-y-1 text-[var(--subtext)]">
          <li>ID borrador: {draft.id}</li>
          <li>Condominio: {draft.buildingId}</li>
          <li>Título: {draft.publication_title || "-"}</li>
          <li>Tipología: {draft.tipologia || "-"}</li>
          <li>Precio: {draft.price ? `$${Number(draft.price).toLocaleString("es-CL")}` : "-"}</li>
          <li>Fotos: {Array.isArray(draft.images) ? draft.images.length : 0}</li>
          <li>Estado: {draft.publicationStatus || "draft"}</li>
        </ul>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button
          type="button"
          onClick={onBack}
          variant="outline"
          className="bg-[var(--bg)]"
        >
          Volver
        </Button>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={onSave}
            disabled={Boolean(busy)}
            variant="outline"
            className="bg-[var(--bg)]"
          >
            Guardar borrador
          </Button>
          <Button
            type="button"
            onClick={onArchive}
            disabled={Boolean(busy)}
            variant="outline"
            className="border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
          >
            Archivar (pausar)
          </Button>
          <Button
            type="button"
            onClick={onPublish}
            disabled={Boolean(busy)}
          >
            Publicar
          </Button>
        </div>
      </div>
      </CardContent>
    </Card>
  );
}
