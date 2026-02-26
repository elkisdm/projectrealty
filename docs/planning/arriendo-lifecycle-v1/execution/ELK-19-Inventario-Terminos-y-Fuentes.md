# ELK-19 - Inventario de Terminos y Fuentes

## Document Control
- Issue: ELK-19
- Parent: ELK-11
- Version: v0.1
- Status: Draft (DoD completado para ELK-19)
- Owner: Founder + AI pair
- Last Updated: 2026-02-26

## Objetivo
Construir un inventario inicial de terminos del dominio de arriendo E2E y registrar su fuente primaria para reducir ambiguedad antes de ADR-001 final.

## Fuentes revisadas
- [FlowMap.md](/Users/macbookpro/Documents/hommie-0-commission-next/docs/planning/arriendo-lifecycle-v1/FlowMap.md)
- [DataModel.md](/Users/macbookpro/Documents/hommie-0-commission-next/docs/planning/arriendo-lifecycle-v1/DataModel.md)
- [BusinessRules.md](/Users/macbookpro/Documents/hommie-0-commission-next/docs/planning/arriendo-lifecycle-v1/BusinessRules.md)
- [PRD.md](/Users/macbookpro/Documents/hommie-0-commission-next/docs/planning/arriendo-lifecycle-v1/PRD.md)
- [ApiContracts.md](/Users/macbookpro/Documents/hommie-0-commission-next/docs/planning/arriendo-lifecycle-v1/ApiContracts.md)
- [ContractHydrationSpec.md](/Users/macbookpro/Documents/hommie-0-commission-next/docs/planning/arriendo-lifecycle-v1/ContractHydrationSpec.md)
- [PaymentsAndSettlements.md](/Users/macbookpro/Documents/hommie-0-commission-next/docs/planning/arriendo-lifecycle-v1/PaymentsAndSettlements.md)
- [AcceptanceCriteria.md](/Users/macbookpro/Documents/hommie-0-commission-next/docs/planning/arriendo-lifecycle-v1/AcceptanceCriteria.md)

## Convencion de normalizacion (temporal)
1. Canonico tecnico: `snake_case` por agregado/estado/evento.
2. Canonico operativo: etiqueta en espanol mapeada 1:1 al termino tecnico.
3. Queda prohibido usar estados sin agregado explicito (ejemplo: decir solo "closed").

## Inventario canonico inicial (MVP)
| Termino canonico | Definicion operativa | Fuente primaria | Fuentes secundarias | Notas |
| --- | --- | --- | --- | --- |
| `lead` | Interes comercial inicial previo a postulacion | FlowMap lead flow | PRD FR-001..FR-003, DataModel `leads` | No equivale a arrendatario |
| `quote` / cotizacion | Snapshot comercial versionado para una unidad | BusinessRules BR-005..BR-008 | ApiContracts endpoint quotes | Debe tener vigencia |
| `applicant` / postulante | Lead convertido por accion interna | FlowMap paso 3 | PRD FR-003, ApiContracts convert-to-applicant | Es etapa, no contrato |
| `rental_application` | Caso operacional del postulante para evaluacion/contrato | DataModel entidad `rental_applications` | PRD entidades clave | Soporta reasignacion |
| `assigned_unit_id` | Unidad candidata asociada a una postulacion | DataModel `rental_applications` | BusinessRules BR-012..BR-014 | Puede cambiar con motivo |
| `unit` / unidad | Activo arrendable del inventario | FlowMap unit state machine | Scope MVP, DataModel relaciones | Separar de listing |
| `unit_reservation` | Reserva temporal de unidad para una postulacion | FlowMap paso 4 | DataModel entidad `unit_reservations` | Debe ser unica activa por unidad |
| `contract_case` | Caso de emision contractual antes de contrato emitido | FlowMap paso 8 | DataModel `contract_cases`, PRD FR-009 | Tiene estados propios |
| `hydrated_payload_json` | Payload canonico de contrato ya hidratado | ContractHydrationSpec target payload | DataModel `contract_cases` | Bloquea emision si incompleto |
| `contract_type` | Perfil de reglas contractuales (`standard` o `subarriendo_propietario`) | BusinessRules BR-031 | ContractHydrationSpec tipos en alcance | Driver legal y validacion |
| `tenant_payment` / cobro arrendatario | Registro de pago centralizado de arriendo | Payments objective y lifecycle | PRD FR-012, ApiContracts tenant-payments | Puede fallar o revertirse |
| `tenant_payment_document` | Documento asociado a pago (`boleta`/`resumen`) | Payments document rules | PRD FR-013, DataModel `tenant_payment_documents` | Versionado en reemision |
| `owner_settlement` / liquidacion propietario | Cierre financiero por periodo para propietario | Payments owner settlement lifecycle | PRD FR-014/FR-015, DataModel `owner_settlements` | Base para payout |
| `settlement_line_item` | Movimiento detallado dentro de una liquidacion | DataModel `settlement_line_items` | Payments deduction catalog | Ledger inmutable post-cierre |
| `workflow_event` | Evento de auditoria por transicion o accion critica | FlowMap event map | BusinessRules BR-060..BR-067 | Debe incluir actor/request |
| `Idempotency-Key` | Llave para reintentos seguros sin duplicar efectos | ApiContracts conventions | BusinessRules BR-039, BR-065 | Obligatoria en operaciones criticas |
| `request_id` | Correlacion transversal de request/eventos | ApiContracts conventions | DataModel `workflow_events` | Necesario para auditoria |
| `reason_code` | Codigo obligatorio para rechazos/overrides/void | BusinessRules BR-025, BR-041, BR-064 | ApiContracts evaluation/reverse | Evita decisiones opacas |

