/**
 * @jest-environment node
 */

import { NextRequest, NextResponse } from "next/server";
import { GET, POST } from "@/app/api/admin/units/route";

const mockRequireAdminSession = jest.fn();
const mockListAdminUnits = jest.fn();
const mockCreateAdminUnit = jest.fn();

jest.mock("@lib/rate-limit", () => ({
  createRateLimiter: jest.fn(() => ({
    check: jest.fn().mockResolvedValue({ ok: true }),
  })),
}));

jest.mock("@lib/admin/guards", () => ({
  requireAdminSession: (...args: unknown[]) => mockRequireAdminSession(...args),
}));

jest.mock("@lib/admin/repositories/units.repository", () => ({
  listAdminUnits: (...args: unknown[]) => mockListAdminUnits(...args),
  createAdminUnit: (...args: unknown[]) => mockCreateAdminUnit(...args),
}));

jest.mock("@lib/admin/repositories/activity.repository", () => ({
  logAdminActivity: jest.fn().mockResolvedValue(undefined),
}));

describe("/api/admin/units", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAdminSession.mockResolvedValue({
      response: null,
      session: {
        user: { id: "user-1", email: "admin@hommie.cl", role: "admin" },
      },
    });

    mockListAdminUnits.mockResolvedValue({
      items: [],
      meta: {
        page: 1,
        page_size: 50,
        total: 0,
        total_pages: 1,
        has_next_page: false,
        has_prev_page: false,
      },
    });
  });

  test("GET sin parámetros devuelve contrato y meta", async () => {
    const request = new NextRequest("http://localhost/api/admin/units", { method: "GET" });
    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.error).toBeNull();
    expect(json.meta.page).toBe(1);
    expect(json.meta.page_size).toBe(50);
    expect(mockListAdminUnits).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, page_size: 50 })
    );
  });

  test("GET con rango de precio inválido retorna invalid_query", async () => {
    const request = new NextRequest(
      "http://localhost/api/admin/units?price_min=1000&price_max=100",
      { method: "GET" }
    );
    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("invalid_query");
    expect(mockListAdminUnits).not.toHaveBeenCalled();
  });

  test("POST bloquea viewer con 403", async () => {
    mockRequireAdminSession.mockResolvedValue({
      session: null,
      response: NextResponse.json(
        { success: false, data: null, meta: null, error: { code: "forbidden", message: "Rol insuficiente" } },
        { status: 403 }
      ),
    });

    const request = new NextRequest("http://localhost/api/admin/units", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ buildingId: "bld-1" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(403);
    expect(mockCreateAdminUnit).not.toHaveBeenCalled();
  });
});
