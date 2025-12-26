# Estructura Pública de la Aplicación

**Documento:** Estructura de rutas, APIs y recursos accesibles públicamente (sin autenticación)  
**Fecha:** Enero 2025

---

## 🌐 Rutas Públicas (Páginas)

### **Landing Principal**
- **`/`** - Página home (redirige según feature flags)
  - Si `comingSoon: true` → redirige a `/coming-soon`
  - Si `comingSoon: false` → muestra landing real con edificios

### **Landing Marketing**
- **`/arrienda-sin-comision`** - Landing principal de arriendo sin comisión
  - Hero section
  - Grid de edificios destacados
  - Secciones: Benefits, How It Works, Trust
  - CTA sticky mobile

- **`/arrienda-sin-comision/[slug]`** - Página de propiedad individual
  - Metadata dinámica por propiedad
  - Página de unidad: `/arrienda-sin-comision/[slug]/unidad/[tipologia]`

- **`/arrienda-sin-comision/property/[slug]`** - Página alternativa de propiedad

### **Catálogo de Propiedades**
- **`/property/[slug]`** - Página de propiedad individual (catalog group)
  - Vista detallada de edificio
  - Galería de imágenes
  - Información de unidades
  - Sistema de cotización
  - Agendamiento de visitas

### **Marketing**
- **`/flash-videos`** - Landing de videos flash
  - Ofertas especiales
  - Videos destacados

- **`/landing-v2`** - Landing versión 2
  - Hero mejorado
  - Grid con filtros

### **Coming Soon**
- **`/coming-soon`** - Página de "próximamente"
  - Accesible directamente
  - Layout independiente
  - Metadata específica

### **Cotizador**
- **`/cotizador`** - Sistema de cotización
  - Layout dedicado
  - Cálculo de costos
  - Comparación de opciones

### **Agendamiento**
- **`/agendamiento`** - Página de agendamiento de visitas
- **`/agendamiento-mejorado`** - Versión mejorada del agendamiento

### **Legacy**
- **`/propiedad/[id]`** - Página de propiedad (legacy, por ID numérico)

---

## 🔌 Endpoints de API Públicos

Todos los endpoints públicos incluyen:
- ✅ **Rate Limiting:** 20 requests/minuto (10 para booking/visits)
- ✅ **Validación Zod:** Validación server-side de inputs
- ✅ **Logging:** Logs sin PII (Personally Identifiable Information)
- ✅ **Error Handling:** Respuestas estructuradas (400/429/500)

### **Buildings (Edificios)**

#### `GET /api/buildings`
Lista de edificios con paginación.

**Query Params:**
- `page` (opcional, default: 1)
- `limit` (opcional, default: 12)

**Response:**
```json
{
  "buildings": [...],
  "total": 50,
  "hasMore": true,
  "page": 1,
  "limit": 12
}
```

**Rate Limit:** 20 req/min

---

#### `GET /api/buildings/[slug]`
Obtener edificio por slug.

**Response:**
```json
{
  "building": { ... }
}
```

**Rate Limit:** 20 req/min

---

#### `GET /api/buildings/paginated`
Edificios paginados (alternativa).

**Rate Limit:** 20 req/min

---

### **Availability (Disponibilidad)**

#### `GET /api/availability`
Consultar disponibilidad de unidades para visitas.

**Query Params:**
- `listingId` (requerido)
- `start` (RFC 3339, requerido)
- `end` (RFC 3339, requerido)

**Validaciones:**
- Formato RFC 3339 para fechas
- `start < end`
- Máximo 5 días de consulta

**Response:**
```json
{
  "listingId": "home-amengual",
  "timezone": "America/Santiago",
  "slots": [
    {
      "id": "slot_...",
      "listingId": "home-amengual",
      "startTime": "2025-01-20T09:00:00-03:00",
      "endTime": "2025-01-20T09:30:00-03:00",
      "status": "open",
      "source": "system",
      "createdAt": "..."
    }
  ],
  "nextAvailableDate": "2025-01-25T09:00:00-03:00"
}
```

**Rate Limit:** 20 req/min

---

#### `GET /api/calendar/availability`
Disponibilidad de calendario (alternativa).

**Rate Limit:** 20 req/min

---

### **Visits (Visitas)**

#### `POST /api/visits`
Crear una visita agendada.

**Headers:**
- `Idempotency-Key` (requerido) - Clave de idempotencia

**Body:**
```json
{
  "listingId": "home-amengual",
  "slotId": "slot_...",
  "userId": "user_123",
  "channel": "web" | "whatsapp",
  "idempotencyKey": "key_123"
}
```

