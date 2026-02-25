import { ContractError } from './errors';

export function normalizeRut(input: string): string {
  const parsed = splitRut(input);
  if (parsed) {
    return `${parsed.body}-${parsed.dv}`;
  }

  return input
    .replace(/\./g, '')
    .replace(/\s+/g, '')
    .replace(/[^0-9K-]/gi, '')
    .toUpperCase();
}

function computeRutDv(body: string): string {
  let sum = 0;
  let multiplier = 2;
  for (let i = body.length - 1; i >= 0; i -= 1) {
    sum += Number(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const mod = 11 - (sum % 11);
  return mod === 11 ? '0' : mod === 10 ? 'K' : String(mod);
}

function splitRut(input: string): { body: string; dv: string } | null {
  const normalized = input
    .replace(/\./g, '')
    .replace(/\s+/g, '')
    .replace(/[^0-9K-]/gi, '')
    .toUpperCase();
  const strictMatch = normalized.match(/^(\d{7,8})-([\dK])$/i);

  if (strictMatch) {
    return {
      body: strictMatch[1],
      dv: strictMatch[2].toUpperCase(),
    };
  }

  // Fallback: accept compact forms like 123456785 or 12.345.6785
  const compact = normalized.replace(/-/g, '');
  const compactMatch = compact.match(/^(\d{7,8})([\dK])$/i);
  if (!compactMatch) return null;

  return {
    body: compactMatch[1],
    dv: compactMatch[2].toUpperCase(),
  };
}

export function isValidRut(input: string): boolean {
  const parsed = splitRut(input);
  if (!parsed) return false;

  const expected = computeRutDv(parsed.body);
  return expected === parsed.dv;
}

export function assertValidRut(field: string, value: string): void {
  const parsed = splitRut(value);
  if (!parsed) {
    throw new ContractError({
      code: 'INVALID_RUT',
      message: `RUT inválido en ${field}`,
      details: { field, value },
      hint: 'Usa formato 12.345.678-5 o 12345678-5.',
    });
  }

  const expected = computeRutDv(parsed.body);
  if (expected !== parsed.dv) {
    throw new ContractError({
      code: 'INVALID_RUT',
      message: `RUT inválido en ${field}`,
      details: {
        field,
        value,
        expectedRut: `${parsed.body}-${expected}`,
      },
      hint: `El dígito verificador esperado para ${parsed.body} es ${expected}.`,
    });
  }
}
