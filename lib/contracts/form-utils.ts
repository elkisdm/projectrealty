import { ContractPayloadSchema, type ContractPayload } from '@/schemas/contracts';

export type UnidadTipo = 'departamento' | 'casa';

interface AutoRuleOptions {
  unidadTipo?: UnidadTipo;
  firmaOnline?: boolean;
  autoDeclaration?: boolean;
}

export const CONTRACT_WIZARD_STEPS = [
  { key: 'template', title: 'Plantilla', description: 'Selecciona la versión oficial' },
  { key: 'partes', title: 'Partes', description: 'Figuras y representación legal' },
  { key: 'inmueble', title: 'Inmueble y Fechas', description: 'Dirección y vigencia' },
  { key: 'finanzas', title: 'Renta y Garantía', description: 'Montos y cuotas' },
  { key: 'condiciones', title: 'Condiciones', description: 'Flags y declaraciones' },
  { key: 'review', title: 'Revisión', description: 'Validación y emisión' },
] as const;

type WizardStepKey = (typeof CONTRACT_WIZARD_STEPS)[number]['key'];
type Genero = ContractPayload['arrendatario']['genero'];

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
    'arrendadora.representante.genero',
    'arrendadora.representante.nacionalidad',
    'arrendadora.representante.estado_civil',
    'arrendadora.representante.profesion',
    'propietario.nombre',
    'propietario.rut',
    'arrendatario.nombre',
    'arrendatario.rut',
    'arrendatario.genero',
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
    'contrato.tipo',
    'subarriendo.permitido',
    'subarriendo.propietario_autoriza',
    'subarriendo.notificacion_obligatoria',
    'subarriendo.plazo_notificacion_habiles',
    'subarriendo.permite_multiples',
    'subarriendo.periodo_vacancia',
    'subarriendo.referencia_legal',
    'subarriendo.autorizacion_texto',
    'subarriendo.responsabilidad_principal',
    'flags.mascota_permitida',
    'flags.depto_amoblado',
    'declaraciones.fondos_origen_texto',
  ],
  review: [],
};

export function getStepFieldsForContractType(
  stepKey: WizardStepKey,
  contractType: ContractPayload['contrato']['tipo'],
  options?: { hayAval?: boolean; firmaOnline?: boolean }
): string[] {
  if (stepKey === 'template' || stepKey === 'review') return [];

  if (contractType !== 'subarriendo_propietario') {
    const base = [...WIZARD_STEP_FIELDS[stepKey]];
    if (stepKey === 'partes' && options?.hayAval) {
      base.push(
        'aval.nombre',
        'aval.rut',
        'aval.nacionalidad',
        'aval.estado_civil',
        'aval.profesion',
        'aval.domicilio'
      );
    }
    if (stepKey === 'partes' && options?.firmaOnline) {
      const excluded = new Set([
        'arrendadora.personeria.notaria',
        'arrendadora.personeria.ciudad',
        'arrendadora.personeria.notario_nombre',
      ]);
      return base.filter((field) => !excluded.has(field));
    }
    return base;
  }

  if (stepKey === 'partes') {
    return [
      'arrendadora.tipo_persona',
      'arrendadora.razon_social',
      'arrendadora.rut',
      'arrendadora.nacionalidad',
      'arrendadora.estado_civil',
      'arrendadora.profesion',
      'arrendadora.domicilio',
      'arrendadora.email',
      'arrendatario.tipo_persona',
      'arrendatario.nombre',
      'arrendatario.rut',
      'arrendatario.domicilio',
      'arrendatario.email',
      'arrendatario.representante_legal.nombre',
      'arrendatario.representante_legal.rut',
      'arrendatario.representante_legal.nacionalidad',
      'arrendatario.representante_legal.estado_civil',
      'arrendatario.representante_legal.profesion',
      'arrendatario.representante_legal.domicilio',
      'arrendatario.representante_legal.email',
    ];
  }

  if (stepKey === 'inmueble') {
    return [
      'inmueble.condominio',
      'inmueble.direccion',
      'inmueble.comuna',
      'inmueble.ciudad',
      'contrato.ciudad_firma',
      'contrato.fecha_inicio',
      'contrato.fecha_firma',
      'contrato.fecha_termino',
      'contrato.aviso_termino_dias',
    ];
  }

  if (stepKey === 'finanzas') {
    return [
      'renta.porcentaje_subarriendo',
      'renta.dia_limite_pago',
      'renta.monto_clp',
      'renta.monto_uf',
    ];
  }

  if (stepKey === 'condiciones') {
    return [
      'contrato.tipo',
      'subarriendo.permitido',
      'subarriendo.propietario_autoriza',
      'subarriendo.notificacion_obligatoria',
      'subarriendo.plazo_notificacion_habiles',
      'subarriendo.permite_multiples',
      'subarriendo.periodo_vacancia',
      'subarriendo.referencia_legal',
      'subarriendo.autorizacion_texto',
      'subarriendo.responsabilidad_principal',
    ];
  }

  return [];
}

