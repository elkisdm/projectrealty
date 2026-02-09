/**
 * @jest-environment node
 */

import { NextRequest, NextResponse } from "next/server";
import { POST } from "@/app/api/admin/auth/logout/route";

const mockSignOutAdmin = jest.fn();
const mockClearSupabaseCookies = jest.fn();

jest.mock("@lib/admin/auth-supabase", () => ({
  signOutAdmin: (...args: unknown[]) => mockSignOutAdmin(...args),
}));

jest.mock("@lib/admin/supabase-cookies", () => ({
  clearSupabaseCookies: (...args: unknown[]) => mockClearSupabaseCookies(...args),
}));

describe("POST /api/admin/auth/logout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockClearSupabaseCookies.mockImplementation((response: NextResponse) => response);
  });

  test("cierra sesión y devuelve contrato estándar", async () => {
    mockSignOutAdmin.mockResolvedValue(undefined);

    const request = new NextRequest("http://localhost/api/admin/auth/logout", {
      method: "POST",
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.message).toContain("Sesión cerrada");
    expect(json.error).toBeNull();
    expect(json.meta.request_id).toBeTruthy();
    expect(mockClearSupabaseCookies).toHaveBeenCalled();
  });

  test("si falla signOut devuelve error estándar y limpia cookies", async () => {
    mockSignOutAdmin.mockRejectedValue(new Error("boom"));

    const request = new NextRequest("http://localhost/api/admin/auth/logout", {
      method: "POST",
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("logout_failed");
    expect(json.meta.request_id).toBeTruthy();
    expect(mockClearSupabaseCookies).toHaveBeenCalled();
  });
});
