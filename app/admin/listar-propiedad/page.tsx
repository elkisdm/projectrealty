"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import type { Building, Unit } from "@schemas/models";
import { FichaCondominio } from "@components/admin/FichaCondominio";
import { FichaPropiedad } from "@components/admin/FichaPropiedad";
import {
  sampleCondominioParqueMackenna,
  getSampleUnidad305,
} from "@lib/admin/sample-parque-mackenna";
import Link from "next/link";

type Step = "choice" | "condominio" | "propiedad";

export default function ListarPropiedadPage() {
  const [step, setStep] = useState<Step>("choice");
  const [isNewCondominio, setIsNewCondominio] = useState<boolean | null>(null);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [condominioData, setCondominioData] = useState<Omit<Building, "units"> | null>(null);
  const [initialUnitData, setInitialUnitData] = useState<Partial<Unit> | undefined>(undefined);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const fetchBuildings = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/buildings?limit=500");
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setBuildings(data.data);
      }
    } catch {
      toast.error("Error al cargar condominios");
    }
  }, []);

  useEffect(() => {
    fetchBuildings();
  }, [fetchBuildings]);

  const handleChooseNewCondominio = () => {
    setIsNewCondominio(true);
    setCondominioData(null);
    setSelectedBuildingId("");
    setStep("condominio");
  };

  const handleChooseExistingCondominio = () => {
    setIsNewCondominio(false);
    setCondominioData(null);
    setStep("condominio");
  };

  const handleCondominioComplete = (data: Omit<Building, "units">) => {
    if (isNewCondominio) {
      setCondominioData(data);
      setSelectedBuildingId(data.id);
      setStep("propiedad");
    } else {
      setSelectedBuildingId(data.id);
      setStep("propiedad");
    }
  };

  const handleCondominioSelect = (buildingId: string) => {
    setSelectedBuildingId(buildingId);
    setStep("propiedad");
  };

  const handlePropiedadSubmit = async (unit: Unit) => {
    setLoading(true);
    try {
      if (isNewCondominio && condominioData) {
        const buildingPayload: Building = {
          ...condominioData,
          units: [
            {
              ...unit,
              buildingId: condominioData.id,
              bedrooms: unit.dormitorios,
              bathrooms: unit.banos,
              gastosComunes: unit.gastoComun,
            },
          ],
        };
        const res = await fetch("/api/admin/buildings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildingPayload),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || data.message || "Error al crear edificio y unidad");
        }
        toast.success("Condominio y propiedad creados correctamente");
      } else {
        const res = await fetch("/api/admin/units", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...unit, buildingId: selectedBuildingId }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || data.message || "Error al crear propiedad");
        }
        toast.success("Propiedad creada correctamente");
      }
      setStep("choice");
      setIsNewCondominio(null);
      setCondominioData(null);
      setInitialUnitData(undefined);
      setSelectedBuildingId("");
      fetchBuildings();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  const placeholderUnit: Unit = {
    id: "_pending",
    slug: "_",
    tipologia: "1D1B",
    price: 1,
    disponible: true,
    codigoUnidad: "_",
    buildingId: condominioData?.id ?? "",
    dormitorios: 0,
    banos: 1,
    garantia: 1,
  };

  const currentBuildingForPropiedad =
    selectedBuildingId && isNewCondominio && condominioData
      ? ({
          id: condominioData.id,
          slug: condominioData.slug,
          name: condominioData.name,
          comuna: condominioData.comuna,
          address: condominioData.address,
          amenities: condominioData.amenities ?? [],
          gallery: condominioData.gallery ?? [],
          units: [placeholderUnit],
        } satisfies Building)
      : buildings.find((b) => b.id === selectedBuildingId);

  const buildingsList =
    currentBuildingForPropiedad && isNewCondominio
      ? [currentBuildingForPropiedad]
      : buildings;

  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <div className="mb-8">
        <Link
          href="/admin"
          className="text-sm text-[var(--subtext)] hover:text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-brand-violet focus:ring-offset-2 rounded"
        >
          ← Volver al admin
        </Link>
        <h1 className="text-3xl font-bold mt-2 text-[var(--text)]">
          Listar propiedad nueva
        </h1>
        <p className="text-[var(--subtext)] mt-1">
          Completa la ficha del condominio y de la propiedad para publicar un nuevo arriendo.
        </p>
      </div>

      {step === "choice" && (
        <div className="rounded-2xl border border-white/10 bg-[var(--soft)] p-8 max-w-xl space-y-6">
          <h2 className="text-xl font-semibold text-[var(--text)] mb-4">
            ¿El condominio ya está en el sistema?
          </h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              onClick={handleChooseNewCondominio}
              className="px-6 py-4 rounded-xl bg-brand-violet text-white hover:bg-brand-violet/90 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-violet focus:ring-offset-2 focus:ring-offset-[var(--bg)] min-h-[48px]"
            >
              No — Ingresar condominio nuevo
            </button>
            <button
              type="button"
              onClick={handleChooseExistingCondominio}
              className="px-6 py-4 rounded-xl bg-[var(--bg)] text-[var(--text)] border border-white/10 hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-violet focus:ring-offset-2 focus:ring-offset-[var(--bg)] min-h-[48px]"
            >
              Sí — Elegir condominio existente
            </button>
          </div>
          <div className="pt-4 border-t border-white/10">
            <p className="text-sm text-[var(--subtext)] mb-2">
              Cargar ejemplo con datos de Parque Mackenna (Unidad 305):
            </p>
            <button
              type="button"
              onClick={() => {
                setCondominioData(sampleCondominioParqueMackenna);
                setInitialUnitData(
                  getSampleUnidad305(sampleCondominioParqueMackenna.id)
                );
                setSelectedBuildingId(sampleCondominioParqueMackenna.id);
                setIsNewCondominio(true);
                setStep("condominio");
                toast.success("Ejemplo Parque Mackenna cargado. Revisa la ficha del condominio.");
              }}
              className="px-4 py-2 rounded-xl bg-[var(--bg)] text-[var(--text)] border border-white/10 hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-violet focus:ring-offset-2 min-h-[44px] text-sm font-medium"
            >
              Cargar ejemplo: Parque Mackenna
            </button>
          </div>
        </div>
      )}

      {step === "condominio" && isNewCondominio && (
        <div className="rounded-2xl border border-white/10 bg-[var(--soft)] p-6 max-w-3xl">
          <h2 className="text-2xl font-bold text-[var(--text)] mb-2">
            Ficha de ingreso — Condominio
          </h2>
          <p className="text-[var(--subtext)] mb-6">
            Completa los datos del edificio o condominio.
          </p>
          <FichaCondominio
            initialData={condominioData ?? undefined}
            onSubmit={async (data) => {
              setCondominioData(data);
              setSelectedBuildingId(data.id);
              setStep("propiedad");
            }}
            onCancel={() => {
              setStep("choice");
              setIsNewCondominio(null);
              setCondominioData(null);
              setInitialUnitData(undefined);
            }}
            loading={loading}
          />
        </div>
      )}

      {step === "condominio" && !isNewCondominio && (
        <div className="rounded-2xl border border-white/10 bg-[var(--soft)] p-6 max-w-2xl">
          <h2 className="text-2xl font-bold text-[var(--text)] mb-2">
            Seleccionar condominio
          </h2>
          <p className="text-[var(--subtext)] mb-6">
            Elige el edificio o condominio donde se encuentra la propiedad.
          </p>
          {buildings.length === 0 ? (
            <p className="text-[var(--subtext)]">No hay condominios cargados. Crea uno nuevo.</p>
          ) : (
            <div className="space-y-4">
              <label htmlFor="select-building" className="block text-sm font-medium text-[var(--text)]">
                Condominio <span className="text-red-400">*</span>
              </label>
              <select
                id="select-building"
                value={selectedBuildingId}
                onChange={(e) => handleCondominioSelect(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-[var(--bg)] text-[var(--text)] border border-white/10 focus:outline-none focus:ring-2 focus:ring-brand-violet focus:ring-offset-2"
              >
                <option value="">Seleccionar...</option>
                {buildings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} — {b.comuna}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="flex gap-4 mt-6">
            <button
              type="button"
              onClick={() => {
                setStep("choice");
                setIsNewCondominio(null);
              }}
              className="px-4 py-2 rounded-xl bg-[var(--bg)] text-[var(--text)] border border-white/10 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-brand-violet focus:ring-offset-2 min-h-[44px]"
            >
              Volver
            </button>
            {selectedBuildingId && (
              <button
                type="button"
                onClick={() => setStep("propiedad")}
                className="px-4 py-2 rounded-xl bg-brand-violet text-white hover:bg-brand-violet/90 focus:outline-none focus:ring-2 focus:ring-brand-violet focus:ring-offset-2 min-h-[44px]"
              >
                Siguiente — Datos de la propiedad
              </button>
            )}
          </div>
        </div>
      )}

      {step === "propiedad" && selectedBuildingId && (
        <div className="rounded-2xl border border-white/10 bg-[var(--soft)] p-6 max-w-3xl">
          <h2 className="text-2xl font-bold text-[var(--text)] mb-2">
            Ficha de ingreso — Propiedad
          </h2>
          <p className="text-[var(--subtext)] mb-6">
            Completa los datos de la unidad o propiedad a listar.
          </p>
          <FichaPropiedad
            buildingId={selectedBuildingId}
            buildings={buildingsList}
            initialData={initialUnitData}
            onSubmit={handlePropiedadSubmit}
            onCancel={() => {
              if (isNewCondominio) {
                setStep("condominio");
                setCondominioData(null);
              } else {
                setStep("condominio");
              }
              setInitialUnitData(undefined);
              setSelectedBuildingId("");
            }}
            loading={loading}
          />
        </div>
      )}
    </div>
  );
}
