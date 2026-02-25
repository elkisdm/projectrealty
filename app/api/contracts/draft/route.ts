import { IssueContractRequestSchema } from '@/schemas/contracts';
import { requireAdmin } from '@/lib/contracts/auth';
import { errorJson, okJson } from '@/lib/contracts/http';
import { generateContractDraft } from '@/lib/contracts/service';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
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

    const draft = await generateContractDraft({
      templateId: parsed.data.templateId,
      payloadRaw: parsed.data.payload,
      createdBy: actor.userId,
    });

    return okJson(draft);
  } catch (error) {
    return errorJson(error);
  }
}
