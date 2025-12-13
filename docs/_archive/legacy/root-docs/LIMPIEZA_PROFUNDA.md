# Limpieza Profunda del Directorio Raíz - Segunda Revisión

**Fecha:** 2025-11-29  
**Objetivo:** Segunda revisión profunda para eliminar archivos obsoletos, duplicados y temporales.

## Archivos Eliminados/Movidos en Segunda Revisión

### Archivos de Configuración Obsoletos → `.temp-files/`
- `.eslintrc.json` - **OBSOLETO** - El proyecto usa `eslint.config.mjs` (Next.js 15 flat config)
- `package-lock.json` - **NO NECESARIO** - El proyecto usa `pnpm` (tiene `pnpm-lock.yaml`)

### Archivos de Build Generados → `.temp-files/`
- `tsconfig.tsbuildinfo` - Archivo de build de TypeScript (309KB), regenerable
- `static-build/` - Directorio completo de build estático generado (2.5MB), regenerable

### Archivos de Entorno Temporales → `.temp-files/`
- `.env.audit.local` - Archivo de entorno dummy para auditorías, no necesario en producción

### Archivos de Git Obsoletos → `.temp-files/`
- `.git-rewrite-mailmap` - Archivo de reescritura de historial de git, no necesario
- `.mailmap` - Archivo de mapeo de correos de git, no necesario

## Actualización de .gitignore

Se agregaron las siguientes reglas para prevenir que archivos similares se commiteen:

```gitignore
# TypeScript build info
*.tsbuildinfo
tsconfig.tsbuildinfo

# Package managers (using pnpm)
package-lock.json
yarn.lock

# Generated builds
static-build/

# Snapshots
.snapshots/

# Git rewrite files
.git-rewrite-mailmap
.mailmap
```

## Estado Final del Directorio Raíz

### Archivos de Configuración Esenciales (Permanece)
- `package.json` - Dependencias del proyecto
- `pnpm-lock.yaml` - Lock file de pnpm
- `tsconfig.json` - Configuración TypeScript principal
- `tsconfig.jest.json` - Configuración TypeScript para Jest
- `next.config.mjs` - Configuración Next.js
- `tailwind.config.ts` - Configuración Tailwind
- `eslint.config.mjs` - Configuración ESLint (flat config)
- `postcss.config.mjs` - Configuración PostCSS
- `jest.config.ts` - Configuración Jest principal
- `jest.config.visitScheduler.js` - Configuración Jest adicional
- `playwright.config.visitScheduler.ts` - Configuración Playwright
- `lighthouserc.json` - Configuración Lighthouse
- `lighthouserc-flash-videos.json` - Configuración Lighthouse adicional
- `next-env.d.ts` - Tipos de Next.js

### Archivos de Documentación (Permanece)
- `README.md` - Documentación principal

### Archivos de Configuración Git/Editor (Permanece)
- `.gitignore` - Configuración Git
- `.cursorignore` - Configuración Cursor
- `.eslintignore` - Configuración ESLint ignore

### Archivos de Entorno (Permanece - No commiteados)
- `.env.local` - Variables de entorno local
- `.env.production` - Variables de entorno de producción

### Directorios Principales (Permanece)
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
- `content/` - Contenido

### Directorios Generados/Ignorados (Permanece - En .gitignore)
- `.next/` - Build de Next.js
- `node_modules/` - Dependencias
- `.temp-files/` - Archivos temporales
- `coverage/` - Reportes de coverage
- `test-results/` - Resultados de tests
- `playwright-report/` - Reportes Playwright
- `.snapshots/` - Snapshots (ahora en .gitignore)

### Directorios a Revisar
- `Imagenes/` - Directorio con mayúscula (2.3MB), considerar:
  - Mover a `public/images/` si son assets estáticos
  - O eliminar si no se usan

## Resumen de Cambios

### Primera Limpieza
- **20 archivos** de documentación movidos a `docs/root-docs/`
- **4 archivos** temporales movidos a `.temp-files/`

### Segunda Limpieza (Profunda)
- **7 archivos/directorios** adicionales movidos a `.temp-files/`:
  - 2 archivos de configuración obsoletos
  - 2 archivos de build generados
  - 1 archivo de entorno temporal
  - 2 archivos de git obsoletos
  - 1 directorio de build estático

### Total Limpiado
- **31 archivos/directorios** organizados o movidos
- **Reducción significativa** de archivos en raíz
- **.gitignore actualizado** para prevenir futuros problemas

## Espacio Liberado

Aproximadamente **3MB+** de archivos movidos a `.temp-files/`:
- `tsconfig.tsbuildinfo`: 309KB
- `package-lock.json`: 403KB
- `static-build/`: 2.5MB
- Otros archivos menores

## Próximos Pasos Recomendados

1. **Revisar `.temp-files/`:**
   - Confirmar que los archivos no se necesitan
   - Eliminar permanentemente después de verificación

2. **Revisar directorio `Imagenes/`:**
   - Verificar uso en el código
   - Mover a `public/images/` o eliminar

3. **Revisar `.snapshots/`:**
   - Verificar si se usa para testing
   - Si no se usa, puede eliminarse

4. **Considerar limpieza de `backups/`:**
   - Los backups antiguos pueden eliminarse
   - Mantener solo los más recientes

## Notas Importantes

- Todos los archivos movidos están en `.temp-files/` para revisión antes de eliminación permanente
- El `.gitignore` ha sido actualizado para prevenir que archivos similares se commiteen
- El proyecto ahora usa solo `pnpm` (no `npm` ni `yarn`)
- El proyecto usa ESLint flat config (`eslint.config.mjs`) en lugar del formato antiguo

