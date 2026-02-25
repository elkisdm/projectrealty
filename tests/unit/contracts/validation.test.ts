import { applyPayloadDefaults, validateBusinessRules } from '@/lib/contracts/validation';

const payload: any = {
  contrato: { ciudad_firma: 'Santiago', fecha_inicio: '2026-03-01' },
  arrendadora: {
    razon_social: 'A', rut: '12345678-5', domicilio: 'X', email: 'a@a.com',
    cuenta: { banco: 'b', tipo: 'c', numero: '1', email_pago: 'p@a.com' },
    personeria: { fecha: 'x', notaria: 'n', ciudad: 'c', notario_nombre: 'z' },
    representante: { nombre: 'r', rut: '12345678-5', nacionalidad: 'cl', estado_civil: 's', profesion: 'p' },
  },
  propietario: { nombre: 'p', rut: '11111111-1' },
  arrendatario: { nombre: 'a', rut: '12345678-5', nacionalidad: 'cl', estado_civil: 's', email: 'u@u.com', domicilio: 'd' },
  inmueble: { condominio: 'c', direccion: 'd', comuna: 'co', ciudad: 'ci' },
  renta: { monto_clp: 650000, monto_uf: 16.5, dia_limite_pago: 5, mes_primer_reajuste: 'Marzo' },
  garantia: { monto_total_clp: 650000, pago_inicial_clp: 650000, cuotas: [] },
  flags: { hay_aval: false, mascota_permitida: false, depto_amoblado: false },
  declaraciones: { fondos_origen_texto: 'ok' },
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

  test('invalid guarantee sum fails', () => {
    const out = applyPayloadDefaults({
      ...payload,
      garantia: {
        monto_total_clp: 700000,
        pago_inicial_clp: 200000,
        cuotas: [{ monto_clp: 200000, n: 1 }],
      },
    });
    expect(() => validateBusinessRules(out)).toThrow();
  });
});
