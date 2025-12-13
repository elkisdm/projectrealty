---
title: Modal waitlist accesible (focus trap, ESC, overlay, reduce-motion) + API /api/waitlist
objective: Implementar modal waitlist completamente accesible con focus trap, manejo de teclado, overlay click, reduce-motion y API robusta
area: [ui, a11y, api, perf]
routes: [/api/waitlist, /coming-soon]
acceptance:
  - [ ] AC1: Modal accesible con focus trap y keyboard navigation
  - [ ] AC2: API /api/waitlist con validación y rate limiting
  - [ ] AC3: Formulario con validación client-side y server-side
  - [ ] AC4: Estados de loading, success y error con a11y
checks:
  - [ ] a11y
  - [ ] release-gate
refs: [/docs/ARQUITECTURA.md, /docs/DECISIONES.md]
---

# Modal waitlist accesible (focus trap, ESC, overlay, reduce-motion) + API /api/waitlist

## 🎯 Objetivo
Implementar modal waitlist completamente accesible que incluya focus trap, manejo de teclado (ESC), overlay click, soporte para `prefers-reduced-motion`, y API robusta con validación, rate limiting y manejo de errores.

## 📋 Criterios de Aceptación

### AC1: Modal accesible con focus trap y keyboard navigation
- [ ] Focus trap completo (Tab/Shift+Tab)
- [ ] ESC key cierra modal
- [ ] Click en overlay cierra modal
- [ ] Focus inicial en primer input
- [ ] Focus restaurado al cerrar
- [ ] Scroll lock en body
- [ ] Aria attributes apropiados (role="dialog", aria-modal="true")
- [ ] Soporte para `prefers-reduced-motion`

### AC2: API /api/waitlist con validación y rate limiting
- [ ] Validación con Zod schema
- [ ] Rate limiting (3 requests/min por IP)
- [ ] Manejo de emails duplicados (no error)
- [ ] Response format consistente
- [ ] Error handling robusto
- [ ] Logging apropiado

### AC3: Formulario con validación client-side y server-side
- [ ] Validación email en tiempo real
- [ ] Campo teléfono opcional
- [ ] Estados disabled durante submit
- [ ] Mensajes de error accesibles
- [ ] Auto-complete apropiado
- [ ] Labels y aria-describedby

### AC4: Estados de loading, success y error con a11y
- [ ] Loading spinner accesible
- [ ] Success state con icono y mensaje
- [ ] Error state con role="alert"
- [ ] Aria-live regions para cambios
- [ ] Screen reader announcements
- [ ] Contraste WCAG AA

## 🔧 Implementación

### Archivos existentes (ya implementados)
- `components/ui/Modal.tsx` - Modal accesible con focus trap
- `components/marketing/WaitlistForm.tsx` - Formulario con validación
- `app/api/waitlist/route.ts` - API con rate limiting
- `schemas/models.ts` - Zod schemas

### Archivos a modificar
- `components/marketing/WaitlistForm.tsx` - Mejorar a11y y estados
- `app/api/waitlist/route.ts` - Mejorar error handling

### Archivos a crear
- `components/marketing/WaitlistModal.tsx` - Componente wrapper

### Dependencias
- `framer-motion` - Animaciones con reduce-motion
- `@supabase/supabase-js` - Base de datos
- `zod` - Validación
- `@lib/analytics` - Tracking

## ✅ Checklist

### Funcional
- [ ] AC1 implementado - Modal accesible completo
- [ ] AC2 implementado - API robusta
- [ ] AC3 implementado - Formulario validado
- [ ] AC4 implementado - Estados accesibles

### Calidad
- [ ] Tests pasando
- [ ] TypeScript sin errores
- [ ] Lint sin warnings
- [ ] Rate limiting funcional
- [ ] Error handling completo

### A11y
- [ ] Focus trap funcional
- [ ] Keyboard navigation completa
- [ ] Screen reader compatible
- [ ] Color contrast WCAG AA
- [ ] Aria attributes correctos
- [ ] Reduce-motion respetado
- [ ] Aria-live regions

### Performance
- [ ] LCP no afectado
- [ ] Bundle size OK
- [ ] No memory leaks
- [ ] Rate limiting eficiente
- [ ] Animaciones optimizadas

### Release Gate
- [ ] Lint ✅
- [ ] Type check ✅
- [ ] Tests ✅
- [ ] Build ✅
- [ ] SEO check ✅
- [ ] Robots check ✅
- [ ] Root check ✅

## 📚 Referencias
- [/docs/ARQUITECTURA.md] - Estructura de componentes
- [/docs/DECISIONES.md] - Decisiones de diseño
- [WCAG 2.1 Guidelines] - Accesibilidad
- [Framer Motion docs] - Animaciones
- [Supabase docs] - Base de datos

## ⚠️ Riesgos
- **Rate Limiting**: In-memory puede no escalar - mitigación: usar Redis en producción
- **Focus Management**: Complejidad en edge cases - mitigación: testing exhaustivo
- **A11y**: Glass effects pueden afectar contraste - mitigación: testing con herramientas
- **API**: Dependencia de Supabase - mitigación: error handling robusto

## 🎯 Estimación
- **Tiempo:** ≤3h (mayoría ya implementado)
- **Complejidad:** Media

## 📝 Notas de Implementación

### Modal Accesible
```typescript
// Focus trap implementation
const getFocusableElements = () => {
  return Array.from(
    modalRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
  ).filter((el) => !el.hasAttribute('disabled')) as HTMLElement[];
};
```

### API Rate Limiting
```typescript
// In-memory rate limiting (Redis en producción)
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minuto
const RATE_LIMIT_MAX_REQUESTS = 3;
```

### Formulario Validación
```typescript
// Client-side validation
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
```

### Estados Accesibles
- Loading: Spinner con aria-label
- Success: Icono con aria-hidden, mensaje con role="status"
- Error: role="alert" para screen readers
- Aria-live="polite" para cambios de estado

### Tracking Events
- `waitlist_open` - Al abrir modal
- `waitlist_submit` - Al enviar formulario
- `waitlist_success` - Al completar exitosamente
- `waitlist_close` - Al cerrar modal

### A11y Features
- Focus trap completo
- ESC key handling
- Overlay click
- Scroll lock
- Aria attributes apropiados
- Reduce-motion support
- Screen reader announcements

### API Response Format
```typescript
// Success
{ success: true, message: '¡Te agregamos a la lista de espera!' }

// Error
{ success: false, error: 'Error específico' }

// Rate limit
{ success: false, error: 'Demasiadas solicitudes. Intenta de nuevo en 1 minuto.' }
```

## 🔍 Testing

### A11y Testing
- [ ] Focus trap con Tab/Shift+Tab
- [ ] ESC key cierra modal
- [ ] Overlay click cierra modal
- [ ] Screen reader navigation
- [ ] Color contrast testing
- [ ] Keyboard-only navigation

### API Testing
- [ ] Rate limiting funcional
- [ ] Validación de email
- [ ] Manejo de duplicados
- [ ] Error responses
- [ ] Success responses

### Integration Testing
- [ ] Formulario completo flow
- [ ] Estados de loading/success/error
- [ ] Modal open/close
- [ ] Analytics tracking
- [ ] Database persistence
