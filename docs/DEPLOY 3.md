# 🚀 Guía de Deploy a Producción

## 📋 Checklist Pre-Deploy

### ✅ Verificaciones Automáticas
```bash
# Ejecuta el script de deploy que verifica todo automáticamente
npm run deploy:staging
```

### ✅ Verificaciones Manuales
- [ ] Variables de entorno configuradas correctamente
- [ ] Supabase configurado y funcionando
- [ ] Feature flags configurados según necesidades
- [ ] WhatsApp configurado (si aplica)
- [ ] Analytics configurado (si aplica)

## 🔧 Configuración de Variables de Entorno

### 1. Crear archivo de producción
```bash
cp config/env.production.example .env.production
```

### 2. Configurar variables críticas
```bash
# Editar .env.production con valores reales
nano .env.production
```

### Variables requeridas:
```env
# Supabase (obligatorio)
SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-real
SUPABASE_ANON_KEY=tu-anon-key-real
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-real

# Sitio (obligatorio)
NEXT_PUBLIC_SITE_URL=https://tu-dominio.com

# Feature Flags (opcional)
COMING_SOON=false

# WhatsApp (opcional)
NEXT_PUBLIC_WHATSAPP_PHONE=+56912345678

# Analytics (opcional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

## 🚀 Deploy a Staging

### Opción 1: Vercel (Recomendado)
```bash
# Instalar Vercel CLI
npm i -g vercel

# Login a Vercel
vercel login

# Deploy a staging
vercel

# Deploy a producción
vercel --prod
```

### Opción 2: Netlify
```bash
# Instalar Netlify CLI
npm i -g netlify-cli

# Login a Netlify
netlify login

# Deploy
netlify deploy --prod
```

### Opción 3: Railway
```bash
# Instalar Railway CLI
npm i -g @railway/cli

# Login a Railway
railway login

# Deploy
railway up
```

## 🔒 Configuración de Variables en Plataforma

### Vercel
1. Ve a tu proyecto en Vercel Dashboard
2. Settings → Environment Variables
3. Agrega todas las variables de `.env.production`
4. Marca las variables como "Production" y "Preview"

### Netlify
1. Ve a tu sitio en Netlify Dashboard
2. Site settings → Environment variables
3. Agrega todas las variables de `.env.production`

### Railway
1. Ve a tu proyecto en Railway Dashboard
2. Variables → Add Variable
3. Agrega todas las variables de `.env.production`

## 🧪 Verificaciones Post-Deploy

### 1. Verificar funcionalidad básica
- [ ] Página principal carga correctamente
- [ ] Redirecciones funcionan
- [ ] APIs responden correctamente
- [ ] Formularios funcionan
- [ ] WhatsApp funciona (si configurado)

### 2. Verificar SEO
- [ ] robots.txt accesible
- [ ] sitemap.xml accesible
- [ ] Meta tags correctos
- [ ] Canonical URLs correctos

### 3. Verificar performance
- [ ] Lighthouse score > 90
- [ ] Tiempo de carga < 3s
- [ ] Core Web Vitals en verde

### 4. Verificar seguridad
- [ ] HTTPS funcionando
- [ ] Headers de seguridad configurados
- [ ] Rate limiting funcionando

## 📊 Monitoreo Post-Deploy

### 1. Configurar alertas
- Errores 500+
- Tiempo de respuesta > 5s
- Disponibilidad < 99.9%

### 2. Monitorear métricas
- Usuarios activos
- Páginas más visitadas
- Errores más comunes
- Performance metrics

### 3. Configurar analytics
- Google Analytics
- Error tracking (Sentry)
- Performance monitoring

## 🚨 Troubleshooting

### Error: "No QueryClient set"
- Verificar que `QueryClientProvider` esté configurado en `app/providers.tsx`

### Error: "Cannot find module"
- Limpiar cache: `rm -rf .next && npm run build`

### Error: Variables de entorno no encontradas
- Verificar que estén configuradas en la plataforma de deploy
- Verificar que no tengan espacios extra

### Error: Supabase connection failed
- Verificar URL y claves de Supabase
- Verificar que el proyecto esté activo
- Verificar políticas de RLS

## 📞 Contacto

Si tienes problemas con el deploy:
1. Revisa los logs de la plataforma
2. Ejecuta `npm run deploy:staging` localmente
3. Verifica la configuración de variables de entorno
4. Contacta al equipo de desarrollo

---

**⚠️ IMPORTANTE:** Nunca subas `.env.production` al repositorio. Está en `.gitignore` por seguridad.
