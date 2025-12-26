# Rutas MVP - Documentación

**Documento:** Rutas activas en el MVP  
**Fecha:** Enero 2025  
**Versión:** MVP 1.0

---

## 🌐 Rutas Activas del MVP

El MVP incluye **4 rutas principales**:

### 1. Home (`/`)

**Propósito:** Página de entrada con formulario de búsqueda

**Componentes:**
- Hero section
- Formulario de búsqueda con filtros básicos
- Redirige a `/buscar` con query params al enviar

**Query Params:** Ninguno (página de entrada)

**Estado:** ✅ Activa en MVP

---

### 2. Resultados de Búsqueda (`/buscar`)

**Propósito:** Muestra resultados de búsqueda con filtros aplicados

**Componentes:**
- Header con búsqueda actual y cantidad de resultados
- Barra de filtros (sticky o sidebar)
- Grid de resultados (`ResultsGrid`)
- Paginación (opcional)

**Query Params:**
- `q` - Término de búsqueda (texto libre)
- `comuna` - Filtro por comuna
- `precioMin` - Precio mínimo (número)
- `precioMax` - Precio máximo (número)
- `dormitorios` - Cantidad de dormitorios (número)
- `banos` - Cantidad de baños (número)
- `sort` - Ordenamiento (`precio-asc`, `precio-desc`, `ubicacion`, etc.)

**Ejemplo de URL:**
```
/buscar?q=las+condes&comuna=Las+Condes&precioMin=500000&precioMax=1000000&dormitorios=2&banos=1&sort=precio-asc
```

**Estado:** ✅ Activa en MVP

---

### 3. Página de Propiedad (`/property/[slug]`)

**Propósito:** Detalle completo de una propiedad individual

**Componentes:**
- Galería de imágenes
- Información del edificio
- Características y amenidades
- Unidades disponibles
- CTA para agendar visita (modal/scheduler)
- Propiedades relacionadas

**Parámetros de Ruta:**
- `slug` - Identificador único de la propiedad (ej: `home-amengual`)

**Query Params (opcionales):**
- `unit` - ID de unidad específica para destacar

**Ejemplo de URL:**
```
/property/home-amengual
/property/home-amengual?unit=unit-123
```

**Estado:** ✅ Activa en MVP

---

### 4. Agendamiento de Visita

**Propósito:** Formulario para agendar una visita a una propiedad

**Tipo:** Modal o sección expandida dentro de `/property/[slug]`

**Componentes:**
- Calendario con fechas disponibles
- Selector de horarios
- Formulario de contacto (nombre, email, teléfono)
- Confirmación de visita

**No es una ruta independiente:** Está integrado en la página de propiedad

**Estado:** ✅ Activo en MVP (integrado)

---

## 🚫 Rutas Deshabilitadas en MVP

Las siguientes rutas están **deshabilitadas** y retornan 404:

- `/coming-soon` → 404
- `/arrienda-sin-comision/*` → 404
- `/flash-videos` → 404
- `/landing-v2` → 404
- `/cotizador` → 404
- `/agendamiento` → 404 (el agendamiento está solo en `/property/[slug]`)
- `/agendamiento-mejorado` → 404
- `/propiedad/[id]` → 404 (ruta legacy)

---

## 📋 APIs Relacionadas

### APIs Activas

| Endpoint | Método | Propósito | Usado en |
|----------|--------|-----------|----------|
| `/api/buildings` | GET | Lista de edificios | `/buscar` |
| `/api/buildings/[slug]` | GET | Detalle de edificio | `/property/[slug]` |
| `/api/availability` | GET | Disponibilidad para visitas | Modal de agendamiento |
| `/api/visits` | POST | Crear visita agendada | Modal de agendamiento |

### APIs Deshabilitadas (Opcional)

- `/api/quotations` → Retornar 404 o mensaje "No disponible en MVP"
- `/api/waitlist` → Opcional mantener
- `/api/analytics/*` → Mantener pero no exponer en UI
- `/api/admin/*` → Mantener para uso interno, no documentar

---

## 🔄 Flujo de Navegación

```
Home (/)
  ↓ (búsqueda con filtros)
Resultados (/buscar?q=...&comuna=...)
  ↓ (click en propiedad)
Propiedad (/property/[slug])
  ↓ (click en "Agendar Visita")
Modal de Agendamiento (dentro de /property/[slug])
  ↓ (confirmación)
Confirmación de Visita
```

---

## 🔍 SEO y Metadata

### Home (`/`)
- Title: "Arrienda Sin Comisión - Encuentra tu hogar ideal"
- Description: "Descubre propiedades en arriendo sin comisión. Busca por ubicación, precio y características."
- Canonical: `/`

### Resultados (`/buscar`)
- Title: "Resultados de búsqueda - [Cantidad] propiedades encontradas"
- Description: Dinámico según filtros aplicados
- Canonical: `/buscar` (sin query params para evitar duplicados)

### Propiedad (`/property/[slug]`)
- Title: "[Nombre del Edificio] - 0% Comisión | Elkis Realtor"
- Description: Dinámico con información del edificio
- Canonical: `/property/[slug]`
- Open Graph: Imagen del edificio, precio, ubicación

---

## 📱 Responsive

Todas las rutas MVP deben ser:
- ✅ Responsive (mobile-first)
- ✅ Accesibles (A11y)
- ✅ Optimizadas para SEO
- ✅ Rápidas (performance)

---

## 🧪 Testing

### Rutas a Verificar

1. **Home (`/`)**
   - [ ] Formulario de búsqueda funciona
   - [ ] Redirige a `/buscar` con query params correctos
   - [ ] Responsive en móvil

2. **Resultados (`/buscar`)**
   - [ ] Muestra resultados según query params
   - [ ] Filtros actualizan URL sin recargar
   - [ ] Grid de resultados se renderiza correctamente
   - [ ] Estado vacío cuando no hay resultados
   - [ ] Responsive en móvil

3. **Propiedad (`/property/[slug]`)**
   - [ ] Carga información del edificio
   - [ ] Galería de imágenes funciona
   - [ ] Modal de agendamiento se abre correctamente
   - [ ] 404 si el slug no existe
   - [ ] Responsive en móvil

4. **Agendamiento (Modal)**
   - [ ] Calendario muestra fechas disponibles
   - [ ] Formulario valida inputs
   - [ ] Envío de visita funciona
   - [ ] Confirmación se muestra después del envío

---

## 🔗 Enlaces Internos

### Desde Home
- Todos los enlaces deben llevar a `/buscar` o `/property/[slug]`

### Desde Resultados
- Cards de propiedades → `/property/[slug]`
- "Ver todas" → `/buscar` (sin filtros)

### Desde Propiedad
- "Ver más propiedades" → `/buscar` (con filtros relacionados)
- Propiedades relacionadas → `/property/[slug]`

---

**Última actualización:** Enero 2025
