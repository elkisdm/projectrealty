# 🧪 Guía de Testing Manual - MVP

Este documento contiene checklists completos para testing manual antes de cada release del MVP.

## 📋 Checklist General Pre-Release

Antes de marcar cualquier feature como completa o hacer un release:

- [ ] TypeScript compila sin errores (`pnpm run typecheck`)
- [ ] Linter sin errores críticos (`pnpm run lint`)
- [ ] Build exitoso (`pnpm run build`)
- [ ] Tests automatizados pasan (`pnpm run test`)
- [ ] Tests de humo pasan (`pnpm run test:smoke`) - si servidor está corriendo
- [ ] Checklist manual ejecutado (ver secciones abajo)

---

## 🏠 Home Page (`/`)

### Funcionalidad Básica

- [ ] **Hero se muestra correctamente**
  - [ ] Imagen/video se carga
  - [ ] Texto principal visible
  - [ ] CTAs visibles y clickeables

- [ ] **Grids de unidades se cargan**
  - [ ] Se muestran unidades destacadas
  - [ ] Cards de unidades renderizan correctamente
  - [ ] Imágenes de unidades se cargan
  - [ ] Precios se muestran correctamente

- [ ] **StickySearchBar funciona**
  - [ ] Se muestra en la parte superior
  - [ ] Campos de búsqueda son funcionales
  - [ ] Búsqueda redirige a `/buscar` con parámetros correctos

- [ ] **Navegación funciona**
  - [ ] Links del header funcionan
  - [ ] Navegación a `/buscar` funciona
  - [ ] Logo redirige a home

### Responsive

- [ ] **Mobile (< 640px)**
  - [ ] Layout se adapta correctamente
  - [ ] StickySearchBar es funcional
  - [ ] Grid de unidades se ajusta
  - [ ] CTAs son accesibles

- [ ] **Tablet (640px - 1024px)**
  - [ ] Layout intermedio funciona
  - [ ] Grid de unidades se ajusta

- [ ] **Desktop (> 1024px)**
  - [ ] Layout completo se muestra
  - [ ] Todos los elementos visibles

---

## 🔍 Search Page (`/buscar`)

### Funcionalidad Básica

- [ ] **Filtros funcionan**
  - [ ] Filtro por comuna funciona
  - [ ] Filtro por precio mínimo/máximo funciona
  - [ ] Filtro por dormitorios funciona
  - [ ] Al aplicar filtros, URL se actualiza con query params
  - [ ] Resultados se actualizan al cambiar filtros

- [ ] **Resultados se actualizan**
  - [ ] Resultados se muestran después de aplicar filtros
  - [ ] Loading state se muestra mientras carga
  - [ ] Paginación funciona (si hay más de 12 resultados)
  - [ ] Ordenamiento funciona (precio, ubicación, relevancia)

- [ ] **Estados de resultados**
  - [ ] Estado vacío se muestra cuando no hay resultados
  - [ ] Mensaje de error se muestra si hay error
  - [ ] Estado de carga se muestra mientras busca

### Navegación

- [ ] **Click en unidad**
  - [ ] Al hacer click en una card de unidad, navega a property page
  - [ ] URL es correcta (`/property/[slug]` o `/arriendo/departamento/[comuna]/[slug]`)

### Responsive

- [ ] **Mobile**
  - [ ] Filtros son accesibles (modal o drawer)
  - [ ] Grid de resultados se ajusta
  - [ ] Paginación funciona

- [ ] **Tablet**
  - [ ] Layout intermedio funciona

- [ ] **Desktop**
  - [ ] Filtros en sidebar o barra superior
  - [ ] Grid completo visible

---

## 🏢 Property Page (`/property/[slug]`)

### Funcionalidad Básica

- [ ] **Galería de imágenes funciona**
  - [ ] Imágenes se cargan correctamente
  - [ ] Click en imagen abre lightbox
  - [ ] Navegación entre imágenes en lightbox funciona (flechas o clicks)
  - [ ] Botón cerrar (X) cierra lightbox
  - [ ] Escape cierra lightbox

- [ ] **Sticky booking card funciona**
  - [ ] **Desktop:** Card sticky en sidebar
    - [ ] Precio se muestra correctamente
    - [ ] Botón "Agendar visita" funciona
    - [ ] Botón "WhatsApp" funciona
  - [ ] **Mobile:** Sticky bar en la parte inferior
    - [ ] Se muestra al hacer scroll
    - [ ] Precio visible
    - [ ] Botones accesibles

