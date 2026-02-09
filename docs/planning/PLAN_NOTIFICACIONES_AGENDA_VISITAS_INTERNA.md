# Plan Maestro: Sistema de Notificaciones y Agenda de Visitas (Gestión Interna)

## 1) Diagnóstico del estado actual

1. El flujo de agendamiento existe en frontend y API pública, pero la creación de visitas está en modo mock/in-memory y no persiste en base de datos (`/Users/macbookpro/Documents/hommie-0-commission-next/app/api/visits/route.ts`).
2. El cálculo de disponibilidad por calendario existe, pero se apoya en bloques internos inyectados y componentes con datos de prueba (`/Users/macbookpro/Documents/hommie-0-commission-next/app/api/calendar/availability/route.ts`, `/Users/macbookpro/Documents/hommie-0-commission-next/components/calendar/CalendarVisitFlow.tsx`, `/Users/macbookpro/Documents/hommie-0-commission-next/components/calendar/WeekView.tsx`).
3. Hay captura de “notificar disponibilidad” y waitlist, pero no existe pipeline de envío transaccional ni motor de recordatorios (`/Users/macbookpro/Documents/hommie-0-commission-next/app/api/availability-notifications/route.ts`, `/Users/macbookpro/Documents/hommie-0-commission-next/app/api/waitlist/route.ts`).
4. El admin actual no incluye módulo operativo de agenda/visitas/notificaciones (`/Users/macbookpro/Documents/hommie-0-commission-next/app/admin/layout-client.tsx`).
5. El rate limiting actual es en memoria por instancia, insuficiente para producción distribuida (`/Users/macbookpro/Documents/hommie-0-commission-next/lib/rate-limit.ts`).

## 2) Objetivo del sistema

1. Operar agenda de visitas multi-agente en tiempo real sin dobles reservas.
2. Enviar notificaciones automáticas, auditables y reintentables por canal (WhatsApp, email, opcional SMS).
3. Entregar panel interno para coordinación diaria (confirmaciones, reasignaciones, no-show, reprogramaciones, bloqueos).
4. Medir punta a punta: creación, confirmación, asistencia, no-show, tiempos operativos y performance por agente.

## 3) Alcance funcional

1. Agenda interna semanal y diaria por agente, edificio y unidad.
2. Gestión de slots con buffers operativos y bloqueos manuales.
3. Ciclo completo de visita: pendiente, confirmada, en camino, check-in, completada, cancelada, no-show.
4. Motor de notificaciones con plantillas, reglas por evento y SLA de entrega.
5. Cola de tareas y reintentos con idempotencia.
6. Historial y auditoría de cambios en visita y notificaciones.

## 4) Arquitectura objetivo

1. Frontend público.
2. API pública de agendamiento (validación + idempotencia + reserva transaccional).
3. API/admin para operaciones internas (agenda, cambios de estado, reasignaciones, bloqueos).
4. Base de datos transaccional (Supabase/Postgres) con constraints de no solapamiento.
5. Outbox + workers para notificaciones y tareas programadas.
6. Integraciones externas: WhatsApp provider, Resend/email, Google Calendar/ICS.
7. Observabilidad: métricas, logs estructurados y alertas operativas.

## 5) Modelo de datos propuesto (núcleo)

1. `visit_slots`.
2. `visits`.
3. `visit_participants`.
4. `visit_status_history`.
5. `visit_internal_notes`.
6. `agent_availability_blocks`.
7. `agent_calendars`.
8. `notification_templates`.
9. `notification_rules`.
10. `notification_jobs`.
11. `notification_deliveries`.
12. `notification_preferences`.
13. `waitlist_subscriptions`.
14. `waitlist_matches`.
15. `domain_events` (outbox/event store liviano).
16. `admin_activity_log` (ya existe patrón y se reutiliza).

## 6) Reglas de negocio críticas

