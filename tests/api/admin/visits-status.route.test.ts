/**
 * @jest-environment node
 */

import { NextRequest, NextResponse } from "next/server";
import { PATCH } from "@/app/api/admin/visits/[id]/status/route";

const mockRequireAdminSession = jest.fn();
const mockUpdateVisitStatus = jest.fn();
const mockLogAdminActivity = jest.fn();

jest.mock("@lib/rate-limit", () => ({
  createRateLimiter: jest.fn(() => ({
    check: jest.fn().mockResolvedValue({ ok: true }),
  })),
}));

jest.mock("@lib/admin/guards", () => ({
  requireAdminSession: (...args: unknown[]) => mockRequireAdminSession(...args),
}));

jest.mock("@lib/admin/repositories/activity.repository", () => ({
  logAdminActivity: (...args: unknown[]) => mockLogAdminActivity(...args),
}));

jest.mock("@/lib/visits/repository", () => ({
  getVisitRepository: () => ({
    updateVisitStatus: (...args: unknown[]) => mockUpdateVisitStatus(...args),
  }),
}));

describe("/api/admin/visits/:id/status", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAdminSession.mockResolvedValue({
      response: null,
      session: {
        user: { id: "admin-1", email: "admin@hommie.cl", role: "admin" },
      },
    });

    mockLogAdminActivity.mockResolvedValue(undefined);
    mockUpdateVisitStatus.mockResolvedValue({
      visit: {
        id: "visit_123",
        listingId: "listing_1",
        slotId: "mock-slot-2026-02-12-10:00",
        userId: "user_1",
        status: "in_progress",
        createdAt: new Date("2026-02-10T10:00:00.000Z").toISOString(),
        idempotencyKey: "idem-1",
        agentId: "agent_1",
      },
    });
  });

  function ctx(id: string) {
    return { params: Promise.resolve({ id }) };
  }

  test("PATCH actualiza estado de visita correctamente", async () => {
    const request = new NextRequest("http://localhost/api/admin/visits/visit_123/status", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "in_progress", reason: "Agente en camino" }),
    });

    const response = await PATCH(request, ctx("visit_123"));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.visit.status).toBe("in_progress");
    expect(mockUpdateVisitStatus).toHaveBeenCalledWith(
      expect.objectContaining({
        visitId: "visit_123",
        status: "in_progress",
        reason: "Agente en camino",
        actorType: "admin",
        actorId: "admin-1",
      })
    );
    expect(mockLogAdminActivity).toHaveBeenCalled();
  });

  test("PATCH con payload inválido responde validation_error", async () => {
    const request = new NextRequest("http://localhost/api/admin/visits/visit_123/status", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "invalid" }),
    });

    const response = await PATCH(request, ctx("visit_123"));
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error.code).toBe("validation_error");
    expect(mockUpdateVisitStatus).not.toHaveBeenCalled();
  });

  test("PATCH responde not_found cuando la visita no existe", async () => {
    mockUpdateVisitStatus.mockRejectedValueOnce(
      Object.assign(new Error("Visita no encontrada"), { name: "VisitNotFoundError" })
    );

    const request = new NextRequest("http://localhost/api/admin/visits/visit_missing/status", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "completed" }),
    });

    const response = await PATCH(request, ctx("visit_missing"));
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.error.code).toBe("not_found");
  });

  test("PATCH responde invalid_transition para transición inválida", async () => {
    mockUpdateVisitStatus.mockRejectedValueOnce(
      Object.assign(new Error("Transición de estado inválida para la visita"), {
        name: "InvalidVisitTransitionError",
      })
    );

    const request = new NextRequest("http://localhost/api/admin/visits/visit_123/status", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "pending" }),
    });

    const response = await PATCH(request, ctx("visit_123"));
    const json = await response.json();

    expect(response.status).toBe(409);
    expect(json.error.code).toBe("invalid_transition");
  });

  test("PATCH bloquea cuando no hay sesión admin", async () => {
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

    const request = new NextRequest("http://localhost/api/admin/visits/visit_123/status", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "completed" }),
    });

    const response = await PATCH(request, ctx("visit_123"));

    expect(response.status).toBe(401);
    expect(mockUpdateVisitStatus).not.toHaveBeenCalled();
  });
});
