import { validateAdminRedirect } from '../../../../lib/admin/validate-redirect';

describe('validateAdminRedirect', () => {
  describe('Rutas válidas', () => {
    it('debería permitir rutas admin válidas', () => {
      expect(validateAdminRedirect('/admin')).toBe('/admin');
      expect(validateAdminRedirect('/admin/buildings')).toBe('/admin/buildings');
      expect(validateAdminRedirect('/admin/units')).toBe('/admin/units');
      expect(validateAdminRedirect('/admin/flags')).toBe('/admin/flags');
      expect(validateAdminRedirect('/admin/buildings?page=1')).toBe('/admin/buildings?page=1');
      expect(validateAdminRedirect('/admin/buildings?page=1&limit=10')).toBe('/admin/buildings?page=1&limit=10');
    });

    it('debería usar la ruta por defecto cuando se pasa null o undefined', () => {
      expect(validateAdminRedirect(null)).toBe('/admin');
      expect(validateAdminRedirect(undefined)).toBe('/admin');
      expect(validateAdminRedirect(null, '/admin/dashboard')).toBe('/admin/dashboard');
    });
  });

  describe('Protección contra open redirect', () => {
    it('debería rechazar URLs absolutas HTTP', () => {
      expect(validateAdminRedirect('http://evil.com')).toBe('/admin');
      expect(validateAdminRedirect('https://evil.com')).toBe('/admin');
      expect(validateAdminRedirect('http://evil.com/phishing')).toBe('/admin');
    });

    it('debería rechazar URLs con protocolo relativo', () => {
      expect(validateAdminRedirect('//evil.com')).toBe('/admin');
      expect(validateAdminRedirect('//evil.com/phishing')).toBe('/admin');
    });

    it('debería rechazar protocolos peligrosos', () => {
      expect(validateAdminRedirect('javascript:alert(1)')).toBe('/admin');
      expect(validateAdminRedirect('data:text/html,<script>alert(1)</script>')).toBe('/admin');
      expect(validateAdminRedirect('vbscript:msgbox(1)')).toBe('/admin');
    });

    it('debería rechazar rutas que intenten salir del directorio', () => {
      expect(validateAdminRedirect('/admin/../evil')).toBe('/admin');
      expect(validateAdminRedirect('/admin/../../etc/passwd')).toBe('/admin');
      expect(validateAdminRedirect('/admin/..')).toBe('/admin');
    });

    it('debería rechazar rutas que no empiecen con /admin', () => {
      expect(validateAdminRedirect('/')).toBe('/admin');
      expect(validateAdminRedirect('/evil')).toBe('/admin');
      expect(validateAdminRedirect('/api/admin/stats')).toBe('/admin');
    });

    it('debería rechazar caracteres peligrosos', () => {
      expect(validateAdminRedirect('/admin<script>')).toBe('/admin');
      expect(validateAdminRedirect('/admin"evil"')).toBe('/admin');
      expect(validateAdminRedirect("/admin'evil'")).toBe('/admin');
      expect(validateAdminRedirect('/admin<evil>')).toBe('/admin');
    });

    it('debería rechazar rutas con caracteres no permitidos', () => {
      expect(validateAdminRedirect('/admin/buildings;evil')).toBe('/admin');
      expect(validateAdminRedirect('/admin/buildings#evil')).toBe('/admin');
      expect(validateAdminRedirect('/admin/buildings|evil')).toBe('/admin');
    });
  });

  describe('Casos edge', () => {
    it('debería manejar strings vacíos', () => {
      expect(validateAdminRedirect('')).toBe('/admin');
      expect(validateAdminRedirect('   ')).toBe('/admin');
    });

    it('debería normalizar espacios', () => {
      expect(validateAdminRedirect('  /admin/buildings  ')).toBe('/admin/buildings');
    });

    it('debería permitir query params válidos', () => {
      expect(validateAdminRedirect('/admin/buildings?page=1&limit=10')).toBe('/admin/buildings?page=1&limit=10');
      expect(validateAdminRedirect('/admin/buildings?search=test&comuna=santiago')).toBe('/admin/buildings?search=test&comuna=santiago');
    });
  });
});