- [ ] **Tabs de contenido funcionan**
  - [ ] Click en tab cambia contenido
  - [ ] Contenido se muestra correctamente
  - [ ] URLs con hash funcionan (ej: `/property/slug#amenities`)

- [ ] **Unidades similares se muestran**
  - [ ] Se muestran unidades relacionadas
  - [ ] Cards son clickeables
  - [ ] Navegan a otras property pages

- [ ] **WhatsApp funciona**
  - [ ] Botón de WhatsApp es visible
  - [ ] Al hacer click, se abre WhatsApp
  - [ ] Mensaje pre-llenado incluye información de la propiedad
  - [ ] URL de WhatsApp es correcta

- [ ] **Agendar visita funciona**
  - [ ] Botón "Agendar visita" abre modal
  - [ ] Modal se muestra correctamente
  - [ ] Calendario funciona (selección de fecha)
  - [ ] Selección de hora funciona
  - [ ] Formulario se completa correctamente
  - [ ] Validación de campos funciona
  - [ ] Envío muestra confirmación

### Responsive

- [ ] **Mobile**
  - [ ] Galería se adapta (grid 1+4 o stack)
  - [ ] Sticky bar inferior visible
  - [ ] Tabs funcionan con scroll horizontal o vertical

- [ ] **Tablet**
  - [ ] Layout intermedio funciona

- [ ] **Desktop**
  - [ ] Sidebar sticky visible
  - [ ] Layout de 2/3 + 1/3 funciona

---

## 🌐 Navegadores

### Chrome

- [ ] Home page funciona
- [ ] Search page funciona
- [ ] Property page funciona
- [ ] Modales y dropdowns funcionan
- [ ] Formularios funcionan

### Firefox

- [ ] Home page funciona
- [ ] Search page funciona
- [ ] Property page funciona
- [ ] Modales y dropdowns funcionan

### Safari (si es posible)

- [ ] Home page funciona
- [ ] Search page funciona
- [ ] Property page funciona
- [ ] Modales funcionan

### Mobile Safari (iOS)

- [ ] Layout responsive funciona
- [ ] Touch interactions funcionan
- [ ] Scroll funciona correctamente
- [ ] Sticky elements funcionan

---

## 🎨 Visual y UX

### Temas

- [ ] **Light mode**
  - [ ] Todos los colores se ven correctamente
  - [ ] Contraste es suficiente
  - [ ] Texto es legible

- [ ] **Dark mode**
  - [ ] Toggle funciona (si está disponible)
  - [ ] Todos los colores se ven correctamente
  - [ ] Contraste es suficiente
  - [ ] Texto es legible

### Animaciones

- [ ] Animaciones no son excesivas
- [ ] Respeta `prefers-reduced-motion` (si está configurado)
- [ ] Transiciones son suaves

### Performance Visual

- [ ] Imágenes cargan progresivamente
- [ ] No hay "flash" de contenido sin estilo (FOUC)
- [ ] Loading states se muestran apropiadamente

---

## ⚡ Performance

### Core Web Vitals

- [ ] **LCP (Largest Contentful Paint) < 2.5s**
  - [ ] Home page: LCP < 2.5s
  - [ ] Search page: LCP < 2.5s
  - [ ] Property page: LCP < 2.5s
  - [ ] Verificar con Lighthouse o Playwright tests

- [ ] **FID/INP (First Input Delay / Interaction to Next Paint) < 100ms/200ms**
  - [ ] Primer click en botón responde rápido
  - [ ] Interacciones son fluidas
  - [ ] Verificar con Chrome DevTools Performance tab

- [ ] **CLS (Cumulative Layout Shift) < 0.1**
  - [ ] No hay shifts visuales significativos
  - [ ] Imágenes tienen dimensiones definidas
  - [ ] Verificar con Lighthouse

### Carga Inicial

- [ ] Home page carga rápido (< 3s en conexión 3G simulada)
- [ ] Search page carga rápido
- [ ] Property page carga rápido

### Interacciones

- [ ] Click en botones responde rápido (< 100ms)
- [ ] Navegación entre páginas es rápida
- [ ] Modal se abre rápidamente
- [ ] Filtros responden rápidamente

### Verificación con DevTools

- [ ] **Network tab:**
  - [ ] No hay requests innecesarios
  - [ ] Imágenes están optimizadas
  - [ ] JavaScript está minificado en producción

- [ ] **Performance tab:**
  - [ ] No hay renders innecesarios (React DevTools)
  - [ ] Memory no crece constantemente (no hay leaks)

- [ ] **Lighthouse:**
  - [ ] Ejecutar Lighthouse en Chrome DevTools
  - [ ] Performance score > 90
  - [ ] Verificar Core Web Vitals en reporte

