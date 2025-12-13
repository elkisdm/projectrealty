# 🚀 PLAN DE SPRINTS - IMPLEMENTACIÓN MVP

**Basado en:** `docs/ESPECIFICACION_COMPLETA_MVP.md`  
**Objetivo:** Implementar el MVP completo según especificación  
**Metodología:** 1 chat = 1 microtarea (según reglas del proyecto)  
**Fecha inicio:** Enero 2025  
**Estado:** 📋 PLANIFICACIÓN

**📋 Documentos relacionados:**
- `docs/ESPECIFICACION_COMPLETA_MVP.md` - Especificación completa
- `docs/CONTEXTO_RECIENTE.md` - ⚠️ **REVISAR ANTES DE CADA TAREA**
- `docs/PLAN_SPRINTS_MVP.md` - Este documento

> **📝 INSTRUCCIONES DE USO:**
> 1. **ANTES de iniciar cualquier tarea:** Revisar `docs/CONTEXTO_RECIENTE.md` para entender cambios recientes
> 2. **Antes de iniciar cada sprint:** Extender y detallar todas las microtareas del sprint
> 3. **Al completar una microtarea:** 
>    - Marcar con `[x]` en este documento
>    - Actualizar estado en `ESPECIFICACION_COMPLETA_MVP.md`
>    - Agregar entrada en `docs/CONTEXTO_RECIENTE.md` con archivos modificados
> 4. **Al completar un sprint:** Actualizar progreso general y pasar al siguiente
> 5. **Tracking:** Todos los documentos se actualizan en paralelo para mantener sincronización

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
**Estado:** ✅ EXTENDIDO - Listo para iniciar  
**Fecha inicio:** _Por definir_  
**Fecha fin:** _Por definir_  
**Duración estimada:** 2.5 sesiones (1 + 1 + 0.5)

> **✅ EXTENDIDO:** Este sprint ha sido extendido con detalle completo.  
> Cada microtarea tiene sub-tareas específicas, criterios técnicos detallados, y archivos exactos a crear/modificar.

### 📋 ORDEN DE EJECUCIÓN

1. **Microtarea 1.1** - UnitCard (base para todo)
2. **Microtarea 1.2** - StickySearchBar (independiente)
3. **Microtarea 1.3** - Tipografía (puede hacerse en paralelo o después)

---

### Microtarea 1.1: Implementar Elkis Unit Card
**Prioridad:** 🔴 CRÍTICA  
**Estimación:** 1 sesión (1.5-2 horas)  
**Dependencias:** Ninguna (componente base)

#### 📁 Archivos a Crear/Modificar

**Crear:**
- `components/ui/UnitCard.tsx` - Componente principal
- `components/ui/UnitCardSkeleton.tsx` - Estado de carga
- `tests/unit/components/UnitCard.test.tsx` - Tests básicos

**Modificar (si existen):**
- `lib/types/unit.ts` o similar - Verificar/agregar tipo `Unit` si falta
- `components/lists/ResultsGrid.tsx` - Preparar para usar UnitCard (no modificar aún)

#### 📋 Sub-tareas Detalladas

**1. Crear estructura base del componente:**
- [x] Crear archivo `components/ui/UnitCard.tsx`
- [x] Definir interfaz `UnitCardProps` con:
  ```typescript
  interface UnitCardProps {
    unit: Unit; // Tipo Unit según especificación
    building?: Building; // Opcional, para contexto
    onClick?: () => void;
    variant?: 'default' | 'compact';
    priority?: boolean; // Para next/image
    className?: string;
  }
  ```
- [x] Importar dependencias: `lucide-react`, `next/image`, `next/link`
- [x] Usar variables CSS del sistema de temas

**2. Implementar contenedor principal:**
- [x] Contenedor con clases: `group relative bg-card border border-border rounded-2xl overflow-hidden`
- [x] Hover: `hover:shadow-lg hover:scale-[1.02] transition-all duration-300`
- [x] Cursor pointer y accesibilidad: `cursor-pointer focus:outline-none focus-visible:ring-2`
- [x] Dark mode: Verificar que funciona con variables CSS

**3. Implementar sección de imagen:**
- [x] Contenedor con `relative aspect-[4/3] overflow-hidden`
- [x] Usar `next/image` con:
  - `fill` y `object-cover`
  - `sizes` responsive: `"(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"`
  - `priority` prop para primera imagen
  - `placeholder="blur"` con blurDataURL
- [x] Hover en imagen: `group-hover:scale-105 transition-transform duration-500`
- [x] Borde superior: `rounded-t-2xl`

