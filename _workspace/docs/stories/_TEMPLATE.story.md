---
title: <corto>
objective: <qué resuelve>
area: [ui|api|data|seo|a11y|perf]
routes: [/path, /api/...]
acceptance:
  - [ ] AC1
  - [ ] AC2
  - [ ] AC3
checks:
  - [ ] a11y
  - [ ] release-gate
refs: [/docs/*.md]
---

# <Título de la Story>

## 🎯 Objetivo
<Descripción clara de qué resuelve esta story>

## 📋 Criterios de Aceptación

### AC1: <Descripción>
- [ ] Criterio específico 1
- [ ] Criterio específico 2

### AC2: <Descripción>
- [ ] Criterio específico 1
- [ ] Criterio específico 2

### AC3: <Descripción>
- [ ] Criterio específico 1
- [ ] Criterio específico 2

## 🔧 Implementación

### Archivos a modificar
- `ruta/al/archivo.tsx`
- `ruta/al/archivo.ts`

### Archivos a crear
- `ruta/nuevo/archivo.tsx`

### Dependencias
- Ninguna nueva
- Actualizar: `package.json`

## ✅ Checklist

### Funcional
- [ ] AC1 implementado
- [ ] AC2 implementado
- [ ] AC3 implementado

### Calidad
- [ ] Tests pasando
- [ ] TypeScript sin errores
- [ ] Lint sin warnings

### A11y
- [ ] Screen reader compatible
- [ ] Keyboard navigation
- [ ] Color contrast OK

### Performance
- [ ] LCP ≤ 2.5s
- [ ] Bundle size OK
- [ ] No memory leaks

### Release Gate
- [ ] Lint ✅
- [ ] Type check ✅
- [ ] Tests ✅
- [ ] Build ✅
- [ ] SEO check ✅
- [ ] Robots check ✅
- [ ] Root check ✅

## 📚 Referencias
- [/docs/ARQUITECTURA.md]
- [/docs/DECISIONES.md]
- [Documentación externa si aplica]

## ⚠️ Riesgos
- Riesgo 1: mitigación
- Riesgo 2: mitigación

## 🎯 Estimación
- **Tiempo:** ≤4h
- **Complejidad:** Baja/Media/Alta
