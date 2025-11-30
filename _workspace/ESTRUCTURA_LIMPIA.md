# Estructura de Directorios Limpia

**Fecha:** 2025-11-29  
**Objetivo:** Mantener el directorio raíz limpio con solo código esencial, moviendo todo lo demás a `_workspace/`

## Estructura Final

### 📁 Directorio Raíz (11 directorios - Solo código esencial)

```
app/              # Next.js App Router
components/       # Componentes React
config/           # Configuración activa
hooks/            # Custom hooks
lib/              # Utilidades y helpers
public/           # Assets estáticos
schemas/          # Schemas Zod
tests/            # Tests
types/            # Tipos TypeScript
```

**Archivos de configuración:**
- `package.json`, `tsconfig.json`, `next.config.mjs`, etc.

### 📦 _workspace/ (6 directorios - Utilidades y desarrollo)

```
_workspace/
  ├── docs/           # Documentación completa
  ├── scripts/        # Scripts de utilidad (ingesta, deploy, etc.)
  ├── data/           # Datos mock, fuentes CSV, backups
  ├── reports/        # Reportes de auditorías, tests
  ├── stories/        # Story files y documentación de features
  ├── coverage/       # Reportes de cobertura (generado)
  ├── test-results/   # Resultados de tests E2E (generado)
  └── playwright-report/ # Reportes de Playwright (generado)
```

## Beneficios

1. **Raíz limpia:** Solo 11 directorios esenciales vs 25+ antes
2. **Enfoque claro:** El código fuente está separado de utilidades
3. **Fácil navegación:** Menos distracciones en el directorio principal
4. **Organización lógica:** Todo lo relacionado con desarrollo en un lugar

## Uso

### Scripts
Los scripts se ejecutan desde la raíz usando `package.json`:
```bash
pnpm run ingest          # Ejecuta _workspace/scripts/ingest-master.mjs
pnpm run deploy:staging  # Ejecuta _workspace/scripts/deploy-staging.mjs
```

### Imports
Los imports usan los paths configurados en `tsconfig.json`:
```typescript
// Datos
import { mockBuildings } from '@data/buildings.mock';

// Scripts (si es necesario)
import { iconTokens } from '@workspace/scripts/icon-gen/tokens';
```

### Configuración
La configuración de ingesta apunta a `_workspace/`:
- `SOURCES_DIR: '_workspace/data/sources'`
- `BACKUP_DIR: '_workspace/data/backups'`
- `REPORTS_DIR: '_workspace/docs/reports'`

## Notas

- Los directorios generados (`coverage/`, `test-results/`, etc.) están en `_workspace/` y en `.gitignore`
- La documentación está en `_workspace/docs/` para mantenerla separada del código
- Los scripts mantienen su funcionalidad pero están organizados en `_workspace/scripts/`

