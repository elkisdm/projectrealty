import type { Unit } from "@schemas/models";

export type PublicationStep =
  | "building"
  | "type"
  | "media"
  | "details"
  | "pricing"
  | "amenities"
  | "review";

export interface PublicationDraft extends Partial<Unit> {
  id: string;
  buildingId: string;
  publicationStatus?: "draft" | "published" | "archived";
  publication_title?: string;
  publication_description?: string;
  unit_amenities?: string[];
  operation_type?: "rent";
  draft_step?: number;
  draft_completed_steps?: string[];
  draft_last_saved_at?: string;
}

export interface DraftSavePayload {
  step: PublicationStep;
  data?: Partial<Unit>;
  completedSteps?: PublicationStep[];
}
