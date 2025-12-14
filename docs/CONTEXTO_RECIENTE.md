# 📝 LOG DE CONTEXTO - CAMBIOS RECIENTES

> **⚠️ IMPORTANTE:** Este archivo debe ser revisado ANTES de iniciar cada nueva tarea o microtarea.  
> Ayuda a mantener contexto y evitar romper código existente.

**Última actualización:** Enero 2025  
**Propósito:** Registrar cambios recientes, archivos modificados y contexto relevante para nuevas sesiones

---

## 🎯 INSTRUCCIONES DE USO

### Antes de Iniciar Cualquier Tarea:

1. **Revisar este archivo completo** - Entender qué se hizo recientemente
2. **Revisar archivos modificados** - Ver qué código cambió
3. **Revisar notas importantes** - Verificar advertencias o consideraciones
4. **Revisar estado actual** - Entender dónde estamos en el proyecto

### Al Completar una Tarea:

1. **Ejecutar checklist de validación** - Ver `PLAN_SPRINTS_MVP.md` sección "Checklist de Validación"
2. **Ejecutar smoke test rápido** - Verificar que no se rompió nada
3. **Hacer commit** - Con mensaje descriptivo (Conventional Commits)
4. **⚠️ OBLIGATORIO: Actualizar ambos documentos en paralelo:**
   - **`docs/CONTEXTO_RECIENTE.md`** - Agregar entrada al log con:
     - Descripción del cambio
     - Archivos creados/modificados/eliminados
     - Notas importantes
     - Contexto relevante
     - Actualizar estado actual del proyecto
   - **`docs/PLAN_SPRINTS_MVP.md`** - Marcar microtarea como completada:
     - Marcar todas las sub-tareas con `[x]`
     - Marcar criterios de aceptación con `[x]`
     - Actualizar checklist de progreso
     - Actualizar contador de progreso general
5. **Actualizar otros documentos si aplica** - `ESPECIFICACION_COMPLETA_MVP.md` (estado de implementación)

---

## 📊 ESTADO ACTUAL DEL PROYECTO

**Última sesión:** Enero 2025  
**Sprint activo:** Sprint 6 - APIs Y DATOS  
**Última tarea completada:** 6.1 - API `/api/buildings` ✅ COMPLETADA  
**Sprint 4 completado:** ✅ Property Page completamente implementada (5/5 microtareas - 100%)  
**Sprint 5 completado:** ✅ Modal de Agendamiento completamente implementado (3/3 microtareas - 100%)  
**Sprint 6 en progreso:** 
- ✅ Microtarea 6.3 completada (100%) - Modelos de Datos
- ✅ Microtarea 6.1 completada (100%) - API `/api/buildings`
- Próxima: 6.2 (API `/api/buildings/[slug]`)

**Estado general:**
- ✅ Especificación completa del MVP **APROBADA**
- ✅ Plan de sprints creado y extendido
- ✅ Sistema de tracking configurado
- ✅ Checklist de validación y rollback configurado
- ✅ **Sprint 1 COMPLETADO** - Todas las microtareas finalizadas
- ✅ **Sprint 2 COMPLETADO** - Todas las tareas finalizadas
- ✅ **Sprint 3 COMPLETADO** - Todas las microtareas finalizadas
- ✅ **Microtarea 3.1 COMPLETADA** - Página `/buscar` con Filtros y Grid de Unidades
- ✅ **Microtarea 3.2 COMPLETADA** - Estados de Resultados y Paginación
- ✅ **Sprint 3 COMPLETADO** - 2/2 microtareas completadas (100%)

---

## 📋 LOG DE CAMBIOS RECIENTES

### 2025-01-XX - Microtarea 6.1: API `/api/buildings` - Retornar Unidades ✅ COMPLETADA

**Descripción:** Implementación completa del endpoint GET `/api/buildings` para retornar unidades (no edificios) con filtros y paginación según especificación MVP.

**Archivos modificados:**
- `app/api/buildings/route.ts`
  - Endpoint ya estaba implementado correctamente
  - Agregado tipo `BuildingsResponse` para mejor tipado
  - Validación con Zod usando `SearchFiltersSchema`
  - Rate limiting (20 req/min por IP)
  - Logging sin PII

**Archivos creados:**
- `tests/api/buildings.test.ts` - Suite completa de tests (22 tests, todos pasando)
  - Tests de respuesta del endpoint
  - Tests de filtros (comuna, precioMin/Max, dormitorios, q)
  - Tests de paginación
  - Tests de validación con Zod
  - Tests de rate limiting
  - Tests de estructura de respuesta

**Archivos verificados:**
- `lib/supabase-data-processor.ts`
  - Función `getUnits()` ya implementada correctamente
  - Genera slugs para unidades: `[edificio-slug]-[codigo-unidad]-[id-corto]`
  - Filtros implementados: precioMin/Max, dormitorios (en BD), comuna y q (en memoria)
  - Paginación implementada correctamente
  - Mapeo a formato `Unit` correcto

**Cambios técnicos:**
- **Tipo BuildingsResponse:** Creado en `schemas/models.ts` y exportado en `types/index.ts`
- **Filtros:** 
  - ✅ `comuna`, `precioMin`, `precioMax`, `dormitorios`, `q` funcionan correctamente
  - ✅ `banos` NO está disponible (se ignora si se envía)
- **Paginación:** Implementada con `page` y `limit`, calcula `hasMore` correctamente
- **Validación:** Query params validados con `SearchFiltersSchema`
- **Rate limiting:** 20 req/min por IP con headers apropiados

**Resultados:**
- ✅ Todos los tests pasando (22/22)
- ✅ Endpoint retorna formato correcto según especificación
- ✅ Filtros funcionan correctamente
- ✅ Paginación implementada
- ✅ Rate limiting activo
- ✅ Documentación JSDoc completa

**Notas importantes:**
- El endpoint ya estaba implementado correctamente
- Se agregaron tests completos y tipo `BuildingsResponse` para mejor tipado
- Filtros de comuna y q se hacen en memoria debido a relaciones anidadas en Supabase
- Listo para continuar con Microtarea 6.2 (API `/api/buildings/[slug]`)

---

### 2025-01-XX - Microtarea 6.3: Modelos de Datos ✅ COMPLETADA

**Descripción:** Verificación y validación completa de los schemas de datos según especificación MVP. Todos los schemas ya estaban implementados correctamente, se agregaron tests unitarios completos.

**Archivos creados:**
- `tests/unit/schemas/models.test.ts` - Suite completa de tests para validar schemas (26 tests, todos pasando)

**Archivos verificados (sin cambios necesarios):**
- `schemas/models.ts` - Schemas ya cumplían con todos los requisitos:
  - ✅ `UnitSchema` con todos los campos requeridos (`slug`, `codigoUnidad`, `buildingId`, `dormitorios`, `banos`, `garantia`)
  - ✅ `UnitSchema` con todos los campos opcionales según especificación
  - ✅ `BuildingSchema` con campos extendidos opcionales completos
  - ✅ `SearchFiltersSchema` sin campo `banos` (según especificación)
- `types/index.ts` - Ya re-exporta todos los tipos correctamente

**Cambios técnicos:**
- **Tests unitarios completos:** 26 tests cubriendo:
  - Validación de campos requeridos en `UnitSchema`
  - Validación de campos opcionales en `UnitSchema`
  - Validación de `BuildingSchema` con campos extendidos
  - Validación de `SearchFiltersSchema` sin `banos`
  - Casos edge (valores negativos, strings vacíos, etc.)
  - Validaciones de enum y rangos

**Resultados:**
- ✅ Todos los tests pasando (26/26)
- ✅ Schemas verificados y cumpliendo especificación MVP
- ✅ TypeScript: Schemas sin errores ni uso de `any` explícito
- ✅ Compatibilidad backward mantenida

**Notas importantes:**
- Los schemas ya estaban implementados correctamente desde antes
- Los tests aseguran que los schemas cumplen con la especificación
- No se requirieron cambios en los schemas, solo validación y tests
- Listo para continuar con Microtarea 6.1 (API `/api/buildings`)

---

### 2025-01-XX - Microtarea 5.3: Estados y Confirmación ✅ COMPLETADA

**Descripción:** Mejora de los estados de carga, éxito y error del modal de agendamiento según especificación, con integración de WhatsApp y opciones de recuperación.

**Archivos modificados:**
- `components/flow/QuintoAndarVisitScheduler.tsx`
  - Agregado estado `visitResponse` para guardar respuesta del servidor (agente, teléfono, etc.)
  - **Estado de confirmación mejorado:**
    - Muestra fecha formateada en español
    - Muestra hora seleccionada
    - Muestra nombre de propiedad
    - Muestra nombre del agente asignado (del response)
    - Muestra teléfono del agente (del response)
    - Botón "Agregar al Calendario" (ya existía)
    - Botón "Contactar por WhatsApp" (nuevo) - solo se muestra si hay whatsappNumber
  - **Estado de error mejorado:**
    - Mensaje de error más claro con título y descripción
    - Botón "Reintentar" que vuelve al paso de contacto
    - Botón "Contactar directamente" que abre WhatsApp con mensaje prellenado
  - Agregadas funciones:
    - `handleWhatsAppContact()` - Abre WhatsApp con el agente asignado
    - `handleRetry()` - Vuelve al paso de contacto para reintentar

