import { ContractPayloadSchema, type ContractPayload } from '@/schemas/contracts';

export const CONTRACT_WIZARD_STEPS = [
  { key: 'template', title: 'Plantilla', description: 'Selecciona la versión oficial' },
  { key: 'partes', title: 'Partes', description: 'Arrendadora, arrendatario y aval' },
  { key: 'inmueble', title: 'Inmueble y Fechas', description: 'Dirección y vigencia' },
  { key: 'finanzas', title: 'Renta y Garantía', description: 'Montos y cuotas' },
  { key: 'condiciones', title: 'Condiciones', description: 'Flags y declaraciones' },
  { key: 'review', title: 'Revisión', description: 'Validación y emisión' },
] as const;

type WizardStepKey = (typeof CONTRACT_WIZARD_STEPS)[number]['key'];

export type WizardStepFieldMap = Record<WizardStepKey, string[]>;

export const WIZARD_STEP_FIELDS: WizardStepFieldMap = {
  template: [],
  partes: [
    'arrendadora.razon_social',
    'arrendadora.rut',
    'arrendadora.domicilio',
    'arrendadora.email',
    'arrendadora.cuenta.banco',
    'arrendadora.cuenta.tipo',
    'arrendadora.cuenta.numero',
    'arrendadora.cuenta.email_pago',
    'arrendadora.personeria.fecha',
    'arrendadora.personeria.notaria',
    'arrendadora.personeria.ciudad',
    'arrendadora.personeria.notario_nombre',
    'arrendadora.representante.nombre',
    'arrendadora.representante.rut',
    'arrendadora.representante.nacionalidad',
    'arrendadora.representante.estado_civil',
    'arrendadora.representante.profesion',
    'propietario.nombre',
    'propietario.rut',
    'arrendatario.nombre',
    'arrendatario.rut',
    'arrendatario.nacionalidad',
    'arrendatario.estado_civil',
    'arrendatario.email',
    'arrendatario.domicilio',
  ],
  inmueble: [
    'inmueble.condominio',
    'inmueble.direccion',
    'inmueble.comuna',
    'inmueble.ciudad',
    'contrato.ciudad_firma',
    'contrato.fecha_inicio',
    'contrato.fecha_firma',
    'contrato.fecha_termino',
  ],
  finanzas: [
    'renta.monto_clp',
    'renta.monto_uf',
    'renta.dia_limite_pago',
    'renta.mes_primer_reajuste',
    'garantia.monto_total_clp',
    'garantia.pago_inicial_clp',
  ],
  condiciones: [
    'flags.mascota_permitida',
    'flags.depto_amoblado',
    'declaraciones.fondos_origen_texto',
  ],
  review: [],
};

export function createContractWizardDefaultDraft(): ContractPayload {
  return {
    contrato: {
      ciudad_firma: 'Santiago',
      fecha_inicio: '',
      fecha_firma: '',
      fecha_termino: '',
    },
    arrendadora: {
      razon_social: '',
      rut: '',
      domicilio: '',
      email: '',
      cuenta: {
        banco: 'Banco de Chile',
        tipo: 'Cuenta Corriente',
        numero: '',
        email_pago: '',
      },
      personeria: {
        fecha: '',
        notaria: '',
        ciudad: 'Santiago',
        notario_nombre: '',
      },
      representante: {
        nombre: '',
        rut: '',
        nacionalidad: 'Chilena',
        estado_civil: '',
        profesion: '',
      },
    },
    propietario: {
      nombre: '',
      rut: '',
    },
    arrendatario: {
      nombre: '',
      rut: '',
      nacionalidad: 'Chilena',
      estado_civil: '',
      email: '',
      telefono: '',
      domicilio: '',
    },
    aval: {
      nombre: '',
      rut: '',
      nacionalidad: 'Chilena',
      estado_civil: '',
      profesion: '',
      domicilio: '',
      email: '',
    },
    inmueble: {
      condominio: '',
      direccion: '',
      comuna: '',
      ciudad: 'Santiago',
      numero_depto: '',
      numero_casa: '',
    },
    renta: {
      monto_clp: 0,
      monto_uf: 0,
      dia_limite_pago: 5,
      mes_primer_reajuste: 'Marzo',
    },
    garantia: {
      monto_total_clp: 0,
      pago_inicial_clp: 0,
      cuotas: [],
    },
    flags: {
      hay_aval: false,
      mascota_permitida: false,
      depto_amoblado: false,
    },
    declaraciones: {
      fondos_origen_texto: '',
    },
  };
}

