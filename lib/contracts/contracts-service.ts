import { createContractEvent, getContractById } from './repository';
import { createContractSignedUrl } from './storage';

export async function getContractMetadata(contractId: string, trackDownload: boolean) {
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
  };
}