**Cambios técnicos:**
- **Estado de carga:** Ya estaba implementado (isLoading con Loader2 y "Procesando...")
- **Estado de éxito:** Mejorado para mostrar información completa del agente
- **Estado de error:** Mejorado con opciones de recuperación
- **WhatsApp:** Integrado en confirmación y error

**Notas importantes:**
- El estado de confirmación muestra información del agente solo si viene en el response
- El botón de WhatsApp solo se muestra si el agente tiene whatsappNumber
- El estado de error permite reintentar o contactar directamente por WhatsApp
- Todos los estados respetan el diseño y accesibilidad del sistema

---

### 2025-01-XX - Microtarea 5.2: Formulario de Agendamiento ✅ COMPLETADA

**Descripción:** Implementación del formulario de agendamiento con validación Zod, normalización de teléfono chileno y remoción del campo RUT según especificación.

**Archivos creados:**
- `lib/validations/visit.ts` - Schema Zod para validación de formulario de visitas
  - `visitFormSchema` - Valida nombre (requerido, min 2 caracteres), email (opcional, formato válido), teléfono (requerido, formato chileno)
  - `normalizeChileanPhone()` - Función que normaliza teléfonos chilenos a formato estándar `+56 9 XXXX XXXX`
  - Acepta múltiples formatos: `+56912345678`, `912345678`, `9 1234 5678`, `+56 9 1234 5678`, etc.

**Archivos modificados:**
- `components/flow/QuintoAndarVisitScheduler.tsx`
  - Removido campo RUT del formulario (no está en especificación)
  - Actualizado para usar `visitFormSchema` de Zod para validación
  - Implementada normalización automática de teléfono antes de enviar
  - Actualizado `canContinueForm` para usar validación Zod
  - Actualizado `handleContinueToSuccess` para validar y normalizar con Zod antes de enviar
  - Actualizado `handleFieldAnswer` para validar campos individuales con Zod
  - Actualizado botón de flecha para validar con Zod antes de avanzar

**Cambios técnicos:**
- **Validación:** Migrada de validación manual a Zod schema
- **Normalización:** Teléfono se normaliza automáticamente a `+56 9 XXXX XXXX` antes de enviar
- **Campos:** Removido RUT, mantenidos solo nombre (requerido), email (opcional), teléfono (requerido)
- **Formulario:** Solo se habilita después de seleccionar fecha/hora (ya estaba implementado en `canContinue`)

**Notas importantes:**
- El formulario valida en tiempo real con Zod
- La normalización de teléfono acepta múltiples formatos y los convierte automáticamente
- El submit usa datos normalizados (teléfono ya en formato estándar)
- El formulario solo se muestra cuando `step === 'contact'`, que solo se activa después de seleccionar fecha/hora

---

### 2025-01-XX - Microtarea 5.1: Calendario (6 días, sin domingos) ✅ COMPLETADA

**Descripción:** Implementación del calendario del modal de agendamiento con 6 días siguientes, excluyendo solo domingos, y horarios extendidos hasta 20:00 con slots de 30 minutos.

**Archivos modificados:**
- `types/visit.ts` - Extendido `TIME_SLOTS_30MIN` hasta 20:00 (agregados slots 19:00, 19:30, 20:00), actualizado `OPERATIONAL_HOURS.end` a 20
- `hooks/useVisitScheduler.ts` - Ajustado `availableDays` para generar exactamente 6 días válidos (excluyendo solo domingos, incluyendo sábados)
- `components/flow/QuintoAndarVisitScheduler.tsx` - Actualizado `fetchAvailability` para buscar 6 días válidos (no-domingos)

**Cambios técnicos:**
- **Horarios:** Extendidos de 18:30 a 20:00 (agregados 3 slots: 19:00, 19:30, 20:00)
- **Días:** Cambiado de 7 días (lunes-viernes) a 6 días (excluyendo solo domingos, incluyendo sábados)
- **Lógica:** Implementado loop que busca días válidos hasta encontrar 6 (excluyendo domingos)

**Notas importantes:**
- El calendario ahora muestra 6 días consecutivos válidos (excluyendo solo domingos)
- Los horarios van de 9:00 a 20:00 con slots de 30 minutos (23 slots totales)
- El hook `useVisitScheduler` genera automáticamente los días correctos
- El componente `QuintoAndarVisitScheduler` calcula correctamente el rango de fechas para la API

---

### 2025-01-XX - Microtarea 4.5: Unidades Similares ✅ COMPLETADA

**Descripción:** Verificación y confirmación de que el componente PropertySimilarUnits está completamente implementado según especificación

**Archivos verificados (ya implementados):**
- `components/property/PropertySimilarUnits.tsx` - Sección de unidades similares ✅
  - Props: `currentUnit: Unit`, `building: Building`, `limit?: number` (default 6)
  - Función `getSimilarUnits` que filtra unidades por:
    - Misma comuna
    - Precio similar (±20%)
    - Dormitorios similares (mismo número o ±1)
    - Excluye unidad actual
  - Ordena por precio más cercano primero
  - Límite máximo de 6 unidades
  - Grid responsive: 1 columna mobile, 2 tablet, 3-4 desktop
  - Loading state con `UnitCardSkeleton` (6 skeletons)
  - Estado vacío: retorna `null` si no hay unidades similares
  - Usa `UnitCard` para cada unidad (navegación automática a `/property/[slug]`)
  - Título: "Unidades similares"
  - Espaciado: `py-16`

**Archivos modificados:**
- `components/property/PropertyClient.tsx` - Integración de PropertySimilarUnits ✅
  - Agregado import de `PropertySimilarUnits`
  - Integrado después de `PropertyTabs` y antes de `CommuneLifeSection`
  - Solo se muestra si `selectedUnit` está disponible
  - Pasa `currentUnit={selectedUnit}`, `building={building}`, `limit={6}`

**Notas importantes:**
- Componente completamente implementado y funcionando según especificación
- Filtrado inteligente de unidades similares según criterios especificados
- Usa `readAll()` para obtener todos los edificios (funciona en cliente si Supabase está configurado)
- Grid completamente responsive (1/2/3-4 columnas según breakpoint)
- Loading state con skeletons para mejor UX
- Estado vacío manejado correctamente (no muestra nada si no hay unidades similares)
- Navegación automática desde cards usando `UnitCard` existente
- TypeScript estricto mantenido (sin `any`)
- Sin errores de lint
- Build exitoso

**Contexto relevante:**
- ✅ **Sprint 4 COMPLETADO** - 5/5 microtareas completadas (100%)
- Property Page completamente implementada según especificación Assetplan
- Listo para continuar con Sprint 5 (Sistema de Agendamiento de Visitas)
- Todos los componentes de Property Page están implementados y funcionando

**Dependencias afectadas:**
- Usa `UnitCard` y `UnitCardSkeleton` existentes (no rompe código)
- Usa `readAll()` de `@lib/data` (mismo patrón que otros hooks del cliente)

---

### 2025-01-XX - Microtarea 4.3: Sticky Booking Card

**Descripción:** Mejoras finales al componente PropertyBookingCard agregando información de unidad y edificio según especificación

**Archivos modificados:**
- `components/property/PropertyBookingCard.tsx` - Mejoras implementadas:
  - ✅ Agregada información de unidad y edificio en header del card:
    - Código de unidad (`unit.codigoUnidad || unit.id`)
    - Nombre del edificio (`building.name`)
    - Dirección completa (`building.address`)
  - ✅ Header con separador visual (`border-b border-border`)
  - ✅ Información económica completa ya implementada:
    - Precio destacado con formato chileno
    - Valor Arriendo con nota de precio fijo
    - Gasto Común Fijo (si aplica)
    - Garantía con opción de cuotas
    - Reajuste según UF
  - ✅ CTAs funcionales:
    - CTA Principal: "Solicitar Visita" (Brand Violet `#8B6CFF`)
    - CTA Secundario: WhatsApp (verde `#25D366`)
    - Botón opcional: "Selecciona otro departamento"
  - ✅ Sticky behavior en desktop (`sticky top-24`)
  - ✅ Mobile manejado por PropertyAboveFoldMobile
  - ✅ Accesibilidad completa (aria-labels, focus visible, keyboard navigation)

**Notas importantes:**
- Componente ya estaba implementado y funcionando, se agregó información de unidad y edificio según especificación
- Card sticky funcional en desktop según especificación
- Información económica completa con todos los campos requeridos
- CTAs funcionales (Solicitar Visita abre modal, WhatsApp abre chat)
- Mobile: PropertyAboveFoldMobile ya maneja el bottom bar, así que PropertyBookingCard solo muestra desktop
- Formateo de precios en formato chileno (CLP)
- Fallbacks para campos opcionales (garantía, gasto común, etc.)
- TypeScript estricto mantenido (sin `any`)
- Sin errores de lint
- Componente ya integrado en PropertyClient

**Contexto relevante:**
- Sprint 4 en progreso: 3/5 microtareas completadas (60%)
- Próxima microtarea: 4.4 - Tabs de Contenido
- Componente PropertyBookingCard ya estaba implementado, se agregó información faltante según especificación

**Dependencias afectadas:**
- No rompe código existente
- Mejoras son compatibles con integraciones existentes en PropertyClient

---

### 2025-01-XX - Microtarea 4.2: Hero con Galería

**Descripción:** Mejoras y optimizaciones finales al componente PropertyGalleryGrid para cumplir completamente con la especificación de la microtarea 4.2

