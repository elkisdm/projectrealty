# 🚀 PLAN DE SPRINTS - IMPLEMENTACIÓN MVP

**Basado en:** `docs/ESPECIFICACION_COMPLETA_MVP.md`  
**Objetivo:** Implementar el MVP completo según especificación  
**Metodología:** 1 chat = 1 microtarea (según reglas del proyecto)  
**Fecha inicio:** Enero 2025  
**Estado:** 📋 PLANIFICACIÓN

---

## 📊 RESUMEN EJECUTIVO

### Alcance del MVP

**Páginas a implementar:**
1. ✅ `/` - Home (parcialmente implementado)
2. ⚠️ `/buscar` - Resultados de búsqueda (existe, necesita ajustes)
3. ⚠️ `/property/[slug]` - Página de unidad (existe, necesita rediseño según Assetplan)
4. ⚠️ Modal de Agendamiento (existe, necesita ajustes según especificación)

**Componentes críticos:**
- ✅ Sistema de temas (implementado)
- ⚠️ `UnitCard` (Elkis Unit Card según v2.0)
- ⚠️ `StickySearchBar` (Glass version)
- ⚠️ `PropertyPage` (rediseño según Assetplan)
- ⚠️ `VisitScheduler` (ajustes según especificación)

**APIs:**
- ✅ `/api/buildings` (existe)
- ⚠️ `/api/buildings/[slug]` (necesita retornar Unit, no Building)
- ⚠️ Endpoints de búsqueda con filtros

---

## 🎯 SPRINT 1: FUNDACIÓN Y DISEÑO SYSTEM

**Objetivo:** Implementar el Design System v2.0 y componentes base

### Microtarea 1.1: Implementar Elkis Unit Card
**Prioridad:** 🔴 CRÍTICA  
**Estimación:** 1 sesión

**Tareas:**
- [ ] Crear componente `UnitCard` según especificación v2.0
- [ ] Implementar estados: default, hover, loading
- [ ] Agregar tag flotante con efecto glass
- [ ] Agregar botón de favoritos (top right)
- [ ] Implementar hover con botón "Ver unidad" (desktop)
- [ ] Asegurar responsive (mobile/tablet/desktop)
- [ ] Tests básicos de renderizado

**Criterios de aceptación:**
- [ ] Card usa `rounded-2xl` (20px)
- [ ] Imagen con ratio 4:3
- [ ] Tag glass funcional
- [ ] Hover scale `[1.02]` con shadow-lg
- [ ] Funciona en light y dark mode
- [ ] Accesible (focus visible, aria-labels)

**Código de referencia:** Ver sección "Elkis Unit Card" en `ESPECIFICACION_COMPLETA_MVP.md`

---

### Microtarea 1.2: Implementar Sticky Search Bar (Glass)
**Prioridad:** 🔴 CRÍTICA  
**Estimación:** 1 sesión

**Tareas:**
- [ ] Crear componente `StickySearchBar`
- [ ] Implementar efecto `glass-strong`
- [ ] Forma `rounded-full` (pill)
- [ ] Borde `border-white/20` (dark mode)
- [ ] Botón buscar circular con Brand Violet
- [ ] Sticky behavior con scroll
- [ ] Animaciones estilo Airbnb

**Criterios de aceptación:**
- [ ] Efecto glass funcional con backdrop blur
- [ ] Sticky al hacer scroll
- [ ] Responsive (mobile/desktop)
- [ ] Botón buscar con Brand Violet `#8B6CFF`
- [ ] Accesible (keyboard navigation)

---

### Microtarea 1.3: Actualizar Tipografía (Inter Premium)
**Prioridad:** 🟡 MEDIA  
**Estimación:** 0.5 sesión

**Tareas:**
- [ ] Agregar `tracking-tight` a títulos (H1, H2)
- [ ] Agregar `tabular-nums` a precios
- [ ] Verificar escala tipográfica en componentes existentes
- [ ] Actualizar componentes base (botones, cards)

**Criterios de aceptación:**
- [ ] Títulos usan `tracking-tight`
- [ ] Precios usan `tabular-nums`
- [ ] Consistencia en toda la app

---

## 🎯 SPRINT 2: PÁGINA HOME

**Objetivo:** Implementar página Home según especificación