const SPANISH_MONTHS = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

export function createContractWizardDefaultDraft(): ContractPayload {
  return {
    contrato: {
      ciudad_firma: 'Santiago',
      tipo: 'standard',
      aviso_termino_dias: 60,
      fecha_inicio: '',
      fecha_firma: '',
      fecha_termino: '',
    },
    arrendadora: {
      tipo_persona: 'juridica',
      razon_social: '',
      rut: '',
      nacionalidad: 'Chilena',
      estado_civil: 'Soltera',
      profesion: '',
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
        genero: undefined,
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
      tipo_persona: 'natural',
      nombre: '',
      rut: '',
      genero: undefined,
      nacionalidad: 'Chilena',
      estado_civil: '',
      email: '',
      telefono: '',
      domicilio: '',
      representante_legal: {
        nombre: '',
        rut: '',
        genero: undefined,
        nacionalidad: 'Chilena',
        estado_civil: '',
        profesion: '',
        domicilio: '',
        email: '',
      },
    },
    aval: {
      nombre: '',
      rut: '',
      genero: undefined,
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
      porcentaje_subarriendo: 91,
      dia_limite_pago: 5,
      mes_primer_reajuste: 'Marzo',
    },
    garantia: {
      monto_total_clp: 0,
      pago_inicial_clp: 0,
      cuotas: [],
    },
    subarriendo: {
      permitido: false,
      propietario_autoriza: false,
      notificacion_obligatoria: true,
      plazo_notificacion_habiles: 2,
      permite_multiples: true,
      periodo_vacancia: false,
      referencia_legal: 'Artículo 1946 del Código Civil.',
      autorizacion_texto:
        'La parte arrendataria no podrá subarrendar total o parcialmente el inmueble sin autorización previa y expresa del propietario.',
      responsabilidad_principal:
        'En todo caso, la parte arrendataria mantendrá responsabilidad directa y principal frente a la arrendadora por todas las obligaciones del contrato.',
    },
    flags: {
      hay_aval: false,
      mascota_permitida: false,
      depto_amoblado: false,
    },
    declaraciones: {
      fondos_origen_texto: '',
      fondos_origen_fuente: 'Remuneraciones por trabajo dependiente',
    },
  };
}

