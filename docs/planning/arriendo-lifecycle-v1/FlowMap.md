# Flow Map and State Machines - Arriendo Lifecycle v1

## Document Control
- Version: v0.1
- Status: Draft
- Owner: Product + Ops + Engineering
- Last Updated: 2026-02-26

## End-to-End Primary Flow
1. Lead interesado entra con `lead_status=interested`.
2. Se genera cotizacion por unidad y lead pasa a `quoted`.
3. Accion interna convierte lead a postulante (`applicant`).
4. Sistema asigna unidad y crea `unit_reservation` activa.
5. Unidad pasa a `unit_status=reserved` y sale de listing publico.
6. Inicia evaluacion (`evaluation_in_progress`) con checklist.
7. Si aprueba: `evaluation_approved`; si rechaza: `evaluation_rejected`.
8. Con aprobacion se crea `contract_case` y lead pasa a `contract_pending`.
9. Se hidrata payload contrato con 3 fuentes.
10. Se valida y emite contrato idempotente -> `contract_issued`.
11. Se registra cobro arrendatario y documento boleta/resumen.
12. Se calcula liquidacion de propietario con deducciones.
13. Se cierra settlement y se marca pago a propietario.
14. Caso se marca `closed`.

## Canonical State Machines

### 1) Lead State Machine (`lead_status`)
- States:
  - `interested`
  - `quoted`
  - `applicant`
  - `evaluation_in_progress`
  - `evaluation_approved`
  - `evaluation_rejected`
  - `contract_pending`
  - `contract_issued`
  - `closed`

- Allowed transitions:
  - `interested -> quoted`
  - `quoted -> applicant`
  - `applicant -> evaluation_in_progress`
  - `evaluation_in_progress -> evaluation_approved`
  - `evaluation_in_progress -> evaluation_rejected`
  - `evaluation_rejected -> applicant` (reasignacion)
  - `evaluation_approved -> contract_pending`
  - `contract_pending -> contract_issued`
  - `contract_issued -> closed`

### 2) Unit State Machine (`unit_status`)
- States:
  - `available`
  - `reserved`
  - `rented`

- Allowed transitions:
  - `available -> reserved`
  - `reserved -> available` (cancel/expire)
  - `reserved -> rented` (contrato emitido + activacion de arriendo)
  - `rented -> available` (fuera de alcance MVP operativo)

### 3) Reservation State Machine (`reservation_status`)
- States:
  - `active`
  - `expired`
  - `cancelled`
  - `consumed`

- Allowed transitions:
  - `active -> consumed` (usada para contrato)
  - `active -> expired` (TTL vencido)
  - `active -> cancelled` (accion manual autorizada)

### 4) Contract Case State Machine (`contract_case_status`)
- States:
  - `drafting`
  - `hydrated`
  - `validated`
  - `issued`
  - `void`

- Allowed transitions:
  - `drafting -> hydrated`
  - `hydrated -> validated`
  - `validated -> issued`
  - `issued -> void` (solo por flujo excepcional autorizado)

### 5) Payment and Settlement States
- Tenant payment:
  - `pending`, `paid`, `failed`, `reversed`.
- Tenant document:
  - `pending`, `issued`, `failed`.
- Owner settlement:
  - `draft`, `ready_to_close`, `closed`, `paid`, `adjusted`.

## Transition Guardrails
| Transition | Preconditions | Blocking Conditions | Side Effects |
| --- | --- | --- | --- |
| quoted -> applicant | quote snapshot vigente | quote ausente/invalida | create rental_application |
| applicant -> reservation active | unidad asignada available | unidad con reserva activa existente | unit_status reserved |
| reservation active -> consumed | evaluacion approved | evaluacion no aprobada | lock contract_case |
| contract_pending -> contract_issued | payload hidratado + validado | campos requeridos faltantes | persist contrato + hash |
| paid -> tenant document issued | cobro confirmado | error emision documento | retry queue |
| draft settlement -> closed | conciliacion completa | deduccion invalida/no aprobada | payout instruction |

## Alternate and Failure Flows
- A1: Reserva expira sin iniciar evaluacion -> liberar unidad y volver a applicant.
- A2: Evaluacion rechazada -> reasignacion de unidad o cierre de lead.
- A3: Hidratacion incompleta -> contract_case bloqueado con lista de faltantes.
- A4: Emision contrato con reintento -> idempotent reuse.
- A5: Pago arrendatario falla -> mantener `pending` y no generar documento final.
- A6: Documento arrendatario falla -> `pending_document` + reintento.
- A7: Contracargo posterior -> settlement `adjusted` con nota de ajuste.
- A8: Override manual -> solo roles permitidos + workflow_event obligatorio.

## Timers and SLA Defaults
- Reserva activa TTL: 48h (assumption A-002).
- SLA de decision evaluacion: <= 72h habiles desde inicio.
- SLA de emision de contrato: <= 24h desde evaluacion aprobada.
- SLA de emision de documento arrendatario: <= 24h desde pago `paid`.
- SLA de cierre settlement propietario: <= 5 dias habiles desde cierre de periodo.

## Event Map (Audit)
- Cada transicion valida debe generar:
  - `event_id`
  - `aggregate_type`
  - `aggregate_id`
  - `from_state`
  - `to_state`
  - `actor_id`
  - `request_id`
  - `occurred_at`

## Changelog
- v0.1 (2026-02-26): Mapa de flujo y maquinas de estado canonicas.
