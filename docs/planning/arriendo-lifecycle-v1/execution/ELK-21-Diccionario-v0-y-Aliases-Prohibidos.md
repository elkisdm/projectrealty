# ELK-21 - Diccionario v0 y Aliases Prohibidos

## Document Control
- Issue: ELK-21
- Parent: ELK-11
- Version: v0.1
- Status: Draft (DoD completado para ELK-21)
- Owner: Founder + AI pair
- Last Updated: 2026-02-26

## Objetivo
Publicar un diccionario v0 con terminos canonicos y aliases prohibidos para estandarizar comunicacion entre Producto, Operaciones, Contratos y Finanzas.

## Fuentes base
- [ELK-19-Inventario-Terminos-y-Fuentes.md](/Users/macbookpro/Documents/hommie-0-commission-next/docs/planning/arriendo-lifecycle-v1/execution/ELK-19-Inventario-Terminos-y-Fuentes.md)
- [ELK-20-Mapa-Actores-y-Entidades-Canonicas.md](/Users/macbookpro/Documents/hommie-0-commission-next/docs/planning/arriendo-lifecycle-v1/execution/ELK-20-Mapa-Actores-y-Entidades-Canonicas.md)
- [FlowMap.md](/Users/macbookpro/Documents/hommie-0-commission-next/docs/planning/arriendo-lifecycle-v1/FlowMap.md)
- [DataModel.md](/Users/macbookpro/Documents/hommie-0-commission-next/docs/planning/arriendo-lifecycle-v1/DataModel.md)
- [BusinessRules.md](/Users/macbookpro/Documents/hommie-0-commission-next/docs/planning/arriendo-lifecycle-v1/BusinessRules.md)
- [PaymentsAndSettlements.md](/Users/macbookpro/Documents/hommie-0-commission-next/docs/planning/arriendo-lifecycle-v1/PaymentsAndSettlements.md)

## Reglas de nomenclatura
1. Estados siempre con agregado explicito.
2. Entidades en singular tecnico (`contract_case`) y plural solo para tablas (`contract_cases`).
3. No mezclar terminos de etapa comercial con terminos de etapa contractual.

## Diccionario v0 (canonico)

### Flujo comercial-operativo
| Termino canonico | Definicion | Uso permitido |
| --- | --- | --- |
| `lead` | Interes comercial inicial capturado | etapa pre-cotizacion y cotizacion |
| `quote_snapshot` | Snapshot inmutable de cotizacion | evidencia de conversion a applicant |
| `applicant_person` | Persona postulante antes de contrato emitido | evaluacion y contratos pre-issue |
| `rental_application` | Caso operativo derivado de lead | eje de evaluacion y reserva |
| `assigned_unit_id` | Unidad candidata de una postulacion | asignacion y reasignacion |
| `unit` | Activo arrendable del inventario | disponibilidad/listing |
| `unit_reservation` | Bloqueo temporal de unidad para postulacion | exclusividad operativa |
| `evaluation_status` | Estado de evaluacion documental/financiera | `pending|in_progress|approved|rejected` |

### Flujo contractual
| Termino canonico | Definicion | Uso permitido |
| --- | --- | --- |
| `contract_case` | Caso de preparacion contractual | desde approved hasta issued/void |
| `contract_type` | Tipo contractual (`standard`, `subarriendo_propietario`) | validaciones y plantillas |
| `hydrated_payload_json` | Payload canonico de contrato ya hidratado | gate previo a validacion/emision |
| `hydration_provenance_json` | Origen por campo del payload hidratado | auditoria y trazabilidad |
| `issued_contract_id` | Referencia al contrato emitido | estado `issued` del case |
| `tenant_person` | Persona arrendataria activa post-emision | pagos y documentos |

### Flujo financiero
| Termino canonico | Definicion | Uso permitido |
| --- | --- | --- |
| `tenant_payment` | Cobro centralizado al arrendatario | base financiera del periodo |
| `tenant_payment_document` | Documento de pago (`boleta` o `resumen`) | evidencia al arrendatario |
| `owner_settlement` | Liquidacion de propietario por periodo | neto y payout |
| `settlement_line_item` | Movimiento detallado dentro de settlement | deducciones/ajustes/ingresos |
| `payout_reference` | Referencia de transferencia al propietario | cierre financiero |
| `payment_reversed` | Reverso o contracargo aplicado a pago | ajuste de settlement |

### Auditoria y control
| Termino canonico | Definicion | Uso permitido |
| --- | --- | --- |
| `workflow_event` | Evento auditado de transicion/accion critica | trazabilidad transversal |
| `actor_id` | Identificador de actor que ejecuta accion | auditoria obligatoria |
| `request_id` | Correlacion de request y side effects | observabilidad/idempotencia |
| `reason_code` | Motivo estructurado de rechazo/override/anulacion | decisiones auditables |
| `Idempotency-Key` | Llave para reintentos seguros | operaciones criticas |

## Estados canonicos (uso obligatorio)
- `lead_status`: `interested`, `quoted`, `applicant`, `evaluation_in_progress`, `evaluation_approved`, `evaluation_rejected`, `contract_pending`, `contract_issued`, `closed`.
- `unit_status`: `available`, `reserved`, `rented`.
- `reservation_status`: `active`, `expired`, `cancelled`, `consumed`.
- `contract_case_status`: `drafting`, `hydrated`, `validated`, `issued`, `void`.
- `tenant_payment_status`: `pending`, `paid`, `failed`, `reversed`.
- `owner_settlement_status`: `draft`, `ready_to_close`, `closed`, `paid`, `adjusted`.

## Aliases prohibidos
| Alias prohibido | Reemplazo canonico | Motivo |
| --- | --- | --- |
| cliente (generico) | `lead` / `applicant_person` / `tenant_person` | evita confundir etapa |
| postulacion | `rental_application` | evitar termino sin entidad tecnica |
| reserva unidad activa | `unit_reservation` + `reservation_status=active` | estado debe ser explicito |
| contrato borrador | `contract_case_status=drafting` | evitar nombres informales |
| contrato listo | `contract_case_status=validated` | precision de gate |
| pago arrendatario doc | `tenant_payment_document` | entidad formal |
| liquidacion neta | `owner_settlement` | separar entidad de calculo |
| evento sistema | `workflow_event` | uniformidad auditoria |
| request trace | `request_id` | convencion unica |
| idempotencia hash | `Idempotency-Key` | convencion API |
| lead aprobado | `lead_status=evaluation_approved` | estado canonico |
| lead rechazado | `lead_status=evaluation_rejected` | estado canonico |
| depa reservado | `unit_status=reserved` | separar unidad/reserva |
| reserva consumida contrato | `reservation_status=consumed` | estado canonico |
| boleta pendiente | `document_status=pending` + `reason_code` | evita enum fantasma |
| settlement pagado banco | `owner_settlement_status=paid` | estado canonico |
| deuda ajuste | `settlement_line_item` category correspondiente | trazabilidad de ledger |

## Reglas de uso del diccionario
1. Todo issue y documento nuevo debe usar terminos canonicos.
2. Si se requiere nuevo termino, crear propuesta en ELK-23/ADR.
3. No se aceptan aliases prohibidos en FR/AC/BR nuevos.
4. En incidentes, loggear siempre con terminos canonicos.

## DoD de ELK-21
- [x] Diccionario v0 con terminos y definiciones.
- [x] Lista de aliases prohibidos y reemplazos.
- [x] Reglas de uso para tickets y documentacion.

## Changelog
- v0.1 (2026-02-26): Diccionario v0 inicial y aliases prohibidos.
