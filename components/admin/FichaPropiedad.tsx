"use client";

import { useState, useEffect } from "react";
import { UnitSchema, type Unit } from "@schemas/models";
import { z } from "zod";
import type { Building } from "@schemas/models";
import { generateSlug } from "@lib/utils/slug";
import { toast } from "sonner";
import { MediaManager } from "@components/admin/ui";

const TIPOLOGIAS = ["Studio", "Estudio", "1D1B", "2D1B", "2D2B", "3D2B"] as const;
const ORIENTACIONES = ["Norte", "Sur", "Este", "Oeste", "NE", "NO", "SE", "SO"];

export interface FichaPropiedadProps {
  buildingId: string;
  buildings: Building[];
  initialData?: Partial<Unit>;
  onSubmit: (data: Unit) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const defaultValues: Partial<Unit> = {
  id: "",
  slug: "",
  tipologia: "1D1B",
  price: 0,
  disponible: true,
  codigoUnidad: "",
  buildingId: "",
  dormitorios: 1,
  banos: 1,
  garantia: 0,
  gastoComun: undefined,
  m2: undefined,
  piso: undefined,
  vista: undefined,
  images: [],
  videos: [],
  amoblado: false,
  estacionamiento: false,
  bodega: false,
  pet_friendly: false,
  publicationStatus: "draft",
};

export function FichaPropiedad({
  buildingId,
  buildings,
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}: FichaPropiedadProps) {
  const [formData, setFormData] = useState<Partial<Unit>>(
    initialData ? { ...defaultValues, ...initialData, buildingId } : { ...defaultValues, buildingId }
  );
  const [selectedBuildingId, setSelectedBuildingId] = useState(buildingId);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingVideos, setUploadingVideos] = useState(false);

  useEffect(() => {
    setSelectedBuildingId(buildingId);
    setFormData((prev) => ({ ...prev, buildingId }));
  }, [buildingId]);

  useEffect(() => {
    if (initialData) {
      setFormData({ ...defaultValues, ...initialData, buildingId: selectedBuildingId });
    }
  }, [initialData, selectedBuildingId]);

