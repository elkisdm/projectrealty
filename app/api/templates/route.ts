import { requireAdmin } from '@/lib/contracts/auth';
import { errorJson, okJson } from '@/lib/contracts/http';
import { createTemplateFromUpload, listTemplatesForApi } from '@/lib/contracts/templates-service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    await requireAdmin(request, ['admin', 'editor', 'viewer']);
    const templates = await listTemplatesForApi();
    return okJson({ templates });
  } catch (error) {
    return errorJson(error);
  }
}

export async function POST(request: Request) {
  try {
    const actor = await requireAdmin(request, ['admin', 'editor']);
    const form = await request.formData();

    const name = String(form.get('name') ?? '').trim();
    const description = String(form.get('description') ?? '').trim();
    const version = String(form.get('version') ?? '').trim();
    const setActive = String(form.get('setActive') ?? '').trim() === 'true';
    const file = form.get('docx');

    if (!name || !version) {
      return okJson({ code: 'VALIDATION_ERROR', message: 'name y version son requeridos' }, { status: 400 });
    }

    if (!(file instanceof File)) {
      return okJson({ code: 'VALIDATION_ERROR', message: 'docx es requerido' }, { status: 400 });
    }

    const template = await createTemplateFromUpload({
      name,
      description: description || undefined,
      version,
      setActive,
      createdBy: actor.userId,
      file,
    });

    return okJson({ template }, { status: 201 });
  } catch (error) {
    return errorJson(error);
  }
}
