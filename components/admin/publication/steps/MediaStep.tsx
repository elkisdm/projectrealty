"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function MediaStep({
  images,
  videos,
  busy,
  uploading,
  onImagesChange,
  onVideosChange,
  onUploadImages,
  onUploadVideos,
  onBack,
  onNext,
}: {
  images: string[];
  videos: string[];
  busy?: boolean;
  uploading?: boolean;
  onImagesChange: (value: string[]) => void;
  onVideosChange: (value: string[]) => void;
  onUploadImages: (files: FileList) => void;
  onUploadVideos: (files: FileList) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <Card className="rounded-2xl border-white/10 bg-[var(--soft)]">
      <CardHeader>
        <CardTitle className="text-xl">Paso 3. Multimedia</CardTitle>
        <CardDescription className="text-[var(--subtext)]">
          Sube imágenes y videos. Para publicar se exige al menos una imagen.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Label className="space-y-2 text-sm text-[var(--text)]">
          <span className="block">Subir imágenes</span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(event) => {
              if (event.target.files && event.target.files.length > 0) {
                onUploadImages(event.target.files);
                event.target.value = "";
              }
            }}
            className="w-full text-sm text-[var(--subtext)] file:mr-3 file:rounded-lg file:border-0 file:bg-brand-violet file:px-3 file:py-2 file:text-sm file:text-white"
          />
        </Label>
        <Label className="space-y-2 text-sm text-[var(--text)]">
          <span className="block">Subir videos</span>
          <input
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            multiple
            onChange={(event) => {
              if (event.target.files && event.target.files.length > 0) {
                onUploadVideos(event.target.files);
                event.target.value = "";
              }
            }}
            className="w-full text-sm text-[var(--subtext)] file:mr-3 file:rounded-lg file:border-0 file:bg-brand-violet file:px-3 file:py-2 file:text-sm file:text-white"
          />
        </Label>
      </div>

      <div className="space-y-1 text-sm text-[var(--text)]">
        <Label>URLs de imágenes (una por línea)</Label>
        <Textarea
          value={images.join("\n")}
          onChange={(event) =>
            onImagesChange(
              event.target.value
                .split(/\n|,/)
                .map((item) => item.trim())
                .filter(Boolean)
            )
          }
          rows={4}          
          className="bg-[var(--bg)]"
        />
      </div>

      <div className="space-y-1 text-sm text-[var(--text)]">
        <Label>URLs de videos (una por línea)</Label>
        <Textarea
          value={videos.join("\n")}
          onChange={(event) =>
            onVideosChange(
              event.target.value
                .split(/\n|,/)
                .map((item) => item.trim())
                .filter(Boolean)
            )
          }
          rows={3}
          className="bg-[var(--bg)]"
        />
      </div>

      {uploading ? <p className="text-sm text-[var(--subtext)]">Subiendo archivos...</p> : null}

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
          disabled={Boolean(busy || uploading)}
        >
          {busy ? "Guardando..." : "Continuar"}
        </Button>
      </div>
      </CardContent>
    </Card>
  );
}
