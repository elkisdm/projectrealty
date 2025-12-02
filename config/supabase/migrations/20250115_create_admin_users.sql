-- Migración: Crear tabla admin_users para gestión de usuarios administrativos
-- Fecha: 2025-01-15
-- Descripción: Tabla para almacenar información de usuarios admin con roles

-- Crear tabla admin_users
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'editor', 'viewer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON public.admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON public.admin_users(role);

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_admin_users_updated_at 
    BEFORE UPDATE ON public.admin_users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Configurar RLS (Row Level Security)
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Política: Usuarios autenticados pueden ver su propio registro
CREATE POLICY "Users can view their own admin record" ON public.admin_users
    FOR SELECT 
    USING (auth.uid() = id);

-- Política: Solo service_role puede insertar, actualizar o eliminar
CREATE POLICY "Service role has full access to admin_users" ON public.admin_users
    FOR ALL 
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- Comentarios para documentación
COMMENT ON TABLE public.admin_users IS 'Tabla para gestionar usuarios administrativos del sistema';
COMMENT ON COLUMN public.admin_users.id IS 'UUID que referencia a auth.users';
COMMENT ON COLUMN public.admin_users.email IS 'Email del usuario admin (único)';
COMMENT ON COLUMN public.admin_users.role IS 'Rol del usuario: admin (acceso completo), editor (CRUD sin delete), viewer (solo lectura)';