**4. Implementar tag flotante glass (top left):**
- [x] Contenedor absoluto: `absolute top-3 left-3`
- [x] Aplicar clase `glass` (definida en tailwind.config.ts)
- [x] Padding: `px-3 py-1`
- [x] Border radius: `rounded-full`
- [x] Texto: `text-xs font-semibold text-slate-900` (o usar variable CSS)
- [x] Contenido: "Disponible" (determinado desde `unit.status` o `unit.disponible`)

**5. Implementar botón de favoritos (top right):**
- [x] Contenedor absoluto: `absolute top-3 right-3`
- [x] Botón con: `p-2 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm`
- [x] Icono `Heart` de `lucide-react`: `w-5 h-5 text-white`
- [x] Estado hover y transición
- [x] Accesibilidad: `aria-label="Agregar a favoritos"`

**6. Implementar sección de contenido:**
- [x] Contenedor con padding: `p-5`
- [x] Header con nombre y ubicación:
  - Título: `text-lg font-bold text-text leading-tight` (usar variable CSS)
  - Subtítulo: `text-sm text-subtext flex items-center gap-1 mt-1`
  - Icono `MapPin` de `lucide-react`: `w-3 h-3`
- [x] Separador: `my-3 h-px w-full bg-border`
- [x] Sección de precio:
  - Precio: `text-2xl font-bold text-text tracking-tight tabular-nums`
  - Label "/mes": `text-sm font-normal text-subtext`
  - Gasto común: `text-xs text-text-muted mt-1`

**7. Implementar botón "Ver unidad" (hover desktop):**
- [x] Contenedor: `opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0`
- [x] Transición: `transition-all duration-300`
- [x] Texto: `text-[#8B6CFF] font-semibold text-sm` (Brand Violet)
- [x] Solo visible en desktop: `hidden lg:block` o similar

**8. Implementar estado de carga (Skeleton):**
- [x] Crear `components/ui/UnitCardSkeleton.tsx`
- [x] Usar `animate-pulse` de Tailwind
- [x] Estructura similar a UnitCard pero con placeholders
- [x] Mismo aspect ratio y estructura

**9. Implementar navegación:**
- [x] Envolver en `Link` de `next/link` si `onClick` no está definido
- [x] Href: `/property/${slug}` (generado desde building.slug y unit.id)
- [x] Manejar click para analytics (preparado, no implementado aún)

**10. Tests básicos:**
- [x] Crear `tests/unit/components/UnitCard.test.tsx`
- [x] Test: Renderiza correctamente
- [x] Test: Muestra datos de unidad
- [x] Test: Hover funciona (si es posible en test)
- [x] Test: Navegación funciona

#### ✅ Criterios de Aceptación Detallados

**Funcionalidad:**
- [x] Componente se renderiza sin errores
- [x] Muestra imagen de unidad correctamente
- [x] Muestra nombre del edificio
- [x] Muestra ubicación (comuna)
- [x] Muestra precio formateado
- [x] Muestra gasto común
- [x] Tag "Disponible" visible
- [x] Botón favoritos visible y funcional
- [x] Hover muestra botón "Ver unidad" (desktop)
- [x] Click navega a `/property/[slug]`

**Diseño:**
- [x] Card usa `rounded-2xl` (20px) en todas las esquinas
- [x] Imagen tiene ratio `aspect-[4/3]`
- [x] Tag glass tiene efecto glass funcional
- [x] Hover scale `[1.02]` funciona
- [x] Shadow-lg en hover funciona
- [x] Transiciones suaves (300ms)

**Responsive:**
- [x] Funciona en mobile (< 640px)
- [x] Funciona en tablet (640px - 1024px)
- [x] Funciona en desktop (> 1024px)
- [x] Botón "Ver unidad" solo visible en desktop

**Temas:**
- [x] Funciona en light mode
- [x] Funciona en dark mode
- [x] Colores usan variables CSS correctamente

**Accesibilidad:**
- [x] Focus visible en el card
- [x] Aria-labels en botones
- [x] Navegación por teclado funciona
- [x] Alt text en imágenes

**Código:**
- [x] TypeScript estricto (sin `any`)
- [x] Props tipadas correctamente
- [x] Sin errores de lint
- [x] Build exitoso

#### 📝 Código de Referencia

Ver sección completa "A. The 'Elkis Unit Card'" en `docs/ESPECIFICACION_COMPLETA_MVP.md` líneas 1080-1171.

**Estructura base esperada:**
```tsx
import { Heart, MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { Unit, Building } from '@/lib/types/unit';

interface UnitCardProps {
  unit: Unit;
  building?: Building;
  onClick?: () => void;
  variant?: 'default' | 'compact';
  priority?: boolean;
  className?: string;
}

export function UnitCard({ unit, building, onClick, variant = 'default', priority = false, className = '' }: UnitCardProps) {
  // Implementación según especificación
}
```

