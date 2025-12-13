# Workspace - Archivos de Desarrollo y Utilidades

Este directorio contiene todos los archivos que no son parte del código fuente principal, pero son necesarios para el desarrollo, documentación y mantenimiento del proyecto.

## Estructura

- **`docs/`** - Documentación completa del proyecto
- **`scripts/`** - Scripts de utilidad, ingesta, deploy, etc.
- **`data/`** - Datos mock, fuentes CSV, backups
- **`reports/`** - Reportes de auditorías, tests, etc.
- **`stories/`** - Story files y documentación de features
- **`coverage/`** - Reportes de cobertura de tests
- **`test-results/`** - Resultados de tests E2E
- **`playwright-report/`** - Reportes de Playwright

## Uso

Los scripts en `scripts/` se ejecutan desde la raíz del proyecto usando los comandos de `package.json`:

```bash
# Ejemplos
pnpm run ingest          # Ejecuta _workspace/scripts/ingest-master.mjs
pnpm run deploy:staging  # Ejecuta _workspace/scripts/deploy-staging.mjs
pnpm run check:production # Ejecuta _workspace/scripts/check-production-readiness.mjs
```

## Nota

Este directorio está separado del código fuente principal para mantener el directorio raíz limpio y enfocado solo en el código de la aplicación.










