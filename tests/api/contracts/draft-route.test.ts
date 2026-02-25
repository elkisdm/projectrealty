/**
 * @jest-environment node
 */

import { POST } from '@/app/api/contracts/draft/route';

jest.mock('@/lib/contracts/auth', () => ({
  requireAdmin: jest.fn().mockResolvedValue({ userId: 'admin-1', role: 'editor', email: 'x@y.com' }),
}));

jest.mock('@/lib/contracts/service', () => ({
  generateContractDraft: jest.fn().mockResolvedValue({
    status: 'draft',
    pdfUrl: 'https://example.com/draft.pdf',
    hash: 'hash-draft',
    generatedAt: '2026-02-25T20:00:00.000Z',
  }),
}));

describe('POST /api/contracts/draft', () => {
  test('returns draft payload', async () => {
    const req = new Request('http://localhost/api/contracts/draft', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer token',
      },
      body: JSON.stringify({
        templateId: 'c0a80123-4567-4abc-8def-1234567890ab',
        payload: {
          contrato: { ciudad_firma: 'Santiago', fecha_inicio: '2026-03-01' },
          arrendadora: {
            razon_social: 'X', rut: '76123456-7', domicilio: 'D', email: 'x@x.com',
            cuenta: { banco: 'B', tipo: 'C', numero: '1', email_pago: 'p@x.com' },
            personeria: { fecha: 'f', notaria: 'n', ciudad: 'c', notario_nombre: 'z' },
            representante: { nombre: 'r', rut: '12345678-5', nacionalidad: 'cl', estado_civil: 's', profesion: 'p' },
          },
          propietario: { nombre: 'p', rut: '11111111-1' },
          arrendatario: { nombre: 'a', rut: '22222222-2', nacionalidad: 'cl', estado_civil: 's', email: 'a@a.com', domicilio: 'd' },
          inmueble: { condominio: 'c', direccion: 'd', comuna: 'co', ciudad: 'ci' },
          renta: { monto_clp: 1, monto_uf: 1, dia_limite_pago: 5, mes_primer_reajuste: 'Marzo' },
          garantia: { monto_total_clp: 1, pago_inicial_clp: 1, cuotas: [] },
          flags: { hay_aval: false, mascota_permitida: false, depto_amoblado: false },
          declaraciones: { fondos_origen_texto: 'ok' },
        },
      }),
    });

    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.status).toBe('draft');
    expect(data.pdfUrl).toContain('draft');
  });
});