#### 🔗 Dependencias

- `next/image` - Optimización de imágenes
- `next/link` - Navegación
- `lucide-react` - Iconos (Heart, MapPin)
- Variables CSS del sistema de temas
- Clase `glass` de tailwind.config.ts

#### ⚠️ Notas Importantes

- **NO usar BuildingCard existente** - Este es un componente nuevo específico para unidades
- **Usar variables CSS** - No hardcodear colores, usar `var(--text)`, `var(--card)`, etc.
- **Imágenes:** Usar `next/image` siempre, no `<img>`
- **Slug:** El slug debe venir de `unit.slug` según especificación
- **Estado:** Por ahora hardcodear "Disponible", después usar `unit.status`

---

### Microtarea 1.2: Implementar Sticky Search Bar (Glass)
**Prioridad:** 🔴 CRÍTICA  
**Estimación:** 1 sesión (1.5-2 horas)  
**Dependencias:** Ninguna (componente independiente)

#### 📁 Archivos a Crear/Modificar

**Crear:**
- `components/marketing/StickySearchBar.tsx` - Componente principal
- `components/marketing/StickySearchBarClient.tsx` - Versión cliente (si necesita estado)
- `tests/unit/components/StickySearchBar.test.tsx` - Tests básicos

**Modificar (si existen):**
- `components/marketing/Header.tsx` - Preparar para integrar (no modificar aún)

#### 📋 Sub-tareas Detalladas

**1. Crear estructura base:**
- [ ] Crear archivo `components/marketing/StickySearchBar.tsx`
- [ ] Definir interfaz `StickySearchBarProps`:
  ```typescript
  interface StickySearchBarProps {
    onSearch?: (query: string) => void;
    placeholder?: string;
    className?: string;
  }
  ```
- [ ] Importar dependencias: `lucide-react` (Search icon)

**2. Implementar contenedor glass:**
- [ ] Contenedor con clase `glass-strong` (definida en tailwind.config.ts)
- [ ] Forma pill: `rounded-full`
- [ ] Borde: `border border-white/20` (visible en dark mode)
- [ ] Sombra: `shadow-lg`
- [ ] Padding interno: `px-4 py-3` o similar
- [ ] Width: `w-full max-w-2xl` o similar (responsive)

**3. Implementar sticky behavior:**
- [ ] Usar `useEffect` y `useState` para detectar scroll
- [ ] Agregar clase `sticky top-4 z-50` cuando está sticky
- [ ] Transición suave al activar sticky
- [ ] Considerar `prefers-reduced-motion`

**4. Implementar input de búsqueda:**
- [ ] Input con: `bg-transparent border-0 outline-none flex-1`
- [ ] Placeholder: "Buscar por comuna, dirección..." (configurable)
- [ ] Texto: `text-text` (variable CSS)
- [ ] Placeholder: `placeholder:text-text-muted`
- [ ] Font size: `text-base` o `text-sm`

**5. Implementar botón buscar:**
- [ ] Botón circular: `rounded-full`
- [ ] Background: `bg-[#8B6CFF]` (Brand Violet)
- [ ] Hover: `hover:bg-[#7a5ce6]`
- [ ] Tamaño: `w-10 h-10` o `w-12 h-12`
- [ ] Icono `Search` de `lucide-react`: `w-5 h-5 text-white`
- [ ] Active: `active:scale-95`
- [ ] Transición: `transition-all duration-200`

**6. Implementar animaciones estilo Airbnb:**
- [ ] Animación de aparición al hacer scroll
- [ ] Efecto de "elevación" cuando se activa sticky
- [ ] Transición suave del fondo glass
- [ ] Considerar `framer-motion` si es necesario (pero verificar si ya está en proyecto)

**7. Implementar responsive:**
- [ ] Mobile: Full width, padding lateral
- [ ] Desktop: Max width centrado
- [ ] Tablet: Ajustar tamaños

**8. Implementar funcionalidad de búsqueda:**
- [ ] Manejar `onChange` del input
- [ ] Manejar `onSubmit` (Enter key)
- [ ] Llamar `onSearch` callback con query
- [ ] Navegar a `/buscar?q=query` si no hay callback

**9. Tests básicos:**
- [ ] Test: Renderiza correctamente
- [ ] Test: Input funciona
- [ ] Test: Botón buscar funciona
- [ ] Test: Sticky behavior (mock scroll)

#### ✅ Criterios de Aceptación Detallados

**Funcionalidad:**
- [ ] Componente se renderiza sin errores
- [ ] Input de búsqueda funciona
- [ ] Botón buscar funciona
- [ ] Enter key dispara búsqueda
- [ ] Sticky al hacer scroll funciona
- [ ] Navegación a `/buscar` funciona

