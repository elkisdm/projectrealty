# Checklist de Producción

Checklist completo para deploy a producción del proyecto.

## Pre-Deploy

### Verificaciones Automáticas

Ejecuta el script de verificación (si existe):
```bash
pnpm build
pnpm typecheck
pnpm lint
```

### Verificaciones Manuales

#### 1. Variables de Entorno
- [ ] Todas las variables requeridas configuradas (ver [VARIABLES_ENTORNO.md](./VARIABLES_ENTORNO.md))
- [ ] `SUPABASE_URL` apunta al proyecto de producción
- [ ] `NEXT_PUBLIC_SITE_URL` tiene la URL real de producción
- [ ] `SUPABASE_SERVICE_ROLE_KEY` configurada correctamente
- [ ] Feature flags configurados según necesidades
- [ ] Variables de producción configuradas en plataforma de deploy (Vercel/Netlify)

#### 2. Supabase
- [ ] Proyecto de producción creado en Supabase
- [ ] Migraciones ejecutadas en producción
- [ ] Row Level Security (RLS) configurado
- [ ] Políticas de seguridad revisadas
- [ ] Backups configurados
- [ ] Claves de API generadas y configuradas

#### 3. Build y Compilación
- [ ] `pnpm build` completa sin errores
- [ ] `pnpm typecheck` pasa sin errores
- [ ] No hay warnings críticos en el build
- [ ] Tamaño de bundles razonable
- [ ] Imágenes optimizadas

#### 4. Tests
- [ ] Tests críticos pasando (>80%)
- [ ] Tests de integración pasando
- [ ] Tests de componentes core pasando

#### 5. Lint y Calidad
- [ ] `pnpm lint` con <5 errores
- [ ] Warnings críticos <50
- [ ] Código revisado y aprobado

#### 6. Funcionalidad Core
- [ ] Landing page carga correctamente
- [ ] Páginas de propiedad funcionan
- [ ] Sistema admin accesible
- [ ] APIs principales responden
- [ ] Formularios funcionan correctamente

---

## Deploy

### Configuración de Plataforma

#### Vercel (Recomendado)

1. **Conectar repositorio:**
   - [ ] Repositorio conectado a Vercel
   - [ ] Branch de producción configurado (main/master)

2. **Variables de entorno:**
   - [ ] Todas las variables configuradas en Vercel dashboard
   - [ ] Variables de producción separadas de desarrollo

3. **Configuración del proyecto:**
   - [ ] Framework preset: Next.js
   - [ ] Build command: `pnpm build`
   - [ ] Output directory: `.next`
   - [ ] Node.js version: 18.x o superior

4. **Dominio:**
   - [ ] Dominio personalizado configurado
   - [ ] SSL/HTTPS habilitado
   - [ ] DNS configurado correctamente

#### Netlify (Alternativa)

1. **Configuración:**
   - [ ] Build command: `pnpm build`
   - [ ] Publish directory: `.next`
   - [ ] Node version: 18.x o superior

2. **Variables de entorno:**
   - [ ] Configuradas en Netlify dashboard

---

## Post-Deploy

### Verificaciones Inmediatas

- [ ] Sitio accesible en la URL de producción
- [ ] Landing page carga correctamente
- [ ] No hay errores en la consola del navegador
- [ ] APIs responden correctamente
- [ ] Imágenes cargan correctamente
- [ ] Estilos aplicados correctamente

### Verificaciones Funcionales

- [ ] Navegación funciona correctamente
- [ ] Formularios envían datos correctamente
- [ ] Sistema admin accesible y funcional
- [ ] Páginas de propiedad muestran datos correctos
- [ ] Filtros y búsqueda funcionan
- [ ] WhatsApp links funcionan (si aplica)
- [ ] Analytics funcionando (si aplica)

### Verificaciones de Performance

- [ ] Tiempo de carga inicial <3s
- [ ] Lighthouse score >80
- [ ] Imágenes optimizadas
- [ ] No hay recursos bloqueantes

### Verificaciones de SEO

- [ ] Metadata correcta en todas las páginas
- [ ] Sitemap.xml accesible
- [ ] Robots.txt configurado
- [ ] Open Graph tags presentes

---

## Monitoreo

### Configurar Monitoreo

- [ ] Error tracking configurado (Sentry, LogRocket, etc.)
- [ ] Analytics configurado (Google Analytics, etc.)
- [ ] Uptime monitoring configurado
- [ ] Alertas configuradas

### Métricas a Monitorear

- [ ] Tasa de errores
- [ ] Tiempo de respuesta de APIs
- [ ] Uso de recursos (CPU, memoria)
- [ ] Tráfico y conversiones

---

## Rollback

### Procedimiento de Rollback

Si algo falla después del deploy:

1. **Rollback en Vercel:**
   ```bash
   # Opción 1: Desde dashboard
   # Ir a Deployments → Seleccionar versión anterior → Promote to Production
   
   # Opción 2: Desde CLI
   vercel rollback [deployment-url]
   ```

2. **Rollback en Netlify:**
   ```bash
   # Desde dashboard
   # Ir a Deploys → Seleccionar deploy anterior → Publish deploy
   ```

3. **Rollback manual:**
   ```bash
   # Revertir commit
   git revert HEAD
   git push origin main
   ```

### Checklist de Rollback

- [ ] Versión anterior identificada
- [ ] Rollback ejecutado
- [ ] Sitio funcionando correctamente
- [ ] Problema documentado
- [ ] Plan de corrección creado

---

## Documentación Post-Deploy

### Actualizar Documentación

- [ ] URL de producción documentada
- [ ] Credenciales de acceso documentadas (en lugar seguro)
- [ ] Procedimiento de rollback documentado
- [ ] Contactos de emergencia documentados

---

## Checklist Rápido

### Antes de Deploy
- [ ] Build exitoso
- [ ] Variables configuradas
- [ ] Supabase configurado
- [ ] Tests pasando

### Durante Deploy
- [ ] Deploy iniciado
- [ ] Variables de entorno configuradas
- [ ] Dominio configurado

### Después de Deploy
- [ ] Sitio accesible
- [ ] Funcionalidad verificada
- [ ] Monitoreo configurado
- [ ] Documentación actualizada

---

## Contactos de Emergencia

En caso de problemas críticos:

- **DevOps/Infraestructura:** [Contacto]
- **Desarrollador Principal:** [Contacto]
- **Product Owner:** [Contacto]

---

## Referencias

- [Guía de Deploy](./DEPLOY.md)
- [Variables de Entorno](./VARIABLES_ENTORNO.md)
- [Arquitectura](./ARQUITECTURA.md)