### Microtarea 2.1: Header con Sticky Search Bar
**Prioridad:** 🔴 CRÍTICA  
**Estimación:** 1 sesión

**Tareas:**
- [ ] Integrar `StickySearchBar` en Header
- [ ] Logo Elkis Realtor
- [ ] CTA WhatsApp (si aplica)
- [ ] Animaciones de aparición del search bar
- [ ] Responsive behavior

**Criterios de aceptación:**
- [ ] Search bar sticky funcional
- [ ] Header responsive
- [ ] Animaciones suaves

---

### Microtarea 2.2: Formulario de Búsqueda
**Prioridad:** 🔴 CRÍTICA  
**Estimación:** 1 sesión

**Tareas:**
- [ ] Implementar formulario con pills (Comuna, Tipo, Precio)
- [ ] Pills para selección rápida:
  - Dormitorios: Estudio, 1, 2, 3
  - NO incluir baños (según especificación)
- [ ] Validación con Zod
- [ ] Submit navega a `/buscar` con query params

**Criterios de aceptación:**
- [ ] Pills funcionales
- [ ] Validación correcta
- [ ] Navegación a resultados funciona

---

### Microtarea 2.3: Grids de Unidades Destacadas
**Prioridad:** 🔴 CRÍTICA  
**Estimación:** 1 sesión

**Tareas:**
- [ ] Implementar múltiples grids de unidades destacadas
- [ ] Cada grid es un carousel de `UnitCard`
- [ ] Grids segmentados: Por Comuna, Por Tipo, Por Precio, Destacadas
- [ ] Cada card navega a `/property/[slug]`
- [ ] Skeleton loading states

**Criterios de aceptación:**
- [ ] Múltiples grids funcionales
- [ ] Carousels con navegación
- [ ] Cards usan `UnitCard` implementado
- [ ] Navegación a property page funciona
- [ ] Loading states implementados

---

### Microtarea 2.4: Sección de Beneficios
**Prioridad:** 🟡 MEDIA  
**Estimación:** 0.5 sesión

**Tareas:**
- [ ] Implementar sección "Arrienda sin estrés"
- [ ] Implementar sección "Todo, aquí y ahora"
- [ ] Implementar sección "Somos líderes en el mercado"
- [ ] Contenido según especificación

**Criterios de aceptación:**
- [ ] 3 secciones de beneficios implementadas
- [ ] Contenido según especificación
- [ ] Responsive

---

## 🎯 SPRINT 3: PÁGINA DE RESULTADOS

**Objetivo:** Implementar página de resultados de búsqueda

### Microtarea 3.1: Página `/buscar` con Filtros
**Prioridad:** 🔴 CRÍTICA  
**Estimación:** 1 sesión

**Tareas:**
- [ ] Implementar página `/buscar`
- [ ] Barra de filtros (FilterBar)
- [ ] Grid de resultados con `UnitCard`
- [ ] Paginación
- [ ] Query params: `comuna`, `tipo`, `dormitorios`, `precioMin`, `precioMax`
- [ ] NO incluir filtro de baños

**Criterios de aceptación:**
- [ ] Filtros funcionales
- [ ] Grid de resultados con UnitCard
- [ ] Paginación funciona
- [ ] Query params correctos
- [ ] URL actualiza con filtros

---

### Microtarea 3.2: Estados de Resultados
**Prioridad:** 🟡 MEDIA  
**Estimación:** 0.5 sesión

**Tareas:**
- [ ] Estado vacío (sin resultados)
- [ ] Estado de carga (skeleton)
- [ ] Estado de error
- [ ] Mensajes informativos

**Criterios de aceptación:**
- [ ] Todos los estados implementados
- [ ] Mensajes claros y útiles

---

## 🎯 SPRINT 4: PÁGINA DE PROPIEDAD/UNIDAD

**Objetivo:** Rediseñar página de propiedad según Assetplan

### Microtarea 4.1: Breadcrumb y Header
**Prioridad:** 🟡 MEDIA  
**Estimación:** 0.5 sesión

**Tareas:**
- [ ] Implementar breadcrumb: `Home > Arriendo Departamentos > [Comuna] > [Edificio] > [Tipología]`
- [ ] Breadcrumb con JSON-LD para SEO
- [ ] Header con información básica

**Criterios de aceptación:**
- [ ] Breadcrumb funcional
- [ ] Navegación correcta
- [ ] SEO implementado

