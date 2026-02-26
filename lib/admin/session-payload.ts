export type AdminSessionLegacyPayload = {
  authenticated?: boolean;
};

export type AdminSessionContractPayload = {
  success?: boolean;
  data?: { authenticated?: boolean } | null;
};

export function isSessionAuthenticatedPayload(payload: unknown): boolean {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const candidate = payload as AdminSessionLegacyPayload & AdminSessionContractPayload;

  // Compatibilidad con contrato legacy.
  if (typeof candidate.authenticated === "boolean") {
    return candidate.authenticated;
  }

  return candidate.success === true && candidate.data?.authenticated === true;
}
