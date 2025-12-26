# Limpieza del Directorio Raíz

**Fecha:** 2025-11-29  
**Objetivo:** Organizar archivos del directorio raíz moviendo documentación y archivos temporales a ubicaciones apropiadas.

## Archivos Movidos

### Documentación → `docs/root-docs/`
- `CHECKLIST_7_DIAS.md`
- `COTIZADOR_MEJORADO_RESUMEN.md`
- `COTIZADOR_SISTEMA_FUNCIONAL.md`
- `DATOS_REALES_IMPLEMENTADO.md`
- `DEPLOY.md`
- `DEPLOY_STATUS_DIA7.md`
- `ERROR_HANDLING_SUMMARY.md`
- `LINT_ANALYSIS.md`
- `PLAN_SIMPLIFICACION_7_DIAS.md`
- `PRODUCTION_README.md`
- `PULL_REQUEST.md`
- `QUOTATION_MASTER_CONTROL.md`
- `README-ICONS.md`
- `README_INGESTA.md`
- `REPORTE_ARQUITECTURA_DATOS_PARA_COTIZACIONES.md`
- `SPRINT_1_SUMMARY.md`
- `SPRINT_2_ROADMAP.md`
- `SPRINT_2_STORIES.md`
- `TESTING_FINAL_SUMMARY.md`
- `TESTING_SETUP_COMPLETED.md`
- `TESTING_SETUP_SUMMARY.md`

### Archivos Temporales → `.temp-files/`
- `build.log`
- `lint-report.txt`
- `debug.js`
- `PropertyClient_v1.tsx` (archivo no utilizado)

## Archivos que Permanecen en Raíz

### Documentación Esencial
- `README.md` - Documentación principal del proyecto (debe estar en raíz)

### Configuración
- `package.json` - Configuración de dependencias
- `tsconfig.json` - Configuración TypeScript
- `next.config.mjs` - Configuración Next.js
- `tailwind.config.ts` - Configuración Tailwind
- `eslint.config.mjs` - Configuración ESLint
- `postcss.config.mjs` - Configuración PostCSS
- `jest.config.ts` - Configuración Jest
- `jest.config.visitScheduler.js` - Configuración Jest adicional
- `playwright.config.visitScheduler.ts` - Configuración Playwright
- `lighthouserc.json` - Configuración Lighthouse
- `lighthouserc-flash-videos.json` - Configuración Lighthouse adicional

### Archivos del Sistema
- `next-env.d.ts` - Tipos de Next.js
- `.gitignore` - Configuración Git
- `.cursorignore` - Configuración Cursor

## Directorios en Raíz

### Estructura Principal
- `app/` - Aplicación Next.js
- `components/` - Componentes React
- `lib/` - Utilidades y helpers
- `hooks/` - Custom hooks
- `types/` - Tipos TypeScript
- `schemas/` - Schemas Zod
- `public/` - Archivos estáticos
- `config/` - Archivos de configuración
- `scripts/` - Scripts de utilidad
- `tests/` - Tests
- `docs/` - Documentación
- `reports/` - Reportes
- `data/` - Datos mock y fuentes
- `backups/` - Backups automáticos
- `supabase/` - Configuración Supabase
- `stories/` - Story files
- `stores/` - Stores de estado

### Directorios Temporales/Generados
- `.next/` - Build de Next.js (ignorado)
- `node_modules/` - Dependencias (ignorado)
- `.temp-files/` - Archivos temporales (ignorado)
- `coverage/` - Reportes de coverage (ignorado)
- `test-results/` - Resultados de tests (ignorado)
- `playwright-report/` - Reportes Playwright (ignorado)
- `static-build/` - Build estático (si existe)

### Directorios a Revisar
- `Imagenes/` - Directorio con mayúscula, considerar mover a `public/` o renombrar

## Cambios en .gitignore

Se agregó:
```
# Temporary files
.temp-files/
*.log
lint-report.txt
debug.js
```

## Próximos Pasos Recomendados

1. **Revisar directorio `Imagenes/`:**
   - Verificar si las imágenes se usan en el código
   - Considerar mover a `public/images/` si son assets estáticos
   - O eliminar si no se usan

2. **Revisar archivos en `.temp-files/`:**
   - `PropertyClient_v1.tsx` - Confirmar que no se necesita y eliminar
   - `build.log`, `lint-report.txt`, `debug.js` - Pueden eliminarse si no se necesitan

3. **Organizar documentación:**
   - Revisar archivos en `docs/root-docs/` y organizarlos por categoría si es necesario
   - Considerar mover algunos a `docs/_archive/` si son muy antiguos

## Resultado

El directorio raíz ahora está más limpio y organizado, con solo archivos esenciales de configuración y el README principal.

