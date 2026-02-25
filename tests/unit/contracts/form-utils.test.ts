import type { ContractPayload } from '@/schemas/contracts';
import {
  createContractWizardDefaultDraft,
  formatContractPayloadJson,
  getDefaultContractEndDate,
  isGuaranteeTotalCoherent,
  parseContractPayloadJson,
  prepareContractPayloadForSubmit,
} from '@/lib/contracts/form-utils';

function buildPayload(overrides?: Partial<ContractPayload>): ContractPayload {
  return {
    ...createContractWizardDefaultDraft(),
    contrato: {
      ciudad_firma: 'Santiago',
      fecha_inicio: '2026-03-01',
      fecha_firma: '2026-02-25',
      fecha_termino: '2027-03-01',
      ...(overrides?.contrato ?? {}),
    },
    arrendadora: {
      razon_social: 'Hommie SpA',
      rut: '76.123.456-7',
      domicilio: 'Providencia 123',
      email: 'arrendadora@hommie.cl',
      cuenta: {
        banco: 'Banco de Chile',
        tipo: 'Cuenta Corriente',
        numero: '00123123',
        email_pago: 'pagos@hommie.cl',
      },
      personeria: {
        fecha: '2026-01-01',
        notaria: 'Notaria Demo',
        ciudad: 'Santiago',
        notario_nombre: 'Notario Demo',
      },
      representante: {
        nombre: 'Maria Perez',
        rut: '12.345.678-5',
        nacionalidad: 'Chilena',
        estado_civil: 'Soltera',
        profesion: 'Ingeniera',
      },
      ...(overrides?.arrendadora ?? {}),
    },
    propietario: {
      nombre: 'Pedro Soto',
      rut: '11.111.111-1',
      ...(overrides?.propietario ?? {}),
    },
    arrendatario: {
      nombre: 'Carlos Diaz',
      rut: '22.222.222-2',
      nacionalidad: 'Chilena',
      estado_civil: 'Soltero',
      email: 'carlos@correo.cl',
      telefono: '+56912345678',
      domicilio: 'Calle 123',
      ...(overrides?.arrendatario ?? {}),
    },
    aval: {
      nombre: 'Ana Aval',
      rut: '16.161.616-k',
      nacionalidad: 'Chilena',
      estado_civil: 'Casada',
      profesion: 'Abogada',
      domicilio: 'Otro 456',
      email: 'aval@correo.cl',
      ...(overrides?.aval ?? {}),
    },
    inmueble: {
      condominio: 'Condominio Demo',
      direccion: 'Direccion 123',
      comuna: 'Providencia',
      ciudad: 'Santiago',
      numero_depto: '1201',
      numero_casa: '',
      ...(overrides?.inmueble ?? {}),
    },
    renta: {
      monto_clp: 650000,
      monto_uf: 16.5,
      dia_limite_pago: 5,
      mes_primer_reajuste: 'Marzo',
      ...(overrides?.renta ?? {}),
    },
    garantia: {
      monto_total_clp: 365000,
      pago_inicial_clp: 109500,
      cuotas: [
        { monto_clp: 127750, n: 1 },
        { monto_clp: 127750, n: 2 },
      ],
      ...(overrides?.garantia ?? {}),
    },
    flags: {
      hay_aval: true,
      mascota_permitida: false,
      depto_amoblado: false,
      ...(overrides?.flags ?? {}),
    },
    declaraciones: {
      fondos_origen_texto: 'Remuneraciones por trabajo dependiente',
      ...(overrides?.declaraciones ?? {}),
    },
  };
}

describe('contracts/form-utils', () => {
  test('returns default contract end date (+1 year)', () => {
    expect(getDefaultContractEndDate('2026-03-01')).toBe('2027-03-01');
  });

  test('checks guarantee coherence with tolerance', () => {
    const payload = buildPayload();
    expect(isGuaranteeTotalCoherent(payload).coherent).toBe(true);

    const broken = buildPayload({
      garantia: {
        monto_total_clp: 500000,
        pago_inicial_clp: 109500,
        cuotas: [{ monto_clp: 100000, n: 1 }],
      },
    });
    expect(isGuaranteeTotalCoherent(broken).coherent).toBe(false);
  });

  test('removes aval when hay_aval=false and normalizes RUT', () => {
    const payload = buildPayload({
      flags: { hay_aval: false, mascota_permitida: false, depto_amoblado: false },
    });

    const prepared = prepareContractPayloadForSubmit(payload);
    expect(prepared.aval).toBeUndefined();
    expect(prepared.arrendadora.rut).toBe('76123456-7');
    expect(prepared.arrendadora.representante.rut).toBe('12345678-5');
  });

  test('syncs JSON parse/apply with schema validation', () => {
    const payload = buildPayload();
    const json = formatContractPayloadJson(payload);
    const parsed = parseContractPayloadJson(json);
    expect(parsed.ok).toBe(true);

    const invalid = parseContractPayloadJson('{"foo": "bar"}');
    expect(invalid.ok).toBe(false);
  });
});
