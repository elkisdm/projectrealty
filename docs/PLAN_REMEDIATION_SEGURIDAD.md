# 🛠️ Plan de Remediation de Seguridad

Este documento detalla los pasos específicos para resolver las vulnerabilidades identificadas en la auditoría de seguridad.

---

## Fase 1: Crítico - Resolver Inmediatamente

### 1.1 Actualizar Dependencias Vulnerables

**Prioridad:** Crítica  
**Tiempo estimado:** 15 minutos  
**Riesgo:** Bajo

#### Pasos:

1. **Ejecutar auditoría de dependencias:**
   ```bash
   pnpm audit
   ```

2. **Aplicar fixes automáticos:**
   ```bash
   pnpm audit fix
   ```

3. **Verificar cambios:**
   ```bash
   git diff package.json pnpm-lock.yaml
   ```

4. **Ejecutar tests:**
   ```bash
   pnpm test
   pnpm build
   ```

5. **Commit:**
   ```bash
   git add package.json pnpm-lock.yaml
   git commit -m "security: actualizar dependencias vulnerables (CVE-2025-64718)"
   ```

#### Verificación:
- [ ] `pnpm audit` muestra 0 vulnerabilidades críticas
- [ ] Tests pasan
- [ ] Build exitoso

---

### 1.2 Implementar Content-Security-Policy (CSP)

**Prioridad:** Alta  
**Tiempo estimado:** 1-2 horas  
**Riesgo:** Medio (puede romper funcionalidad si no se configura correctamente)

#### Pasos:

1. **Revisar recursos externos usados:**
   - Google Analytics
   - Supabase
   - Imágenes externas
   - Scripts de terceros

2. **Agregar CSP en `next.config.mjs`:**

```javascript
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-DNS-Prefetch-Control',
          value: 'on'
        },
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload'
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block'
        },
        {
          key: 'X-Frame-Options',
          value: 'SAMEORIGIN'
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff'
        },
        {
          key: 'Referrer-Policy',
          value: 'origin-when-cross-origin'
        },
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(), geolocation=()'
        },
        {
          key: 'Content-Security-Policy',
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com data:",
            "img-src 'self' data: https: blob:",
            "connect-src 'self' https://*.supabase.co https://www.google-analytics.com https://vitals.vercel-insights.com",
            "frame-ancestors 'self'",
            "base-uri 'self'",
            "form-action 'self'",
            "object-src 'none'",
            "upgrade-insecure-requests",
          ].join('; ')
        }
      ]
    }
  ];
}
```

3. **Probar en desarrollo:**
   ```bash
   pnpm dev
   # Verificar que no hay errores en consola del navegador
   ```

4. **Verificar headers:**
   ```bash
   curl -I http://localhost:3000 | grep -i "content-security-policy"
   ```

5. **Ajustar según errores:**
   - Si hay errores de CSP, revisar consola del navegador
   - Agregar dominios necesarios a las directivas
   - Considerar usar `report-uri` para monitoreo

6. **Deploy a staging:**
   - Probar en ambiente de staging
   - Verificar funcionalidad completa
   - Revisar logs de errores

7. **Commit:**
   ```bash
   git add next.config.mjs
   git commit -m "security: agregar Content-Security-Policy"
   ```

#### Verificación:
- [ ] CSP configurado en `next.config.mjs`
- [ ] No hay errores en consola del navegador
- [ ] Funcionalidad completa funciona
- [ ] Headers verificados con curl

#### Rollback:
Si CSP rompe funcionalidad, remover temporalmente y ajustar directivas.

---

## Fase 2: Alta Prioridad - Próximas 1-2 Semanas

### 2.1 Rate Limiting Persistente con Redis

**Prioridad:** Alta  
**Tiempo estimado:** 4-6 horas  
**Riesgo:** Medio

#### Opción A: Upstash Redis (Recomendado para Vercel)

1. **Crear cuenta en Upstash:**
   - https://upstash.com
   - Crear base de datos Redis

2. **Instalar dependencias:**
   ```bash
   pnpm add @upstash/redis
   ```

3. **Crear `lib/rate-limit-redis.ts`:**

```typescript
import 'server-only';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

type RateLimiterOptions = {
  windowMs?: number;
  max?: number;
};

type RateLimitResult = {
  ok: boolean;
  retryAfter?: number;
  count: number;
};

export function createRateLimiter(options: RateLimiterOptions = {}) {
  const windowMs = options.windowMs ?? 60_000;
  const max = options.max ?? 20;

  async function check(ip: string): Promise<RateLimitResult> {
    const key = `rate_limit:${ip}`;
    const now = Date.now();
    
    try {
      // Incrementar contador
      const count = await redis.incr(key);
      
      // Si es la primera vez, establecer expiración
      if (count === 1) {
        await redis.expire(key, Math.ceil(windowMs / 1000));
      }
      
      if (count > max) {
        // Obtener TTL para calcular retryAfter
        const ttl = await redis.ttl(key);
        return {
          ok: false,
          retryAfter: ttl > 0 ? ttl : Math.ceil(windowMs / 1000),
          count,
        };
      }
      
      return { ok: true, count };
    } catch (error) {
      // Fallback: permitir request si Redis falla
      console.error('[Rate Limit] Redis error:', error);
      return { ok: true, count: 0 };
    }
  }

  return { check };
}
```

