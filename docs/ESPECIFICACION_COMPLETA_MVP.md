# 📋 ESPECIFICACIÓN COMPLETA DEL MVP - Elkis Realtor Portal

> **Nota:** Proyecto renombrado de "HOMmie 0% Comisión" a "Elkis Realtor Portal"

**Documento:** Especificación completa y editable de todas las páginas del MVP, historia del cliente y flujos de usuario  
**Fecha:** Enero 2025  
**Versión:** MVP 1.0  
**Estado:** Aprobada

> **✅ ESTADO:** Este documento ha sido **APROBADO** y está listo para implementación.  
> Los cambios futuros se registrarán en `docs/CONTEXTO_RECIENTE.md` y se actualizará el estado de implementación en este documento.

> **⚠️ IMPORTANTE - Aclaración sobre Estructura de Datos:**
> - **NO trabajamos con páginas/cards de edificios por ahora** - Esto se agregará después
> - **Solo trabajamos con UNIDADES (propiedades individuales)** - Cada card representa una unidad específica
> - **Las cards de unidades llevan directamente a `/property/[slug]`** - Donde `slug` es el identificador de la unidad
> - **Cada unidad tiene su propia página de detalle** - No hay página intermedia de edificio

---

## 🎯 ACLARACIONES IMPORTANTES

### Estructura de Datos en el MVP

**Por ahora (MVP):**
- ✅ Trabajamos con **UNIDADES** (departamentos individuales)
- ✅ Cada card en home y resultados es una **UNIDAD específica**
- ✅ Al hacer clic en una card → va directo a `/property/[slug-unidad]`
- ✅ La página `/property/[slug]` muestra el detalle de **UNA unidad**
- ✅ La información del edificio se muestra como **contexto** en la página de unidad

**NO incluido por ahora:**
- ❌ Páginas de edificios completos
- ❌ Cards de edificios (solo cards de unidades)
- ❌ Navegación Edificio → Unidades → Unidad específica

**Para después:**
- 🔮 Páginas de edificios con todas sus unidades
- 🔮 Cards de edificios que lleven a página de edificio
- 🔮 Navegación más compleja Edificio → Unidades

### Flujo de Navegación Actual

```
Home (/)
  ↓
Cards de UNIDADES destacadas
  ↓ (click en card)
/property/[slug-unidad]  ← Página de UNA unidad específica

O

/buscar (resultados)
  ↓
Cards de UNIDADES filtradas
  ↓ (click en card)
/property/[slug-unidad]  ← Página de UNA unidad específica
```

**No hay:**
- `/building/[slug]` (página de edificio)
- Cards de edificios

---

## 📑 ÍNDICE

