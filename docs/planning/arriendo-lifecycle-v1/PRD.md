# PRD - Arriendo Lifecycle End-to-End

## Document Control
- Version: v0.1
- Status: Draft
- Owner: Product + Operaciones + Engineering
- Last Updated: 2026-02-26
- Linked Docs: Scope.md, Risks.md, AcceptanceCriteria.md, FlowMap.md, BusinessRules.md, DataModel.md, ApiContracts.md, ContractHydrationSpec.md, PaymentsAndSettlements.md

## One-Page Contract
- What: Definir el sistema operativo y de datos para gestionar todo el ciclo de arriendo desde lead hasta liquidacion al propietario.
- For Who: Equipo de Operaciones de arriendo, Administracion de contratos, Finanzas y Soporte.
- Why Now: El flujo actual esta fragmentado y limita conversion, trazabilidad y consistencia de cobros/contratos.
- Success Metric: Conversion a contrato (`quoted -> contract_issued`).
- Target: pasar de 6.0% (assumption) a 9.0%.
- Target Date: 2026-06-30.

## Goals
- G1: Unificar el ciclo comercial y operativo en una maquina de estados auditable.
- G2: Asegurar reserva unica por unidad y coherencia entre disponibilidad publica y estado operativo.
- G3: Emitir contratos con payload hidratado y validado de forma idempotente.
- G4: Estandarizar cobro centralizado, emision documental al arrendatario y liquidacion automatica al propietario.

## Non-Goals
- NG1: Implementar integraciones tributarias o pasarelas reales en esta fase.
- NG2: Redisenar UI/UX final de paneles admin.
- NG3: Modelar procesos post-termino de contrato (desocupacion, finiquito avanzado).

## Users And JTBD
- Primary Segment: Operaciones de arriendo (interno).
- Secondary Segment: Finanzas, Legal/Contratos, Soporte propietario.
- JTBD Statement: "Cuando un lead avanza, necesito operar su ciclo sin ambiguedades para convertirlo a contrato y liquidar correctamente al propietario".
- Context Of Use: Backoffice interno con multiples actores (ejecutivo comercial, analista evaluacion, contratos, finanzas).

## Problem Framing
- Symptoms:
  - Estados dispersos entre lead, unidad, contrato y pagos.
  - Riesgo de doble reserva por falta de regla unificada.
  - Contratos dependientes de carga manual inconsistente.
  - Liquidaciones con riesgo de error por falta de modelo formal.
- Root Cause:
  - Falta de contrato de dominio unificado (estados, reglas, entidades, APIs).
- Current Workaround:
  - Operacion manual y conciliacion ad-hoc entre sistemas.
- Measurable Pain:
  - Caida de conversion por demoras.
  - Retrabajo operacional y disputas por diferencias de liquidacion.
- Hypothesis:
  - Si se define un flujo canonico end-to-end con reglas y contratos claros para el equipo interno, la conversion `quoted -> contract_issued` subira de 6.0% a 9.0% para 2026-06-30.

## Prioritized Jobs / Stories
| Priority | Job / Story | Outcome | Metric Link |
| --- | --- | --- | --- |
| P0 | Convertir lead interesado a postulante con unidad asignada | Menor friccion operacional | Conversion a contrato |
| P0 | Reservar unidad en forma exclusiva e inmediata | Evitar conflictos y dobles promesas | Reservas conflictivas |
| P0 | Validar y confirmar datos de postulante/aval | Contrato sin reprocesos | Time to contract |
| P0 | Emitir contrato hidratado e idempotente | Menos errores legales/operativos | Contract issuance success rate |
| P0 | Cobrar arriendo centralizadamente y liquidar propietario | Cierre financiero consistente | Settlement accuracy |
| P1 | Gestionar reversos/contracargos con ajustes | Trazabilidad financiera | Reversal resolution time |
| P1 | Tener auditoria completa de eventos | Cumplimiento y soporte | Audit completeness |

