# Estructura de Rama Dev - Completamente Limpia

**Rama:** `dev`  
**Fecha:** 2025-11-29  
**Estado:** ✅ Completamente organizada

## Objetivo

Mantener el directorio raíz con **SOLO** código fuente esencial para desarrollo diario, moviendo todo lo demás a `_workspace/`.

## Estructura Final

### 📁 Directorio Raíz (9 directorios esenciales)

**Código fuente:**
- `app/` - Next.js App Router
- `components/` - Componentes React
- `hooks/` - Custom hooks
- `lib/` - Utilidades y helpers
- `public/` - Assets estáticos
- `schemas/` - Schemas Zod
- `tests/` - Tests
- `types/` - Tipos TypeScript

**Configuración:**
- `config/` - Configuración activa (incluye supabase/)

**Archivos de configuración:**
- `package.json`, `tsconfig.json`, `next.config.mjs`, etc.
- `README.md` - Documentación principal

### 📦 _workspace/ (Todo lo demás)

**Organización:**
- `_workspace/docs/` - Toda la documentación
- `_workspace/scripts/` - Todos los scripts de utilidad
- `_workspace/data/` - Datos, backups, fuentes
- `_workspace/coverage/` - Reportes de cobertura (generado)
- `_workspace/test-results/` - Resultados de tests (generado)
- `_workspace/playwright-report/` - Reportes Playwright (generado)

## Beneficios

1. **Raíz ultra limpia:** Solo 9 directorios de código esencial
2. **Enfoque claro:** Separación total entre código y utilidades
3. **Fácil navegación:** Sin distracciones en el directorio principal
4. **Workspace organizado:** Todo lo de desarrollo en un solo lugar

## Uso Diario

### Desarrollo
```bash
# Trabajar en código fuente (todo en raíz)
cd app/
cd components/
cd lib/
```

### Utilidades
```bash
# Scripts (desde raíz)
pnpm run ingest
pnpm run deploy:staging

# Documentación
_workspace/docs/
```

## Configuración Actualizada

- `package.json`: Scripts apuntan a `_workspace/scripts/`
- `tsconfig.json`: Paths incluyen `_workspace/`
- `config/ingesta.config.js`: Rutas apuntan a `_workspace/`

## Verificación

- ✅ TypeScript sin errores
- ✅ Build exitoso
- ✅ Imports actualizados
- ✅ Estructura limpia

