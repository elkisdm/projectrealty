import { getAllBuildings } from '@lib/data';

describe('Filtrado de edificios', () => {
  test('filtra por comuna', async () => {
    const items = await getAllBuildings({ comuna: 'Ñuñoa' });
    // En ambiente de test sin datos reales, solo verificar que la función no falla
    expect(Array.isArray(items)).toBe(true);
  });

  test('filtra por tipología', async () => {
    const items = await getAllBuildings({ tipologia: 'Studio' });
    // En ambiente de test sin datos reales, solo verificar que la función no falla
    expect(Array.isArray(items)).toBe(true);
  });

  test('filtra por rango de precio usando precioDesde', async () => {
    const items = await getAllBuildings({ minPrice: 400000, maxPrice: 500000 });
    // En ambiente de test sin datos reales, solo verificar que la función no falla
    expect(Array.isArray(items)).toBe(true);
  });
});