## Functional Requirements (FR)
| ID | Requirement | Flow Type | System States | Business Rules | Roles | Integration / Fallback | Acceptance Link |
| --- | --- | --- | --- | --- | --- | --- | --- |
| FR-001 | Crear lead con estado inicial `interested` | Primary | lead_status | BR-001..BR-004 | Comercial | Fallback a cola de reintento | AC-001 |
| FR-002 | Generar cotizacion por unidad con snapshot versionado | Primary | lead_status=quoted | BR-005..BR-008 | Comercial | Fallback: marcar quote_error y reintentar | AC-002 |
| FR-003 | Convertir lead a postulante por accion interna | Primary | quoted -> applicant | BR-009..BR-011 | Operaciones | Fallback: mantener quoted con motivo | AC-003 |
| FR-004 | Asignar unidad automaticamente a postulante | Primary | applicant + unit_status | BR-012..BR-014 | Operaciones | Fallback: cola de reasignacion manual | AC-004 |
| FR-005 | Crear reserva activa unica por unidad | Primary | reservation_status | BR-015..BR-019 | Operaciones | Idempotency-Key obligatorio | AC-005 |
| FR-006 | Bajar unidad del listing al reservar | Primary | unit_status reserved | BR-020..BR-021 | Operaciones | Fallback: flag de exclusividad interna | AC-006 |
| FR-007 | Ejecutar evaluacion documental y financiera | Primary | evaluation_in_progress | BR-022..BR-026 | Evaluacion | Fallback: estado pending_review | AC-007 |
| FR-008 | Registrar decision de evaluacion (approve/reject) | Primary | evaluation_approved/rejected | BR-027..BR-029 | Evaluacion | Fallback: escalamiento supervisor | AC-008 |
| FR-009 | Crear contract_case al aprobar evaluacion | Primary | contract_pending | BR-030..BR-032 | Contratos | Fallback: cola de casos pendientes | AC-009 |
| FR-010 | Hidratar payload de contrato con 3 fuentes | Primary | contract_case_status | BR-033..BR-037 | Contratos | Fallback: bloqueante por campos faltantes | AC-010 |
| FR-011 | Validar e emitir contrato de forma idempotente | Primary | contract_issued | BR-038..BR-041 | Contratos | Reuso por hash de request | AC-011 |
| FR-012 | Registrar cobro arrendatario centralizado | Primary | tenant_payment_status | BR-042..BR-046 | Finanzas | Fallback: pending_collection | AC-012 |
| FR-013 | Emitir boleta/resumen al arrendatario | Primary | payment_document_status | BR-047..BR-049 | Finanzas | Fallback: reemision controlada | AC-013 |
| FR-014 | Generar liquidacion de propietario con deducciones | Primary | owner_settlement_status | BR-050..BR-056 | Finanzas | Fallback: draft con bloqueo de cierre | AC-014 |
| FR-015 | Cerrar liquidacion y emitir instruccion de pago | Primary | closed -> paid | BR-057..BR-059 | Finanzas | Fallback: hold por conciliacion | AC-015 |
| FR-016 | Gestionar reverso/contracargo y ajustes | Alternate | reversed/adjusted | BR-060..BR-064 | Finanzas | Nota de ajuste y trazabilidad obligatoria | AC-016 |
| FR-017 | Mantener bitacora completa de workflow_events | Cross-cutting | all states | BR-065..BR-068 | Todos | Fallback: write-ahead event queue | AC-017 |
| FR-018 | Enforzar permisos por rol para cada transicion | Cross-cutting | all states | BR-069..BR-072 | Admin/Ops | Fallback: deny + audit event | AC-018 |

