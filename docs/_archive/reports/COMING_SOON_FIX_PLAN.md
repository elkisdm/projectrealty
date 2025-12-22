# Diagnóstico Coming Soon - Plan de Fixes

## Resumen Ejecutivo

Se diagnosticaron 2 problemas críticos en la página Coming Soon:

1. **Botón WhatsApp deshabilitado** - Falta variable de entorno
2. **API Waitlist funcional** - No hay errores detectados

---

## 🔍 Análisis Detallado

### 1. Problema WhatsApp: Botón Deshabilitado

#### Causa Raíz
- **Variable faltante**: `NEXT_PUBLIC_WHATSAPP_PHONE`
- **Archivo afectado**: `components/marketing/ComingSoonHero.tsx` (líneas 295-312)
- **Comportamiento**: Botón se renderiza como `disabled` con tooltip "Configura NEXT_PUBLIC_WHATSAPP_PHONE"

#### Evidencia
```typescript
// ComingSoonHero.tsx:295-312
{process.env.NEXT_PUBLIC_WHATSAPP_PHONE ? (
  <motion.a
    href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_PHONE}?text=Hola%20me%20interesa%20el%20lanzamiento`}
    // ... botón activo
  >
    WhatsApp
  </motion.a>
) : (
  <motion.button
    aria-disabled="true"
    title="Configura NEXT_PUBLIC_WHATSAPP_PHONE"
    className="... cursor-not-allowed opacity-50"
  >
    WhatsApp
  </motion.button>
)}
```

#### Verificación en Producción
```bash
# Check 1: Verificar botón deshabilitado
curl -s https://hommie.cl/coming-soon | grep -o "Configura NEXT_PUBLIC_WHATSAPP_PHONE"

# Check 2: Contar botones WhatsApp (debe ser 3)
curl -s https://hommie.cl/coming-soon | grep -o "WhatsApp" | wc -l

# Check 3: Verificar ausencia de deep link
curl -s https://hommie.cl/coming-soon | grep -o "wa.me" | wc -l
```

### 2. Problema Waitlist: API Funcional

#### Diagnóstico
- **API Status**: ✅ Funcionando correctamente
- **Schema**: ✅ `WaitlistRequestSchema` válido
- **Rate Limit**: ✅ Implementado (3 requests/min)
- **Supabase**: ✅ Usa `SUPABASE_SERVICE_ROLE_KEY` (bypass RLS)
- **Tabla**: ✅ `public.waitlist` existe con RLS configurado

#### Evidencia de Funcionamiento
```bash
# Test exitoso en local
curl -s -X POST http://localhost:3000/api/waitlist \
  -d '{"email":"test@example.com"}' \
  -H "Content-Type: application/json"
# Response: {"success":true,"message":"¡Te agregamos a la lista de espera!"}
```

#### Estructura de Tabla
```sql
-- supabase/schema.sql:86-100
CREATE TABLE IF NOT EXISTS public.waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL CHECK (position('@' in email) > 1),
  phone text,
  source text DEFAULT 'coming-soon',
  utm jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- RLS configurado correctamente
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wl_insert" ON public.waitlist 
    FOR INSERT TO anon, authenticated 
    WITH CHECK (true);
```

---

## 🛠️ Plan de Fixes

### Variables de Entorno Requeridas

#### Para Vercel (Producción)
```bash
# WhatsApp Configuration
NEXT_PUBLIC_WHATSAPP_PHONE=+56993481594

# Supabase Configuration (ya configuradas)
SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://hommie.cl
```

#### Para Desarrollo Local
```bash
# Agregar a .env.local
NEXT_PUBLIC_WHATSAPP_PHONE=+56993481594
```

### Checks de Verificación

#### WhatsApp Fix
```bash
# 1. Verificar botón habilitado
curl -s https://hommie.cl/coming-soon | grep -o "wa.me" | wc -l
# Esperado: > 0

# 2. Verificar ausencia de tooltip de error
curl -s https://hommie.cl/coming-soon | grep -o "Configura NEXT_PUBLIC_WHATSAPP_PHONE" | wc -l
# Esperado: 0

# 3. Verificar deep link funcional
curl -s https://hommie.cl/coming-soon | grep -o "https://wa.me/[0-9]+" | head -1
# Esperado: https://wa.me/56993481594
```

#### Waitlist Fix (Verificación)
```bash
# 1. Test API funcional
curl -s -X POST https://hommie.cl/api/waitlist \
  -d '{"email":"test@example.com"}' \
  -H "Content-Type: application/json"
# Esperado: {"success":true,"message":"¡Te agregamos a la lista de espera!"}

# 2. Test rate limit
for i in {1..4}; do
  curl -s -X POST https://hommie.cl/api/waitlist \
    -d '{"email":"test'$i'@example.com"}' \
    -H "Content-Type: application/json" | jq '.success'
done
# Esperado: true, true, true, false (rate limit)

# 3. Test validación email
curl -s -X POST https://hommie.cl/api/waitlist \
  -d '{"email":"invalid-email"}' \
  -H "Content-Type: application/json"
# Esperado: {"success":false,"error":"Datos inválidos"}
```

---

## 📋 Checklist de Implementación

### WhatsApp
- [ ] Configurar `NEXT_PUBLIC_WHATSAPP_PHONE` en Vercel
- [ ] Verificar formato: `+56912345678` (con código país)
- [ ] Testear deep link en dispositivo móvil
- [ ] Verificar tracking `cta_whatsapp_click`

### Waitlist
- [ ] ✅ API ya funcional - no requiere cambios
- [ ] ✅ Supabase configurado correctamente
- [ ] ✅ Rate limiting activo
- [ ] ✅ Validación de datos implementada

---

## 🎯 Impacto Esperado

### WhatsApp
- **Antes**: Botón gris deshabilitado con tooltip de error
- **Después**: Botón verde funcional que abre WhatsApp con mensaje pre-filled

### Waitlist
- **Estado**: ✅ Ya funcional
- **Capacidad**: 3 requests por minuto por IP
- **Validación**: Email requerido, phone opcional
- **Almacenamiento**: Supabase con RLS configurado

---

## 📞 Contacto Técnico

Para implementar los fixes:

1. **Configurar variable en Vercel**: `NEXT_PUBLIC_WHATSAPP_PHONE`
2. **Verificar con checks de arriba**
3. **Testear en dispositivo móvil**

El waitlist ya está funcionando correctamente y no requiere cambios.
