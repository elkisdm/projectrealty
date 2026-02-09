# Backlog Técnico: Notificaciones y Agenda de Visitas (Gestión Interna)

## 1) Contexto

- Fecha base de planificación: 9 de febrero de 2026.
- Fuente: `/Users/macbookpro/Documents/hommie-0-commission-next/docs/planning/PLAN_NOTIFICACIONES_AGENDA_VISITAS_INTERNA.md`.
- Cadencia propuesta: sprints de 2 semanas.
- Objetivo operativo: salir a producción con agenda interna + notificaciones transaccionales sin dobles reservas.

## 2) Definiciones operativas

### Definition of Ready (DoR)

- Historia tiene objetivo de negocio claro.
- Contrato API y/o esquema de datos definido.
- Riesgos y dependencias explícitos.
- Criterios de aceptación testeables.

### Definition of Done (DoD)

- Código mergeado con typecheck y tests relevantes en verde.
- Métricas y logs mínimos instrumentados.
- Runbook o notas operativas actualizadas si afecta operación.
- Feature flag definido para rollout controlado si aplica.

## 3) Épicas

| ID | Épica | Resultado esperado | Prioridad |
|---|---|---|---|
| EP-01 | Core transaccional de visitas | Reserva real en DB, idempotencia y no solapamiento | P0 |
| EP-02 | Gestión de agenda interna | Operación diaria por agente/edificio/unidad | P0 |
| EP-03 | Motor de notificaciones | Envío confiable con retries y auditoría | P0 |
| EP-04 | Waitlist inteligente | Match de disponibilidad y aviso automático | P1 |
| EP-05 | Seguridad y resiliencia | RLS, rate limit distribuido y observabilidad | P0 |
| EP-06 | QA, rollout y adopción | Salida progresiva con KPIs y runbook | P1 |

## 4) Roadmap por sprints

| Sprint | Fechas objetivo | Foco | Épicas |
|---|---|---|---|
| Sprint 0 | 2026-02-09 a 2026-02-20 | Contratos, migraciones y base técnica | EP-01, EP-05 |
| Sprint 1 | 2026-02-23 a 2026-03-06 | Core de visitas productivo | EP-01 |
| Sprint 2 | 2026-03-09 a 2026-03-20 | Agenda interna admin | EP-02 |
| Sprint 3 | 2026-03-23 a 2026-04-03 | Notificaciones transaccionales | EP-03 |
| Sprint 4 | 2026-04-06 a 2026-04-17 | Waitlist + hardening + rollout | EP-04, EP-05, EP-06 |

## 5) Backlog detallado por épica

## EP-01 Core transaccional de visitas

### US-001 Crear visita con persistencia real

- Prioridad: P0.
- Estimación: 8 pts.
- Dependencias: ninguna.
- Criterios de aceptación:
- `POST /api/visits` persiste en DB real y deja de usar almacenamiento in-memory.
- Doble envío con misma `Idempotency-Key` retorna la misma visita.
- Colisión de slot devuelve `409 SLOT_UNAVAILABLE`.
- Tareas técnicas:
- Crear tablas base `visit_slots`, `visits`, `visit_status_history`.
- Implementar repositorio server-side con transacción.
- Reemplazar mock actual en `/Users/macbookpro/Documents/hommie-0-commission-next/app/api/visits/route.ts`.
- Agregar tests API para idempotencia y conflicto.

### US-002 Cancelación y reprogramación

- Prioridad: P0.
- Estimación: 5 pts.
- Dependencias: US-001.
- Criterios de aceptación:
- Existen endpoints de cancelación y reprogramación con validación de ventana horaria.
- Toda transición queda en `visit_status_history`.
- Tareas técnicas:
- Crear `POST /api/visits/:id/cancel`.
- Crear `POST /api/visits/:id/reschedule`.
- Definir política de ventana de cancelación configurable.
- Agregar tests de transición inválida y válida.

### US-003 Estados operativos de visita

- Prioridad: P1.
- Estimación: 3 pts.
- Dependencias: US-001.
- Criterios de aceptación:
- Estado soporta `pending`, `confirmed`, `in_progress`, `completed`, `canceled`, `no_show`.
- Transiciones inválidas son rechazadas con error semántico.
- Tareas técnicas:
- Definir máquina de estados en capa de dominio.
- Exponer `PATCH /api/admin/visits/:id/status`.
- Testear matriz de transiciones.

## EP-02 Gestión de agenda interna

