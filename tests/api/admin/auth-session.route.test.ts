/**
 * @jest-environment node
 */

import { NextRequest } from "next/server";
import { GET } from "@/app/api/admin/auth/session/route";

const mockGetSupabaseCookies = jest.fn();
const mockGetAdminSessionFromAccessToken = jest.fn();

jest.mock("@lib/admin/supabase-cookies", () => ({
  getSupabaseCookies: (...args: unknown[]) => mockGetSupabaseCookies(...args),
}));

jest.mock("@lib/admin/auth-supabase", () => ({
  getAdminSessionFromAccessToken: (...args: unknown[]) =>
    mockGetAdminSessionFromAccessToken(...args),
}));

describe("GET /api/admin/auth/session", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetSupabaseCookies.mockReturnValue({ access_token: null, refresh_token: null });
  });

  test("retorna contrato estándar cuando no hay sesión", async () => {
    const request = new NextRequest("http://localhost/api/admin/auth/session", {
      method: "GET",
    });

    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.error).toBeNull();
    expect(json.data).toEqual({ authenticated: false, user: null });
    expect(typeof json.meta?.request_id).toBe("string");
    expect(typeof json.meta?.timestamp).toBe("string");
    expect(response.headers.get("x-request-id")).toBe(json.meta.request_id);
  });

  test("retorna sesión autenticada con contrato estándar", async () => {
    mockGetSupabaseCookies.mockReturnValue({ access_token: "token-1", refresh_token: "refresh-1" });
    mockGetAdminSessionFromAccessToken.mockResolvedValue({
      user: {
        id: "user-1",
        email: "admin@hommie.cl",
        role: "admin",
      },
      access_token: "token-1",
      refresh_token: "refresh-1",
      expires_at: 0,
    });

    const request = new NextRequest("http://localhost/api/admin/auth/session", {
      method: "GET",
    });

    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.error).toBeNull();
    expect(json.data.authenticated).toBe(true);
    expect(json.data.user.email).toBe("admin@hommie.cl");
    expect(json.meta.request_id).toBeTruthy();
  });
});
