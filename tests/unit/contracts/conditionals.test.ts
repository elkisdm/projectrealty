import { applyConditionals } from '@/lib/contracts/conditionals';

describe('IF/ENDIF parser', () => {
  test('removes false block', () => {
    const src = 'A [[IF.HAY_AVAL]]B[[ENDIF.HAY_AVAL]] C';
    const out = applyConditionals(src, {
      HAY_AVAL: false,
      MASCOTA_PERMITIDA: true,
      DEPTO_AMOBLADO: true,
    });
    expect(out).toBe('A  C');
  });

  test('keeps true block', () => {
    const src = 'A [[IF.HAY_AVAL]]B[[ENDIF.HAY_AVAL]] C';
    const out = applyConditionals(src, {
      HAY_AVAL: true,
      MASCOTA_PERMITIDA: true,
      DEPTO_AMOBLADO: true,
    });
    expect(out).toBe('A B C');
  });

  test('throws on invalid syntax', () => {
    expect(() =>
      applyConditionals('[[IF.HAY_AVAL]]x', {
        HAY_AVAL: true,
        MASCOTA_PERMITIDA: true,
        DEPTO_AMOBLADO: true,
      })
    ).toThrow();
  });
});
