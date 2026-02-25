import { ContractError } from './errors';
import { createSupabaseAdminClient } from './supabase';

const templatesBucket = 'templates';
const contractsBucket = 'contracts';

export async function uploadTemplateDocx(path: string, content: Buffer): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.storage
    .from(templatesBucket)
    .upload(path, content, {
      contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      upsert: false,
    });

  if (error) {
    throw new ContractError({
      code: 'STORAGE_ERROR',
      message: 'No se pudo subir el DOCX a storage',
      details: error.message,
    });
  }
}

export async function uploadContractPdf(path: string, content: Buffer): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.storage
    .from(contractsBucket)
    .upload(path, content, {
      contentType: 'application/pdf',
      upsert: false,
    });

  if (error) {
    throw new ContractError({
      code: 'STORAGE_ERROR',
      message: 'No se pudo subir el PDF a storage',
      details: error.message,
    });
  }
}

export async function createTemplateSourceSignedUrl(path: string): Promise<string> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.storage
    .from(templatesBucket)
    .createSignedUrl(path, 60 * 30);

  if (error || !data?.signedUrl) {
    throw new ContractError({
      code: 'STORAGE_ERROR',
      message: 'No se pudo generar signed URL para template',
      details: error?.message,
    });
  }

  return data.signedUrl;
}

export async function createContractSignedUrl(path: string): Promise<string> {
  const ttl = Number(process.env.CONTRACTS_SIGNED_URL_TTL_SECONDS ?? 604800);
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.storage
    .from(contractsBucket)
    .createSignedUrl(path, ttl);

  if (error || !data?.signedUrl) {
    throw new ContractError({
      code: 'STORAGE_ERROR',
      message: 'No se pudo generar signed URL del contrato',
      details: error?.message,
    });
  }

  return data.signedUrl;
}

export async function downloadTemplateDocx(path: string): Promise<Buffer> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.storage.from(templatesBucket).download(path);
  if (error || !data) {
    throw new ContractError({
      code: 'STORAGE_ERROR',
      message: 'No se pudo descargar DOCX de template',
      details: error?.message,
    });
  }

  const arrayBuffer = await data.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