### Verificación Automatizada

```bash
# Ejecutar tests de performance
pnpm run test:performance

# O ejecutar Lighthouse CLI (si está instalado)
lighthouse http://localhost:3000 --view
```

---

## 🔗 Integraciones

### Analytics

- [ ] **Google Analytics 4 (si está configurado):**
  - [ ] Eventos se trackean en GA4 Real-time
  - [ ] `page_view` se trackea en cada página
  - [ ] `property_view` se trackea en property pages
  - [ ] `cta_book_click` se trackea al hacer click
  - [ ] `cta_whatsapp_click` se trackea al hacer click
  - [ ] `filter_applied` se trackea al aplicar filtros
  - [ ] `visit_scheduled` se trackea al agendar visita

- [ ] **Meta Pixel (si está configurado):**
  - [ ] Eventos se trackean en Meta Events Manager
  - [ ] Eventos principales funcionan

### WhatsApp

- [ ] URL de WhatsApp se construye correctamente
- [ ] Mensaje incluye información de la propiedad
- [ ] Funciona tanto en desktop como mobile

---

## 🐛 Casos Edge y Errores

### Manejo de Errores

- [ ] **404 - Página no encontrada**
  - [ ] Property page con slug inválido muestra 404
  - [ ] Página 404 tiene mensaje claro
  - [ ] Link para volver a home funciona

- [ ] **Error de API**
  - [ ] Si falla carga de datos, se muestra mensaje de error
  - [ ] Usuario puede reintentar
  - [ ] No se rompe la aplicación

- [ ] **Estados vacíos**
  - [ ] Búsqueda sin resultados muestra mensaje apropiado
  - [ ] Property sin imágenes maneja graciosamente
  - [ ] Sin unidades disponibles muestra mensaje claro

### Validación de Formularios

- [ ] Formulario de búsqueda valida inputs
- [ ] Formulario de agendamiento valida todos los campos
- [ ] Mensajes de error son claros y útiles
- [ ] Campos requeridos están marcados

---

## 📱 Responsive Completo

### Breakpoints a Verificar

- [ ] **Mobile Small (< 375px)**
  - [ ] iPhone SE, dispositivos pequeños

- [ ] **Mobile (375px - 640px)**
  - [ ] iPhone, Android estándar

- [ ] **Tablet (640px - 1024px)**
  - [ ] iPad, tablets Android

- [ ] **Desktop (1024px - 1440px)**
  - [ ] Laptops estándar

- [ ] **Desktop Large (> 1440px)**
  - [ ] Monitores grandes

### Elementos Específicos por Breakpoint

- [ ] **StickySearchBar:** Funciona en todos los breakpoints
- [ ] **Sticky Booking Card:** Se adapta (sidebar en desktop, bar inferior en mobile)
- [ ] **Grid de unidades:** Se ajusta correctamente
- [ ] **Galería de imágenes:** Layout se adapta (grid 1+4 en desktop, stack en mobile)

---

## ✅ Checklist de Completitud

Antes de marcar el Sprint 8 como completo, verificar:

- [ ] Todos los checklists arriba ejecutados
- [ ] Issues encontrados documentados
- [ ] Issues críticos resueltos
- [ ] Issues menores documentados para siguiente sprint
- [ ] Build de producción exitoso
- [ ] Deploy a staging exitoso (si aplica)
- [ ] Testing en staging ejecutado

---

## 📝 Notas de Testing

### Proceso Recomendado

1. **Ejecutar tests automatizados primero**
   ```bash
   pnpm run test
   pnpm run test:smoke  # Si servidor está corriendo
   ```

2. **Testing manual por página**
   - Comenzar con Home
   - Luego Search
   - Finalmente Property

3. **Testing por dispositivo**
   - Desktop primero
   - Luego mobile (emulado o real)
   - Finalmente tablet

4. **Testing de integraciones**
   - Verificar Analytics en herramientas reales
   - Probar WhatsApp en dispositivo real

### Herramientas Útiles

- **Chrome DevTools:**
  - Network tab para verificar requests
  - Performance tab para profiling
  - Lighthouse para métricas

- **React DevTools:**
  - Profiler para verificar renders
  - Components para inspeccionar estado

- **Analytics:**
  - GA4 Real-time para verificar eventos
  - Meta Events Manager para verificar Pixel

---

## 🚨 Issues Conocidos

Documentar aquí issues encontrados durante testing que no bloquean el release pero deben ser resueltos:

- [ ] _Agregar issues encontrados aquí_

---

**Última actualización:** Enero 2025  
**Versión:** MVP 1.0




