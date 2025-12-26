# Mejores Prácticas de QuintoAndar para Página de Propiedad

**Fecha de creación:** 2025-01-27  
**Basado en:** Análisis profundo de UI/UX, Copywriting e Ingeniería de Inversión de QuintoAndar (Desktop + Móvil)

---

## 📋 Índice

1. [Prioridad ALTA - Impacto Inmediato en Conversión](#prioridad-alta)
2. [Prioridad MEDIA - Mejoras Incrementales](#prioridad-media)
3. [Prioridad BAJA - Optimizaciones Avanzadas](#prioridad-baja)
4. [Checklist de Implementación](#checklist)

---

## 🔴 Prioridad ALTA - Impacto Inmediato en Conversión

### 1.1 Pricing Sticky (Desktop) / Sticky Footer (Móvil)

**¿Qué es?**  
Mantener el precio y CTAs siempre visibles durante el scroll.

**Implementación Desktop:**
- Sidebar derecho sticky con `position: sticky; top: 32px`
- Pricing card siempre visible
- Breakdown expandible/colapsable

**Implementación Móvil:**
- Sticky footer con precio + CTA principal
- Aparece después de scroll inicial (threshold: ~120px)
- Botón thumb-friendly (mínimo 44x44px)

**Beneficio esperado:**  
+15-25% en tasa de conversión

**Estado actual:**  
- ✅ Desktop: `PropertySidebar` tiene sticky
- ⚠️ Móvil: `StickyCtaBar` está comentado en `PropertyAboveFoldMobile.tsx`

**Acción requerida:**
```typescript
// Reintegrar StickyCtaBar en PropertyAboveFoldMobile.tsx
// Asegurar que aparezca después de scroll threshold
```

---

### 1.2 Breakdown de Precios Transparente

**¿Qué es?**  
Desglose detallado de todos los costos mensuales con tooltips informativos.

**Elementos clave:**
- Arriendo (base)
- Condomínio/Gastos comunes (con info icon)
- IPTU/Impuestos (con info icon)
- Seguro incêndio (con info icon)
- Taxa de serviço/Comisión (con info icon)
- **Total destacado** (bold, grande)

**Implementación:**
- Tooltips con información adicional al hover/click
- Iconos de información (ⓘ) junto a cada ítem
- Link educativo: "Entenda se é um bom negócio" / "Entender si es un buen negocio"

**Beneficio esperado:**  
+10-20% en confianza del usuario  
-5-10% en tasa de abandono

**Estado actual:**  
- ✅ Existe `PriceBreakdown.tsx`
- ⚠️ Falta tooltips informativos
- ⚠️ Falta link educativo

**Acción requerida:**
```typescript
// Añadir tooltips con Info icon
// Añadir link educativo debajo del total
// Mejorar visualización del breakdown
```

---

### 1.3 Múltiples CTAs Estratégicos

**¿Qué es?**  
Diferentes puntos de conversión según nivel de compromiso del usuario.

**Jerarquía de CTAs:**

1. **Primario:** "Agendar visita" / "Solicitar visita"
   - Acción concreta, bajo compromiso
   - Botón azul, prominente

2. **Secundario:** "Fazer proposta" / "Postular"
   - Para usuarios más decididos
   - Botón gris/blanco, menos prominente

3. **Terciario:** "Faça sua avaliação" / "Pre-aprobación"
   - Pre-qualificación
   - Reduce fricción posterior

**Beneficio esperado:**  
+20-30% en conversión total (múltiples puntos de entrada)

**Estado actual:**  
- ✅ Existen múltiples CTAs
- ⚠️ Falta pre-aprobación/pre-qualificación
- ⚠️ Falta optimización de copy

**Acción requerida:**
```typescript
// Implementar componente PreApproval
// Optimizar copy de CTAs según intención
// Añadir tracking de conversión por CTA
```

---

### 1.4 Hero Image con Overlay Informativo (Móvil)

**¿Qué es?**  
Imagen principal que ocupa 60-70% del viewport con información clave sobrepuesta.

**Elementos:**
- Imagen hero full-width
- Texto blanco sobre imagen: "Apartamento para alugar com 60m², 2 quartos e 1 vaga"
- Acciones rápidas (back, share, favorito) en overlay
- Navegación galería ("26 Fotos", "Mapa") como pills blancos

**Beneficio esperado:**  
-30% en bounce rate móvil  
+15% en engagement inicial

**Estado actual:**  
- ✅ Existe `PropertyAboveFoldMobile.tsx`
- ⚠️ Falta overlay informativo sobre imagen
- ⚠️ Falta información clave visible sin scroll

**Acción requerida:**
```typescript
// Añadir overlay con información clave sobre imagen hero
// Mejorar contraste de texto sobre imagen
// Añadir navegación galería como pills
```

---

### 1.5 Tags de Estado y Urgencia

**¿Qué es?**  
Badges visuales que comunican estado y urgencia.

**Tags identificados:**
- "Exclusivo" (verde) - Propiedad exclusiva
- "Baixou o preço" (naranja) - Precio bajó
- "Em breve" (amarillo) - Disponible pronto
- "Publicado há X horas" - Urgencia social

**Beneficio esperado:**  
+10-15% en clicks en propiedades con tags  
+5-10% en conversión por urgencia

**Estado actual:**  
- ⚠️ Falta sistema de tags consistente
- ⚠️ Falta timestamp de publicación

**Acción requerida:**
```typescript
// Crear componente PropertyTags
// Implementar lógica de tags según estado
// Añadir timestamp de publicación
```

---

## 🟡 Prioridad MEDIA - Mejoras Incrementales

### 2.1 Secciones Expandibles (Accordion)

**¿Qué es?**  
Información organizada en secciones colapsables para reducir scroll cognitivo.

**Secciones identificadas:**
- "Administrado pelo QuintoAndar" (servicios)
- "Condomínio" (amenidades)
- "Bairro" (vecindario)
- "Condições para alugar" (requisitos)
- "Itens disponíveis/indisponíveis" (tabs)

**Beneficio esperado:**  
+20-30% en tiempo en página  
+10-15% en scroll depth

**Estado actual:**  
- ✅ Existe `PropertyTabs.tsx`
- ✅ Existe `PropertyAccordion.tsx`
- ⚠️ Falta optimización de contenido expandible

**Acción requerida:**
```typescript
// Optimizar PropertyAccordion con mejor UX
// Añadir animaciones suaves
// Mejorar iconografía de secciones
```

---

### 2.2 Propiedades Similares (Horizontal Scroll)

**¿Qué es?**  
Carousel horizontal de propiedades similares en la misma región.

**Elementos:**
- Cards compactos con imagen, precio, características
- Scroll horizontal con gestos nativos
- Indicadores visuales (dots)
- Navegación con flechas

**Beneficio esperado:**  
+25-35% en retención en plataforma  
+10-15% en conversión desde similares

**Estado actual:**  
- ✅ Existe `PropertySimilarUnits.tsx`
- ⚠️ Falta optimización móvil (horizontal scroll)
- ⚠️ Falta lazy loading

**Acción requerida:**
```typescript
// Implementar horizontal scroll en móvil
// Añadir lazy loading de imágenes
// Optimizar cards para mobile
```

---

### 2.3 Gestión de Estados: "Em breve" / Disponibilidad

**¿Qué es?**  
Comunicación clara sobre disponibilidad futura con fecha específica.

**Elementos:**
- Tag "Em breve" prominente
- Mensaje claro: "Você pode se mudar a partir de 19/02"
- CTA alternativo: "Avisar quando estiver disponível"
- Información sobre proceso: "Se sua proposta for aceita..."

**Beneficio esperado:**  
-40% en frustración por disponibilidad  
+20-30% en captura de leads futuros

**Estado actual:**  
- ⚠️ Falta gestión de estados de disponibilidad
- ⚠️ Falta sistema de notificaciones

**Acción requerida:**
```typescript
// Crear componente AvailabilityStatus
// Implementar lógica de estados
// Añadir sistema de notificaciones
```

---

### 2.4 Información del Barrio Expandible

**¿Qué es?**  
Sección expandible con información del vecindario y proximidades.

**Sub-secciones:**
- Escuelas o colégios (con lista específica)
- Hospitais (con lista específica)
- Parques ou áreas verdes (con lista específica)
- Links de búsqueda: "Buscar outras casas: Perto de [lugar]"

**Beneficio esperado:**  
+15-20% en confianza del usuario  
+10-15% en tiempo en página

**Estado actual:**  
- ✅ Existe `CommuneLifeSection.tsx`
- ⚠️ Falta optimización de contenido
- ⚠️ Falta links de búsqueda relacionada

**Acción requerida:**
```typescript
// Mejorar CommuneLifeSection con más detalles
// Añadir links de búsqueda relacionada
// Optimizar para mobile
```

---

### 2.5 Items Disponibles/Indisponibles (Tabs)

**¿Qué es?**  
Tabs con lista de items disponibles e indisponibles con iconografía clara.

**Elementos:**
- Tab "Itens disponíveis" (checkmarks verdes)
- Tab "Itens indisponíveis" (círculos con slash grises)
- Lista clara y scannable

**Beneficio esperado:**  
+10-15% en transparencia percibida  
+5-10% en confianza

**Estado actual:**  
- ✅ Existe `PropertyAmenitiesTab.tsx`
- ⚠️ Falta separación disponible/indisponible
- ⚠️ Falta iconografía consistente

**Acción requerida:**
```typescript
// Crear tabs para items disponibles/indisponibles
// Añadir iconografía consistente
// Mejorar visualización
```

---

### 2.6 Pre-Aprobación / Pre-Qualificación

**¿Qué es?**  
Sección que permite al usuario saber si está pre-aprobado en 2 minutos.

**Elementos:**
- Título: "Faça sua avaliação"
- Descripción: "E descubra em dois minutos se você está pré-aprovado"
- CTA: Botón de evaluación

**Beneficio esperado:**  
+25-35% en conversión (reduce ansiedad)  
+15-20% en calidad de leads

**Estado actual:**  
- ❌ No existe

**Acción requerida:**
```typescript
// Crear componente PreApproval
// Integrar con sistema de evaluación
// Añadir tracking
```

---

## 🟢 Prioridad BAJA - Optimizaciones Avanzadas

### 3.1 Breadcrumbs Mejorados

**¿Qué es?**  
Navegación breadcrumb clara y accesible.

**Formato QuintoAndar:**
"Início > São Paulo > Imirim > Avenida Imirim > Imóvel 1923416"

**Beneficio esperado:**  
+5-10% en navegación  
Mejora SEO

**Estado actual:**  
- ✅ Existe `PropertyBreadcrumb.tsx`
- ⚠️ Puede mejorarse con más niveles

**Acción requerida:**
```typescript
// Mejorar PropertyBreadcrumb con más niveles
// Añadir microdata Schema.org
// Optimizar para mobile
```

---

### 3.2 Social Proof Explícito

**¿Qué es?**  
Elementos que muestran actividad y popularidad.

**Elementos identificados:**
- "Publicado há X horas" (urgencia temporal)
- "X pessoas visualizaram esta semana" (popularidad)
- Contador de favoritos

**Beneficio esperado:**  
+10-15% en conversión por urgencia social  
+5-10% en engagement

**Estado actual:**  
- ⚠️ Falta social proof

**Acción requerida:**
```typescript
// Implementar sistema de tracking de visualizaciones
// Añadir contadores de favoritos
// Mostrar timestamp de publicación
```

---

### 3.3 Optimizaciones de Performance Móvil

**¿Qué es?**  
Mejoras técnicas para mejor experiencia móvil.

**Optimizaciones:**
- Lazy loading de imágenes below-fold
- Prefetch de recursos críticos
- Skeleton screens durante loading
- Optimización de imágenes (WebP)

**Beneficio esperado:**  
+20-30% en Core Web Vitals  
+10-15% en tasa de conversión móvil

**Estado actual:**  
- ✅ Next.js Image component
- ⚠️ Falta skeleton screens
- ⚠️ Falta optimización avanzada

**Acción requerida:**
```typescript
// Implementar skeleton screens
// Optimizar lazy loading
// Mejorar prefetch strategy
```

---

### 3.4 Gestos Nativos Móvil

**¿Qué es?**  
Soporte para gestos nativos de móvil.

**Gestos:**
- Swipe horizontal para galería
- Swipe horizontal para propiedades similares
- Pull to refresh
- Long press para acciones rápidas

**Beneficio esperado:**  
+15-20% en engagement móvil  
+10-15% en tiempo en página

**Estado actual:**  
- ⚠️ Falta soporte de gestos

**Acción requerida:**
```typescript
// Implementar gestos con react-spring o similar
// Añadir feedback táctil
// Optimizar para diferentes dispositivos
```

---

### 3.5 Personalización Avanzada

**¿Qué es?**  
Contenido personalizado según comportamiento del usuario.

**Elementos:**
- "Casas como esta en [barrio]"
- Recomendaciones basadas en historial
- Precios comparativos del barrio

**Beneficio esperado:**  
+20-30% en engagement  
+15-20% en conversión

**Estado actual:**  
- ⚠️ Falta personalización

**Acción requerida:**
```typescript
// Implementar sistema de personalización
// Añadir recomendaciones
// Tracking de comportamiento
```

---

## 📊 Checklist de Implementación

### Fase 1: Prioridad ALTA (Sprint 1-2)

- [ ] **1.1** Reintegrar Sticky CTA Footer móvil
- [ ] **1.2** Añadir tooltips informativos al breakdown
- [ ] **1.2** Añadir link educativo "Entender si es un buen negocio"
- [ ] **1.3** Implementar componente PreApproval
- [ ] **1.4** Añadir overlay informativo sobre hero image móvil
- [ ] **1.5** Crear sistema de tags (Exclusivo, Em breve, etc.)

### Fase 2: Prioridad MEDIA (Sprint 3-4)

- [ ] **2.1** Optimizar PropertyAccordion con mejor UX
- [ ] **2.2** Implementar horizontal scroll para propiedades similares móvil
- [ ] **2.3** Crear componente AvailabilityStatus
- [ ] **2.4** Mejorar CommuneLifeSection con más detalles
- [ ] **2.5** Crear tabs para items disponibles/indisponibles
- [ ] **2.6** Implementar sistema de pre-aprobación completo

### Fase 3: Prioridad BAJA (Sprint 5+)

- [ ] **3.1** Mejorar PropertyBreadcrumb con más niveles
- [ ] **3.2** Implementar social proof (visualizaciones, favoritos)
- [ ] **3.3** Implementar skeleton screens
- [ ] **3.4** Añadir soporte de gestos nativos
- [ ] **3.5** Implementar sistema de personalización

---

## 📈 Métricas de Éxito Esperadas

### Desktop
- Tiempo en página: 3-5 min (actual: medir baseline)
- Conversión: 2-3% (actual: medir baseline)
- Scroll depth: 60-80% (actual: medir baseline)

### Móvil
- Tiempo en página: 1-3 min (actual: medir baseline)
- Conversión: 1-2% (actual: medir baseline)
- Scroll depth: 40-60% (actual: medir baseline)

### Mejoras Incrementales Esperadas
- **Prioridad ALTA:** +15-30% en conversión
- **Prioridad MEDIA:** +10-20% en engagement
- **Prioridad BAJA:** +5-15% en métricas secundarias

---

## 🎯 Principios Fundamentales

1. **Transparencia primero:** Pricing claro desde el inicio
2. **Múltiples puntos de conversión:** Diferentes CTAs según intención
3. **Información bajo demanda:** Accordion/tabs para reducir saturación
4. **Mobile-first:** Optimización móvil prioritaria
5. **Reducción de fricción:** Pre-aprobación, transparencia, claridad

---

## 📝 Notas de Implementación

### Consideraciones Técnicas

- **TypeScript estricto:** Todos los componentes deben tener tipos completos
- **Accesibilidad:** ARIA labels, keyboard navigation, screen readers
- **Performance:** Lazy loading, code splitting, optimización de imágenes
- **Analytics:** Tracking de todas las interacciones clave

### Consideraciones de Diseño

- **Dark theme:** Soporte completo para dark mode
- **Responsive:** Mobile-first, breakpoints claros
- **Animaciones:** Suaves, respetando prefers-reduced-motion
- **Consistencia:** Sistema de diseño unificado

### Consideraciones de Negocio

- **A/B Testing:** Todas las mejoras deben ser testeables
- **Rollback:** Plan de rollback para cada cambio
- **Métricas:** Baseline antes de implementar, tracking después
- **Iteración:** Mejoras incrementales basadas en datos

---

## 🔗 Referencias

- Análisis completo: Ver informe de análisis QuintoAndar
- Componentes actuales: `/components/property/`
- Página de propiedad: `/app/(catalog)/property/[slug]/page.tsx`

---

**Última actualización:** 2025-01-27  
**Próxima revisión:** Después de implementación de Fase 1