**Diseño:**
- [ ] Efecto glass-strong funcional
- [ ] Forma `rounded-full` (pill)
- [ ] Borde `border-white/20` visible en dark mode
- [ ] Botón circular con Brand Violet `#8B6CFF`
- [ ] Sombra `shadow-lg` presente
- [ ] Transiciones suaves

**Responsive:**
- [ ] Funciona en mobile
- [ ] Funciona en tablet
- [ ] Funciona en desktop
- [ ] Width responsive correcto

**Accesibilidad:**
- [ ] Focus visible en input
- [ ] Focus visible en botón
- [ ] Navegación por teclado funciona
- [ ] Aria-label en botón buscar
- [ ] Label asociado al input (o aria-label)

**Código:**
- [ ] TypeScript estricto
- [ ] Sin errores de lint
- [ ] Build exitoso
- [ ] "use client" si necesita estado

#### 📝 Código de Referencia

Ver sección "B. Sticky Search Bar (Glass Version)" en `docs/ESPECIFICACION_COMPLETA_MVP.md` líneas 1175-1190.

**Estructura base esperada:**
```tsx
'use client'; // Si necesita estado para sticky

import { Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface StickySearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export function StickySearchBar({ onSearch, placeholder = "Buscar...", className = '' }: StickySearchBarProps) {
  // Implementación según especificación
}
```

#### 🔗 Dependencias

- `lucide-react` - Icono Search
- `next/navigation` - useRouter para navegación
- Clase `glass-strong` de tailwind.config.ts
- Variables CSS del sistema de temas

#### ⚠️ Notas Importantes

- **Glass effect:** Verificar que `glass-strong` está definido en `tailwind.config.ts`
- **Sticky:** Usar `position: sticky` de CSS, no JavaScript si es posible
- **Scroll detection:** Solo si necesitas animaciones adicionales
- **"use client":** Solo si necesitas estado para sticky behavior avanzado

---

### Microtarea 1.3: Actualizar Tipografía (Inter Premium)
**Prioridad:** 🟡 MEDIA  
**Estimación:** 0.5 sesión (30-45 minutos)  
**Dependencias:** Ninguna (puede hacerse en paralelo)

#### 📁 Archivos a Modificar

**Modificar:**
- `app/globals.css` - Agregar clases utilitarias si es necesario
- `tailwind.config.ts` - Verificar configuración de Inter
- Componentes existentes que usen títulos o precios (buscar y actualizar)

#### 📋 Sub-tareas Detalladas

**1. Verificar configuración de Inter:**
- [ ] Revisar `app/layout.tsx` - Verificar que Inter está configurado
- [ ] Verificar `display: 'swap'` y `preload: true`
- [ ] Verificar que Inter se aplica globalmente

**2. Agregar tracking-tight a títulos:**
- [ ] Buscar todos los `<h1>` y `<h2>` en componentes
- [ ] Agregar clase `tracking-tight` a títulos principales
- [ ] Archivos a revisar:
  - `components/marketing/HeroV2.tsx` o similar
  - `components/marketing/Header.tsx`
  - `app/page.tsx`
  - Cualquier componente con títulos grandes

**3. Agregar tabular-nums a precios:**
- [ ] Buscar todos los elementos que muestran precios
- [ ] Agregar clase `tabular-nums` a números de precio
- [ ] Archivos a revisar:
  - `components/BuildingCard.tsx`
  - `components/ui/BuildingCardV2.tsx`
  - `components/ui/UnitCard.tsx` (recién creado)
  - Cualquier componente que muestre precios

**4. Verificar escala tipográfica:**
- [ ] Revisar que H1 usa: `text-4xl font-bold tracking-tight`
- [ ] Revisar que H2 usa: `text-3xl font-bold tracking-tight`
- [ ] Revisar que precios usan: `tabular-nums`
- [ ] Documentar en comentarios si es necesario

**5. Actualizar componentes base:**
- [ ] Revisar botones - Verificar tipografía
- [ ] Revisar cards - Verificar tipografía
- [ ] Crear componentes base tipográficos si es necesario (opcional)

**6. Verificar consistencia:**
- [ ] Buscar en todo el proyecto: `font-bold` sin `tracking-tight`
- [ ] Buscar números sin `tabular-nums`
- [ ] Actualizar donde sea necesario

#### ✅ Criterios de Aceptación Detallados

**Tipografía:**
- [ ] Todos los H1 tienen `tracking-tight`
- [ ] Todos los H2 tienen `tracking-tight`
- [ ] Todos los precios tienen `tabular-nums`
- [ ] Consistencia en toda la app

**Código:**
- [ ] Sin errores de lint
- [ ] Build exitoso
- [ ] No se rompió ningún componente existente

#### 📝 Referencias

