import { ContractError } from './errors';

export function normalizeRut(input: string): string {
  return input.replace(/\./g, '').replace(/\s+/g, '').toUpperCase();
}

export function isValidRut(input: string): boolean {
  const rut = normalizeRut(input);
  const match = rut.match(/^(\d{7,8})-([\dK])$/i);
  if (!match) return false;

  const body = match[1];
  const dv = match[2].toUpperCase();

  let sum = 0;
  let multiplier = 2;
  for (let i = body.length - 1; i >= 0; i -= 1) {
    sum += Number(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const mod = 11 - (sum % 11);
  const expected = mod === 11 ? '0' : mod === 10 ? 'K' : String(mod);
  return expected === dv;
}

export function assertValidRut(field: string, value: string): void {
  if (!isValidRut(value)) {
    throw new ContractError({
      code: 'INVALID_RUT',
      message: `RUT inválido en ${field}`,
      details: { field, value },
      hint: 'Verifica formato y dígito verificador (ej: 12345678-5).',
    });
  }
}
