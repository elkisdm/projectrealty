import type { ContractPayload } from '@/schemas/contracts';
import { ContractError } from './errors';
import { applyPayloadDefaults, validateBusinessRules } from './validation';
import {
  applyReplacements,
  assertAvalPlaceholdersProtected,
  assertNoResidualPlaceholders,
  buildReplacements,
  findResidualPlaceholders,
  validateCatalogSyntax,
} from './placeholders';
import { applyConditionals } from './conditionals';
import { canonicalStringify, sha256Hex } from './utils';
import { renderDocxTemplate } from './docx';
import { convertDocxToPdf } from './gotenberg';
import { matchesTemplateToContractType } from './template-type';
import {
  createContractEvent,
  createIssuedContract,
  findIdempotentContract,
  getTemplateById,
  type ContractRecord,
} from './repository';
import { createContractSignedUrl, downloadTemplateDocx, uploadContractPdf } from './storage';

export interface ValidationResult {
  valid: boolean;
  errors: Array<{ code: string; message: string; details?: unknown; hint?: string }>;
  warnings: string[];
  missingPlaceholders: string[];
  payloadWithDefaults?: ContractPayload;
  replacements?: Record<string, string>;
}

function transformXmlContent(xml: string, payload: ContractPayload, replacements: Record<string, string>): string {
  validateCatalogSyntax(xml);

  const afterIf = applyConditionals(xml, {
    HAY_AVAL: payload.flags.hay_aval,
    MASCOTA_PERMITIDA: payload.flags.mascota_permitida,
    DEPTO_AMOBLADO: payload.flags.depto_amoblado,
  });

  assertAvalPlaceholdersProtected(afterIf, payload.flags.hay_aval);

  const rendered = applyReplacements(afterIf, replacements);
  return rendered;
}

function renderTemplateWithPayload(params: {
  sourceDocx: Buffer;
  payload: ContractPayload;
  replacements: Record<string, string>;
}) {
  return renderDocxTemplate({
    sourceDocxBuffer: params.sourceDocx,
    transformXml: (xml) => transformXmlContent(xml, params.payload, params.replacements),
  });
}

function assertTemplateMatchesContractType(
  template: { name: string; description: string | null },
  payload: ContractPayload
): void {
  const type = payload.contrato.tipo ?? 'standard';
  if (!matchesTemplateToContractType(template, type)) {
    throw new ContractError({
      code: 'VALIDATION_ERROR',
      message: `La plantilla seleccionada no corresponde al tipo de contrato (${type})`,
      hint: type === 'subarriendo_propietario'
        ? 'Selecciona una plantilla de subarriendo (nombre o descripción debe incluir "subarriendo").'
        : 'Selecciona una plantilla estándar (sin marcador de subarriendo).',
    });
  }
}

export function validateContractInput(payloadRaw: ContractPayload): ValidationResult {
  try {
    const payload = applyPayloadDefaults(payloadRaw);
    validateBusinessRules(payload);

    const replacements = buildReplacements(payload);
    const missingPlaceholders: string[] = [];

    return {
      valid: true,
      errors: [],
      warnings: [],
      missingPlaceholders,
      payloadWithDefaults: payload,
      replacements,
    };
  } catch (error) {
    if (error instanceof ContractError) {
      return {
        valid: false,
        errors: [error.toJSON()],
        warnings: [],
        missingPlaceholders: [],
      };
    }

    return {
      valid: false,
      errors: [{ code: 'VALIDATION_ERROR', message: 'Validación falló' }],
      warnings: [],
      missingPlaceholders: [],
    };
  }
}

export async function validateContractForTemplate(params: {
  templateId: string;
  payloadRaw: ContractPayload;
}): Promise<ValidationResult> {
  try {
    const payload = applyPayloadDefaults(params.payloadRaw);
    validateBusinessRules(payload);

    const template = await getTemplateById(params.templateId);
    assertTemplateMatchesContractType(template, payload);
    const sourceDocx = await downloadTemplateDocx(template.docx_path);
    const replacements = buildReplacements(payload);

    const rendered = renderTemplateWithPayload({
      sourceDocx,
      payload,
      replacements,
    });

    const missing = findResidualPlaceholders(rendered.mergedXmlContent);

    return {
      valid: missing.length === 0,
      errors:
        missing.length > 0
          ? [
              {
                code: 'MISSING_PLACEHOLDERS',
                message: 'Quedaron placeholders sin reemplazar',
                details: missing,
              },
            ]
          : [],
      warnings: [],
      missingPlaceholders: missing,
      payloadWithDefaults: payload,
      replacements,
    };
  } catch (error) {
    if (error instanceof ContractError) {
      return {
        valid: false,
        errors: [error.toJSON()],
        warnings: [],
        missingPlaceholders: [],
      };
    }

    return {
      valid: false,
      errors: [{ code: 'VALIDATION_ERROR', message: 'Validación falló contra plantilla' }],
      warnings: [],
      missingPlaceholders: [],
    };
  }
}