function trimString(value: unknown): unknown {
  if (typeof value === 'string') {
    return value.trim().normalize('NFC');
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

function normalizeNumber(value: number): number {
  return Number.isFinite(value) ? value : 0;
}

function sanitizeRutInput(value: string): string {
  return value.toUpperCase().replace(/[^0-9K]/g, '');
}

function normalizeRutBodyAndDv(value: string): { body: string; dv: string } | null {
  const sanitized = sanitizeRutInput(value);
  if (sanitized.length < 2) return null;

  const dv = sanitized.slice(-1);
  const body = sanitized.slice(0, -1).replace(/[^0-9]/g, '');
  if (!body) return null;

  return { body, dv };
}

function formatBodyWithDots(body: string): string {
  return body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function normalizeFundsSource(value: string | undefined): string {
  const fallback = 'Remuneraciones por trabajo dependiente';
  const source = (value ?? '').trim().normalize('NFC');
  if (!source) return fallback;

  const sourceFolded = source
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();

  // Guard against pasting the full declaration text in the source field.
  if (
    source.length > 180 ||
    sourceFolded.includes('DECLARACION DE ORIGEN DE FONDOS') ||
    sourceFolded.includes('DECLARACION DE ORIGEN DE ORIGEN DE FONDOS') ||
    /[\r\n]/.test(source)
  ) {
    return fallback;
  }

  return source.replace(/\s+/g, ' ').replace(/[.;:\s]+$/, '');
}

export function formatRutForDisplay(value: string): string {
  const normalized = normalizeRutBodyAndDv(value);
  if (!normalized) return sanitizeRutInput(value);

  return `${formatBodyWithDots(normalized.body)}-${normalized.dv}`;
}

export function normalizeRutForValidation(value: string): string {
  const normalized = normalizeRutBodyAndDv(value);
  if (!normalized) return value.trim().toUpperCase();
  return `${normalized.body}-${normalized.dv}`;
}

export function formatCLPInput(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return '';
  return Math.round(value).toLocaleString('es-CL');
}

export function parseCLPInput(value: string | number): number {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? Math.round(value) : 0;
  }

  const cleaned = value.replace(/[^\d-]/g, '');
  if (!cleaned) return 0;
  const parsed = Number(cleaned);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.round(parsed));
}

export function getTodayChileISODate(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Santiago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
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

export function addMonthsToISODate(dateISO: string, monthsToAdd: number): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateISO)) return '';
  const [year, month, day] = dateISO.split('-').map((value) => Number(value));
  const next = new Date(Date.UTC(year, month - 1 + monthsToAdd, day));
  const yyyy = next.getUTCFullYear();
  const mm = String(next.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(next.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function formatSpanishLongDate(dateISO: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateISO)) {
    return formatSpanishLongDate(getTodayChileISODate());
  }
  const [year, month, day] = dateISO.split('-').map((value) => Number(value));
  const monthName = SPANISH_MONTHS[Math.max(0, Math.min(11, month - 1))];
  return `${day} de ${monthName} de ${year}`;
}

function resolveUnitLabel(payload: ContractPayload): string {
  if (payload.inmueble.numero_depto?.trim()) {
    return `Departamento ${payload.inmueble.numero_depto.trim()}`;
  }
  if (payload.inmueble.numero_casa?.trim()) {
    return `Casa ${payload.inmueble.numero_casa.trim()}`;
  }
  return 'Departamento';
}

function getTratamiento(genero: Genero): string {
  if (genero === 'masculino') return 'Sr.';
  if (genero === 'femenino') return 'Sra.';
  return 'Sr./Sra.';
}

function getDomiciliado(genero: Genero): string {
  if (genero === 'masculino') return 'domiciliado';
  if (genero === 'femenino') return 'domiciliada';
  return 'domiciliado/a';
}