1. Un slot no puede tener más de una visita activa.
2. No se puede confirmar visita sobre bloqueos operativos o eventos busy externos.
3. Idempotencia obligatoria en creación/reprogramación/cancelación.
4. Reprogramación conserva trazabilidad (visit original + reason + actor).
5. Ventana de cancelación configurable (por ejemplo, hasta 2h antes).
6. Check-in manual o por agente con timestamp y evidencia opcional.
7. No-show automático si no hay check-in pasado N minutos del inicio.

## 7) Motor de notificaciones

1. Eventos gatillantes mínimos.
2. `visit.created`.
3. `visit.confirmed`.
4. `visit.reminder.t24h`.
5. `visit.reminder.t2h`.
6. `visit.reminder.t30m`.
7. `visit.rescheduled`.
8. `visit.canceled`.
9. `visit.no_show`.
10. `waitlist.matched`.

1. Canales.
2. WhatsApp como principal de recordatorio/confirmación.
3. Email como respaldo y documento formal.
4. SMS opcional para fallback crítico.
5. Notificación interna in-app para equipo.

1. Estrategia de entrega.
2. Cola `notification_jobs` con estados `pending`, `processing`, `sent`, `failed`, `dead_letter`.
3. Retry exponencial con jitter y tope de intentos.
4. Deduplicación por `dedupe_key` por evento + canal + destinatario.
5. Registro de respuesta proveedor para auditoría.

## 8) Agenda interna (operación)

1. Vista Día para “torre de control” (hoy, próximos 120 min, incidencias).
2. Vista Semana por agente y edificio.
3. Bandejas operativas.
4. “Por confirmar”.
5. “Riesgo de no-show”.
6. “Reprogramaciones”.
7. “Sin contacto”.
8. Acciones rápidas.
9. Confirmar asistencia.
10. Reasignar agente.
11. Bloquear franja.
12. Reprogramar masivo por contingencia.
13. Registrar resultado de visita.

## 9) APIs propuestas

1. Público.
2. `POST /api/visits` crear visita transaccional real.
3. `GET /api/visits?userId=` visitas del usuario.
4. `POST /api/visits/:id/cancel` cancelación usuario.
5. `POST /api/visits/:id/reschedule` reprogramación usuario.

1. Admin.
2. `GET /api/admin/visits` listado con filtros.
3. `GET /api/admin/visits/:id` detalle.
4. `PATCH /api/admin/visits/:id/status` transición operativa.
5. `POST /api/admin/visits/:id/reassign` cambio de agente.
6. `POST /api/admin/agenda/blocks` crear bloqueo.
7. `DELETE /api/admin/agenda/blocks/:id` eliminar bloqueo.
8. `GET /api/admin/notifications/jobs` monitoreo envíos.
9. `POST /api/admin/notifications/retry/:jobId` reintento manual.

## 10) Seguridad, cumplimiento y resiliencia

1. RLS por rol y dominio de datos (cliente solo sus visitas; admin por scope).
2. PII cifrada en tránsito y minimizada en logs.
3. Secretos de proveedores solo server-side.
4. Rate limit distribuido (Redis/Upstash o equivalente) para endpoints sensibles.
5. Auditoría de toda acción interna relevante.
6. Tolerancia a fallos de proveedor con fallback de canal.

## 11) Observabilidad y KPIs

1. KPIs de negocio.
2. Conversión a visita confirmada.
3. Show rate.
4. No-show rate.
5. Reprogramación rate.

1. KPIs operativos.
2. Tiempo medio de confirmación.
3. Latencia de envío por canal.
4. Tasa de entrega y fallo por plantilla/canal.
5. Backlog de jobs pendientes.

1. Alertas mínimas.
2. Cola atascada > X minutos.
3. Fallas de envío > Y% en ventana de 15 minutos.
4. Picos de conflicto de slots.

## 12) Plan de implementación por fases

## Fase 0 (3-5 días): Diseño y contratos

