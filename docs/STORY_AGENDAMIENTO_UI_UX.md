# Story de Agendamiento – Análisis UI/UX

> Referencia: flujo tipo QuintoAndar (imágenes de referencia) y reglas [ui-builder.md](../app/agents/ui-builder.md).

---

## 1. Objetivo del flujo

Permitir al usuario **agendar una visita** a una propiedad en pasos claros: elegir fecha/hora, identificar contacto (nombre, celular, RUT), responder 3 preguntas de calificación y confirmar.

---

## 2. Pasos del story (orden)

| Paso | Nombre | Contenido | CTA |
|------|--------|-----------|-----|
| 1 | **Selección** | Card propiedad + “¿Cuándo quieres visitar?” + Elige día + Elige horario | Continuar |
| 2 | **Datos de contacto** | Nombre, celular, RUT (formulario único) | Continuar |
| 3 | **Calificación** | 3 preguntas deslizables (una a la vez) | Continuar |
| 4 | **Éxito** | Confirmación + detalles visita + opciones (calendario, WhatsApp) | Cerrar |

---

## 3. Detalle por paso

### Paso 1 – Selección de fecha y hora

- **Header:** Título “¿Cuándo quieres visitar esta propiedad?” + botón cerrar.
- **Card propiedad:** Imagen (50%) + datos (50%): unidad, tipología, dirección, comuna, arriendo, gastos comunes, m² · dormitorios · estacionamiento (grid simétrico).
- **Elige un día:** Fila horizontal de botones circulares (días), scroll horizontal en móvil.
- **Elige un horario:** Fila horizontal de botones (horas), scroll horizontal.
- **CTA:** “Continuar” (habilitado solo con día y hora elegidos).
- Sin preguntas de calificación en este paso (se pasan al paso 3).

### Paso 2 – Datos de contacto

- **Título:** “Datos de contacto” / “Completa tus datos para confirmar la visita”.
- **Campos (formulario único):**
  - Nombre completo (requerido).
  - Celular (requerido, formato chileno).
  - RUT (requerido, formato chileno 7-8 dígitos + guión + dígito verificador).
- **Validación:** En tiempo real; mensajes de error por campo; botón “Continuar” habilitado solo cuando todo es válido.
- **Accesibilidad:** Labels asociados, `aria-invalid`, `aria-describedby` para errores.

### Paso 3 – Preguntas deslizables (calificación)

- **Formato:** Una pregunta a la vez; avance “deslizable” (siguiente/anterior o gestos).
- **Preguntas (orden fijo):**
  1. “Entre tú y tu aval, ¿tienen una renta superior a [Arriendo × 3]?” (Sí / No).
  2. “¿Te mudas en los próximos 30 días?” (Sí / No).
  3. “¿Tienes reporte negativo en Dicom?” (Sí / No).
- **UI:** Título de la pregunta + botones Sí/No (o chips); indicador de progreso (ej. 1/3, 2/3, 3/3); opción “Saltar” o “Continuar” cuando todas estén respondidas.
- **Persistencia:** Respuestas guardadas en estado (y opcionalmente en `localStorage`) para no perder al cerrar.

### Paso 4 – Éxito

- Mensaje de confirmación.
- Resumen: fecha, hora, propiedad.
- Acciones: agregar al calendario, contacto WhatsApp (si aplica), cerrar.

---

## 4. Modal pantalla completa

- **Comportamiento:** El modal de agendamiento ocupa **toda la pantalla** (fixed inset-0, sin max-width, sin bordes redondeados que limiten el área útil).
- **Ventajas:** Más espacio para card de propiedad, formularios y preguntas; mejor uso en móvil; sensación de “flujo dedicado”.
- **Implementación:** Contenedor principal con `fixed inset-0 w-full h-full`, contenido con scroll interno donde haga falta; botón cerrar siempre visible (ej. header fijo).

---

## 5. Criterios de calidad (UI Builder)

- **Estados:** Loading (disponibilidad), Empty (sin slots), Error (reintentar), Success (confirmación).
- **Responsive:** Mobile-first; touch targets ≥ 44px; espaciado `space-y` / `gap` consistente.
- **Accesibilidad:** Focus trap en modal, Escape cierra, labels en inputs, `prefers-reduced-motion` respetado.
- **Contrato:** Props y tipos definidos; validación Zod en formularios (nombre, celular, RUT).

---

## 6. Referencias de diseño

- Imagen 1: Paso “Quando você quer visitar?” (fecha/hora) – QuintoAndar.
- Imagen 2: Paso “Podemos solicitar esta visita?” (resumen + login) – QuintoAndar.
- Proyecto: `components/flow/QuintoAndarVisitScheduler.tsx`, `lib/validations/visit.ts`, `app/agents/ui-builder.md`.
