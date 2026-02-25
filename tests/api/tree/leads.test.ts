/**
 * @jest-environment node
 */

import { TreeLeadRequestSchema } from '@schemas/tree';

describe('/api/tree/leads - Validación de datos', () => {
  describe('TreeLeadRequestSchema', () => {
    it('debería validar request válido para flow rent', () => {
      const validRequest = {
        flow: 'rent' as const,
        payload: {
          comuna: 'Las Condes',
          presupuesto: '450-600',
          fechaMudanza: '30-60',
          tieneMascotas: 'si',
          dormitorios: '2d',
          estacionamiento: 'si',
          bodega: 'no',
          name: 'Juan Pérez',
          whatsapp: '+56912345678',
          email: 'juan@example.com',
          consent: true,
        },
        name: 'Juan Pérez',
        whatsapp: '+56912345678',
        email: 'juan@example.com',
        utm_source: 'instagram',
        utm_campaign: 'tree-link',
        referrer: 'https://instagram.com',
      };

      const result = TreeLeadRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it('debería validar request válido para flow buy', () => {
      const validRequest = {
        flow: 'buy' as const,
        payload: {
          name: 'María González',
          whatsapp: '+56987654321',
          email: 'maria@example.com',
          rentaMensual: '1.5-2.5M',
          complementarRenta: 'si-aval-pareja',
          situacionFinanciera: 'sin-deudas',
          capacidadAhorro: '500-1M',
          preferenciaContacto: 'whatsapp',
          consent: true,
        },
        name: 'María González',
        whatsapp: '+56987654321',
        email: 'maria@example.com',
        utm_source: 'facebook',
        utm_campaign: 'tree-link',
      };

      const result = TreeLeadRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it('debería rechazar request sin flow', () => {
      const invalidRequest = {
        payload: {},
        name: 'Juan Pérez',
        whatsapp: '+56912345678',
      };

      const result = TreeLeadRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it('debería rechazar request sin name', () => {
      const invalidRequest = {
        flow: 'rent' as const,
        payload: {},
        whatsapp: '+56912345678',
      };

      const result = TreeLeadRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it('debería rechazar request sin whatsapp', () => {
      const invalidRequest = {
        flow: 'rent' as const,
        payload: {},
        name: 'Juan Pérez',
      };

      const result = TreeLeadRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it('debería aceptar email opcional', () => {
      const validRequest = {
        flow: 'rent' as const,
        payload: {},
        name: 'Juan Pérez',
        whatsapp: '+56912345678',
        // email omitido
      };

      const result = TreeLeadRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it('debería validar formato de email cuando está presente', () => {
      const invalidRequest = {
        flow: 'rent' as const,
        payload: {},
        name: 'Juan Pérez',
        whatsapp: '+56912345678',
        email: 'invalid-email',
      };

      const result = TreeLeadRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it('debería aceptar UTMs opcionales', () => {
      const validRequest = {
        flow: 'rent' as const,
        payload: {},
        name: 'Juan Pérez',
        whatsapp: '+56912345678',
        utm_source: 'instagram',
        utm_medium: 'social',
        utm_campaign: 'tree-link',
        utm_content: 'bio-link',
        utm_term: 'arriendo',
      };

      const result = TreeLeadRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it('debería aceptar referrer opcional', () => {
      const validRequest = {
        flow: 'rent' as const,
        payload: {},
        name: 'Juan Pérez',
        whatsapp: '+56912345678',
        referrer: 'https://instagram.com/posts/123',
      };

      const result = TreeLeadRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });
  });

  describe('Validación de WhatsApp', () => {
    it('debería aceptar formato +569XXXXXXXX', () => {
      const validRequest = {
        flow: 'rent' as const,
        payload: {},
        name: 'Juan Pérez',
        whatsapp: '+56912345678',
      };

      const result = TreeLeadRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it('debería rechazar WhatsApp muy corto', () => {
      const invalidRequest = {
        flow: 'rent' as const,
        payload: {},
        name: 'Juan Pérez',
        whatsapp: '123',
      };

      const result = TreeLeadRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });
  });

  describe('Validación de flow', () => {
    it('debería aceptar flow rent', () => {
      const validRequest = {
        flow: 'rent' as const,
        payload: {},
        name: 'Juan Pérez',
        whatsapp: '+56912345678',
      };

      const result = TreeLeadRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it('debería aceptar flow buy', () => {
      const validRequest = {
        flow: 'buy' as const,
        payload: {},
        name: 'Juan Pérez',
        whatsapp: '+56912345678',
      };

      const result = TreeLeadRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it('debería rechazar flow inválido', () => {
      const invalidRequest = {
        flow: 'invalid' as any,
        payload: {},
        name: 'Juan Pérez',
        whatsapp: '+56912345678',
      };

      const result = TreeLeadRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });
  });
});
