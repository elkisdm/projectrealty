import { IssueContractRequestSchema } from '@/schemas/contracts';
import { requireAdmin } from '@/lib/contracts/auth';
import { errorJson, okJson } from '@/lib/contracts/http';
import { issueContract } from '@/lib/contracts/service';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const startedAt = Date.now();
  try {
    const actor = await requireAdmin(request, ['admin', 'editor']);

    const body = await request.json();
    const parsed = IssueContractRequestSchema.safeParse(body);
    if (!parsed.success) {
      return okJson(
        {
          code: 'VALIDATION_ERROR',
          message: 'Payload inválido',
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const result = await issueContract({
      templateId: parsed.data.templateId,
      payloadRaw: parsed.data.payload,
      createdBy: actor.userId,
    });

    return okJson({
      contractId: result.contractId,
      status: result.status,
      pdfUrl: result.pdfUrl,
      hash: result.hash,
      idempotentReused: result.idempotentReused,
      durationMs: Date.now() - startedAt,
    });
  } catch (error) {
    return errorJson(error);
  }
}
