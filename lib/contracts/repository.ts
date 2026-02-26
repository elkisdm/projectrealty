import type { ContractPayload } from '@/schemas/contracts';
import { createSupabaseAdminClient } from './supabase';
import { ContractError } from './errors';

export interface TemplateRecord {
  id: string;
  name: string;
  description: string | null;
  version: string;
  docx_path: string;
  docx_sha256: string;
  is_active: boolean;
  created_at: string;
  created_by: string;
}

export interface ContractRecord {
  id: string;
  template_id: string;
  template_version: string;
  status: 'issued' | 'void';
  payload_json: ContractPayload;
  replacements_json: Record<string, string> | null;
  request_hash_sha256: string;
  pdf_path: string;
  hash_sha256: string;
  created_at: string;
  created_by: string;
}

export interface ListContractsFilters {
  page: number;
  limit: number;
  templateId?: string;
  status?: 'issued' | 'void';
  dateFrom?: string;
  dateTo?: string;
}

export interface ListContractsResult {
  contracts: ContractRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ContractPartyRecord {
  id: string;
  source_contract_id: string | null;
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
  meta_json: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export async function listTemplates(): Promise<TemplateRecord[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new ContractError({ code: 'RENDER_FAILED', message: 'No se pudieron listar templates', details: error.message });
  }

  return (data ?? []) as TemplateRecord[];
}

export async function createTemplate(input: {
  name: string;
  description?: string;
  version: string;
  docxPath: string;
  docxSha256: string;
  setActive?: boolean;
  createdBy: string;
}): Promise<TemplateRecord> {
  const supabase = createSupabaseAdminClient();

  if (input.setActive) {
    await supabase.from('templates').update({ is_active: false }).eq('name', input.name);
  }

  const { data, error } = await supabase
    .from('templates')
    .insert({
      name: input.name,
      description: input.description ?? null,
      version: input.version,
      docx_path: input.docxPath,
      docx_sha256: input.docxSha256,
      is_active: Boolean(input.setActive),
      created_by: input.createdBy,
    })
    .select('*')
    .single();

  if (error || !data) {
    throw new ContractError({ code: 'RENDER_FAILED', message: 'No se pudo crear template', details: error?.message });
  }

  return data as TemplateRecord;
}

export async function getTemplateById(templateId: string): Promise<TemplateRecord> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .eq('id', templateId)
    .single();

  if (error || !data) {
    throw new ContractError({ code: 'VALIDATION_ERROR', message: 'Template no encontrado', details: templateId });
  }

  return data as TemplateRecord;
}

export async function findIdempotentContract(params: {
  requestHash: string;
  createdBy: string;
  templateId: string;
  windowMinutes: number;
}): Promise<ContractRecord | null> {
  const supabase = createSupabaseAdminClient();
  const since = new Date(Date.now() - params.windowMinutes * 60_000).toISOString();

  const { data, error } = await supabase
    .from('contracts')
    .select('*')
    .eq('status', 'issued')
    .eq('template_id', params.templateId)
    .eq('created_by', params.createdBy)
    .eq('request_hash_sha256', params.requestHash)
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new ContractError({ code: 'RENDER_FAILED', message: 'Falló búsqueda idempotente', details: error.message });
  }

  return (data as ContractRecord | null) ?? null;
}

export async function createIssuedContract(input: {
  templateId: string;
  templateVersion: string;
  payload: ContractPayload;
  replacements: Record<string, string>;
  requestHash: string;
  pdfPath: string;
  pdfHash: string;
  createdBy: string;
}): Promise<ContractRecord> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('contracts')
    .insert({
      template_id: input.templateId,
      template_version: input.templateVersion,
      status: 'issued',
      payload_json: input.payload,
      replacements_json: input.replacements,
      request_hash_sha256: input.requestHash,
      pdf_path: input.pdfPath,
      hash_sha256: input.pdfHash,
      created_by: input.createdBy,
    })
    .select('*')
    .single();

  if (error || !data) {
    throw new ContractError({ code: 'RENDER_FAILED', message: 'No se pudo crear contrato', details: error?.message });
  }

  return data as ContractRecord;
}

