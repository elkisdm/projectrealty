# 📋 ESPECIFICACIÓN COMPLETA DEL MVP - HOMmie 0% Comisión

**Documento:** Especificación completa y editable de todas las páginas del MVP, historia del cliente y flujos de usuario  
**Fecha:** Enero 2025  
**Versión:** MVP 1.0  
**Estado:** 🔴 EN REVISIÓN - Listo para editar y redefinir

> **📝 INSTRUCCIONES PARA EDITAR:**
> Este documento está diseñado para que puedas editarlo completamente y redefinir la estructura del MVP según tus necesidades. Una vez que lo edites, devuélvelo para que pueda definir los sprints de implementación.

---

## 📑 ÍNDICE

1. [Historia del Cliente](#historia-del-cliente)
2. [Flujo de Usuario Completo](#flujo-de-usuario-completo)
3. [Estructura de Páginas](#estructura-de-páginas)
4. [Componentes y Elementos UI](#componentes-y-elementos-ui)
5. [Estados y Puntos de Conversión](#estados-y-puntos-de-conversión)
6. [APIs y Endpoints](#apis-y-endpoints)
7. [Datos y Modelos](#datos-y-modelos)
8. [Notas de Implementación](#notas-de-implementación)

---

## 👤 HISTORIA DEL CLIENTE

### Persona Principal

**Usuario objetivo:** Persona buscando arrendar una propiedad en Chile, específicamente en la Región Metropolitana.

**Características demográficas:**
- Edad: 25-45 años
- Ubicación: Región Metropolitana, Chile
- Nivel socioeconómico: Clase media a media-alta
- Uso de tecnología: Alto (usa apps móviles, redes sociales)

**Características psicográficas:**
- Busca propiedades de arriendo 
- Tiene criterios específicos: ubicación, precio, tamaño (dormitorios, baños)
- Quiere agendar visitas para conocer las propiedades
- Prefiere un proceso simple y directo
- Valora transparencia y claridad en precios
- Busca ahorrar dinero
- quiere agendar de forma sencilla y rápida
- no quiere encontrar sorpresas en el proceso  
- quiere saber que monto debe pagar para mudarse 
- Quiere que el proceso sea rápido y eficiente  

**Necesidades principales:**
1. Encontrar propiedades que cumplan sus criterios
2. Ver información detallada de cada propiedad
3. Agendar visitas de forma sencilla
4. Proceso sin fricciones ni sorpresas
5. Transparencia en precios y condiciones

**Dolores (Pain Points):**
- Comisiones de corretaje altas
- Procesos largos y burocráticos
- Información poco clara o incompleta
- Dificultad para agendar visitas
- Falta de transparencia en precios
- No encuentra propiedades que cumplan sus criterios
- No encuentra corredores 
- Los corredores dejan de responder

**Motivaciones:**
- Ahorrar dinero
- Encontrar su hogar ideal
- Proceso rápido y eficiente
- Confianza en el proceso
- Vivir en un departamento bonito  

---

## 🎯 OBJETIVO DEL NEGOCIO

**Objetivo principal:** Convertir búsquedas en visitas agendadas y luego en arriendos confirmados.

**Métricas clave:**
- Tasa de conversión Home → Resultados: > 60%
- Tasa de conversión Propiedad → Agendamiento: > 20%
- Tasa de conversión final (Agendamiento completado): > 10%
- Tiempo promedio para agendar visita: < 5 minutos

---

## 🗺️ FLUJO DE USUARIO COMPLETO

### Flujo Principal: Búsqueda y Agendamiento

```
1. Llegada al Home 

navegacion por el home para ver segmentos de interes 

Ejemplo:

Cards deslizables por:
Comuna
Tipo de propiedad (cuantos dormitorios)
Precio (Deptos economicos)
Propiedades destacadas

   ↓
2. Búsqueda con Filtros (/buscar)
   ↓
3. Exploración de Resultados (/buscar?q=...)
   ↓
4. Detalle de Propiedad (/property/[slug])
   ↓
5. Agendamiento de Visita (Modal)
   ↓
6. Confirmación de Visita
   ↓
7. Seguimiento (WhatsApp/Email)
```

### Flujo Alternativo 1: Acceso Directo a Propiedad

```
1. Link directo a /property/[slug]
   ↓
2. Detalle de Propiedad
   ↓
3. "Ver más propiedades" → /buscar
   O
4. Agendamiento de Visita (Modal)
```

### Flujo Alternativo 2: Búsqueda desde Home

```
1. Home (/)
   ↓
2. Formulario de búsqueda
   ↓
3. Resultados (/buscar)
   ↓
4. [Continúa con flujo principal]
```

---

## 📄 ESTRUCTURA DE PÁGINAS

### 1. PÁGINA HOME (`/`)

**Ruta:** `/`  
**Tipo:** Server Component (SSR)  
**Propósito:** Punto de entrada principal, formulario de búsqueda inicial

#### Estructura de la Página

```
┌─────────────────────────────────────┐
│         HEADER / NAVBAR             │
│  (Logo, Menú, CTA)                  │
├─────────────────────────────────────┤
│         HERO SECTION                │
│  - Título principal                 │
│  - Subtítulo                        │
│  - Mensaje clave      │
│  - Imagen de fondo       │
├─────────────────────────────────────┤
│    FORMULARIO DE BÚSQUEDA   
Pills selección rápida        │
│  ┌─────────────────────────────┐   │
│  │ Campo: Búsqueda por texto    │   │
│  │ (dirección, comuna, nombre)  │   │
│  ├─────────────────────────────┤   │
│  │ Filtro: Comuna              │   │
│  │ (Dropdown/Select)    
pills de selección rápida con las principales comunas        │   │
│  ├─────────────────────────────┤   │
│  │ Filtro: Rango de Precio     │   │
│  │ (Min: [input] Max: [input]) │   │
│  ├─────────────────────────────┤   │
│  │ Filtro: Dormitorios          │   │
│  │ (1, 2, 3, 4+)               │   │
│  ├─────────────────────────────┤   │
│  │ Filtro: Baños                │   │
│  │ (1, 2, 3+)                   │   │
│  ├─────────────────────────────┤   │
│  │ Botón: "Buscar Propiedades" │   │
│  └─────────────────────────────┘   │
├─────────────────────────────────────┤
│    PROPIEDADES DESTACADAS           │
│  (Grid de 3-6 propiedades)         │
│  - Imagen                           │
│  - Nombre                           │
│  - Ubicación                        │
│  - Precio desde                     │
│  - CTA: "Ver Detalle"               │
├─────────────────────────────────────┤
│    BENEFICIOS / TRUST SECTION        │
│  - 0% Comisión                      │
│  - Proceso Simple                    │
│  - Transparencia                    │
├─────────────────────────────────────┤
│         FOOTER                       │
│  (Links, Contacto, Redes Sociales)   │
└─────────────────────────────────────┘
```

#### Componentes Utilizados

- `HeroV2` - Hero section principal
- `SearchForm` - Formulario de búsqueda con filtros
- `FeaturedGrid` / `FeaturedGridClient` - Grid de propiedades destacadas
- `Benefits` - Sección de beneficios (opcional)
- `Trust` - Sección de confianza (opcional)

#### Estados de la Página

1. **Estado Inicial:**
   - Formulario vacío
   - Propiedades destacadas cargadas
   - Hero visible

2. **Estado de Búsqueda:**
   - Usuario completa formulario
   - Al hacer clic en "Buscar" → redirige a `/buscar?q=...&comuna=...`

3. **Estado de Carga:**
   - Loading de propiedades destacadas
   - Skeleton loaders

#### Puntos de Conversión

- **Conversión 1:** Usuario completa formulario y hace clic en "Buscar"
  - Métrica: % de usuarios que hacen una búsqueda
  - Meta: > 60%

#### Datos Requeridos

- Lista de propiedades destacadas (desde API `/api/landing/featured`)
- Lista de comunas disponibles (para dropdown)
- Feature flags (para mostrar/ocultar secciones)

---

### 2. PÁGINA DE RESULTADOS (`/buscar`)

**Ruta:** `/buscar`  
**Tipo:** Client Component (con Server Component wrapper)  
**Propósito:** Mostrar resultados de búsqueda con filtros aplicados

#### Estructura de la Página

```
┌─────────────────────────────────────┐
│         HEADER                       │
│  - Breadcrumb: Home > Resultados     │
│  - Término de búsqueda actual        │
│  - Cantidad de resultados            │
│    "X propiedades encontradas"       │
├─────────────────────────────────────┤
│    BARRA DE FILTROS (Sticky)         │
│  ┌─────────────────────────────┐   │
│  │ Filtros activos (Chips)      │   │
│  │ [Comuna: Providencia] [X]    │   │
│  │ [Precio: $500k-$1M] [X]      │   │
│  ├─────────────────────────────┤   │
│  │ Búsqueda por texto           │   │
│  │ Comuna (Dropdown)             │   │
│  │ Rango Precio (Min/Max)       │   │
│  │ Dormitorios (Checkboxes)      │   │
│  │ Baños (Checkboxes)            │   │
│  │ Ordenar por: [Dropdown]      │   │
│  │ Botón: "Limpiar Filtros"      │   │
│  └─────────────────────────────┘   │
├─────────────────────────────────────┤
│    GRID DE RESULTADOS               │
│  ┌──────┐ ┌──────┐ ┌──────┐       │
│  │Card 1│ │Card 2│ │Card 3│       │
│  └──────┘ └──────┘ └──────┘       │
│  ┌──────┐ ┌──────┐ ┌──────┐       │
│  │Card 4│ │Card 5│ │Card 6│       │
│  └──────┘ └──────┘ └──────┘       │
│                                     │
│  Cada Card contiene:                │
│  - Imagen de la propiedad           │
│  - Nombre del edificio              │
│  - Ubicación (comuna, dirección)    │
│  - Precio desde                     │
│  - Badge: "0% Comisión"             │
│  - CTA: "Ver Detalle"               │
├─────────────────────────────────────┤
│    PAGINACIÓN                       │
│  [< Anterior] [1] [2] [3] [Siguiente >]│
├─────────────────────────────────────┤
│    ESTADO VACÍO (si no hay)         │
│  - Icono                            │
│  - Mensaje: "No se encontraron..."  │
│  - Sugerencia: "Intenta ajustar..."│
│  - Botón: "Limpiar Filtros"         │
└─────────────────────────────────────┘
```

#### Componentes Utilizados

- `SearchResultsClient` - Componente cliente principal
- `FilterBar` / `AdvancedFilterBar` - Barra de filtros
- `FilterChips` - Chips de filtros activos
- `SearchInput` - Input de búsqueda
- `SortSelect` - Selector de ordenamiento
- `BuildingCard` / `BuildingCardV2` - Cards de propiedades
- `PaginationControls` - Controles de paginación
- `ResultsGrid` / `VirtualResultsGrid` - Grid de resultados

#### Estados de la Página

1. **Estado de Carga:**
   - Skeleton loaders para cards
   - Spinner en área de resultados

2. **Estado con Resultados:**
   - Grid de propiedades
   - Filtros activos visibles
   - Paginación visible

3. **Estado Vacío:**
   - Mensaje claro
   - Sugerencias para ajustar filtros
   - Botón para limpiar filtros

4. **Estado de Error:**
   - Mensaje de error
   - Botón para reintentar

#### Query Parameters

- `q` - Término de búsqueda (texto)
- `comuna` - Comuna seleccionada
- `precioMin` - Precio mínimo
- `precioMax` - Precio máximo
- `dormitorios` - Cantidad de dormitorios
- `banos` - Cantidad de baños
- `sort` - Ordenamiento (precio, ubicación, etc.)
- `page` - Página actual (paginación)

#### Puntos de Conversión

- **Conversión 2:** Usuario hace clic en una propiedad
  - Métrica: Click-through rate (CTR) de resultados
  - Meta: > 15%

#### Datos Requeridos

- Lista de propiedades filtradas (desde API `/api/buildings` o `/api/buildings/paginated`)
- Total de resultados (para paginación)
- Lista de comunas (para filtros)

---

### 3. PÁGINA DE PROPIEDAD (`/property/[slug]`)

**Ruta:** `/property/[slug]`  
**Tipo:** Server Component con Client Component para interactividad  
**Propósito:** Detalle completo de una propiedad individual

#### Estructura de la Página

```
┌─────────────────────────────────────┐
│         HEADER                       │
│  - Breadcrumb: Home > Propiedad      │
│  - Botón: "Volver a resultados"      │
├─────────────────────────────────────┤
│    GALERÍA DE IMÁGENES              │
│  ┌─────────────────────────────┐   │
│  │ [Imagen Principal]          │   │
│  │ [Thumbnails: 1 2 3 4 5...]  │   │
│  └─────────────────────────────┘   │
│  - Carousel o Grid                  │
│  - Lightbox al hacer clic          │
├─────────────────────────────────────┤
│    INFORMACIÓN PRINCIPAL            │
│  ┌─────────────────────────────┐   │
│  │ Nombre del Edificio          │   │
│  │ Dirección completa           │   │
│  │ Comuna                       │   │
│  │ Precio desde: $XXX,XXX       │   │
│  │ Badge: "0% Comisión"         │   │
│  └─────────────────────────────┘   │
├─────────────────────────────────────┤
│    CTA STICKY (Mobile)              │
│  [Agendar Visita] [WhatsApp]       │
├─────────────────────────────────────┤
│    AMENIDADES                       │
│  ┌─────────────────────────────┐   │
│  │ [Icono] Piscina             │   │
│  │ [Icono] Gimnasio            │   │
│  │ [Icono] Estacionamiento      │   │
│  │ [Icono] Seguridad 24/7      │   │
│  │ ... (lista completa)        │   │
│  └─────────────────────────────┘   │
├─────────────────────────────────────┤
│    UNIDADES DISPONIBLES             │
│  ┌─────────────────────────────┐   │
│  │ Tabla o Cards de unidades:    │   │
│  │ - Tipología (2D2B)           │   │
│  │ - Metros cuadrados           │   │
│  │ - Precio mensual             │   │
│  │ - Disponibilidad             │   │
│  │ - Estacionamiento            │   │
│  │ - Bodega                     │   │
│  │ - CTA: "Ver Detalle"         │   │
│  └─────────────────────────────┘   │
├─────────────────────────────────────┤
│    UBICACIÓN                         │
│  - Mapa (Google Maps)                │
│  - Dirección completa                │
│  - Puntos de interés cercanos        │
│  - Transporte público               │
├─────────────────────────────────────┤
│    CTA PRINCIPAL                     │
│  [Agendar Visita] (Botón grande)     │
│  [Contactar por WhatsApp]            │
├─────────────────────────────────────┤
│    PROPIEDADES RELACIONADAS          │
│  (Grid de 3-4 propiedades similares)  │
├─────────────────────────────────────┤
│         FOOTER                       │
└─────────────────────────────────────┘
```

#### Componentes Utilizados

- `PropertyClient` - Componente cliente principal
- `PropertyGallery` - Galería de imágenes
- `PropertyHeader` - Header con información principal
- `AmenityList` - Lista de amenidades
- `PropertyUnits` - Tabla/Cards de unidades
- `PropertyLocation` - Mapa y ubicación
- `PropertySidebar` - Sidebar con CTA (desktop)
- `StickyMobileCTA` - CTA sticky para mobile
- `RelatedBuildings` - Propiedades relacionadas
- `VisitSchedulerModal` - Modal de agendamiento

#### Estados de la Página

1. **Estado de Carga:**
   - Skeleton loaders
   - Loading state para imágenes

2. **Estado con Datos:**
   - Toda la información visible
   - Modal de agendamiento cerrado

3. **Estado de Agendamiento:**
   - Modal de agendamiento abierto
   - Calendario visible
   - Formulario visible

4. **Estado de Confirmación:**
   - Mensaje de éxito
   - Detalles de la visita
   - Opciones de seguimiento

5. **Estado de Error (404):**
   - Página no encontrada
   - Botón para volver a resultados

#### Puntos de Conversión

- **Conversión 3:** Usuario hace clic en "Agendar Visita"
  - Métrica: % de usuarios que intentan agendar
  - Meta: > 20%

- **Conversión 4:** Usuario completa y confirma la visita
  - Métrica: Tasa de conversión final
  - Meta: > 10%

#### Datos Requeridos

- Datos completos de la propiedad (desde API `/api/buildings/[slug]`)
- Unidades disponibles
- Imágenes de la propiedad
- Propiedades relacionadas
- Disponibilidad de calendario (para agendamiento)

#### Query Parameters Opcionales

- `unit` - ID de unidad específica (para scroll automático)
- `tipologia` - Filtrar por tipología
- `ver` - Ver todas las unidades (`ver=unidades`)

---

### 4. MODAL DE AGENDAMIENTO (Integrado en `/property/[slug]`)

**Ruta:** Modal dentro de `/property/[slug]`  
**Tipo:** Client Component (Modal)  
**Propósito:** Permitir al usuario agendar una visita a la propiedad

#### Estructura del Modal

```
┌─────────────────────────────────────┐
│    MODAL OVERLAY                     │
│  ┌─────────────────────────────┐   │
│  │ [X] Cerrar                   │   │
│  │                              │   │
│  │ Nombre de la Propiedad       │   │
│  │ Dirección                    │   │
│  ├─────────────────────────────┤   │
│  │    CALENDARIO                │   │
│  │  ┌─────────────────────┐   │   │
│  │  │ [Calendario 5 días]   │   │   │
│  │  │ Solo días laborales   │   │   │
│  │  │ Slots de 30 minutos   │   │   │
│  │  └─────────────────────┘   │   │
│  ├─────────────────────────────┤   │
│  │    HORARIOS DISPONIBLES     │   │
│  │  [09:00] [09:30] [10:00]    │   │
│  │  [10:30] [11:00] [11:30]    │   │
│  │  ... (según fecha)           │   │
│  ├─────────────────────────────┤   │
│  │    FORMULARIO DE CONTACTO   │   │
│  │  ┌─────────────────────┐   │   │
│  │  │ Nombre: [input] *     │   │   │
│  │  │ Email: [input] *       │   │   │
│  │  │ Teléfono: [input] *    │   │   │
│  │  │ Mensaje: [textarea]    │   │   │
│  │  └─────────────────────┘   │   │
│  ├─────────────────────────────┤   │
│  │    BOTÓN: "Confirmar Visita"│   │
│  │    [Cancelar] [Confirmar]   │   │
│  └─────────────────────────────┘   │
│                                      │
│  ESTADO DE CONFIRMACIÓN:             │
│  ┌─────────────────────────────┐   │
│  │ ✅ Visita Confirmada          │   │
│  │                              │   │
│  │ Fecha: [Fecha seleccionada]  │   │
│  │ Hora: [Hora seleccionada]    │   │
│  │                              │   │
│  │ Agente: [Nombre]             │   │
│  │ Teléfono: [Teléfono]        │   │
│  │                              │   │
│  │ [Agregar al Calendario]      │   │
│  │ [Contactar por WhatsApp]     │   │
│  │ [Cerrar]                     │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

#### Componentes Utilizados

- `VisitSchedulerModal` - Modal principal
- `QuintoAndarVisitScheduler` - Scheduler inspirado en QuintoAndar
- `WeekView` - Vista de calendario semanal
- `AvailabilitySection` - Sección de disponibilidad
- `VisitQuoteModal` - Modal de cotización (opcional)

#### Estados del Modal

1. **Estado Inicial:**
   - Calendario visible
   - Sin fecha seleccionada
   - Formulario visible pero deshabilitado

2. **Estado con Fecha Seleccionada:**
   - Fecha resaltada
   - Horarios disponibles visibles
   - Formulario habilitado

3. **Estado de Envío:**
   - Loading spinner
   - Botón deshabilitado
   - Mensaje "Enviando..."

4. **Estado de Confirmación:**
   - Mensaje de éxito
   - Detalles de la visita
   - Opciones de seguimiento

5. **Estado de Error:**
   - Mensaje de error
   - Botón para reintentar
   - Opción para contactar directamente

#### Validaciones

- Nombre: Requerido, mínimo 2 caracteres
- Email: Requerido, formato válido
- Teléfono: Requerido, formato chileno (+56 9 XXXX XXXX)
- Fecha: Debe ser un slot disponible
- Hora: Debe ser un horario disponible

#### Puntos de Conversión

- **Conversión Final:** Usuario completa y confirma la visita
  - Métrica: Tasa de conversión final
  - Meta: > 10%

#### Datos Requeridos

- Disponibilidad de calendario (desde API `/api/availability`)
- Slots disponibles para la propiedad
- Información del agente asignado

---

### 5. PÁGINA COMING SOON (`/coming-soon`)

**Ruta:** `/coming-soon`  
**Tipo:** Client Component  
**Propósito:** Página mostrada cuando el sitio está en modo "coming soon"

#### Estructura de la Página

```
┌─────────────────────────────────────┐
│         HEADER (Minimal)              │
│  - Logo                              │
├─────────────────────────────────────┤
│    HERO SECTION                      │
│  - Título: "Próximamente"            │
│  - Subtítulo: "Estamos preparando..."│
│  - Imagen/Ilustración                │
├─────────────────────────────────────┤
│    FORMULARIO DE WAITLIST            │
│  ┌─────────────────────────────┐   │
│  │ Email: [input]               │   │
│  │ Teléfono: [input] (opcional) │   │
│  │ Nombre: [input] (opcional)   │   │
│  │ Botón: "Notificarme"         │   │
│  └─────────────────────────────┘   │
├─────────────────────────────────────┤
│    BENEFICIOS                        │
│  - Lo que ofreceremos                │
│  - Por qué esperar                   │
├─────────────────────────────────────┤
│    REDES SOCIALES                    │
│  - Links a Instagram, Facebook, etc. │
├─────────────────────────────────────┤
│         FOOTER                       │
└─────────────────────────────────────┘
```

#### Componentes Utilizados

- `ComingSoonClient` - Componente cliente principal
- `ComingSoonHero` - Hero section
- `WaitlistForm` - Formulario de waitlist

#### Estados de la Página

1. **Estado Inicial:**
   - Formulario vacío
   - Hero visible

2. **Estado de Envío:**
   - Loading spinner
   - Botón deshabilitado

3. **Estado de Confirmación:**
   - Mensaje de éxito
   - "Te notificaremos cuando estemos listos"

---

### 6. PÁGINA COTIZADOR (`/cotizador`)

**Ruta:** `/cotizador`  
**Tipo:** Client Component  
**Propósito:** Sistema de cotización de propiedades (actualmente deshabilitado en MVP)

#### Nota
Esta página está actualmente fuera del scope del MVP, pero está implementada. Puede ser activada según necesidades.

---

## 🎨 COMPONENTES Y ELEMENTOS UI

### Componentes Principales

#### 1. HeroV2
- **Ubicación:** `components/marketing/HeroV2.tsx`
- **Propósito:** Hero section principal del home
- **Props:**
  - `title?: string` - Título personalizado
  - `subtitle?: string` - Subtítulo
  - `ctaText?: string` - Texto del CTA
  - `ctaLink?: string` - Link del CTA

#### 2. SearchForm
- **Ubicación:** `components/marketing/SearchForm.tsx`
- **Propósito:** Formulario de búsqueda con filtros
- **Props:**
  - `initialValues?: SearchFilters` - Valores iniciales
  - `onSubmit?: (filters: SearchFilters) => void` - Callback de submit

#### 3. BuildingCard / BuildingCardV2
- **Ubicación:** `components/ui/BuildingCardV2.tsx`
- **Propósito:** Card de propiedad para grid de resultados
- **Props:**
  - `building: Building` - Datos de la propiedad
  - `onClick?: () => void` - Callback de click
  - `variant?: 'default' | 'compact'` - Variante del card

#### 4. PropertyClient
- **Ubicación:** `app/(catalog)/property/[slug]/PropertyClient.tsx`
- **Propósito:** Componente cliente principal de página de propiedad
- **Props:**
  - `building: Building` - Datos de la propiedad
  - `relatedBuildings: Building[]` - Propiedades relacionadas
  - `defaultUnitId?: string` - ID de unidad por defecto
  - `tipologiaFilter?: string` - Filtro de tipología

#### 5. VisitSchedulerModal
- **Ubicación:** `components/flow/VisitSchedulerModal.tsx`
- **Propósito:** Modal de agendamiento de visitas
- **Props:**
  - `isOpen: boolean` - Estado de apertura
  - `onClose: () => void` - Callback de cierre
  - `listingId: string` - ID de la propiedad
  - `propertyName: string` - Nombre de la propiedad
  - `onSuccess?: (visitData: VisitData) => void` - Callback de éxito

#### 6. FilterBar / AdvancedFilterBar
- **Ubicación:** `components/filters/FilterBar.tsx`, `components/filters/AdvancedFilterBar.tsx`
- **Propósito:** Barra de filtros para resultados
- **Props:**
  - `filters: SearchFilters` - Filtros actuales
  - `onChange: (filters: SearchFilters) => void` - Callback de cambio
  - `onClear: () => void` - Callback de limpiar

#### 7. PaginationControls
- **Ubicación:** `components/ui/PaginationControls.tsx`
- **Propósito:** Controles de paginación
- **Props:**
  - `currentPage: number` - Página actual
  - `totalPages: number` - Total de páginas
  - `onPageChange: (page: number) => void` - Callback de cambio

### Elementos UI Base

- **Botones:** `PrimaryButton`, `SecondaryButton`
- **Inputs:** `SearchInput`, `Select`, `Checkbox`, `Radio`
- **Modals:** `Modal` (base)
- **Loading:** `Skeleton`, `Spinner`
- **Badges:** `PromotionBadge`
- **Cards:** `BuildingCard`, `BuildingCardV2`

---

## 📊 ESTADOS Y PUNTOS DE CONVERSIÓN

### Estados Globales de la Aplicación

1. **Estado de Carga Inicial:**
   - Loading de datos iniciales
   - Skeleton loaders

2. **Estado Normal:**
   - Datos cargados
   - Usuario navegando

3. **Estado de Búsqueda:**
   - Filtros aplicados
   - Resultados mostrados

4. **Estado de Agendamiento:**
   - Modal abierto
   - Proceso de agendamiento activo

5. **Estado de Error:**
   - Error en carga de datos
   - Error en API
   - 404 Not Found

### Puntos de Conversión Principales

| # | Punto de Conversión | Métrica | Meta | Estado Actual |
|---|---------------------|---------|------|---------------|
| 1 | Home → Resultados | % usuarios que hacen búsqueda | > 60% | ⚠️ Por medir |
| 2 | Resultados → Propiedad | CTR de resultados | > 15% | ⚠️ Por medir |
| 3 | Propiedad → Agendamiento | % que abren scheduler | > 20% | ⚠️ Por medir |
| 4 | Agendamiento → Confirmación | Tasa de completitud | > 10% | ⚠️ Por medir |

### Funnels de Conversión

```
100 usuarios llegan al Home
  ↓ (60% conversión)
60 usuarios hacen una búsqueda
  ↓ (15% CTR)
9 usuarios hacen clic en una propiedad
  ↓ (20% intentan agendar)
1.8 usuarios abren el scheduler
  ↓ (10% completan)
0.18 usuarios completan el agendamiento
```

---

## 🔌 APIs Y ENDPOINTS

### Endpoints Públicos Principales

#### 1. GET `/api/buildings`
- **Propósito:** Listar edificios con paginación
- **Query Params:**
  - `page?: number` - Página (default: 1)
  - `limit?: number` - Límite por página (default: 12)
  - `comuna?: string` - Filtro por comuna
  - `precioMin?: number` - Precio mínimo
  - `precioMax?: number` - Precio máximo
  - `dormitorios?: number` - Cantidad de dormitorios
  - `banos?: number` - Cantidad de baños
  - `q?: string` - Búsqueda por texto
- **Response:**
```json
{
  "buildings": Building[],
  "total": number,
  "hasMore": boolean,
  "page": number,
  "limit": number
}
```

#### 2. GET `/api/buildings/[slug]`
- **Propósito:** Obtener edificio por slug
- **Response:**
```json
{
  "building": Building
}
```

#### 3. GET `/api/availability`
- **Propósito:** Consultar disponibilidad de unidades para visitas
- **Query Params:**
  - `listingId: string` - ID de la propiedad
  - `start: string` - Fecha inicio (RFC 3339)
  - `end: string` - Fecha fin (RFC 3339)
- **Response:**
```json
{
  "listingId": string,
  "timezone": string,
  "slots": Slot[],
  "nextAvailableDate": string
}
```

#### 4. POST `/api/visits`
- **Propósito:** Crear una visita agendada
- **Headers:**
  - `Idempotency-Key: string` - Clave de idempotencia
- **Body:**
```json
{
  "listingId": string,
  "slotId": string,
  "userId": string,
  "channel": "web" | "whatsapp",
  "idempotencyKey": string
}
```
- **Response:**
```json
{
  "visitId": string,
  "status": "confirmed",
  "agent": {
    "name": string,
    "phone": string,
    "whatsappNumber": string
  },
  "slot": {
    "startTime": string,
    "endTime": string
  },
  "confirmationMessage": string
}
```

#### 5. POST `/api/waitlist`
- **Propósito:** Agregar email a lista de espera
- **Body:**
```json
{
  "email": string,
  "phone": string (opcional),
  "name": string (opcional),
  "contactMethod": "whatsapp" | "email" (opcional),
  "source": string (opcional)
}
```

#### 6. POST `/api/quotations`
- **Propósito:** Calcular cotización de una unidad
- **Body:**
```json
{
  "unitId": string,
  "startDate": string (ISO date),
  "options": {
    "parkingSelected": boolean,
    "storageSelected": boolean,
    "parkingPrice": number (opcional),
    "storagePrice": number (opcional),
    "creditReportFee": number
  }
}
```

### Rate Limiting

- **Buildings:** 20 req/min
- **Availability:** 20 req/min
- **Visits:** 10 req/min
- **Waitlist:** 20 req/min
- **Quotations:** 10 req/min

---

## 📦 DATOS Y MODELOS

### Modelo Building (Edificio)

```typescript
interface Building {
  id: string;
  slug: string;
  name: string;
  address: string;
  comuna: string;
  coverImage: string;
  gallery: string[];
  amenities: string[];
  units: Unit[];
  // ... más campos
}
```

### Modelo Unit (Unidad)

```typescript
interface Unit {
  id: string;
  tipologia: string; // "2D2B", "1D1B", etc.
  m2: number;
  price: number;
  disponible: boolean;
  estacionamiento: boolean;
  bodega: boolean;
  // ... más campos
}
```

### Modelo Visit (Visita)

```typescript
interface Visit {
  visitId: string;
  listingId: string;
  slotId: string;
  userId: string;
  status: "confirmed" | "canceled" | "completed";
  slot: {
    startTime: string;
    endTime: string;
  };
  agent: {
    name: string;
    phone: string;
    whatsappNumber: string;
  };
  // ... más campos
}
```

### Modelo SearchFilters (Filtros de Búsqueda)

```typescript
interface SearchFilters {
  q?: string; // Búsqueda por texto
  comuna?: string;
  precioMin?: number;
  precioMax?: number;
  dormitorios?: number;
  banos?: number;
  sort?: "precio" | "ubicacion" | "relevancia";
  page?: number;
  limit?: number;
}
```

---

## 🚧 NOTAS DE IMPLEMENTACIÓN

### Feature Flags

El sistema usa feature flags para controlar funcionalidades:

- `comingSoon: boolean` - Activa/desactiva modo "coming soon"
- `mvpMode: boolean` - Activa/desactiva modo MVP (solo rutas esenciales)

**Archivo:** `config/feature-flags.json`

### Responsive Design

- **Mobile First:** Diseño optimizado para móvil
- **Breakpoints:**
  - Mobile: < 640px
  - Tablet: 640px - 1024px
  - Desktop: > 1024px

### Accesibilidad (A11y)

- Soporte para `prefers-reduced-motion`
- Navegación por teclado
- ARIA labels donde corresponde
- Contraste de colores WCAG AA

### Performance

- **SSR/ISR:** Páginas principales con Server-Side Rendering
- **Lazy Loading:** Componentes pesados cargados bajo demanda
- **Image Optimization:** Next.js Image component
- **Code Splitting:** Automático con Next.js

### SEO

- Metadata dinámica por página
- JSON-LD structured data
- Sitemap.xml generado
- Robots.txt configurable

---

## 📝 SECCIÓN PARA EDITAR Y REDEFINIR

> **🔴 EDITA ESTA SECCIÓN SEGÚN TUS NECESIDADES**

### Cambios Deseados en la Estructura

```
[ESPACIO PARA QUE EL USUARIO EDITE Y REDEFINA]

Ejemplo:
- Quiero agregar una página de "Cómo Funciona"
- Necesito cambiar el flujo de agendamiento
- Quiero agregar un sistema de favoritos
- Necesito cambiar los filtros de búsqueda
```

### Cambios Deseados en el Flujo de Usuario

```
[ESPACIO PARA QUE EL USUARIO EDITE Y REDEFINA]

Ejemplo:
- El usuario debe poder crear una cuenta
- Necesito un proceso de verificación de identidad
- Quiero agregar un chat en vivo
```

### Cambios Deseados en Componentes

```
[ESPACIO PARA QUE EL USUARIO EDITE Y REDEFINA]

Ejemplo:
- Necesito un nuevo componente de comparación de propiedades
- Quiero cambiar el diseño de las cards
- Necesito agregar un mapa interactivo
```

### Cambios Deseados en APIs

```
[ESPACIO PARA QUE EL USUARIO EDITE Y REDEFINA]

Ejemplo:
- Necesito un endpoint para guardar búsquedas
- Quiero agregar autenticación de usuarios
- Necesito un sistema de notificaciones
```

### Prioridades y Roadmap

```
[ESPACIO PARA QUE EL USUARIO EDITE Y REDEFINA]

Ejemplo:
1. Alta prioridad: Sistema de autenticación
2. Media prioridad: Chat en vivo
3. Baja prioridad: Sistema de favoritos
```

---

## ✅ CHECKLIST DE REVISIÓN

Antes de devolver este documento, verifica que hayas:

- [ ] Revisado todas las páginas y su estructura
- [ ] Editado la sección "Cambios Deseados"
- [ ] Definido prioridades claras
- [ ] Especificado cualquier cambio en el flujo de usuario
- [ ] Indicado qué componentes necesitas modificar/agregar
- [ ] Especificado cambios en APIs o datos

---

**📅 Última actualización:** Enero 2025  
**👤 Creado para:** Revisión y redefinición del MVP  
**🎯 Próximo paso:** Una vez editado, devolver para definir sprints de implementación
