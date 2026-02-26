import { isSessionAuthenticatedPayload } from "@lib/admin/session-payload";

describe("isSessionAuthenticatedPayload", () => {
  it("acepta contrato estándar autenticado", () => {
    const payload = {
      success: true,
      data: { authenticated: true, user: { id: "1" } },
      meta: {},
      error: null,
    };

    expect(isSessionAuthenticatedPayload(payload)).toBe(true);
  });

  it("rechaza contrato estándar no autenticado", () => {
    const payload = {
      success: true,
      data: { authenticated: false, user: null },
      meta: {},
      error: null,
    };

    expect(isSessionAuthenticatedPayload(payload)).toBe(false);
  });

  it("mantiene compatibilidad con contrato legacy", () => {
    expect(isSessionAuthenticatedPayload({ authenticated: true })).toBe(true);
    expect(isSessionAuthenticatedPayload({ authenticated: false })).toBe(false);
  });

  it("devuelve false para payload inválido", () => {
    expect(isSessionAuthenticatedPayload(null)).toBe(false);
    expect(isSessionAuthenticatedPayload(undefined)).toBe(false);
    expect(isSessionAuthenticatedPayload("bad")).toBe(false);
  });
});
