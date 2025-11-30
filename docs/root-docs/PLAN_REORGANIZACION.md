# Plan de Reorganización de Directorios

**Fecha:** 2025-11-29  
**Objetivo:** Reducir de 25 directorios a ~15-18 directorios esenciales, consolidando y organizando mejor.

## Análisis Actual

### Directorios en Raíz: 25

**Esenciales (8):**
- `app/` - Next.js App Router ✅
- `components/` - Componentes React ✅
- `lib/` - Utilidades ✅
- `public/` - Assets estáticos ✅
- `hooks/` - Custom hooks ✅
- `types/` - Tipos TypeScript ✅
- `schemas/` - Schemas Zod ✅
- `tests/` - Tests ✅

**Configuración (2):**
- `config/` - Configuración (6 archivos)
- `supabase/` - Config Supabase (2 archivos) ⚠️ **CONSOLIDAR**

**Scripts y Herramientas (1):**
- `scripts/` - Scripts (73 archivos) ✅

**Documentación (3):**
- `docs/` - Documentación (53 archivos) ✅
- `reports/` - Reportes (59 archivos) ⚠️ **CONSOLIDAR**
- `stories/` - Stories (25 archivos) ⚠️ **CONSOLIDAR**

**Datos (3):**
- `data/` - Datos mock (9 archivos) ✅
- `backups/` - Backups (12 archivos, 7.1MB) ⚠️ **MOVER**
- `content/` - Contenido (1 archivo) ⚠️ **CONSOLIDAR**

**Estado (1):**
- `stores/` - Stores (1 archivo, 8KB) ⚠️ **CONSOLIDAR**

**Assets (1):**
- `Imagenes/` - Imágenes (4 archivos, 2.3MB) ⚠️ **MOVER**

**Generados (4):**
- `coverage/` - Coverage reports (en .gitignore) ✅
- `test-results/` - Test results (en .gitignore) ✅
- `playwright-report/` - Playwright reports (en .gitignore) ✅
- `static-build/` - Build estático (ya movido) ✅

## Plan de Reorganización

### 1. Consolidar Configuración
```
supabase/ → config/supabase/
```
**Razón:** Toda la configuración en un solo lugar

### 2. Consolidar Documentación
```
stories/ → docs/stories/
reports/ → docs/reports/ (ya existe, mover contenido)
```
**Razón:** Toda la documentación en un solo lugar

### 3. Consolidar Datos
```
backups/ → data/backups/
content/ → lib/content/ o data/content/
```
**Razón:** Todos los datos relacionados juntos

### 4. Consolidar Estado
```
stores/ → lib/stores/
```
**Razón:** Stores son utilidades de estado, van con lib

### 5. Mover Assets
```
Imagenes/ → public/images/
```
**Razón:** Assets estáticos deben estar en public/

## Estructura Propuesta (15 directorios)

### Esenciales (8) - Sin cambios
- `app/`
- `components/`
- `lib/` (ahora incluye stores/)
- `public/` (ahora incluye images/)
- `hooks/`
- `types/`
- `schemas/`
- `tests/`

### Configuración (1) - Consolidado
- `config/` (ahora incluye supabase/)

### Scripts (1) - Sin cambios
- `scripts/`

### Documentación (1) - Consolidado
- `docs/` (ahora incluye stories/ y reports/)

### Datos (1) - Consolidado
- `data/` (ahora incluye backups/ y content/)

### Generados (3) - Sin cambios (en .gitignore)
- `coverage/`
- `test-results/`
- `playwright-report/`

**Total: 15 directorios** (reducción de 25 a 15 = 40% menos)

## Cambios Detallados

### 1. Mover `supabase/` a `config/supabase/`
```bash
mv supabase config/supabase
```
**Actualizar referencias:**
- Scripts que usen `supabase/` → `config/supabase/`
- Documentación que mencione `supabase/`

