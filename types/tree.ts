import type { TreeRentRequest, TreeBuyRequest, TreeLeadRequest } from "@schemas/tree";

/**
 * Tipos para el módulo Tree
 */

export type TreeFlow = "rent" | "buy";

export type LeadStatus = "new" | "contacted" | "qualified" | "closed" | "disqualified";

/**
 * Tipo para lead completo guardado en DB
 */
export interface TreeLead {
  id: string;
  flow: TreeFlow;
  name: string;
  whatsapp: string;
  email: string | null;
  payload: Record<string, unknown>;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  referrer: string | null;
  created_at: string;
  status: LeadStatus;
}

/**
 * Tipo para respuesta de API
 */
export interface TreeLeadResponse {
  success: boolean;
  leadId?: string;
  error?: string;
  message?: string;
}

/**
 * Re-exportar tipos de schemas
 */
export type { TreeRentRequest, TreeBuyRequest, TreeLeadRequest };
