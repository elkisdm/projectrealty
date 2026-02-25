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
  assertValidRut('arrendadora.representante.rut', payload.arrendadora.representante.rut);
  assertValidRut('propietario.rut', payload.propietario.rut);

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

  if (payload.contrato.tipo === 'subarriendo_propietario') {
    const legalRep = payload.arrendatario.representante_legal;
    if (!legalRep) {
      throw new ContractError({
        code: 'VALIDATION_ERROR',
        message: 'Subarriendo propietario requiere representante legal del arrendatario',
        hint: 'Completa datos de representante legal en la sección de Partes.',
      });
    }

    assertValidRut('arrendatario.representante_legal.rut', legalRep.rut);

    if (normalizeRut(legalRep.rut) === normalizeRut(payload.arrendatario.rut)) {
      throw new ContractError({
        code: 'INVALID_RUT',
        message: 'RUT de representante legal del arrendatario debe ser distinto al RUT del arrendatario',
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