export function generateFundsOriginDeclaration(payload: ContractPayload): string {
  const fechaFirma = payload.contrato.fecha_firma || getTodayChileISODate();
  const fechaLarga = formatSpanishLongDate(fechaFirma);
  const fuente = normalizeFundsSource(
    payload.declaraciones.fondos_origen_fuente ?? payload.declaraciones.fondos_origen_texto
  );
  const unidadLabel = resolveUnitLabel(payload);
  const domicilio = payload.arrendatario.domicilio?.trim() || payload.inmueble.direccion;
  const tratamiento = getTratamiento(payload.arrendatario.genero);
  const domiciliado = getDomiciliado(payload.arrendatario.genero);

  return [
    'DECLARACIÓN DE ORIGEN DE ORIGEN DE FONDOS PARA PAGOS ASOCIADOS AL CONTRATO DE ARRENDAMIENTO',
    '',
    `En Santiago de Chile, a ${fechaLarga}, ${tratamiento} ${payload.arrendatario.nombre}, ${payload.arrendatario.nacionalidad}, ${payload.arrendatario.estado_civil}, cédula de identidad número ${payload.arrendatario.rut}, ${domiciliado} en ${domicilio}, ${unidadLabel}, ${payload.inmueble.comuna}, certifico y declaro lo siguiente:`,
    '1. Que respecto al inmueble arrendado ubicado en '
      + `${payload.inmueble.direccion}, comuna de ${payload.inmueble.comuna}, ${unidadLabel}, `
      + 'los fondos con los cuales pagaré mensualmente las rentas y obligaciones económicas provienen de: '
      + `${fuente}.`,
    '2. Que los fondos con los cuales pagaré mensualmente las rentas de arrendamiento y obligaciones económicas, '
      + 'los he adquirido por medios lícitos, producto de ingresos que no provienen, directa ni indirectamente, '
      + 'de actividades ilícitas que constituyan alguno de los delitos contemplados en la Ley Nº 19.913, que crea la Unidad de Análisis Financiero, '
      + 'que previenen la comisión de delitos de lavado y blanqueo de activos y financiamiento al terrorismo, '
      + 'o de la ley que en el futuro la sustituya o reemplace.',
    '3. Asimismo, declaro que he pagado o declarado o que pagaré y declararé los impuestos correspondientes '
      + 'respecto de los fondos con que pagaré las rentas.',
    `4. Mediante la firma de este documento, declaro asumir completa responsabilidad por la veracidad de la información entregada y eximo a ${payload.arrendadora.razon_social} de toda responsabilidad que se derive de información errónea, falsa o inexacta que hubiere proporcionado en este documento.`,
  ].join('\n');
}

export function computeAutomaticGuaranteeSchedule(input: {
  montoTotalClp: number;
  pagoInicialClp: number;
  fechaInicio: string;
}) {
  const total = Math.max(0, Math.round(input.montoTotalClp));
  const pagoInicial = Math.max(0, Math.min(total, Math.round(input.pagoInicialClp)));
  const restante = total - pagoInicial;

  if (restante <= 0) {
    return {
      monto_total_clp: total,
      pago_inicial_clp: pagoInicial,
      cuotas: [] as ContractPayload['garantia']['cuotas'],
    };
  }

  const cuota1 = Math.floor(restante / 2);
  const cuota2 = restante - cuota1;
  const fechaCuota1 = addMonthsToISODate(input.fechaInicio, 1);
  const fechaCuota2 = addMonthsToISODate(input.fechaInicio, 2);

  return {
    monto_total_clp: total,
    pago_inicial_clp: pagoInicial,
    cuotas: [
      { monto_clp: cuota1, n: 1, fecha: fechaCuota1 || undefined },
      { monto_clp: cuota2, n: 2, fecha: fechaCuota2 || undefined },
    ] as ContractPayload['garantia']['cuotas'],
  };
}