export async function createContractEvent(input: {
  contractId: string;
  type: 'issued' | 'downloaded' | 'voided' | 'sent';
  meta?: Record<string, unknown>;
}): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from('contract_events').insert({
    contract_id: input.contractId,
    type: input.type,
    meta_json: input.meta ?? {},
  });

  if (error) {
    throw new ContractError({ code: 'RENDER_FAILED', message: 'No se pudo registrar contract_event', details: error.message });
  }
}

export async function getContractById(id: string): Promise<ContractRecord> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from('contracts').select('*').eq('id', id).single();
  if (error || !data) {
    throw new ContractError({ code: 'VALIDATION_ERROR', message: 'Contrato no encontrado', details: id });
  }
  return data as ContractRecord;
}

export async function listContracts(filters: ListContractsFilters): Promise<ListContractsResult> {
  const supabase = createSupabaseAdminClient();
  const page = Math.max(1, filters.page);
  const limit = Math.min(100, Math.max(1, filters.limit));
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('contracts')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (filters.templateId) {
    query = query.eq('template_id', filters.templateId);
  }

  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  if (filters.dateFrom) {
    query = query.gte('created_at', filters.dateFrom);
  }

  if (filters.dateTo) {
    query = query.lte('created_at', filters.dateTo);
  }

  const { data, error, count } = await query;

  if (error) {
    throw new ContractError({
      code: 'RENDER_FAILED',
      message: 'No se pudieron listar contratos',
      details: error.message,
    });
  }

  const total = count ?? 0;
  const totalPages = total > 0 ? Math.ceil(total / limit) : 1;

  return {
    contracts: (data ?? []) as ContractRecord[],
    total,
    page,
    limit,
    totalPages,
  };
}

export async function upsertContractParties(input: {
  parties: Array<{
    source_contract_id?: string | null;
    role: ContractPartyRecord['role'];
    party_type?: ContractPartyRecord['party_type'];
    display_name: string;
    rut: string;
    email?: string | null;
    phone?: string | null;
    nationality?: string | null;
    civil_status?: string | null;
    profession?: string | null;
    address?: string | null;
    meta_json?: Record<string, unknown>;
    created_by: string;
  }>;
}): Promise<void> {
  if (!input.parties.length) return;

  const supabase = createSupabaseAdminClient();
  const rows = input.parties.map((party) => ({
    source_contract_id: party.source_contract_id ?? null,
    role: party.role,
    party_type: party.party_type ?? 'unknown',
    display_name: party.display_name,
    rut: party.rut,
    email: party.email ?? null,
    phone: party.phone ?? null,
    nationality: party.nationality ?? null,
    civil_status: party.civil_status ?? null,
    profession: party.profession ?? null,
    address: party.address ?? null,
    meta_json: party.meta_json ?? {},
    created_by: party.created_by,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from('contract_parties')
    .upsert(rows, { onConflict: 'role,rut' });

  if (error) {
    throw new ContractError({
      code: 'RENDER_FAILED',
      message: 'No se pudo persistir registro de implicados',
      details: error.message,
    });
  }
}

export async function listContractParties(filters: {
  q?: string;
  role?: ContractPartyRecord['role'];
  limit?: number;
}): Promise<ContractPartyRecord[]> {
  const supabase = createSupabaseAdminClient();
  const limit = Math.min(100, Math.max(1, filters.limit ?? 20));

  let query = supabase
    .from('contract_parties')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (filters.role) {
    query = query.eq('role', filters.role);
  }

  if (filters.q && filters.q.trim()) {
    const q = filters.q.trim().replace(/%/g, '');
    query = query.or(`display_name.ilike.%${q}%,rut.ilike.%${q}%`);
  }

  const { data, error } = await query;
  if (error) {
    throw new ContractError({
      code: 'RENDER_FAILED',
      message: 'No se pudo listar implicados',
      details: error.message,
    });
  }
  return (data ?? []) as ContractPartyRecord[];
}
