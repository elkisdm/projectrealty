# ELK-20 - Mapa de Actores y Entidades Canonicas

## Document Control
- Issue: ELK-20
- Parent: ELK-11
- Version: v0.1
- Status: Draft (DoD completado para ELK-20)
- Owner: Founder + AI pair
- Last Updated: 2026-02-26

## Objetivo
Definir actores y entidades canonicas del dominio para eliminar duplicidad conceptual en requerimientos, datos y decisiones de arquitectura.

## Fuentes revisadas
- [FlowMap.md](/Users/macbookpro/Documents/hommie-0-commission-next/docs/planning/arriendo-lifecycle-v1/FlowMap.md)
- [DataModel.md](/Users/macbookpro/Documents/hommie-0-commission-next/docs/planning/arriendo-lifecycle-v1/DataModel.md)
- [BusinessRules.md](/Users/macbookpro/Documents/hommie-0-commission-next/docs/planning/arriendo-lifecycle-v1/BusinessRules.md)
- [PRD.md](/Users/macbookpro/Documents/hommie-0-commission-next/docs/planning/arriendo-lifecycle-v1/PRD.md)
- [ApiContracts.md](/Users/macbookpro/Documents/hommie-0-commission-next/docs/planning/arriendo-lifecycle-v1/ApiContracts.md)
- [ContractHydrationSpec.md](/Users/macbookpro/Documents/hommie-0-commission-next/docs/planning/arriendo-lifecycle-v1/ContractHydrationSpec.md)
- [PaymentsAndSettlements.md](/Users/macbookpro/Documents/hommie-0-commission-next/docs/planning/arriendo-lifecycle-v1/PaymentsAndSettlements.md)
- [ELK-19-Inventario-Terminos-y-Fuentes.md](/Users/macbookpro/Documents/hommie-0-commission-next/docs/planning/arriendo-lifecycle-v1/execution/ELK-19-Inventario-Terminos-y-Fuentes.md)

## Convenciones
1. Actor canonico: rol funcional estable (no nombre persona).
2. Entidad canonica: agregado o registro con responsabilidad clara.
3. Cada accion critica debe mapear actor + entidad + evento de auditoria.

## Mapa de actores canonicos

### Actores internos
| Actor canonico | Tipo | Responsabilidad principal | Etapas del flujo |
| --- | --- | --- | --- |
| `ops_agent` | Humano interno | Convertir lead a postulante, asignar/reasignar unidad, gestionar reserva | lead, application, reservation |
| `evaluation_analyst` | Humano interno | Ejecutar checklist y decidir aprobacion/rechazo | evaluation |
| `contracts_editor` | Humano interno | Hidratar, validar y emitir contrato | contract_case |
| `finance_editor` | Humano interno | Registrar pagos, emitir documentos, cerrar settlement | payments, settlements |
| `admin` | Humano interno | Overrides P1/P2, anulaciones y acciones excepcionales | cross-cutting |
| `product_owner` | Humano interno | Gobernanza de reglas, alcance y criterios de aceptacion | governance |
| `system_orchestrator` | Sistema interno | Orquestar transiciones y side effects idempotentes | all aggregates |

### Actores externos
| Actor canonico | Tipo | Responsabilidad principal | Etapas del flujo |
| --- | --- | --- | --- |
| `lead_contact` | Cliente potencial | Entregar datos iniciales y recibir cotizacion | lead, quote |
| `applicant_person` | Cliente postulante | Confirmar antecedentes para evaluacion y contrato | application, evaluation, contract |
| `guarantor_person` | Tercero externo | Proveer respaldo documental/economico del postulante | evaluation, contract |
| `owner_person` | Cliente propietario | Proveer datos de titularidad y recibir liquidacion | contract, settlement |
| `tenant_person` | Cliente arrendatario activo | Realizar pago y recibir boleta/resumen | payments, documents |
| `payment_gateway` | Proveedor externo | Autorizar/confirmar pagos y reportar reversos | payments |
| `document_service` | Proveedor externo | Emitir documento de pago y versionado | tenant_payment_document |
| `payout_channel` | Proveedor externo | Ejecutar transferencia al propietario | owner_settlement |

