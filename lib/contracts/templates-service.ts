import { sha256Hex } from './utils';
import { ContractError } from './errors';
import { createTemplate, getTemplateById, listTemplates } from './repository';
import { createTemplateSourceSignedUrl, uploadTemplateDocx } from './storage';
import { renderDocxTemplate } from './docx';
import { applyConditionals } from './conditionals';
import { validateCatalogSyntax } from './placeholders';

const allowedMimeTypes = new Set([
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/octet-stream',
]);

export async function listTemplatesForApi() {
  const rows = await listTemplates();
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    version: row.version,
    isActive: row.is_active,
    createdAt: row.created_at,
    createdBy: row.created_by,
  }));
}

export async function createTemplateFromUpload(input: {
  name: string;
  description?: string;
  version: string;
  setActive?: boolean;
  createdBy: string;
  file: File;
}) {
  if (!input.file.name.toLowerCase().endsWith('.docx')) {
    throw new ContractError({ code: 'VALIDATION_ERROR', message: 'El archivo debe ser .docx' });
  }

  if (input.file.size <= 0 || input.file.size > 10 * 1024 * 1024) {
    throw new ContractError({ code: 'VALIDATION_ERROR', message: 'Tamaño de archivo inválido (max 10MB)' });
  }

  if (!allowedMimeTypes.has(input.file.type)) {
    throw new ContractError({ code: 'VALIDATION_ERROR', message: `Mime type no permitido: ${input.file.type}` });
  }

  const bytes = Buffer.from(await input.file.arrayBuffer());

  const preview = renderDocxTemplate({
    sourceDocxBuffer: bytes,
    transformXml: (xml) => {
      validateCatalogSyntax(xml);
      return applyConditionals(xml, {
        HAY_AVAL: true,
        MASCOTA_PERMITIDA: true,
        DEPTO_AMOBLADO: true,
      });
    },
  });

  if (!preview.renderedDocxBuffer.length) {
    throw new ContractError({ code: 'VALIDATION_ERROR', message: 'DOCX inválido o no procesable' });
  }

  const templateHash = sha256Hex(bytes);
  const storagePath = `${input.name}/${input.version}/${templateHash}.docx`;
  await uploadTemplateDocx(storagePath, bytes);

  const template = await createTemplate({
    name: input.name,
    description: input.description,
    version: input.version,
    docxPath: storagePath,
    docxSha256: templateHash,
    setActive: input.setActive,
    createdBy: input.createdBy,
  });

  return {
    id: template.id,
    name: template.name,
    description: template.description,
    version: template.version,
    isActive: template.is_active,
    createdAt: template.created_at,
    createdBy: template.created_by,
  };
}

export async function getTemplateSourceUrl(templateId: string) {
  const template = await getTemplateById(templateId);
  const url = await createTemplateSourceSignedUrl(template.docx_path);
  return {
    id: template.id,
    name: template.name,
    version: template.version,
    sourceUrl: url,
  };
}
