/**
 * @jest-environment node
 */

import { GET } from '@/app/api/contracts/route';
import { ContractError } from '@/lib/contracts/errors';

jest.mock('@/lib/contracts/auth', () => ({
  requireAdmin: jest.fn().mockResolvedValue({ userId: 'admin-1', role: 'viewer', email: 'viewer@hommie.cl' }),
}));

jest.mock('@/lib/contracts/contracts-service', () => ({
  listContractsMetadata: jest.fn().mockResolvedValue({
    contracts: [
      {
        id: 'contract-1',
        templateId: 'tpl-1',
        templateVersion: '2026-02-v1',
        status: 'issued',
        hash: 'abc123',
        createdAt: '2026-02-25T20:00:00.000Z',
        createdBy: 'admin-1',
      },
    ],
    pagination: {
      page: 1,
      limit: 20,
      total: 1,
      totalPages: 1,
    },
  }),
}));

describe('GET /api/contracts', () => {
  test('returns contracts list with pagination', async () => {
    const req = new Request('http://localhost/api/contracts?limit=20&page=1');
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(Array.isArray(data.contracts)).toBe(true);
    expect(data.pagination.total).toBe(1);
  });

  test('rejects invalid status filter', async () => {
    const req = new Request('http://localhost/api/contracts?status=broken');
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.code).toBe('VALIDATION_ERROR');
  });

  test('returns forbidden when auth fails', async () => {
    const { requireAdmin } = jest.requireMock('@/lib/contracts/auth') as {
      requireAdmin: jest.Mock;
    };
    requireAdmin.mockRejectedValueOnce(new ContractError({ code: 'FORBIDDEN', message: 'No permitido' }));

    const req = new Request('http://localhost/api/contracts');
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(403);
    expect(data.code).toBe('FORBIDDEN');
  });
});