1. Definir modelo de estados oficial de visita.
2. Cerrar contrato de APIs públicas y admin.
3. Diseñar tablas y constraints SQL.
4. Definir catálogo de plantillas y SLAs de notificación.

## Fase 1 (1-2 semanas): Core transaccional de visitas

1. Migrar `POST /api/visits` a persistencia real en Supabase.
2. Implementar lock transaccional y antisolapamiento.
3. Implementar cancelación/reprogramación y status history.
4. Alinear tests API y de integración.

## Fase 2 (1 semana): Motor de notificaciones

1. Implementar `notification_jobs` + worker.
2. Integrar WhatsApp + email (Resend) con fallback.
3. Implementar retries, dedupe e idempotencia.
4. Activar dashboards de entrega.

## Fase 3 (1-2 semanas): Agenda interna admin

1. Crear módulo admin “Visitas”.
2. Crear vistas día/semana y bandejas operativas.
3. Implementar acciones rápidas (confirmar, reasignar, bloquear, reprogramar).
4. Registrar auditoría operativa en `admin_activity_log`.

## Fase 4 (1 semana): Estabilización y rollout

1. Rollout por porcentaje/flag.
2. Shadow mode de notificaciones antes de activar envíos reales.
3. Hardening de rate limit distribuido.
4. SLOs y runbook operativo.

## 13) Criterios de aceptación

1. Cero dobles reservas bajo concurrencia en pruebas de carga.
2. 99% de APIs de visitas bajo 500 ms p95 en lectura y 800 ms p95 en escritura.
3. >95% de notificaciones críticas entregadas en menos de 2 minutos.
4. Admin puede operar ciclo completo sin intervención técnica.
5. Auditoría completa de cambios de estado y envíos.

## 14) Mapa de integración con código actual

1. Reemplazar mock de visitas por repositorio real en `/Users/macbookpro/Documents/hommie-0-commission-next/app/api/visits/route.ts`.
2. Extender disponibilidad real en `/Users/macbookpro/Documents/hommie-0-commission-next/app/api/calendar/availability/route.ts`.
3. Conectar agenda interna en `/Users/macbookpro/Documents/hommie-0-commission-next/app/admin/*` y navegación en `/Users/macbookpro/Documents/hommie-0-commission-next/app/admin/layout-client.tsx`.
4. Reusar patrón de contratos admin en `/Users/macbookpro/Documents/hommie-0-commission-next/lib/admin/contracts.ts`.
5. Reusar logging de actividad en `/Users/macbookpro/Documents/hommie-0-commission-next/lib/admin/repositories/activity.repository.ts`.
6. Evolucionar captura de “notificar disponibilidad” en `/Users/macbookpro/Documents/hommie-0-commission-next/app/api/availability-notifications/route.ts` para enganchar a `waitlist_matches` + `notification_jobs`.

## 15) Riesgos principales y mitigación

1. Riesgo: dependencia de proveedor WhatsApp.
2. Mitigación: fallback email + cola reintentable + dead-letter + monitor.

1. Riesgo: conflictos de agenda por calendarios externos incompletos.
2. Mitigación: buffers obligatorios + reconciliación periódica + validación pre-confirmación.

1. Riesgo: deuda técnica por coexistencia mock/prod.
2. Mitigación: feature flag por endpoint y eliminación explícita de modo mock al cierre de Fase 2.

## 16) Decisiones inmediatas pendientes

1. Proveedor oficial de WhatsApp (Cloud API directa vs BSP).
2. Política operativa de recordatorios (T-24h, T-2h, T-30m).
3. SLA de confirmación manual por parte de operaciones.
4. Rango de permisos por rol en módulo “Visitas”.

## 17) Backlog ejecutable

1. Backlog técnico por sprint en `/Users/macbookpro/Documents/hommie-0-commission-next/docs/planning/BACKLOG_NOTIFICACIONES_AGENDA_VISITAS.md`.
