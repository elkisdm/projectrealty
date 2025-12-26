# 🔧 Configurar Variables de Entorno en Vercel para Supabase

## 📋 Problema Identificado

El diagnóstico muestra que:
- ✅ Las variables están configuradas **localmente**
- ✅ La conexión a Supabase funciona
- ✅ Hay datos en Supabase (1 edificio, 111 unidades)
- ❌ **Las variables NO están configuradas en Vercel**

Por eso las propiedades no aparecen en el deploy de Vercel.

## 🚀 Solución: Configurar Variables en Vercel

### Paso 1: Acceder a Vercel Dashboard

1. Ve a [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Inicia sesión con tu cuenta
3. Selecciona el proyecto **"tremendoarriendo"**

### Paso 2: Ir a Environment Variables

1. En el proyecto, ve a **Settings** (Configuración)
2. En el menú lateral, selecciona **Environment Variables**

### Paso 3: Agregar Variables Requeridas

Agrega las siguientes variables **UNA POR UNA**:

#### Variable 1: USE_SUPABASE
- **Key:** `USE_SUPABASE`
- **Value:** `true`
- **Environment:** ☑️ Production, ☑️ Preview, ☑️ Development

#### Variable 2: SUPABASE_URL
- **Key:** `SUPABASE_URL`
- **Value:** `https://lytgdrbdyvmvziypvumy.supabase.co`
- **Environment:** ☑️ Production, ☑️ Preview, ☑️ Development

#### Variable 3: NEXT_PUBLIC_SUPABASE_URL
- **Key:** `NEXT_PUBLIC_SUPABASE_URL`
- **Value:** `https://lytgdrbdyvmvziypvumy.supabase.co`
- **Environment:** ☑️ Production, ☑️ Preview, ☑️ Development

#### Variable 4: NEXT_PUBLIC_SUPABASE_ANON_KEY
- **Key:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5dGdkcmJkeXZtdnppeXB2dW15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2NDA3MDIsImV4cCI6MjA4MTIxNjcwMn0.OrDJUa4IU1NqF2VILJzrXnZfeqkLFaURVn53iY30RIE`
- **Environment:** ☑️ Production, ☑️ Preview, ☑️ Development

#### Variable 5: SUPABASE_ANON_KEY
- **Key:** `SUPABASE_ANON_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5dGdkcmJkeXZtdnppeXB2dW15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2NDA3MDIsImV4cCI6MjA4MTIxNjcwMn0.OrDJUa4IU1NqF2VILJzrXnZfeqkLFaURVn53iY30RIE`
- **Environment:** ☑️ Production, ☑️ Preview, ☑️ Development

#### Variable 6: SUPABASE_SERVICE_ROLE_KEY
- **Key:** `SUPABASE_SERVICE_ROLE_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5dGdkcmJkeXZtdnppeXB2dW15Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTY0MDcwMiwiZXhwIjoyMDgxMjE2NzAyfQ.xf0WWWYe1trWEchUEY1MmaBjGp_E4aL915ZUpxiGptE`
- **Environment:** ☑️ Production, ☑️ Preview, ☑️ Development

### Paso 4: Verificar Variables Agregadas

Después de agregar todas las variables, deberías ver una lista con 6 variables:

1. ✅ USE_SUPABASE
2. ✅ SUPABASE_URL
3. ✅ NEXT_PUBLIC_SUPABASE_URL
4. ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
5. ✅ SUPABASE_ANON_KEY
6. ✅ SUPABASE_SERVICE_ROLE_KEY

### Paso 5: Hacer Nuevo Deploy

⚠️ **IMPORTANTE:** Las variables de entorno solo se aplican en **nuevos deploys**.

Después de configurar las variables, haz un nuevo deploy:

```bash
# Desde tu terminal local
vercel --prod
```

O desde el dashboard de Vercel:
1. Ve a la pestaña **Deployments**
2. Haz clic en los **3 puntos** del último deploy
3. Selecciona **Redeploy**
4. Asegúrate de que esté marcado **Use existing Build Cache**

### Paso 6: Verificar que Funciona

Después del deploy, verifica:

1. Ve a la URL del deploy (preview o producción)
2. Deberías ver las propiedades cargándose desde Supabase
3. Si no aparecen, revisa los logs del deploy en Vercel:
   - Ve a **Deployments** → Selecciona el deploy → **Functions** → Revisa los logs

## 🔍 Verificación Rápida

Puedes ejecutar el script de diagnóstico para verificar:

```bash
node scripts/diagnose-supabase.mjs
```

Este script te dirá:
- ✅ Qué variables están configuradas
- ✅ Si la conexión a Supabase funciona
- ✅ Si hay datos en Supabase
- ⚠️ Qué falta configurar

## 📝 Notas Importantes

1. **Variables Públicas vs Privadas:**
   - Variables con `NEXT_PUBLIC_` se exponen al cliente (navegador)
   - Variables sin `NEXT_PUBLIC_` son solo server-side (más seguras)

2. **Service Role Key:**
   - La `SUPABASE_SERVICE_ROLE_KEY` es muy sensible
   - Solo debe usarse en el servidor
   - Nunca la expongas en el cliente

3. **USE_SUPABASE:**
   - Debe ser exactamente `"true"` (string)
   - Si está vacío o es `"false"`, usará datos mock

4. **Ambientes:**
   - Marca las variables para **Production**, **Preview** y **Development**
   - Esto asegura que funcionen en todos los ambientes

## 🐛 Troubleshooting

### Las propiedades no aparecen después de configurar

1. **Verifica que el deploy se haya completado:**
   - Ve a Deployments en Vercel
   - Asegúrate de que el último deploy tenga estado "Ready"

2. **Revisa los logs del build:**
   - En el deploy, ve a **Functions** → Revisa los logs
   - Busca errores relacionados con Supabase

3. **Verifica que USE_SUPABASE esté como "true":**
   - En Vercel Dashboard → Settings → Environment Variables
   - Verifica que `USE_SUPABASE` tenga el valor `true` (sin comillas)

4. **Verifica la conexión:**
   - Ejecuta `node scripts/diagnose-supabase.mjs` localmente
   - Si funciona localmente pero no en Vercel, las variables no están bien configuradas

### Error: "Missing required environment variables"

- Verifica que TODAS las 6 variables estén configuradas
- Asegúrate de que estén marcadas para el ambiente correcto (Production/Preview)

### Error: "Table 'buildings' does not exist"

- Las tablas no están creadas en Supabase
- Necesitas ejecutar las migraciones SQL primero
- Revisa `config/supabase/migrations/`

## ✅ Checklist Final

Antes de considerar que está resuelto:

- [ ] Todas las 6 variables están en Vercel Dashboard
- [ ] Todas están marcadas para Production, Preview y Development
- [ ] Se hizo un nuevo deploy después de configurar
- [ ] El deploy se completó exitosamente
- [ ] Las propiedades aparecen en el sitio desplegado
- [ ] El script de diagnóstico pasa sin errores