function trimString(value: unknown): unknown {
  if (typeof value === 'string') {
    return value.trim();
  }

  if (Array.isArray(value)) {
    return value.map(trimString);
  }

  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const next: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(record)) {
      next[key] = trimString(child);
    }
    return next;
  }

  return value;
}

function normalizeRut(rut: string): string {
  return rut
    .trim()
    .replace(/\./g, '')
    .replace(/\s+/g, '')
    .toUpperCase();
}

function normalizeNumber(value: number): number {
  return Number.isFinite(value) ? value : 0;
}

export function normalizeContractPayload(input: ContractPayload): ContractPayload {
  const trimmed = trimString(input) as ContractPayload;

  return {
    ...trimmed,
    arrendadora: {
      ...trimmed.arrendadora,
      rut: normalizeRut(trimmed.arrendadora.rut),
      representante: {
        ...trimmed.arrendadora.representante,
        rut: normalizeRut(trimmed.arrendadora.representante.rut),
      },
    },
    propietario: {
      ...trimmed.propietario,
      rut: normalizeRut(trimmed.propietario.rut),
    },
    arrendatario: {
      ...trimmed.arrendatario,
      rut: normalizeRut(trimmed.arrendatario.rut),
      telefono: trimmed.arrendatario.telefono || undefined,
    },
    aval: trimmed.aval
      ? {
          ...trimmed.aval,
          rut: normalizeRut(trimmed.aval.rut),
          email: trimmed.aval.email || undefined,
        }
      : undefined,
    renta: {
      ...trimmed.renta,
      monto_clp: normalizeNumber(trimmed.renta.monto_clp),
      monto_uf: normalizeNumber(trimmed.renta.monto_uf),
      dia_limite_pago: normalizeNumber(trimmed.renta.dia_limite_pago),
    },
    garantia: {
      ...trimmed.garantia,
      monto_total_clp: normalizeNumber(trimmed.garantia.monto_total_clp),
      pago_inicial_clp: normalizeNumber(trimmed.garantia.pago_inicial_clp),
      cuotas: trimmed.garantia.cuotas.map((cuota) => ({
        ...cuota,
        monto_clp: normalizeNumber(cuota.monto_clp),
        n: normalizeNumber(cuota.n),
      })),
    },
  };
}

export function prepareContractPayloadForSubmit(input: ContractPayload): ContractPayload {
  const normalized = normalizeContractPayload(input);
  if (!normalized.flags.hay_aval) {
    const withoutAval = { ...normalized };
    delete withoutAval.aval;
    return withoutAval;
  }
  return normalized;
}

export function isGuaranteeTotalCoherent(payload: ContractPayload): {
  coherent: boolean;
  difference: number;
} {
  const cuotasSum = payload.garantia.cuotas.reduce((acc, cuota) => acc + (cuota.monto_clp || 0), 0);
  const computed = (payload.garantia.pago_inicial_clp || 0) + cuotasSum;
  const difference = computed - (payload.garantia.monto_total_clp || 0);
  return {
    coherent: Math.abs(difference) <= 1,
    difference,
  };
}

export function getDefaultContractEndDate(fechaInicio: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaInicio)) {
    return '';
  }
  const [year, month, day] = fechaInicio.split('-').map((value) => Number(value));
  const date = new Date(Date.UTC(year + 1, month - 1, day));
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(date.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function formatContractPayloadJson(payload: ContractPayload): string {
  return JSON.stringify(payload, null, 2);
}

export function parseContractPayloadJson(input: string):
  | { ok: true; payload: ContractPayload }
  | { ok: false; message: string } {
  try {
    const parsed = JSON.parse(input) as unknown;
    const validated = ContractPayloadSchema.safeParse(parsed);
    if (!validated.success) {
      const firstError = validated.error.errors[0];
      return {
        ok: false,
        message: firstError?.message ?? 'JSON inválido para payload de contrato',
      };
    }
    return { ok: true, payload: validated.data };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'JSON inválido';
    return { ok: false, message };
  }
}