**Response:**
```json
{
  "visitId": "visit_...",
  "status": "confirmed",
  "agent": {
    "name": "María González",
    "phone": "+56912345678",
    "whatsappNumber": "+56912345678"
  },
  "slot": {
    "startTime": "2025-01-20T09:00:00-03:00",
    "endTime": "2025-01-20T09:30:00-03:00"
  },
  "confirmationMessage": "¡Perfecto! Tu visita ha sido confirmada..."
}
```

**Rate Limit:** 10 req/min

**Códigos de Error:**
- `400` - Datos inválidos
- `409` - Slot no disponible
- `429` - Rate limit exceeded
- `500` - Error interno

---

#### `GET /api/visits?userId=...`
Obtener visitas de un usuario.

**Query Params:**
- `userId` (requerido)

**Response:**
```json
{
  "upcoming": [...],
  "past": [...],
  "canceled": [...]
}
```

**Rate Limit:** 20 req/min

---

### **Booking (Reservas)**

#### `POST /api/booking`
Crear una reserva.

**Body:**
```json
{
  // Según BookingRequestSchema
}
```

**Response:**
```json
{
  "success": true,
  "bookingId": "bk_..."
}
```

**Rate Limit:** 10 req/min

---

### **Quotations (Cotizaciones)**

#### `POST /api/quotations`
Calcular cotización de una unidad.

**Body:**
```json
{
  "unitId": "unit_123",
  "startDate": "2025-02-01",
  "options": {
    // Opciones de cotización
  }
}
```

**Response:**
```json
{
  // Resultado de cotización
  "total": 500000,
  "breakdown": {...}
}
```

**Rate Limit:** 10 req/min

**Validaciones:**
- Unidad debe existir y estar disponible
- Validación con Zod (`QuotationInputSchema`)

---

### **Waitlist (Lista de Espera)**

#### `GET /api/waitlist`
Health check del endpoint.

**Response:**
```json
{
  "ok": true
}
```

---

#### `POST /api/waitlist`
Agregar email a lista de espera.

**Body:**
```json
{
  "email": "user@example.com",
  "phone": "+56912345678" (opcional),
  "name": "Juan Pérez" (opcional),
  "contactMethod": "whatsapp" | "email" (opcional),
  "source": "how-it-works" (opcional)
}
```

**Response:**
```json
{
  "success": true,
  "message": "¡Te agregamos a la lista de espera!"
}
```

**Rate Limit:** 20 req/min

**Códigos de Error:**
- `400` - Email inválido
- `429` - Rate limit exceeded
- `500` - Error del servidor

**Nota:** Si el email ya existe (duplicado), retorna `200` con mensaje "Ya estás en la lista de espera".

---

### **Landing**

#### `GET /api/landing/featured`
Edificios destacados para landing.

**Rate Limit:** 20 req/min

---

### **Flash Videos**

#### `GET /api/flash-videos/cupos`
Cupos disponibles para flash videos.

**Rate Limit:** 20 req/min

---

### **Arrienda Sin Comisión**

#### `GET /api/arrienda-sin-comision`
Datos para landing "arrienda sin comisión".

**Rate Limit:** 20 req/min

---

### **Analytics (Público - Solo Lectura)**

#### `GET /api/analytics/conversion`
Métricas de conversión (público).

**Rate Limit:** 20 req/min

---

#### `GET /api/analytics/performance`
Métricas de performance (público).

**Rate Limit:** 20 req/min

---

### **Debug (Solo Desarrollo)**

#### `GET /api/debug`
Endpoint de debug (solo en desarrollo).

**⚠️ No disponible en producción**

---

## 📁 Archivos Estáticos Públicos

### **Directorio `/public`**

#### **Imágenes**
- **`/images/edificio/`** - Imágenes de edificios (19 archivos JPG)
- **`/images/Imagenes/`** - Imágenes adicionales (19 JPG, 1 PNG, 1 SVG)
- **`/images/`** - Imágenes de landing:
  - `estacioncentral-cover.jpg`
  - `laflorida-cover.jpg`
  - `lascondes-*.jpg` (5 archivos)
  - `mirador-*.jpg` (4 archivos)
  - `nunoa-*.jpg` (4 archivos)
  - `flash-videos-og.jpg`
  - `flash-videos-twitter.jpg`

#### **Iconos**
- **`/icons/`** - 26 archivos SVG de iconos
- **`/images/metro/`** - Iconos de metro (PNG y SVG)

#### **SVGs Generales**
- `file.svg`
- `globe.svg`
- `next.svg`
- `vercel.svg`
- `window.svg`

#### **Manifiestos**
- `manifest.json` - Web App Manifest

#### **Service Workers**
- `sw.js` - Service Worker (PWA)

#### **Archivos de Prueba**
- `test-207.html`
- `unit-207-static.html`
- `simple-server.js`