Ver sección "4. Tipografía 'Tech' (Inter)" en `docs/ESPECIFICACION_COMPLETA_MVP.md` líneas 1220-1232.

**Clases a aplicar:**
- Títulos: `font-bold tracking-tight`
- Precios: `tabular-nums`
- Body: `leading-relaxed` (ya debería estar)

#### ⚠️ Notas Importantes

- **No romper existente:** Solo agregar clases, no cambiar estructura
- **Buscar sistemáticamente:** Usar grep o búsqueda en IDE
- **Testing:** Verificar visualmente que se ve bien

---

## ✅ CHECKLIST DE PROGRESO - SPRINT 1

### Microtarea 1.1: UnitCard
- [x] Estructura base creada
- [x] Contenedor principal implementado
- [x] Sección de imagen implementada
- [x] Tag glass implementado
- [x] Botón favoritos implementado
- [x] Sección de contenido implementada
- [x] Botón hover implementado
- [x] Skeleton implementado
- [x] Navegación implementada
- [x] Tests creados
- [x] ✅ COMPLETADA

### Microtarea 1.2: StickySearchBar
- [x] Estructura base creada
- [x] Contenedor glass implementado
- [x] Sticky behavior implementado
- [x] Input de búsqueda implementado
- [x] Botón buscar implementado
- [x] Animaciones implementadas
- [x] Responsive implementado
- [x] Funcionalidad de búsqueda implementada
- [x] Tests creados
- [x] ✅ COMPLETADA

### Microtarea 1.3: Tipografía
- [ ] Configuración de Inter verificada
- [ ] tracking-tight agregado a títulos
- [ ] tabular-nums agregado a precios
- [ ] Escala tipográfica verificada
- [ ] Componentes base actualizados
- [ ] Consistencia verificada
- [ ] ✅ COMPLETADA

---

**📅 Última actualización:** Enero 2025  
**🎯 Estado:** ✅ **EXTENDIDO Y LISTO PARA INICIAR**

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
**Estado:** 📋 PENDIENTE - Listo para extender  
**Fecha inicio:** _Por definir_  
**Fecha fin:** _Por definir_  
**Depende de:** Sprint 1 (UnitCard, StickySearchBar)

> **⚠️ ANTES DE INICIAR:** Este sprint debe ser extendido con más detalle antes de comenzar.  
> Agregar sub-tareas específicas, criterios técnicos detallados, y dependencias exactas.

### 📋 EXTENSIÓN DEL SPRINT 2

**Pendiente de extender antes de iniciar:**
- [ ] Detallar cada microtarea con sub-tareas específicas
- [ ] Definir criterios técnicos detallados
- [ ] Identificar dependencias exactas
- [ ] Estimar tiempos más precisos
- [ ] Definir orden de ejecución interno

---

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
**Estado:** 📋 PENDIENTE - Listo para extender  
**Fecha inicio:** _Por definir_  
**Fecha fin:** _Por definir_  
**Depende de:** Sprint 1 (UnitCard), Sprint 2 (Formulario búsqueda)

> **⚠️ ANTES DE INICIAR:** Este sprint debe ser extendido con más detalle antes de comenzar.  
> Agregar sub-tareas específicas, criterios técnicos detallados, y dependencias exactas.

### 📋 EXTENSIÓN DEL SPRINT 3

**Pendiente de extender antes de iniciar:**
- [ ] Detallar cada microtarea con sub-tareas específicas
- [ ] Definir criterios técnicos detallados
- [ ] Identificar dependencias exactas
- [ ] Estimar tiempos más precisos
- [ ] Definir orden de ejecución interno

---

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
**Estado:** 📋 PENDIENTE - Listo para extender  
**Fecha inicio:** _Por definir_  
**Fecha fin:** _Por definir_  
**Depende de:** Sprint 1 (Design System), Sprint 6 (APIs)

> **⚠️ ANTES DE INICIAR:** Este sprint debe ser extendido con más detalle antes de comenzar.  
> Agregar sub-tareas específicas, criterios técnicos detallados, y dependencias exactas.

### 📋 EXTENSIÓN DEL SPRINT 4

**Pendiente de extender antes de iniciar:**
- [ ] Detallar cada microtarea con sub-tareas específicas
- [ ] Definir criterios técnicos detallados
- [ ] Identificar dependencias exactas
- [ ] Estimar tiempos más precisos
- [ ] Definir orden de ejecución interno

---

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
**Estado:** 📋 PENDIENTE - Listo para extender  
**Fecha inicio:** _Por definir_  
**Fecha fin:** _Por definir_  
**Depende de:** Sprint 4 (Property Page)

> **⚠️ ANTES DE INICIAR:** Este sprint debe ser extendido con más detalle antes de comenzar.  
> Agregar sub-tareas específicas, criterios técnicos detallados, y dependencias exactas.

