"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Unit } from "@schemas/models";
import type { DraftSavePayload, PublicationDraft, PublicationStep } from "@components/admin/publication/types";

type SaveStatus = "idle" | "saving" | "saved" | "error";

const AUTOSAVE_DELAY_MS = 1700;

export function useAdminPublicationDraft() {
  const [draft, setDraft] = useState<PublicationDraft | null>(null);
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<DraftSavePayload | null>(null);

  const clearPendingTimer = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearPendingTimer();
    };
  }, [clearPendingTimer]);

  const loadDraft = useCallback(async (draftId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/admin/units/${draftId}/draft`);
      const data = await response.json();

      if (!response.ok || !data.success || !data.data) {
        throw new Error(data.error?.message || "No se pudo cargar el borrador");
      }

      setDraft(data.data as PublicationDraft);
      return data.data as PublicationDraft;
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : "Error al cargar borrador";
      setError(message);
      throw loadError;
    } finally {
      setLoading(false);
    }
  }, []);

  const createDraft = useCallback(
    async ({
      buildingId,
      step = "building",
      initialData,
    }: {
      buildingId: string;
      step?: PublicationStep;
      initialData?: Partial<Unit>;
    }) => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("/api/admin/units/drafts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            buildingId,
            step,
            initialData,
          }),
        });

        const data = await response.json();
        if (!response.ok || !data.success || !data.data) {
          throw new Error(data.error?.message || "No se pudo crear borrador");
        }

        setDraft(data.data as PublicationDraft);
        setSaveStatus("saved");
        return data.data as PublicationDraft;
      } catch (createError) {
        const message = createError instanceof Error ? createError.message : "Error al crear borrador";
        setError(message);
        setSaveStatus("error");
        throw createError;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const saveDraftStepImmediate = useCallback(
    async (payload: DraftSavePayload) => {
      if (!draft?.id) {
        throw new Error("No hay borrador activo");
      }

      const response = await fetch(`/api/admin/units/${draft.id}/draft`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok || !data.success || !data.data) {
        throw new Error(data.error?.message || "No se pudo guardar el borrador");
      }

      setDraft(data.data as PublicationDraft);
      setSaveStatus("saved");
      setError(null);
      return data.data as PublicationDraft;
    },
    [draft?.id]
  );

  const saveDraftStep = useCallback(
    async (payload: DraftSavePayload, options?: { debounced?: boolean }) => {
      const useDebounced = options?.debounced !== false;
      if (!draft?.id) {
        throw new Error("No hay borrador activo");
      }

      if (!useDebounced) {
        clearPendingTimer();
        pendingRef.current = null;
        setSaveStatus("saving");
        return saveDraftStepImmediate(payload);
      }

      pendingRef.current = payload;
      setSaveStatus("saving");
      clearPendingTimer();
      debounceRef.current = setTimeout(() => {
        const pending = pendingRef.current;
        pendingRef.current = null;
        if (!pending) {
          return;
        }

        void saveDraftStepImmediate(pending).catch((saveError) => {
          setSaveStatus("error");
          setError(saveError instanceof Error ? saveError.message : "Error guardando borrador");
        });
      }, AUTOSAVE_DELAY_MS);

      return draft;
    },
    [clearPendingTimer, draft, saveDraftStepImmediate]
  );

  const flushPendingSave = useCallback(async () => {
    const pending = pendingRef.current;
    if (!pending) {
      return draft;
    }

    clearPendingTimer();
    pendingRef.current = null;
    setSaveStatus("saving");
    return saveDraftStepImmediate(pending);
  }, [clearPendingTimer, draft, saveDraftStepImmediate]);

  const publishDraft = useCallback(
    async (status: "published" | "archived" = "published") => {
      if (!draft?.id) {
        throw new Error("No hay borrador activo");
      }
      await flushPendingSave();

      const response = await fetch(`/api/admin/units/${draft.id}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (!response.ok || !data.success || !data.data) {
        throw new Error(data.error?.message || "No se pudo publicar");
      }

      setDraft(data.data as PublicationDraft);
      setSaveStatus("saved");
      return data.data as PublicationDraft;
    },
    [draft?.id, flushPendingSave]
  );

  const archiveDraft = useCallback(async () => {
    if (!draft?.id) {
      throw new Error("No hay borrador activo");
    }
    await flushPendingSave();

    const response = await fetch(`/api/admin/units/${draft.id}/archive`, {
      method: "POST",
    });
    const data = await response.json();
    if (!response.ok || !data.success || !data.data) {
      throw new Error(data.error?.message || "No se pudo archivar");
    }

    setDraft(data.data as PublicationDraft);
    setSaveStatus("saved");
    return data.data as PublicationDraft;
  }, [draft?.id, flushPendingSave]);

  const patchLocalDraft = useCallback((partial: Partial<PublicationDraft>) => {
    setDraft((prev) => (prev ? { ...prev, ...partial } : prev));
  }, []);

  return {
    draft,
    setDraft,
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
  };
}
