# ✅ Checklist de Variables de Entorno

## Variables Críticas para el MVP

### 🔴 Obligatorias (sin estas, la app no funciona)

#### Supabase (Requeridas)
```bash
SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  # ⚠️ IMPORTANTE: No usar placeholder
```

#### Configuración del Sitio
```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000  # Desarrollo
# o
NEXT_PUBLIC_SITE_URL=https://tu-dominio.com  # Producción
```

#### Fuente de Datos
```bash
USE_SUPABASE=true  # true = datos reales, false = mocks
```

### 🟡 Importantes (recomendadas)

#### Feature Flags MVP
```bash
NEXT_PUBLIC_HEADER_ENABLED=0          # Deshabilitado para MVP
NEXT_PUBLIC_FOOTER_ENABLED=1          # Habilitado
NEXT_PUBLIC_COMMUNE_SECTION=1        # ✅ ACTIVAR para MVP completo
```

### 🟢 Opcionales (mejoras)

#### WhatsApp
```bash
WA_PHONE_E164=+56993481594
NEXT_PUBLIC_WA_FLASH_MSG="Mensaje personalizado"
```

#### Analytics
```bash
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_META_PIXEL_ID=123456789
```

---

## Verificación Rápida

### Para Desarrollo (`pnpm run dev`)
- ✅ Lee `.env.local`
- ✅ Si no existe, usa valores por defecto o mocks

### Para Producción (`pnpm run build` + `pnpm run start`)
- ✅ Lee `.env.production`
- ⚠️ **NO lee `.env.local`**
- ⚠️ Si faltan variables, puede fallar silenciosamente

---

## Comando de Verificación

```bash
# Verificar variables en .env.production
grep -E "^[A-Z]" .env.production | grep -v "^#"

# Verificar variables específicas
grep -E "SUPABASE_URL|NEXT_PUBLIC_SITE_URL|USE_SUPABASE" .env.production
```

---

## Problemas Comunes

### ❌ "No carga" / Página en blanco
- Verificar que `SUPABASE_SERVICE_ROLE_KEY` no sea un placeholder
- Verificar que `USE_SUPABASE=true` si quieres datos reales
- Verificar que `NEXT_PUBLIC_SITE_URL` esté configurado

### ❌ "undefined" en URLs
- Verificar `NEXT_PUBLIC_SITE_URL` en `.env.production` (no solo `.env.local`)

### ❌ Errores de conexión a Supabase
- Verificar que todas las claves de Supabase estén correctas
- Verificar que `SUPABASE_SERVICE_ROLE_KEY` sea la clave de servicio (no anon)

---

## Notas Importantes

1. **Servidor de Producción**: `next start` solo lee `.env.production`, NO `.env.local`
2. **Build Time**: Las variables `NEXT_PUBLIC_*` se inyectan en build time
3. **Runtime**: Las variables sin `NEXT_PUBLIC_*` solo están disponibles server-side
4. **Seguridad**: Nunca subas `.env.production` o `.env.local` al repositorio
