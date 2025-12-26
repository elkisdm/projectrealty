# Configuración de Autenticación del Panel Admin

## Variables de Entorno

Para proteger el panel de administración, configura la siguiente variable de entorno:

```env
ADMIN_TOKEN=tu-token-secreto-aqui
```

Este token se usa para autenticación básica del panel admin.

## Uso

### En Desarrollo

Si no configuras `ADMIN_TOKEN`, el acceso será permitido automáticamente en desarrollo (con un warning).

### En Producción

En producción, el panel requiere autenticación. Puedes autenticarte de dos formas:

1. **Header HTTP:**
   ```bash
   curl -H "x-admin-token: tu-token-secreto-aqui" https://tu-dominio.com/admin
   ```

2. **Cookie:**
   El token puede ser establecido como cookie `admin-token`.

## Notas de Seguridad

⚠️ **IMPORTANTE:** Esta es una implementación básica de autenticación. Para producción, se recomienda:

1. Implementar autenticación completa con Supabase Auth
2. Agregar roles y permisos granular
3. Implementar sesiones con expiración
4. Agregar logging de acciones administrativas

## Mejoras Futuras

- Integración con Supabase Auth
- Sistema de roles y permisos
- Sesiones con expiración automática
- 2FA para administradores
- Auditoría de acciones