## Non-Functional Requirements (NFR)
| ID | Requirement | Target / Limit | Validation Method | Acceptance Link |
| --- | --- | --- | --- | --- |
| NFR-001 | Consistencia transaccional de reserva | 0 dobles reservas activas por unidad | Test de concurrencia + invariantes DB | AC-901 |
| NFR-002 | Idempotencia en operaciones criticas | Reintento no crea duplicados | Tests de reenvio con misma key/hash | AC-902 |
| NFR-003 | Trazabilidad auditable | 100% transiciones con event_id y actor | Verificacion de workflow_events | AC-903 |
| NFR-004 | Rendimiento operativo API | p95 < 800ms en operaciones de estado | Pruebas de carga internas | AC-904 |
| NFR-005 | Disponibilidad de proceso | 99.5% mensual en endpoints criticos | Observabilidad + SLI/SLO | AC-905 |
| NFR-006 | Seguridad y autorizacion | 0 transiciones sin rol valido | Pruebas de permisos | AC-906 |
| NFR-007 | Privacidad de PII | Datos sensibles minimizados y enmascarados en logs | Revision de logs | AC-907 |
| NFR-008 | Exactitud financiera | desviacion <= 1 CLP por redondeo declarado | Pruebas de formula y conciliacion | AC-908 |
| NFR-009 | Integridad documental | Documentos emitidos inmutables y versionados | Hash + historial de eventos | AC-909 |
| NFR-010 | Recuperacion ante fallos parciales | Reintento seguro con estado consistente | Escenarios de fallo controlado | AC-910 |

## Data And Analytics

### Key Entities And Fields
| Entity | Key Fields | Source Of Truth |
| --- | --- | --- |
| leads | id, lead_status, quote_snapshot_id | Lifecycle domain |
| rental_applications | id, lead_id, unit_id, evaluation_status | Lifecycle domain |
| unit_reservations | id, unit_id, application_id, reservation_status, expires_at | Reservation domain |
| contract_cases | id, application_id, contract_type, contract_case_status | Contracts domain |
| tenant_payment_documents | id, payment_id, doc_type, issued_at, total_amount | Finance domain |
| owner_settlements | id, owner_id, period, status, net_amount | Finance domain |
| settlement_line_items | id, settlement_id, category, amount, sign | Finance domain |
| workflow_events | id, aggregate_type, aggregate_id, event_type, actor_id, occurred_at | Audit domain |

### Tracking Events
| Event | Trigger | Properties | KPI / Funnel Stage |
| --- | --- | --- | --- |
| lead_created | Lead validado | lead_id, source | Top funnel |
| quote_generated | Cotizacion emitida | lead_id, unit_id, quote_total | quoted |
| lead_converted_to_applicant | Accion interna | lead_id, application_id | applicant |
| unit_assigned | Asignacion auto/manual | application_id, unit_id | applicant |
| reservation_created | Reserva activa creada | reservation_id, unit_id, ttl | reservation |
| reservation_expired | TTL cumplido | reservation_id, reason | recovery |
| evaluation_started | Inicio evaluacion | application_id, checklist_version | evaluation_in_progress |
| evaluation_decided | Approve/reject | application_id, decision, reason | evaluation_outcome |
| contract_case_created | Aprobacion evaluacion | contract_case_id, type | contract_pending |
| contract_hydrated | Payload completo | contract_case_id, source_completeness | contract_ready |
| contract_issued | Emision exitosa | contract_id, hash | contract_issued |
| tenant_payment_registered | Cobro confirmado | payment_id, amount | payment_collected |
| tenant_document_issued | Boleta/resumen emitido | document_id, doc_type | tenant_documented |
| owner_settlement_closed | Liquidacion cerrada | settlement_id, net_amount | settlement_closed |
| owner_settlement_paid | Pago ejecutado | settlement_id, payout_ref | settlement_paid |
| payment_reversed | Reverso/contracargo | payment_id, reason_code | risk_control |

## UX Delivery Requirements
- Required components:
  - Backoffice lead/application board con estado canonico.
  - Vista de reserva y bloqueo de unidad.
  - Vista de evaluacion con checklist y decision.
  - Vista de contract_case con hidratacion y validacion.
  - Vista de finanzas para cobros, documentos y liquidaciones.
- Form and validation rules:
  - Campos obligatorios por estado y por tipo de contrato.
  - Validaciones de formato (RUT, email, montos, fechas).
- Empty/loading/error states:
  - Estados vacios con accion siguiente recomendada.
  - Errores de idempotencia con mensaje de reuso.
  - Errores bloqueantes con codigo y campo faltante.
