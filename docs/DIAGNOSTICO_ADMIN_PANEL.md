# 🔍 DIAGNÓSTICO: Panel de Admin no carga

## Contexto

- **Problema**: El panel de administración en `/admin` no carga correctamente
- **Archivos afectados**: `app/admin/layout-client.tsx`, `hooks/useAdminAuth.ts`, `app/api/admin/auth/session/route.ts`
- **Comportamiento esperado**: Tras login, el dashboard muestra KPIs y acciones. Sin sesión, redirige a `/admin/login`
- **Comportamiento actual**: Posible pantalla en blanco, loading infinito o redirección incorrecta

---

## Flujo de carga del admin

1. Usuario visita `/admin`
2. `AdminLayoutClient` decide: si ruta = `/admin/login` → muestra formulario; si no → `AuthenticatedContent`
3. `AuthenticatedContent` usa `useAdminAuth` que hace `fetch('/api/admin/auth/session', { credentials: 'include' })`
4. Si `isLoadingSession` → muestra "Verificando sesión..."
5. Si `!isAuthenticated` → `router.push('/admin/login')`
6. Si autenticado → muestra `AdminShell` + children (dashboard, buildings, etc.)
7. Dashboard llama `useAdminStats` → `fetch('/api/admin/stats')` (cookies enviadas por defecto en same-origin)

---

## Causas probables (ordenadas por frecuencia)

### 1. **"Verificando sesión..." indefinido** (loading infinito)

- **Causa**: `/api/admin/auth/session` tarda mucho, falla en red o devuelve error no manejado
- **Comprobación**: Abrir DevTools → Network → recargar `/admin` → ver si la petición a `/api/admin/auth/session` completa
- **Posibles problemas**:
  - Variables de entorno: `SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` o `SUPABASE_ANON_KEY` faltan o incorrectas
  - Rate limit bloqueando la petición

### 2. **Variables de entorno de Supabase**

- **Causa**: Auth depende de Supabase. Si `SUPABASE_URL` o las keys no están en `.env.local`, el servidor puede fallar
- **Comprobación**:
  ```bash
  # Verificar que existen (sin revelar valores)
  grep -E "^SUPABASE_URL=|^NEXT_PUBLIC_SUPABASE_ANON_KEY=|^SUPABASE_ANON_KEY=" .env.local
  ```

### 3. **Formato de cookies Supabase**

- **Causa**: Las cookies usan `sb-{projectRef}-auth-token`, donde `projectRef` sale de `SUPABASE_URL` (ej. `lytgdrbdyvmvziypvumy.supabase.co` → `lytgdrbdyvmvziypvumy`)
- **Problema**: Si la URL tiene otro formato, los nombres de cookie no coinciden

### 4. **Usuario no en `admin_users`**

- **Causa**: Login correcto en Supabase Auth, pero el usuario no está en la tabla `admin_users`
- **Resultado**: `signInAdmin` devuelve `null` y `getAdminSessionFromAccessToken` también

### 5. **API stats 401 tras login**

- **Causa**: Cookies no se guardan bien tras login, o `requireAdminSession` no las lee
- **Síntoma**: Tras login, el dashboard muestra "No pudimos cargar el dashboard" o error 401

---

## Plan de verificación (pasos recomendados)

1. **Comprobar sesión API manualmente**
   ```bash
   # Sin cookies (debería devolver authenticated: false)
   curl -s http://localhost:3000/api/admin/auth/session | jq .
   ```

2. **Comprobar variables de entorno**
   ```bash
   pnpm exec dotenv -e .env.local -- node -e "
     const u = process.env.SUPABASE_URL;
     const k = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
     console.log('SUPABASE_URL:', u ? '✓ definido' : '✗ falta');
     console.log('ANON_KEY:', k ? '✓ definido' : '✗ falta');
     if (u) console.log('ProjectRef (cookie prefix):', u.split('//')[1]?.split('.')[0] || '?');
   "
   ```

3. **Verificar tabla `admin_users`**
   - En Supabase Dashboard → Table Editor → `admin_users`
   - Confirmar que existe el usuario con el email que usas para login

4. **Revisar consola del navegador**
   - Errores de React / hidratación
   - Errores de red (CORS, 500, etc.)

5. **Revisar logs del servidor**
   - Errores en `[AUTH]` al llamar a sesión o login

---

## Comandos QA

```bash
# Lint y tipos
pnpm lint && pnpm typecheck

# Test de auth
pnpm test -- tests/api/admin/

# E2E admin login (con servidor corriendo)
pnpm exec playwright test tests/e2e/admin-login.spec.ts
```

---

## Riesgos y rollback

- **Riesgos**: Cambios en auth pueden afectar a todos los usuarios admin
- **Rollback**: Revertir commits que toquen `lib/admin/`, `app/api/admin/auth/`, `hooks/useAdminAuth.ts`
