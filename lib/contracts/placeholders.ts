import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { ContractPayload } from '@/schemas/contracts';
import { ContractError } from './errors';
import { formatCLP, formatDateForContract, formatUF } from './utils';

interface PlaceholderCatalog {
  allowed: string[];
  required: string[];
}

type Genero = 'masculino' | 'femenino' | undefined;

let cachedCatalog: PlaceholderCatalog | null = null;

function getCatalog(): PlaceholderCatalog {
  if (cachedCatalog) return cachedCatalog;
  const path = join(process.cwd(), 'config/contracts/placeholders.catalog.json');
  cachedCatalog = JSON.parse(readFileSync(path, 'utf8')) as PlaceholderCatalog;
  return cachedCatalog;
}

function getValueFromPath(payload: ContractPayload, path: string): unknown {
  const tokens = path.split('.');
  let current: unknown = payload;
  for (const token of tokens) {
    if (current && typeof current === 'object' && token in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[token];
    } else {
      return undefined;
    }
  }
  return current;
}

function getUnidadLabel(payload: ContractPayload): string {
  const depto = payload.inmueble.numero_depto?.trim();
  if (depto) return `Departamento ${depto}`;

  const casa = payload.inmueble.numero_casa?.trim();
  if (casa) return `Casa ${casa}`;

  return 'sin numero de unidad';
}