### US-004 Módulo admin de visitas

- Prioridad: P0.
- Estimación: 8 pts.
- Dependencias: US-001.
- Criterios de aceptación:
- Nueva sección de navegación admin: “Visitas”.
- Lista operativa con filtros por fecha, estado, agente, edificio y unidad.
- Tareas técnicas:
- Agregar nav item en `/Users/macbookpro/Documents/hommie-0-commission-next/app/admin/layout-client.tsx`.
- Crear página `/Users/macbookpro/Documents/hommie-0-commission-next/app/admin/visits/page.tsx`.
- Crear hook `useAdminVisits` con React Query.
- Crear endpoint `GET /api/admin/visits`.

### US-005 Vista agenda día/semana

- Prioridad: P0.
- Estimación: 8 pts.
- Dependencias: US-004.
- Criterios de aceptación:
- Vista Día muestra próximos 120 minutos con alertas.
- Vista Semana permite ver capacidad por agente.
- Tareas técnicas:
- Reusar y limpiar componentes de calendario existentes para quitar mocks.
- Implementar datasource real para eventos internos + visitas.
- Implementar filtros por agente/edificio.

### US-006 Acciones rápidas operativas

- Prioridad: P1.
- Estimación: 5 pts.
- Dependencias: US-004.
- Criterios de aceptación:
- Se puede confirmar asistencia, reasignar agente y bloquear franja desde la UI.
- Cada acción genera registro en `admin_activity_log`.
- Tareas técnicas:
- Crear endpoints `POST /api/admin/visits/:id/reassign`, `POST /api/admin/agenda/blocks`, `DELETE /api/admin/agenda/blocks/:id`.
- Integrar `logAdminActivity`.
- Agregar toasts y errores accionables.

## EP-03 Motor de notificaciones

### US-007 Outbox y cola de notificaciones

- Prioridad: P0.
- Estimación: 8 pts.
- Dependencias: US-001.
- Criterios de aceptación:
- Eventos `visit.created`, `visit.confirmed`, `visit.rescheduled`, `visit.canceled` generan jobs.
- Jobs tienen estado y trazabilidad completa.
- Tareas técnicas:
- Crear tablas `domain_events`, `notification_jobs`, `notification_deliveries`.
- Implementar productor de eventos transaccional.
- Implementar worker de consumo con locking.

### US-008 Integración WhatsApp + Email con fallback

- Prioridad: P0.
- Estimación: 8 pts.
- Dependencias: US-007.
- Criterios de aceptación:
- Confirmación y recordatorios salen por WhatsApp.
- Si falla WhatsApp, fallback a email para eventos críticos.
- Tareas técnicas:
- Integrar proveedor WhatsApp (adaptador desacoplado).
- Integrar Resend para email.
- Guardar payload, respuesta y error normalizado por intento.

### US-009 Retries, deduplicación y dead-letter

- Prioridad: P0.
- Estimación: 5 pts.
- Dependencias: US-007.
- Criterios de aceptación:
- Retry exponencial con jitter y tope de intentos.
- Dedupe por evento+canal+destinatario evita duplicados.
- Jobs fallidos terminales quedan en dead-letter.
- Tareas técnicas:
- Implementar scheduler de retries.
- Agregar índice único por `dedupe_key`.
- Crear endpoint admin para reintento manual.

### US-010 Plantillas y reglas de envío

- Prioridad: P1.
- Estimación: 5 pts.
- Dependencias: US-008.
- Criterios de aceptación:
- Reglas configurables para `T-24h`, `T-2h`, `T-30m`.
- Plantillas versionadas con soporte por canal.
- Tareas técnicas:
- Crear tablas `notification_templates` y `notification_rules`.
- Crear resolver de reglas por evento.
- Añadir validaciones de placeholders requeridos.

## EP-04 Waitlist inteligente

### US-011 Normalizar suscripciones de waitlist

- Prioridad: P1.
- Estimación: 3 pts.
- Dependencias: ninguna.
- Criterios de aceptación:
- Las altas de waitlist guardan unidad/segmento y preferencias mínimas.
- No hay duplicados activos por email + unidad.
- Tareas técnicas:
- Migrar `waitlist` a `waitlist_subscriptions` o extender modelo actual.
- Actualizar `/Users/macbookpro/Documents/hommie-0-commission-next/app/api/availability-notifications/route.ts`.

### US-012 Match automático de disponibilidad

