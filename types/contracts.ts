import type { ContractPayload } from '@/schemas/contracts';

export type ContractWizardDraft = ContractPayload;

export interface ContractTemplateItem {
  id: string;
  name: string;
  description: string | null;
  version: string;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
}

export interface ContractValidationError {
  code: string;
  message: string;
  details?: unknown;
  hint?: string;
}

export interface ContractValidationResponse {
  valid: boolean;
  errors: ContractValidationError[];
  warnings: string[];
  missingPlaceholders: string[];
}

export interface ContractIssueResponse {
  contractId: string;
  status: 'issued';
  pdfUrl: string;
  hash: string;
  idempotentReused: boolean;
  durationMs?: number;
}

export interface ContractDraftResponse {
  status: 'draft';
  pdfUrl: string;
  hash: string;
  generatedAt: string;
}

export type ContractStatus = 'issued' | 'void';

export interface ContractHistoryItem {
  id: string;
  templateId: string;
  templateVersion: string;
  status: ContractStatus;
  hash: string;
  createdAt: string;
  createdBy: string;
}

export interface ContractHistoryFilters {
  templateId?: string;
  status?: ContractStatus;
  dateFrom?: string;
  dateTo?: string;
}

export interface ContractHistoryResponse {
  contracts: ContractHistoryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ContractPartyItem {
  id: string;
  role:
    | 'arrendador_propietario'
    | 'arrendadora'
    | 'arrendadora_representante'
    | 'propietario'
    | 'arrendatario'
    | 'arrendatario_representante_legal'
    | 'aval';
  party_type: 'natural' | 'juridica' | 'unknown';
  display_name: string;
  rut: string;
  email: string | null;
  phone: string | null;
  nationality: string | null;
  civil_status: string | null;
  profession: string | null;
  address: string | null;
  updated_at?: string;
}
