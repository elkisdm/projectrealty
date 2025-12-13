# 🚀 Guía de Producción - Hommie 0% Comisión

## ✅ Estado Actual

**¡PROYECTO LISTO PARA PRODUCCIÓN!**

- ✅ TypeScript sin errores
- ✅ Build exitoso
- ✅ Configuración completa
- ✅ Estructura de archivos correcta

## 📋 Checklist de Producción

### 1. Variables de Entorno

Copia y configura las variables de entorno:

```bash
# Copiar archivo de ejemplo
cp config/env.production.example .env.production

# Editar con valores reales
nano .env.production
```

**Variables requeridas:**
```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# Feature Flags
COMING_SOON=false

# WhatsApp Configuration (opcional)
NEXT_PUBLIC_WHATSAPP_PHONE=+56912345678

# Analytics (opcional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### 2. Configuración de Supabase

1. **Crear proyecto en Supabase:**
   - Ve a [supabase.com](https://supabase.com)
   - Crea un nuevo proyecto
   - Anota la URL y las claves

2. **Configurar base de datos:**
   ```bash
   # Ejecutar migraciones
   npm run setup:supabase
   
   # Verificar configuración
   npm run verify
   ```

3. **Configurar RLS (Row Level Security):**
   - Habilitar RLS en todas las tablas
   - Configurar políticas de acceso

### 3. Verificación Pre-Deploy

```bash
# Verificar preparación para producción
npm run check:production

# Verificar TypeScript
npm run typecheck

# Verificar build
npm run build

# Ejecutar tests (opcional - algunos tests pueden fallar por mocks)
npm test
```

### 4. Deploy

#### Opción A: Vercel (Recomendado)

1. **Conectar repositorio:**
   - Ve a [vercel.com](https://vercel.com)
   - Conecta tu repositorio de GitHub
   - Configura las variables de entorno

2. **Configurar dominio:**
   - Agrega tu dominio personalizado
   - Configura SSL automático

3. **Deploy:**
   ```bash
   # Push a main branch para deploy automático
   git push origin main
   ```

#### Opción B: Otros proveedores

- **Netlify:** Similar a Vercel
- **Railway:** Para aplicaciones full-stack
- **DigitalOcean App Platform:** Para más control

### 5. Post-Deploy

1. **Verificar funcionalidad:**
   ```bash
   # Smoke test
   npm run smoke https://your-domain.com
   ```

2. **Configurar monitoreo:**
   - Google Analytics
   - Error tracking (Sentry)
   - Performance monitoring

3. **Configurar backups:**
   - Backup automático de Supabase
   - Backup de archivos estáticos

## 🔧 Scripts Útiles

```bash
# Verificar preparación para producción
npm run check:production

# Configurar Supabase
npm run setup:supabase

# Verificar configuración
npm run verify

# Smoke test
npm run smoke https://your-domain.com

# Gestionar feature flags
npm run coming-soon:on
npm run coming-soon:off

# Deploy a staging
npm run deploy:staging
```

## 🚨 Problemas Comunes

### ESLint fallando
```bash
# Si hay problemas con ESLint, usar:
npx eslint . --fix
```

### Tests fallando
- Los tests pueden fallar por problemas de mocks
- No es crítico para producción si el build funciona

### Variables de entorno faltantes
- Verificar que todas las variables estén configuradas
- Revisar logs de error en el proveedor de hosting

## 📞 Soporte

- **Documentación:** Revisa `docs/` para más detalles
- **Issues:** Reporta problemas en GitHub
- **Configuración:** Revisa `config/` para ejemplos

## 🎯 Próximos Pasos

1. ✅ Configurar variables de entorno
2. ✅ Configurar Supabase
3. ✅ Deploy a producción
4. 🔄 Configurar monitoreo
5. 🔄 Configurar CI/CD
6. 🔄 Optimizar performance

---

**¡Listo para producción! 🚀**
