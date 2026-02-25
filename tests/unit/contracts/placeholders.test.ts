import { buildReplacements } from '@/lib/contracts/placeholders';
import { createContractWizardDefaultDraft, prepareContractPayloadForSubmit } from '@/lib/contracts/form-utils';

function payload() {
  return prepareContractPayloadForSubmit({
    ...createContractWizardDefaultDraft(),
    contrato: {
      ciudad_firma: 'Santiago',
      fecha_firma: '2026-02-26',
      fecha_inicio: '2026-03-01',
      fecha_termino: '2027-03-01',
    },
    arrendadora: {
      razon_social: 'Asesorias DAC',
      rut: '781134996',
      domicilio: 'Av. Vicuna Mackenna 1',
      email: 'dac@dac.cl',
      cuenta: {
        banco: 'Banco de Chile',
        tipo: 'Cuenta Corriente',
        numero: '00-123',
        email_pago: 'pagos@dac.cl',
      },
      personeria: {
        fecha: '2026-02-26',
        notaria: 'No aplica (firma online)',
        ciudad: 'Santiago',
        notario_nombre: 'No aplica (firma online)',
      },
      representante: {
        nombre: 'Marianny Mujica',
        rut: '268657711',
        nacionalidad: 'Venezolana',
        estado_civil: 'Soltera',
        profesion: 'Empresaria',
      },
    },
    propietario: {
      nombre: 'Marianella Iriarte',
      rut: '256053691',
    },
    arrendatario: {
      nombre: 'Pen\u0303a Soto',
      rut: '121397560',
      nacionalidad: 'Chilena',
      estado_civil: 'Soltero',
      email: 'arr@mail.cl',
      telefono: '+569',
      domicilio: 'Parcela Santa Ana',
    },
    aval: {
      nombre: 'Agustin',
      rut: '225426821',
      nacionalidad: 'Chilena',
      estado_civil: 'Soltero',
      profesion: 'Estudiante',
      domicilio: 'Macul',
      email: 'aval@mail.cl',
    },
    inmueble: {
      condominio: 'Parque Mackenna',
      direccion: 'Av. Vicuna Mackenna 4192',
      comuna: 'Macul',
      ciudad: 'Santiago',
      numero_depto: '305',
      numero_casa: '',
    },
    renta: {
      monto_clp: 400000,
      monto_uf: 10.06,
      dia_limite_pago: 5,
      mes_primer_reajuste: 'Marzo',
    },
    garantia: {
      monto_total_clp: 400000,
      pago_inicial_clp: 100000,
      cuotas: [],
    },
    flags: {
      hay_aval: true,
      mascota_permitida: false,
      depto_amoblado: false,
    },
    declaraciones: {
      fondos_origen_fuente: 'Remuneraciones por trabajo dependiente',
      fondos_origen_texto: 'DECLARACION DE ORIGEN DE FONDOS...',
    },
  });
}

describe('contracts/placeholders', () => {
  test('formats contract dates and keeps n with tilde', () => {
    const replacements = buildReplacements(payload());
    expect(replacements['[[CONTRATO.FECHA_FIRMA]]']).toBe('26 de febrero de 2026');
    expect(replacements['[[ARRENDATARIO.NOMBRE]]']).toBe('Peña Soto');
  });

  test('uses source text placeholder for funds source and supports derived placeholders', () => {
    const replacements = buildReplacements(payload());
    expect(replacements['[[DECLARACIONES.FONDOS_ORIGEN_TEXTO]]']).toBe(
      'Remuneraciones por trabajo dependiente'
    );
    expect(replacements['[[INMUEBLE.UNIDAD_LABEL]]']).toBe('Departamento 305');
    expect(replacements['[[GARANTIA.CUOTA_1_MONTO_CLP]]']).toBe('$150.000');
  });
});

