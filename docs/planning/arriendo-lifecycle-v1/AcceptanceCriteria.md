# Acceptance Criteria - Arriendo Lifecycle v1

## Document Control
- Version: v0.1
- Status: Draft
- Owner: QA + Product + Engineering
- Last Updated: 2026-02-26

## Traceability Matrix
| AC ID | Linked Requirement ID | Scenario | Expected Outcome | Test Type | Priority |
| --- | --- | --- | --- | --- | --- |
| AC-001 | FR-001 | Creacion de lead valido | Se crea lead con `lead_status=interested` | API + Integration | P0 |
| AC-002 | FR-002 | Cotizacion por unidad disponible | Lead pasa a `quoted` con quote snapshot | API + Unit | P0 |
| AC-003 | FR-003 | Conversion interna a postulante | Lead pasa a `applicant` con `application_id` | API + Integration | P0 |
| AC-004 | FR-004 | Asignacion automatica de unidad | `unit_id` asignado sin conflicto | Integration | P0 |
| AC-005 | FR-005 | Reserva unica por unidad | Solo 1 `reservation_status=active` por `unit_id` | Concurrency | P0 |
| AC-006 | FR-006 | Sincronizacion de listing al reservar | Unidad deja de mostrarse publica | Integration + E2E | P0 |
| AC-007 | FR-007 | Inicio evaluacion | Estado `evaluation_in_progress` con checklist | API + Integration | P0 |
| AC-008 | FR-008 | Decision de evaluacion | Aprobado/rechazado con motivo obligatorio | API + Unit | P0 |
| AC-009 | FR-009 | Creacion de contract_case | Caso en `contract_pending` tras aprobacion | API + Integration | P0 |
| AC-010 | FR-010 | Hidratacion completa de payload | Payload con 3 fuentes y metadata de origen | Unit + Contract tests | P0 |
| AC-011 | FR-011 | Emision idempotente contrato | Reintento reutiliza contrato existente | API + Integration | P0 |
| AC-012 | FR-012 | Registro cobro arrendatario | Pago confirmado con estado consistente | API + Finance integration | P0 |
| AC-013 | FR-013 | Emision boleta/resumen | Documento generado y trazado a pago | API + Document integration | P0 |
| AC-014 | FR-014 | Calculo liquidacion propietario | Neto correcto con deducciones ordenadas | Unit + Reconciliation test | P0 |
| AC-015 | FR-015 | Cierre liquidacion | Settlement pasa a closed con instruccion de pago | API + Integration | P0 |
| AC-016 | FR-016 | Reverso de cobro | Ajuste de settlement aplicado y auditado | Integration | P0 |
| AC-017 | FR-017 | Auditoria integral | workflow_events completo por transicion | Integration + Data audit | P0 |
| AC-018 | FR-018 | Permisos por rol | Transicion denegada para rol no autorizado | Security + API | P0 |
| AC-901 | NFR-001 | Concurrencia de reserva | 0 dobles reservas | Load/Concurrency | P0 |
| AC-902 | NFR-002 | Reintentos idempotentes | 0 duplicados en operaciones criticas | API/Integration | P0 |
| AC-903 | NFR-003 | Cobertura de auditoria | 100% eventos criticos registrados | Data validation | P0 |
| AC-904 | NFR-004 | Performance API estados | p95 < 800ms | Performance | P1 |
| AC-905 | NFR-005 | Disponibilidad endpoints | >= 99.5% mensual | Ops monitoring | P1 |
| AC-906 | NFR-006 | Seguridad de autorizacion | 0 bypass de permisos | Security | P0 |
| AC-907 | NFR-007 | Privacidad de logs | Sin PII sensible en logs | Security/Privacy | P0 |
| AC-908 | NFR-008 | Exactitud financiera | desviacion <= 1 CLP redondeo | Finance QA | P0 |
| AC-909 | NFR-009 | Integridad de documentos | hash estable e inmutable | Document QA | P1 |
| AC-910 | NFR-010 | Recuperacion de fallos parciales | Reintento seguro sin corrupcion de estado | Chaos/Integration | P1 |

## Functional Criteria (Given / When / Then)

### AC-001
- Given: payload valido de lead.
- When: se invoca creacion de lead.
- Then: se persiste lead con estado `interested` y evento `lead_created`.

### AC-002
- Given: unidad disponible y lead en `interested`.
- When: se genera cotizacion.
- Then: se guarda snapshot de cotizacion y lead pasa a `quoted`.

### AC-003
- Given: lead en `quoted`.
- When: operacion interna ejecuta conversion.
- Then: se crea `rental_application` y lead pasa a `applicant`.

### AC-005
- Given: dos solicitudes concurrentes reservando la misma unidad.
- When: ambas intentan crear reserva activa.
- Then: solo una queda `active`; la otra recibe conflicto controlado.

