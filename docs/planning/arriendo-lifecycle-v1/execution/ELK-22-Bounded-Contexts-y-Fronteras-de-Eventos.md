# ELK-22 - Bounded Contexts y Fronteras de Eventos

## Document Control
- Issue: ELK-22
- Parent: ELK-11
- Version: v0.1
- Status: Draft (DoD completado para ELK-22)
- Owner: Founder + AI pair
- Last Updated: 2026-02-26

## Objetivo
Delimitar bounded contexts y fronteras de eventos para reducir acoplamiento semantico y clarificar ownership de datos en el flujo E2E.

## Fuentes base
- [ELK-20-Mapa-Actores-y-Entidades-Canonicas.md](/Users/macbookpro/Documents/hommie-0-commission-next/docs/planning/arriendo-lifecycle-v1/execution/ELK-20-Mapa-Actores-y-Entidades-Canonicas.md)
- [ELK-21-Diccionario-v0-y-Aliases-Prohibidos.md](/Users/macbookpro/Documents/hommie-0-commission-next/docs/planning/arriendo-lifecycle-v1/execution/ELK-21-Diccionario-v0-y-Aliases-Prohibidos.md)
- [FlowMap.md](/Users/macbookpro/Documents/hommie-0-commission-next/docs/planning/arriendo-lifecycle-v1/FlowMap.md)
- [DataModel.md](/Users/macbookpro/Documents/hommie-0-commission-next/docs/planning/arriendo-lifecycle-v1/DataModel.md)
- [ApiContracts.md](/Users/macbookpro/Documents/hommie-0-commission-next/docs/planning/arriendo-lifecycle-v1/ApiContracts.md)
- [PaymentsAndSettlements.md](/Users/macbookpro/Documents/hommie-0-commission-next/docs/planning/arriendo-lifecycle-v1/PaymentsAndSettlements.md)

## Context Map (propuesto)
| Context | Responsabilidad | Entidades owner | No owner (solo consume) |
| --- | --- | --- | --- |
| C1 `LeadAndQuote` | Captura lead + cotizacion + conversion a applicant | `leads`, `quote_snapshot` | `unit_reservations`, `contract_cases` |
| C2 `ApplicationAndReservation` | Gestion de postulacion, asignacion y reserva | `rental_applications`, `unit_reservations` | `owner_settlements`, `tenant_payment_documents` |
| C3 `Evaluation` | Checklist y decision approve/reject | `evaluation_status`, `evaluation_decision` | `tenant_payments`, `owner_settlements` |
| C4 `Contracting` | Hidratar, validar y emitir contrato | `contract_cases`, `hydrated_payload_json` | `owner_settlements` |
| C5 `TenantCollections` | Registro de cobro + documento de arrendatario | `tenant_payments` (logical), `tenant_payment_documents` | `rental_applications` (solo lectura) |
| C6 `OwnerSettlement` | Calculo neto, cierre y payout propietario | `owner_settlements`, `settlement_line_items` | `leads` |
| C7 `AuditAndGovernance` | Bitacora de eventos y politicas de control | `workflow_events` | n/a (consume de todos) |

## Fronteras por contexto

### C1 LeadAndQuote
- Entrada:
  - `create_lead`
  - `generate_quote`
  - `convert_to_applicant`
- Salida:
  - `lead_created`
  - `quote_generated`
  - `lead_converted_to_applicant`
- Regla de frontera:
  - No escribe `rental_applications` directamente; emite evento de conversion y C2 crea entidad.

### C2 ApplicationAndReservation
- Entrada:
  - `lead_converted_to_applicant`
  - `assign_unit`
  - `reserve_unit`
  - `release_reservation`
- Salida:
  - `application_created`
  - `unit_assigned`
  - `reservation_created`
  - `reservation_expired`
  - `reservation_cancelled`
- Regla de frontera:
  - `reservation_status=active` es fuente de verdad de exclusividad.

### C3 Evaluation
- Entrada:
  - `start_evaluation`
  - `submit_evaluation_decision`
- Salida:
  - `evaluation_started`
  - `evaluation_approved`
  - `evaluation_rejected`
- Regla de frontera:
  - No modifica reserva ni contrato; solo emite decision.

