# Historia del Cliente - MVP

**Documento:** User Journey y flujo del usuario para el MVP  
**Fecha:** Enero 2025  
**Versión:** MVP 1.0

---

## 👤 Persona

**Usuario objetivo:** Persona buscando arrendar una propiedad en Chile, específicamente en la Región Metropolitana.

**Características:**
- Busca propiedades de arriendo sin comisión de corretaje
- Tiene criterios específicos: ubicación, precio, tamaño (dormitorios, baños)
- Quiere agendar visitas para conocer las propiedades
- Prefiere un proceso simple y directo

**Necesidades:**
- Encontrar propiedades que cumplan sus criterios
- Ver información detallada de cada propiedad
- Agendar visitas de forma sencilla
- Proceso sin fricciones

---

## 🎯 Objetivo

El usuario quiere **encontrar y visitar propiedades de arriendo** que se ajusten a sus necesidades, sin pagar comisión de corretaje.

**Objetivo del negocio:** Convertir búsquedas en visitas agendadas.

---

## 🗺️ Flujo de Navegación

### Paso 1: Llegada al Home (`/`)

**Acción del usuario:**
- Llega a la página principal
- Ve un formulario de búsqueda prominente

**Elementos en pantalla:**
- Hero section con mensaje claro
- Formulario de búsqueda con campos:
  - Búsqueda por texto (dirección, comuna, nombre de edificio)
  - Filtro por comuna
  - Rango de precio (mínimo y máximo)
  - Cantidad de dormitorios
  - Cantidad de baños
- Botón "Buscar" que redirige a resultados

**Punto de conversión:** Usuario completa el formulario y hace clic en "Buscar"

---

### Paso 2: Página de Resultados (`/buscar`)

**Acción del usuario:**
- Ve los resultados de su búsqueda
- Puede ajustar filtros sin volver al home
- Navega por las propiedades encontradas

**Elementos en pantalla:**
- Header con:
  - Término de búsqueda actual
  - Cantidad de resultados encontrados (ej: "24 propiedades encontradas")
- Barra de filtros (sticky o sidebar):
  - Mismos filtros del home, pero con valores prellenados
  - Filtros activos visibles como chips
  - Botón para limpiar filtros
  - Selector de ordenamiento (precio, ubicación, etc.)
- Grid de resultados:
  - Cards de propiedades con imagen, nombre, ubicación, precio desde
  - Cada card es clickeable y lleva a la página de detalle
- Estado vacío si no hay resultados:
  - Mensaje claro
  - Sugerencia para ajustar filtros

**Punto de conversión:** Usuario hace clic en una propiedad que le interesa

**Barreras potenciales:**
- Demasiados resultados sin forma de filtrar más
- Pocos resultados sin sugerencias
- Filtros confusos o difíciles de usar

---

### Paso 3: Página de Propiedad (`/property/[slug]`)

**Acción del usuario:**
- Ve detalles completos de la propiedad
- Revisa imágenes, características, unidades disponibles
- Decide si quiere agendar una visita

**Elementos en pantalla:**
- Galería de imágenes (carousel o grid)
- Información principal:
  - Nombre del edificio
  - Dirección completa
  - Comuna
  - Precio desde
- Características:
  - Amenidades del edificio
  - Tipologías disponibles (dormitorios/baños)
  - Precios por tipología
  - Disponibilidad
- CTA principal: "Agendar Visita"
- Propiedades relacionadas (opcional, al final)

**Punto de conversión:** Usuario hace clic en "Agendar Visita"

**Barreras potenciales:**
- Información incompleta o poco clara
- Imágenes de baja calidad
- Proceso de agendamiento no visible o confuso

---

### Paso 4: Agendamiento de Visita

**Acción del usuario:**
- Abre modal/scheduler desde la página de propiedad
- Selecciona fecha y hora disponible
- Completa formulario de contacto
- Confirma la visita