### AC-006
- Given: reserva activa creada.
- When: se actualiza estado de unidad.
- Then: la unidad no aparece en resultados publicos de disponibilidad.

### AC-008
- Given: evaluacion en curso.
- When: analista decide `rejected`.
- Then: se exige motivo y se habilita flujo de reasignacion.

### AC-010
- Given: datos confirmados de postulante/aval, propietario y empresa.
- When: se hidrata payload de contrato.
- Then: se completa payload canonico o se bloquea con lista de faltantes.

### AC-011
- Given: mismo request de emision reenviado dentro de ventana idempotente.
- When: se solicita emitir contrato.
- Then: se retorna contrato existente sin duplicar registro/documento.

### AC-013
- Given: cobro arrendatario exitoso.
- When: se dispara emision documental.
- Then: se genera boleta/resumen asociado al pago y visible para auditoria.

### AC-014
- Given: periodo de settlement con pagos/deducciones.
- When: se calcula liquidacion.
- Then: neto = ingresos - deducciones en orden definido y trazable.

### AC-016
- Given: contracargo confirmado sobre cobro previamente liquidado.
- When: se procesa reverso.
- Then: se crea ajuste en settlement y evento de auditoria.

### AC-018
- Given: usuario con rol insuficiente.
- When: intenta cerrar liquidacion o emitir contrato.
- Then: operacion denegada con error de permisos y audit event.

## Non-Functional Validation Criteria

### AC-901 (Performance)
- Measurement method: pruebas de carga en operaciones de transicion de estado.
- Threshold: p95 < 800ms para operaciones sin dependencia externa.
- Fail condition: p95 >= 800ms sostenido en ventana de prueba.

### AC-902 (Security/Privacy)
- Required controls: autenticacion obligatoria, autorizacion por rol, mascarado de PII en logs.
- Validation evidence: suite de pruebas de permisos + revision de payloads de log.

### AC-903 (Observability)
- Required logs/traces/alerts: workflow_events por transicion, correlacion por `request_id`, alertas por duplicados.
- Validation evidence: dashboard y consulta de eventos de punta a punta.

### AC-908 (Financial Accuracy)
- Measurement method: pruebas de reconciliacion con fixtures de cobros/deducciones/reversos.
- Threshold: diferencia absoluta <= 1 CLP (redondeo declarado).
- Fail condition: diferencia > 1 CLP sin explicacion de regla.

## Edge Case Matrix
| Case | Trigger | Expected Handling | User Message | Logging Requirement |
| --- | --- | --- | --- | --- |
| Reserva unica en carrera | 2 postulantes misma unidad | 1 active, 1 conflict | "Unidad ya reservada" | Event conflict + actor |
| Baja listing automatica | Reserva activa | Unidad no visible publica | "Unidad reservada" | Event listing_sync |
| Expiracion reserva | TTL vencido | `active -> expired` y liberar unidad | "Reserva expirada" | Event reservation_expired |
| Reasignacion por rechazo | Evaluacion reject | Volver a applicant y reasignar | "Postulacion requiere nueva unidad" | Event reassignment_started |
| Hidratacion incompleta | Falta campo obligatorio | Bloquear emision | "Faltan datos para contrato" | Event hydration_blocked |
| Emision idempotente | Reintento mismo payload | Reusar contrato previo | "Contrato ya emitido" | Event idempotent_reuse |
| Documento arrendatario fallido | Error generacion documento | Estado pending_document + reintento | "Documento en proceso" | Event tenant_doc_retry |
| Deduccion fuera de catalogo | Item no permitido | Rechazar cierre settlement | "Deduccion no valida" | Event settlement_validation_failed |
| Reverso post-liquidacion | Contracargo recibido | Ajuste + estado adjusted | "Liquidacion ajustada" | Event settlement_adjusted |
| Permiso insuficiente | Rol no autorizado | Deny sin side effects | "Accion no permitida" | Event access_denied |

## QA Critical Path
- Must-pass scenarios before release:
1. Lead -> quote -> applicant -> reserve -> evaluate -> contract_issued.
2. Concurrencia de reserva con unicidad garantizada.
3. Hydratacion y emision idempotente de contrato.
4. Cobro arrendatario + boleta/resumen.
5. Liquidacion propietario + cierre + ajuste por reverso.
6. Auditoria y permisos por rol en transiciones P0.

## Release Exit Criteria
- All P0/P1 AC passed: obligatorio.
- No open High risks without approved contingency: obligatorio.
- Rollout observability checks verified: obligatorio.

## Changelog
- v0.1 (2026-02-26): Matriz inicial AC con trazabilidad FR/NFR y edge cases.
