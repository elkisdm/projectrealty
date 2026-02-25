import { assertValidRut, isValidRut } from '@/lib/contracts/rut';

describe('RUT validator', () => {
  test('accepts valid RUT', () => {
    expect(isValidRut('12345678-5')).toBe(true);
    expect(() => assertValidRut('x', '12345678-5')).not.toThrow();
  });

  test('rejects invalid RUT', () => {
    expect(isValidRut('12345678-9')).toBe(false);
    expect(() => assertValidRut('x', '12345678-9')).toThrow();
  });
});
