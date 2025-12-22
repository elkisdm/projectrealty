# Estado de Deploy - Día 7

## ✅ Verificaciones Completadas

### 1. Variables de Entorno
- ✅ `.env.production` existe y está configurado
- ✅ `.env.production` está en `.gitignore` (`.env*`)
- ✅ Variables validadas con script de deploy

### 2. Verificaciones Pre-Deploy
- ✅ TypeScript sin errores (`pnpm typecheck`)
- ✅ Build exitoso (`pnpm build`)
- ✅ Estructura de archivos correcta
- ✅ Scripts de package.json presentes

### 3. Configuración de Vercel
- ✅ Vercel CLI instalado (v44.7.3)
- ✅ Usuario autenticado: `elkisdm`
- ⚠️ Proyecto no vinculado aún (requiere acción manual)

## 📋 Pasos para Completar el Deploy

### Opción A: Deploy desde CLI

1. **Vincular proyecto a Vercel:**
   ```bash
   vercel link
   ```
   - Seleccionar o crear proyecto
   - Confirmar configuración

2. **Configurar variables de entorno en Vercel Dashboard:**
   - Ir a: https://vercel.com/dashboard
   - Seleccionar proyecto
   - Settings → Environment Variables
   - Agregar todas las variables de `.env.production`:
     - `SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY` (opcional)
     - `NEXT_PUBLIC_SITE_URL`
     - `COMING_SOON` (false para producción)
     - `NEXT_PUBLIC_WHATSAPP_PHONE` (opcional)
     - `NEXT_PUBLIC_GA_ID` (opcional)
   - Marcar como "Production" y "Preview"

3. **Deploy a producción:**
   ```bash
   vercel --prod
   ```

### Opción B: Deploy desde Vercel Dashboard

1. **Conectar repositorio:**
   - Ir a: https://vercel.com/new
   - Conectar repositorio de GitHub
   - Seleccionar el proyecto

2. **Configurar proyecto:**
   - Framework Preset: Next.js
   - Build Command: `pnpm build`
   - Output Directory: `.next`
   - Install Command: `pnpm install`
   - Root Directory: `.` (raíz)

3. **Configurar variables de entorno:**
   - Settings → Environment Variables
   - Agregar todas las variables (ver lista arriba)

4. **Deploy:**
   - Vercel hará deploy automático al hacer push a main
   - O hacer deploy manual desde Dashboard

## 🧪 Testing Post-Deploy

Una vez desplegado, verificar:

- [ ] Landing carga correctamente (`/`)
- [ ] Propiedades se listan en grid
- [ ] Filtros funcionan (comuna, precio)
- [ ] Navegación a detalle funciona (`/property/[slug]`)
- [ ] Imágenes cargan correctamente
- [ ] WhatsApp CTA funciona
- [ ] Mobile responsive
- [ ] Sin errores en consola
- [ ] Performance aceptable (< 3s carga)

## 📝 Notas Importantes

- **NUNCA** commitear `.env.production` al repositorio
- Variables de entorno deben configurarse en Vercel Dashboard
- Verificar que Supabase esté configurado para producción
- Monitorear logs de Vercel después del deploy
- Tener plan de rollback si es necesario

## 🔗 Comandos Útiles

```bash
# Verificar estado de Vercel
vercel whoami
vercel ls

# Deploy a preview
vercel

# Deploy a producción
vercel --prod

# Ver logs
vercel logs

# Verificar sitio
curl -I https://tu-dominio.vercel.app
```