- Critical copy and error messages:
  - Mensajes orientados a operacion: "No se puede emitir contrato: faltan campos obligatorios".

## Delivery Plan
| Sprint / Milestone | Scope | Dependencies | Exit Criteria |
| --- | --- | --- | --- |
| M1 (2026-02-27) | Baseline documental v0.1 | Aprobacion de alcance y KPI | 11 archivos creados |
| M2 (2026-03-04) | PRD/Scope/Risks/AC trazables | Alineamiento Product/Ops | FR/NFR y AC cerrados |
| M3 (2026-03-09) | FlowMap/Rules/DataModel/API contracts | Validacion tecnica | Estados, reglas y entidades cerradas |
| M4 (2026-03-12) | Hydration + Payments/Settlements | Input Contratos/Finanzas | Especificaciones bloqueantes cerradas |
| M5 (2026-03-15) | Cierre v1.0 | Resolucion open questions criticas | Quality gates completos |

## Rollout Plan
- Feature flag strategy: no aplica en implementacion (documentacion), pero se define propuesta de flags por modulo para fase de build.
- Beta cohort: no aplica en documentacion; se propone piloto interno para implementacion posterior.
- Migration plan: especificado a nivel logico en DataModel y ApiContracts.
- Rollback plan: versionado documental (`v0.1`, `v1.0`) y decision log por cambio.

## Assumptions
| ID | Assumption | Confidence | Validation Plan |
| --- | --- | --- | --- |
| A-001 | Baseline quoted->contract actual es 6.0% | Low | Confirmar con datos historicos antes de implementar |
| A-002 | Reserva activa TTL default = 48 horas | Medium | Validar con Operaciones |
| A-003 | Se permite 1 contrato activo por application_id | High | Confirmar con Legal/Contratos |
| A-004 | Cobro centralizado aplica a todo el MVP | Medium | Confirmar con Finanzas |
| A-005 | Deducciones de liquidacion usan orden fijo | Medium | Aprobar con Finanzas y Propietarios |
| A-006 | Se requieren boleta/resumen por cada cobro exitoso | Medium | Validar cumplimiento legal minimo |
| A-007 | Tipos de contrato limitados a standard/subarriendo_propietario | High | Ya alineado con modulo actual |
| A-008 | Regla de 1 reserva activa por unidad es no negociable | High | Alineado con direccion operacional |

## Open Questions
- OQ-001: Definicion legal final del documento "boleta/resumen" por tipo de recaudacion.
- OQ-002: Ventana exacta de cierre mensual de liquidacion a propietario.
- OQ-003: Politica de retencion de fondos por contracargo (dias y porcentaje).
- OQ-004: Matriz de autorizaciones fina por rol en overrides manuales.
- OQ-005: Catalogo definitivo de categorias de deduccion.
- OQ-006: SLA de soporte para disputas de liquidacion.

## Decision Log
| ADR ID | Date | Decision | Options Rejected | Why |
| --- | --- | --- | --- | --- |
| ADR-ALV1-001 | 2026-02-26 | Alcance MVP end-to-end completo | Llegar solo hasta contrato | Necesidad de cerrar circuito financiero |
| ADR-ALV1-002 | 2026-02-26 | KPI primario conversion a contrato | Time-to-contract, exactitud financiera como KPI primario | Objetivo de negocio inmediato |
| ADR-ALV1-003 | 2026-02-26 | Cobro centralizado con deduccion automatica | Cobro directo propietario, modelo hibrido | Mayor control operacional y trazabilidad |
| ADR-ALV1-004 | 2026-02-26 | 1 reserva activa por unidad | Multiples reservas paralelas | Elimina sobreventa y conflicto |
| ADR-ALV1-005 | 2026-02-26 | Tipos de contrato: standard/subarriendo_propietario | Incluir mas variantes en MVP | Alineacion con capacidad actual |

## Changelog
- v0.1 (2026-02-26): Documento inicial con FR/NFR, metricas, supuestos y plan de entrega.