export async function issueContract(params: {
  templateId: string;
  payloadRaw: ContractPayload;
  createdBy: string;
}): Promise<{
  contractId: string;
  status: 'issued';
  pdfUrl: string;
  hash: string;
  idempotentReused: boolean;
  contract: ContractRecord;
}> {
  const payload = applyPayloadDefaults(params.payloadRaw);
  validateBusinessRules(payload);

  const template = await getTemplateById(params.templateId);
  assertTemplateMatchesContractType(template, payload);
  if (!template.is_active) {
    throw new ContractError({
      code: 'TEMPLATE_NOT_ACTIVE',
      message: 'Template no está activo',
      details: { templateId: params.templateId },
    });
  }

  const requestHash = sha256Hex(`${params.templateId}:${canonicalStringify(payload)}`);
  const idempotencyWindowMinutes = Number(process.env.CONTRACTS_IDEMPOTENCY_WINDOW_MINUTES ?? 15);

  const already = await findIdempotentContract({
    requestHash,
    templateId: params.templateId,
    createdBy: params.createdBy,
    windowMinutes: idempotencyWindowMinutes,
  });

  if (already) {
    const url = await createContractSignedUrl(already.pdf_path);
    return {
      contractId: already.id,
      status: 'issued',
      pdfUrl: url,
      hash: already.hash_sha256,
      idempotentReused: true,
      contract: already,
    };
  }

  const sourceDocx = await downloadTemplateDocx(template.docx_path);
  const replacements = buildReplacements(payload);

  const rendered = renderTemplateWithPayload({
    sourceDocx,
    payload,
    replacements,
  });

  const residual = findResidualPlaceholders(rendered.mergedXmlContent);
  if (residual.length > 0) {
    throw new ContractError({
      code: 'MISSING_PLACEHOLDERS',
      message: 'Quedaron placeholders sin reemplazar',
      details: residual,
    });
  }
  assertNoResidualPlaceholders(rendered.mergedXmlContent);

  const pdfBuffer = await convertDocxToPdf(rendered.renderedDocxBuffer);
  const pdfHash = sha256Hex(pdfBuffer);

  const contractFilePath = `${params.createdBy}/${new Date().toISOString().slice(0, 10)}/${requestHash}.pdf`;
  await uploadContractPdf(contractFilePath, pdfBuffer);

  const contract = await createIssuedContract({
    templateId: template.id,
    templateVersion: template.version,
    payload,
    replacements,
    requestHash,
    pdfPath: contractFilePath,
    pdfHash,
    createdBy: params.createdBy,
  });

  await createContractEvent({
    contractId: contract.id,
    type: 'issued',
    meta: {
      templateId: template.id,
      templateVersion: template.version,
      requestHash,
      pdfHash,
    },
  });

  const pdfUrl = await createContractSignedUrl(contractFilePath);

  return {
    contractId: contract.id,
    status: 'issued',
    pdfUrl,
    hash: pdfHash,
    idempotentReused: false,
    contract,
  };
}

export async function generateContractDraft(params: {
  templateId: string;
  payloadRaw: ContractPayload;
  createdBy: string;
}): Promise<{
  status: 'draft';
  pdfUrl: string;
  hash: string;
  generatedAt: string;
}> {
  const payload = applyPayloadDefaults(params.payloadRaw);
  validateBusinessRules(payload);

  const template = await getTemplateById(params.templateId);
  assertTemplateMatchesContractType(template, payload);
  if (!template.is_active) {
    throw new ContractError({
      code: 'TEMPLATE_NOT_ACTIVE',
      message: 'Template no está activo',
      details: { templateId: params.templateId },
    });
  }

  const sourceDocx = await downloadTemplateDocx(template.docx_path);
  const replacements = buildReplacements(payload);
  const rendered = renderTemplateWithPayload({
    sourceDocx,
    payload,
    replacements,
  });

  const residual = findResidualPlaceholders(rendered.mergedXmlContent);
  if (residual.length > 0) {
    throw new ContractError({
      code: 'MISSING_PLACEHOLDERS',
      message: 'Quedaron placeholders sin reemplazar',
      details: residual,
    });
  }
  assertNoResidualPlaceholders(rendered.mergedXmlContent);

  const pdfBuffer = await convertDocxToPdf(rendered.renderedDocxBuffer);
  const pdfHash = sha256Hex(pdfBuffer);
  const generatedAt = new Date().toISOString();
  const fingerprint = sha256Hex(`${params.templateId}:${canonicalStringify(payload)}:${generatedAt}`);
  const path = `drafts/${params.createdBy}/${generatedAt.slice(0, 10)}/${fingerprint}.pdf`;
  await uploadContractPdf(path, pdfBuffer);
  const pdfUrl = await createContractSignedUrl(path);

  return {
    status: 'draft',
    pdfUrl,
    hash: pdfHash,
    generatedAt,
  };
}