### 📋 EXTENSIÓN DEL SPRINT 5

**Pendiente de extender antes de iniciar:**
- [ ] Detallar cada microtarea con sub-tareas específicas
- [ ] Definir criterios técnicos detallados
- [ ] Identificar dependencias exactas
- [ ] Estimar tiempos más precisos
- [ ] Definir orden de ejecución interno

---

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
**Estado:** 📋 PENDIENTE - Listo para extender  
**Fecha inicio:** _Por definir_  
**Fecha fin:** _Por definir_  
**Depende de:** Ninguna (puede ejecutarse en paralelo)

> **⚠️ ANTES DE INICIAR:** Este sprint debe ser extendido con más detalle antes de comenzar.  
> Agregar sub-tareas específicas, criterios técnicos detallados, y dependencias exactas.

### 📋 EXTENSIÓN DEL SPRINT 6

**Pendiente de extender antes de iniciar:**
- [ ] Detallar cada microtarea con sub-tareas específicas
- [ ] Definir criterios técnicos detallados
- [ ] Identificar dependencias exactas
- [ ] Estimar tiempos más precisos
- [ ] Definir orden de ejecución interno

---

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
**Estado:** 📋 PENDIENTE - Listo para extender  
**Fecha inicio:** _Por definir_  
**Fecha fin:** _Por definir_  
**Depende de:** Sprint 2, 3, 4 (páginas implementadas)

> **⚠️ ANTES DE INICIAR:** Este sprint debe ser extendido con más detalle antes de comenzar.  
> Agregar sub-tareas específicas, criterios técnicos detallados, y dependencias exactas.

### 📋 EXTENSIÓN DEL SPRINT 7

**Pendiente de extender antes de iniciar:**
- [ ] Detallar cada microtarea con sub-tareas específicas
- [ ] Definir criterios técnicos detallados
- [ ] Identificar dependencias exactas
- [ ] Estimar tiempos más precisos
- [ ] Definir orden de ejecución interno

---

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
**Estado:** 📋 PENDIENTE - Listo para extender  
**Fecha inicio:** _Por definir_  
**Fecha fin:** _Por definir_  
**Depende de:** Todos los sprints anteriores

> **⚠️ ANTES DE INICIAR:** Este sprint debe ser extendido con más detalle antes de comenzar.  
> Agregar sub-tareas específicas, criterios técnicos detallados, y dependencias exactas.

### 📋 EXTENSIÓN DEL SPRINT 8

**Pendiente de extender antes de iniciar:**
- [ ] Detallar cada microtarea con sub-tareas específicas
- [ ] Definir criterios técnicos detallados
- [ ] Identificar dependencias exactas
- [ ] Estimar tiempos más precisos
- [ ] Definir orden de ejecución interno

---

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

> **📝 INSTRUCCIÓN:** Al completar una microtarea:
> 1. Marca con `[x]` en esta sección
> 2. Actualiza el estado correspondiente en `ESPECIFICACION_COMPLETA_MVP.md`
> 3. Agrega fecha de completación si aplica

### Sprint 1: Fundación
**Estado:** ✅ EN PROGRESO | **Progreso:** 2/3 microtareas

- [x] 1.1 - Elkis Unit Card (🔴 CRÍTICA - 1 sesión) ✅ COMPLETADA
- [x] 1.2 - Sticky Search Bar (🔴 CRÍTICA - 1 sesión) ✅ COMPLETADA
- [ ] 1.3 - Tipografía Premium (🟡 MEDIA - 0.5 sesión)

### Sprint 2: Home
**Estado:** 📋 PENDIENTE | **Progreso:** 0/4 microtareas

- [ ] 2.1 - Header con Sticky Search Bar
- [ ] 2.2 - Formulario de Búsqueda
- [ ] 2.3 - Grids de Unidades Destacadas
- [ ] 2.4 - Sección de Beneficios

### Sprint 3: Resultados
**Estado:** 📋 PENDIENTE | **Progreso:** 0/2 microtareas

- [ ] 3.1 - Página `/buscar` con Filtros
- [ ] 3.2 - Estados de Resultados

### Sprint 4: Property Page
**Estado:** 📋 PENDIENTE | **Progreso:** 0/5 microtareas

- [ ] 4.1 - Breadcrumb y Header
- [ ] 4.2 - Hero con Galería
- [ ] 4.3 - Sticky Booking Card
- [ ] 4.4 - Tabs de Contenido
- [ ] 4.5 - Unidades Similares

### Sprint 5: Modal
**Estado:** 📋 PENDIENTE | **Progreso:** 0/3 microtareas