**Archivos modificados:**
- `components/property/PropertyGalleryGrid.tsx` - Mejoras implementadas:
  - ✅ Mejor responsive: Stack vertical en mobile (grid-cols-1), grid 1+4 en desktop (md:grid-cols-2)
  - ✅ Mejor accesibilidad: Focus trap en lightbox, prevención de scroll del body cuando lightbox está abierto
  - ✅ Navegación por teclado mejorada: Enter y Espacio para abrir imágenes desde el grid
  - ✅ Bordes redondeados correctos según posición de cada imagen
  - ✅ Aria-labels y roles semánticos mejorados (role="region", role="dialog", aria-modal)
  - ✅ Focus automático en botón cerrar cuando se abre lightbox

**Notas importantes:**
- Componente ya estaba implementado y funcionando, se realizaron mejoras de accesibilidad y responsive
- Grid responsive: Mobile muestra stack vertical (1 grande arriba, luego 4 pequeñas en grid 2x2), Desktop muestra grid 1+4 horizontal
- Lightbox con focus trap para mejor accesibilidad
- Prevención de scroll del body cuando lightbox está abierto
- Todas las imágenes tienen navegación por teclado (Enter/Espacio para abrir, Arrow keys para navegar, Escape para cerrar)
- Bordes rounded-2xl solo en esquinas externas del contenedor según especificación
- TypeScript estricto mantenido (sin `any`)
- Sin errores de lint
- Componente ya integrado en PropertyHero y PropertyAboveFoldMobile

**Contexto relevante:**
- Sprint 4 en progreso: 2/5 microtareas completadas (40%)
- Próxima microtarea: 4.3 - Sticky Booking Card
- Componente PropertyGalleryGrid ya estaba implementado, se realizaron mejoras finales

**Dependencias afectadas:**
- No rompe código existente
- Mejoras son compatibles con integraciones existentes en PropertyHero y PropertyAboveFoldMobile

---

### 2025-01-XX - Microtarea 4.5: Unidades Similares

**Descripción:** Implementación completa de la sección de unidades similares con filtrado inteligente según especificación Assetplan

**Archivos creados:**
- `components/property/PropertySimilarUnits.tsx` - Componente de unidades similares
  - Props: `currentUnit: Unit`, `building: Building`, `limit?: number` (default 6)
  - Función `getSimilarUnits` que filtra unidades por:
    - Misma comuna
    - Precio similar (±20%)
    - Dormitorios similares (mismo número o ±1)
    - Excluye unidad actual
  - Ordena por precio más cercano primero
  - Límite máximo de 6 unidades
  - Grid responsive: 1 columna mobile, 2 tablet, 3-4 desktop
  - Loading state con `UnitCardSkeleton` (6 skeletons)
  - Estado vacío: retorna `null` si no hay unidades similares
  - Usa `UnitCard` para cada unidad (navegación automática a `/property/[slug]`)
  - Título: "Unidades similares"
  - Espaciado: `py-16`

**Archivos modificados:**
- `components/property/PropertyClient.tsx` - Integración de PropertySimilarUnits
  - Agregado import de `PropertySimilarUnits`
  - Integrado después de `PropertyTabs` y antes de `CommuneLifeSection`
  - Solo se muestra si `selectedUnit` está disponible
  - Pasa `currentUnit={selectedUnit}`, `building={building}`, `limit={6}`

**Notas importantes:**
- Filtrado inteligente de unidades similares según criterios especificados
- Usa `readAll()` para obtener todos los edificios (funciona en cliente si Supabase está configurado)
- Grid completamente responsive (1/2/3-4 columnas según breakpoint)
- Loading state con skeletons para mejor UX
- Estado vacío manejado correctamente (no muestra nada si no hay unidades similares)
- Navegación automática desde cards usando `UnitCard` existente
- TypeScript estricto mantenido (sin `any`)
- Sin errores de lint
- Build exitoso

**Contexto relevante:**
- Sprint 4 completamente finalizado (5/5 microtareas completadas - 100%)
- Property Page completamente implementada según especificación Assetplan
- Listo para continuar con Sprint 5 (Sistema de Agendamiento de Visitas)

**Dependencias afectadas:**
- Usa `UnitCard` y `UnitCardSkeleton` existentes (no rompe código)
- Usa `readAll()` de `@lib/data` (mismo patrón que otros hooks del cliente)

---

### 2025-01-XX - Microtarea 4.4: Tabs de Contenido ✅ COMPLETADA

**Descripción:** Verificación y confirmación de que el sistema de tabs está completamente implementado según especificación Assetplan con 4 tabs: Detalle, Características, Requisitos y Preguntas Frecuentes

**Archivos verificados (ya implementados):**
- `components/property/PropertyTabs.tsx` - Sistema de tabs principal ✅
  - Props: `unit: Unit`, `building: Building`
  - 4 tabs: "Detalle", "Características", "Requisitos", "Preguntas Frecuentes"
  - Tab "Detalle" activo por defecto
  - Estilo: underline activo con Brand Violet (`#8B6CFF`), hover effects
  - Navegación por teclado: Arrow keys entre tabs, Enter para activar
  - Responsive: Tabs scroll horizontal en mobile si es necesario
  - Accesibilidad completa: `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`, `aria-labelledby`
  - Focus visible en tabs activos
  - Screen reader friendly

- `components/property/PropertyDetailTab.tsx` - Tab de detalle del departamento ✅
  - Código de unidad y estado (badge con colores según estado)
  - Tipología: Dormitorios, Baños, Superficie, Tipo
  - Información adicional: Piso, Vista/Orientación, Amoblado, Política mascotas
  - Iconos visuales: Bed, Bath, Square, Building2, Eye, Home, Heart
  - Layout: Grid responsive con cards

- `components/property/PropertyAmenitiesTab.tsx` - Tab de características del edificio ✅
  - Listado de Amenities usando `AmenityChips` component
  - Mapeo inteligente de amenities a iconos (Swimming, Dumbbell, Briefcase, ChefHat, Cocktail, Shirt, etc.)
  - Seguridad y accesos
  - Estacionamientos / Bodegas
  - Política pet friendly del edificio

- `components/property/PropertyRequirementsTab.tsx` - Tab de requisitos de arriendo ✅
  - Documentación requerida: Dependiente, Independiente, Extranjeros
  - Condiciones financieras: Renta mínima (arriendo × 3), Aval, Puntaje
  - Duración contrato
  - Condiciones de salida
  - Iconos: FileText, DollarSign, Shield, Calendar, CheckCircle

- `components/property/PropertyFAQTab.tsx` - Tab de preguntas frecuentes ✅
  - Reutiliza `PropertyFAQ` component existente
  - Preguntas desplegables (accordion)
  - Aclaraciones operativas
  - Casos comunes de objeción

**Archivos modificados:**
- `components/property/PropertyClient.tsx` - Integración de PropertyTabs ✅
  - Agregado import de `PropertyTabs`
  - Integrado después de `PropertyAboveFoldMobile` y antes de `PropertySimilarUnits`
  - Solo se muestra si `selectedUnit` está disponible
  - Pasa `unit={selectedUnit}` y `building={building}` como props

**Notas importantes:**
- Todos los componentes de tabs están implementados y funcionando correctamente
- Sistema de tabs completamente funcional con navegación por teclado
- Contenido completo según especificación en cada tab
- Accesibilidad completa implementada (ARIA, keyboard navigation, focus visible)
- Responsive: Tabs funcionan correctamente en mobile/tablet/desktop
- PropertyLocationTab existe pero no se usa en PropertyTabs (según plan son 4 tabs, no 5)
- TypeScript estricto mantenido (sin `any`)
- Sin errores de lint
- Build exitoso

**Contexto relevante:**
- Sprint 4 en progreso: 4/5 microtareas completadas (80%)
- Próxima microtarea: 4.5 - Unidades Similares
- Todos los componentes de tabs ya estaban implementados, se verificó que cumplen con la especificación

**Dependencias afectadas:**
- No rompe código existente
- Integración correcta en PropertyClient

**Archivos modificados:**
- `components/property/PropertyClient.tsx` - Integración de PropertyTabs
  - Reemplazado `PropertyAccordion` con `PropertyTabs`
  - Agregado import de `PropertyTabs`
  - Integrado después de `PropertyAboveFoldMobile` (galería)
  - Solo se muestra si `selectedUnit` está disponible
  - Pasa `unit` y `building` como props

**Notas importantes:**
- Sistema de tabs completamente funcional según especificación
- 4 tabs implementados con contenido completo
- Navegación por teclado funcional (Arrow keys, Enter)
- Responsive completo (mobile/tablet/desktop)
- Reutiliza componentes existentes: `AmenityChips`, `PropertyFAQ`
- Mapeo inteligente de amenities a iconos (case-insensitive)
- TypeScript estricto mantenido (sin `any`)
- Sin errores de lint
- Build exitoso

**Contexto relevante:**
- Sprint 4 en progreso (4/5 microtareas completadas - 80%)
- Sistema de tabs completamente funcional según especificación Assetplan
- Listo para continuar con Microtarea 4.5 (Unidades Similares)

**Dependencias afectadas:**
- `PropertyAccordion` reemplazado por `PropertyTabs` (no rompe código, solo cambio de componente)
- Usa componentes existentes: `AmenityChips`, `PropertyFAQ`, `lucide-react`

---

### 2025-01-XX - Microtarea 4.3: Sticky Booking Card

**Descripción:** Implementación completa del card sticky de booking con información económica destacada y CTAs según especificación Assetplan

