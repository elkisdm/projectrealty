import { requireAdmin } from '@/lib/contracts/auth';
import { errorJson, okJson } from '@/lib/contracts/http';
import { getTemplateSourceUrl } from '@/lib/contracts/templates-service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, context: { params: { id: string } }) {
  try {
    await requireAdmin(request, ['admin', 'editor', 'viewer']);
    const { id } = context.params;
    const result = await getTemplateSourceUrl(id);
    return okJson(result);
  } catch (error) {
    return errorJson(error);
  }
}
