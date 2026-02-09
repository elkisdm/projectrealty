/**
 * @jest-environment node
 */

import { NextRequest, NextResponse } from "next/server";
import { GET } from "@/app/api/admin/visits/route";

const mockRequireAdminSession = jest.fn();
const mockListAdminVisits = jest.fn();

jest.mock("@lib/rate-limit", () => ({
  createRateLimiter: jest.fn(() => ({
    check: jest.fn().mockResolvedValue({ ok: true }),
  })),
}));

jest.mock("@lib/admin/guards", () => ({
  requireAdminSession: (...args: unknown[]) => mockRequireAdminSession(...args),
}));

jest.mock("@lib/admin/repositories/visits.repository", () => ({
  listAdminVisits: (...args: unknown[]) => mockListAdminVisits(...args),
}));

describe("/api/admin/visits", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAdminSession.mockResolvedValue({
      response: null,
      session: {
        user: { id: "admin-1", email: "admin@hommie.cl", role: "viewer" },
      },
    });

    mockListAdminVisits.mockResolvedValue({
      items: [
        {
          id: "visit_1",
          listingId: "listing_1",
          slotId: "slot_1",
          userId: "user_1",
          status: "confirmed",
          agentId: "agent_1",
          channel: "web",
          createdAt: "2026-02-12T10:00:00.000Z",
          slot: { startTime: "2026-02-15T13:00:00.000Z", endTime: "2026-02-15T13:30:00.000Z" },
        },
      ],
      meta: {
        page: 1,
        page_size: 50,
        total: 1,
        total_pages: 1,
        has_next_page: false,
        has_prev_page: false,
      },
    });
  });

  test("GET devuelve contrato paginado", async () => {
    const request = new NextRequest("http://localhost/api/admin/visits?status=confirmed", {
      method: "GET",
    });

    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.error).toBeNull();
    expect(json.data).toHaveLength(1);
    expect(json.meta.page).toBe(1);
    expect(mockListAdminVisits).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "confirmed",
        page: 1,
        page_size: 50,
      })
    );
  });

  test("GET con status inválido retorna invalid_query", async () => {
    const request = new NextRequest("http://localhost/api/admin/visits?status=bad_status", {
      method: "GET",
    });

    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("invalid_query");
    expect(mockListAdminVisits).not.toHaveBeenCalled();
  });

  test("GET sin sesión retorna 401", async () => {
    mockRequireAdminSession.mockResolvedValueOnce({
      session: null,
      response: NextResponse.json(
        {
          success: false,
          data: null,
          meta: null,
          error: { code: "unauthorized", message: "Acceso no autorizado" },
        },
        { status: 401 }
      ),
    });

    const request = new NextRequest("http://localhost/api/admin/visits", { method: "GET" });
    const response = await GET(request);

    expect(response.status).toBe(401);
    expect(mockListAdminVisits).not.toHaveBeenCalled();
  });
});