**Archivos creados:**
- `components/property/PropertyBookingCard.tsx` - Card sticky con información económica y CTAs
  - Props: `unit: Unit`, `building: Building`, `onScheduleVisit`, `onWhatsApp`
  - Desktop: Card sticky en sidebar (`sticky top-24`)
  - Mobile: Fixed bottom bar (oculto, PropertyAboveFoldMobile lo maneja)
  - Precio destacado: `text-3xl font-bold tracking-tight tabular-nums`
  - Bloque financiero con iconos:
    - 💰 Valor Arriendo (con nota "Precio fijo primeros 3 meses")
    - 🏢 Gasto Común Fijo
    - 🔒 Garantía (con opción "Garantía en cuotas" si aplica)
    - 📊 Reajuste ("Arriendo se reajusta cada 3 meses según UF")
  - Iconos de `lucide-react`: `Wallet`, `Building2`, `Shield`, `TrendingUp`
  - CTA Principal: "Solicitar Visita" (Brand Violet `#8B6CFF`)
  - CTA Secundario: WhatsApp (verde `#25D366`)
  - Botón opcional: "Selecciona otro departamento"
  - Formateo de precios con `Intl.NumberFormat` (formato chileno)
  - Card con `rounded-2xl`, `bg-card`, `border border-border`, `shadow-lg`
  - Accesibilidad completa (aria-labels, focus visible, keyboard navigation)

**Archivos modificados:**
- `components/property/PropertyClient.tsx` - Integración de PropertyBookingCard
  - Reemplazado `PropertySidebar` con `PropertyBookingCard` en el layout
  - Agregado import de `PropertyBookingCard`
  - Integrado en sidebar derecha (desktop)
  - Conectado con modal de agendamiento existente (`setIsModalOpen`)
  - WhatsApp link con mensaje pre-llenado
  - Solo se muestra si `selectedUnit` está disponible

**Notas importantes:**
- Card sticky funcional en desktop según especificación
- Información económica completa con todos los campos requeridos
- CTAs funcionales (Solicitar Visita abre modal, WhatsApp abre chat)
- Mobile: PropertyAboveFoldMobile ya maneja el bottom bar, así que PropertyBookingCard solo muestra desktop
- Formateo de precios en formato chileno (CLP)
- Fallbacks para campos opcionales (garantía, gasto común, etc.)
- TypeScript estricto mantenido (sin `any`)
- Sin errores de lint
- Build exitoso

**Contexto relevante:**
- Sprint 4 en progreso (3/5 microtareas completadas - 60%)
- Booking card completamente funcional según especificación Assetplan
- Listo para continuar con Microtarea 4.4 (Tabs de Contenido)

**Dependencias afectadas:**
- `PropertySidebar` reemplazado por `PropertyBookingCard` (no rompe código, solo cambio de componente)
- Usa componentes existentes: `lucide-react`, modal de agendamiento

---

### 2025-01-XX - Microtarea 4.2: Hero con Galería

**Descripción:** Implementación completa de galería con grid 1+4 estilo Airbnb según especificación Assetplan, con lightbox funcional y combinación inteligente de imágenes

**Archivos creados:**
- `components/property/PropertyGalleryGrid.tsx` - Componente de galería con grid 1+4
  - Props: `unit?: Unit`, `building: Building`
  - Grid 1+4 estilo Airbnb: imagen principal grande + 4 imágenes pequeñas
  - Combinación inteligente de imágenes según prioridad:
    - Prioridad 1: `unit.images` (imágenes del departamento interior)
    - Prioridad 2: `unit.imagesTipologia` (imágenes de tipología)
    - Prioridad 3: `unit.imagesAreasComunes` (imágenes de áreas comunes)
    - Prioridad 4: `building.gallery` (imágenes del edificio)
  - Lightbox integrado con navegación por teclado (Arrow keys, Escape)
  - Contador de imágenes restantes: "+X más" cuando hay más de 5
  - Bordes `rounded-2xl` en esquinas externas
  - Separación `gap-2` o `gap-4` entre imágenes
  - Hover effects suaves con overlay
  - Responsive: Desktop (grid horizontal), Mobile (stack vertical)
  - Optimización de imágenes con `next/image` y `priority` para primera imagen
  - Accesibilidad completa (aria-labels, keyboard navigation)

**Archivos modificados:**
- `components/property/PropertyAboveFoldMobile.tsx` - Integración de galería
  - Reemplazado carrusel simple con `PropertyGalleryGrid`
  - Removida lógica de navegación de imágenes antigua (touch, swipe, etc.)
  - Removidos controles de navegación y paginador de dots
  - Agregado `PropertyGalleryGrid` después de la barra superior
  - Mantiene funcionalidad de barra superior, CTAs y badges
  - Usa `selectedUnit` para pasar a la galería

- `components/property/PropertyHero.tsx` - Preparado para uso futuro
  - Agregada prop `unit?: Unit` para compatibilidad
  - Agregado `PropertyGalleryGrid` (preparado para uso en desktop si es necesario)
  - Mantiene badges y título/ubicación

**Notas importantes:**
- Galería implementada según especificación exacta (grid 1+4 estilo Airbnb)
- Lightbox funcional con navegación completa (teclado, botones, click fuera)
- Combinación inteligente de imágenes según prioridad definida
- Responsive completo (desktop y mobile)
- Optimización de imágenes con `next/image` y lazy loading
- TypeScript estricto mantenido (sin `any`)
- Sin errores de lint
- Build exitoso

**Contexto relevante:**
- Sprint 4 en progreso (2/5 microtareas completadas - 40%)
- Galería completamente funcional según especificación Assetplan
- Listo para continuar con Microtarea 4.3 (Sticky Booking Card)

**Dependencias afectadas:**
- Ninguna (componente nuevo, no rompe código existente)
- Usa componentes existentes: `next/image`, `framer-motion`, `lucide-react`

---

### 2025-01-XX - Microtarea 4.1: Breadcrumb y Header

**Descripción:** Implementación completa del breadcrumb según especificación Assetplan con estructura `Home > Arriendo Departamentos > [Comuna] > [Edificio] > [Tipología]` y JSON-LD para SEO

**Archivos modificados:**
- `components/property/PropertyBreadcrumb.tsx` - Actualización completa del breadcrumb
  - Agregada prop `unit?: Unit` para mostrar tipología de la unidad
  - Estructura actualizada: `Home > Arriendo Departamentos > [Comuna] > [Edificio] > [Tipología]`
  - Navegación funcional: cada item clickeable excepto el último (usando `next/link`)
  - Estilo actualizado: `text-sm text-text-muted` para items, `text-text font-medium` para item actual
  - Iconos `ChevronRight` entre items
  - Accesibilidad: `aria-label` en nav, `aria-current="page"` en último item
  - Fallback: Si no hay unidad, usa primera unidad del edificio o "Departamento"
  - Mantiene compatibilidad con variantes (catalog, marketing, admin)

- `app/(catalog)/property/[slug]/page.tsx` - Agregado JSON-LD para breadcrumb
  - Creado objeto `breadcrumbJsonLd` con estructura BreadcrumbList según Schema.org
  - Incluye todos los items del breadcrumb con URLs absolutas
  - Script agregado con `type="application/ld+json"` usando `safeJsonLd`
  - Obtiene unidad desde `searchParams.unit` o primera unidad del edificio
  - Tipología convertida a formato legible (Studio → Estudio)

- `components/property/PropertyClient.tsx` - Integración de unidad en breadcrumb
  - Actualizado para pasar `selectedUnit` al `PropertyBreadcrumb`
  - Dos ocurrencias actualizadas: una en layout principal, otra en vista de todas las unidades
  - Usa `selectedUnit` del hook `usePropertyUnit` o primera unidad como fallback

- `app/(catalog)/property/[slug]/PropertyClient.tsx` - Actualización de props
  - Agregadas props `tipologiaFilter` y `showAllUnits` al wrapper
  - Pasa todas las props al `BasePropertyClient`

**Notas importantes:**
- Breadcrumb ahora muestra unidad específica según especificación
- JSON-LD implementado correctamente para SEO (Google Rich Results)
- Navegación funcional con `next/link` para mejor performance
- Accesibilidad completa (aria-labels, keyboard navigation)
- TypeScript estricto mantenido (sin `any`)
- Sin errores de lint
- Build exitoso

**Contexto relevante:**
- Sprint 4 iniciado (1/5 microtareas completadas - 20%)
- Breadcrumb completamente funcional según especificación Assetplan
- Listo para continuar con Microtarea 4.2 (Hero con Galería)

**Dependencias afectadas:**
- Ninguna (solo mejoras y actualizaciones, no rompe código existente)
- Usa componentes existentes: `next/link`, `lucide-react`, `safeJsonLd`

---

### 2025-01-XX - Microtarea 3.2: Estados de Resultados y Paginación

**Descripción:** Implementación completa de estados de resultados (vacío, error) y sistema de paginación para la página de búsqueda

**Archivos creados:**
- `components/search/EmptyResults.tsx` - Componente de estado vacío
  - Props: `searchTerm`, `hasFilters`, `onClearFilters`
  - Icono `Search` de lucide-react
  - Mensajes contextuales según búsqueda/filtros
  - Botones: "Limpiar Filtros" (Brand Violet) y "Ver todas las propiedades"
  - Animaciones con framer-motion (fade in + slide up)
  - Respeto a `prefers-reduced-motion`