**Elementos en pantalla:**
- Modal o sección expandida con:
  - Nombre de la propiedad (contexto)
  - Calendario con fechas disponibles
  - Horarios disponibles por fecha
  - Formulario de contacto:
    - Nombre (requerido)
    - Email (requerido)
    - Teléfono (requerido)
  - Botón "Confirmar Visita"
- Confirmación después del envío:
  - Mensaje de éxito
  - Detalles de la visita agendada
  - Información de contacto del agente (opcional)
  - Opción para agregar al calendario

**Punto de conversión:** Usuario completa y confirma la visita

**Barreras potenciales:**
- Pocas fechas/horarios disponibles
- Formulario muy largo
- Falta de confirmación clara
- No hay opción de cancelar o modificar

---

## 📄 Páginas Involucradas

| Página | Ruta | Propósito | Estado |
|--------|------|-----------|--------|
| Home | `/` | Formulario de búsqueda inicial | MVP |
| Resultados | `/buscar` | Lista de propiedades filtradas | MVP |
| Propiedad | `/property/[slug]` | Detalle de propiedad individual | MVP |
| Agendamiento | Modal en `/property/[slug]` | Formulario de agendamiento | MVP |

---

## 🎯 Puntos de Conversión

1. **Home → Resultados:** Usuario completa búsqueda y ve resultados
   - Métrica: % de usuarios que hacen una búsqueda
   
2. **Resultados → Propiedad:** Usuario hace clic en una propiedad
   - Métrica: Click-through rate (CTR) de resultados
   
3. **Propiedad → Agendamiento:** Usuario abre el scheduler
   - Métrica: % de usuarios que intentan agendar
   
4. **Agendamiento → Confirmación:** Usuario completa y confirma visita
   - Métrica: Tasa de conversión final (visitas agendadas / visitas a propiedad)

---

## 🚧 Barreras y Fricciones

### Barreras Técnicas
- **Carga lenta:** Resultados que tardan mucho en cargar
- **Errores:** Errores 404 o 500 en páginas clave
- **Responsive:** Experiencia pobre en móvil

### Barreras de UX
- **Filtros confusos:** Usuario no entiende cómo usar los filtros
- **Información faltante:** Propiedades sin información completa
- **Proceso largo:** Demasiados pasos para agendar una visita

### Barreras de Contenido
- **Pocos resultados:** Búsqueda no retorna resultados relevantes
- **Información desactualizada:** Precios o disponibilidad incorrectos
- **Imágenes faltantes:** Propiedades sin fotos

---

## ✅ Criterios de Éxito

### Para el Usuario
- Puede encontrar propiedades relevantes en menos de 3 búsquedas
- Puede agendar una visita en menos de 5 minutos desde que encuentra la propiedad
- Proceso claro y sin errores

### Para el Negocio
- Tasa de conversión Home → Resultados > 60%
- Tasa de conversión Propiedad → Agendamiento > 20%
- Tasa de conversión final (Agendamiento completado) > 10%

---

## 🔄 Flujo Alternativo: Búsqueda Directa

Si el usuario llega directamente a `/property/[slug]` (por ejemplo, desde un link compartido):

1. Ve la página de propiedad directamente
2. Puede hacer clic en "Ver más propiedades" que lo lleva a `/buscar` sin filtros
3. O puede usar el botón "Volver" para ir al home

---

## 📊 Métricas Clave a Monitorear

1. **Tasa de búsqueda:** Usuarios que hacen al menos una búsqueda
2. **Resultados por búsqueda:** Promedio de resultados mostrados
3. **Tiempo en resultados:** Tiempo promedio antes de hacer clic
4. **Tasa de clic en propiedad:** % de resultados que reciben clic
5. **Tasa de apertura de scheduler:** % de propiedades que abren el scheduler
6. **Tasa de completitud:** % de schedulers que se completan
7. **Tiempo de completitud:** Tiempo promedio para completar agendamiento

---

**Última actualización:** Enero 2025