export function normalizeContractPayload(input: ContractPayload): ContractPayload {
  const trimmed = trimString(input) as ContractPayload;
  const contractType =
    trimmed.contrato.tipo === 'subarriendo_propietario' ? 'subarriendo_propietario' : 'standard';

  return {
    ...trimmed,
    contrato: {
      ...trimmed.contrato,
      tipo: contractType,
      aviso_termino_dias: normalizeNumber(trimmed.contrato.aviso_termino_dias ?? 60),
    },
    arrendadora: {
      ...trimmed.arrendadora,
      tipo_persona: trimmed.arrendadora.tipo_persona ?? 'juridica',
      rut: formatRutForDisplay(trimmed.arrendadora.rut),
      representante: {
        ...trimmed.arrendadora.representante,
        rut: formatRutForDisplay(trimmed.arrendadora.representante.rut ?? ''),
      },
    },
    propietario: {
      ...trimmed.propietario,
      rut: formatRutForDisplay(trimmed.propietario.rut),
    },
    arrendatario: {
      ...trimmed.arrendatario,
      tipo_persona: trimmed.arrendatario.tipo_persona ?? 'natural',
      rut: formatRutForDisplay(trimmed.arrendatario.rut),
      telefono: trimmed.arrendatario.telefono || undefined,
      representante_legal: trimmed.arrendatario.representante_legal
        ? {
            ...trimmed.arrendatario.representante_legal,
            rut: formatRutForDisplay(trimmed.arrendatario.representante_legal.rut),
            email: trimmed.arrendatario.representante_legal.email || undefined,
          }
        : undefined,
    },
    aval: trimmed.aval
      ? {
          ...trimmed.aval,
          rut: formatRutForDisplay(trimmed.aval.rut),
          email: trimmed.aval.email || undefined,
        }
      : undefined,
    renta: {
      ...trimmed.renta,
      monto_clp: normalizeNumber(trimmed.renta.monto_clp),
      monto_uf: normalizeNumber(trimmed.renta.monto_uf),
      porcentaje_subarriendo: normalizeNumber(trimmed.renta.porcentaje_subarriendo ?? 91),
      dia_limite_pago: normalizeNumber(trimmed.renta.dia_limite_pago),
    },
    garantia: {
      ...trimmed.garantia,
      monto_total_clp: normalizeNumber(trimmed.garantia.monto_total_clp),
      pago_inicial_clp: normalizeNumber(trimmed.garantia.pago_inicial_clp),
      cuotas: (trimmed.garantia.cuotas ?? []).map((cuota) => ({
        ...cuota,
        monto_clp: normalizeNumber(cuota.monto_clp),
        n: normalizeNumber(cuota.n),
      })),
    },
    subarriendo: {
      ...createContractWizardDefaultDraft().subarriendo,
      ...(trimmed.subarriendo ?? {}),
      plazo_notificacion_habiles: normalizeNumber(
        trimmed.subarriendo?.plazo_notificacion_habiles
          ?? createContractWizardDefaultDraft().subarriendo?.plazo_notificacion_habiles
          ?? 0
      ),
    },
    declaraciones: {
      ...trimmed.declaraciones,
      fondos_origen_fuente: normalizeFundsSource(trimmed.declaraciones.fondos_origen_fuente),
    },
  };
}