---

### Microtarea 4.2: Hero con Galería
**Prioridad:** 🔴 CRÍTICA  
**Estimación:** 1 sesión

**Tareas:**
- [ ] Galería con grid 1+4 (estilo Airbnb)
- [ ] Imágenes de unidad, tipología, áreas comunes
- [ ] Bordes `rounded-2xl` en esquinas externas
- [ ] Separación `gap-2` o `gap-4`
- [ ] Lightbox funcional

**Criterios de aceptación:**
- [ ] Galería con grid 1+4
- [ ] Imágenes optimizadas (next/image)
- [ ] Lightbox funcional
- [ ] Responsive

---

### Microtarea 4.3: Sticky Booking Card
**Prioridad:** 🔴 CRÍTICA  
**Estimación:** 1 sesión

**Tareas:**
- [ ] Card sticky con información económica
- [ ] Precio destacado (`text-3xl font-bold`)
- [ ] Bloque financiero con iconos (Wallet, Shield)
- [ ] CTA Principal: "Solicitar Visita" (Brand Violet)
- [ ] CTA Secundario: WhatsApp (verde o Aqua)
- [ ] Información: Arriendo fijo 3 meses, GC, Garantía, Reajuste

**Criterios de aceptación:**
- [ ] Card sticky funcional
- [ ] Información económica completa
- [ ] CTAs funcionales
- [ ] Responsive (mobile: bottom bar, desktop: sidebar)

---

### Microtarea 4.4: Tabs de Contenido
**Prioridad:** 🔴 CRÍTICA  
**Estimación:** 1 sesión

**Tareas:**
- [ ] Sistema de tabs: Detalle, Características, Requisitos, Preguntas Frecuentes
- [ ] Tab Detalle: código unidad, status, tipología, superficie, piso, vista, amoblado, política mascotas
- [ ] Tab Características: ubicación, metro cercano, características edificio, amenidades
- [ ] Tab Requisitos: documentación, condiciones financieras, duración contrato
- [ ] Tab FAQ: preguntas frecuentes

**Criterios de aceptación:**
- [ ] 4 tabs funcionales
- [ ] Contenido según especificación
- [ ] Navegación por teclado
- [ ] Responsive

---

### Microtarea 4.5: Sección de Unidades Similares
**Prioridad:** 🟡 MEDIA  
**Estimación:** 0.5 sesión

**Tareas:**
- [ ] Grid de unidades similares
- [ ] Usar `UnitCard` implementado
- [ ] Filtrado por comuna y tipo similar

**Criterios de aceptación:**
- [ ] Grid de similares funcional
- [ ] Navegación a otras unidades funciona

---

## 🎯 SPRINT 5: MODAL DE AGENDAMIENTO

**Objetivo:** Implementar modal de agendamiento según especificación

### Microtarea 5.1: Calendario (6 días, sin domingos)
**Prioridad:** 🔴 CRÍTICA  
**Estimación:** 1 sesión

**Tareas:**
- [ ] Calendario muestra 6 días siguientes
- [ ] Excluir domingos
- [ ] Horarios fijos: 9:00 - 20:00 hrs
- [ ] Slots de 1 hora
- [ ] Selección de fecha y hora

**Criterios de aceptación:**
- [ ] Calendario muestra 6 días
- [ ] Sin domingos
- [ ] Horarios 9-20 hrs
- [ ] Selección funcional

---

### Microtarea 5.2: Formulario de Agendamiento
**Prioridad:** 🔴 CRÍTICA  
**Estimación:** 1 sesión

**Tareas:**
- [ ] Formulario habilitado SOLO después de seleccionar fecha/hora
- [ ] Campos: Nombre (requerido), Email (opcional), Teléfono (requerido, normalizado)
- [ ] Validación con Zod
- [ ] Normalización de teléfono (formato chileno)
- [ ] Submit envía a API `/api/visits`

**Criterios de aceptación:**
- [ ] Formulario deshabilitado hasta seleccionar fecha/hora
- [ ] Validación correcta
- [ ] Normalización de teléfono funciona
- [ ] Submit funcional

---

### Microtarea 5.3: Estados y Confirmación
**Prioridad:** 🟡 MEDIA  
**Estimación:** 0.5 sesión

