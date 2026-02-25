import { ContractError } from './errors';

export async function convertDocxToPdf(docx: Buffer, filename = 'contract.docx'): Promise<Buffer> {
  const gotenbergUrl = process.env.GOTENBERG_URL;
  if (!gotenbergUrl) {
    throw new ContractError({
      code: 'RENDER_FAILED',
      message: 'GOTENBERG_URL no configurado',
    });
  }

  const endpoint = `${gotenbergUrl.replace(/\/$/, '')}/forms/libreoffice/convert`;

  const form = new FormData();
  form.append('files', new Blob([docx]), filename);

  const response = await fetch(endpoint, {
    method: 'POST',
    body: form,
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new ContractError({
      code: 'RENDER_FAILED',
      message: `Error convirtiendo DOCX->PDF (${response.status})`,
      details: body.slice(0, 500),
    });
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
