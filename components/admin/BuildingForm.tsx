"use client";

import { useState, useEffect } from "react";
import { BuildingSchema, type Building } from "@schemas/models";
import { z } from "zod";

export interface BuildingFormProps {
  initialData?: Building;
  onSubmit: (data: Building) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function BuildingForm({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}: BuildingFormProps) {
  const [formData, setFormData] = useState<Partial<Building>>(
    initialData || {
      id: "",
      slug: "",
      name: "",
      comuna: "",
      address: "",
      amenities: [],
      gallery: [],
      units: [],
    }
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const validateField = (field: string, value: unknown) => {
    try {
      const fieldSchema = BuildingSchema.shape[field as keyof typeof BuildingSchema.shape];
      if (fieldSchema) {
        fieldSchema.parse(value);
      }
      setErrors((prev) => ({ ...prev, [field]: "" }));
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors((prev) => ({
          ...prev,
          [field]: error.errors[0]?.message || "Error de validación",
        }));
      }
    }
  };

  const handleChange = (field: keyof Building, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      validateField(field, value);
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, formData[field as keyof Building]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Marcar todos los campos como tocados
    const allFields = Object.keys(formData);
    allFields.forEach((field) => setTouched((prev) => ({ ...prev, [field]: true })));

    // Validar todo el formulario
    const validation = BuildingSchema.safeParse(formData);
    if (!validation.success) {
      const newErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        const path = err.path[0] as string;
        newErrors[path] = err.message;
      });
      setErrors(newErrors);
      return;
    }

    try {
      await onSubmit(validation.data);
    } catch {
      // El error será manejado por el componente padre
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ID */}
        <div>
          <label className="block text-sm font-medium text-[var(--text)] mb-2">
            ID <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={formData.id || ""}
            onChange={(e) => handleChange("id", e.target.value)}
            onBlur={() => handleBlur("id")}
            className={`w-full px-4 py-2 rounded-lg bg-[var(--bg)] text-[var(--text)] border ${errors.id ? "border-red-500" : "border-white/10"
              } focus:outline-none focus:ring-2 focus:ring-brand-violet focus:ring-offset-2 focus:ring-offset-[var(--bg)]`}
            required
          />
          {errors.id && (
            <p className="mt-1 text-sm text-red-400">{errors.id}</p>
          )}
        </div>