**Tareas:**
- [ ] Estado de carga
- [ ] Estado de éxito (confirmación)
- [ ] Estado de error
- [ ] Integración con WhatsApp (opcional)

**Criterios de aceptación:**
- [ ] Todos los estados implementados
- [ ] Confirmación clara

---

## 🎯 SPRINT 6: APIs Y DATOS

**Objetivo:** Ajustar APIs según especificación

### Microtarea 6.1: API `/api/buildings` - Retornar Unidades
**Prioridad:** 🔴 CRÍTICA  
**Estimación:** 1 sesión

**Tareas:**
- [ ] Modificar endpoint para retornar `units: Unit[]` en lugar de solo buildings
- [ ] Incluir filtros: comuna, tipo, dormitorios, precio
- [ ] Paginación
- [ ] Validación con Zod

**Criterios de aceptación:**
- [ ] Endpoint retorna unidades
- [ ] Filtros funcionan
- [ ] Paginación funciona
- [ ] Validación correcta

---

### Microtarea 6.2: API `/api/buildings/[slug]` - Retornar Unit
**Prioridad:** 🔴 CRÍTICA  
**Estimación:** 1 sesión

**Tareas:**
- [ ] Modificar endpoint para retornar `Unit` (no Building)
- [ ] Slug identifica una unidad específica
- [ ] Incluir información del edificio como contexto
- [ ] Incluir unidades similares

**Criterios de aceptación:**
- [ ] Endpoint retorna Unit
- [ ] Información completa
- [ ] Unidades similares incluidas

---

### Microtarea 6.3: Modelos de Datos
**Prioridad:** 🟡 MEDIA  
**Estimación:** 1 sesión

**Tareas:**
- [ ] Actualizar interfaz `Unit` con todos los campos de especificación
- [ ] Actualizar interfaz `Building` con campos extendidos
- [ ] Actualizar `SearchFilters` (remover `banos`)
- [ ] Validación Zod para todos los modelos

**Criterios de aceptación:**
- [ ] Interfaces actualizadas
- [ ] Validación Zod completa
- [ ] TypeScript estricto (sin `any`)

---

## 🎯 SPRINT 7: SEO Y OPTIMIZACIÓN

**Objetivo:** Implementar estrategia SEO según especificación

### Microtarea 7.1: Estructura de URLs
**Prioridad:** 🟡 MEDIA  
**Estimación:** 1 sesión

**Tareas:**
- [ ] Implementar estructura: `/arriendo/departamento/[comuna]/[slug-unidad]`
- [ ] Generación de slugs (singular, sin stopwords, normalizados)
- [ ] Redirects de URLs antiguas

**Criterios de aceptación:**
- [ ] URLs según estructura SEO
- [ ] Slugs correctos
- [ ] Redirects funcionan

---

### Microtarea 7.2: Metadata Dinámica
**Prioridad:** 🟡 MEDIA  
**Estimación:** 1 sesión

**Tareas:**
- [ ] Metadata por página (title, description)
- [ ] Open Graph tags
- [ ] Canonical URLs
- [ ] JSON-LD para breadcrumbs

**Criterios de aceptación:**
- [ ] Metadata dinámica funcional
- [ ] OG tags correctos
- [ ] JSON-LD implementado

---

### Microtarea 7.3: Sitemap y Robots
**Prioridad:** 🟢 BAJA  
**Estimación:** 0.5 sesión

**Tareas:**
- [ ] Sitemap.xml dinámico
- [ ] Robots.txt
- [ ] Prioridades según especificación

**Criterios de aceptación:**
- [ ] Sitemap funcional
- [ ] Robots.txt correcto

---

## 🎯 SPRINT 8: INTEGRACIONES Y FINALIZACIÓN

**Objetivo:** Integraciones finales y testing

### Microtarea 8.1: Integración WhatsApp
**Prioridad:** 🟡 MEDIA  
**Estimación:** 1 sesión

**Tareas:**
- [ ] Integración con WhatsApp Business API
- [ ] CTAs de WhatsApp en property page
- [ ] Confirmaciones de visita

**Criterios de aceptación:**
- [ ] Integración funcional
- [ ] CTAs funcionan

---

### Microtarea 8.2: Analytics (GA4 + Meta Pixel)
**Prioridad:** 🟡 MEDIA  
**Estimación:** 1 sesión