## Estados canonicos por agregado

### `lead_status`
- Valores: `interested`, `quoted`, `applicant`, `evaluation_in_progress`, `evaluation_approved`, `evaluation_rejected`, `contract_pending`, `contract_issued`, `closed`.
- Fuente primaria: [FlowMap.md](/Users/macbookpro/Documents/hommie-0-commission-next/docs/planning/arriendo-lifecycle-v1/FlowMap.md) (Lead State Machine).
- Fuente secundaria: [DataModel.md](/Users/macbookpro/Documents/hommie-0-commission-next/docs/planning/arriendo-lifecycle-v1/DataModel.md) (Canonical Enums).

### `unit_status`
- Valores: `available`, `reserved`, `rented`.
- Fuente primaria: FlowMap Unit State Machine.
- Fuente secundaria: DataModel Canonical Enums.

### `reservation_status`
- Valores: `active`, `expired`, `cancelled`, `consumed`.
- Fuente primaria: FlowMap Reservation State Machine.
- Fuente secundaria: DataModel Canonical Enums + BR-015..BR-021.

### `contract_case_status`
- Valores: `drafting`, `hydrated`, `validated`, `issued`, `void`.
- Fuente primaria: FlowMap Contract Case State Machine.
- Fuente secundaria: DataModel additional enums + BR-030..BR-041.

### `evaluation_status`
- Valores: `pending`, `in_progress`, `approved`, `rejected`.
- Fuente primaria: DataModel additional enums.
- Fuente secundaria: ApiContracts evaluation endpoints + BR-022..BR-029.

### `tenant_payment_status`
- Valores: `pending`, `paid`, `failed`, `reversed`.
- Fuente primaria: Payments Tenant Payment Lifecycle.
- Fuente secundaria: DataModel additional enums + ApiContracts tenant-payments.

### `document_status` (tenant docs)
- Valores: `pending`, `issued`, `failed`.
- Fuente primaria: Payments Document Status.
- Fuente secundaria: DataModel `tenant_payment_documents`.

### `owner_settlement_status`
- Valores: `draft`, `ready_to_close`, `closed`, `paid`, `adjusted`.
- Fuente primaria: Payments Owner Settlement Lifecycle.
- Fuente secundaria: DataModel additional enums + BR-050..BR-057.

