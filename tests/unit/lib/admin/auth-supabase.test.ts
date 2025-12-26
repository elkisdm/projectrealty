import { getAdminUser, hasRole } from '../../../../lib/admin/auth-supabase';
import { supabaseAdmin } from '../../../../lib/supabase';

// Mock de Supabase
jest.mock('../../../../lib/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn(),
  },
}));

describe('lib/admin/auth-supabase', () => {
  describe('getAdminUser', () => {
    it('debería retornar null si el usuario no existe', async () => {
      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
          }),
        }),
      });

      (supabaseAdmin.from as jest.Mock).mockReturnValue(mockFrom());

      const result = await getAdminUser('non-existent-id');
      expect(result).toBeNull();
    });

    it('debería retornar datos del usuario si existe', async () => {
      const mockAdminUser = {
        id: 'user-123',
        email: 'admin@example.com',
        role: 'admin',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      };

      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockAdminUser, error: null }),
          }),
        }),
      });

      (supabaseAdmin.from as jest.Mock).mockReturnValue(mockFrom());

      const result = await getAdminUser('user-123');
      expect(result).toEqual({
        id: 'user-123',
        email: 'admin@example.com',
        role: 'admin',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      });
    });

    it('debería retornar null si hay error en la consulta', async () => {
      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockRejectedValue(new Error('Database error')),
          }),
        }),
      });

      (supabaseAdmin.from as jest.Mock).mockReturnValue(mockFrom());

      const result = await getAdminUser('user-123');
      expect(result).toBeNull();
    });
  });

  describe('hasRole', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('debería retornar true si el usuario tiene el rol requerido', async () => {
      const mockAdminUser = {
        id: 'user-123',
        email: 'admin@example.com',
        role: 'admin',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      };

      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockAdminUser, error: null }),
          }),
        }),
      });

      (supabaseAdmin.from as jest.Mock).mockReturnValue(mockFrom());

      const result = await hasRole('user-123', 'admin');
      expect(result).toBe(true);
    });

    it('debería retornar true si el usuario tiene un rol superior', async () => {
      const mockAdminUser = {
        id: 'user-123',
        email: 'admin@example.com',
        role: 'admin',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      };

      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockAdminUser, error: null }),
          }),
        }),
      });

      (supabaseAdmin.from as jest.Mock).mockReturnValue(mockFrom());

      const result = await hasRole('user-123', 'viewer');
      expect(result).toBe(true);
    });

    it('debería retornar false si el usuario tiene un rol inferior', async () => {
      const mockEditorUser = {
        id: 'user-123',
        email: 'editor@example.com',
        role: 'editor',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      };

      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockEditorUser, error: null }),
          }),
        }),
      });

      (supabaseAdmin.from as jest.Mock).mockReturnValue(mockFrom());

      const result = await hasRole('user-123', 'admin');
      expect(result).toBe(false);
    });

    it('debería retornar false si el usuario no existe', async () => {
      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
          }),
        }),
      });

      (supabaseAdmin.from as jest.Mock).mockReturnValue(mockFrom());

      const result = await hasRole('non-existent-id', 'admin');
      expect(result).toBe(false);
    });
  });
});














