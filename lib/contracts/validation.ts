import type { ContractPayload } from '@/schemas/contracts';
import { applyAutomaticContractRules } from './form-utils';
import { ContractError } from './errors';
import { addOneYearISODate, nowInChileISODate } from './utils';
import { assertValidRut, normalizeRut } from './rut';

function toDate(isoDate: string): Date {
  return new Date(`${isoDate}T00:00:00.000Z`);
}

export function applyPayloadDefaults(payload: ContractPayload): ContractPayload {
  const withDates: ContractPayload = {
    ...payload,
    contrato: {
      ...payload.contrato,
      fecha_firma: payload.contrato.fecha_firma ?? nowInChileISODate(),
      fecha_termino: payload.contrato.fecha_termino ?? addOneYearISODate(payload.contrato.fecha_inicio),
    },
  };

  return applyAutomaticContractRules(withDates, { autoDeclaration: true });
}

export function validateBusinessRules(payload: ContractPayload): void {
  assertValidRut('arrendatario.rut', payload.arrendatario.rut);
  assertValidRut('arrendadora.rut', payload.arrendadora.rut);
  assertValidRut('propietario.rut', payload.propietario.rut);

  const isOwnerSublease = payload.contrato.tipo === 'subarriendo_propietario';

  if (!isOwnerSublease) {
    const requiredStandardFields = [
      ['arrendadora.cuenta.banco', payload.arrendadora.cuenta.banco],
      ['arrendadora.cuenta.tipo', payload.arrendadora.cuenta.tipo],
      ['arrendadora.cuenta.numero', payload.arrendadora.cuenta.numero],
      ['arrendadora.cuenta.email_pago', payload.arrendadora.cuenta.email_pago],
      ['arrendadora.personeria.fecha', payload.arrendadora.personeria.fecha],
      ['arrendadora.personeria.notaria', payload.arrendadora.personeria.notaria],
      ['arrendadora.personeria.ciudad', payload.arrendadora.personeria.ciudad],
      ['arrendadora.personeria.notario_nombre', payload.arrendadora.personeria.notario_nombre],
      ['arrendadora.representante.nombre', payload.arrendadora.representante.nombre],
      ['arrendadora.representante.nacionalidad', payload.arrendadora.representante.nacionalidad],
      ['arrendadora.representante.estado_civil', payload.arrendadora.representante.estado_civil],
      ['arrendadora.representante.profesion', payload.arrendadora.representante.profesion],
      ['arrendatario.nacionalidad', payload.arrendatario.nacionalidad],
      ['arrendatario.estado_civil', payload.arrendatario.estado_civil],
    ] as const;

    const missing = requiredStandardFields.filter(([, value]) => !String(value ?? '').trim());
    if (missing.length > 0) {
      throw new ContractError({
        code: 'VALIDATION_ERROR',
        message: 'Faltan campos obligatorios para contrato estándar',
        details: missing.map(([field]) => field),
      });
    }
  }

  if (!isOwnerSublease || payload.arrendadora.tipo_persona === 'juridica') {
    if (!payload.arrendadora.representante?.rut) {
      throw new ContractError({
        code: 'VALIDATION_ERROR',
        message: 'Falta RUT del representante legal de arrendadora',
      });
    }
    assertValidRut('arrendadora.representante.rut', payload.arrendadora.representante.rut);
    if (normalizeRut(payload.arrendadora.rut) === normalizeRut(payload.arrendadora.representante.rut)) {
      throw new ContractError({
        code: 'INVALID_RUT',
        message: 'RUT de representante legal debe ser personal y distinto al RUT de la arrendadora',
        details: {
          arrendadoraRut: payload.arrendadora.rut,
          representanteRut: payload.arrendadora.representante.rut,
        },
        hint: 'Usa el RUT de la empresa en arrendadora y el RUT de persona natural en representante legal.',
      });
    }
  }

  if (payload.flags.hay_aval) {
    if (!payload.aval) {
      throw new ContractError({
        code: 'VALIDATION_ERROR',
        message: 'Falta objeto aval cuando flags.hay_aval=true',
      });
    }
    assertValidRut('aval.rut', payload.aval.rut);
  }

  const start = toDate(payload.contrato.fecha_inicio);
  const end = toDate(payload.contrato.fecha_termino ?? addOneYearISODate(payload.contrato.fecha_inicio));

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
    throw new ContractError({
      code: 'INVALID_DATES',
      message: 'Fechas incoherentes: fecha_termino debe ser mayor a fecha_inicio',
    });
  }

  if (payload.renta.monto_clp <= 0) {
    throw new ContractError({
      code: 'INVALID_AMOUNTS',
      message: 'RENTA.MONTO_CLP debe ser mayor a 0',
    });
  }

  if (payload.garantia.monto_total_clp < 0) {
    throw new ContractError({
      code: 'INVALID_AMOUNTS',
      message: 'GARANTIA.MONTO_TOTAL_CLP debe ser >= 0',
    });
  }

  if (payload.garantia.monto_total_clp !== payload.renta.monto_clp) {
    throw new ContractError({
      code: 'INVALID_AMOUNTS',
      message: 'GARANTIA.MONTO_TOTAL_CLP debe ser igual al valor de la renta',
      details: {
        garantia: payload.garantia.monto_total_clp,
        renta: payload.renta.monto_clp,
      },
    });
  }

  if (payload.garantia.cuotas.length > 0) {
    const cuotasSum = payload.garantia.cuotas.reduce((acc, item) => acc + item.monto_clp, 0);
    const total = payload.garantia.pago_inicial_clp + cuotasSum;
    if (Math.abs(total - payload.garantia.monto_total_clp) > 1) {
      throw new ContractError({
        code: 'INVALID_AMOUNTS',
        message: 'Inconsistencia en garantía: pago inicial + cuotas debe igualar total (tolerancia 1 CLP)',
        details: {
          pagoInicial: payload.garantia.pago_inicial_clp,
          cuotasSum,
          totalEsperado: payload.garantia.monto_total_clp,
        },
      });
    }
  }

  if (isOwnerSublease) {
    const subleaseRequired = [
      ['arrendadora.nacionalidad', payload.arrendadora.nacionalidad],
      ['arrendadora.estado_civil', payload.arrendadora.estado_civil],
      ['arrendadora.profesion', payload.arrendadora.profesion],
      ['arrendatario.representante_legal.nombre', payload.arrendatario.representante_legal?.nombre],
      ['arrendatario.representante_legal.nacionalidad', payload.arrendatario.representante_legal?.nacionalidad],
      ['arrendatario.representante_legal.estado_civil', payload.arrendatario.representante_legal?.estado_civil],
      ['arrendatario.representante_legal.profesion', payload.arrendatario.representante_legal?.profesion],
      ['arrendatario.representante_legal.domicilio', payload.arrendatario.representante_legal?.domicilio],
    ] as const;
    const missingSublease = subleaseRequired.filter(([, value]) => !String(value ?? '').trim());
    if (missingSublease.length > 0) {
      throw new ContractError({
        code: 'VALIDATION_ERROR',
        message: 'Faltan campos obligatorios para contrato de subarriendo propietario',
        details: missingSublease.map(([field]) => field),
      });
    }

    if (payload.arrendatario.tipo_persona !== 'juridica') {
      throw new ContractError({
        code: 'VALIDATION_ERROR',
        message: 'En subarriendo propietario, la arrendataria debe ser persona jurídica',
      });
    }

    if (!payload.arrendatario.representante_legal) {
      throw new ContractError({
        code: 'VALIDATION_ERROR',
        message: 'Falta representante legal de la arrendataria',
        hint: 'Completa los datos de representante legal para este tipo de contrato.',
      });
    }
    assertValidRut('arrendatario.representante_legal.rut', payload.arrendatario.representante_legal.rut);

    if (normalizeRut(payload.propietario.rut) !== normalizeRut(payload.arrendadora.rut)) {
      throw new ContractError({
        code: 'VALIDATION_ERROR',
        message: 'En subarriendo propietario, arrendador y propietario deben coincidir',
      });
    }

    if (!payload.subarriendo?.permitido || !payload.subarriendo?.propietario_autoriza) {
      throw new ContractError({
        code: 'VALIDATION_ERROR',
        message: 'Subarriendo propietario requiere autorización explícita del propietario',
        details: {
          permitido: payload.subarriendo?.permitido ?? false,
          propietario_autoriza: payload.subarriendo?.propietario_autoriza ?? false,
        },
        hint: 'Activa autorización del propietario y subarriendo permitido para este tipo de contrato.',
      });
    }

    if (
      !payload.subarriendo?.notificacion_obligatoria
      || !payload.subarriendo?.plazo_notificacion_habiles
      || payload.subarriendo.plazo_notificacion_habiles <= 0
    ) {
      throw new ContractError({
        code: 'VALIDATION_ERROR',
        message: 'Subarriendo propietario requiere regla de notificación válida',
        details: {
          notificacion_obligatoria: payload.subarriendo?.notificacion_obligatoria ?? false,
          plazo_notificacion_habiles: payload.subarriendo?.plazo_notificacion_habiles ?? null,
        },
        hint: 'Define notificación obligatoria y plazo en días hábiles mayor a 0.',
      });
    }
  }
}
