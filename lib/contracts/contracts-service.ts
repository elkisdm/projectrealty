import { createContractEvent, getContractById, listContracts } from './repository';
import { createContractSignedUrl } from './storage';

export async function getContractMetadata(
  contractId: string,
  trackDownload: boolean,
  includePayload = false
) {
  const contract = await getContractById(contractId);
  const pdfUrl = await createContractSignedUrl(contract.pdf_path);

  if (trackDownload) {
    await createContractEvent({
      contractId: contract.id,
      type: 'downloaded',
      meta: { trackedAt: new Date().toISOString() },
    });
  }

  return {
    contractId: contract.id,
    templateId: contract.template_id,
    templateVersion: contract.template_version,
    status: contract.status,
    hash: contract.hash_sha256,
    createdAt: contract.created_at,
    createdBy: contract.created_by,
    pdfUrl,
    ...(includePayload ? { payload: contract.payload_json } : {}),
  };
}

export async function listContractsMetadata(params: {
  page: number;
  limit: number;
  templateId?: string;
  status?: 'issued' | 'void';
  dateFrom?: string;
  dateTo?: string;
}) {
  const result = await listContracts(params);

  return {
    contracts: result.contracts.map((contract) => ({
      id: contract.id,
      templateId: contract.template_id,
      templateVersion: contract.template_version,
      status: contract.status,
      hash: contract.hash_sha256,
      createdAt: contract.created_at,
      createdBy: contract.created_by,
    })),
    pagination: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    },
  };
}