## Matriz actor -> entidad -> accion
| Actor | Entidades que escribe | Entidades que lee | Acciones criticas |
| --- | --- | --- | --- |
| `ops_agent` | `leads`, `rental_applications`, `unit_reservations` | `units`, `quotes` | convert-to-applicant, assign-unit, reserve-unit |
| `evaluation_analyst` | `rental_applications` (evaluation), `workflow_events` | `application_parties`, `unit_reservations` | evaluation/start, evaluation/decision |
| `contracts_editor` | `contract_cases`, `workflow_events` | `application_parties`, `owner data`, `company defaults` | hydrate payload, issue contract |
| `finance_editor` | `tenant_payments` (logical), `tenant_payment_documents`, `owner_settlements`, `settlement_line_items` | `contract_cases`, `payments`, `events` | register payment, issue document, close settlement |
| `admin` | overrides auditados en agregados criticos | todo con RBAC | void/override/reopen |
| `system_orchestrator` | side effects + sincronizaciones | todos los agregados | listing sync, idempotency reuse, retries |
| `lead_contact` | datos de contacto y preferencia (via canales) | cotizacion | lead capture |
| `applicant_person` | confirmacion datos postulante | estado postulacion | applicant confirmation |
| `guarantor_person` | datos aval | requerimientos evaluacion | guarantor confirmation |
| `owner_person` | datos propietario y payout | settlement/resumen | owner onboarding, dispute |
| `tenant_person` | instruccion de pago | documento de pago | tenant payment |
| `payment_gateway` | confirmacion/fracaso/reverso pago | request de cobro | payment callback |
| `document_service` | emision/fracaso documento | payload documento | document issue/retry |
| `payout_channel` | confirmacion/rechazo payout | instruccion de payout | owner payout |

## Entidades canonicas y ownership
| Entidad canonica | Owner funcional | Source of truth | Observaciones |
| --- | --- | --- | --- |
| `leads` | Operaciones/Comercial | Lifecycle domain | entrada del funnel |
| `quotes` (snapshot) | Operaciones | Quote snapshot inmutable | vigencia obligatoria |
| `rental_applications` | Operaciones | Lifecycle domain | eje de postulacion/evaluacion |
| `application_parties` | Operaciones + Contratos | Lifecycle domain | applicant, guarantor, owner, company rep |
| `units` | Inventario/Operaciones | Catalogo de unidades | entidad existente fuera de este paquete |
| `unit_reservations` | Operaciones | Reservation aggregate | unicidad activa por `unit_id` |
| `contract_cases` | Contratos | Contract aggregate | estados propios de emision |
| `contracts` (emitidos) | Contratos | Contract storage | inmutable salvo void controlado |
| `tenant_payments` (logical) | Finanzas | Payment aggregate | falta entidad explicita en DataModel v0.1 |
| `tenant_payment_documents` | Finanzas | Document aggregate | versionado por reemision |
| `owner_settlements` | Finanzas | Settlement aggregate | cierre y payout |
| `settlement_line_items` | Finanzas | Settlement ledger | no eliminable post-cierre |
| `workflow_events` | Todos (escritura), Security/Ops (control) | Audit aggregate | obligatorio en transiciones P0 |

## Relaciones criticas (resumen)
1. `lead` 1:N `rental_application`.
2. `rental_application` 1:N `unit_reservation`.
3. `rental_application` 1:N `application_parties`.
4. `rental_application` 1:N `contract_case`.
5. `contract_case` 1:N `tenant_payments` (logical).
6. `tenant_payments` 1:N `tenant_payment_documents`.
7. `owner_settlement` 1:N `settlement_line_items`.
8. `workflow_events` N:1 hacia cualquier agregado (lead/application/reservation/contract/payment/settlement).

## Fronteras difusas y dudas abiertas
| ID | Frontera difusa | Riesgo | Decision pendiente |
| --- | --- | --- | --- |
| FD-001 | `owner` como party de application vs maestro global de propietarios | duplicidad/identidad inconsistente | definir entidad maestra y estrategia de referenciacion |
| FD-002 | Ausencia de entidad explicita `tenant_payments` en DataModel | hueco de trazabilidad financiera | incorporar entidad logica en proxima iteracion de modelo |
| FD-003 | Paso exacto de `applicant_person` a `tenant_person` | reportes y permisos ambiguos | fijar trigger: `contract_issued` |
| FD-004 | Limite entre `ops_agent` y `contracts_editor` en correccion de datos | sobreescritura de campos y conflicto de ownership | definir matriz de campo editable por rol |
| FD-005 | Sincronizacion `unit_status` vs `reservation_status` en fallas parciales | disponibilidad publica inconsistente | definir reconciliador y prioridad de fuente |
| FD-006 | Alcance operativo de `document_service` (boleta vs resumen) | riesgo legal/tributario | cerrar decision legal minima MVP |

## Propuesta de decision operativa para ADR
1. SoT de actor por etapa:
   - pre-contrato: `lead_contact` / `applicant_person`.
   - post-contrato: `tenant_person`.
2. SoT de entidad financiera:
   - introducir `tenant_payments` como agregado explicito antes de S2.
3. SoT de propietario:
   - `owner_master` global + referencia en `application_parties`.

## DoD de ELK-20
- [x] Actores internos/externos enumerados con responsabilidad.
- [x] Entidades canonicas y ownership definidos.
- [x] Relaciones criticas explicitadas para producto y tech.
- [x] Fronteras difusas identificadas para discusion en `ELK-22`/`ELK-23`.

## Handoff
- Entrada para `ELK-22`: usar este mapa para delimitar bounded contexts y eventos por frontera.
- Entrada para `ELK-23`: resolver FD-001..FD-006 con decisiones ADR.

## Changelog
- v0.1 (2026-02-26): Mapa actor-entidad canonico inicial y fronteras difusas.
