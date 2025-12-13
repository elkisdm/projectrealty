# Rama Dev - Lista para Trabajar

**Rama:** `dev`  
**Fecha:** 2025-11-29  
**Estado:** ✅ Completamente limpia y organizada

## Estructura Final

### 📁 Directorio Raíz (9 directorios - Solo código esencial)

```
app/          # Next.js App Router
components/   # Componentes React
config/       # Configuración activa
hooks/        # Custom hooks
lib/          # Utilidades y helpers
public/       # Assets estáticos
schemas/      # Schemas Zod
tests/        # Tests
types/        # Tipos TypeScript
```

**Archivos de configuración:**
- `package.json`, `tsconfig.json`, `next.config.mjs`, etc.
- `README.md` - Documentación principal

### 📦 _workspace/ (Todo lo demás)

```
_workspace/
  ├── docs/           # Toda la documentación
  ├── scripts/        # Scripts de utilidad
  ├── data/           # Datos, backups, fuentes
  ├── coverage/       # Coverage reports (generado)
  ├── test-results/   # Test results (generado)
  └── playwright-report/ # Playwright reports (generado)
```

## Cambios Realizados

1. ✅ Movido `Imagenes/` → `public/images/`
2. ✅ Movido `stores/` → `lib/stores/`
3. ✅ Movido `content/` → `lib/content/`
4. ✅ Movido `stories/` → `_workspace/docs/stories/`
5. ✅ Movido `backups/` → `_workspace/data/backups/`
6. ✅ Movido `reports/` → `_workspace/docs/reports/`
7. ✅ Movido `supabase/` → `config/supabase/`
8. ✅ Movido `docs/` → `_workspace/docs/`
9. ✅ Movido `scripts/` → `_workspace/scripts/`
10. ✅ Movido `data/` → `_workspace/data/`
11. ✅ Movido toda documentación `.md` → `_workspace/docs/root-docs/`

## Configuración Actualizada

- ✅ `package.json`: Scripts apuntan a `_workspace/scripts/`
- ✅ `tsconfig.json`: Paths incluyen `_workspace/` y `@data/*` → `_workspace/data/*`
- ✅ `config/ingesta.config.js`: Rutas actualizadas
- ✅ Imports en código: Actualizados para usar nuevos paths

## Verificación

- ✅ TypeScript: Sin errores
- ✅ Build: Exitoso
- ✅ Estructura: Limpia y organizada

## Uso

### Desarrollo Diario
```bash
# Trabajar en código (todo en raíz)
cd app/
cd components/
cd lib/
```

### Scripts y Utilidades
```bash
# Ejecutar scripts (desde raíz)
pnpm run ingest
pnpm run deploy:staging
pnpm run check:production
```

### Documentación
```bash
# Ver documentación
_workspace/docs/
```

## Beneficios

1. **Raíz ultra limpia:** Solo 9 directorios de código
2. **Enfoque claro:** Separación total código/utilidades
3. **Fácil navegación:** Sin distracciones
4. **Workspace organizado:** Todo desarrollo en un lugar

## Próximos Pasos

La rama `dev` está lista para trabajar. Puedes:
- Trabajar en código fuente sin distracciones
- Acceder a utilidades en `_workspace/` cuando las necesites
- Mantener el workspace limpio y organizado

