export function getErrorMessage(error: unknown, fallback = "Error inesperado"): string {
  if (!error) return fallback;

  if (typeof error === "string") {
    const trimmed = error.trim();
    return trimmed.length > 0 ? trimmed : fallback;
  }

  if (error instanceof Error) {
    const trimmed = error.message.trim();
    return trimmed.length > 0 ? trimmed : fallback;
  }

  if (typeof error === "object") {
    const record = error as Record<string, unknown>;
    const candidates = [
      record.message,
      record.error,
      (record.error as Record<string, unknown> | undefined)?.message,
      (record.data as Record<string, unknown> | undefined)?.message,
      (record.details as Record<string, unknown> | undefined)?.message,
    ];

    for (const candidate of candidates) {
      const normalized = getErrorMessage(candidate, "");
      if (normalized) return normalized;
    }
  }

  return fallback;
}

export async function getResponseErrorMessage(response: Response, fallback = "Error inesperado"): Promise<string> {
  try {
    const payload = (await response.json()) as unknown;
    return getErrorMessage(payload, fallback);
  } catch {
    return fallback;
  }
}
