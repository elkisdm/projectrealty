import { assertValidRut, isValidRut, normalizeRut } from '@/lib/contracts/rut';

describe('RUT validator', () => {
  test('accepts valid RUT', () => {
    expect(isValidRut('12345678-5')).toBe(true);
    expect(isValidRut('12.345.678-5')).toBe(true);
    expect(isValidRut('123456785')).toBe(true);
    expect(() => assertValidRut('x', '12345678-5')).not.toThrow();
  });

  test('rejects invalid RUT', () => {
    expect(isValidRut('12345678-9')).toBe(false);
    expect(() => assertValidRut('x', '12345678-9')).toThrow();
  });

  test('normalizes equivalent formats to canonical value', () => {
    expect(normalizeRut('12.345.678-5')).toBe('12345678-5');
    expect(normalizeRut('123456785')).toBe('12345678-5');
  });
});
