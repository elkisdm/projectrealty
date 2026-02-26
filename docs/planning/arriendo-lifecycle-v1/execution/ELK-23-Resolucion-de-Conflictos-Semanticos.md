# ELK-23 - Resolucion de Conflictos Semanticos (ADR Inputs)

## Document Control
- Issue: ELK-23
- Parent: ELK-11
- Version: v0.1
- Status: Draft (DoD completado para ELK-23)
- Owner: Founder + AI pair
- Last Updated: 2026-02-26

## Objetivo
Resolver conflictos semanticos abiertos de ELK-19/ELK-20/ELK-22 y convertirlos en decisiones trazables para ADR-001.

## Fuentes base
- [ELK-19-Inventario-Terminos-y-Fuentes.md](/Users/macbookpro/Documents/hommie-0-commission-next/docs/planning/arriendo-lifecycle-v1/execution/ELK-19-Inventario-Terminos-y-Fuentes.md)
- [ELK-20-Mapa-Actores-y-Entidades-Canonicas.md](/Users/macbookpro/Documents/hommie-0-commission-next/docs/planning/arriendo-lifecycle-v1/execution/ELK-20-Mapa-Actores-y-Entidades-Canonicas.md)
- [ELK-22-Bounded-Contexts-y-Fronteras-de-Eventos.md](/Users/macbookpro/Documents/hommie-0-commission-next/docs/planning/arriendo-lifecycle-v1/execution/ELK-22-Bounded-Contexts-y-Fronteras-de-Eventos.md)
- [FlowMap.md](/Users/macbookpro/Documents/hommie-0-commission-next/docs/planning/arriendo-lifecycle-v1/FlowMap.md)
- [DataModel.md](/Users/macbookpro/Documents/hommie-0-commission-next/docs/planning/arriendo-lifecycle-v1/DataModel.md)
- [PaymentsAndSettlements.md](/Users/macbookpro/Documents/hommie-0-commission-next/docs/planning/arriendo-lifecycle-v1/PaymentsAndSettlements.md)

## Criterio de priorizacion
1. Primero conflictos que pueden romper estados P0.
2. Luego conflictos que afectan exactitud financiera o legal minima.
3. Luego conflictos de consistencia semantica y ownership.

## Decision log (propuesto para ADR)
| Conflict ID | Conflicto | Opcion elegida | Alternativa descartada | Rationale | Impacto |
| --- | --- | --- | --- | --- | --- |
| CR-001 | `lead_status=contract_pending` vs `contract_case_status` detallado | `lead_status` queda macro-embudo; `contract_case_status` modela subetapas internas | unificar ambos en un solo enum | evita romper funnel existente y permite granularidad contractual | requiere tabla de mapeo estado->subestado |
| CR-002 | `pending_document` aparece sin estar en enum canonico | mantener `document_status=pending` y usar `reason_code=document_issue_retry` | agregar `pending_document` al enum | conserva enum simple y evita proliferacion de estados | actualizar guias operativas |
| CR-003 | Momento de `reservation_status=consumed` | marcar `consumed` al evento `contract_issued` exitoso | consumir al crear `contract_case` | evita bloquear reasignaciones tempranas y asegura causalidad | guardrail en emision de contrato |
| CR-004 | Boleta vs resumen en MVP legal minimo | `doc_type` soporta ambos, default operativo `resumen` hasta validacion legal de `boleta` | forzar boleta para todos los casos | reduce riesgo legal temprano sin bloquear flujo financiero | requiere policy flag legal |
| CR-005 | Uso ambiguo de termino arrendatario | pre-emision: `applicant_person`; post-emision: `tenant_person` | usar `arrendatario` para todo el ciclo | mejora precision en roles y permisos | actualizar templates y copys internos |
| CR-006 | Trigger de `unit_status=rented` no definido | `reserved -> rented` en `contract_issued` si `fecha_inicio<=hoy`; si no, job programado a `fecha_inicio` | siempre en `contract_issued` | evita marcar arriendo activo antes de inicio | requiere scheduler simple |
| CR-007 | Falta entidad explicita `tenant_payments` en modelo | introducir entidad logica `tenant_payments` en DataModel v0.2 | derivar pagos desde documentos | evita hueco de trazabilidad y conciliacion | update documental previo a implementacion |
| CR-008 | `owner` como party local vs maestro global | SoT en `owner_master`; `application_parties` guarda snapshot + `owner_master_id` | mantener owner solo en parties | minimiza drift de identidad y permite historico contractual | definir sincronizacion y versionado |
| CR-009 | Limite de edicion de datos entre Ops y Contratos | matriz de ownership por campo y fase | ambos roles editan libremente | reduce sobreescritura y conflictos de auditoria | agregar BR especificas por campo |
| CR-010 | Drift entre `reservation_status` y `unit_status` | `reservation_status` activa es fuente de verdad; `unit_status` derivado con reconciliador | doble escritura sin prioridad | reduce inconsistencia de listing y disponibilidad | requiere job de reconciliacion + alerta |

## Tabla de mapeo acordada (CR-001)
| lead_status | contract_case_status permitido | Nota |
| --- | --- | --- |
| `evaluation_approved` | none | aun sin case |
| `contract_pending` | `drafting`, `hydrated`, `validated` | etapa contractual activa |
| `contract_issued` | `issued` | contrato emitido |
| `closed` | `issued` o `void` | cierre de caso/lead |

## Matriz de ownership por fase (CR-009)
| Fase | Campos owner Ops | Campos owner Contratos | Restriccion |
| --- | --- | --- | --- |
| pre-evaluation | datos contacto lead/applicant | none | contratos no edita |
| evaluation_in_progress | checklist/adjuntos evaluacion | none | cambios sensibles auditados |
| contract_pending | none salvo correccion menor con reason_code | payload contractual, clausulas, tipo contrato | ops no sobreescribe payload |
| post-issue | none | solo void flow autorizado | datos emitidos inmutables |

## Riesgos residuales
1. Politica legal de `boleta` puede cambiar y exigir re-trabajo.
2. Scheduler para `fecha_inicio` futura agrega complejidad operativa.
3. Migracion a `owner_master` requiere estrategia de backfill.

## Entradas directas para ADR-001
1. Modelo dual de estados macro/micro (CR-001).
2. Politica de estados documentales sin enum extra (CR-002).
3. Trigger canonicamente definido para consumo de reserva (CR-003).
4. Definicion de roles por etapa (`applicant_person` vs `tenant_person`) (CR-005).
5. SoT de propietario y pagos (CR-007, CR-008).

## DoD de ELK-23
- [x] Conflictos priorizados y resueltos con opcion elegida.
- [x] Alternativas descartadas y rationale documentados.
- [x] Inputs listos para ADR-001 final.

## Changelog
- v0.1 (2026-02-26): Resolucion inicial de conflictos semanticos y decision log para ADR.