        {/* Slug */}
        <div>
          <label className="block text-sm font-medium text-[var(--text)] mb-2">
            Slug <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={formData.slug || ""}
            onChange={(e) => handleChange("slug", e.target.value)}
            onBlur={() => handleBlur("slug")}
            className={`w-full px-4 py-2 rounded-lg bg-[var(--bg)] text-[var(--text)] border ${errors.slug ? "border-red-500" : "border-white/10"
              } focus:outline-none focus:ring-2 focus:ring-brand-violet focus:ring-offset-2 focus:ring-offset-[var(--bg)]`}
            required
          />
          {errors.slug && (
            <p className="mt-1 text-sm text-red-400">{errors.slug}</p>
          )}
        </div>

        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-[var(--text)] mb-2">
            Nombre <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={formData.name || ""}
            onChange={(e) => handleChange("name", e.target.value)}
            onBlur={() => handleBlur("name")}
            className={`w-full px-4 py-2 rounded-lg bg-[var(--bg)] text-[var(--text)] border ${errors.name ? "border-red-500" : "border-white/10"
              } focus:outline-none focus:ring-2 focus:ring-brand-violet focus:ring-offset-2 focus:ring-offset-[var(--bg)]`}
            required
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-400">{errors.name}</p>
          )}
        </div>

        {/* Comuna */}
        <div>
          <label className="block text-sm font-medium text-[var(--text)] mb-2">
            Comuna <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={formData.comuna || ""}
            onChange={(e) => handleChange("comuna", e.target.value)}
            onBlur={() => handleBlur("comuna")}
            className={`w-full px-4 py-2 rounded-lg bg-[var(--bg)] text-[var(--text)] border ${errors.comuna ? "border-red-500" : "border-white/10"
              } focus:outline-none focus:ring-2 focus:ring-brand-violet focus:ring-offset-2 focus:ring-offset-[var(--bg)]`}
            required
          />
          {errors.comuna && (
            <p className="mt-1 text-sm text-red-400">{errors.comuna}</p>
          )}
        </div>

        {/* Dirección */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-[var(--text)] mb-2">
            Dirección <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={formData.address || ""}
            onChange={(e) => handleChange("address", e.target.value)}
            onBlur={() => handleBlur("address")}
            className={`w-full px-4 py-2 rounded-lg bg-[var(--bg)] text-[var(--text)] border ${errors.address ? "border-red-500" : "border-white/10"
              } focus:outline-none focus:ring-2 focus:ring-brand-violet focus:ring-offset-2 focus:ring-offset-[var(--bg)]`}
            required
          />
          {errors.address && (
            <p className="mt-1 text-sm text-red-400">{errors.address}</p>
          )}
        </div>

        {/* Amenities */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-[var(--text)] mb-2">
            Amenities <span className="text-red-400">*</span> (separados por comas)
          </label>
          <input
            type="text"
            value={Array.isArray(formData.amenities) ? formData.amenities.join(", ") : ""}
            onChange={(e) => {
              const amenities = e.target.value
                .split(",")
                .map((a) => a.trim())
                .filter((a) => a.length > 0);
              handleChange("amenities", amenities);
            }}
            onBlur={() => handleBlur("amenities")}
            className={`w-full px-4 py-2 rounded-lg bg-[var(--bg)] text-[var(--text)] border ${errors.amenities ? "border-red-500" : "border-white/10"
              } focus:outline-none focus:ring-2 focus:ring-brand-violet focus:ring-offset-2 focus:ring-offset-[var(--bg)]`}
            placeholder="Piscina, Gimnasio, Estacionamiento"
            required
          />
          {errors.amenities && (
            <p className="mt-1 text-sm text-red-400">{errors.amenities}</p>
          )}
        </div>

        {/* Gallery */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-[var(--text)] mb-2">
            Galería <span className="text-red-400">*</span> (URLs separadas por comas, mínimo 3)
          </label>
          <textarea
            value={Array.isArray(formData.gallery) ? formData.gallery.join(", ") : ""}
            onChange={(e) => {
              const gallery = e.target.value
                .split(",")
                .map((g) => g.trim())
                .filter((g) => g.length > 0);
              handleChange("gallery", gallery);
            }}
            onBlur={() => handleBlur("gallery")}
            rows={3}
            className={`w-full px-4 py-2 rounded-lg bg-[var(--bg)] text-[var(--text)] border ${errors.gallery ? "border-red-500" : "border-white/10"
              } focus:outline-none focus:ring-2 focus:ring-brand-violet focus:ring-offset-2 focus:ring-offset-[var(--bg)]`}
            placeholder="/images/building-1.jpg, /images/building-2.jpg, /images/building-3.jpg"
            required
          />
          {errors.gallery && (
            <p className="mt-1 text-sm text-red-400">{errors.gallery}</p>
          )}
        </div>

        {/* Cover Image */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-[var(--text)] mb-2">
            Imagen de Portada
          </label>
          <input
            type="text"
            value={formData.coverImage || ""}
            onChange={(e) => handleChange("coverImage", e.target.value)}
            onBlur={() => handleBlur("coverImage")}
            className={`w-full px-4 py-2 rounded-lg bg-[var(--bg)] text-[var(--text)] border ${errors.coverImage ? "border-red-500" : "border-white/10"
              } focus:outline-none focus:ring-2 focus:ring-brand-violet focus:ring-offset-2 focus:ring-offset-[var(--bg)]`}
            placeholder="/images/building-cover.jpg"
          />
          {errors.coverImage && (
            <p className="mt-1 text-sm text-red-400">{errors.coverImage}</p>
          )}
        </div>

        {/* Service Level */}
        <div>
          <label className="block text-sm font-medium text-[var(--text)] mb-2">
            Nivel de Servicio
          </label>
          <select
            value={formData.serviceLevel || ""}
            onChange={(e) => handleChange("serviceLevel", e.target.value || undefined)}
            onBlur={() => handleBlur("serviceLevel")}
            className="w-full px-4 py-2 rounded-lg bg-[var(--bg)] text-[var(--text)] border border-white/10 focus:outline-none focus:ring-2 focus:ring-brand-violet focus:ring-offset-2 focus:ring-offset-[var(--bg)]"
          >
            <option value="">Seleccionar...</option>
            <option value="pro">Pro</option>
            <option value="standard">Standard</option>
          </select>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4 pt-4 border-t border-white/10">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg bg-[var(--soft)] text-[var(--text)] hover:bg-[var(--soft)]/80 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-violet focus:ring-offset-2 focus:ring-offset-[var(--bg)]"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-brand-violet text-white hover:bg-brand-violet/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-brand-violet focus:ring-offset-2 focus:ring-offset-[var(--bg)]"
        >
          {loading ? "Guardando..." : initialData ? "Actualizar" : "Crear"}
        </button>
      </div>
    </form>
  );
}