export function applyAutomaticContractRules(
  input: ContractPayload,
  options: AutoRuleOptions = {}
): ContractPayload {
  const normalized = normalizeContractPayload(input);
  const isOwnerSublease = normalized.contrato.tipo === 'subarriendo_propietario';
  const unidadTipo = options.unidadTipo ?? 'departamento';

  const adjustedInmueble = {
    ...normalized.inmueble,
    numero_depto: unidadTipo === 'departamento' ? normalized.inmueble.numero_depto || '' : '',
    numero_casa: unidadTipo === 'casa' ? normalized.inmueble.numero_casa || '' : '',
  };

  const garantiaTotal = normalized.renta.monto_clp;
  const guarantee = computeAutomaticGuaranteeSchedule({
    montoTotalClp: garantiaTotal,
    pagoInicialClp: normalized.garantia.pago_inicial_clp,
    fechaInicio: normalized.contrato.fecha_inicio,
  });

  const withAutoRules: ContractPayload = {
    ...normalized,
    inmueble: adjustedInmueble,
    garantia: {
      ...normalized.garantia,
      ...guarantee,
    },
    subarriendo: isOwnerSublease
      ? {
          ...normalized.subarriendo,
          permitido: true,
          propietario_autoriza: true,
          notificacion_obligatoria: true,
          plazo_notificacion_habiles:
            normalized.subarriendo?.plazo_notificacion_habiles && normalized.subarriendo.plazo_notificacion_habiles > 0
              ? normalized.subarriendo.plazo_notificacion_habiles
              : 2,
          autorizacion_texto:
            normalized.subarriendo?.autorizacion_texto
            || 'El propietario autoriza expresamente el subarriendo total o parcial del inmueble, sujeto a las condiciones establecidas en esta cláusula.',
          responsabilidad_principal:
            normalized.subarriendo?.responsabilidad_principal
            || 'La parte arrendataria mantendrá responsabilidad principal y solidaria frente a la arrendadora por cualquier obligación contractual, incluso en caso de subarriendo.',
          referencia_legal:
            normalized.subarriendo?.referencia_legal
            || 'Artículo 1946 del Código Civil.',
        }
      : {
          ...normalized.subarriendo,
          permitido: false,
          propietario_autoriza: false,
          notificacion_obligatoria: true,
          plazo_notificacion_habiles:
            normalized.subarriendo?.plazo_notificacion_habiles && normalized.subarriendo.plazo_notificacion_habiles > 0
              ? normalized.subarriendo.plazo_notificacion_habiles
              : 10,
          autorizacion_texto:
            normalized.subarriendo?.autorizacion_texto
            || 'La parte arrendataria no podrá subarrendar total o parcialmente el inmueble sin autorización previa y expresa del propietario.',
          responsabilidad_principal:
            normalized.subarriendo?.responsabilidad_principal
            || 'En todo caso, la parte arrendataria mantendrá responsabilidad directa y principal frente a la arrendadora por todas las obligaciones del contrato.',
          referencia_legal:
            normalized.subarriendo?.referencia_legal
            || 'Artículo 1946 del Código Civil.',
        },
  };

  if (options.firmaOnline) {
    withAutoRules.arrendadora = {
      ...withAutoRules.arrendadora,
      personeria: {
        ...withAutoRules.arrendadora.personeria,
        notaria: 'No aplica (firma online)',
        ciudad: withAutoRules.contrato.ciudad_firma || 'Santiago',
        notario_nombre: 'No aplica (firma online)',
      },
    };
  }

  if (options.autoDeclaration !== false) {
    withAutoRules.declaraciones = {
      ...withAutoRules.declaraciones,
      fondos_origen_texto: generateFundsOriginDeclaration(withAutoRules),
    };
  }

  if (isOwnerSublease) {
    withAutoRules.flags = {
      ...withAutoRules.flags,
      hay_aval: false,
    };

    withAutoRules.arrendadora = {
      ...withAutoRules.arrendadora,
      tipo_persona: withAutoRules.arrendadora.tipo_persona ?? 'natural',
    };

    withAutoRules.arrendatario = {
      ...withAutoRules.arrendatario,
      tipo_persona: 'juridica',
      representante_legal: withAutoRules.arrendatario.representante_legal ?? {
        nombre: withAutoRules.arrendatario.nombre,
        rut: withAutoRules.arrendatario.rut,
        genero: withAutoRules.arrendatario.genero,
        nacionalidad: withAutoRules.arrendatario.nacionalidad || 'Chilena',
        estado_civil: withAutoRules.arrendatario.estado_civil || 'Soltero/a',
        profesion: 'Representante legal',
        domicilio: withAutoRules.arrendatario.domicilio,
        email: withAutoRules.arrendatario.email,
      },
    };

    withAutoRules.propietario = {
      nombre: withAutoRules.arrendadora.razon_social,
      rut: withAutoRules.arrendadora.rut,
    };
    withAutoRules.contrato.aviso_termino_dias = withAutoRules.contrato.aviso_termino_dias || 30;
  }

  return withAutoRules;
}

export function prepareContractPayloadForSubmit(
  input: ContractPayload,
  options: AutoRuleOptions = {}
): ContractPayload {
  const withRules = applyAutomaticContractRules(input, options);

  if (!withRules.flags.hay_aval) {
    const withoutAval = { ...withRules };
    delete withoutAval.aval;
    return withoutAval;
  }

  return withRules;
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
