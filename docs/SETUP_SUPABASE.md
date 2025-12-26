# 🚀 Guía: Configurar Supabase desde Cero

Esta guía te ayudará a configurar Supabase para el proyecto Hommie desde cero.

---

## 📋 Prerrequisitos

- ✅ Proyecto Supabase creado
- ✅ Acceso al dashboard de Supabase
- ✅ Credenciales del proyecto (URL, Anon Key, Service Role Key)

---

## 🎯 Opción 1: Script Automático (Recomendado)

El script guiado te ayudará paso a paso:

```bash
node scripts/setup-supabase-production.mjs
```

El script:
1. ✅ Te pedirá las credenciales de Supabase
2. ✅ Probará la conexión
3. ✅ Ejecutará el schema SQL
4. ✅ Ejecutará las migraciones
5. ✅ Verificará que las tablas estén creadas
6. ✅ Guardará las variables de entorno

---

## 📝 Opción 2: Configuración Manual

Si prefieres hacerlo manualmente o el script no funciona:

### Paso 1: Obtener Credenciales

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Ve a **Settings → API**
3. Copia las siguientes credenciales:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

⚠️ **Importante:** La `service_role` key es muy poderosa, no la compartas públicamente.

### Paso 2: Ejecutar Schema SQL

1. Ve a **SQL Editor** en el dashboard de Supabase
2. Crea una nueva query
3. Copia y pega el contenido de `config/supabase/schema.sql`
4. Ejecuta el SQL

El schema crea:
- ✅ Tabla `buildings` (edificios)
- ✅ Tabla `units` (unidades)
- ✅ Tabla `waitlist` (lista de espera)
- ✅ Vistas y funciones
- ✅ Índices para performance
- ✅ Row Level Security (RLS)
- ✅ Políticas de acceso

### Paso 3: Ejecutar Migraciones

1. En el **SQL Editor**, ejecuta cada migración:
   - `config/supabase/migrations/20250115_create_admin_users.sql`

Esta migración crea:
- ✅ Tabla `admin_users` para gestión de usuarios admin

### Paso 4: Verificar Tablas

Verifica que las siguientes tablas existan:
- `public.buildings`
- `public.units`
- `public.waitlist`
- `public.admin_users`

Puedes verificar en **Table Editor** del dashboard.

### Paso 5: Configurar Variables de Entorno

Crea o actualiza `.env.local`:

```bash
# Copiar template
cp config/env.example .env.local
```

Edita `.env.local` con tus credenciales:

```env
# Supabase Configuration
SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
SUPABASE_ANON_KEY=tu-anon-key-aqui
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui

# Data Source Configuration
USE_SUPABASE=true

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Paso 6: Verificar Configuración

Ejecuta el script de verificación:

```bash
node scripts/verify-core-functionality.mjs
```

O prueba manualmente:

```bash
# Verificar conexión
pnpm dev

# En otro terminal, probar API
curl http://localhost:3000/api/buildings
```

---

## 🔍 Verificación Detallada

### Verificar Tablas

En el SQL Editor de Supabase, ejecuta:

```sql
-- Verificar que las tablas existan
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('buildings', 'units', 'waitlist', 'admin_users');
```

Deberías ver las 4 tablas listadas.

### Verificar RLS (Row Level Security)

```sql
-- Verificar que RLS esté habilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('buildings', 'units', 'waitlist');
```

Todas deberían tener `rowsecurity = true`.

### Verificar Políticas

```sql
-- Verificar políticas de RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public';
```

Deberías ver políticas para lectura pública y escritura con service_role.

---

## 🛠️ Solución de Problemas

### Error: "relation does not exist"

**Causa:** Las tablas no se crearon correctamente.

**Solución:**
1. Verifica que ejecutaste el schema SQL completo
2. Revisa los errores en el SQL Editor
3. Ejecuta el SQL statement por statement si hay errores

### Error: "permission denied"

**Causa:** RLS está bloqueando el acceso.

**Solución:**
1. Verifica que las políticas de RLS estén creadas
2. Asegúrate de usar la clave correcta (anon para lectura, service_role para escritura)

### Error: "invalid API key"

**Causa:** Las credenciales son incorrectas.

**Solución:**
1. Verifica que copiaste las claves correctamente
2. Asegúrate de usar la clave `anon` para el cliente público
3. Asegúrate de usar la clave `service_role` solo en el servidor

### El script no ejecuta el SQL automáticamente

**Causa:** Supabase no permite ejecutar SQL arbitrario vía API.

**Solución:**
1. Usa la Opción 2 (Configuración Manual)
2. Ejecuta el SQL desde el SQL Editor del dashboard
3. El script seguirá funcionando para verificar y guardar variables

---

## 📚 Archivos SQL a Ejecutar

En orden de ejecución:

1. **`config/supabase/schema.sql`** - Schema principal
   - Crea tablas, índices, vistas, RLS, políticas

2. **`config/supabase/migrations/20250115_create_admin_users.sql`** - Migración admin
   - Crea tabla admin_users

---

## ✅ Checklist de Configuración

- [ ] Credenciales de Supabase obtenidas
- [ ] Schema SQL ejecutado (`config/supabase/schema.sql`)
- [ ] Migraciones ejecutadas (`config/supabase/migrations/*.sql`)
- [ ] Tablas verificadas (buildings, units, waitlist, admin_users)
- [ ] Variables de entorno configuradas (`.env.local`)
- [ ] Conexión verificada (script o manualmente)
- [ ] RLS y políticas verificadas

---

## 🚀 Próximos Pasos

Una vez configurado Supabase:

1. **Probar la aplicación:**
   ```bash
   pnpm dev
   ```

2. **Verificar funcionalidad core:**
   ```bash
   node scripts/verify-core-functionality.mjs
   ```

3. **Ingresar datos (opcional):**
   - Usa el script de ingesta si tienes datos
   - O ingresa datos manualmente desde el dashboard

4. **Configurar para producción:**
   - Crea `.env.production` con credenciales de producción
   - Configura variables en plataforma de deploy (Vercel/Netlify)

---

## 📖 Referencias

- [Documentación de Supabase](https://supabase.com/docs)
- [Variables de Entorno](./VARIABLES_ENTORNO.md)
- [Checklist de Producción](./PRODUCCION_CHECKLIST.md)
- [Guía de Deploy](./DEPLOY.md)

---

**¿Necesitas ayuda?** Ejecuta el script guiado:
```bash
node scripts/setup-supabase-production.mjs
```





