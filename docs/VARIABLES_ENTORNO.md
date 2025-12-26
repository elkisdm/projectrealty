# Variables de Entorno

Documentación completa de todas las variables de entorno del proyecto.

## Variables Requeridas (Obligatorias)

### Supabase

| Variable | Descripción | Ejemplo | Desarrollo | Producción |
|----------|-------------|---------|------------|------------|
| `SUPABASE_URL` | URL del proyecto Supabase | `https://xxx.supabase.co` | ✅ Requerido | ✅ Requerido |
| `NEXT_PUBLIC_SUPABASE_URL` | URL pública de Supabase (para cliente) | `https://xxx.supabase.co` | ✅ Requerido | ✅ Requerido |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anónima pública de Supabase | `eyJhbGc...` | ✅ Requerido | ✅ Requerido |
| `SUPABASE_ANON_KEY` | Clave anónima (server-side) | `eyJhbGc...` | ✅ Requerido | ✅ Requerido |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio (admin, server-side) | `eyJhbGc...` | ✅ Requerido | ✅ Requerido |

**Nota:** Las claves de Supabase se obtienen del dashboard del proyecto en [supabase.com](https://supabase.com).

### Configuración del Sitio

| Variable | Descripción | Ejemplo | Desarrollo | Producción |
|----------|-------------|---------|------------|------------|
| `NEXT_PUBLIC_SITE_URL` | URL base del sitio | `http://localhost:3000` | `http://localhost:3000` | `https://tu-dominio.com` |

---

## Variables Opcionales

### Fuente de Datos

| Variable | Descripción | Valor por Defecto | Desarrollo | Producción |
|----------|-------------|-------------------|------------|------------|
| `USE_SUPABASE` | Usar datos reales de Supabase (true) o mocks (false) | `true` | `false` (mocks) | `true` (real) |

**Nota:** En desarrollo, puedes usar `USE_SUPABASE=false` para trabajar con datos mock sin necesidad de Supabase.

### WhatsApp

| Variable | Descripción | Ejemplo | Desarrollo | Producción |
|----------|-------------|---------|------------|------------|
| `WA_PHONE_E164` | Número de teléfono en formato E164 | `+56993481594` | Opcional | Opcional |
| `NEXT_PUBLIC_WA_URL` | URL completa de WhatsApp (opcional) | `https://wa.me/56993481594?text=Hola` | Opcional | Opcional |
| `NEXT_PUBLIC_WA_FLASH_MSG` | Mensaje personalizado para flash videos | `"Quiero reservar..."` | Opcional | Opcional |

### Analytics

| Variable | Descripción | Ejemplo | Desarrollo | Producción |
|----------|-------------|---------|------------|------------|
| `NEXT_PUBLIC_GA_ID` | Google Analytics ID | `G-XXXXXXXXXX` | Opcional | Opcional |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics 4 Measurement ID | `G-XXXXXXXXXX` | Opcional | Opcional |

### Feature Flags

| Variable | Descripción | Valores | Desarrollo | Producción |
|----------|-------------|---------|------------|------------|
| `NEXT_PUBLIC_FLAG_CARD_V2` | Habilitar BuildingCard V2 | `0` o `1` | `0` | `0` o `1` |
| `NEXT_PUBLIC_FLAG_VIRTUAL_GRID` | Habilitar grid virtualizado | `0` o `1` | `0` | `0` o `1` |
| `NEXT_PUBLIC_COMMUNE_SECTION` | Habilitar sección de comuna | `0` o `1` | `0` | `0` o `1` |
| `NEXT_PUBLIC_FOOTER_ENABLED` | Habilitar footer | `0` o `1` | `1` | `1` |
| `NEXT_PUBLIC_HEADER_ENABLED` | Habilitar header/menú | `0` o `1` | `0` (deshabilitado) | `0` (deshabilitado) |
| `COMING_SOON` | Modo "próximamente" | `true` o `false` | `false` | `false` |

### Performance y Seguridad

| Variable | Descripción | Valor por Defecto | Desarrollo | Producción |
|----------|-------------|-------------------|------------|------------|
| `NODE_ENV` | Entorno de Node.js | `development` | `development` | `production` |
| `NEXT_TELEMETRY_DISABLED` | Deshabilitar telemetría de Next.js | `1` | `1` | `1` |

### Rate Limiting

| Variable | Descripción | Valor por Defecto | Desarrollo | Producción |
|----------|-------------|-------------------|------------|------------|
| `RATE_LIMIT_MAX_REQUESTS` | Máximo de requests por ventana | `100` | `100` | `100` |
| `RATE_LIMIT_WINDOW_MS` | Ventana de tiempo en milisegundos | `900000` (15 min) | `900000` | `900000` |

---

## Configuración por Entorno

### Desarrollo Local

1. Copia `config/env.example` a `.env.local`:
   ```bash
   cp config/env.example .env.local
   ```

2. Configura las variables requeridas:
   - Supabase: Obtén las claves del dashboard
   - `USE_SUPABASE`: Puedes usar `false` para mocks
   - `NEXT_PUBLIC_SITE_URL`: `http://localhost:3000`

3. Variables opcionales:
   - Feature flags según necesites
   - WhatsApp si vas a probar esa funcionalidad

### Producción

1. Copia `config/env.production.example` a `.env.production`:
   ```bash
   cp config/env.production.example .env.production
   ```

2. Configura todas las variables con valores reales:
   - **Supabase:** Claves del proyecto de producción
   - **Site URL:** URL real del sitio (https://tu-dominio.com)
   - **Feature Flags:** Según necesidades de producción
   - **Analytics:** IDs reales si usas Google Analytics

3. En plataformas de deploy (Vercel, Netlify, etc.):
   - Configura las variables en el dashboard
   - No subas `.env.production` al repositorio
   - Usa las variables de entorno de la plataforma

---

## Validación de Variables

Antes de hacer deploy, verifica que todas las variables requeridas estén configuradas:

```bash
# Verificar variables de desarrollo
node -e "require('dotenv').config({ path: '.env.local' }); console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅' : '❌')"

# Verificar variables de producción
node -e "require('dotenv').config({ path: '.env.production' }); console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅' : '❌')"
```

---

## Seguridad

### Variables Sensibles

**NUNCA** subas al repositorio:
- `SUPABASE_SERVICE_ROLE_KEY` (clave de administrador)
- Cualquier clave o token de producción
- Archivos `.env.local` o `.env.production`

### Archivos Ignorados

El proyecto ya tiene configurado `.gitignore` para ignorar:
- `.env.local`
- `.env.production`
- `.env*.local`

---

## Referencias

- [Configuración de Supabase](https://supabase.com/docs/guides/getting-started)
- [Variables de Entorno en Next.js](https://nextjs.org/docs/basic-features/environment-variables)
- [Feature Flags del Proyecto](../lib/flags.ts)