- [ ] 5.1 - Calendario (6 días, sin domingos)
- [ ] 5.2 - Formulario de Agendamiento
- [ ] 5.3 - Estados y Confirmación

### Sprint 6: APIs
**Estado:** 📋 PENDIENTE | **Progreso:** 0/3 microtareas

- [ ] 6.1 - API `/api/buildings` - Retornar Unidades
- [ ] 6.2 - API `/api/buildings/[slug]` - Retornar Unit
- [ ] 6.3 - Modelos de Datos

### Sprint 7: SEO
**Estado:** 📋 PENDIENTE | **Progreso:** 0/3 microtareas

- [ ] 7.1 - Estructura de URLs
- [ ] 7.2 - Metadata Dinámica
- [ ] 7.3 - Sitemap y Robots

### Sprint 8: Finalización
**Estado:** 📋 PENDIENTE | **Progreso:** 0/3 microtareas

- [ ] 8.1 - Integración WhatsApp
- [ ] 8.2 - Analytics (GA4 + Meta Pixel)
- [ ] 8.3 - Testing y QA

---

## 📊 PROGRESO GENERAL

**Total de microtareas:** 25  
**Completadas:** 2  
**En progreso:** 0  
**Pendientes:** 23  
**Progreso:** 8%

**Última actualización:** Enero 2025

---

## ✅ CHECKLIST DE VALIDACIÓN (Antes de Marcar Completada)

> **⚠️ OBLIGATORIO:** Ejecutar este checklist antes de marcar cualquier microtarea como completada.

### Validación Funcional
- [ ] La funcionalidad implementada funciona según especificación
- [ ] Criterios de aceptación cumplidos
- [ ] Casos edge manejados correctamente
- [ ] Manejo de errores implementado

### Validación Técnica
- [ ] TypeScript sin errores (`pnpm run type-check` o equivalente)
- [ ] Lint sin errores críticos (`pnpm run lint`)
- [ ] Build exitoso (`pnpm run build` o equivalente)
- [ ] Sin `any` types (TypeScript estricto)
- [ ] Código sigue convenciones del proyecto

### Validación de Calidad
- [ ] Componente/página es responsive (mobile/tablet/desktop)
- [ ] Accesibilidad básica (focus visible, labels, aria)
- [ ] Performance aceptable (no hay renders innecesarios)
- [ ] Imágenes optimizadas (si aplica, usar next/image)

### Smoke Test Rápido
- [ ] La página/componente se renderiza sin errores
- [ ] No hay errores en consola del navegador
- [ ] Funcionalidad básica funciona (click, navegación, etc.)
- [ ] No se rompió funcionalidad existente relacionada

### Documentación
- [ ] Código comentado si es complejo
- [ ] Props/parámetros tipados correctamente
- [ ] README o documentación actualizada (si aplica)

### Git
- [ ] Cambios commiteados con mensaje descriptivo
- [ ] Commit sigue formato Conventional Commits
- [ ] No hay archivos temporales o de debug en el commit

**Si alguna validación falla:** Corregir antes de marcar como completada.

---

## 🔄 PROCESO DE ROLLBACK

> **⚠️ IMPORTANTE:** Si algo se rompe después de completar una microtarea, seguir este proceso.

### Identificar el Problema
1. Revisar `docs/CONTEXTO_RECIENTE.md` para ver último cambio
2. Verificar qué archivos se modificaron
3. Identificar qué commit introdujo el problema

### Opciones de Rollback

#### Opción 1: Revertir Último Commit
```bash
# Ver último commit
git log --oneline -1

# Revertir último commit (mantiene historial)
git revert HEAD

# O deshacer commit (si no se ha pusheado)
git reset --soft HEAD~1
```

#### Opción 2: Restaurar Archivo Específico
```bash
# Ver cambios en archivo
git diff HEAD archivo.tsx

# Restaurar desde último commit
git checkout HEAD -- archivo.tsx

# O desde commit específico
git checkout <commit-hash> -- archivo.tsx
```

#### Opción 3: Revisar y Corregir Manualmente
1. Revisar `docs/CONTEXTO_RECIENTE.md` para contexto
2. Revisar archivos modificados según el log
3. Corregir el problema específico
4. Ejecutar validaciones nuevamente

### Después del Rollback
1. **Actualizar `CONTEXTO_RECIENTE.md`:**
   - Agregar entrada sobre el rollback
   - Explicar qué se revirtió y por qué
   - Documentar la solución aplicada

2. **Actualizar estado:**
   - Marcar microtarea como "en revisión" o "revertida"
   - Actualizar `ESPECIFICACION_COMPLETA_MVP.md` si aplica

3. **Re-evaluar:**
   - Revisar si la microtarea necesita ser re-diseñada
   - Identificar dependencias que pueden haber causado el problema

---