- Prioridad: P1.
- Estimación: 5 pts.
- Dependencias: US-011, US-007.
- Criterios de aceptación:
- Al liberarse un slot o unidad, se generan matches y notificaciones.
- Se evita spam por throttling de aviso.
- Tareas técnicas:
- Crear `waitlist_matches`.
- Implementar job periódico de matching.
- Emitir evento `waitlist.matched`.

## EP-05 Seguridad y resiliencia

### US-013 Rate limit distribuido

- Prioridad: P0.
- Estimación: 5 pts.
- Dependencias: ninguna.
- Criterios de aceptación:
- Endpoints sensibles usan rate limiting compartido entre instancias.
- Se mantiene compatibilidad funcional con headers actuales.
- Tareas técnicas:
- Reemplazar implementación en memoria de `/Users/macbookpro/Documents/hommie-0-commission-next/lib/rate-limit.ts` por adaptador Redis/Upstash.
- Ajustar tests con mock del nuevo backend.

### US-014 RLS y permisos por rol

- Prioridad: P0.
- Estimación: 5 pts.
- Dependencias: US-001, US-004.
- Criterios de aceptación:
- Usuario final solo accede a sus visitas.
- Admin viewer/editor/admin respeta permisos de acción.
- Tareas técnicas:
- Definir políticas RLS para tablas de visitas/notificaciones.
- Revisar guards de admin y mapear permisos por endpoint.

### US-015 Observabilidad operativa

- Prioridad: P1.
- Estimación: 3 pts.
- Dependencias: US-007.
- Criterios de aceptación:
- Métricas disponibles para tasa de entrega, fallas y cola pendiente.
- Alertas activas para backlog de jobs y errores de proveedor.
- Tareas técnicas:
- Instrumentar métricas clave.
- Agregar logs estructurados con correlation id.
- Definir umbrales de alerta.

## EP-06 QA, rollout y adopción

### US-016 Suite de pruebas críticas end-to-end

- Prioridad: P1.
- Estimación: 5 pts.
- Dependencias: US-005, US-008.
- Criterios de aceptación:
- Cobertura crítica para agendar, cancelar, reprogramar y notificar.
- Casos de concurrencia y idempotencia automatizados.
- Tareas técnicas:
- Extender tests API y Playwright.
- Agregar test de carrera para doble reserva.

### US-017 Rollout progresivo con feature flags

- Prioridad: P1.
- Estimación: 3 pts.
- Dependencias: US-016.
- Criterios de aceptación:
- Activación gradual por porcentaje o segmento.
- Rollback inmediato sin despliegue destructivo.
- Tareas técnicas:
- Crear flags para `visits_v2`, `notifications_v2`, `admin_visits`.
- Definir plan de activación por etapas.

### US-018 Runbook y transferencia operativa

- Prioridad: P1.
- Estimación: 2 pts.
- Dependencias: US-017.
- Criterios de aceptación:
- Operaciones tiene guía clara para incidencias.
- Existe protocolo de contingencia por caída de proveedor de mensajería.
- Tareas técnicas:
- Documentar runbook técnico y operativo.
- Incluir playbooks de retry y fallback.

## 6) Priorización de ejecución (orden recomendado)

1. US-001.
2. US-013.
3. US-002.
4. US-004.
5. US-007.
6. US-008.
7. US-009.
8. US-005.
9. US-006.
10. US-014.
11. US-010.
12. US-016.
13. US-017.
14. US-011.
15. US-012.
16. US-015.
17. US-018.
18. US-003.

## 7) Capacidad sugerida por sprint (story points)

| Sprint | Capacidad objetivo | Carga sugerida |
|---|---|---|
| Sprint 0 | 18-22 pts | US-001, US-013, US-002 parcial |
| Sprint 1 | 18-22 pts | US-002 cierre, US-004, US-005 parcial |
| Sprint 2 | 18-22 pts | US-005 cierre, US-006, US-014 |
| Sprint 3 | 18-22 pts | US-007, US-008 |
| Sprint 4 | 18-22 pts | US-009, US-010, US-011, US-012, US-016, US-017, US-015, US-018, US-003 |

## 8) KPI de salida a producción

- `double_booking_rate` = 0.
- `visit_confirmation_latency_p95` < 2 minutos.
- `notification_delivery_success` > 95% en eventos críticos.
- `no_show_rate` con baseline medido y tendencia decreciente.
- `admin_action_time_p95` (confirmar/reagendar/reasignar) < 60 segundos.
