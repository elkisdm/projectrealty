import { requireAdmin } from '@/lib/contracts/auth';
import { listContractsMetadata } from '@/lib/contracts/contracts-service';
import { errorJson, okJson } from '@/lib/contracts/http';

export const dynamic = 'force-dynamic';

function parsePositiveInt(value: string | null, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return Math.floor(parsed);
}

export async function GET(request: Request) {
  try {
    await requireAdmin(request, ['admin', 'editor', 'viewer']);

    const url = new URL(request.url);
    const page = parsePositiveInt(url.searchParams.get('page'), 1);
    const limit = parsePositiveInt(url.searchParams.get('limit'), 20);
    const templateId = url.searchParams.get('templateId')?.trim() || undefined;
    const statusRaw = url.searchParams.get('status')?.trim();
    const dateFrom = url.searchParams.get('dateFrom')?.trim() || undefined;
    const dateTo = url.searchParams.get('dateTo')?.trim() || undefined;

    if (statusRaw && statusRaw !== 'issued' && statusRaw !== 'void') {
      return okJson(
        {
          code: 'VALIDATION_ERROR',
          message: 'status inválido',
          details: { status: statusRaw, allowed: ['issued', 'void'] },
        },
        { status: 400 }
      );
    }

    const result = await listContractsMetadata({
      page,
      limit,
      templateId,
      status: statusRaw as 'issued' | 'void' | undefined,
      dateFrom,
      dateTo,
    });

    return okJson(result);
  } catch (error) {
    return errorJson(error);
  }
}