## 📝 PROCESO DE TRABAJO

### Antes de Iniciar un Sprint

1. **Revisar Contexto Reciente:**
   - ⚠️ **OBLIGATORIO:** Leer `docs/CONTEXTO_RECIENTE.md` completo
   - Entender cambios recientes y archivos modificados
   - Revisar advertencias y consideraciones
   - Verificar estado actual del proyecto

2. **Extender el Sprint:**
   - Detallar cada microtarea con sub-tareas específicas
   - Definir criterios técnicos detallados
   - Identificar dependencias exactas
   - Estimar tiempos más precisos
   - Definir orden de ejecución interno

3. **Revisar Dependencias:**
   - Verificar que sprints dependientes estén completos
   - Revisar componentes/APIs necesarios
   - Confirmar que el Design System está listo

4. **Preparar Ambiente:**
   - Verificar que el código base está actualizado
   - Revisar documentación relevante
   - Preparar herramientas necesarias

### Durante el Sprint

1. **Antes de Cada Microtarea:**
   - ⚠️ **OBLIGATORIO:** Revisar `docs/CONTEXTO_RECIENTE.md` (últimas 3-5 entradas)
   - Verificar archivos críticos a revisar
   - Revisar advertencias relevantes

2. **Ejecutar Microtareas:**
   - Una microtarea por sesión (1 chat = 1 microtarea)
   - Seguir criterios de aceptación
   - Mantener código limpio y documentado

3. **Validar Antes de Marcar Completada:**
   - ⚠️ **OBLIGATORIO:** Ejecutar checklist de validación (ver abajo)
   - Verificar que todos los criterios de aceptación se cumplen
   - Ejecutar smoke test rápido (ver abajo)
   - Verificar que no se rompió código existente

4. **Actualizar Progreso:**
   - Marcar microtarea como `[x]` completada
   - Actualizar estado en `ESPECIFICACION_COMPLETA_MVP.md`
   - **Agregar entrada en `docs/CONTEXTO_RECIENTE.md`:**
     - Descripción del cambio
     - Archivos modificados/creados/eliminados
     - Notas importantes
     - Contexto relevante
   - Actualizar progreso general
   - **Hacer commit con mensaje descriptivo:**
     - Formato: `feat|fix|docs|refactor: [descripción breve]`
     - Ejemplo: `feat: implementar UnitCard según Design System v2.0`

### Al Completar un Sprint

1. **Revisión Final:**
   - Verificar que todas las microtareas están completas
   - Revisar criterios de aceptación de todas las microtareas
   - Ejecutar tests relacionados al sprint
   - Verificar integración con código existente

2. **Actualización:**
   - Marcar sprint como completado
   - Actualizar estado en todos los documentos
   - Agregar resumen del sprint en `CONTEXTO_RECIENTE.md`
   - Preparar siguiente sprint (extender si es necesario)

---

## 📝 PROCESO DE COMMITS

### Formato de Commits (Conventional Commits)

```bash
# Estructura
<tipo>(<alcance>): <descripción breve>

# Ejemplos
feat(components): implementar UnitCard según Design System v2.0
fix(api): corregir endpoint buildings para retornar unidades
docs(specs): actualizar estado de implementación de UnitCard
refactor(components): extraer lógica común de cards
```

### Tipos de Commits
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `refactor`: Refactorización de código
- `test`: Agregar o modificar tests
- `chore`: Tareas de mantenimiento

### Alcance (Opcional pero Recomendado)
- `components`, `api`, `pages`, `docs`, `types`, `utils`, etc.

### Buenas Prácticas
- Un commit por microtarea completada
- Mensaje descriptivo pero conciso
- Incluir referencia a microtarea si aplica: `(Sprint 1.1)`

---

## 📝 NOTAS

- **Metodología:** Cada microtarea es abordable en una sola sesión (1 chat = 1 microtarea)
- **Prioridades:** 🔴 CRÍTICA | 🟡 MEDIA | 🟢 BAJA
- **Estimación:** En sesiones (1 sesión ≈ 1-2 horas de trabajo)
- **Actualización:** Todos los documentos se actualizan en paralelo:
  - `PLAN_SPRINTS_MVP.md` - Progreso de microtareas
  - `ESPECIFICACION_COMPLETA_MVP.md` - Estado de implementación
  - `CONTEXTO_RECIENTE.md` - Log de cambios
- **Extensión:** Cada sprint debe ser extendido antes de iniciar con más detalle
- **Validación:** Checklist obligatorio antes de marcar como completada
- **Rollback:** Proceso documentado para revertir cambios si algo se rompe

---

**📅 Última actualización:** Enero 2025  
**🎯 Estado:** 📋 PLANIFICACIÓN - Listo para extender Sprint 1
