/**
 * @jest-environment node
 */

import { NextRequest, NextResponse } from "next/server";
import { POST } from "@/app/api/admin/units/drafts/route";

jest.mock("@lib/rate-limit", () => ({
  createRateLimiter: jest.fn(() => ({
    check: jest.fn().mockResolvedValue({ ok: true }),
  })),
}));

const mockRequireAdminSession = jest.fn();
jest.mock("@lib/admin/guards", () => ({
  requireAdminSession: (...args: unknown[]) => mockRequireAdminSession(...args),
}));

const mockCreateAdminUnitDraft = jest.fn();
jest.mock("@lib/admin/repositories/units.repository", () => ({
  createAdminUnitDraft: (...args: unknown[]) => mockCreateAdminUnitDraft(...args),
}));

const mockLogActivity = jest.fn();
jest.mock("@lib/admin/repositories/activity.repository", () => ({
  logAdminActivity: (...args: unknown[]) => mockLogActivity(...args),
}));

describe("POST /api/admin/units/drafts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAdminSession.mockResolvedValue({
      response: null,
      session: {
        user: {
          id: "user-1",
          email: "admin@hommie.cl",
          role: "admin",
        },
      },
    });
    mockCreateAdminUnitDraft.mockResolvedValue({
      id: "draft-1",
      buildingId: "bld-1",
      publicationStatus: "draft",
    });
  });

  test("crea borrador correctamente", async () => {
    const request = new NextRequest("http://localhost/api/admin/units/drafts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        buildingId: "bld-1",
        step: "building",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.id).toBe("draft-1");
    expect(mockCreateAdminUnitDraft).toHaveBeenCalledWith({
      buildingId: "bld-1",
      step: "building",
      initialData: undefined,
    });
    expect(mockLogActivity).toHaveBeenCalled();
  });

  test("retorna 401 cuando no hay sesión", async () => {
    mockRequireAdminSession.mockResolvedValue({
      session: null,
      response: NextResponse.json(
        {
          success: false,
          error: { code: "unauthorized", message: "Acceso no autorizado" },
        },
        { status: 401 }
      ),
    });

    const request = new NextRequest("http://localhost/api/admin/units/drafts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        buildingId: "bld-1",
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
  });
});