- `components/search/ResultsError.tsx` - Componente de estado de error
  - Props: `error: Error`, `onRetry: () => void`
  - Icono `AlertCircle` de lucide-react con color error
  - Mensaje amigable (no técnico) para usuarios
  - Botón "Reintentar" con icono `RefreshCw`
  - Accesibilidad: `aria-live="assertive"` para anunciar error
  - Animaciones con framer-motion

- `components/search/PaginationControls.tsx` - Componente de paginación
  - Props: `currentPage`, `totalPages`, `totalResults`, `limit`, `onPageChange`
  - Botones anterior/siguiente con iconos `ChevronLeft`/`ChevronRight`
  - Números de página clickeables (máximo 7 visibles con elipsis)
  - Página actual destacada con Brand Violet
  - Conteo de resultados: "Mostrando X-Y de Z resultados"
  - Responsive: Mobile muestra solo anterior/siguiente con texto "Página X de Y"
  - Desktop muestra números de página con elipsis
  - Scroll to top al cambiar página
  - Actualización de URL con query param `page`

**Archivos modificados:**
- `app/buscar/SearchResultsClient.tsx` - Integración de estados y paginación
  - Importados `EmptyResults`, `ResultsError`, `PaginationControls`
  - Integrado `EmptyResults` cuando no hay resultados
  - Integrado `ResultsError` cuando hay error
  - Integrado `PaginationControls` debajo del grid de resultados
  - Handler `handleRetry` para reintentar en caso de error
  - Handler `handlePageChange` para cambio de página
  - Mejorado manejo de estados de carga (isLoading vs isFetching)
  - Estados separados correctamente (loading, error, vacío, resultados)

**Notas importantes:**
- Estados completamente funcionales y contextuales
- Paginación funcional con actualización de URL
- Mensajes de error amigables para usuarios finales
- EmptyResults adapta mensaje según contexto (búsqueda/filtros)
- PaginationControls solo se muestra si hay más de 1 página
- TypeScript estricto mantenido (sin `any`)
- Sin errores de lint
- Build exitoso

**Contexto relevante:**
- Sprint 3 completamente finalizado (2/2 microtareas - 100%)
- Página de resultados ahora completa con todos los estados y paginación
- Listo para continuar con Sprint 4 (Página de Propiedad/Unidad) - pendiente de extender

**Dependencias afectadas:**
- Ninguna (componentes nuevos, no rompe código existente)
- Usa componentes existentes: framer-motion, lucide-react, hooks

---

### 2025-01-XX - Microtarea 3.1: Página `/buscar` con Filtros y Grid de Unidades

**Descripción:** Implementación completa de la página de resultados de búsqueda usando unidades en lugar de edificios, con filtros mejorados y FilterChips

**Archivos creados:**
- `components/filters/FilterChip.tsx` - Chip individual removible
  - Props: `label`, `value`, `onRemove`
  - Estilo: Pill con Brand Violet, botón X para remover
  - Animaciones con framer-motion

- `components/filters/FilterChips.tsx` - Contenedor de chips de filtros activos
  - Props: `filters: ActiveFilters`, `onRemoveFilter`
  - Muestra chips para comuna, precio (min/max), dormitorios
  - Formateo de precio con `formatPrice`
  - Manejo especial para remover ambos precios (min/max) juntos

- `components/search/ResultsBreadcrumb.tsx` - Breadcrumb para página de resultados
  - Navegación: "Home > Resultados"
  - Icono `Home` de lucide-react
  - Estilo consistente con otros breadcrumbs

- `lib/hooks/useSearchResults.ts` - Hook para obtener unidades filtradas
  - Parámetros: `q`, `comuna`, `precioMin`, `precioMax`, `dormitorios`, `sort`, `page`, `limit`
  - Retorna: `units: UnitWithBuilding[]`, `total`, `page`, `totalPages`, loading states
  - Filtrado por comuna, precio, dormitorios (con conversión a tipología), búsqueda por texto
  - Ordenamiento: precio (asc/desc), comuna
  - Paginación integrada
  - Usa `getAllBuildings` y flatten a unidades

**Archivos modificados:**
- `components/filters/FilterBar.tsx` - Agregado soporte para pills de dormitorios
  - Nueva prop `useDormitorios?: boolean`
  - Si `useDormitorios={true}`, usa `SearchPills` para dormitorios en lugar de dropdown
  - Opciones: "Estudio", "1", "2", "3"
  - Mantiene compatibilidad backward con tipología cuando `useDormitorios={false}`

- `types/filters.ts` - Agregado campo `dormitorios?: string` a `FilterValues`
  - Mantiene `tipologia` para compatibilidad backward

- `app/buscar/SearchResultsClient.tsx` - Refactorización completa
  - Cambiado de `BuildingCard` a `UnitCard`
  - Usa `useSearchResults` en lugar de `useFetchBuildings`
  - Integrado `FilterChips` para mostrar filtros activos
  - Integrado `ResultsBreadcrumb`
  - Lectura de query params: `q`, `comuna`, `precioMin`, `precioMax`, `dormitorios`, `sort`, `page`
  - Removido completamente filtro de baños
  - Actualización de URL con todos los filtros

- `app/buscar/page.tsx` - Metadata actualizada
  - Metadata dinámica según filtros aplicados
  - Removido `banos` de query params
  - Títulos y descripciones mejorados con contexto

**Notas importantes:**
- Página ahora muestra UNIDADES, no edificios (según especificación)
- FilterChips muestra filtros activos de forma visual
- Filtro de baños completamente removido
- Dormitorios ahora usa pills (similar a SearchForm)
- TypeScript estricto mantenido
- Sin errores de lint
- Build exitoso

**Contexto relevante:**
- Sprint 3 en progreso (1/2 microtareas completadas)
- Página de búsqueda funcional con unidades
- Listo para continuar con Microtarea 3.2 (Estados y Paginación)

**Dependencias afectadas:**
- Ninguna (sistema nuevo/refactorizado, no rompe código existente)
- Usa componentes existentes: `UnitCard`, `UnitCardSkeleton`, `SearchPills`

---

### 2025-01-XX - Tarea 2.4: Secciones de Beneficios Completas

**Descripción:** Implementación completa de la sección de beneficios con 3 cards según especificación exacta

**Archivos creados:**
- `components/marketing/BenefitCard.tsx` - Card individual de beneficio
  - Props: `title`, `description`, `icon` (ReactNode)
  - Layout: Icono + Título + Descripción
  - Estilo: Card con `rounded-2xl`, hover effects (scale, shadow)
  - Animaciones con framer-motion (fade in + slide up)
  - Hover effects: scale 1.02, y: -4, shadow con Brand Violet
  - Respeto a `prefers-reduced-motion`
  - Icono con gradiente Brand Violet y fondo con opacidad

- `components/marketing/BenefitsSection.tsx` - Sección principal de beneficios
  - Contiene 3 BenefitCard con contenido exacto de especificación:
    1. "Arrienda sin estrés" - Icono: `Zap`
    2. "Todo, aquí y ahora" - Icono: `Smartphone`
    3. "Somos líderes en el mercado" - Icono: `Award`
  - Título: "¿Por qué arrendar con nosotros?"
  - Subtítulo: "Nuestro servicio es ¡fácil, rápido y seguro!"
  - Grid responsive: 1 columna mobile, 2 tablet, 3 desktop
  - Animaciones de entrada con framer-motion
  - Espaciado: `py-16`

**Archivos modificados:**
- `app/page.tsx` - Integración de BenefitsSection
  - Agregado `BenefitsSection` después de `FeaturedUnitsSection`
  - Orden final: Hero → SearchForm → FeaturedUnitsSection → BenefitsSection

**Notas importantes:**
- Contenido exacto según especificación (textos no modificados)
- Iconos de `lucide-react`: Zap, Smartphone, Award
- Color Brand Violet `#8B6CFF` para iconos y efectos hover
- Tipografía consistente: `tracking-tight` en títulos
- Cards con `rounded-2xl` según Design System
- Animaciones suaves respetando `prefers-reduced-motion`
- TypeScript estricto mantenido (sin `any`)
- Sin errores de lint
- Build exitoso

**Contexto relevante:**
- Sprint 2 completamente finalizado (4/4 tareas - 100%)
- Página Home ahora completa según especificación
- Listo para continuar con Sprint 3 (Página de Resultados) - pendiente de extender

**Dependencias afectadas:**
- Ninguna (componentes nuevos, no rompe código existente)
- Usa componentes existentes: framer-motion, lucide-react, hooks

---

### 2025-01-XX - Tarea 2.3: Sistema Completo de Grids Destacadas con Carousels

**Descripción:** Implementación completa del sistema de grids destacadas con múltiples secciones, cada una mostrando unidades filtradas por comuna, dormitorios, precio o featured

**Archivos creados:**
- `lib/hooks/useFeaturedUnits.ts` - Hook para obtener unidades destacadas
  - Función `getFeaturedUnits` con filtros: comuna, dormitorios, precio, featured
  - Helpers: `getUnitsByComuna`, `getUnitsByDormitorios`, `getUnitsByPrecio`, `getFeaturedUnitsList`
  - Retorna `UnitWithBuilding[]` (unidad con su edificio asociado)
  - Manejo de errores y logging
  - Conversión de dormitorios a tipología (Estudio → Studio, 1 → 1D1B, etc.)