### 2. Mover `stories/` a `docs/stories/`
```bash
mv stories docs/stories
```
**Actualizar referencias:**
- Ninguna (solo documentación)

### 3. Mover `reports/` a `docs/reports/`
```bash
# Ya existe docs/reports/, mover contenido
mv reports/* docs/reports/ 2>/dev/null
rmdir reports
```
**Actualizar referencias:**
- Scripts que generen reportes en `reports/` → `docs/reports/`
- Configuración de ingesta que use `REPORTS_DIR`

### 4. Mover `backups/` a `data/backups/`
```bash
mv backups data/backups
```
**Actualizar referencias:**
- Scripts de ingesta que usen `backups/` → `data/backups/`
- Configuración de ingesta que use `BACKUP_DIR`

### 5. Mover `content/` a `lib/content/`
```bash
mv content lib/content
```
**Actualizar referencias:**
- Imports de `content/` → `lib/content/` o `@lib/content/`

### 6. Mover `stores/` a `lib/stores/`
```bash
mv stores lib/stores
```
**Actualizar referencias:**
- Imports de `stores/` → `lib/stores/` o `@lib/stores/`
- Actualizar tsconfig paths si es necesario

### 7. Mover `Imagenes/` a `public/images/`
```bash
mv Imagenes public/images
```
**Actualizar referencias:**
- Rutas de imágenes en código
- Referencias en documentación

## Actualizaciones Necesarias

### Archivos de Configuración
1. **`config/ingesta.config.js`**
   - `BACKUP_DIR: 'backups'` → `BACKUP_DIR: 'data/backups'`
   - `REPORTS_DIR: 'reports'` → `REPORTS_DIR: 'docs/reports'`

2. **`tsconfig.json`**
   - Verificar paths si es necesario

3. **Scripts que referencien rutas**
   - Buscar y reemplazar referencias a directorios movidos

### Imports en Código
1. **Stores:**
   ```typescript
   // Antes
   import { useBuildingsStore } from '../stores/buildingsStore';
   
   // Después
   import { useBuildingsStore } from '@lib/stores/buildingsStore';
   ```

2. **Content:**
   ```typescript
   // Antes
   import { flashOffer } from '../content/flashOffer';
   
   // Después
   import { flashOffer } from '@lib/content/flashOffer';
   ```

3. **Imágenes:**
   ```typescript
   // Antes
   <img src="/Imagenes/..." />
   
   // Después
   <img src="/images/..." />
   ```

## Beneficios

1. **Menos directorios:** 25 → 15 (40% reducción)
2. **Mejor organización:** Agrupación lógica por función
3. **Más fácil navegación:** Menos carpetas en raíz
4. **Estándar Next.js:** Estructura más alineada con convenciones
5. **Mantenibilidad:** Más fácil encontrar archivos

## Riesgos y Consideraciones

1. **Breaking changes:** Actualizar todos los imports
2. **Scripts:** Actualizar rutas en scripts de ingesta
3. **Git history:** Los archivos mantendrán su historia
4. **Build:** Verificar que el build sigue funcionando
5. **Tests:** Verificar que los tests siguen funcionando

## Orden de Ejecución Recomendado

1. Mover `Imagenes/` → `public/images/` (más simple)
2. Mover `stores/` → `lib/stores/` (pocos archivos)
3. Mover `content/` → `lib/content/` (1 archivo)
4. Mover `stories/` → `docs/stories/` (solo docs)
5. Mover `backups/` → `data/backups/` (actualizar config)
6. Mover `reports/` → `docs/reports/` (actualizar config)
7. Mover `supabase/` → `config/supabase/` (actualizar scripts)

## Verificación Post-Reorganización

```bash
# Verificar que no hay imports rotos
pnpm typecheck

# Verificar que el build funciona
pnpm build

# Verificar que los tests pasan
pnpm test

# Verificar que los scripts funcionan
pnpm run ingest
```

