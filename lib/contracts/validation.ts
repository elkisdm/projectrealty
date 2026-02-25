import type { ContractPayload } from '@/schemas/contracts';
import { ContractError } from './errors';
import { addOneYearISODate, nowInChileISODate } from './utils';
import { assertValidRut } from './rut';

function toDate(isoDate: string): Date {
  return new Date(`${isoDate}T00:00:00.000Z`);
}

export function applyPayloadDefaults(payload: ContractPayload): ContractPayload {
  return {
    ...payload,
    contrato: {
      ...payload.contrato,
      fecha_firma: payload.contrato.fecha_firma ?? nowInChileISODate(),
      fecha_termino: payload.contrato.fecha_termino ?? addOneYearISODate(payload.contrato.fecha_inicio),
    },
  };
}

export function validateBusinessRules(payload: ContractPayload): void {
  assertValidRut('arrendatario.rut', payload.arrendatario.rut);
  assertValidRut('arrendadora.rut', payload.arrendadora.rut);
  assertValidRut('arrendadora.representante.rut', payload.arrendadora.representante.rut);
  assertValidRut('propietario.rut', payload.propietario.rut);

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
}