- `components/marketing/FeaturedUnitsGrid.tsx` - Server Component para grid básico
  - Props: `title`, `filter`, `limit`
  - Obtiene unidades usando `getFeaturedUnits`
  - Renderiza grid con `UnitCard` para cada unidad
  - Skeleton loader incluido (`FeaturedUnitsGridSkeleton`)
  - Retorna `null` si no hay unidades

- `components/marketing/FeaturedUnitsGridClient.tsx` - Client Component con grid responsive
  - Props: `title`, `units`, `isLoading`, `filterType`, `filterValue`
  - Grid responsive: 1 columna mobile, 2 tablet, 3-4 desktop
  - Botón "Ver todos" con navegación a `/buscar` con filtros aplicados
  - Animaciones con framer-motion (respetando `prefers-reduced-motion`)
  - Loading state con `UnitCardSkeleton`
  - Retorna `null` si no hay unidades

- `components/marketing/FeaturedUnitsSection.tsx` - Sección principal con múltiples grids
  - Server Component que obtiene unidades para 7 grids en paralelo:
    - "Departamentos en Ñuñoa" (comuna: Ñuñoa)
    - "Departamentos en Las Condes" (comuna: Las Condes)
    - "Departamentos en Providencia" (comuna: Providencia)
    - "Departamentos 1 dormitorio" (dormitorios: 1)
    - "Departamentos 2 dormitorios" (dormitorios: 2)
    - "Departamentos económicos" (precio: < 800000)
    - "Propiedades destacadas" (featured: true)
  - Solo muestra grids que tengan unidades disponibles
  - Espaciado consistente: `py-16` entre grids

**Archivos modificados:**
- `app/page.tsx` - Integración de FeaturedUnitsSection
  - Agregado `FeaturedUnitsSection` después del formulario de búsqueda
  - Orden: Hero → SearchForm → FeaturedUnitsSection

**Archivos verificados:**
- `components/ui/UnitCard.tsx` - Ya implementado y funcional ✅
- `components/ui/UnitCardSkeleton.tsx` - Ya implementado y funcional ✅
- `lib/data.ts` - `getAllBuildings` usado para obtener datos ✅

**Notas importantes:**
- Sistema trabaja con UNIDADES (no edificios) según especificación
- Cada unidad se muestra con su edificio asociado para contexto
- Filtros funcionan correctamente: comuna, dormitorios (convertidos a tipología), precio máximo, featured
- Grids responsive automáticamente (CSS Grid)
- Botón "Ver todos" navega a `/buscar` con query params correctos
- Solo se muestran grids que tengan unidades disponibles
- TypeScript estricto mantenido (sin `any`)
- Sin errores de lint
- Build exitoso

**Contexto relevante:**
- Sprint 2 en progreso (3/4 tareas completadas - 75%)
- Sistema de grids destacadas completamente funcional según especificación
- Listo para continuar con Tarea 2.4 (Secciones de Beneficios Completas)

**Dependencias afectadas:**
- Ninguna (sistema nuevo, no rompe código existente)
- Usa componentes existentes: `UnitCard`, `UnitCardSkeleton`
- Usa funciones existentes: `getAllBuildings` de `lib/data.ts`

---

### 2025-01-XX - Tarea 2.2: Formulario de Búsqueda Completo con Pills y Validación

**Descripción:** Implementación completa del formulario de búsqueda con pills para Comuna y Dormitorios, validación Zod, y navegación a resultados

**Archivos modificados:**
- `components/marketing/SearchForm.tsx` - Formulario completo con pills y validación
  - Integrado `SearchPills` para Comuna y Dormitorios
  - Validación con Zod usando `react-hook-form` y `zodResolver`
  - Manejo de errores mejorado con `setError` para errores de `.refine()`
  - Estado inicial desde URL usando `useSearchParams`
  - Navegación a `/buscar` con query params correctos
  - Layout: Búsqueda por texto → Pills Comuna → Pills Dormitorios → Inputs Precio → Botón buscar
  - Loading state en botón de búsqueda
  - Placeholders descriptivos en todos los inputs
  - Focus ring visible en todos los elementos
  - Responsive (mobile/tablet/desktop)

- `lib/validations/search.ts` - Schema de validación actualizado
  - Removido "4+" de dormitorios, solo "Estudio", "1", "2", "3" según especificación
  - Validación de `precioMax >= precioMin` con `.refine()`
  - Transformación de strings a numbers para precios
  - Schema de input (strings) y schema de validación (numbers) separados
  - Mensajes de error claros y útiles

**Archivos verificados:**
- `components/marketing/SearchPills.tsx` - Ya implementado y funcional ✅
  - Animaciones con framer-motion (scale effect)
  - Respeto a `prefers-reduced-motion`
  - Accesibilidad completa (keyboard navigation, aria-labels)
  - Variante activa: Brand Violet `#8B6CFF` con texto blanco
  - Variante inactiva: Borde gris, fondo transparente

**Notas importantes:**
- Filtro de baños completamente removido según especificación
- Pills para Comuna: Las Condes, Ñuñoa, Providencia, Santiago, Macul, La Florida
- Pills para Dormitorios: Estudio, 1, 2, 3 (sin "4+")
- Validación funciona correctamente, incluyendo errores de `.refine()` para precioMax >= precioMin
- Estado inicial desde URL funciona correctamente
- Navegación a `/buscar` preserva valores en URL para compartir
- TypeScript estricto mantenido (sin `any`)
- Sin errores de lint
- Build exitoso

**Contexto relevante:**
- Sprint 2 en progreso (2/4 tareas completadas - 50%)
- Formulario de búsqueda completamente funcional según especificación
- Listo para continuar con Tarea 2.3 (Sistema Completo de Grids Destacadas con Carousels)

**Dependencias afectadas:**
- Ninguna (solo mejoras y ajustes, no rompe código existente)
- Formulario puede usarse en cualquier página que necesite búsqueda

---

### 2025-01-XX - Tarea 2.1: Header Completo con StickySearchBar Integrado

**Descripción:** Integración completa del StickySearchBar en el Header con animaciones responsive y optimización para conversión

**Archivos modificados:**
- `components/marketing/Header.tsx` - Integración completa de StickySearchBar
  - Importado `StickySearchBar` desde `./StickySearchBar`
  - Agregado estado para controlar visibilidad (`showStickySearch`)
  - Implementado detección de dirección de scroll para animaciones mobile
  - Agregado soporte para `prefers-reduced-motion`
  - Implementado detección de tamaño de pantalla (mobile/desktop)
  - StickySearchBar aparece después de 100px de scroll
  - Animaciones de aparición/desaparición en mobile (scroll up/down)
  - Desktop: siempre visible cuando está sticky
  - Mobile: se oculta al scroll down, aparece al scroll up
  - Posicionamiento: `sticky top-[72px] lg:top-[80px] z-50`
  - Fondo con backdrop-blur para efecto glass
  - Integrado con `AnimatePresence` y `motion.div` de framer-motion

- `components/marketing/StickySearchBar.tsx` - Ajustes para integración
  - Agregada prop `integrated?: boolean` para desactivar sticky behavior interno
  - Cuando `integrated={true}`, no maneja su propio sticky (lo maneja el Header)
  - Mantiene toda la funcionalidad de búsqueda y navegación

**Archivos verificados:**
- `app/layout.tsx` - Header se renderiza globalmente ✅
- `app/page.tsx` - StickySearchBar solo aparece en home (`pathname === '/'`) ✅

**Notas importantes:**
- StickySearchBar solo se muestra en la página home (`pathname === '/'`)
- Se activa después de 100px de scroll
- Desktop: siempre visible cuando está sticky (no se oculta)
- Mobile: animación inteligente - se oculta al scroll down, aparece al scroll up
- Respeta `prefers-reduced-motion` (sin animaciones si está activo)
- Z-index correcto: Header (z-40), StickySearchBar (z-50), Mobile menu (z-60)
- Placeholder optimizado: "Buscar por comuna, dirección, nombre de edificio..."
- TypeScript estricto mantenido
- Sin errores de lint
- Build exitoso (warnings no relacionados con estos cambios)

**Contexto relevante:**
- Sprint 2 iniciado (1/4 tareas completadas)
- StickySearchBar ahora está completamente integrado en el Header
- Listo para continuar con Tarea 2.2 (Formulario de Búsqueda con Pills)

**Dependencias afectadas:**
- Ninguna (solo integración, no rompe código existente)
- StickySearchBar puede usarse independientemente o integrado

---

### 2025-01-XX - Microtarea 1.3: Actualización de Tipografía Premium (Inter)

**Descripción:** Actualización completa de tipografía según Design System v2.0 - Inter Premium con tracking-tight y tabular-nums

**Archivos modificados:**
- `components/ui/BuildingCardV2.tsx` - Agregado `tabular-nums` a precio
- `components/BuildingCard.tsx` - Agregado `tabular-nums` a precio
- `components/marketing/FeaturedGrid.tsx` - Agregado `tracking-tight` a H2 y `tabular-nums` a precio
- `components/marketing/FeaturedGridClient.tsx` - Agregado `tracking-tight` a H2 y `tabular-nums` a precio
- `components/marketing/SocialProof.tsx` - Agregado `tracking-tight` a H2
- `components/marketing/ValueProps.tsx` - Agregado `tracking-tight` a H2
- `components/marketing/FAQ.tsx` - Agregado `tracking-tight` a H2
- `components/marketing/Benefits.tsx` - Agregado `tracking-tight` a H2
- `components/marketing/ComingSoonHero.tsx` - Agregado `tracking-tight` a H2
- `components/marketing/ArriendaSinComisionGrid.tsx` - Agregado `tracking-tight` a títulos
- `components/marketing/ArriendaSinComisionBuildingDetail.tsx` - Agregado `tracking-tight` a H1 y `tabular-nums` a precio
- `components/marketing/ArriendaSinComisionStats.tsx` - Agregado `tabular-nums` a precio promedio
- `components/marketing/UpsellStepper.tsx` - Agregado `tracking-tight` a H3
- `components/marketing/Trust.tsx` - Agregado `tracking-tight` a H3