**Total:** ~86 archivos estáticos

---

## 🔍 SEO Público

### **Robots.txt**
**Ruta:** `/robots.txt` (generado desde `app/robots.ts`)

**Comportamiento:**
- Si `comingSoon: true` → `Disallow: /` (bloquea todo)
- Si `comingSoon: false` → `Allow: /` (permite todo)

**Ejemplo:**
```
User-agent: *
Allow: /
```

---

### **Sitemap.xml**
**Ruta:** `/sitemap.xml` (generado desde `app/sitemap.ts`)

**Contenido:**
- Página principal: `/`
- Páginas de propiedades: `/property/[slug]` (una por cada edificio)

**Ejemplo:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset>
  <url>
    <loc>https://tudominio.com/</loc>
    <lastmod>2025-01-15</lastmod>
  </url>
  <url>
    <loc>https://tudominio.com/property/home-amengual</loc>
    <lastmod>2025-01-15</lastmod>
  </url>
  ...
</urlset>
```

---

## 🔒 Seguridad y Rate Limiting

### **Rate Limits por Endpoint**

| Endpoint | Límite | Ventana |
|----------|--------|---------|
| `GET /api/buildings/*` | 20 req | 60 seg |
| `GET /api/availability` | 20 req | 60 seg |
| `POST /api/visits` | 10 req | 60 seg |
| `POST /api/booking` | 10 req | 60 seg |
| `POST /api/quotations` | 10 req | 60 seg |
| `POST /api/waitlist` | 20 req | 60 seg |
| Otros endpoints públicos | 20 req | 60 seg |

### **Headers de Rate Limiting**

Cuando se excede el límite, la respuesta incluye:
```http
HTTP/1.1 429 Too Many Requests
Retry-After: 60
X-RateLimit-Limit: 20
X-RateLimit-Window: 60
```

### **Detección de IP**

El sistema detecta la IP desde:
1. `x-forwarded-for` (header de proxy)
2. `x-real-ip` (header alternativo)
3. Fallback: `unknown`

---

## 📊 Validación y Schemas

### **Validación con Zod**

Todos los endpoints públicos validan inputs con schemas Zod:

- **`WaitlistRequestSchema`** - Para `/api/waitlist`
- **`BookingRequestSchema`** - Para `/api/booking`
- **`QuotationInputSchema`** - Para `/api/quotations`
- **`createVisitSchema`** - Para `/api/visits`
- **`availabilityQuerySchema`** - Para `/api/availability`

### **Respuestas de Error**

Formato estándar:
```json
{
  "error": "Mensaje de error",
  "details": [...] // Opcional, detalles de validación
}
```

**Códigos HTTP:**
- `200` - Éxito
- `201` - Creado
- `400` - Bad Request (validación fallida)
- `404` - Not Found
- `409` - Conflict (recurso no disponible)
- `429` - Too Many Requests (rate limit)
- `500` - Internal Server Error

---

## 🎯 Endpoints NO Públicos (Requieren Autenticación)

Los siguientes endpoints **NO** son públicos y requieren autenticación admin:

- `/api/admin/*` - Todos los endpoints admin
- `/api/flags/override` - Override de feature flags
- `/api/debug-admin` - Debug admin

---

## 📝 Notas Importantes

1. **Idempotencia:** El endpoint `/api/visits` requiere header `Idempotency-Key` para prevenir duplicados.

2. **Mock Data:** Algunos endpoints usan mocks en desarrollo (availability, visits).

3. **Logging:** Todos los logs excluyen PII (emails, teléfonos, nombres completos).

4. **CORS:** Los endpoints públicos deberían permitir CORS desde el dominio del sitio.

5. **Feature Flags:** El comportamiento de `/` y `/robots.txt` depende de `config/feature-flags.json`.

---

## 🔗 URLs Completas de Ejemplo

### **Páginas**
```
https://tudominio.com/
https://tudominio.com/arrienda-sin-comision
https://tudominio.com/property/home-amengual
https://tudominio.com/cotizador
https://tudominio.com/coming-soon
```

### **APIs**
```
https://tudominio.com/api/buildings
https://tudominio.com/api/buildings/home-amengual
https://tudominio.com/api/availability?listingId=home-amengual&start=2025-01-20T00:00:00-03:00&end=2025-01-25T00:00:00-03:00
https://tudominio.com/api/visits?userId=user_123
https://tudominio.com/api/waitlist
```

### **SEO**
```
https://tudominio.com/robots.txt
https://tudominio.com/sitemap.xml
```

### **Estáticos**
```
https://tudominio.com/images/edificio/original_*.jpg
https://tudominio.com/icons/*.svg
https://tudominio.com/manifest.json
```

---

**Última actualización:** Enero 2025





