# REGLAS VIBE

## 📋 DESARROLLO

### Stories
- **1 chat = 1 story** (≤4h)
- **No refactors** sin story aprobada
- **Scope pequeño** y bien definido

### Pull Requests
- **PRs pequeños** y enfocados
- **Release gate** debe pasar:
  - ✅ Lint
  - ✅ Type check
  - ✅ Tests
  - ✅ Build
  - ✅ SEO check
  - ✅ Robots check
  - ✅ Root check

### Commits
- **Conventional Commits:** `type(scope): description`
- **Checklist obligatorio:**
  - [ ] A11y review
  - [ ] Telemetría agregada

## 🚫 RESTRICCIONES

### No tocar sin story
- `/app/` - Rutas y páginas
- `/lib/` - Lógica de negocio
- `/schemas/` - Modelos de datos
- `/components/` - UI components

### No modificar
- **Configuración** sin justificación
- **Dependencias** sin análisis de impacto
- **Estructura** sin ADR

## ✅ CHECKLISTS

### Antes de PR
- [ ] Story completada
- [ ] Tests pasando
- [ ] A11y validado
- [ ] Performance OK
- [ ] Release gate pasa

### Antes de merge
- [ ] Code review aprobado
- [ ] Tests en CI pasando
- [ ] Deploy preview OK
- [ ] Checklist completado