**Tareas:**
- [ ] Integración Google Analytics 4
- [ ] Integración Meta Pixel
- [ ] Eventos de conversión en cada punto del funnel
- [ ] Eventos personalizados por unidad

**Criterios de aceptación:**
- [ ] Analytics funcionando
- [ ] Eventos trackeados correctamente

---

### Microtarea 8.3: Testing y QA
**Prioridad:** 🔴 CRÍTICA  
**Estimación:** 2 sesiones

**Tareas:**
- [ ] Tests de humo para cada página
- [ ] Tests de integración para flujos principales
- [ ] Testing manual completo
- [ ] Verificación de accesibilidad (A11y)
- [ ] Verificación de performance (Core Web Vitals)

**Criterios de aceptación:**
- [ ] Tests pasando
- [ ] A11y cumplido
- [ ] Performance dentro de umbrales

---

## 📊 PRIORIZACIÓN Y DEPENDENCIAS

### Orden de Ejecución Recomendado

1. **Sprint 1** (Fundación) → **CRÍTICO** - Base para todo
2. **Sprint 2** (Home) → **CRÍTICO** - Primera impresión
3. **Sprint 4** (Property Page) → **CRÍTICO** - Página de conversión
4. **Sprint 5** (Modal) → **CRÍTICO** - Flujo de conversión
5. **Sprint 3** (Resultados) → **ALTA** - Navegación
6. **Sprint 6** (APIs) → **ALTA** - Backend
7. **Sprint 7** (SEO) → **MEDIA** - Optimización
8. **Sprint 8** (Integraciones) → **MEDIA** - Finalización

### Dependencias Críticas

```
Sprint 1 (Design System)
  ↓
Sprint 2 (Home) → Sprint 3 (Resultados)
  ↓
Sprint 4 (Property Page) → Sprint 5 (Modal)
  ↓
Sprint 6 (APIs) [paralelo]
  ↓
Sprint 7 (SEO) [paralelo]
  ↓
Sprint 8 (Finalización)
```

---

## ✅ CHECKLIST DE PROGRESO

### Sprint 1: Fundación
- [ ] 1.1 - Elkis Unit Card
- [ ] 1.2 - Sticky Search Bar
- [ ] 1.3 - Tipografía Premium

### Sprint 2: Home
- [ ] 2.1 - Header con Sticky Search Bar
- [ ] 2.2 - Formulario de Búsqueda
- [ ] 2.3 - Grids de Unidades Destacadas
- [ ] 2.4 - Sección de Beneficios

### Sprint 3: Resultados
- [ ] 3.1 - Página `/buscar` con Filtros
- [ ] 3.2 - Estados de Resultados

### Sprint 4: Property Page
- [ ] 4.1 - Breadcrumb y Header
- [ ] 4.2 - Hero con Galería
- [ ] 4.3 - Sticky Booking Card
- [ ] 4.4 - Tabs de Contenido
- [ ] 4.5 - Unidades Similares

### Sprint 5: Modal
- [ ] 5.1 - Calendario (6 días, sin domingos)
- [ ] 5.2 - Formulario de Agendamiento
- [ ] 5.3 - Estados y Confirmación

### Sprint 6: APIs
- [ ] 6.1 - API `/api/buildings` - Retornar Unidades
- [ ] 6.2 - API `/api/buildings/[slug]` - Retornar Unit
- [ ] 6.3 - Modelos de Datos

### Sprint 7: SEO
- [ ] 7.1 - Estructura de URLs
- [ ] 7.2 - Metadata Dinámica
- [ ] 7.3 - Sitemap y Robots

### Sprint 8: Finalización
- [ ] 8.1 - Integración WhatsApp
- [ ] 8.2 - Analytics (GA4 + Meta Pixel)
- [ ] 8.3 - Testing y QA

---

## 📝 NOTAS

- **Metodología:** Cada microtarea es abordable en una sola sesión (1 chat = 1 microtarea)
- **Prioridades:** 🔴 CRÍTICA | 🟡 MEDIA | 🟢 BAJA
- **Estimación:** En sesiones (1 sesión ≈ 1-2 horas de trabajo)
- **Actualización:** Este documento se actualiza al completar cada microtarea

---

**📅 Última actualización:** Enero 2025  
**🎯 Estado:** 📋 PLANIFICACIÓN - Listo para comenzar Sprint 1