**Archivos verificados (ya tenían las clases correctas):**
- `app/layout.tsx` - Inter configurado con `display: 'swap'` y `preload: true` ✅
- `components/marketing/HeroV2.tsx` - Ya tenía `tracking-tight` en H1 ✅
- `components/marketing/ArriendaSinComisionHero.tsx` - Ya tenía `tracking-tight` en H1 ✅
- `components/ui/UnitCard.tsx` - Ya tenía `tabular-nums` en precio ✅

**Notas importantes:**
- Inter ya estaba configurado correctamente en `app/layout.tsx`
- Todos los H1 y H2 principales ahora tienen `tracking-tight`
- Todos los precios principales ahora tienen `tabular-nums`
- No se rompió ningún componente existente
- Solo se agregaron clases, no se cambió estructura
- TypeScript estricto mantenido
- Sin errores de lint
- Build exitoso

**Contexto relevante:**
- Sprint 1 completamente finalizado (3/3 microtareas)
- Tipografía ahora sigue estándares del Design System v2.0
- Consistencia visual mejorada en toda la aplicación
- Próximo paso: Extender Sprint 2 antes de iniciar

**Dependencias afectadas:**
- Ninguna (solo agregado de clases CSS, no rompe código existente)
- Mejora la consistencia visual en toda la app

---

### 2025-01-XX - Microtarea 1.2: Implementación de Sticky Search Bar (Glass)

**Descripción:** Implementación completa del componente StickySearchBar según Design System v2.0 y especificación del MVP

**Archivos creados:**
- `components/marketing/StickySearchBar.tsx` - Componente principal con todas las funcionalidades
  - Props tipadas con TypeScript estricto
  - Contenedor con efecto `glass-strong` y forma pill (`rounded-full`)
  - Sticky behavior con scroll detection (se activa después de 100px de scroll)
  - Input de búsqueda con estilos y variables CSS
  - Botón buscar circular con Brand Violet `#8B6CFF`
  - Animaciones estilo Airbnb (elevación y scale al activar sticky)
  - Responsive (mobile/tablet/desktop)
  - Funcionalidad de búsqueda con callback opcional o navegación a `/buscar`
  - Soporte para `prefers-reduced-motion`
  - Accesibilidad completa (focus visible, aria-labels, navegación por teclado)
  
- `tests/unit/components/StickySearchBar.test.tsx` - Tests básicos
  - 15 tests cubriendo funcionalidad, accesibilidad y casos edge
  - Mocks de next/navigation y lucide-react
  - Verificación de renderizado, búsqueda, navegación y sticky behavior

**Archivos modificados:**
- Ninguno (componente nuevo)

**Notas importantes:**
- Componente implementado según especificación exacta de `ESPECIFICACION_COMPLETA_MVP.md` líneas 1175-1190
- Usa variables CSS del sistema de temas (`text-text`, `text-text-muted`, etc.)
- Efecto `glass-strong` definido en `tailwind.config.ts`
- Sticky behavior: Se activa cuando `scrollY > 100px`
- Animaciones: Elevación y scale al activar sticky (respetando `prefers-reduced-motion`)
- Navegación: Si hay `onSearch` callback, lo usa; si no, navega a `/buscar?q=query`
- TypeScript estricto (sin `any`)
- Sin errores de lint
- Build exitoso

**Contexto relevante:**
- Componente independiente, puede usarse en cualquier página
- Listo para integrar en Header o como componente standalone
- Próximo paso: Integrar en páginas existentes o continuar con Microtarea 1.3

**Dependencias afectadas:**
- Ninguna (componente nuevo, no rompe código existente)
- Puede ser usado por: `components/marketing/Header.tsx`, páginas de home, etc.

---

### 2025-01-XX - Microtarea 1.1: Implementación de Elkis Unit Card

**Descripción:** Implementación completa del componente UnitCard según Design System v2.0 y especificación del MVP

**Archivos creados:**
- `components/ui/UnitCard.tsx` - Componente principal con todas las funcionalidades
  - Props tipadas con TypeScript estricto
  - Contenedor con estilos glass y hover effects
  - Sección de imagen con next/image optimizado
  - Tag glass flotante (top left) con estado "Disponible"
  - Botón de favoritos (top right) con icono Heart
  - Sección de contenido (nombre, ubicación, precio, gasto común)
  - Botón "Ver unidad" visible en hover (desktop)
  - Navegación con Link a `/property/[slug]`
  - Accesibilidad completa (focus visible, aria-labels, navegación por teclado)
  
- `components/ui/UnitCardSkeleton.tsx` - Estado de carga
  - Estructura similar a UnitCard
  - Animación pulse para placeholders
  - Mismo aspect ratio y estructura visual
  
- `tests/unit/components/UnitCard.test.tsx` - Tests básicos
  - 15 tests cubriendo funcionalidad, accesibilidad y casos edge
  - Mocks de next/image, next/link y lucide-react
  - Verificación de renderizado, navegación y datos

**Archivos modificados:**
- Ninguno (componente nuevo)

**Notas importantes:**
- Componente implementado según especificación exacta de `ESPECIFICACION_COMPLETA_MVP.md` líneas 1080-1171
- Usa variables CSS del sistema de temas (`bg-card`, `text-text`, etc.)
- Importaciones consistentes con el proyecto (`@types`, `@lib/utils`)
- Slug generation: `${building.slug}-${unit.id}` o `unit.id` como fallback
- Imagen: Primera imagen de `building.gallery` o `building.coverImage`
- Estado: Determinado desde `unit.status` o `unit.disponible`
- Navegación: Si hay `onClick`, no se envuelve en Link; si no, se envuelve en Link
- TypeScript estricto (sin `any`)
- Sin errores de lint
- Build exitoso

**Contexto relevante:**
- Componente base crítico para todo el MVP
- Listo para usar en grids de resultados, carousels y secciones de unidades similares
- Sigue todos los criterios de aceptación de la especificación
- Próximo paso: Integrar en páginas existentes o continuar con Microtarea 1.2

**Dependencias afectadas:**
- Ninguna (componente nuevo, no rompe código existente)
- Puede ser usado por: `components/lists/ResultsGrid.tsx`, páginas de home, property page

---

### 2025-01-XX - Extensión Completa del Sprint 1

**Descripción:** Sprint 1 extendido con detalle completo, listo para iniciar implementación inmediatamente

**Archivos modificados:**
- `docs/PLAN_SPRINTS_MVP.md`
  - Microtarea 1.1 (UnitCard): 10 sub-tareas detalladas con archivos exactos
  - Microtarea 1.2 (StickySearchBar): 9 sub-tareas detalladas con implementación completa
  - Microtarea 1.3 (Tipografía): 6 sub-tareas para tracking-tight y tabular-nums
  - Criterios de aceptación detallados para cada microtarea
  - Archivos exactos a crear/modificar especificados
  - Dependencias y notas importantes documentadas
  - Checklist de progreso por microtarea agregado

**Notas importantes:**
- Sprint 1 está completamente extendido y listo para comenzar
- Cada microtarea tiene sub-tareas específicas y archivos exactos
- Código de referencia incluido para cada componente
- Orden de ejecución: 1.1 → 1.2 → 1.3 (1.3 puede hacerse en paralelo)

**Contexto relevante:**
- Microtarea 1.1 es crítica y base para todo (UnitCard)
- Microtarea 1.2 es independiente (StickySearchBar)
- Microtarea 1.3 puede hacerse en paralelo o después
- Todas las microtareas tienen estimación de tiempo (1 + 1 + 0.5 sesiones)
- Próximo paso: Iniciar Microtarea 1.1 (UnitCard)

**Archivos a crear en próximas sesiones:**
- `components/ui/UnitCard.tsx`
- `components/ui/UnitCardSkeleton.tsx`
- `components/marketing/StickySearchBar.tsx`
- `tests/unit/components/UnitCard.test.tsx`
- `tests/unit/components/StickySearchBar.test.tsx`

---

### 2025-01-XX - Aprobación de Especificación Completa del MVP

**Descripción:** Especificación completa del MVP aprobada y lista para implementación

**Archivos modificados:**
- `docs/ESPECIFICACION_COMPLETA_MVP.md`
  - Estado actualizado de "EN REVISIÓN" a "Aprobada"
  - Actualizada sección de instrucciones para reflejar estado aprobado
  - Actualizado próximo paso a "Extender Sprint 1 y comenzar implementación"

**Notas importantes:**
- La especificación está completa y aprobada
- Todos los requisitos están documentados
- Design System v2.0 integrado
- Listo para comenzar implementación

**Contexto relevante:**
- Especificación incluye todas las páginas, componentes, APIs, modelos
- Plan de sprints ya creado y listo para extender
- Sistema de tracking configurado para seguir progreso
- Próximo paso: Extender Sprint 1 con más detalle antes de iniciar

---

### 2025-01-XX - Configuración de Sistema de Tracking

**Descripción:** Configuración inicial del sistema de tracking y extensión de sprints

