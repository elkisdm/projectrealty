"use client";

import { useState, useEffect } from "react";
import { UnitSchema, type Unit } from "@schemas/models";
import { z } from "zod";
import type { Building } from "@schemas/models";

export interface UnitFormProps {
  initialData?: Unit;
  buildings: Building[];
  onSubmit: (data: Unit, buildingId: string) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const TIPOLOGIAS = ["Studio", "1D1B", "2D1B", "2D2B", "3D2B"];
const ORIENTACIONES = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"];

export function UnitForm({
  initialData,
  buildings,
  onSubmit,
  onCancel,
  loading = false,
}: UnitFormProps) {
  const [formData, setFormData] = useState<Partial<Unit>>(
    initialData || {
      id: "",
      tipologia: "1D1B",
      m2: 50,
      price: 500000,
      estacionamiento: false,
      bodega: false,
      disponible: true,
    }
  );
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const validateField = (field: string, value: unknown) => {
    try {
      const fieldSchema = UnitSchema.shape[field as keyof typeof UnitSchema.shape];
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

  const handleChange = (field: keyof Unit, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      validateField(field, value);
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, formData[field as keyof Unit]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedBuildingId && !initialData) {
      setErrors((prev) => ({
        ...prev,
        buildingId: "Debe seleccionar un edificio",
      }));
      return;
    }

    // Marcar todos los campos como tocados
    const allFields = Object.keys(formData);
    allFields.forEach((field) => setTouched((prev) => ({ ...prev, [field]: true })));

    // Validar todo el formulario
    const validation = UnitSchema.safeParse(formData);
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
      await onSubmit(validation.data, selectedBuildingId || "");
    } catch (error) {
      // El error será manejado por el componente padre
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Building Selector (solo para crear) */}
        {!initialData && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-[var(--text)] mb-2">
              Edificio <span className="text-red-400">*</span>
            </label>
            <select
              value={selectedBuildingId}
              onChange={(e) => {
                setSelectedBuildingId(e.target.value);
                setErrors((prev) => ({ ...prev, buildingId: "" }));
              }}
              className={`w-full px-4 py-2 rounded-lg bg-[var(--bg)] text-[var(--text)] border ${
                errors.buildingId ? "border-red-500" : "border-white/10"
              } focus:outline-none focus:ring-2 focus:ring-brand-violet focus:ring-offset-2 focus:ring-offset-[var(--bg)]`}
              required
            >
              <option value="">Seleccionar edificio...</option>
              {buildings.map((building) => (
                <option key={building.id} value={building.id}>
                  {building.name} - {building.comuna}
                </option>
              ))}
            </select>
            {errors.buildingId && (
              <p className="mt-1 text-sm text-red-400">{errors.buildingId}</p>
            )}
          </div>
        )}

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
            className={`w-full px-4 py-2 rounded-lg bg-[var(--bg)] text-[var(--text)] border ${
              errors.id ? "border-red-500" : "border-white/10"
            } focus:outline-none focus:ring-2 focus:ring-brand-violet focus:ring-offset-2 focus:ring-offset-[var(--bg)]`}
            required
          />
          {errors.id && (
            <p className="mt-1 text-sm text-red-400">{errors.id}</p>
          )}
        </div>

        {/* Tipología */}
        <div>
          <label className="block text-sm font-medium text-[var(--text)] mb-2">
            Tipología <span className="text-red-400">*</span>
          </label>
          <select
            value={formData.tipologia || ""}
            onChange={(e) => handleChange("tipologia", e.target.value)}
            onBlur={() => handleBlur("tipologia")}
            className={`w-full px-4 py-2 rounded-lg bg-[var(--bg)] text-[var(--text)] border ${
              errors.tipologia ? "border-red-500" : "border-white/10"
            } focus:outline-none focus:ring-2 focus:ring-brand-violet focus:ring-offset-2 focus:ring-offset-[var(--bg)]`}
            required
          >
            {TIPOLOGIAS.map((tip) => (
              <option key={tip} value={tip}>
                {tip}
              </option>
            ))}
          </select>
          {errors.tipologia && (
            <p className="mt-1 text-sm text-red-400">{errors.tipologia}</p>
          )}
        </div>

        {/* m² */}
        <div>
          <label className="block text-sm font-medium text-[var(--text)] mb-2">
            Área Total (m²) <span className="text-red-400">*</span>
          </label>
          <input
            type="number"
            min="1"
            step="0.1"
            value={formData.m2 || ""}
            onChange={(e) => handleChange("m2", parseFloat(e.target.value) || 0)}
            onBlur={() => handleBlur("m2")}
            className={`w-full px-4 py-2 rounded-lg bg-[var(--bg)] text-[var(--text)] border ${
              errors.m2 ? "border-red-500" : "border-white/10"
            } focus:outline-none focus:ring-2 focus:ring-brand-violet focus:ring-offset-2 focus:ring-offset-[var(--bg)]`}
            required
          />
          {errors.m2 && (
            <p className="mt-1 text-sm text-red-400">{errors.m2}</p>
          )}
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-[var(--text)] mb-2">
            Precio <span className="text-red-400">*</span>
          </label>
          <input
            type="number"
            min="1"
            step="1000"
            value={formData.price || ""}
            onChange={(e) => handleChange("price", parseInt(e.target.value, 10) || 0)}
            onBlur={() => handleBlur("price")}
            className={`w-full px-4 py-2 rounded-lg bg-[var(--bg)] text-[var(--text)] border ${
              errors.price ? "border-red-500" : "border-white/10"
            } focus:outline-none focus:ring-2 focus:ring-brand-violet focus:ring-offset-2 focus:ring-offset-[var(--bg)]`}
            required
          />
          {errors.price && (
            <p className="mt-1 text-sm text-red-400">{errors.price}</p>
          )}
        </div>

        {/* Gastos Comunes */}
        <div>
          <label className="block text-sm font-medium text-[var(--text)] mb-2">
            Gastos Comunes
          </label>
          <input
            type="number"
            min="0"
            step="1000"
            value={formData.gastosComunes || ""}
            onChange={(e) =>
              handleChange("gastosComunes", e.target.value ? parseInt(e.target.value, 10) : undefined)
            }
            onBlur={() => handleBlur("gastosComunes")}
            className="w-full px-4 py-2 rounded-lg bg-[var(--bg)] text-[var(--text)] border border-white/10 focus:outline-none focus:ring-2 focus:ring-brand-violet focus:ring-offset-2 focus:ring-offset-[var(--bg)]"
          />
        </div>

        {/* Bedrooms */}
        <div>
          <label className="block text-sm font-medium text-[var(--text)] mb-2">
            Dormitorios
          </label>
          <input
            type="number"
            min="0"
            value={formData.bedrooms || ""}
            onChange={(e) =>
              handleChange("bedrooms", e.target.value ? parseInt(e.target.value, 10) : undefined)
            }
            onBlur={() => handleBlur("bedrooms")}
            className="w-full px-4 py-2 rounded-lg bg-[var(--bg)] text-[var(--text)] border border-white/10 focus:outline-none focus:ring-2 focus:ring-brand-violet focus:ring-offset-2 focus:ring-offset-[var(--bg)]"
          />
        </div>

        {/* Bathrooms */}
        <div>
          <label className="block text-sm font-medium text-[var(--text)] mb-2">
            Baños
          </label>
          <input
            type="number"
            min="0"
            value={formData.bathrooms || ""}
            onChange={(e) =>
              handleChange("bathrooms", e.target.value ? parseInt(e.target.value, 10) : undefined)
            }
            onBlur={() => handleBlur("bathrooms")}
            className="w-full px-4 py-2 rounded-lg bg-[var(--bg)] text-[var(--text)] border border-white/10 focus:outline-none focus:ring-2 focus:ring-brand-violet focus:ring-offset-2 focus:ring-offset-[var(--bg)]"
          />
        </div>

        {/* Área Interior */}
        <div>
          <label className="block text-sm font-medium text-[var(--text)] mb-2">
            Área Interior (m²)
          </label>
          <input
            type="number"
            min="0"
            max="200"
            step="0.1"
            value={formData.area_interior_m2 || ""}
            onChange={(e) =>
              handleChange(
                "area_interior_m2",
                e.target.value ? parseFloat(e.target.value) : undefined
              )
            }
            onBlur={() => handleBlur("area_interior_m2")}
            className={`w-full px-4 py-2 rounded-lg bg-[var(--bg)] text-[var(--text)] border ${
              errors.area_interior_m2 ? "border-red-500" : "border-white/10"
            } focus:outline-none focus:ring-2 focus:ring-brand-violet focus:ring-offset-2 focus:ring-offset-[var(--bg)]`}
          />
          {errors.area_interior_m2 && (
            <p className="mt-1 text-sm text-red-400">{errors.area_interior_m2}</p>
          )}
        </div>

        {/* Área Exterior */}
        <div>
          <label className="block text-sm font-medium text-[var(--text)] mb-2">
            Área Exterior (m²)
          </label>
          <input
            type="number"
            min="0"
            max="50"
            step="0.1"
            value={formData.area_exterior_m2 || ""}
            onChange={(e) =>
              handleChange(
                "area_exterior_m2",
                e.target.value ? parseFloat(e.target.value) : undefined
              )
            }
            onBlur={() => handleBlur("area_exterior_m2")}
            className={`w-full px-4 py-2 rounded-lg bg-[var(--bg)] text-[var(--text)] border ${
              errors.area_exterior_m2 ? "border-red-500" : "border-white/10"
            } focus:outline-none focus:ring-2 focus:ring-brand-violet focus:ring-offset-2 focus:ring-offset-[var(--bg)]`}
          />
          {errors.area_exterior_m2 && (
            <p className="mt-1 text-sm text-red-400">{errors.area_exterior_m2}</p>
          )}
        </div>

        {/* Orientación */}
        <div>
          <label className="block text-sm font-medium text-[var(--text)] mb-2">
            Orientación
          </label>
          <select
            value={formData.orientacion || ""}
            onChange={(e) => handleChange("orientacion", e.target.value || undefined)}
            className="w-full px-4 py-2 rounded-lg bg-[var(--bg)] text-[var(--text)] border border-white/10 focus:outline-none focus:ring-2 focus:ring-brand-violet focus:ring-offset-2 focus:ring-offset-[var(--bg)]"
          >
            <option value="">Seleccionar...</option>
            {ORIENTACIONES.map((ori) => (
              <option key={ori} value={ori}>
                {ori}
              </option>
            ))}
          </select>
        </div>

        {/* Checkboxes */}
        <div className="md:col-span-2 space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.estacionamiento || false}
              onChange={(e) => handleChange("estacionamiento", e.target.checked)}
              className="rounded border-gray-600 bg-[var(--bg)] text-brand-violet focus:ring-2 focus:ring-brand-violet focus:ring-offset-2"
            />
            <span className="text-sm text-[var(--text)]">Estacionamiento</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.bodega || false}
              onChange={(e) => handleChange("bodega", e.target.checked)}
              className="rounded border-gray-600 bg-[var(--bg)] text-brand-violet focus:ring-2 focus:ring-brand-violet focus:ring-offset-2"
            />
            <span className="text-sm text-[var(--text)]">Bodega</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.disponible !== false}
              onChange={(e) => handleChange("disponible", e.target.checked)}
              className="rounded border-gray-600 bg-[var(--bg)] text-brand-violet focus:ring-2 focus:ring-brand-violet focus:ring-offset-2"
            />
            <span className="text-sm text-[var(--text)]">Disponible</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.amoblado || false}
              onChange={(e) => handleChange("amoblado", e.target.checked)}
              className="rounded border-gray-600 bg-[var(--bg)] text-brand-violet focus:ring-2 focus:ring-brand-violet focus:ring-offset-2"
            />
            <span className="text-sm text-[var(--text)]">Amoblado</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.petFriendly || false}
              onChange={(e) => handleChange("petFriendly", e.target.checked)}
              className="rounded border-gray-600 bg-[var(--bg)] text-brand-violet focus:ring-2 focus:ring-brand-violet focus:ring-offset-2"
            />
            <span className="text-sm text-[var(--text)]">Pet Friendly</span>
          </label>
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

