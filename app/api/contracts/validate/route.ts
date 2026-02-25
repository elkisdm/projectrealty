import { IssueContractRequestSchema } from '@/schemas/contracts';
import { requireAdmin } from '@/lib/contracts/auth';
import { errorJson, okJson } from '@/lib/contracts/http';
import { validateContractForTemplate } from '@/lib/contracts/service';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    await requireAdmin(request, ['admin', 'editor']);

    const body = await request.json();
    const parsed = IssueContractRequestSchema.safeParse(body);
    if (!parsed.success) {
      return okJson(
        {
          valid: false,
          errors: [
            {
              code: 'VALIDATION_ERROR',
              message: 'Payload inválido',
              details: parsed.error.flatten(),
            },
          ],
          warnings: [],
          missingPlaceholders: [],
        },
        { status: 400 }
      );
    }

    const result = await validateContractForTemplate({
      templateId: parsed.data.templateId,
      payloadRaw: parsed.data.payload,
    });
    return okJson(result, { status: result.valid ? 200 : 400 });
  } catch (error) {
    return errorJson(error);
  }
}