**Archivos modificados:**
- `docs/ESPECIFICACION_COMPLETA_MVP.md`
  - Agregada sección "Estado de Implementación"
  - Tablas de tracking para páginas, componentes, APIs, modelos
  - Actualizado índice con referencia a estado de implementación
  
- `docs/PLAN_SPRINTS_MVP.md`
  - Agregadas secciones "EXTENSIÓN DEL SPRINT" antes de cada sprint
  - Mejorado checklist de progreso con estados y contadores
  - Agregado proceso de trabajo detallado
  - Instrucciones para actualizar ambos documentos en paralelo

**Notas importantes:**
- Ambos documentos deben actualizarse en paralelo al completar tareas
- Cada sprint debe ser extendido antes de iniciar
- El estado de implementación se actualiza en `ESPECIFICACION_COMPLETA_MVP.md`

**Contexto relevante:**
- Sistema de tracking configurado para mantener sincronización entre documentos
- Metodología: 1 chat = 1 microtarea
- Antes de iniciar cada sprint, debe ser extendido con más detalle

---

### 2025-01-XX - Agregado Design System v2.0

**Descripción:** Integración del Elkis UI/UX System v2.0 en la especificación

**Archivos modificados:**
- `docs/ESPECIFICACION_COMPLETA_MVP.md`
  - Reemplazada sección genérica de Design System con versión aplicada v2.0
  - Agregados principios de fusión (Airbnb + Elkis)
  - Definida paleta semántica con Brand Violet (#8B6CFF) y Brand Aqua (#00E6B3)
  - Incluidos componentes críticos: Unit Card, Sticky Search Bar, Property Page
  - Agregado código de referencia completo
  - Actualizada tipografía con tracking-tight y tabular-nums

**Notas importantes:**
- Design System v2.0 es la base para todos los componentes
- Brand Violet para CTAs principales, Brand Aqua para destaques
- rounded-2xl (20px) es el estándar del proyecto
- Efecto glass para elementos flotantes

**Contexto relevante:**
- Todos los componentes deben seguir el Design System v2.0
- Código de referencia disponible en la especificación
- Componentes base necesitan actualización según v2.0

---

### 2025-01-XX - Creación de Plan de Sprints MVP

**Descripción:** Creación del plan de implementación del MVP

**Archivos creados:**
- `docs/PLAN_SPRINTS_MVP.md`
  - 8 sprints organizados por prioridad
  - 25 microtareas específicas
  - Criterios de aceptación claros
  - Dependencias y orden de ejecución

**Archivos modificados:**
- `docs/ESPECIFICACION_COMPLETA_MVP.md`
  - Actualizado estado a "COMPLETO Y LISTO PARA IMPLEMENTACIÓN"

**Notas importantes:**
- Orden de ejecución: Sprint 1 → 2 → 4 → 5 → 3/6/7 → 8
- Sprint 1 es crítico (base para todo)
- Cada microtarea es abordable en una sesión

**Contexto relevante:**
- Plan basado en `ESPECIFICACION_COMPLETA_MVP.md`
- Metodología: 1 chat = 1 microtarea
- Antes de iniciar cada sprint, debe ser extendido

---

### 2025-01-XX - Restauración de Especificación Completa

**Descripción:** Recuperación y restauración del archivo de especificación completa

**Archivos modificados:**
- `docs/ESPECIFICACION_COMPLETA_MVP.md`
  - Archivo recuperado del historial de git (commit 872e8059)
  - 2344 líneas de especificación completa

**Notas importantes:**
- Archivo se había perdido en un reset anterior
- Restaurado desde commit más reciente con el contenido
- Contenido completo del MVP documentado

**Contexto relevante:**
- Especificación completa incluye todas las páginas, componentes, APIs, modelos
- Basada en Assetplan para property page
- Incluye estrategia SEO completa

---

## 🔍 ARCHIVOS CRÍTICOS A REVISAR

### Antes de Modificar Cualquier Componente:

1. **Design System:**
   - `docs/ESPECIFICACION_COMPLETA_MVP.md` - Sección "Elkis UI/UX System v2.0"
   - `tailwind.config.ts` - Configuración de colores y temas
   - `app/globals.css` - Variables CSS del sistema de temas

2. **Componentes Base:**
   - `components/ui/` - Componentes base del sistema
   - Verificar si existe antes de crear nuevo componente

3. **APIs:**
   - `app/api/buildings/` - Endpoints de edificios/unidades
   - Verificar estructura actual antes de modificar

4. **Modelos:**
   - `lib/types/` o similar - Interfaces TypeScript
   - Verificar estructura actual de `Unit`, `Building`, `SearchFilters`

### Antes de Modificar Páginas:

1. **Rutas:**
   - `app/page.tsx` - Home
   - `app/buscar/page.tsx` - Resultados
   - `app/(catalog)/property/[slug]/` - Property page
   - Verificar estructura actual antes de modificar

2. **Especificación:**
   - `docs/ESPECIFICACION_COMPLETA_MVP.md` - Ver estructura esperada
   - `docs/PLAN_SPRINTS_MVP.md` - Ver microtareas relacionadas

---

## ⚠️ ADVERTENCIAS Y CONSIDERACIONES

### Proceso de Validación

**Antes de marcar cualquier microtarea como completada:**
1. Ejecutar checklist de validación completo (ver `PLAN_SPRINTS_MVP.md`)
2. Ejecutar smoke test rápido
3. Verificar que no se rompió código existente
4. Solo entonces marcar como completada

### Proceso de Rollback

**Si algo se rompe después de completar una tarea:**
1. Revisar este log para identificar último cambio
2. Seguir proceso de rollback en `PLAN_SPRINTS_MVP.md`
3. Documentar el rollback en este archivo
4. Re-evaluar la microtarea

### Reglas del Proyecto (según `.cursor/rules/`):

1. **TypeScript estricto:** Prohibido usar `any`
2. **Server Components por defecto:** Usar "use client" solo si hay estado/efectos
3. **A11y:** Focus visible, labels, roles/aria, targets ≥44px
4. **Performance:** next/image, metadatos/OG, revalidate sensato
5. **UI:** Tailwind, dark theme, rounded-2xl, focus-ring
6. **Animaciones:** Respetar prefers-reduced-motion

### Convenciones de Código:

- **Commits:** Conventional Commits (feat:, fix:, docs:, etc.)
- **Componentes:** Props tipadas, manejo de estados de carga/error
- **APIs:** Zod server-side + rate-limit 20/60s/IP + logs sin PII
- **Tests:** Agregar tests básicos para componentes nuevos

### Dependencias Críticas:

- **Sprint 1** debe completarse antes de Sprint 2, 3, 4
- **Sprint 2** debe completarse antes de Sprint 3
- **Sprint 4** debe completarse antes de Sprint 5
- **Sprint 6** puede ejecutarse en paralelo
- **Sprint 7** requiere que páginas estén implementadas
- **Sprint 8** requiere todos los sprints anteriores

---

## 📌 PRÓXIMOS PASOS

### Inmediato:

1. **Extender Sprint 1** con más detalle antes de iniciar
2. **Revisar código existente** de componentes relacionados
3. **Verificar dependencias** antes de comenzar

### Corto Plazo:

1. Iniciar Sprint 1: Fundación y Design System
2. Implementar UnitCard según v2.0
3. Implementar StickySearchBar con efecto glass

### Mediano Plazo:

1. Completar Sprint 1
2. Extender y comenzar Sprint 2
3. Implementar página Home completa

---

## 🔗 REFERENCIAS RÁPIDAS

- **Especificación completa:** `docs/ESPECIFICACION_COMPLETA_MVP.md`
- **Plan de sprints:** `docs/PLAN_SPRINTS_MVP.md`
- **Estado de implementación:** `docs/ESPECIFICACION_COMPLETA_MVP.md#-estado-de-implementación`
- **Design System v2.0:** `docs/ESPECIFICACION_COMPLETA_MVP.md#-elkis-uiux-system-v20-tech-first-adaptation`
- **Checklist de validación:** `docs/PLAN_SPRINTS_MVP.md#-checklist-de-validación-antes-de-marcar-completada`
- **Proceso de rollback:** `docs/PLAN_SPRINTS_MVP.md#-proceso-de-rollback`
- **Proceso de commits:** `docs/PLAN_SPRINTS_MVP.md#-proceso-de-commits`
- **Reglas del proyecto:** `.cursor/rules/`

---

## 📝 PLANTILLA PARA NUEVAS ENTRADAS

Al agregar una nueva entrada al log, usar este formato:

```markdown
### YYYY-MM-DD - [Título del Cambio]

**Descripción:** [Descripción breve del cambio]

**Archivos modificados:**
- `ruta/archivo.tsx`
  - [Cambio específico 1]
  - [Cambio específico 2]
  
- `ruta/archivo2.ts`
  - [Cambio específico]

**Archivos creados:**
- `ruta/nuevo-archivo.tsx` - [Descripción]

**Archivos eliminados:**
- `ruta/archivo-antiguo.tsx` - [Razón]

**Notas importantes:**
- [Nota 1]
- [Nota 2]

**Contexto relevante:**
- [Contexto 1]
- [Contexto 2]

**Dependencias afectadas:**
- [Componente/API que depende de esto]
- [Componente/API que afecta esto]
```

---

**📅 Última actualización:** Enero 2025  
**🔄 Próxima revisión:** Antes de iniciar cualquier nueva tarea
