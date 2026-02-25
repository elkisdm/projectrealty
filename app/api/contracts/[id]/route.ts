import { requireAdmin } from '@/lib/contracts/auth';
import { getContractMetadata } from '@/lib/contracts/contracts-service';
import { errorJson, okJson } from '@/lib/contracts/http';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, context: { params: { id: string } }) {
  try {
    await requireAdmin(request, ['admin', 'editor', 'viewer']);
    const { id } = context.params;
    const url = new URL(request.url);
    const trackDownload = url.searchParams.get('download') === '1';
    const result = await getContractMetadata(id, trackDownload);
    return okJson(result);
  } catch (error) {
    return errorJson(error);
  }
}
