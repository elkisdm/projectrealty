"use client";

import { useState, useEffect } from "react";
import { BuildingSchema, type Building } from "@schemas/models";
import { z } from "zod";
import { generateSlug } from "@lib/utils/slug";
import { toast } from "sonner";
import { MediaManager } from "@components/admin/ui";

export interface FichaCondominioProps {
  initialData?: Partial<Building>;
  onSubmit: (data: Omit<Building, "units">) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const defaultValues: Partial<Omit<Building, "units">> = {
  id: "",
  slug: "",
  name: "",
  comuna: "",
  address: "",
  amenities: ["Áreas comunes"],
  gallery: [],
  coverImage: "",
  region: "",
  descripcion: "",
};

export function FichaCondominio({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}: FichaCondominioProps) {
  const [formData, setFormData] = useState<Partial<Omit<Building, "units">>>(
    initialData || defaultValues
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({ ...defaultValues, ...initialData });
    }
  }, [initialData]);

  const validateField = (field: string, value: unknown) => {
    try {
      const shape = BuildingSchema.shape as Record<string, z.ZodTypeAny>;
      if (shape[field]) {
        shape[field].parse(value);
      }
      setErrors((prev) => ({ ...prev, [field]: "" }));
    } catch (err) {
      if (err instanceof z.ZodError) {
        setErrors((prev) => ({
          ...prev,
          [field]: err.errors[0]?.message ?? "Error de validación",
        }));
      }
    }
  };

  const handleChange = (field: keyof Omit<Building, "units">, value: unknown) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "name" && typeof value === "string" && value.trim()) {
        const slugFromName = generateSlug(value.trim());
        if (!next.slug?.trim()) next.slug = slugFromName;
        if (!next.id?.trim()) next.id = `bld-${slugFromName}`;
      }
      return next;
    });
    if (touched[field]) {
      validateField(field, value);
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const value = formData[field as keyof Omit<Building, "units">];
    validateField(field, value);
    if (field === "name" && typeof value === "string" && value.trim()) {
      setFormData((prev) => {
        const slugFromName = generateSlug(value.trim());
        const next = { ...prev };
        if (!prev.slug?.trim()) next.slug = slugFromName;
        if (!prev.id?.trim()) next.id = `bld-${slugFromName}`;
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const allKeys = Object.keys(formData) as (keyof Omit<Building, "units">)[];
    allKeys.forEach((k) => setTouched((prev) => ({ ...prev, [k]: true })));

    const toValidate = {
      ...formData,
      units: [{ id: "_placeholder", slug: "_", tipologia: "1D1B", price: 1, disponible: true, codigoUnidad: "_", buildingId: formData.id ?? "", dormitorios: 0, banos: 1, garantia: 1 }],
    };
    const result = BuildingSchema.safeParse(toValidate);
    if (!result.success) {
      const next: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const path = err.path[0] as string;
        if (path !== "units") next[path] = err.message;
      });
      setErrors(next);
      return;
    }

    const { units, ...buildingData } = result.data;
    void units;
    try {
      await onSubmit(buildingData);
    } catch {
      // Error manejado por el padre
    }
  };

  const appendUniqueUrls = (current: string[] | undefined, incoming: string[]): string[] => {
    const set = new Set<string>([...(current ?? []), ...incoming]);
    return Array.from(set);
  };

  const uploadBuildingImages = async (files: FileList, mode: "gallery" | "cover") => {
    const currentBuildingId = (formData.id || `bld-${generateSlug(formData.name || "edificio")}`).toString();

    const uploadOne = async (file: File): Promise<string> => {
      const signedResponse = await fetch("/api/admin/media/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buildingId: currentBuildingId,
          scope: "building",
          mediaType: "image",
          fileName: file.name,
          mimeType: file.type,
          size: file.size,
          isCover: mode === "cover",
        }),
      });

      const signedResult = (await signedResponse.json()) as {
        success?: boolean;
        data?: {
          bucket?: string;
          path?: string;
          token?: string;
        };
        error?: { message?: string } | string;
      };

      if (
        !signedResponse.ok ||
        !signedResult.success ||
        !signedResult.data?.bucket ||
        !signedResult.data?.path ||
        !signedResult.data?.token
      ) {
        const errorMessage =
          typeof signedResult.error === "string"
            ? signedResult.error
            : signedResult.error?.message;
        throw new Error(errorMessage || "Error generando URL de carga");
      }

      const confirmPayload = new FormData();
      confirmPayload.append("file", file);
      confirmPayload.append("buildingId", currentBuildingId);
      confirmPayload.append("scope", "building");
      confirmPayload.append("mediaType", "image");
      confirmPayload.append("bucket", signedResult.data.bucket);
      confirmPayload.append("path", signedResult.data.path);
      confirmPayload.append("token", signedResult.data.token);
      confirmPayload.append("mimeType", file.type);
      confirmPayload.append("size", String(file.size));
      confirmPayload.append("isCover", String(mode === "cover"));

      const confirmResponse = await fetch("/api/admin/media/confirm", {
        method: "POST",
        body: confirmPayload,
      });

      const confirmResult = (await confirmResponse.json()) as {
        success?: boolean;
        data?: { public_url?: string; url?: string };
        error?: { message?: string } | string;
      };

      const finalUrl = confirmResult.data?.public_url || confirmResult.data?.url;

      if (!confirmResponse.ok || !confirmResult.success || !finalUrl) {
        const errorMessage =
          typeof confirmResult.error === "string"
            ? confirmResult.error
            : confirmResult.error?.message;
        throw new Error(errorMessage || "Error confirmando carga");
      }

      return finalUrl;
    };

    if (mode === "gallery") setUploadingGallery(true);
    if (mode === "cover") setUploadingCover(true);

    try {
      const uploadedUrls = await Promise.all(Array.from(files).map((f) => uploadOne(f)));

      if (mode === "gallery") {
        handleChange("gallery", appendUniqueUrls(formData.gallery as string[] | undefined, uploadedUrls));
        toast.success(`${uploadedUrls.length} imagen(es) agregada(s) a la galería`);
      } else {
        handleChange("coverImage", uploadedUrls[0] ?? "");
        toast.success("Imagen de portada subida");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error subiendo imágenes");
    } finally {
      if (mode === "gallery") setUploadingGallery(false);
      if (mode === "cover") setUploadingCover(false);
    }
  };

  const inputClass = (field: string) =>
    `w-full px-4 py-2 rounded-xl bg-[var(--bg)] text-[var(--text)] border focus:outline-none focus:ring-2 focus:ring-brand-violet focus:ring-offset-2 focus:ring-offset-[var(--bg)] ${errors[field] ? "border-red-500" : "border-white/10"}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Identificación */}
      <fieldset className="space-y-4 rounded-2xl border border-white/10 p-6">
        <legend className="text-lg font-semibold text-[var(--text)] px-2">
          Identificación del condominio
        </legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="condominio-id" className="block text-sm font-medium text-[var(--text)] mb-2">
              ID <span className="text-red-400">*</span>
            </label>
            <input
              id="condominio-id"
              type="text"
              value={formData.id ?? ""}
              onChange={(e) => handleChange("id", e.target.value)}
              onBlur={() => handleBlur("id")}
              className={inputClass("id")}
              placeholder="Ej: bld-001"
              required
              aria-required="true"
              aria-invalid={!!errors.id}
              aria-describedby={errors.id ? "condominio-id-error" : undefined}
            />
            {errors.id && (
              <p id="condominio-id-error" className="mt-1 text-sm text-red-400" role="alert">
                {errors.id}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="condominio-slug" className="block text-sm font-medium text-[var(--text)] mb-2">
              Slug (URL) <span className="text-red-400">*</span>
            </label>
            <input
              id="condominio-slug"
              type="text"
              value={formData.slug ?? ""}
              onChange={(e) => handleChange("slug", e.target.value)}
              onBlur={() => handleBlur("slug")}
              className={inputClass("slug")}
              placeholder="nombre-edificio-sin-acentos"
              required
              aria-required="true"
              aria-invalid={!!errors.slug}
            />
            {errors.slug && (
              <p className="mt-1 text-sm text-red-400" role="alert">{errors.slug}</p>
            )}
          </div>
          <div className="md:col-span-2">
            <label htmlFor="condominio-name" className="block text-sm font-medium text-[var(--text)] mb-2">
              Nombre del edificio / condominio <span className="text-red-400">*</span>
            </label>
            <input
              id="condominio-name"
              type="text"
              value={formData.name ?? ""}
              onChange={(e) => handleChange("name", e.target.value)}
              onBlur={() => handleBlur("name")}
              className={inputClass("name")}
              required
              aria-required="true"
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-400" role="alert">{errors.name}</p>
            )}
            <p className="mt-1 text-xs text-[var(--subtext)]">
              Si ID y Slug están vacíos, se generan automáticamente desde el nombre.
            </p>
          </div>
        </div>
      </fieldset>

      {/* Ubicación */}
      <fieldset className="space-y-4 rounded-2xl border border-white/10 p-6">
        <legend className="text-lg font-semibold text-[var(--text)] px-2">
          Ubicación
        </legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="condominio-comuna" className="block text-sm font-medium text-[var(--text)] mb-2">
              Comuna <span className="text-red-400">*</span>
            </label>
            <input
              id="condominio-comuna"
              type="text"
              value={formData.comuna ?? ""}
              onChange={(e) => handleChange("comuna", e.target.value)}
              onBlur={() => handleBlur("comuna")}
              className={inputClass("comuna")}
              placeholder="Ej: Providencia"
              required
              aria-required="true"
              aria-invalid={!!errors.comuna}
            />
            {errors.comuna && (
              <p className="mt-1 text-sm text-red-400" role="alert">{errors.comuna}</p>
            )}
          </div>
          <div>
            <label htmlFor="condominio-region" className="block text-sm font-medium text-[var(--text)] mb-2">
              Región
            </label>
            <input
              id="condominio-region"
              type="text"
              value={formData.region ?? ""}
              onChange={(e) => handleChange("region", e.target.value)}
              className={inputClass("region")}
              placeholder="Ej: Región Metropolitana"
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="condominio-address" className="block text-sm font-medium text-[var(--text)] mb-2">
              Dirección completa <span className="text-red-400">*</span>
            </label>
            <input
              id="condominio-address"
              type="text"
              value={formData.address ?? ""}
              onChange={(e) => handleChange("address", e.target.value)}
              onBlur={() => handleBlur("address")}
              className={inputClass("address")}
              required
              aria-required="true"
              aria-invalid={!!errors.address}
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-400" role="alert">{errors.address}</p>
            )}
          </div>
        </div>
      </fieldset>

      {/* Amenidades y galería */}
      <fieldset className="space-y-4 rounded-2xl border border-white/10 p-6">
        <legend className="text-lg font-semibold text-[var(--text)] px-2">
          Amenidades y galería
        </legend>
        <div>
          <label htmlFor="condominio-amenities" className="block text-sm font-medium text-[var(--text)] mb-2">
            Amenidades <span className="text-red-400">*</span> (separadas por comas)
          </label>
          <input
            id="condominio-amenities"
            type="text"
            value={Array.isArray(formData.amenities) ? formData.amenities.join(", ") : ""}
            onChange={(e) => {
              const v = e.target.value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);
              handleChange("amenities", v.length ? v : ["Áreas comunes"]);
            }}
            onBlur={() => handleBlur("amenities")}
            className={inputClass("amenities")}
            placeholder="Piscina, Gimnasio, Quincho"
            required
            aria-required="true"
          />
          {errors.amenities && (
            <p className="mt-1 text-sm text-red-400" role="alert">{errors.amenities}</p>
          )}
        </div>
        <div className="space-y-4">
          <MediaManager
            title="Galería del condominio"
            description="Sube imágenes del edificio. Puedes marcar cualquiera como portada."
            mediaType="image"
            urls={Array.isArray(formData.gallery) ? formData.gallery : []}
            uploading={uploadingGallery}
            maxItems={20}
            accept="image/jpeg,image/png,image/webp"
            helperText="Hasta 20 imágenes, máximo 10MB por archivo."
            onUpload={(files) => uploadBuildingImages(files, "gallery")}
            onChange={(urls) => handleChange("gallery", urls)}
            onSetCover={(url) => handleChange("coverImage", url)}
          />
          {errors.gallery && (
            <p className="text-sm text-red-400" role="alert">{errors.gallery}</p>
          )}

          <MediaManager
            title="Imagen de portada"
            description="Esta imagen se usa como portada principal del condominio."
            mediaType="image"
            urls={formData.coverImage ? [formData.coverImage] : []}
            uploading={uploadingCover}
            maxItems={1}
            accept="image/jpeg,image/png,image/webp"
            helperText="Sube una única imagen principal."
            onUpload={(files) => uploadBuildingImages(files, "cover")}
            onChange={(urls) => handleChange("coverImage", urls[0] || "")}
          />
        </div>
        <div>
          <label htmlFor="condominio-descripcion" className="block text-sm font-medium text-[var(--text)] mb-2">
            Descripción (opcional)
          </label>
          <textarea
            id="condominio-descripcion"
            value={formData.descripcion ?? ""}
            onChange={(e) => handleChange("descripcion", e.target.value)}
            rows={2}
            className={inputClass("descripcion")}
            placeholder="Breve descripción del edificio"
          />
        </div>
      </fieldset>

      <div className="flex items-center justify-end gap-4 pt-4 border-t border-white/10">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-xl bg-[var(--soft)] text-[var(--text)] hover:bg-[var(--soft)]/80 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-violet focus:ring-offset-2 focus:ring-offset-[var(--bg)] min-h-[44px]"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading || uploadingGallery || uploadingCover}
          className="px-4 py-2 rounded-xl bg-brand-violet text-white hover:bg-brand-violet/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-brand-violet focus:ring-offset-2 focus:ring-offset-[var(--bg)] min-h-[44px]"
        >
          {loading
            ? "Guardando..."
            : uploadingGallery || uploadingCover
              ? "Subiendo archivos..."
              : "Guardar condominio"}
        </button>
      </div>
    </form>
  );
}
