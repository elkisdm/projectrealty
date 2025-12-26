---
title: CTA WhatsApp robusto en /coming-soon
objective: Implementar CTA de WhatsApp con fallback seguro y tracking
area: [ui, api]
routes: [/coming-soon]
acceptance:
  - [x] AC1: buildWhatsAppUrl con prioridades
  - [x] AC2: CTA con fallback deshabilitado
  - [x] AC3: Analytics tracking
checks:
  - [ ] a11y
  - [ ] release-gate
refs: [/docs/ARQUITECTURA.md]
---

# CTA WhatsApp robusto en /coming-soon

## 🎯 Objetivo
Implementar un CTA de WhatsApp robusto en `/coming-soon` que funcione correctamente con diferentes configuraciones de entorno y proporcione fallback seguro cuando no esté configurado.

## 📋 Criterios de Aceptación

### AC1: buildWhatsAppUrl con prioridades
- [ ] Crear `lib/whatsapp.ts` con `buildWhatsAppUrl(opts?: { phoneE164?: string; message?: string; url?: string }): string|null`
- [ ] Prioridad 1: Si `NEXT_PUBLIC_WA_URL` existe → devolverla tal cual
- [ ] Prioridad 2: Si `WA_PHONE_E164` existe → construir `https://wa.me/<E164>?text=<urlencoded(WA_MESSAGE||'Hola')>`
- [ ] Prioridad 3: Si no hay datos → devolver `null`

### AC2: CTA con fallback deshabilitado
- [ ] Obtener url = `buildWhatsAppUrl(...)`
- [ ] Si url === null → renderizar botón deshabilitado con `title="Configura WhatsApp en Vercel"` y `aria-disabled`
- [ ] Si url → `<a target="_blank" rel="noopener" aria-label="Abrir WhatsApp">`

### AC3: Analytics tracking
- [ ] Disparar analytics `'cta_whatsapp_click'` con `{ source:'coming-soon' }`

## 🔧 Implementación

### Archivos a modificar
- `lib/whatsapp.ts` - Nueva función `buildWhatsAppUrl`
- `components/marketing/ComingSoonHero.tsx` - Integrar nueva función

### Archivos a crear
- Ninguno

### Dependencias
- Ninguna nueva

## ✅ Checklist

### Funcional
- [x] AC1 implementado
- [x] AC2 implementado
- [x] AC3 implementado

### Calidad
- [x] Tests pasando
- [x] TypeScript sin errores
- [x] Lint sin warnings

### A11y
- [ ] Screen reader compatible
- [ ] Keyboard navigation
- [ ] Color contrast OK

### Performance
- [ ] LCP ≤ 2.5s
- [ ] Bundle size OK
- [ ] No memory leaks

### Release Gate
- [x] Lint ✅
- [x] Type check ✅
- [x] Tests ✅
- [x] Build ✅
- [x] SEO check ✅
- [x] Robots check ✅
- [x] Root check ✅

## 📚 Referencias
- [/docs/ARQUITECTURA.md]
- [/docs/DECISIONES.md]

## ⚠️ Riesgos
- Riesgo: Variables de entorno no configuradas - mitigación: fallback seguro con botón deshabilitado
- Riesgo: Analytics no disponible - mitigación: try-catch en tracking

## 🎯 Estimación
- **Tiempo:** ≤2h
- **Complejidad:** Baja

## 🔍 Verificación
- `npm run dev` → `/coming-soon`
- Si NO hay env → botón deshabilitado con tooltip
- Configurando `WA_PHONE_E164="+569XXXXXXXX"` y `WA_MESSAGE="Hola Elkis"` → href wa.me visible
- `grep`:
  - `rg -n "buildWhatsAppUrl"`
  - `curl -s http://localhost:3000/coming-soon | grep -i "wa.me\|api.whatsapp.com"`