function getCuota(payload: ContractPayload, number: 1 | 2) {
  return payload.garantia.cuotas.find((item) => item.n === number);
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

function getArrendatarioRol(genero: Genero): string {
  if (genero === 'masculino') return 'arrendatario';
  if (genero === 'femenino') return 'arrendataria';
  return 'arrendatario/a';
}

function getPronombreObjeto(genero: Genero): string {
  if (genero === 'masculino') return 'él';
  if (genero === 'femenino') return 'ella';
  return 'él/ella';
}

function buildPersoneriaDescripcion(payload: ContractPayload): string {
  const personeria = payload.arrendadora.personeria;
  const fecha = formatDateForContract(personeria.fecha ?? '');
  const notaria = personeria.notaria?.toLowerCase() ?? '';
  const notario = personeria.notario_nombre?.toLowerCase() ?? '';
  const isOnline = notaria.includes('firma online') || notario.includes('firma online');

  if (isOnline) {
    return `conforme a mandato vigente y proceso de firma electronica avanzada de fecha ${fecha}`;
  }

  return `en la escritura publica de fecha ${fecha}, otorgada en la notaria ${personeria.notaria} de ${personeria.ciudad}, notario/a ${personeria.notario_nombre}`;
}

function sanitizeFundsSource(value: string | undefined): string {
  const fallback = 'Remuneraciones por trabajo dependiente';
  const source = (value ?? '').trim().normalize('NFC');
  if (!source) return fallback;

  const sourceFolded = source
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();

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

function formatDateWithWeekday(dateISO: string): string {
  if (!dateISO) return '';
  const date = new Date(`${dateISO}T00:00:00`);
  if (Number.isNaN(date.getTime())) return formatDateForContract(dateISO);
  const long = new Intl.DateTimeFormat('es-CL', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Santiago',
  }).format(date);
  return long.charAt(0).toUpperCase() + long.slice(1);
}

export function buildReplacements(payload: ContractPayload): Record<string, string> {
  const catalog = getCatalog();
  const replacements: Record<string, string> = {};

  for (const placeholder of catalog.allowed) {
    const scoped = placeholder.replace('[[', '').replace(']]', '');
    const lowerPath = scoped.toLowerCase();
    let value = getValueFromPath(payload, lowerPath.replace(/\[(\d+)\]/g, '.$1'));

    if (
      scoped === 'CONTRATO.FECHA_FIRMA' ||
      scoped === 'CONTRATO.FECHA_INICIO' ||
      scoped === 'CONTRATO.FECHA_TERMINO'
    ) {
      const raw = value ? String(value) : '';
      value = raw ? formatDateForContract(raw) : raw;
    }

    if (scoped === 'RENTA.MONTO_CLP' && typeof payload.renta.monto_clp === 'number') {
      value = formatCLP(payload.renta.monto_clp);
    }

    if (scoped === 'RENTA.MONTO_UF' && typeof payload.renta.monto_uf === 'number') {
      value = formatUF(payload.renta.monto_uf);
    }

    if (scoped === 'GARANTIA.MONTO_TOTAL_CLP' && typeof payload.garantia.monto_total_clp === 'number') {
      value = formatCLP(payload.garantia.monto_total_clp);
    }

    if (scoped === 'GARANTIA.PAGO_INICIAL_CLP' && typeof payload.garantia.pago_inicial_clp === 'number') {
      value = formatCLP(payload.garantia.pago_inicial_clp);
    }

    if (scoped === 'GARANTIA.CUOTA_1_MONTO_CLP') {
      const cuota = getCuota(payload, 1);
      value = cuota ? formatCLP(cuota.monto_clp) : '-';
    }

    if (scoped === 'GARANTIA.CUOTA_2_MONTO_CLP') {
      const cuota = getCuota(payload, 2);
      value = cuota ? formatCLP(cuota.monto_clp) : '-';
    }

    if (scoped === 'GARANTIA.CUOTA_1_FECHA') {
      const cuota = getCuota(payload, 1);
      value = cuota?.fecha ? formatDateForContract(cuota.fecha) : '-';
    }

    if (scoped === 'GARANTIA.CUOTA_2_FECHA') {
      const cuota = getCuota(payload, 2);
      value = cuota?.fecha ? formatDateForContract(cuota.fecha) : '-';
    }

    if (scoped === 'CONTRATO.TIPO') {
      value = payload.contrato.tipo === 'subarriendo_propietario' ? 'subarriendo_propietario' : 'standard';
    }

    if (scoped === 'CONTRATO.FECHA_FIRMA_LARGA') {
      value = formatDateWithWeekday(payload.contrato.fecha_firma ?? '');
    }

    if (scoped === 'CONTRATO.AVISO_TERMINO_DIAS') {
      value = String(payload.contrato.aviso_termino_dias ?? 30);
    }

    if (scoped === 'SUBARRIENDO.PERMITIDO_LABEL') {
      value = payload.subarriendo?.permitido ? 'Permitido' : 'No permitido';
    }

    if (scoped === 'SUBARRIENDO.AUTORIZACION_TEXTO') {
      value = payload.subarriendo?.autorizacion_texto
        ?? 'La parte arrendataria no podrá subarrendar total o parcialmente el inmueble sin autorización previa y expresa del propietario.';
    }

    if (scoped === 'SUBARRIENDO.NOTIFICACION_DIAS_HABILES') {
      value = String(payload.subarriendo?.plazo_notificacion_habiles ?? 10);
    }

    if (scoped === 'SUBARRIENDO.PERMITE_MULTIPLES_LABEL') {
      value = payload.subarriendo?.permite_multiples ? 'Sí' : 'No';
    }

    if (scoped === 'SUBARRIENDO.PERIODO_VACANCIA_LABEL') {
      value = payload.subarriendo?.periodo_vacancia ? 'Sí' : 'No';
    }

    if (scoped === 'SUBARRIENDO.REFERENCIA_LEGAL') {
      value = payload.subarriendo?.referencia_legal ?? 'Artículo 1973 del Código Civil y normativa aplicable.';
    }

    if (scoped === 'SUBARRIENDO.RESPONSABILIDAD_PRINCIPAL') {
      value = payload.subarriendo?.responsabilidad_principal
        ?? 'En todo caso, la parte arrendataria mantendrá responsabilidad directa y principal frente a la arrendadora por todas las obligaciones del contrato.';
    }

    if (scoped === 'INMUEBLE.UNIDAD_LABEL') {
      value = getUnidadLabel(payload);
    }

    if (scoped === 'ARRENDADORA.PERSONERIA.DESCRIPCION') {
      value = buildPersoneriaDescripcion(payload);
    }

    if (scoped === 'DECLARACIONES.FONDOS_ORIGEN_TEXTO') {
      value = sanitizeFundsSource(
        payload.declaraciones.fondos_origen_fuente ?? payload.declaraciones.fondos_origen_texto
      );
    }

    if (scoped === 'DECLARACIONES.FONDOS_ORIGEN_DECLARACION') {
      value = payload.declaraciones.fondos_origen_texto;
    }

    if (scoped === 'ARRENDATARIO.TRATAMIENTO') {
      value = getTratamiento(payload.arrendatario.genero);
    }

    if (scoped === 'ARRENDATARIO.ROL') {
      value = getArrendatarioRol(payload.arrendatario.genero);
    }

    if (scoped === 'ARRENDATARIO.PRONOMBRE_OBJETO') {
      value = getPronombreObjeto(payload.arrendatario.genero);
    }

    if (scoped === 'ARRENDATARIO.DOMICILIADO') {
      value = getDomiciliado(payload.arrendatario.genero);
    }

    if (scoped === 'AVAL.TRATAMIENTO') {
      value = getTratamiento(payload.aval?.genero);
    }

    if (scoped === 'AVAL.DOMICILIADO') {
      value = getDomiciliado(payload.aval?.genero);
    }

    if (scoped === 'ARRENDADORA.REPRESENTANTE.TRATAMIENTO') {
      value = getTratamiento(payload.arrendadora.representante.genero);
    }

    if (scoped === 'ARRENDADORA.REPRESENTANTE.DOMICILIADO') {
      value = getDomiciliado(payload.arrendadora.representante.genero);
    }

    if (scoped === 'ARRENDADOR.NOMBRE') {
      value = payload.arrendadora.razon_social;
    }

    if (scoped === 'ARRENDADOR.RUT') {
      value = payload.arrendadora.rut;
    }

    if (scoped === 'ARRENDADOR.NACIONALIDAD') {
      value = payload.arrendadora.nacionalidad ?? '';
    }

    if (scoped === 'ARRENDADOR.ESTADO_CIVIL') {
      value = payload.arrendadora.estado_civil ?? '';
    }

    if (scoped === 'ARRENDADOR.PROFESION') {
      value = payload.arrendadora.profesion ?? '';
    }

    if (scoped === 'ARRENDADOR.DOMICILIO') {
      value = payload.arrendadora.domicilio;
    }

    if (scoped === 'ARRENDADOR.EMAIL') {
      value = payload.arrendadora.email;
    }

    if (scoped === 'ARRENDADOR.TRATAMIENTO') {
      value = getTratamiento(payload.arrendatario.representante_legal?.genero);
    }

    if (scoped === 'ARRENDATARIA.RAZON_SOCIAL') {
      value = payload.arrendatario.nombre;
    }

    if (scoped === 'ARRENDATARIA.RUT') {
      value = payload.arrendatario.rut;
    }

    if (scoped === 'ARRENDATARIA.DOMICILIO') {
      value = payload.arrendatario.domicilio;
    }

    if (scoped === 'ARRENDATARIA.EMAIL') {
      value = payload.arrendatario.email;
    }

    if (scoped === 'ARRENDATARIA.REPRESENTANTE.NOMBRE') {
      value = payload.arrendatario.representante_legal?.nombre ?? '';
    }

    if (scoped === 'ARRENDATARIA.REPRESENTANTE.RUT') {
      value = payload.arrendatario.representante_legal?.rut ?? '';
    }

    if (scoped === 'ARRENDATARIA.REPRESENTANTE.NACIONALIDAD') {
      value = payload.arrendatario.representante_legal?.nacionalidad ?? '';
    }

    if (scoped === 'ARRENDATARIA.REPRESENTANTE.ESTADO_CIVIL') {
      value = payload.arrendatario.representante_legal?.estado_civil ?? '';
    }

    if (scoped === 'ARRENDATARIA.REPRESENTANTE.PROFESION') {
      value = payload.arrendatario.representante_legal?.profesion ?? '';
    }

    if (scoped === 'ARRENDATARIA.REPRESENTANTE.DOMICILIO') {
      value = payload.arrendatario.representante_legal?.domicilio ?? '';
    }

    if (scoped === 'ARRENDATARIA.REPRESENTANTE.TRATAMIENTO') {
      value = getTratamiento(payload.arrendatario.representante_legal?.genero);
    }

    if (scoped === 'ARRENDATARIA.REPRESENTANTE.DOMICILIADO') {
      value = getDomiciliado(payload.arrendatario.representante_legal?.genero);
    }

    if (scoped === 'RENTA.PORCENTAJE_SUBARRIENDO') {
      value = `${Number(payload.renta.porcentaje_subarriendo ?? 91)}%`;
    }

    if (value === undefined || value === null) {
      continue;
    }

    replacements[placeholder] = String(value).normalize('NFC');
  }

  return replacements;
}

export function applyReplacements(input: string, replacements: Record<string, string>): string {
  let output = input;
  for (const [token, value] of Object.entries(replacements)) {
    output = output.split(token).join(value);
  }
  return output;
}

export function findResidualPlaceholders(input: string): string[] {
  const matches = input.match(/\[\[[A-Z0-9_.]+\]\]/g) ?? [];
  return Array.from(new Set(matches));
}

export function assertNoResidualPlaceholders(input: string): void {
  const residual = findResidualPlaceholders(input);
  if (residual.length > 0) {
    throw new ContractError({
      code: 'MISSING_PLACEHOLDERS',
      message: 'Quedaron placeholders sin reemplazar',
      details: residual,
      hint: 'Completa los campos faltantes del payload o corrige la plantilla.',
    });
  }
}

export function assertAvalPlaceholdersProtected(xmlContent: string, hayAval: boolean): void {
  if (hayAval) return;

  const hasRawAvalPlaceholder = /\[\[AVAL\./.test(xmlContent);
  if (hasRawAvalPlaceholder) {
    throw new ContractError({
      code: 'TEMPLATE_AVAL_OUTSIDE_IF',
      message: 'Se detectaron placeholders AVAL fuera de bloque condicional',
      hint: 'Envuelve placeholders AVAL dentro de [[IF.HAY_AVAL]] ... [[ENDIF.HAY_AVAL]].',
    });
  }
}

export function validateCatalogSyntax(content: string): void {
  const catalog = getCatalog();
  const tokens = content.match(/\[\[[A-Z0-9_.]+\]\]/g) ?? [];
  const invalid = tokens.filter((token) => !catalog.allowed.includes(token) && !token.startsWith('[[IF.') && !token.startsWith('[[ENDIF.'));

  if (invalid.length > 0) {
    throw new ContractError({
      code: 'VALIDATION_ERROR',
      message: 'Template contiene placeholders fuera de catálogo',
      details: Array.from(new Set(invalid)),
    });
  }
}
