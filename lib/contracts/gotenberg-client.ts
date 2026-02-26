import { ContractError } from './contract-error';

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
  form.append('files', new Blob([new Uint8Array(docx)]), filename);

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      body: form,
    });
  } catch (error) {
    throw new ContractError({
      code: 'RENDER_FAILED',
      message: `No se pudo conectar con Gotenberg en ${endpoint}`,
      details: error instanceof Error ? error.message : String(error),
      hint: 'Levanta Gotenberg y verifica GOTENBERG_URL (ejemplo: http://localhost:3002).',
    });
  }

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