4. **Actualizar variables de entorno:**
   ```bash
   # .env.local
   UPSTASH_REDIS_REST_URL=https://...
   UPSTASH_REDIS_REST_TOKEN=...
   ```

5. **Migrar endpoints críticos:**
   - `app/api/waitlist/route.ts`
   - `app/api/admin/auth/login/route.ts`
   - `app/api/buildings/route.ts`

6. **Mantener fallback:**
   - Si Redis no está disponible, usar rate limiting en memoria
   - Logging de advertencias

#### Opción B: Vercel Edge Config

Si prefieres usar Vercel Edge Config (más simple pero menos flexible):

1. **Configurar Edge Config en Vercel Dashboard**

2. **Usar `@vercel/edge-config`:**

```typescript
import { get } from '@vercel/edge-config';

// Similar implementación pero usando Edge Config
```

#### Verificación:
- [ ] Redis configurado
- [ ] Rate limiting funciona en múltiples instancias
- [ ] Fallback funciona si Redis falla
- [ ] Tests pasan

---

### 2.2 Expiración de Sesiones Admin

**Prioridad:** Alta  
**Tiempo estimado:** 2-3 horas  
**Riesgo:** Bajo

#### Pasos:

1. **Actualizar `lib/admin/auth-middleware.ts`:**

```typescript
export async function isAuthenticatedAdmin(request: NextRequest): Promise<boolean> {
  try {
    const client = createSupabaseClientForMiddleware(request);
    if (!client) {
      return false;
    }

    const { data: { session }, error } = await client.auth.getSession();

    if (error || !session || !session.user) {
      return false;
    }

    // Verificar expiración
    if (session.expires_at && session.expires_at * 1000 < Date.now()) {
      // Sesión expirada, intentar refresh
      const { data: { session: refreshedSession } } = await client.auth.refreshSession();
      
      if (!refreshedSession || !refreshedSession.user) {
        return false;
      }
      
      // Verificar usuario en admin_users
      const { data: adminUser } = await supabaseAdmin
        .from('admin_users')
        .select('id')
        .eq('id', refreshedSession.user.id)
        .single();

      return !!adminUser;
    }

    // Verificar que el usuario existe en admin_users
    const { data: adminUser } = await supabaseAdmin
      .from('admin_users')
      .select('id')
      .eq('id', session.user.id)
      .single();

    return !!adminUser;
  } catch (error) {
    logger.error('[MIDDLEWARE] Error verificando autenticación:', error);
    return false;
  }
}
```

2. **Agregar timeout de inactividad (opcional):**
   - Guardar última actividad en cookie
   - Verificar en middleware
   - Cerrar sesión después de X minutos de inactividad

3. **Tests:**
   - Test de sesión expirada
   - Test de refresh automático
   - Test de timeout de inactividad

#### Verificación:
- [ ] Sesiones expiradas se detectan
- [ ] Refresh automático funciona
- [ ] Timeout de inactividad implementado (opcional)
- [ ] Tests pasan

---

### 2.3 Hardening de Bypass en Desarrollo

**Prioridad:** Alta  
**Tiempo estimado:** 30 minutos  
**Riesgo:** Bajo

#### Pasos:

1. **Actualizar `middleware.ts`:**

```typescript
function isAuthenticatedAdmin(request: NextRequest): boolean {
  const adminToken = process.env.ADMIN_TOKEN;
  
  // Verificación más estricta
  const isDevelopment = process.env.NODE_ENV === "development";
  const isVercelProduction = process.env.VERCEL_ENV === "production";
  const allowDevBypass = isDevelopment && !isVercelProduction && !adminToken;
  
  if (allowDevBypass) {
    // Logging de advertencia
    console.warn('[SECURITY] ⚠️  Bypass de autenticación activo en desarrollo');
    return true;
  }
  
  // Si no hay token configurado en producción, denegar acceso
  if (!adminToken) {
    return false;
  }
  
  // Verificar token en header
  const headerToken = request.headers.get("x-admin-token");
  if (headerToken === adminToken) {
    return true;
  }
  
  // Verificar token en cookie
  const cookieToken = request.cookies.get("admin-token")?.value;
  if (cookieToken === adminToken) {
    return true;
  }
  
  return false;
}
```

2. **Agregar variable de entorno opcional:**
   ```bash
   # .env.local
   ADMIN_AUTH_REQUIRED=true  # Forzar autenticación incluso en desarrollo
   ```