  const validateField = (field: string, value: unknown) => {
    try {
      const shape = UnitSchema.shape as Record<string, z.ZodTypeAny>;
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

  const buildingSlug =
    buildings.find((b) => b.id === selectedBuildingId)?.slug ?? selectedBuildingId;

  const handleChange = (field: keyof Unit, value: unknown) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "codigoUnidad" && typeof value === "string" && value.trim() && buildingSlug) {
        const codigoSlug = generateSlug(value.trim());
        if (!next.slug?.trim()) next.slug = `${buildingSlug}-${codigoSlug}`;
        if (!next.id?.trim()) next.id = `${selectedBuildingId}-${value.trim().replace(/\s+/g, "-")}`;
      }
      return next;
    });
    if (touched[field]) {
      validateField(field, value);
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const value = formData[field as keyof Unit];
    validateField(field, value);
    if (
      field === "codigoUnidad" &&
      typeof value === "string" &&
      value.trim() &&
      buildingSlug
    ) {
      setFormData((prev) => {
        const codigoSlug = generateSlug(value.trim());
        const next = { ...prev };
        if (!prev.slug?.trim()) next.slug = `${buildingSlug}-${codigoSlug}`;
        if (!prev.id?.trim())
          next.id = `${selectedBuildingId}-${value.trim().replace(/\s+/g, "-")}`;
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...formData, buildingId: selectedBuildingId };
    const allKeys = Object.keys(payload) as (keyof Unit)[];
    allKeys.forEach((k) => setTouched((prev) => ({ ...prev, [k]: true })));

    const result = UnitSchema.safeParse(payload);
    if (!result.success) {
      const next: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const path = err.path[0] as string;
        next[path] = err.message;
      });
      setErrors(next);
      return;
    }

    try {
      await onSubmit(result.data);
    } catch {
      // Error manejado por el padre
    }
  };

  const appendUniqueUrls = (current: string[] | undefined, incoming: string[]): string[] => {
    const set = new Set<string>([...(current ?? []), ...incoming]);
    return Array.from(set);
  };

  const uploadFiles = async (files: FileList, mediaType: "image" | "video") => {
    const unitKey = (formData.id || formData.codigoUnidad || "sin-unidad").toString();

    const uploadOne = async (file: File): Promise<string> => {
      const signedResponse = await fetch("/api/admin/media/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buildingId: selectedBuildingId,
          unitId: unitKey,
          scope: "unit",
          mediaType,
          fileName: file.name,
          mimeType: file.type,
          size: file.size,
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
      confirmPayload.append("buildingId", selectedBuildingId);
      confirmPayload.append("unitId", unitKey);
      confirmPayload.append("scope", "unit");
      confirmPayload.append("mediaType", mediaType);
      confirmPayload.append("bucket", signedResult.data.bucket);
      confirmPayload.append("path", signedResult.data.path);
      confirmPayload.append("token", signedResult.data.token);
      confirmPayload.append("mimeType", file.type);
      confirmPayload.append("size", String(file.size));

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

    if (mediaType === "image") setUploadingImages(true);
    if (mediaType === "video") setUploadingVideos(true);

    try {
      const uploadedUrls = await Promise.all(Array.from(files).map((f) => uploadOne(f)));

      if (mediaType === "image") {
        handleChange("images", appendUniqueUrls(formData.images as string[] | undefined, uploadedUrls));
      } else {
        handleChange("videos", appendUniqueUrls(formData.videos as string[] | undefined, uploadedUrls));
      }

      toast.success(
        mediaType === "image"
          ? `${uploadedUrls.length} imagen(es) subida(s)`
          : `${uploadedUrls.length} video(s) subido(s)`
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error subiendo archivos");
    } finally {
      if (mediaType === "image") setUploadingImages(false);
      if (mediaType === "video") setUploadingVideos(false);
    }
  };

  const inputClass = (field: string) =>
    `w-full px-4 py-2 rounded-xl bg-[var(--bg)] text-[var(--text)] border focus:outline-none focus:ring-2 focus:ring-brand-violet focus:ring-offset-2 focus:ring-offset-[var(--bg)] ${errors[field] ? "border-red-500" : "border-white/10"}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Condominio (solo si hay varios para elegir) */}
      {buildings.length > 0 && (
        <fieldset className="space-y-4 rounded-2xl border border-white/10 p-6">
          <legend className="text-lg font-semibold text-[var(--text)] px-2">
            Condominio
          </legend>
          <div>
            <label htmlFor="propiedad-building" className="block text-sm font-medium text-[var(--text)] mb-2">
              Edificio / condominio <span className="text-red-400">*</span>
            </label>
            <select
              id="propiedad-building"
              value={selectedBuildingId}
              onChange={(e) => {
                setSelectedBuildingId(e.target.value);
                handleChange("buildingId", e.target.value);
                setErrors((prev) => ({ ...prev, buildingId: "" }));
              }}
              className={inputClass("buildingId")}
              required
              aria-required="true"
              aria-invalid={!!errors.buildingId}
            >
              <option value="">Seleccionar condominio...</option>
              {buildings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} — {b.comuna}
                </option>
              ))}
            </select>
            {errors.buildingId && (
              <p className="mt-1 text-sm text-red-400" role="alert">{errors.buildingId}</p>
            )}
          </div>
        </fieldset>
      )}

      {/* Identificación de la propiedad */}
      <fieldset className="space-y-4 rounded-2xl border border-white/10 p-6">
        <legend className="text-lg font-semibold text-[var(--text)] px-2">
          Identificación de la propiedad
        </legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="propiedad-id" className="block text-sm font-medium text-[var(--text)] mb-2">
              ID unidad <span className="text-red-400">*</span>
            </label>
            <input
              id="propiedad-id"
              type="text"
              value={formData.id ?? ""}
              onChange={(e) => handleChange("id", e.target.value)}
              onBlur={() => handleBlur("id")}
              className={inputClass("id")}
              placeholder="Ej: unit-101"
              required
              aria-required="true"
              aria-invalid={!!errors.id}
            />
            {errors.id && (
              <p className="mt-1 text-sm text-red-400" role="alert">{errors.id}</p>
            )}
          </div>
          <div>
            <label htmlFor="propiedad-codigo" className="block text-sm font-medium text-[var(--text)] mb-2">
              Código unidad <span className="text-red-400">*</span>
            </label>
            <input
              id="propiedad-codigo"
              type="text"
              value={formData.codigoUnidad ?? ""}
              onChange={(e) => handleChange("codigoUnidad", e.target.value)}
              onBlur={() => handleBlur("codigoUnidad")}
              className={inputClass("codigoUnidad")}
              placeholder="Ej: 101, A-201"
              required
              aria-required="true"
              aria-invalid={!!errors.codigoUnidad}
            />
            {errors.codigoUnidad && (
              <p className="mt-1 text-sm text-red-400" role="alert">{errors.codigoUnidad}</p>
            )}
            <p className="mt-1 text-xs text-[var(--subtext)]">
              Si ID y Slug están vacíos, se generan desde el código de unidad y el condominio.
            </p>
          </div>
          <div>
            <label htmlFor="propiedad-slug" className="block text-sm font-medium text-[var(--text)] mb-2">
              Slug (URL) <span className="text-red-400">*</span>
            </label>
            <input
              id="propiedad-slug"
              type="text"
              value={formData.slug ?? ""}
              onChange={(e) => handleChange("slug", e.target.value)}
              onBlur={() => handleBlur("slug")}
              className={inputClass("slug")}
              placeholder="edificio-depto-101"
              required
              aria-required="true"
              aria-invalid={!!errors.slug}
            />
            {errors.slug && (
              <p className="mt-1 text-sm text-red-400" role="alert">{errors.slug}</p>
            )}
          </div>
          <div>
            <label htmlFor="propiedad-tipologia" className="block text-sm font-medium text-[var(--text)] mb-2">
              Tipología <span className="text-red-400">*</span>
            </label>
            <select
              id="propiedad-tipologia"
              value={formData.tipologia ?? ""}
              onChange={(e) => handleChange("tipologia", e.target.value)}
              onBlur={() => handleBlur("tipologia")}
              className={inputClass("tipologia")}
              required
              aria-required="true"
              aria-invalid={!!errors.tipologia}
            >
              {TIPOLOGIAS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            {errors.tipologia && (
              <p className="mt-1 text-sm text-red-400" role="alert">{errors.tipologia}</p>
            )}
          </div>
          <div>
            <label htmlFor="propiedad-dormitorios" className="block text-sm font-medium text-[var(--text)] mb-2">
              Dormitorios <span className="text-red-400">*</span>
            </label>
            <input
              id="propiedad-dormitorios"
              type="number"
              min={0}
              max={10}
              value={formData.dormitorios ?? ""}
              onChange={(e) => handleChange("dormitorios", parseInt(e.target.value, 10) || 0)}
              onBlur={() => handleBlur("dormitorios")}
              className={inputClass("dormitorios")}
              required
              aria-required="true"
              aria-invalid={!!errors.dormitorios}
            />
            {errors.dormitorios && (
              <p className="mt-1 text-sm text-red-400" role="alert">{errors.dormitorios}</p>
            )}
          </div>
          <div>
            <label htmlFor="propiedad-banos" className="block text-sm font-medium text-[var(--text)] mb-2">
              Baños <span className="text-red-400">*</span>
            </label>
            <input
              id="propiedad-banos"
              type="number"
              min={1}
              max={10}
              value={formData.banos ?? ""}
              onChange={(e) => handleChange("banos", parseInt(e.target.value, 10) || 1)}
              onBlur={() => handleBlur("banos")}
              className={inputClass("banos")}
              required
              aria-required="true"
              aria-invalid={!!errors.banos}
            />
            {errors.banos && (
              <p className="mt-1 text-sm text-red-400" role="alert">{errors.banos}</p>
            )}
          </div>
        </div>
      </fieldset>

      {/* Precios y gastos */}
      <fieldset className="space-y-4 rounded-2xl border border-white/10 p-6">
        <legend className="text-lg font-semibold text-[var(--text)] px-2">
          Precios y gastos
        </legend>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="propiedad-price" className="block text-sm font-medium text-[var(--text)] mb-2">
              Arriendo mensual (CLP) <span className="text-red-400">*</span>
            </label>
            <input
              id="propiedad-price"
              type="number"
              min={1}
              step={1000}
              value={formData.price ?? ""}
              onChange={(e) => handleChange("price", parseInt(e.target.value, 10) || 0)}
              onBlur={() => handleBlur("price")}
              className={inputClass("price")}
              required
              aria-required="true"
              aria-invalid={!!errors.price}
            />
            {errors.price && (
              <p className="mt-1 text-sm text-red-400" role="alert">{errors.price}</p>
            )}
          </div>
          <div>
            <label htmlFor="propiedad-gc" className="block text-sm font-medium text-[var(--text)] mb-2">
              Gastos comunes (CLP)
            </label>
            <input
              id="propiedad-gc"
              type="number"
              min={0}
              step={1000}
              value={formData.gastoComun ?? formData.gastosComunes ?? ""}
              onChange={(e) =>
                handleChange(
                  "gastoComun",
                  e.target.value ? parseInt(e.target.value, 10) : undefined
                )
              }
              className={inputClass("gastoComun")}
            />
          </div>
          <div>
            <label htmlFor="propiedad-garantia" className="block text-sm font-medium text-[var(--text)] mb-2">
              Garantía (CLP) <span className="text-red-400">*</span>
            </label>
            <input
              id="propiedad-garantia"
              type="number"
              min={1}
              step={1000}
              value={formData.garantia ?? ""}
              onChange={(e) => handleChange("garantia", parseInt(e.target.value, 10) || 0)}
              onBlur={() => handleBlur("garantia")}
              className={inputClass("garantia")}
              required
              aria-required="true"
              aria-invalid={!!errors.garantia}
            />
            {errors.garantia && (
              <p className="mt-1 text-sm text-red-400" role="alert">{errors.garantia}</p>
            )}
          </div>
        </div>
      </fieldset>

      {/* Superficie y características */}
      <fieldset className="space-y-4 rounded-2xl border border-white/10 p-6">
        <legend className="text-lg font-semibold text-[var(--text)] px-2">
          Superficie y características
        </legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="propiedad-m2" className="block text-sm font-medium text-[var(--text)] mb-2">
              Superficie (m²)
            </label>
            <input
              id="propiedad-m2"
              type="number"
              min={1}
              step={0.1}
              value={formData.m2 ?? ""}
              onChange={(e) =>
                handleChange("m2", e.target.value ? parseFloat(e.target.value) : undefined)
              }
              className={inputClass("m2")}
              placeholder="Ej: 65"
            />
          </div>
          <div>
            <label htmlFor="propiedad-piso" className="block text-sm font-medium text-[var(--text)] mb-2">
              Piso
            </label>
            <input
              id="propiedad-piso"
              type="number"
              min={0}
              value={formData.piso ?? ""}
              onChange={(e) =>
                handleChange("piso", e.target.value ? parseInt(e.target.value, 10) : undefined)
              }
              className={inputClass("piso")}
              placeholder="Ej: 5"
            />
          </div>
          <div>
            <label htmlFor="propiedad-vista" className="block text-sm font-medium text-[var(--text)] mb-2">
              Vista / orientación
            </label>
            <select
              id="propiedad-vista"
              value={formData.vista ?? formData.orientacion ?? ""}
              onChange={(e) => handleChange("vista", e.target.value || undefined)}
              className={inputClass("vista")}
            >
              <option value="">Seleccionar...</option>
              {ORIENTACIONES.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <MediaManager
            title="Imagenes de la propiedad"
            description="Carga y administra imagenes comerciales de la unidad."
            mediaType="image"
            urls={Array.isArray(formData.images) ? formData.images : []}
            uploading={uploadingImages}
            maxItems={20}
            accept="image/jpeg,image/png,image/webp"
            helperText="Formatos permitidos: JPG, PNG, WEBP. Maximo 10 MB por imagen."
            onUpload={async (files) => {
              if (!selectedBuildingId) {
                toast.error("Selecciona un condominio antes de cargar imagenes.");
                return;
              }
              await uploadFiles(files, "image");
            }}
            onChange={(urls) => handleChange("images", urls)}
          />
          <MediaManager
            title="Videos de la propiedad"
            description="Carga videos para reforzar la presentacion comercial."
            mediaType="video"
            urls={Array.isArray(formData.videos) ? formData.videos : []}
            uploading={uploadingVideos}
            maxItems={3}
            accept="video/mp4,video/webm"
            helperText="Formatos permitidos: MP4, WEBM. Maximo 200 MB por video."
            onUpload={async (files) => {
              if (!selectedBuildingId) {
                toast.error("Selecciona un condominio antes de cargar videos.");
                return;
              }
              await uploadFiles(files, "video");
            }}
            onChange={(urls) => handleChange("videos", urls)}
          />
        </div>
        <div className="flex flex-wrap gap-4 pt-2">
          <div className="w-full md:w-72">
            <label htmlFor="propiedad-publicacion" className="block text-sm font-medium text-[var(--text)] mb-2">
              Estado de publicación
            </label>
            <select
              id="propiedad-publicacion"
              value={String(formData.publicationStatus ?? formData.publication_status ?? "draft")}
              onChange={(e) => {
                const value = e.target.value as "draft" | "published" | "archived";
                handleChange("publicationStatus", value);
                handleChange("publication_status", value);
              }}
              className={inputClass("publicationStatus")}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
            <p className="mt-1 text-xs text-[var(--subtext)]">
              Solo se puede publicar con ficha completa e imágenes cargadas.
            </p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
            <input
              type="checkbox"
              checked={formData.amoblado ?? false}
              onChange={(e) => handleChange("amoblado", e.target.checked)}
              className="rounded border-gray-600 bg-[var(--bg)] text-brand-violet focus:ring-2 focus:ring-brand-violet focus:ring-offset-2"
              aria-checked={formData.amoblado ?? false}
            />
            <span className="text-sm text-[var(--text)]">Amoblado</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
            <input
              type="checkbox"
              checked={formData.estacionamiento ?? false}
              onChange={(e) => handleChange("estacionamiento", e.target.checked)}
              className="rounded border-gray-600 bg-[var(--bg)] text-brand-violet focus:ring-2 focus:ring-brand-violet focus:ring-offset-2"
              aria-checked={formData.estacionamiento ?? false}
            />
            <span className="text-sm text-[var(--text)]">Estacionamiento</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
            <input
              type="checkbox"
              checked={formData.bodega ?? false}
              onChange={(e) => handleChange("bodega", e.target.checked)}
              className="rounded border-gray-600 bg-[var(--bg)] text-brand-violet focus:ring-2 focus:ring-brand-violet focus:ring-offset-2"
              aria-checked={formData.bodega ?? false}
            />
            <span className="text-sm text-[var(--text)]">Bodega</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
            <input
              type="checkbox"
              checked={formData.pet_friendly ?? formData.petFriendly ?? false}
              onChange={(e) => {
                handleChange("pet_friendly", e.target.checked);
                handleChange("petFriendly", e.target.checked);
              }}
              className="rounded border-gray-600 bg-[var(--bg)] text-brand-violet focus:ring-2 focus:ring-brand-violet focus:ring-offset-2"
              aria-checked={formData.pet_friendly ?? formData.petFriendly ?? false}
            />
            <span className="text-sm text-[var(--text)]">Acepta mascotas</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
            <input
              type="checkbox"
              checked={formData.disponible !== false}
              onChange={(e) => handleChange("disponible", e.target.checked)}
              className="rounded border-gray-600 bg-[var(--bg)] text-brand-violet focus:ring-2 focus:ring-brand-violet focus:ring-offset-2"
              aria-checked={formData.disponible !== false}
            />
            <span className="text-sm text-[var(--text)]">Disponible</span>
          </label>
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
          disabled={loading || uploadingImages || uploadingVideos}
          className="px-4 py-2 rounded-xl bg-brand-violet text-white hover:bg-brand-violet/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-brand-violet focus:ring-offset-2 focus:ring-offset-[var(--bg)] min-h-[44px]"
        >
          {loading ? "Guardando..." : uploadingImages || uploadingVideos ? "Subiendo archivos..." : "Guardar propiedad"}
        </button>
      </div>
    </form>
  );
}
