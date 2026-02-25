import { applyPayloadDefaults, validateBusinessRules } from '@/lib/contracts/validation';

const payload: any = {
  contrato: { ciudad_firma: 'Santiago', fecha_inicio: '2026-03-01' },
  arrendadora: {
    razon_social: 'A', rut: '12345678-5', domicilio: 'X', email: 'a@a.com',
    cuenta: { banco: 'b', tipo: 'c', numero: '1', email_pago: 'p@a.com' },
    personeria: { fecha: 'x', notaria: 'n', ciudad: 'c', notario_nombre: 'z' },
    representante: { nombre: 'r', rut: '11111111-1', nacionalidad: 'cl', estado_civil: 's', profesion: 'p' },
  },
  propietario: { nombre: 'p', rut: '11111111-1' },
  arrendatario: { nombre: 'a', rut: '12345678-5', nacionalidad: 'cl', estado_civil: 's', email: 'u@u.com', domicilio: 'd' },
  inmueble: { condominio: 'c', direccion: 'd', comuna: 'co', ciudad: 'ci' },
  renta: { monto_clp: 650000, monto_uf: 16.5, dia_limite_pago: 5, mes_primer_reajuste: 'Marzo' },
  garantia: { monto_total_clp: 650000, pago_inicial_clp: 650000, cuotas: [] },
  flags: { hay_aval: false, mascota_permitida: false, depto_amoblado: false },
  declaraciones: { fondos_origen_texto: 'ok', fondos_origen_fuente: 'Remuneraciones por trabajo dependiente' },
};

describe('Business validation', () => {
  test('applies default dates', () => {
    const out = applyPayloadDefaults(payload);
    expect(out.contrato.fecha_firma).toBeDefined();
    expect(out.contrato.fecha_termino).toBe('2027-03-01');
  });

  test('valid payload passes', () => {
    const out = applyPayloadDefaults(payload);
    expect(() => validateBusinessRules(out)).not.toThrow();
  });

  test('auto guarantee total is forced to renta monto', () => {
    const out = applyPayloadDefaults({
      ...payload,
      garantia: {
        monto_total_clp: 700000,
        pago_inicial_clp: 200000,
        cuotas: [{ monto_clp: 200000, n: 1 }],
      },
    });
    expect(out.garantia.monto_total_clp).toBe(out.renta.monto_clp);
    expect(() => validateBusinessRules(out)).not.toThrow();
  });

  test('invalid renta still fails', () => {
    const out = applyPayloadDefaults({
      ...payload,
      renta: {
        ...payload.renta,
        monto_clp: 0,
      },
    });
    expect(() => validateBusinessRules(out)).toThrow();
  });

  test('rejects same company/personal rut even with different format', () => {
    const out = applyPayloadDefaults({
      ...payload,
      arrendadora: {
        ...payload.arrendadora,
        rut: '12.345.678-5',
        representante: {
          ...payload.arrendadora.representante,
          rut: '123456785',
        },
      },
    });

    expect(() => validateBusinessRules(out)).toThrow(
      'RUT de representante legal debe ser personal y distinto al RUT de la arrendadora'
    );
  });
});