1. [Aclaraciones Importantes](#aclaraciones-importantes)
2. [Historia del Cliente](#historia-del-cliente)
3. [Flujo de Usuario Completo](#flujo-de-usuario-completo)
4. [Estructura de Páginas](#estructura-de-páginas)
5. [Componentes y Elementos UI](#componentes-y-elementos-ui)
6. [Elkis UI/UX System v2.0](#-elkis-uiux-system-v20-tech-first-adaptation)
7. [Estados y Puntos de Conversión](#estados-y-puntos-de-conversión)
8. [APIs y Endpoints](#apis-y-endpoints)
9. [Datos y Modelos](#datos-y-modelos)
10. [Estrategia SEO](#estrategia-seo---basada-en-portalinmobiliario)
11. [Manejo de Errores](#-manejo-de-errores-y-edge-cases)
12. [Validaciones](#-validaciones-completas)
13. [Integraciones](#-integraciones)
14. [Consideraciones Técnicas](#-consideraciones-móvil)
15. [Estado de Implementación](#-estado-de-implementación) ⭐ **ACTUALIZAR AQUÍ AL COMPLETAR TAREAS**
16. [Resumen Ejecutivo](#-resumen-ejecutivo)

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
- Quiere agendar de forma sencilla y rápida
- No quiere encontrar sorpresas en el proceso  
- Quiere saber qué monto debe pagar para mudarse 
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
1. Llegada al Home (/)
   
   Navegación por el home para ver segmentos de interés:
   - Cards deslizables por Comuna
   - Cards deslizables por Tipo de propiedad (cuántos dormitorios)
   - Cards deslizables por Precio (Deptos económicos)
   - Propiedades destacadas
   
   ↓
2. Búsqueda con Filtros (/buscar) o clic directo en cards deslizables 
   ↓
3. Exploración de Resultados (/buscar?q=...)
   - Cada card es una UNIDAD específica
   - Click en card → va directo a /property/[slug-unidad]
   ↓
4. Detalle de Unidad/Propiedad (/property/[slug])
   - Página de detalle de la unidad específica
   - NO hay página intermedia de edificio
   ↓
5. Agendamiento de Visita (Modal)
   ↓
6. Confirmación de Visita
   ↓
7. Seguimiento (WhatsApp/Email)
```

> **Nota:** Cada card en resultados representa una **UNIDAD** (no un edificio). Al hacer clic, va directo a la página de detalle de esa unidad.

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
│  - Logo                              │
│  - CTA solo de contacto por WhatsApp │
│                                      │
│  Sticky Search Bar (NUEVO COMPONENTE)│
│  - Barra de búsqueda cool, minimalista│
│  - Al tocarse se despliegan opciones │
│  - En escritorio: selección simple en una línea│
│  - En móvil: caja más ancha          │
│  - Estilo: cool, profesional, moderno│
│  - Animaciones estilo Airbnb         │

├─────────────────────────────────────┤
│         HERO SECTION                │
│  - Título principal                 │
│  - Subtítulo                        │
│  - Mensaje clave      │
│  - Imagen de fondo       │
├─────────────────────────────────────┤
│    FORMULARIO DE BÚSQUEDA           │
│  (Pills de selección rápida)         │
│  ┌─────────────────────────────┐   │
│  │ Campo: Búsqueda por texto    │   │
│  │ (dirección, comuna, nombre)  │   │
│  ├─────────────────────────────┤   │
│  │ Filtro: Comuna              │   │
│  │ - Dropdown/Select           │   │
│  │ - Pills de selección rápida  │   │
│  │   (principales comunas)     │   │
│  ├─────────────────────────────┤   │
│  │ Filtro: Rango de Precio     │   │
│  │ (Min: [input] Max: [input]) │   │
│  ├─────────────────────────────┤   │
│  │ Filtro: Dormitorios          │   │
│  │ (Estudio, 1, 2, 3)           │   │
│  ├─────────────────────────────┤   │
│  │ Botón: "Buscar Departamentos"│   │
│  └─────────────────────────────┘   │
├─────────────────────────────────────┤
│   DEPARTAMENTOS DESTACADOS           │
│  (Múltiples grids deslizables)      │
│                                      │
│  Grid 1: "Departamentos en Ñuñoa"  │
│  Grid 2: "Departamentos en La Florida"│
│  Grid 3: "Departamentos 1 dormitorio"│
│  Grid 4: "Departamentos económicos" │
│  ... (más grids según segmentos)    │
│                                      │
│  Cada grid:                          │
│  - Muestra 3-6 unidades              │
│  - Es deslizable (carousel)          │
│  - Tiene botón "Ver todos" que lleva │
│    a /buscar con filtros aplicados  │
│                                      │
│  ⚠️ IMPORTANTE: Cada card es una    │
│     UNIDAD específica, NO un edificio│
│                                      │
│  Cada Card contiene:                 │
│  - Imagen de la unidad               │
│  - Nombre del edificio                │
│  - Ubicación (dirección, comuna)     │
│  - Metro cercano (si BD tiene info)  │
│  - Arriendo + Gasto Común            │
│  - CTA: "Ver departamento"           │
│    → Lleva a /property/[slug-unidad]│
├─────────────────────────────────────┤
│    BENEFICIOS                       │
│  "¿Por qué arrendar con nosotros?"  │
│  "Nuestro servicio es ¡fácil,      │
│   rápido y seguro!"                 │
│                                      │
│  Sección 1: "Arrienda sin estrés"   │
│  - Facilitamos tu proceso de        │
│    arriendo, conduciéndote de forma │
│    rápida y sencilla hacia tu nuevo │
│    hogar.                           │
│                                      │
│  Sección 2: "Todo, aquí y ahora"    │
│  - Priorizamos tu comodidad:        │
│    consulta cuentas, realiza pagos  │
│    y reserva espacios comunes en    │
│    nuestra app.                     │
│                                      │
│  Sección 3: "Somos líderes en el    │
│              mercado"                │
│  - Contamos con 12 años de          │
│    experiencia y más de 105.000     │
│    arrendatarios que han confiado   │
│    en nosotros.                     │
│  (Generar versión basada en esto    │
│   pero completamente distinta)      │
├─────────────────────────────────────┤
│         FOOTER                       │
│  (Links, Contacto, Redes Sociales)   │
└─────────────────────────────────────┘
```

#### Componentes Utilizados

- `Hero` - **RENOMBRAR** de `HeroV2` - Hero section principal
- `StickySearchBar` - **NUEVO** Barra de búsqueda sticky (estilo Airbnb)
- `SearchForm` - Formulario de búsqueda con filtros
- `FeaturedGrid` / `FeaturedGridClient` - Grid de unidades destacadas
- `FeaturedCard` - **IMPORTANTE:** Cada card representa una UNIDAD específica, NO un edificio
- `FeaturedGridSimilar` - Grid de unidades similares a la búsqueda
- `Benefits` - Sección de beneficios

> **⚠️ Nota sobre Cards:**
> - `FeaturedCard` muestra UNA unidad específica
> - Al hacer clic → va directo a `/property/[slug-unidad]`
> - NO hay página intermedia de edificio

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
   - Logo animado de carga

#### Puntos de Conversión

- **Conversión 1:** Usuario completa formulario y hace clic en "Buscar"
  - Métrica: % de usuarios que hacen una búsqueda
  - Meta: > 60%

#### Datos Requeridos

- Lista de **unidades** destacadas (desde API `/api/landing/featured`)
  - ⚠️ Cada item es una UNIDAD, no un edificio
- Lista de comunas disponibles (para dropdown y pills)
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
│  - Imagen de la unidad              │
│  - Nombre del edificio              │
│  - Ubicación (comuna, dirección)    │
│  - Metro cercano (si disponible)     │
│  - Arriendo + Gasto Común           │
│  - Tipología (Estudio, 1D1B, etc.)  │
│  - CTA: "Ver departamento"          │
│    → Lleva a /property/[slug-unidad]│
│                                      │
│  ⚠️ IMPORTANTE: Cada card es una    │
│     UNIDAD específica, NO un edificio│
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
- `FeaturedCard` - **IMPORTANTE:** Card de UNIDAD (no edificio)
- `PaginationControls` - Controles de paginación
- `ResultsGrid` / `VirtualResultsGrid` - Grid de resultados

> **⚠️ Nota sobre Resultados:**
> - Cada resultado es una **UNIDAD** específica
> - Al hacer clic → va directo a `/property/[slug-unidad]`
> - NO hay página intermedia de edificio

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

- Lista de **unidades** filtradas (desde API `/api/buildings` o `/api/buildings/paginated`)
  - ⚠️ Cada item es una UNIDAD, no un edificio
- Total de resultados (para paginación)
- Lista de comunas (para filtros)

---

### 3. PÁGINA DE PROPIEDAD/UNIDAD (`/property/[slug]`)

**Ruta:** `/property/[slug]` o `/arriendo/departamento/[comuna]/[slug]` (SEO-friendly)  
**Tipo:** Server Component con Client Component para interactividad  
**Propósito:** Detalle completo de una **UNIDAD** específica (no edificio)

> **⚠️ IMPORTANTE:**
> - Esta página muestra el detalle de UNA unidad específica
> - El `slug` identifica la unidad, no el edificio
> - NO hay página intermedia de edificio por ahora
> - Las cards en home y resultados llevan directamente aquí
> - **Basado en estructura de Assetplan** - Optimizada para conversión

#### Estructura de la Página (Basada en Assetplan)

```
┌─────────────────────────────────────┐
│  1. HEADER / NAVEGACIÓN GLOBAL      │
│  (Mantener nuestro header actual)   │
│  - Logo Elkis Realtor               │
│  - Menú principal                   │
│  - Buscador                         │
│  - CTA contacto                     │
├─────────────────────────────────────┤
│  2. BREADCRUMB (Ruta navegación)    │
│  Home > Arriendo Departamentos >     │
│  [Comuna] > [Edificio] > [Tipología]│
│                                      │
│  Ejemplo:                           │
│  Home > Arriendo Departamentos >     │
│  Ñuñoa > Guillermo Mann > Estudio  │
├─────────────────────────────────────┤
│  3. HERO DEL DEPARTAMENTO           │
│  ┌───────────────────────────────┐ │
│  │ 3.1 GALERÍA MULTIMEDIA        │ │
│  │ ┌─────────────────────────┐   │ │
│  │ │ Carrusel de imágenes     │   │ │
│  │ │ - Departamento (interior)│   │ │
│  │ │ - Tipologías             │   │ │
│  │ │ - Áreas comunes          │   │ │
│  │ │ Navegación: puntos/flechas│   │ │
│  │ │ Lightbox al hacer clic   │   │ │
│  │ └─────────────────────────┘   │ │
│  │                                │ │
│  │ 3.2 CARD RESUMEN (Sticky)     │ │
│  │ ┌─────────────────────────┐   │ │
│  │ │ Número unidad: 2201-B    │   │ │
│  │ │ Nombre edificio           │   │ │
│  │ │ Dirección completa        │   │ │
│  │ │                          │   │ │
│  │ │ [Solicitar Visita] (CTA) │   │ │
│  │ │ [WhatsApp] (Secundario)  │   │ │
│  │ └─────────────────────────┘   │ │
│  └───────────────────────────────┘ │
├─────────────────────────────────────┤
│  4. INFORMACIÓN ECONÓMICA DESTACADA │
│  ┌─────────────────────────────┐   │
│  │ 💰 Valor Arriendo: $XXX,XXX  │   │
│  │    (Precio fijo primeros 3m) │   │
│  │                              │   │
│  │ 🏢 Gasto Común Fijo: $XX,XXX│   │
│  │                              │   │
│  │ 🔒 Garantía: $XXX,XXX        │   │
│  │    [Garantía en cuotas]      │   │
│  │    (Disponible en 3 cuotas)  │   │
│  │                              │   │
│  │ 📊 Reajuste:                 │   │
│  │    "Arriendo se reajusta     │   │
│  │     cada 3 meses según UF"   │   │
│  │                              │   │
│  │ [Selecciona otro departamento]│   │
│  └─────────────────────────────┘   │
├─────────────────────────────────────┤
│  5. TABS DE CONTENIDO               │
│  [Detalle] [Características]        │
│  [Requisitos] [Preguntas Frecuentes]│
│                                      │
│  ───────────────────────────────────│
│                                      │
│  6. TAB: DETALLE DEL DEPARTAMENTO   │
│  ┌─────────────────────────────┐   │
│  │ Código de unidad: 2201-B     │   │
│  │ Estado: Disponible           │   │
│  │                              │   │
│  │ Tipología:                   │   │
│  │ - Dormitorios: [X]           │   │
│  │ - Baños: [X]                 │   │
│  │                              │   │
│  │ Superficie interior: [X] m²  │   │
│  │ Piso: [X]                    │   │
│  │ Vista: [Norte/Sur/etc]       │   │
│  │ Amoblado: Sí / No            │   │
│  │ Política mascotas: [Info]    │   │
│  │                              │   │
│  │ Íconos visuales por atributo │   │
│  └─────────────────────────────┘   │
│                                      │
│  ───────────────────────────────────│
│                                      │
│  7. TAB: UBICACIÓN                   │
│  ┌─────────────────────────────┐   │
│  │ Dirección escrita            │   │
│  │                              │   │
│  │ 🚇 Metro cercano:            │   │
│  │ - Nombre estación            │   │
│  │ - Distancia: [X] metros     │   │
│  │ - Tiempo caminando: [X] min │   │
│  │                              │   │
│  │ (Mapa implícito/referencial) │   │
│  └─────────────────────────────┘   │
│                                      │
│  ───────────────────────────────────│
│                                      │
│  8. TAB: CARACTERÍSTICAS EDIFICIO   │
│  ┌─────────────────────────────┐   │
│  │ (Info fija para todas las    │   │
│  │  unidades del edificio)     │   │
│  │                              │   │
│  │ Listado de Amenities:        │   │
│  │ [Icono] Piscina             │   │
│  │ [Icono] Gimnasio            │   │
│  │ [Icono] Cowork              │   │
│  │ [Icono] Quinchos            │   │
│  │ [Icono] Sky bar             │   │
│  │ [Icono] Lavandería          │   │
│  │ ... (más amenities)         │   │
│  │                              │   │
│  │ Seguridad y accesos          │   │
│  │ Estacionamientos / Bodegas  │   │
│  │ Política pet friendly        │   │
│  └─────────────────────────────┘   │
│                                      │
│  ───────────────────────────────────│
│                                      │
│  9. TAB: REQUISITOS DE ARRIENDO     │
│  ┌─────────────────────────────┐   │
│  │ Documentación requerida:     │   │
│  │ - Dependiente               │   │
│  │ - Independiente             │   │
│  │ - Extranjeros               │   │
│  │                              │   │
│  │ Condiciones financieras:    │   │
│  │ - Renta mínima:             │   │
│  │   (Valor arriendo x 3)      │   │
│  │ - Aval                      │   │
│  │ - Puntaje                   │   │
│  │                              │   │
│  │ Duración contrato           │   │
│  │ Condiciones de salida       │   │
│  └─────────────────────────────┘   │
│                                      │
│  ───────────────────────────────────│
│                                      │
│  10. TAB: PREGUNTAS FRECUENTES       │
│  ┌─────────────────────────────┐   │
│  │ Preguntas desplegables       │   │
│  │ Aclaraciones operativas      │   │
│  │ Casos comunes de objeción   │   │
│  └─────────────────────────────┘   │
├─────────────────────────────────────┤
│  11. FOOTER                          │
│  - Links legales                     │
│  - Soporte                          │
│  - Logo footer                      │
└─────────────────────────────────────┘
```

> **💡 Filosofía de Assetplan aplicada:**
> - **Optimizada para conversión**, no para ficha técnica completa
> - Prioriza **precio + CTA** (Solicitar visita)
> - Omite detalles duros hasta avanzar en el flujo
> - Centraliza la decisión en "visitar" antes de comparar técnicamente

#### Componentes Utilizados

- `PropertyPage` - **RENOMBRAR** de `PropertyClient` - Página de detalle de unidad
- `PropertyBreadcrumb` - Breadcrumb de navegación (Home > Arriendo > Comuna > Edificio > Tipología)
- `PropertyHero` - Hero section con galería y card resumen sticky
  - `PropertyGallery` - Carrusel de imágenes (departamento, tipologías, áreas comunes)
  - `PropertySummaryCard` - Card resumen sticky (unidad, edificio, dirección, CTAs)
- `PropertyEconomicInfo` - Bloque de información económica destacada
- `PropertyTabs` - Sistema de tabs (Detalle, Características, Requisitos, FAQ)
  - `PropertyDetailTab` - Tab de detalle del departamento
  - `PropertyLocationTab` - Tab de ubicación y metro
  - `PropertyAmenitiesTab` - Tab de características del edificio
  - `PropertyRequirementsTab` - Tab de requisitos de arriendo
  - `PropertyFAQTab` - Tab de preguntas frecuentes
- `VisitScheduler` - Modal de agendamiento (al hacer clic en "Solicitar Visita")
- `StickyMobileCTA` - CTA sticky para mobile (Solicitar Visita + WhatsApp)

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

**Datos de la Unidad (desde API `/api/buildings/[slug]`):**
- ⚠️ El slug identifica la unidad específica
- Código de unidad (ej: "2201-B")
- Tipología (Estudio, 1D1B, 2D2B, etc.)
- Dormitorios y baños
- Superficie interior (m²)
- Piso
- Vista/Orientación
- Amoblado (Sí/No)
- Política de mascotas
- Estado (Disponible, etc.)

**Información Económica:**
- Valor arriendo
- Gasto común fijo
- Garantía
- Opción de garantía en cuotas
- Nota de reajuste (cada 3 meses según UF)

**Información del Edificio (contexto):**
- Nombre del edificio
- Dirección completa
- Comuna
- Metro cercano (nombre, distancia, tiempo caminando)
- Amenities del edificio (lista completa)
- Seguridad y accesos
- Política pet friendly del edificio

**Contenido Visual:**
- Imágenes del departamento (interior)
- Imágenes de tipología
- Imágenes de áreas comunes
- Más de 20 imágenes asociadas al proyecto

**Requisitos (calculados):**
- Renta mínima = Valor arriendo × 3
- Documentación requerida (dependiente, independiente, extranjeros)
- Condiciones financieras (aval, puntaje)
- Duración contrato
- Condiciones de salida

**Navegación:**
- Breadcrumb: Home > Arriendo Departamentos > [Comuna] > [Edificio] > [Tipología]
- Disponibilidad de calendario (para agendamiento)

#### Query Parameters Opcionales

- `unit` - ID de unidad específica (para scroll automático)
- `tipologia` - Filtrar por tipología
- `ver` - Ver todas las unidades (`ver=unidades`)

---

#### Ejemplo Real: Estudio Guillermo Mann (Basado en Assetplan)

**Identificación:**
- **Tipo:** Departamento – Estudio
- **Unidad:** 2201-B
- **Estado:** Disponible
- **Edificio:** Guillermo Mann
- **Dirección:** Av. Vicuña Mackenna 2362, Ñuñoa, Región Metropolitana, Chile

**Condiciones Económicas:**
- **Valor arriendo:** $292.000 CLP
  - *(Precio fijo por los primeros 3 meses)*
- **Gasto común fijo:** $66.000 CLP
- **Garantía:** $292.000 CLP
- **Garantía en cuotas:** Disponible en **3 cuotas**
- **Reajuste:** Arriendo se reajusta **cada 3 meses según UF**

**Navegación (Breadcrumb):**
- Home
- Arriendo departamentos
- Ñuñoa
- Guillermo Mann
- Estudio

**Contenido Visual:**
- Fotografías del departamento (interior)
- Fotografías de tipología estudio
- Fotografías de áreas comunes del edificio
- Carrusel con navegación manual (flechas y puntos)
- Más de 20 imágenes asociadas al proyecto

**Acciones Disponibles:**
- Botón: **Selecciona otro departamento**
- Botón principal: **Solicitar visita** (abre modal de agendamiento)
- Botón secundario: **WhatsApp**

---

#### Información que NO aparece explícita (como Assetplan)

> **⚠️ Importante para no asumir de más:**
> 
> La página está **optimizada para conversión**, no para ficha técnica completa.
> 
> **Información que NO se muestra explícitamente:**
> - ❌ Metros cuadrados exactos (solo si está en BD)
> - ❌ Piso del departamento (solo si está en BD)
> - ❌ Orientación detallada (solo si está en BD)
> - ❌ Año de construcción
> - ❌ Número total de pisos del edificio
> - ❌ Cantidad de unidades totales
> - ❌ Estacionamiento incluido o no (solo si está en BD)
> - ❌ Bodega incluida o no (solo si está en BD)
> - ❌ Amoblado detallado (solo si está en BD)
> - ❌ Política de mascotas detallada (solo si está en BD)
> - ❌ Paraderos o metros con tiempo caminando (solo si está en BD)
> 
> **Filosofía:**
> - Prioriza **precio + CTA** (Solicitar visita)
> - Omite detalles duros hasta avanzar en el flujo
> - Centraliza la decisión en "visitar" antes de comparar técnicamente

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
│  │  │ [Calendario 6 días]   │   │   │
│  │  │ Excluir domingos      │   │   │
│  │  │ Solo días laborales   │   │   │
│  │  │ Slots de 30 minutos   │   │   │
│  │  │ Horario: 9:00 - 20:00 │   │   │
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


- `VisitScheduler` - **RENOMBRAR** de `QuintoAndarVisitScheduler` - Scheduler de visitas
- `WeekView` - Vista de calendario semanal (6 días, excluye domingos)
- ⚠️ `AvailabilitySection` - **ELIMINAR** (no se usa)


#### Estados del Modal

1. **Estado Inicial:**
   - Calendario visible
   - Sin fecha seleccionada
   - Formulario deshabilitado

2. **Estado con Fecha Seleccionada:**
   - Fecha resaltada
   - Horarios disponibles visibles (9:00 - 20:00)
   - Formulario **deshabilitado** hasta seleccionar hora

3. **Estado con Fecha y Hora Seleccionadas:**
   - Fecha y hora resaltadas
   - Formulario de contacto **habilitado**
   - Usuario puede completar datos

4. **Estado de Envío:**
   - Loading spinner
   - Botón deshabilitado
   - Mensaje "Enviando..."

5. **Estado de Confirmación:**
   - Mensaje de éxito
   - Detalles de la visita
   - Opciones de seguimiento

5. **Estado de Error:**
   - Mensaje de error
   - Botón para reintentar
   - Opción para contactar directamente

#### Validaciones

- **Nombre:** Requerido, mínimo 2 caracteres
- **Email:** Opcional, si se proporciona debe tener formato válido
- **Teléfono:** Requerido, formato chileno (+56 9 XXXX XXXX)
  - Normalización automática: acepta múltiples formatos y los convierte a formato estándar
  - Ejemplos aceptados: +56912345678, 912345678, 9 1234 5678, etc.
- **Fecha:** Debe ser un slot disponible (6 días, excluye domingos)
- **Hora:** Debe ser un horario disponible (9:00 - 20:00, slots de 30 minutos)

**Notas de implementación:**
- Por ahora todos los slots están disponibles (no hay validación de disponibilidad real)
- La asignación a corredores será interna (no visible para el usuario)
- Horario disponible: 9:00 - 20:00 (solo días laborales, excluye domingos)
#### Puntos de Conversión

- **Conversión Final:** Usuario completa y confirma la visita
  - Métrica: Tasa de conversión final
  - Meta: > 10%

#### Datos Requeridos

- Disponibilidad de calendario (desde API `/api/availability`)
  - Retorna todos los slots disponibles (9:00-20:00, 6 días, excluye domingos)
- Slots disponibles para la propiedad (todos los horarios disponibles siempre)
- Información del agente asignado (asignación interna, no visible hasta confirmación) 

---


## 🎨 COMPONENTES Y ELEMENTOS UI

### Componentes Principales

#### 1. Hero (renombrar de HeroV2)
- **Ubicación:** `components/marketing/Hero.tsx` (renombrar de `HeroV2.tsx`)
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

#### 3. FeaturedCard
- **Ubicación:** `components/ui/FeaturedCard.tsx` (NUEVO)
- **Propósito:** Card de **UNIDAD** para grids (home, resultados)
- **Props:**
  - `unit: Unit` - Datos de la unidad específica
  - `building: Building` - Datos del edificio (para contexto)
  - `onClick?: () => void` - Callback de click
  - `variant?: 'default' | 'compact'` - Variante del card
- **Comportamiento:**
  - Al hacer clic → navega a `/property/[slug-unidad]`
  - ⚠️ NO hay página intermedia de edificio

#### 4. PropertyPage (renombrar de PropertyClient)
- **Ubicación:** `app/(catalog)/property/[slug]/PropertyPage.tsx`
- **Propósito:** Página de detalle de una unidad específica
- **Props:**
  - `unit: Unit` - Datos de la unidad
  - `building: Building` - Datos del edificio (contexto)
  - `relatedUnits: Unit[]` - Unidades relacionadas
- **Nota:** Esta página muestra UNA unidad, no un edificio completo

#### 5. VisitScheduler (renombrar de QuintoAndarVisitScheduler)
- **Ubicación:** `components/flow/VisitScheduler.tsx` (renombrar de `QuintoAndarVisitScheduler.tsx`)
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
- **Cards:** `FeaturedCard` (unidades), `BuildingCardV2`  (legacy, deprecar)

---

## 🎨 Elkis UI/UX System v2.0 (Tech-First Adaptation)

### 1. Principios de Fusión

Este sistema de diseño fusiona la filosofía visual de Airbnb con la identidad técnica de Elkis Realtor:

- **Forma:** Reemplazamos las curvas suaves de 12px de Airbnb por nuestro **`rounded-2xl` (20px)**. Esto da una apariencia mucho más amigable y "burbujeante".
- **Profundidad:** En lugar de sombras difusas planas, usaremos el efecto **`glass`** para elementos flotantes (Buscador Sticky, Modals).
- **Color:** El rojo de Airbnb se va. Entra el **Brand Violet** (`#8B6CFF`) para acciones principales y el **Brand Aqua** (`#00E6B3`) para destaques.

---

### 2. Paleta de Colores Aplicada (Semántica)

Aquí definimos cómo se usan las variables CSS en los componentes inmobiliarios específicos.

| Elemento UI | Variable / Clase | Lógica Visual |
|-------------|------------------|---------------|
| **Fondo General** | `bg-bg` | Limpieza total. Blanco en Light, Slate-900 en Dark. |
| **Primary CTA** | `bg-[#8B6CFF]` (Brand Violet) | Botones "Solicitar Visita", "Buscar". |
| **Secondary CTA** | `bg-[#00E6B3]` (Brand Aqua) | Botones de filtros activos o estados de "Éxito". |
| **Highlights** | `text-[#00E6B3]` (Brand Aqua) | Texto como "Nuevo", "Destacado". |
| **Precio** | `text-text` | El precio debe ser el color con mayor contraste (Slate-900 / Slate-50). |
| **Metadata** | `text-subtext` | M², Dormitorios, Direcciones. |
| **Bordes** | `border-border` | Divisiones sutiles. |
| **Tags/Badges** | `bg-surface` + `text-text` | Etiquetas de características. |

#### Sistema de Temas (Referencia Técnica)

El proyecto usa un sistema de temas basado en CSS variables que se adapta automáticamente a modo claro/oscuro.

**Tema Claro:**
- `--bg: #ffffff` | `--text: #0f172a` | `--subtext: #64748b` | `--border: #e2e8f0`

**Tema Oscuro:**
- `--bg: #0f172a` | `--text: #f8fafc` | `--subtext: #cbd5e1` | `--border: #334155`

---

### 3. Componentes Críticos (Rediseñados con tu UI)

#### A. The "Elkis Unit Card" (La Joya del MVP)

*El elemento más repetido. Debe verse increíble en Light y Dark mode.*

**Contenedor:**
- Forma: `rounded-2xl` (Estándar del proyecto).
- Fondo: `bg-card`.
- Borde: `border border-border` (Sutil) o `border-0` con `shadow-md`.
- Interacción: `hover:scale-[1.02] hover:shadow-lg transition-all duration-300`.

**Imagen:**
- Ratio: `aspect-[4/3]`.
- Borde: `rounded-t-2xl` (o `rounded-2xl` con padding interno de 8px si quieres estilo "burbuja").
- **Tag Flotante (Top Left):** `glass` effect. Texto: "Disponible".
- **Like Button (Top Right):** Círculo `bg-black/20` (backdrop blur) con corazón blanco.

**Contenido (Info):**
- **Título:** `text-lg font-semibold text-text` (Ej: Edificio Smart).
- **Subtítulo:** `text-sm text-subtext` (Ej: Ñuñoa • Estudio).
- **Precio:** `text-xl font-bold text-text` (Ej: $290.000).
- **Gasto Común:** `text-xs text-text-muted` (Ej: + $50k GC).

**Botón (Hover Desktop):**
- Aparece un botón `bg-[#8B6CFF] text-white rounded-xl` que dice "Ver unidad".

**Estructura del Componente:**
- Contenedor: `group relative bg-card border border-border rounded-2xl overflow-hidden`
- Imagen: `aspect-[4/3]` con tag glass flotante (top-left) y botón favoritos (top-right)
- Contenido: Título del edificio, ubicación con icono MapPin, precio con `tabular-nums`, gasto común
- Hover: Botón "Ver detalle" aparece en desktop con animación suave

---

#### B. Sticky Search Bar (Glass Version)

*El buscador estilo Airbnb, pero con efecto Glass.*

**Contenedor:** `glass-strong` (Fondo translúcido con blur fuerte).

**Forma:** `rounded-full` (Pill).

**Borde:** `border border-white/20` (En dark mode brilla sutilmente).

**Sombra:** `shadow-lg`.

**Interacción:**
- Al hacer scroll, el fondo de la página pasa por detrás del buscador borroso. Efecto muy premium.

**Botón Buscar:** Círculo perfecto `bg-[#8B6CFF]` (Violeta) con icono de lupa `text-white`.

---

#### C. Página de Propiedad (Layout Híbrido)

##### 1. Galería

- **Grid:** Mantiene el grid 1+4 de Airbnb.
- **Bordes:** Todas las imágenes externas tienen `rounded-2xl` en las esquinas que tocan el exterior del contenedor.
- **Separación:** `gap-2` o `gap-4`.

##### 2. Sticky Booking Card (La caja de conversión)

- **Estilo:** `bg-card` + `border border-border` + `shadow-xl`.
- **Forma:** `rounded-2xl`.
- **Header:**
  - Precio: `text-3xl font-bold text-text`.
  - Label: `text-subtext`.
- **Bloque Financiero:**
  - Contenedor interno: `bg-surface rounded-xl p-4`.
  - Iconos: `lucide-react` (ej: `Wallet`, `Shield`) en color `text-[#8B6CFF]` (Violeta).
- **CTA Principal:**
  - `w-full py-4 bg-[#8B6CFF] hover:bg-violet-600 text-white font-bold rounded-2xl shadow-lg shadow-violet-500/20 active:scale-95 transition-all`.
  - Texto: "Solicitar Visita".
- **CTA Secundario:**
  - Botón simple `text-accent-success` (Verde WhatsApp, única excepción o usar Aqua) con icono de WhatsApp.

---

### 4. Tipografía "Tech" (Inter)

Para que *Inter* se sienta premium (como Airbnb) y no genérica, usaremos estos ajustes en Tailwind:

- **Títulos (H1, H2):** `font-bold tracking-tight text-text`.
  - *Truco:* El `tracking-tight` (-0.025em) hace que los títulos grandes se vean más sólidos y profesionales.
- **Cuerpo (Body):** `text-base text-text-secondary leading-relaxed`.
- **Datos (Números):** `font-semibold tabular-nums`.
  - *Importante:* `tabular-nums` alinea los números en tablas o listas de precios para que ocupen el mismo ancho.

**Escala Tipográfica Aplicada:**

| Elemento | Clase Tailwind | Uso |
|----------|---------------|-----|
| **H1** | `text-4xl font-bold tracking-tight` | Títulos principales |
| **H2** | `text-3xl font-bold tracking-tight` | Títulos de sección |
| **H3** | `text-2xl font-semibold` | Subtítulos |
| **Body Large** | `text-lg leading-relaxed` | Texto destacado |
| **Body** | `text-base text-text-secondary leading-relaxed` | Texto principal |
| **Body Small** | `text-sm text-subtext` | Texto secundario |
| **Caption** | `text-xs text-text-muted` | Labels, hints |
| **Precio** | `text-2xl font-bold tabular-nums` | Números de precio |

---

### 5. Botones y CTAs

#### Botón Primario (Brand Violet)
- Background: `bg-[#8B6CFF]` con hover `hover:bg-[#7a5ce6]`
- Forma: `rounded-2xl`
- Tamaño mínimo: `min-h-[44px]` (accesibilidad)
- Estados: `active:scale-95`, focus ring visible
- Sombra: `shadow-lg shadow-violet-500/25`

#### Botón Secundario (Brand Aqua)
- Background: `bg-[#00E6B3]` con hover `hover:bg-[#00d4a3]`
- Forma: `rounded-2xl`
- Tamaño mínimo: `min-h-[44px]`
- Estados: `active:scale-95`, focus ring visible

---

### 6. Estados de UI (Aplicados)

#### Estados de Botones (Brand Violet)

| Estado | Clases Tailwind |
|--------|----------------|
| **Default** | `bg-[#8B6CFF] text-white rounded-2xl px-8 py-4 font-bold` |
| **Hover** | `hover:bg-[#7a5ce6] hover:shadow-lg transition-all` |
| **Active** | `active:scale-95 active:shadow-md` |
| **Focus** | `focus:outline-none focus:ring-2 focus:ring-[#8B6CFF] focus:ring-offset-2` |
| **Disabled** | `opacity-50 cursor-not-allowed` |
| **Loading** | `opacity-75 cursor-wait` |

#### Estados de Cards

| Estado | Clases Tailwind |
|--------|----------------|
| **Default** | `bg-card rounded-2xl border border-border shadow-md` |
| **Hover** | `hover:shadow-lg hover:scale-[1.02] transition-all duration-300` |
| **Selected** | `ring-2 ring-[#8B6CFF] ring-offset-2` |
| **Loading** | `animate-pulse bg-surface` |

---

### 7. Animaciones y Transiciones

#### Principios de Motion

- **Respetar `prefers-reduced-motion`:** Todas las animaciones deben respetar la preferencia del usuario
- **Duración estándar:** 200-300ms para transiciones
- **Easing:** `ease-in-out` para transiciones suaves

#### Transiciones Estándar

- **Transición suave:** `transition-all duration-300 ease-in-out`
- **Transición rápida:** `transition-all duration-200 ease-in-out`
- **Hover en cards:** `hover:scale-[1.02] hover:shadow-lg transition-all duration-300`

#### Framer Motion (Cuando se requiera)

- Usar `framer-motion` para animaciones complejas
- **Obligatorio:** Respetar `prefers-reduced-motion` (deshabilitar animaciones si está activo)
- Duración estándar: 300ms
- Easing: `easeOut` para entradas, `easeInOut` para transiciones

---

### 8. Iconografía

- **Biblioteca:** `lucide-react`
- **Estilo:** Outline (líneas)
- **Tamaños estándar:** `16px` (w-4 h-4), `20px` (w-5 h-5), `24px` (w-6 h-6), `32px` (w-8 h-8)

**Uso en Componentes:**

- Importar desde `lucide-react`
- Tamaños estándar: `w-4 h-4` (16px), `w-5 h-5` (20px - estándar), `w-6 h-6` (24px), `w-8 h-8` (32px)
- Color Brand Violet: `text-[#8B6CFF]`
- Iconos comunes: `Search`, `Home`, `Calendar`, `Phone`, `Heart`, `MapPin`

---

### 9. Accesibilidad (A11y)

#### Contraste de Colores

- **Texto normal:** Mínimo 4.5:1 (WCAG AA)
- **Texto grande (18px+):** Mínimo 3:1 (WCAG AA)
- **Elementos interactivos:** Mínimo 3:1 (WCAG AA)

#### Tamaños Táctiles

- **Mínimo:** `44px × 44px` (iOS/Android guidelines)
- **Recomendado:** `48px × 48px` para mejor usabilidad
- **Espaciado entre elementos:** Mínimo `8px` (16px recomendado)

#### Navegación por Teclado

- **Focus visible:** Todos los elementos interactivos deben tener ring de focus
- **Orden lógico:** Tab order debe seguir el flujo visual
- **Skip links:** Link "Saltar al contenido principal" en header

#### Screen Readers

- **Labels:** Todos los inputs deben tener `<label>` asociado
- **Roles:** Usar roles semánticos (`button`, `navigation`, `main`, etc.)
- **ARIA:** Usar `aria-label`, `aria-describedby`, `aria-live` cuando sea necesario
- **Alt text:** Todas las imágenes deben tener `alt` descriptivo

---

### 10. Dark Mode

- **Método:** `class`-based (Tailwind `darkMode: 'class'`)
- **Toggle:** Switch en header (persistido en `localStorage`)
- **Transición:** Suave (300ms) para cambios de tema

**Consideraciones:**
- Todos los colores deben tener variantes para dark mode
- Verificar contraste en ambos modos
- Glass effects ajustados para dark mode

---

### 11. Grid y Layout Responsive

#### Breakpoints (Responsive)

| Breakpoint | Tamaño | Uso |
|------------|--------|-----|
| **Mobile** | `< 640px` | Diseño móvil (default) |
| **Tablet** | `640px - 1024px` | Diseño tablet (`sm:`, `md:`) |
| **Desktop** | `> 1024px` | Diseño desktop (`lg:`, `xl:`, `2xl:`) |

#### Grid Responsive (Unit Cards)

- **Mobile:** `grid-cols-1` (1 columna)
- **Tablet:** `sm:grid-cols-2` (2 columnas)
- **Desktop:** `lg:grid-cols-3` (3 columnas)
- **Desktop XL:** `xl:grid-cols-4` (4 columnas)
- **Gap:** `gap-6` (24px entre cards)

---

### 12. Checklist de Implementación UI/UX v2.0

- [ ] Todos los botones primarios usan `bg-[#8B6CFF]` (Brand Violet)
- [ ] Todos los botones secundarios usan `bg-[#00E6B3]` (Brand Aqua)
- [ ] Todos los cards usan `rounded-2xl` (20px) como estándar
- [ ] Sticky Search Bar usa efecto `glass-strong`
- [ ] Unit Cards tienen hover `scale-[1.02]` y `shadow-lg`
- [ ] Precios usan `tabular-nums` para alineación
- [ ] Títulos usan `tracking-tight` para apariencia premium
- [ ] Iconos usan `lucide-react` con tamaños estándar
- [ ] Animaciones respetan `prefers-reduced-motion`
- [ ] Contraste de colores cumple WCAG AA (4.5:1 mínimo)
- [ ] Elementos interactivos tienen mínimo 44px × 44px
- [ ] Focus visible en todos los elementos interactivos
- [ ] Dark mode funciona correctamente en todos los componentes
- [ ] Glass effects aplicados en modals y sticky elements

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

**Analytics y Tracking:**
- ✅ Códigos de seguimiento de Meta Pixel (IDs a proporcionar)
- ✅ Google Analytics 4 (IDs a proporcionar)
- Tracking de eventos de conversión en cada punto del funnel
- Eventos personalizados para cada unidad (IDs únicos) 

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
- **Propósito:** Listar **UNIDADES** con paginación
- **⚠️ IMPORTANTE:** Retorna unidades, no edificios
- **Query Params:**
  - `page?: number` - Página (default: 1)
  - `limit?: number` - Límite por página (default: 12)
    - Botón/opción "Ver más resultados" para aumentar límite 
  - `comuna?: string` - Filtro por comuna
  - `precioMin?: number` - Precio mínimo
  - `precioMax?: number` - Precio máximo
  - `dormitorios?: number` - Cantidad de dormitorios
  - `q?: string` - Búsqueda por texto
  - ⚠️ **Eliminado:** `banos` - No se filtra por baños
- **Response:**
```json
{
  "units": Unit[],  // ⚠️ Cambiar de "buildings" a "units"
  "total": number,
  "hasMore": boolean,
  "page": number,
  "limit": number
}
```

#### 2. GET `/api/buildings/[slug]`
- **Propósito:** Obtener **UNIDAD** por slug
- **⚠️ IMPORTANTE:** El slug identifica la unidad, no el edificio
- **Response:**
```json
{
  "unit": Unit,
  "building": Building  // Contexto del edificio
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

### Modelo Unit (Unidad) - ⚠️ PRINCIPAL

```typescript
interface Unit {
  id: string;
  slug: string;  // ⚠️ Slug de la unidad (para /property/[slug])
  codigoUnidad: string;  // Ej: "2201-B"
  buildingId: string;  // ID del edificio al que pertenece
  tipologia: string; // "Estudio", "1D1B", "2D2B", etc.
  
  // Información básica
  dormitorios: number;
  banos: number;
  m2?: number;  // Superficie interior (opcional, puede no estar en BD)
  piso?: number;  // Opcional
  vista?: string;  // Opcional: "Norte", "Sur", etc.
  amoblado?: boolean;  // Opcional
  politicaMascotas?: string;  // Opcional
  
  // Información económica
  price: number;  // Arriendo mensual
  precioFijoMeses?: number;  // Ej: 3 (precio fijo primeros 3 meses)
  gastoComun: number;  // Gasto común mensual fijo
  garantia: number;  // Valor de garantía
  garantiaEnCuotas?: boolean;  // Disponible en cuotas
  cuotasGarantia?: number;  // Ej: 3 cuotas
  reajuste?: string;  // Ej: "cada 3 meses según UF"
  
  // Estado
  disponible: boolean;
  estado?: string;  // "Disponible", "Reservado", etc.
  
  // Servicios (opcional, puede no estar en BD)
  estacionamiento?: boolean;
  bodega?: boolean;
  
  // Contenido visual
  images: string[];  // Imágenes del departamento (interior)
  imagesTipologia?: string[];  // Imágenes de tipología
  imagesAreasComunes?: string[];  // Imágenes de áreas comunes
  
  // ... más campos
}
```

### Modelo Building (Edificio) - ⚠️ CONTEXTO

```typescript
interface Building {
  id: string;
  name: string;  // Ej: "Guillermo Mann"
  address: string;  // Dirección completa
  comuna: string;  // Ej: "Ñuñoa"
  region?: string;  // Ej: "Región Metropolitana"
  
  // Conectividad (opcional, se añade manualmente)
  conectividad?: {
    viaPrincipal?: boolean;
    transporteUrbano?: boolean;
    comerciosCercanos?: boolean;
    areasVerdes?: boolean;
  };
  
  // Metro cercano (opcional, puede no estar en BD)
  metroCercano?: {
    nombre: string;  // Nombre de la estación
    distancia?: number;  // Distancia en metros
    tiempoCaminando?: number;  // Tiempo caminando en minutos
  };
  
  // Características generales (opcional, se añade manualmente)
  tipoProyecto?: string;  // Ej: "Multifamily – Propiedades nuevas"
  administracion?: string;  // Ej: "Servicio Pro Assetplan"
  descripcion?: string;  // Descripción general del edificio
  
  // Contenido visual
  coverImage: string;
  gallery: string[];  // Imágenes generales del edificio
  
  // Amenidades del edificio (info fija para todas las unidades)
  amenities: string[];  // ["Piscina", "Gimnasio", "Cowork", "Quinchos", "Sky bar", "Lavandería", ...]
  
  // Seguridad y accesos (opcional, se añade manualmente)
  seguridadAccesos?: string[];  // ["Accesos controlados", "Conserjería", "Circuito cerrado de TV", ...]
  
  // Estacionamientos y bodegas (opcional, se añade manualmente)
  estacionamientos?: {
    subterraneo?: boolean;
    visitas?: boolean;
    disponibles?: boolean;
  };
  bodegas?: {
    disponibles?: boolean;
    descripcion?: string;
  };
  
  // Servicios del edificio (opcional, se añade manualmente)
  serviciosEdificio?: string[];  // ["Ascensores", "Calefacción central", ...]
  
  // Política de mascotas detallada (opcional, se añade manualmente)
  politicaMascotas?: {
    petFriendly: boolean;
    pesoMaximoKg?: number;  // Ej: 20
    permitidos?: string[];  // ["perros", "gatos", "peces"]
    prohibidos?: string[];  // ["animales exóticos", "razas peligrosas"]
    reglas?: string[];  // ["Uso obligatorio de correa en áreas comunes", ...]
    nota?: string;  // Ej: "Según unidad"
  };
  
  // Requisitos de arriendo (opcional, se añade manualmente)
  requisitosArriendo?: {
    documentacion: {
      dependiente?: string[];
      independiente?: string[];
      extranjeros?: string[];
    };
    condicionesFinancieras: {
      puntajeFinanciero?: number;  // Ej: 999
      rentaMinimaMultiplo?: string;  // Ej: "3 a 4 veces el valor del arriendo"
      avales: {
        permitidos: boolean;
        maxAvales?: number;  // Ej: 2
        algunosDepartamentosRequierenAvalObligatorio?: boolean;
      };
      garantiaEnCuotas?: boolean;
    };
  };
  
  // Información de contrato (opcional, se añade manualmente)
  infoContrato?: {
    duracionAnos: number;  // Ej: 1
    salidaAnticipada: {
      aplicaMulta: boolean;
      descripcion?: string;
    };
    despuesDelAno: {
      salidaLibre: boolean;
      avisoPrevio: boolean;
      descripcion?: string;
    };
  };
  
  // Política de ocupación (opcional, se añade manualmente)
  ocupacion?: {
    maxPersonasPorDormitorio?: number;  // Ej: 2
    menores3AnosNoCuentan?: boolean;
  };
  
  // ... más campos
}
```

> **⚠️ IMPORTANTE - Información Extendida de Edificios:**
> 
> La información detallada del edificio (seguridad, requisitos, política de mascotas, etc.) **NO viene en el CSV de ingesta**. Se añade **manualmente** para cada edificio.
> 
> **Migración SQL:** `config/supabase/migrations/20250116_add_building_extended_info.sql`
> 
> **Ejemplo completo:** Ver datos del edificio Guillermo Mann en la sección de ejemplo más abajo.

> **⚠️ IMPORTANTE:**
> - Las cards y resultados trabajan con **Unit** (unidades)
> - `Building` se usa solo para contexto (nombre, dirección, amenidades)
> - Cada unidad tiene su propio `slug` que identifica la página `/property/[slug]`

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
  // ⚠️ banos eliminado - No se filtra por baños
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

## 🔍 ESTRATEGIA SEO - BASADA EN PORTALINMOBILIARIO

> **Filosofía:** SEO 100% transaccional. Exact match. Sin ruido.

### 1️⃣ Intención Única que Domina Todo

**"Arriendo + tipo de inmueble + ubicación"**

Nada más.
No lifestyle.
No storytelling.
No copy aspiracional.

**Ejemplos de búsquedas objetivo:**
- "arriendo departamento providencia"
- "arriendo departamento las condes"
- "arriendo departamento ñuñoa"
- "arriendo departamento 1 dormitorio"
- "arriendo departamento económico"

---

### 2️⃣ Estructura de URLs SEO-Friendly

#### Nivel 1 — Página Madre

```
/arriendo
```

**Ataca:** "arriendos", "arriendo de propiedades", "arriendo departamentos", etc.

**H1/Título:** "Departamentos en Arriendo"
**Meta Description:** "Encuentra departamentos en arriendo sin comisión. Miles de opciones en Santiago y Región Metropolitana."

---

#### Nivel 2 — Tipo de Inmueble

```
/arriendo/departamento
/arriendo/casa
/arriendo/estudio
```

**Ejemplo:** `/arriendo/departamento`

**H1/Título:** "Departamentos en Arriendo"
**Meta Description:** "Departamentos en arriendo sin comisión. Filtra por ubicación, precio y características."

**Rankea por:**
- "departamentos en arriendo"
- "arriendo departamentos"
- "departamentos arriendo santiago"

---

#### Nivel 3 — Ubicación (La Joya SEO)

```
/arriendo/departamento/providencia-metropolitana
/arriendo/departamento/las-condes-metropolitana
/arriendo/departamento/nunoa-metropolitana
/arriendo/departamento/la-florida-metropolitana
```

**Ejemplo:** `/arriendo/departamento/providencia-metropolitana`

**H1/Título:** "Departamentos en Arriendo en Providencia"
**Meta Description:** "Departamentos en arriendo en Providencia sin comisión. Encuentra tu próximo hogar en el corazón de Santiago."

**Rankea por:**
- "arriendo departamento providencia"
- "departamentos en arriendo providencia"
- "arriendo providencia"

**💥 Aquí está el tráfico masivo - Exact match sin adornos.**

---

#### Nivel 4 — Filtros Específicos (Opcional - Dinámico)

```
/arriendo/departamento/providencia-metropolitana/1-dormitorio
/arriendo/departamento/providencia-metropolitana/hasta-800000
/arriendo/departamento/providencia-metropolitana/1-dormitorio-hasta-800000
```

**Ejemplo:** `/arriendo/departamento/providencia-metropolitana/1-dormitorio`

**H1/Título:** "Departamentos 1 Dormitorio en Arriendo en Providencia"
**Meta Description:** "Departamentos de 1 dormitorio en arriendo en Providencia. Sin comisión de corretaje."

**Rankea por:**
- "arriendo departamento 1 dormitorio providencia"
- "departamentos 1 dormitorio providencia"

---

#### Nivel 5 — Fichas Individuales (Unidades)

```
/arriendo/departamento/providencia-metropolitana/[slug-unidad]
```

**Ejemplo:** `/arriendo/departamento/providencia-metropolitana/departamento-2d2b-providencia-123`

**H1/Título:** "Departamento 2D2B en Arriendo en Providencia - $850.000"
**Meta Description:** "Departamento 2 dormitorios 2 baños en arriendo en Providencia. 65m², estacionamiento, bodega. Sin comisión."

**🔒 Razones del slug:**
- El precio puede variar
- La disponibilidad puede cambiar
- El slug debe ser estable y escalable
- Incluye información clave: tipología, ubicación, ID único

---

### 3️⃣ Reglas de Slugs

#### ✔️ Siempre en Singular

```
departamento (no "departamentos")
casa (no "casas")
estudio (no "estudios")
```

#### ✔️ Sin Stopwords

No usar: "en", "para", "los", "de", "del", "la", "el"

**❌ Incorrecto:**
```
/arriendo/departamentos/en/providencia
/arriendo/de/departamento/providencia
```

**✅ Correcto:**
```
/arriendo/departamento/providencia-metropolitana
```

#### ✔️ Normalización

- Sin tildes: `nunoa` (no "ñuñoa" en URL)
- Sin mayúsculas: todo en minúsculas
- Con guiones: `las-condes` (no "lascondes" o "las_condes")
- Sin caracteres especiales: solo letras, números y guiones

**Ejemplos correctos:**
```
/arriendo/departamento/nunoa-metropolitana
/arriendo/departamento/santiago-centro-metropolitana
/arriendo/departamento/la-florida-metropolitana
```

#### ✔️ Formato de Comunas

Siempre incluir región para especificidad:
- `providencia-metropolitana` (no solo "providencia")
- `las-condes-metropolitana`
- `nunoa-metropolitana`

Esto ayuda a:
- Diferenciar comunas con mismo nombre en otras regiones
- Mejorar exact match
- Aumentar especificidad SEO

---

### 4️⃣ Naming Visible (H1 + Title)

**Siempre la misma fórmula:**

**"[Tipo] en Arriendo [en Ubicación]"**

**Ejemplos:**
- "Departamentos en Arriendo"
- "Departamentos en Arriendo en Providencia"
- "Departamentos 1 Dormitorio en Arriendo en Providencia"

**❌ NO usar:**
- "Vive Providencia"
- "Tu próximo hogar"
- "Oportunidades únicas"
- "Encuentra tu hogar ideal"

**✅ SÍ usar:**
- "Departamentos en Arriendo en Providencia"
- "Arriendo Departamentos Las Condes"
- "Departamentos 1 Dormitorio en Arriendo"

**Google quiere literalidad. Se la damos.**

---

### 5️⃣ Estructura de Títulos (Title Tags)

#### Página Home
```
Departamentos en Arriendo Sin Comisión | [Nombre Marca]
```

#### Página de Tipo
```
Departamentos en Arriendo | [Nombre Marca]
```

#### Página de Ubicación
```
Departamentos en Arriendo en [Comuna] | [Nombre Marca]
```

#### Página de Filtros
```
Departamentos [Filtro] en Arriendo en [Comuna] | [Nombre Marca]
```

#### Ficha Individual
```
Departamento [Tipología] en Arriendo en [Comuna] - $[Precio] | [Nombre Marca]
```

---

### 6️⃣ Meta Descriptions

**Formato estándar:**
```
"[Tipo] en arriendo [en ubicación] sin comisión. [Beneficio clave]. [Call to action]."
```

**Ejemplos:**
- "Departamentos en arriendo sin comisión. Miles de opciones en Santiago. Agenda tu visita hoy."
- "Departamentos en arriendo en Providencia sin comisión. Sin comisión de corretaje. Encuentra tu hogar."
- "Departamento 2D2B en arriendo en Providencia. 65m², estacionamiento. Sin comisión. Agenda visita."

**Características:**
- Incluir palabra clave principal
- Mencionar beneficio único (sin comisión)
- Call to action claro
- Máximo 155 caracteres

---

### 7️⃣ Enlazado Interno (Clave Silenciosa)

Desde cada ficha de unidad:

**Links internos obligatorios:**
- "Más departamentos en arriendo en [Comuna]"
- "Departamentos en arriendo en [Región]"
- "Departamentos [Tipología] en arriendo en [Comuna]"

**Ejemplo desde ficha en Providencia:**
- Link a `/arriendo/departamento/providencia-metropolitana` - "Más departamentos en arriendo en Providencia"
- Link a `/arriendo/departamento` - "Ver todos los departamentos en arriendo"
- Link a `/arriendo/departamento/providencia-metropolitana/2-dormitorios` - "Departamentos 2 dormitorios en Providencia"

**Esto:**
- Transfiere autoridad entre páginas
- Refuerza páginas que sí rankean
- Optimiza crawl budget
- Mejora UX (navegación contextual)

---

### 8️⃣ Breadcrumbs SEO

**Estructura:**
```
Home > Arriendo > Departamento > Providencia > [Unidad]
```

**Implementación:**
- Usar elemento semántico `<nav aria-label="Breadcrumb">` con lista ordenada `<ol>`
- Cada item debe ser un link `<a>` excepto el último (página actual)
- Estructura: Home > Arriendo > Departamento > [Comuna] > [Unidad]

**JSON-LD para breadcrumbs:**
- Tipo: `BreadcrumbList` de Schema.org
- Contexto: `https://schema.org`
- Incluir `itemListElement` con todos los niveles de navegación

---

### 9️⃣ Sitemap.xml Estructura

**Prioridades:**
1. **Prioridad 1.0:** Home, `/arriendo`, `/arriendo/departamento`
2. **Prioridad 0.9:** Páginas de ubicación (`/arriendo/departamento/[comuna]`)
3. **Prioridad 0.8:** Páginas con filtros (`/arriendo/departamento/[comuna]/[filtro]`)
4. **Prioridad 0.7:** Fichas individuales (`/arriendo/departamento/[comuna]/[slug]`)

**Frecuencia de actualización:**
- Home: `daily`
- Páginas de tipo: `daily`
- Páginas de ubicación: `daily`
- Fichas individuales: `weekly` (o cuando cambie disponibilidad)

---

### 🔟 Regla de Oro (Mental Model)

> **Si alguien puede buscarlo en Google, debe existir como URL.**

**Ejemplos:**
- "arriendo estudio ñuñoa" → `/arriendo/estudio/nunoa-metropolitana`
- "arriendo depto 1 dormitorio providencia" → `/arriendo/departamento/providencia-metropolitana/1-dormitorio`
- "departamentos baratos en arriendo" → `/arriendo/departamento/hasta-[precio]`

**Si no existe la URL, crearla (dinámicamente si es necesario).**

---

### 1️⃣1️⃣ Implementación en Next.js

#### Estructura de Carpetas

```
app/
├── arriendo/
│   ├── page.tsx                    # /arriendo
│   ├── departamento/
│   │   ├── page.tsx                # /arriendo/departamento
│   │   └── [comuna]/
│   │       ├── page.tsx            # /arriendo/departamento/[comuna]
│   │       ├── [filtro]/
│   │       │   └── page.tsx        # /arriendo/departamento/[comuna]/[filtro]
│   │       └── [slug]/
│   │           └── page.tsx        # /arriendo/departamento/[comuna]/[slug]
```

#### Generación de Metadata Dinámica

- Usar función `generateMetadata` de Next.js 14
- Formato título: `"[Tipo] en Arriendo en [Comuna] | [Marca]"`
- Formato descripción: `"[Tipo] en arriendo en [Comuna] sin comisión. [CTA]."`
- Incluir `canonical` URL en `alternates`
- Normalizar nombres de comunas (slug → formato legible)

#### Generación de Sitemap Dinámico

- Usar `app/sitemap.ts` de Next.js 14
- Prioridades: Home/Arriendo (1.0), Comunas (0.9), Fichas (0.7)
- Frecuencia: Páginas principales `daily`, Fichas `weekly`
- Generar dinámicamente desde base de datos (comunas y unidades)

---

### 1️⃣2️⃣ Qué SÍ Copiar y Qué NO

#### ✅ Copiar de PortalInmobiliario:

- Exact match en URLs
- Jerarquía clara de páginas
- URLs predecibles
- Páginas agregadoras fuertes (por ubicación, tipo)
- Enlazado interno estratégico
- Breadcrumbs claros

#### ❌ NO Copiar:

- Contenido pobre sin valor (mejorar aquí con contenido útil)
- UX anticuada (modernizar)
- Filtros que no indexan bien (optimizar)
- Exceso de páginas sin contenido (solo crear si hay valor)

---

### 1️⃣3️⃣ Checklist de Implementación SEO

- [ ] Estructura de URLs implementada (`/arriendo/departamento/[comuna]`)
- [ ] Metadata dinámica por página
- [ ] H1 con fórmula exacta: "[Tipo] en Arriendo [en Ubicación]"
- [ ] Meta descriptions optimizadas (máx 155 caracteres)
- [ ] Slugs normalizados (sin tildes, guiones, minúsculas)
- [ ] Breadcrumbs implementados (HTML + JSON-LD)
- [ ] Sitemap.xml dinámico generado
- [ ] Enlazado interno estratégico
- [ ] JSON-LD structured data
- [ ] Robots.txt configurado
- [ ] Canonical URLs en todas las páginas
- [ ] Open Graph tags para redes sociales

---

**📅 Última actualización:** Enero 2025  
**🎯 Objetivo:** SEO transaccional, exact match, sin ruido

---

## 📝 SECCIÓN PARA EDITAR Y REDEFINIR

> **🔴 EDITA ESTA SECCIÓN SEGÚN TUS NECESIDADES**

### ⚠️ DECISIONES IMPORTANTES YA DEFINIDAS

1. **NO trabajamos con páginas/cards de edificios por ahora**
   - Esto se agregará después
   - Por ahora solo unidades individuales

2. **Cada card representa una UNIDAD específica**
   - No un edificio completo
   - Al hacer clic → va directo a `/property/[slug-unidad]`

3. **No hay página intermedia de edificio**
   - Flujo directo: Card → Página de Unidad
   - La información del edificio se muestra como contexto en la página de unidad

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

## 🛡️ MANEJO DE ERRORES Y EDGE CASES

### Estados de Error por Página

#### Home (`/`)
- **Sin propiedades destacadas:**
  - Mostrar mensaje: "Próximamente nuevas propiedades"
  - Mostrar solo formulario de búsqueda
  - No mostrar grids vacíos

#### Resultados (`/buscar`)
- **Sin resultados:**
  - Mensaje claro: "No encontramos propiedades con esos criterios"
  - Sugerencias: "Intenta ajustar los filtros" o "Ver todas las propiedades"
  - Botón para limpiar filtros
  - Mostrar búsquedas relacionadas (opcional)

- **Error de API:**
  - Mensaje: "Error al cargar resultados. Por favor intenta nuevamente."
  - Botón "Reintentar"
  - Log del error (sin exponer detalles técnicos al usuario)

#### Página de Propiedad (`/property/[slug]`)
- **404 - Unidad no encontrada:**
  - Página 404 personalizada
  - Mensaje: "Este departamento ya no está disponible"
  - Botón: "Ver otros departamentos" → `/buscar`
  - Botón: "Volver al inicio" → `/`

- **Error al cargar datos:**
  - Mensaje: "Error al cargar la información del departamento"
  - Botón "Reintentar"
  - Opción de contactar por WhatsApp

- **Unidad no disponible:**
  - Mostrar badge "No disponible"
  - Deshabilitar botón "Solicitar Visita"
  - Mostrar mensaje: "Este departamento ya fue arrendado"
  - Mostrar unidades similares disponibles

#### Modal de Agendamiento
- **Slot ya no disponible:**
  - Mensaje: "Este horario ya no está disponible"
  - Actualizar calendario automáticamente
  - Sugerir próximos horarios disponibles

- **Error al enviar:**
  - Mensaje: "Error al agendar la visita. Por favor intenta nuevamente."
  - Botón "Reintentar"
  - Opción: "Contactar directamente por WhatsApp"

- **Validación de formulario:**
  - Mostrar errores inline
  - Resaltar campos con error
  - Mensajes claros y específicos

---

## ✅ VALIDACIONES COMPLETAS

### Formulario de Búsqueda

- **Búsqueda por texto:**
  - Mínimo 2 caracteres para buscar
  - Máximo 100 caracteres
  - Sanitizar input (prevenir XSS)

- **Rango de precio:**
  - Precio mínimo >= 0
  - Precio máximo >= precio mínimo
  - Formato: números enteros (sin decimales)
  - Validar que no sean negativos

- **Dormitorios:**
  - Valores permitidos: "Estudio", 1, 2, 3, 4+
  - Solo un valor seleccionado

### Formulario de Agendamiento

- **Nombre:**
  - Requerido
  - Mínimo 2 caracteres
  - Máximo 100 caracteres
  - Solo letras, espacios y caracteres especiales básicos (ñ, acentos)

- **Email:**
  - Opcional
  - Si se proporciona, debe ser formato válido
  - Validar formato con regex estándar

- **Teléfono:**
  - Requerido
  - Normalización automática:
    - Acepta: +56912345678, 912345678, 9 1234 5678, (9) 1234-5678
    - Convierte a: +56 9 1234 5678
  - Validar que sea número chileno válido (9 dígitos después del código país)

- **Fecha y Hora:**
  - Fecha debe ser un slot disponible
  - Hora debe estar en rango 9:00 - 20:00
  - Solo días laborales (excluye domingos)
  - No permitir fechas pasadas

---

## 🔗 INTEGRACIONES

### WhatsApp Business API

**Configuración:**
- Número de WhatsApp Business
- API Key (si se usa API oficial)
- O enlace directo: `https://wa.me/[número]?text=[mensaje]`

**Uso:**
- Botón "WhatsApp" en página de propiedad
- Envío de confirmación de visita por WhatsApp
- Mensaje pre-formateado con detalles de la visita

**Mensaje de confirmación ejemplo:**
```
¡Hola! Tu visita ha sido confirmada:

📅 Fecha: [Fecha]
🕐 Hora: [Hora]
🏢 Departamento: [Nombre edificio] - [Unidad]
📍 Dirección: [Dirección completa]

Nos vemos pronto!
```

### Google Analytics 4

**Configuración:**
- Measurement ID (proporcionar después)
- Eventos personalizados:
  - `property_view` - Visualización de propiedad
  - `visit_scheduled` - Visita agendada
  - `search_performed` - Búsqueda realizada
  - `filter_applied` - Filtro aplicado

**Tracking:**
- Página vista en cada ruta
- Eventos de conversión en cada punto del funnel
- IDs únicos por unidad para tracking individual

### Meta Pixel

**Configuración:**
- Pixel ID (proporcionar después)
- Eventos personalizados:
  - `ViewContent` - Visualización de propiedad
  - `Lead` - Visita agendada
  - `Search` - Búsqueda realizada

**Tracking:**
- Conversiones para optimización de anuncios
- Remarketing de usuarios que vieron propiedades

---

## 📱 CONSIDERACIONES MÓVIL

### Breakpoints Específicos

- **Mobile:** < 640px
  - Cards en columna única
  - Sticky CTA siempre visible
  - Formularios en pantalla completa o modal
  - Galería con swipe

- **Tablet:** 640px - 1024px
  - Cards en grid de 2 columnas
  - Sidebar colapsable
  - Formularios en modal

- **Desktop:** > 1024px
  - Cards en grid de 3-4 columnas
  - Sidebar fijo
  - Formularios inline

### Comportamiento Móvil Específico

- **Galería de imágenes:**
  - Swipe horizontal
  - Pinch to zoom
  - Lightbox fullscreen

- **Formulario de búsqueda:**
  - Input de teléfono abre teclado numérico
  - Input de fecha abre date picker nativo
  - Autocompletado de comunas

- **Modal de agendamiento:**
  - Fullscreen en móvil
  - Botón de cerrar siempre visible
  - Scroll independiente del contenido

---

## 🖼️ MANEJO DE IMÁGENES

### Optimización

- **Formato:** WebP con fallback a JPG
- **Tamaños responsive:**
  - Mobile: 400px ancho
  - Tablet: 800px ancho
  - Desktop: 1200px ancho
- **Lazy loading:** Todas las imágenes excepto hero
- **Placeholder:** Blur placeholder mientras carga

### Estructura de Imágenes

- **Imágenes de unidad:**
  - Prioridad: Imagen principal (cover)
  - Galería: Resto de imágenes
  - Thumbnails: Versiones pequeñas para navegación

- **Imágenes de edificio:**
  - Áreas comunes
  - Exteriores
  - Amenidades

### Fallbacks

- **Sin imagen disponible:**
  - Placeholder genérico con icono
  - Color de fondo según tipo de propiedad
  - Texto: "Imagen no disponible"

---

## 🧪 TESTING Y CALIDAD

### Tests Requeridos

**Unit Tests:**
- Validaciones de formularios
- Normalización de teléfono
- Formateo de precios
- Generación de slugs

**Integration Tests:**
- Flujo completo de búsqueda
- Flujo de agendamiento
- APIs principales

**E2E Tests:**
- Flujo Home → Resultados → Propiedad → Agendamiento
- Validación de formularios
- Manejo de errores

### Criterios de Aceptación

- ✅ Todas las validaciones funcionan correctamente
- ✅ Errores se manejan gracefully
- ✅ Loading states son claros
- ✅ Responsive funciona en todos los breakpoints
- ✅ Accesibilidad básica (navegación por teclado, ARIA)
- ✅ Performance: First Contentful Paint < 1.5s
- ✅ SEO: Metadata correcta en todas las páginas

---

## 🔐 SEGURIDAD

### Validaciones Server-Side

- **Todas las validaciones deben duplicarse en el servidor**
- **Sanitización de inputs:** Prevenir XSS, SQL injection
- **Rate limiting:** Ya implementado en APIs
- **CORS:** Configurado correctamente

### Datos Sensibles

- **No exponer:**
  - IDs internos de base de datos
  - Información de corredores (hasta confirmación)
  - Datos de otros usuarios

- **Logs:**
  - Sin PII (Personally Identifiable Information)
  - Solo IDs de sesión o visitas (hasheados)

---

## 📊 MÉTRICAS Y MONITOREO

### Métricas Clave a Monitorear

1. **Performance:**
   - Time to First Byte (TTFB)
   - First Contentful Paint (FCP)
   - Largest Contentful Paint (LCP)
   - Cumulative Layout Shift (CLS)

2. **Conversión:**
   - Tasa de búsqueda (Home → Resultados)
   - CTR de resultados (Resultados → Propiedad)
   - Tasa de agendamiento (Propiedad → Modal)
   - Tasa de completitud (Modal → Confirmación)

3. **Errores:**
   - Tasa de errores 404
   - Tasa de errores 500
   - Errores de validación
   - Errores de API

### Herramientas

- **Error Tracking:** Sentry o similar
- **Analytics:** Google Analytics 4 + Meta Pixel
- **Performance:** Vercel Analytics o similar
- **Uptime:** Monitoreo de APIs

---

## ✅ CHECKLIST DE REVISIÓN

Antes de devolver este documento, verifica que hayas:

- [ ] Revisado todas las páginas y su estructura
- [ ] Editado la sección "Cambios Deseados"
- [ ] Definido prioridades claras
- [ ] Especificado cualquier cambio en el flujo de usuario
- [ ] Indicado qué componentes necesitas modificar/agregar
- [ ] Especificado cambios en APIs o datos
- [ ] Revisado manejo de errores y edge cases
- [ ] Verificado que todas las validaciones estén documentadas
- [ ] Confirmado integraciones necesarias (WhatsApp, Analytics)

---

**📅 Última actualización:** Enero 2025  
**👤 Estado:** ✅ **APROBADA** - Lista para implementación  
**🎯 Próximo paso:** Extender Sprint 1 y comenzar implementación según `docs/PLAN_SPRINTS_MVP.md`

> **⚠️ IMPORTANTE:** Antes de modificar cualquier componente o página, revisar `docs/CONTEXTO_RECIENTE.md` para entender cambios recientes y evitar romper código existente.

---

## 📊 ESTADO DE IMPLEMENTACIÓN

> **⚠️ IMPORTANTE:** Esta sección se actualiza automáticamente al completar tareas del `PLAN_SPRINTS_MVP.md`.  
> Al completar una microtarea, actualiza el estado correspondiente aquí.

### Páginas

| Página | Ruta | Estado | Notas |
|--------|------|--------|-------|
| **Home** | `/` | ⚠️ Parcial | Necesita: StickySearchBar, Grids destacadas, Beneficios |
| **Resultados** | `/buscar` | ⚠️ Parcial | Necesita: Filtros actualizados, UnitCard, Estados |
| **Property/Unidad** | `/property/[slug]` | ⚠️ Parcial | Necesita: Rediseño Assetplan completo |
| **Modal Agendamiento** | Integrado | ⚠️ Parcial | Necesita: Calendario 6 días, Validaciones |

### Componentes Críticos

| Componente | Ubicación | Estado | Notas |
|------------|-----------|--------|-------|
| **UnitCard** | `components/ui/UnitCard.tsx` | ❌ No implementado | Sprint 1.1 |
| **StickySearchBar** | `components/marketing/StickySearchBar.tsx` | ❌ No implementado | Sprint 1.2 |
| **PropertyPage** | `app/(catalog)/property/[slug]/PropertyPage.tsx` | ⚠️ Parcial | Necesita rediseño Sprint 4 |
| **VisitScheduler** | `components/flow/VisitScheduler.tsx` | ⚠️ Parcial | Necesita ajustes Sprint 5 |
| **PropertyHero** | `components/property/PropertyHero.tsx` | ❌ No implementado | Sprint 4.2 |
| **PropertyTabs** | `components/property/PropertyTabs.tsx` | ❌ No implementado | Sprint 4.4 |
| **StickyBookingCard** | `components/property/StickyBookingCard.tsx` | ❌ No implementado | Sprint 4.3 |

### APIs y Endpoints

| Endpoint | Estado | Notas |
|----------|--------|-------|
| `GET /api/buildings` | ⚠️ Parcial | Necesita retornar `units: Unit[]` (Sprint 6.1) |
| `GET /api/buildings/[slug]` | ⚠️ Parcial | Necesita retornar `Unit` (Sprint 6.2) |
| `POST /api/visits` | ✅ Implementado | Verificar validaciones según especificación |

### Modelos de Datos

| Modelo | Estado | Notas |
|--------|--------|-------|
| `Unit` | ⚠️ Parcial | Necesita campos extendidos (Sprint 6.3) |
| `Building` | ⚠️ Parcial | Necesita campos extendidos (Sprint 6.3) |
| `SearchFilters` | ⚠️ Parcial | Necesita remover `banos` (Sprint 6.3) |

### Design System v2.0

| Elemento | Estado | Notas |
|----------|--------|-------|
| **Paleta de colores** | ✅ Implementado | Brand Violet, Brand Aqua definidos |
| **Tipografía Premium** | ⚠️ Parcial | Necesita `tracking-tight`, `tabular-nums` (Sprint 1.3) |
| **Efecto Glass** | ✅ Implementado | Clases `glass` y `glass-strong` disponibles |
| **Componentes base** | ⚠️ Parcial | Necesita actualización según v2.0 |

### Integraciones

| Integración | Estado | Notas |
|-------------|--------|-------|
| **WhatsApp Business API** | ❌ No implementado | Sprint 8.1 |
| **Google Analytics 4** | ❌ No implementado | Sprint 8.2 |
| **Meta Pixel** | ❌ No implementado | Sprint 8.2 |

### SEO

| Elemento | Estado | Notas |
|----------|--------|-------|
| **Estructura de URLs** | ⚠️ Parcial | Necesita implementar estructura SEO (Sprint 7.1) |
| **Metadata dinámica** | ⚠️ Parcial | Necesita OG tags, JSON-LD (Sprint 7.2) |
| **Sitemap.xml** | ❌ No implementado | Sprint 7.3 |

---

## 📋 RESUMEN EJECUTIVO

Este documento contiene:

✅ **Historia del cliente completa** - Persona, necesidades, dolores, motivaciones  
✅ **Flujos de usuario detallados** - Principal y alternativos  
✅ **Estructura de todas las páginas** - Home, Resultados, Propiedad (basada en Assetplan)  
✅ **Componentes y UI** - Lista completa de componentes necesarios  
✅ **APIs y Endpoints** - Documentación completa de endpoints públicos  
✅ **Modelos de datos** - Unit, Building, SearchFilters (con info extendida)  
✅ **Estrategia SEO completa** - Basada en PortalInmobiliario  
✅ **Manejo de errores** - Edge cases y estados de error  
✅ **Validaciones** - Formularios y datos  
✅ **Integraciones** - WhatsApp, Analytics  
✅ **Consideraciones técnicas** - Mobile, imágenes, seguridad, testing  
✅ **Design System v2.0** - Elkis UI/UX System completo  
✅ **Estado de Implementación** - Tracking en tiempo real

**Estado:** ✅ **COMPLETO Y LISTO PARA IMPLEMENTACIÓN**  
**Progreso:** Ver sección [Estado de Implementación](#-estado-de-implementación)