## Eventos canonicos iniciales
| Evento canonico | Cuando ocurre | Fuente primaria | Uso |
| --- | --- | --- | --- |
| `lead_created` | Creacion de lead valido | PRD tracking events | Funnel top |
| `quote_generated` | Emision de cotizacion | PRD tracking events | Medir paso a quoted |
| `lead_converted_to_applicant` | Conversion interna a postulante | PRD tracking events | Medir paso operativo |
| `unit_assigned` | Asignacion de unidad | PRD tracking events | Trazabilidad de asignacion |
| `reservation_created` | Reserva activa creada | PRD tracking events | Control de unicidad |
| `reservation_expired` | TTL de reserva vence | PRD tracking events | Recovery/reasignacion |
| `evaluation_started` | Inicio de evaluacion | PRD + ApiContracts | SLA evaluacion |
| `evaluation_decided` | Aprobacion/rechazo | PRD + BusinessRules | Gate contractual |
| `contract_hydrated` | Payload contractual completo | PRD + ContractHydrationSpec | Quality gate contrato |
| `contract_issued` | Contrato emitido | PRD + ApiContracts | Conversion objetivo |
| `tenant_payment_registered` | Cobro registrado | Payments audit events | Finanzas |
| `tenant_document_issued` | Boleta/resumen emitido | Payments audit events | Evidencia arrendatario |
| `owner_settlement_closed` | Cierre de liquidacion | Payments audit events | Conciliacion |
| `payment_reversed` | Contracargo/reverso | Payments audit events | Ajuste financiero |
| `settlement_adjusted` | Ajuste post-cierre | Payments audit events | Integridad financiera |

## Ambiguedades priorizadas (input para ELK-23)
| ID | Ambiguedad detectada | Impacto | Fuente de conflicto | Propuesta de resolucion |
| --- | --- | --- | --- | --- |
| AMB-001 | Diferencia entre `lead_status=contract_pending` y `contract_case_status=drafting/hydrated/validated` | Alto: doble lectura de etapa contractual | FlowMap + DataModel + PRD | Definir regla de sincronizacion explicita entre ambos agregados |
| AMB-002 | `pending_document` aparece como estado alterno, pero no esta en Document Status canonico | Alto: inconsistencia de estado documental | FlowMap A6 + Payments Document Status | Decidir si `pending_document` se integra al enum o pasa a flag tecnico |
| AMB-003 | Momento exacto de paso `reservation_status=consumed` | Alto: puede bloquear contrato o liberar mal unidad | FlowMap guardrails vs transiciones | Fijar trigger unico: al emitir contrato o al iniciar drafting |
| AMB-004 | Definicion operativa/legal de "boleta" vs "resumen" | Alto: riesgo legal/tributario | Payments open legal items | Cerrar politica legal minima y naming oficial MVP |
| AMB-005 | Termino "arrendatario" se usa antes y despues de contrato emitido | Medio: confusion de actor en operaciones | PRD/Payments/FlowMap | Definir alias temporal: antes de emision = postulante, despues = arrendatario activo |
| AMB-006 | `unit_status=rented` depende de "activacion de arriendo" no definida | Medio: transicion incompleta | FlowMap unit transitions | Definir evento activador y requisito documental |
| AMB-007 | `tenant_payment_documents.payment_id` sin entidad `payments` explicita en DataModel | Medio: hueco de modelo logico | DataModel + ApiContracts | Agregar entidad logica `tenant_payments` en siguiente iteracion |
| AMB-008 | Alcance de "owner" en `application_parties` vs maestro propietario global | Medio: posible duplicidad de identidad | DataModel + ContractHydrationSpec | Definir SoT y estrategia de referencia cruzada |

## DoD de ELK-19
- [x] Terminos detectados en docs y tickets de S1.
- [x] Fuente primaria registrada por termino/estado/evento.
- [x] Ambiguedades prioritarias identificadas para resolucion en ADR.

## Handoff
- Entrada directa para `ELK-20`: actores y entidades canonicas con mapa de responsabilidades.
- Entrada directa para `ELK-23`: cerrar AMB-001..AMB-008 con decisiones ADR.

## Changelog
- v0.1 (2026-02-26): Inventario inicial de terminos, estados, eventos y ambiguedades priorizadas (ELK-19).
