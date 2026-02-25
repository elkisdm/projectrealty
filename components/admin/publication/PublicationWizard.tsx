"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import type { Building } from "@schemas/models";
import { generateSlug } from "@lib/utils/slug";
import { useAdminPublicationDraft } from "@hooks/useAdminPublicationDraft";
import { PublicationStepper } from "./PublicationStepper";
import { BuildingStep } from "./steps/BuildingStep";
import { TypeStep } from "./steps/TypeStep";
import { MediaStep } from "./steps/MediaStep";
import { DetailsStep } from "./steps/DetailsStep";
import { PricingStep } from "./steps/PricingStep";
import { AmenitiesReviewStep } from "./steps/AmenitiesReviewStep";
import type { DraftSavePayload, PublicationStep } from "./types";

const steps: PublicationStep[] = [
  "building",
  "type",
  "media",
  "details",
  "pricing",
  "amenities",
  "review",
];

type BuildingMode = "existing" | "new";

interface NewBuildingForm {
  id: string;
  slug: string;
  name: string;
  comuna: string;
  address: string;
}

const emptyNewBuilding: NewBuildingForm = {
  id: "",
  slug: "",
  name: "",
  comuna: "",
  address: "",
};

export function PublicationWizard() {
  const searchParams = useSearchParams();
  const draftIdFromQuery = searchParams.get("draft");

  const {
    draft,
    patchLocalDraft,
    loading,
    saveStatus,
    error,
    loadDraft,
    createDraft,
    saveDraftStep,
    flushPendingSave,
    publishDraft,
    archiveDraft,
  } = useAdminPublicationDraft();

  const [buildings, setBuildings] = useState<Building[]>([]);
  const [buildingMode, setBuildingMode] = useState<BuildingMode>("existing");
  const [selectedBuildingId, setSelectedBuildingId] = useState("");
  const [newBuilding, setNewBuilding] = useState<NewBuildingForm>(emptyNewBuilding);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  const completedSteps = useMemo(
    () => (draft?.draft_completed_steps || draft?.draftCompletedSteps || []).map(String),
    [draft]
  );

  const currentStep = steps[currentStepIndex];

  const fetchBuildings = useCallback(async () => {
    const response = await fetch("/api/admin/buildings?page_size=1000");
    const data = await response.json();
    if (response.ok && data.success && Array.isArray(data.data)) {
      setBuildings(data.data);
    }
  }, []);

  useEffect(() => {
    void fetchBuildings();
  }, [fetchBuildings]);

  useEffect(() => {
    if (!draftIdFromQuery) return;
    void (async () => {
      try {
        const loaded = await loadDraft(draftIdFromQuery);
        setSelectedBuildingId(loaded.buildingId || "");
        const stepIndex = Math.max(0, Math.min(steps.length - 1, (loaded.draft_step || 1) - 1));
        setCurrentStepIndex(stepIndex);
      } catch {
        toast.error("No se pudo cargar el borrador solicitado");
      }
    })();
  }, [draftIdFromQuery, loadDraft]);

  useEffect(() => {
    if (!draft || draft.slug || !draft.codigoUnidad || !draft.buildingId) return;
    patchLocalDraft({
      slug: `${draft.buildingId}-${generateSlug(draft.codigoUnidad)}`,
    });
  }, [draft, patchLocalDraft]);

  const queueAutosave = useCallback(
    (payload: DraftSavePayload) => {
      if (!draft?.id) return;
      void saveDraftStep(payload, { debounced: true });
    },
    [draft?.id, saveDraftStep]
  );

  const goNext = useCallback(() => {
    setCurrentStepIndex((prev) => Math.min(steps.length - 1, prev + 1));
  }, []);

  const goBack = useCallback(() => {
    setCurrentStepIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const ensureBuilding = useCallback(async () => {
    if (buildingMode === "existing") {
      if (!selectedBuildingId) {
        throw new Error("Selecciona un condominio para continuar");
      }
      return selectedBuildingId;
    }

    if (!newBuilding.id || !newBuilding.slug || !newBuilding.name || !newBuilding.comuna || !newBuilding.address) {
      throw new Error("Completa todos los campos del nuevo condominio");
    }

    const response = await fetch("/api/admin/buildings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: newBuilding.id,
        slug: newBuilding.slug,
        name: newBuilding.name,
        comuna: newBuilding.comuna,
        address: newBuilding.address,
      }),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error?.message || "No se pudo crear el condominio");
    }

    const created = data.data as Building;
    setBuildings((prev) => [created, ...prev.filter((item) => item.id !== created.id)]);
    setSelectedBuildingId(created.id);
    setBuildingMode("existing");
    setNewBuilding(emptyNewBuilding);
    return created.id;
  }, [buildingMode, newBuilding, selectedBuildingId]);

  const handleBuildingContinue = useCallback(async () => {
    try {
      setBusy(true);
      const buildingId = await ensureBuilding();

      if (!draft?.id) {
        const createdDraft = await createDraft({
          buildingId,
          step: "building",
          initialData: {
            operation_type: "rent",
            publicationStatus: "draft",
            tipologia: "Studio",
          },
        });
        setSelectedBuildingId(createdDraft.buildingId || buildingId);
      } else {
        await saveDraftStep(
          {
            step: "building",
            data: { buildingId, operation_type: "rent" },
            completedSteps: ["building"],
          },
          { debounced: false }
        );
      }

      goNext();
    } catch (stepError) {
      toast.error(stepError instanceof Error ? stepError.message : "No se pudo guardar el paso");
    } finally {
      setBusy(false);
    }
  }, [createDraft, draft?.id, ensureBuilding, goNext, saveDraftStep]);

  const handleTypeNext = useCallback(async () => {
    if (!draft?.id) {
      toast.error("Primero debes seleccionar un condominio");
      return;
    }
    if (!draft.tipologia || !draft.codigoUnidad || !draft.slug) {
      toast.error("Completa tipología, código de unidad y slug");
      return;
    }

    try {
      setBusy(true);
      await saveDraftStep(
        {
          step: "type",
          data: {
            tipologia: draft.tipologia,
            codigoUnidad: draft.codigoUnidad,
            slug: draft.slug,
            operation_type: "rent",
          },
          completedSteps: ["building", "type"],
        },
        { debounced: false }
      );
      goNext();
    } catch (stepError) {
      toast.error(stepError instanceof Error ? stepError.message : "No se pudo guardar el paso");
    } finally {
      setBusy(false);
    }
  }, [draft, goNext, saveDraftStep]);

  const uploadFiles = useCallback(
    async (mediaType: "image" | "video", files: FileList) => {
      if (!draft?.id || !draft.buildingId) {
        toast.error("Primero crea el borrador para subir archivos");
        return;
      }

      const uploadOne = async (file: File): Promise<string> => {
        const signRes = await fetch("/api/admin/media/upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            buildingId: draft.buildingId,
            unitId: draft.id,
            scope: "unit",
            mediaType,
            fileName: file.name,
            mimeType: file.type,
            size: file.size,
          }),
        });
        const signData = await signRes.json();
        if (!signRes.ok || !signData.success) {
          throw new Error(signData.error?.message || "No se pudo generar URL de carga");
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("buildingId", draft.buildingId);
        formData.append("unitId", draft.id);
        formData.append("scope", "unit");
        formData.append("mediaType", mediaType);
        formData.append("bucket", signData.data.bucket);
        formData.append("path", signData.data.path);
        formData.append("token", signData.data.token);
        formData.append("mimeType", file.type);
        formData.append("size", String(file.size));

        const confirmRes = await fetch("/api/admin/media/confirm", {
          method: "POST",
          body: formData,
        });
        const confirmData = await confirmRes.json();
        if (!confirmRes.ok || !confirmData.success) {
          throw new Error(confirmData.error?.message || "No se pudo confirmar la carga");
        }

        return confirmData.data.public_url || confirmData.data.url;
      };

      try {
        setUploading(true);
        const urls = await Promise.all(Array.from(files).map((item) => uploadOne(item)));

        if (mediaType === "image") {
          const merged = Array.from(new Set([...(draft.images || []), ...urls]));
          patchLocalDraft({ images: merged });
          await saveDraftStep(
            {
              step: "media",
              data: { images: merged },
              completedSteps: ["media"],
            },
            { debounced: false }
          );
        } else {
          const merged = Array.from(new Set([...(draft.videos || []), ...urls]));
          patchLocalDraft({ videos: merged });
          await saveDraftStep(
            {
              step: "media",
              data: { videos: merged },
              completedSteps: ["media"],
            },
            { debounced: false }
          );
        }

        toast.success(`${urls.length} archivo(s) subido(s)`);
      } catch (uploadError) {
        toast.error(uploadError instanceof Error ? uploadError.message : "Error subiendo archivos");
      } finally {
        setUploading(false);
      }
    },
    [draft, patchLocalDraft, saveDraftStep]
  );

  const handleMediaNext = useCallback(async () => {
    if (!draft?.id) return;
    try {
      setBusy(true);
      await saveDraftStep(
        {
          step: "media",
          data: {
            images: draft.images || [],
            videos: draft.videos || [],
          },
          completedSteps: ["media"],
        },
        { debounced: false }
      );
      goNext();
    } catch (stepError) {
      toast.error(stepError instanceof Error ? stepError.message : "No se pudo guardar el paso");
    } finally {
      setBusy(false);
    }
  }, [draft, goNext, saveDraftStep]);

  const handleDetailsNext = useCallback(async () => {
    if (!draft?.id) return;
    if (!draft.publication_title?.trim()) {
      toast.error("El título de publicación es obligatorio");
      return;
    }

    try {
      setBusy(true);
      await saveDraftStep(
        {
          step: "details",
          data: {
            publication_title: draft.publication_title,
            publication_description: draft.publication_description,
            dormitorios: draft.dormitorios,
            banos: draft.banos,
            m2: draft.m2,
          },
          completedSteps: ["details"],
        },
        { debounced: false }
      );
      goNext();
    } catch (stepError) {
      toast.error(stepError instanceof Error ? stepError.message : "No se pudo guardar el paso");
    } finally {
      setBusy(false);
    }
  }, [draft, goNext, saveDraftStep]);

  const handlePricingNext = useCallback(async () => {
    if (!draft?.id) return;
    if (!draft.price || draft.price <= 0 || !draft.garantia || draft.garantia <= 0) {
      toast.error("Precio y garantía deben ser mayores a 0");
      return;
    }

    try {
      setBusy(true);
      await saveDraftStep(
        {
          step: "pricing",
          data: {
            price: draft.price,
            gastoComun: draft.gastoComun,
            garantia: draft.garantia,
          },
          completedSteps: ["pricing"],
        },
        { debounced: false }
      );
      goNext();
    } catch (stepError) {
      toast.error(stepError instanceof Error ? stepError.message : "No se pudo guardar el paso");
    } finally {
      setBusy(false);
    }
  }, [draft, goNext, saveDraftStep]);

  const handleReviewSave = useCallback(async () => {
    if (!draft?.id) return;
    try {
      setBusy(true);
      await flushPendingSave();
      await saveDraftStep(
        {
          step: "review",
          data: {
            unit_amenities: draft.unit_amenities || [],
          },
          completedSteps: ["amenities", "review"],
        },
        { debounced: false }
      );
      toast.success("Borrador guardado");
    } catch (saveError) {
      toast.error(saveError instanceof Error ? saveError.message : "No se pudo guardar");
    } finally {
      setBusy(false);
    }
  }, [draft, flushPendingSave, saveDraftStep]);

  const handlePublish = useCallback(async () => {
    if (!draft?.id) return;
    try {
      setBusy(true);
      await handleReviewSave();
      await publishDraft("published");
      toast.success("Propiedad publicada correctamente");
    } catch (publishError) {
      toast.error(
        publishError instanceof Error ? publishError.message : "No se pudo publicar la unidad"
      );
    } finally {
      setBusy(false);
    }
  }, [draft?.id, handleReviewSave, publishDraft]);

  const handleArchive = useCallback(async () => {
    if (!draft?.id) return;
    try {
      setBusy(true);
      await handleReviewSave();
      await archiveDraft();
      toast.success("Publicación archivada");
    } catch (archiveError) {
      toast.error(
        archiveError instanceof Error ? archiveError.message : "No se pudo archivar la unidad"
      );
    } finally {
      setBusy(false);
    }
  }, [archiveDraft, draft?.id, handleReviewSave]);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-[var(--soft)] p-4">
        <h2 className="text-2xl font-bold text-[var(--text)]">Wizard de publicación</h2>
        <p className="mt-1 text-sm text-[var(--subtext)]">
          Flujo guiado con autosave para crear, editar y publicar propiedades de arriendo.
        </p>
        <div className="mt-2 text-xs text-[var(--subtext)]">
          Estado guardado:{" "}
          <span className="font-medium text-[var(--text)]">
            {saveStatus === "saving"
              ? "Guardando..."
              : saveStatus === "saved"
              ? "Guardado"
              : saveStatus === "error"
              ? "Error"
              : "Sin cambios"}
          </span>
          {draft?.id ? <span className="ml-3">Borrador: {draft.id}</span> : null}
        </div>
        {error ? <p className="mt-2 text-sm text-red-400">{error}</p> : null}
      </div>

      <PublicationStepper currentStep={currentStep} completedSteps={completedSteps} />

      {currentStep === "building" ? (
        <BuildingStep
          buildings={buildings}
          mode={buildingMode}
          selectedBuildingId={selectedBuildingId}
          newBuilding={newBuilding}
          busy={busy || loading}
          onModeChange={setBuildingMode}
          onSelectedBuildingChange={setSelectedBuildingId}
          onNewBuildingChange={setNewBuilding}
          onContinue={handleBuildingContinue}
        />
      ) : null}

      {currentStep === "type" ? (
        <TypeStep
          tipologia={draft?.tipologia || "Studio"}
          codigoUnidad={draft?.codigoUnidad || ""}
          slug={draft?.slug || ""}
          busy={busy}
          onTipologiaChange={(value) => {
            patchLocalDraft({ tipologia: value });
            queueAutosave({ step: "type", data: { tipologia: value } });
          }}
          onCodigoUnidadChange={(value) => {
            patchLocalDraft({
              codigoUnidad: value,
              slug: draft?.slug || `${draft?.buildingId || selectedBuildingId}-${generateSlug(value)}`,
            });
            queueAutosave({
              step: "type",
              data: {
                codigoUnidad: value,
                slug: draft?.slug || `${draft?.buildingId || selectedBuildingId}-${generateSlug(value)}`,
              },
            });
          }}
          onSlugChange={(value) => {
            patchLocalDraft({ slug: value });
            queueAutosave({ step: "type", data: { slug: value } });
          }}
          onBack={goBack}
          onNext={handleTypeNext}
        />
      ) : null}

      {currentStep === "media" ? (
        <MediaStep
          images={draft?.images || []}
          videos={draft?.videos || []}
          busy={busy}
          uploading={uploading}
          onImagesChange={(value) => {
            patchLocalDraft({ images: value });
            queueAutosave({ step: "media", data: { images: value } });
          }}
          onVideosChange={(value) => {
            patchLocalDraft({ videos: value });
            queueAutosave({ step: "media", data: { videos: value } });
          }}
          onUploadImages={(files) => {
            void uploadFiles("image", files);
          }}
          onUploadVideos={(files) => {
            void uploadFiles("video", files);
          }}
          onBack={goBack}
          onNext={handleMediaNext}
        />
      ) : null}

      {currentStep === "details" ? (
        <DetailsStep
          title={draft?.publication_title || ""}
          description={draft?.publication_description || ""}
          dormitorios={draft?.dormitorios ?? 0}
          banos={draft?.banos ?? 1}
          m2={draft?.m2}
          busy={busy}
          onTitleChange={(value) => {
            patchLocalDraft({ publication_title: value });
            queueAutosave({ step: "details", data: { publication_title: value } });
          }}
          onDescriptionChange={(value) => {
            patchLocalDraft({ publication_description: value });
            queueAutosave({ step: "details", data: { publication_description: value } });
          }}
          onDormitoriosChange={(value) => {
            patchLocalDraft({ dormitorios: value });
            queueAutosave({ step: "details", data: { dormitorios: value } });
          }}
          onBanosChange={(value) => {
            patchLocalDraft({ banos: value });
            queueAutosave({ step: "details", data: { banos: value } });
          }}
          onM2Change={(value) => {
            patchLocalDraft({ m2: value });
            queueAutosave({ step: "details", data: { m2: value } });
          }}
          onBack={goBack}
          onNext={handleDetailsNext}
        />
      ) : null}

      {currentStep === "pricing" ? (
        <PricingStep
          price={draft?.price || 0}
          gastoComun={draft?.gastoComun}
          garantia={draft?.garantia || 0}
          busy={busy}
          onPriceChange={(value) => {
            patchLocalDraft({ price: value });
            queueAutosave({ step: "pricing", data: { price: value } });
          }}
          onGastoComunChange={(value) => {
            patchLocalDraft({ gastoComun: value });
            queueAutosave({ step: "pricing", data: { gastoComun: value } });
          }}
          onGarantiaChange={(value) => {
            patchLocalDraft({ garantia: value });
            queueAutosave({ step: "pricing", data: { garantia: value } });
          }}
          onBack={goBack}
          onNext={handlePricingNext}
        />
      ) : null}

      {currentStep === "amenities" || currentStep === "review" ? (
        <AmenitiesReviewStep
          draft={
            draft || {
              id: "",
              buildingId: selectedBuildingId,
            }
          }
          amenities={draft?.unit_amenities || []}
          busy={busy}
          onAmenitiesChange={(value) => {
            patchLocalDraft({ unit_amenities: value });
            queueAutosave({ step: "amenities", data: { unit_amenities: value } });
          }}
          onBack={goBack}
          onSave={() => {
            void handleReviewSave();
          }}
          onPublish={() => {
            void handlePublish();
          }}
          onArchive={() => {
            void handleArchive();
          }}
        />
      ) : null}
    </div>
  );
}
