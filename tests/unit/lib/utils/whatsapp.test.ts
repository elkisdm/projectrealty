import { normalizeWhatsApp, isValidWhatsAppCL } from '@/lib/utils/whatsapp';

describe('normalizeWhatsApp', () => {
  it('debería normalizar número que empieza con +56', () => {
    expect(normalizeWhatsApp('+56912345678')).toBe('+56912345678');
  });

  it('debería agregar + a número que empieza con 56', () => {
    expect(normalizeWhatsApp('56912345678')).toBe('+56912345678');
  });

  it('debería agregar +56 a número que empieza con 9', () => {
    expect(normalizeWhatsApp('912345678')).toBe('+56912345678');
  });

  it('debería agregar +569 a número de 8 dígitos', () => {
    expect(normalizeWhatsApp('12345678')).toBe('+56912345678');
  });

  it('debería manejar espacios y guiones', () => {
    expect(normalizeWhatsApp('+56 9 1234 5678')).toBe('+56912345678');
    expect(normalizeWhatsApp('56-9-1234-5678')).toBe('+56912345678');
  });
});

describe('isValidWhatsAppCL', () => {
  it('debería validar formato correcto', () => {
    expect(isValidWhatsAppCL('+56912345678')).toBe(true);
    expect(isValidWhatsAppCL('56912345678')).toBe(true);
    expect(isValidWhatsAppCL('912345678')).toBe(true);
  });

  it('debería rechazar formato incorrecto', () => {
    expect(isValidWhatsAppCL('123')).toBe(false);
    expect(isValidWhatsAppCL('+56912345')).toBe(false);
    expect(isValidWhatsAppCL('invalid')).toBe(false);
  });
});