### C4 Contracting
- Entrada:
  - `evaluation_approved`
  - `hydrate_contract_payload`
  - `validate_contract_case`
  - `issue_contract`
- Salida:
  - `contract_case_created`
  - `contract_hydrated`
  - `contract_validated`
  - `contract_issued`
  - `contract_voided`
- Regla de frontera:
  - Emision es idempotente y produce unico `issued_contract_id`.

### C5 TenantCollections
- Entrada:
  - `register_tenant_payment`
  - `issue_tenant_payment_document`
  - `reverse_tenant_payment`
- Salida:
  - `tenant_payment_registered`
  - `tenant_document_issued`
  - `payment_reversed`
- Regla de frontera:
  - No cierra settlement; solo entrega eventos financieros a C6.

### C6 OwnerSettlement
- Entrada:
  - `tenant_payment_registered`
  - `tenant_document_issued`
  - `payment_reversed`
  - `close_owner_settlement`
- Salida:
  - `owner_settlement_calculated`
  - `owner_settlement_closed`
  - `owner_settlement_paid`
  - `settlement_adjusted`
- Regla de frontera:
  - Formula neta y orden de deducciones solo vive en C6.

### C7 AuditAndGovernance
- Entrada:
  - todos los eventos de C1..C6
- Salida:
  - alertas/controles (`access_denied`, drift de estado, duplicidad)
- Regla de frontera:
  - No altera estado de negocio; solo registra y alerta.

## Contratos de eventos en frontera
| Event | Producer | Consumer principal | Campos minimos |
| --- | --- | --- | --- |
| `lead_converted_to_applicant` | C1 | C2 | `lead_id`, `application_id`, `actor_id`, `request_id` |
| `reservation_created` | C2 | C3 | `reservation_id`, `application_id`, `unit_id`, `expires_at` |
| `evaluation_approved` | C3 | C4 | `application_id`, `reason_code`, `actor_id` |
| `contract_issued` | C4 | C5, C6 | `contract_case_id`, `issued_contract_id`, `tenant_id`, `owner_id` |
| `tenant_payment_registered` | C5 | C6 | `payment_id`, `amount_clp`, `billing_period`, `status` |
| `payment_reversed` | C5 | C6 | `payment_id`, `amount_clp`, `reason_code`, `source_reference` |
| `owner_settlement_closed` | C6 | C7 | `settlement_id`, `net_amount_clp`, `payout_instruction_id` |

## Reglas de acoplamiento permitidas
1. Un contexto no puede escribir tablas owner de otro contexto.
2. Integracion entre contextos por API contract o evento, nunca por update cruzado directo.
3. Event payload debe incluir `event_id`, `request_id`, `occurred_at`, `actor_id`.
4. Para side effects criticos, consumidor debe ser idempotente.

## Dependencias cruzadas de mayor riesgo
| Riesgo | Contextos involucrados | Mitigacion |
| --- | --- | --- |
| Drift entre `unit_status` y `reservation_status` | C2 <-> C7 | reconciliador y alerta diaria |
| Emision contractual duplicada por reintento | C4 | hash + `Idempotency-Key` + unique constraint |
| Pago registrado sin contrato emitido | C5 <-> C4 | guard contractual estricto |
| Settlement cerrado con reverso pendiente | C6 <-> C5 | check de reversos abiertos antes de close |
| Ambiguedad owner snapshot vs owner master | C4 <-> C6 | decision de SoT en ADR input (ELK-23) |

## Decisiones pendientes para ADR
1. Definir entidad explicita `tenant_payments` en DataModel v0.2.
2. Definir trigger final de `reservation_status=consumed`.
3. Definir politica legal MVP para `doc_type=boleta|resumen`.
4. Definir SoT de `owner` (master + snapshot por contrato).
5. Definir matriz de campos editables por `ops_agent` vs `contracts_editor`.

## DoD de ELK-22
- [x] Contextos delimitados con ownership de entidades.
- [x] Fronteras de eventos por contexto documentadas.
- [x] Dependencias y riesgos cruzados explicitados.
- [x] Lista de decisiones pendientes para ADR preparada.

## Changelog
- v0.1 (2026-02-26): Context map inicial, fronteras de eventos y riesgos de acoplamiento.