3. **Tests:**
   - Test de bypass en desarrollo
   - Test de denegación en producción
   - Test con ADMIN_AUTH_REQUIRED=true

#### Verificación:
- [ ] Bypass solo funciona en desarrollo local
- [ ] No funciona en Vercel production
- [ ] Logging de advertencias
- [ ] Tests pasan

---

## Fase 3: Media Prioridad - Próximo Mes

### 3.1 Protección CSRF

**Prioridad:** Media  
**Tiempo estimado:** 3-4 horas

#### Pasos:

1. **Instalar dependencia:**
   ```bash
   pnpm add csrf
   ```

2. **Crear utilidad CSRF:**
   ```typescript
   // lib/csrf.ts
   import { createToken, verifyToken } from 'csrf';
   
   export function generateCSRFToken(secret: string): string {
     return createToken(secret);
   }
   
   export function verifyCSRFToken(secret: string, token: string): boolean {
     return verifyToken(secret, token);
   }
   ```

3. **Implementar en formularios admin:**
   - Generar token en página
   - Incluir en formulario
   - Verificar en API route

#### Verificación:
- [ ] Tokens CSRF generados
- [ ] Verificación en endpoints críticos
- [ ] Tests de protección CSRF

---

### 3.2 Mejoras en Logging

**Prioridad:** Media  
**Tiempo estimado:** 2-3 horas

#### Pasos:

1. **Revisar todos los logs:**
   ```bash
   grep -r "logger\." app/ lib/ --include="*.ts" --include="*.tsx"
   ```

2. **Sanitizar información sensible:**
   - Emails: solo dominio
   - IPs: solo primeros octetos
   - Tokens: nunca loguear

3. **Agregar utilidades de sanitización:**
   ```typescript
   // lib/logger-utils.ts
   export function sanitizeEmail(email: string): string {
     const [local, domain] = email.split('@');
     return `${local[0]}***@${domain}`;
   }
   
   export function sanitizeIP(ip: string): string {
     const parts = ip.split('.');
     return `${parts[0]}.${parts[1]}.xxx.xxx`;
   }
   ```

#### Verificación:
- [ ] Todos los logs revisados
- [ ] Información sensible sanitizada
- [ ] Tests de sanitización

---

## Fase 4: Baja Prioridad - Futuro

### 4.1 Sanitización Explícita de Input

**Prioridad:** Baja  
**Tiempo estimado:** 4-6 horas

#### Pasos:

1. **Evaluar necesidad:**
   - Revisar si se renderiza HTML de usuarios
   - Si no, sanitización puede no ser necesaria

2. **Si es necesario, instalar:**
   ```bash
   pnpm add dompurify isomorphic-dompurify
   ```

3. **Implementar sanitización:**
   - En endpoints que reciben HTML
   - Antes de guardar en BD
   - Antes de renderizar

---

### 4.2 Monitoreo de Seguridad

**Prioridad:** Baja  
**Tiempo estimado:** 8-10 horas

#### Pasos:

1. **Integrar Sentry o similar:**
   ```bash
   pnpm add @sentry/nextjs
   ```

2. **Configurar alertas:**
   - Intentos de login fallidos
   - Rate limit hits
   - Errores de autenticación

3. **Dashboard de seguridad:**
   - Métricas de seguridad
   - Gráficos de intentos
   - Alertas en tiempo real

---

## 📊 Métricas de Éxito

### Fase 1 (Crítico):
- ✅ 0 vulnerabilidades críticas en dependencias
- ✅ CSP implementado y funcionando
- ✅ Headers de seguridad completos

### Fase 2 (Alta):
- ✅ Rate limiting persistente funcionando
- ✅ Sesiones con expiración
- ✅ Bypass hardening implementado

### Fase 3 (Media):
- ✅ Protección CSRF en endpoints críticos
- ✅ Logs sanitizados
- ✅ Validación mejorada

### Fase 4 (Baja):
- ✅ Sanitización implementada (si es necesaria)
- ✅ Monitoreo activo
- ✅ Dashboard de seguridad

---

## 🔄 Proceso de Revisión

1. **Revisión semanal:**
   - Ejecutar `pnpm audit`
   - Revisar logs de seguridad
   - Verificar rate limiting

2. **Revisión mensual:**
   - Ejecutar script de auditoría completo
   - Revisar nuevas dependencias
   - Actualizar políticas de seguridad

3. **Revisión trimestral:**
   - Auditoría completa
   - Actualizar documentación
   - Revisar y actualizar este plan

---

## 📝 Notas

- Todas las implementaciones deben ir acompañadas de tests
- Deploy a staging antes de producción
- Documentar cambios en CHANGELOG
- Comunicar cambios al equipo

---

**Última actualización:** 2025-12-25  
**Próxima revisión:** 2025-01-25

