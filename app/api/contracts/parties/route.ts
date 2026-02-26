import { requireAdmin } from '@/lib/contracts/auth';
import { errorJson, okJson } from '@/lib/contracts/http';
import { listContractParties } from '@/lib/contracts/repository';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    await requireAdmin(request, ['admin', 'editor', 'viewer']);
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') ?? undefined;
    const role = searchParams.get('role') ?? undefined;
    const limit = Number(searchParams.get('limit') ?? 20);

    const parties = await listContractParties({
      q,
      role: role as Parameters<typeof listContractParties>[0]['role'],
      limit,
    });

    return okJson({ parties });
  } catch (error) {
    return errorJson(error);
  }
}

