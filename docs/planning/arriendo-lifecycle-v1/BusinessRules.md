# Business Rules Catalog - Arriendo Lifecycle v1

## Document Control
- Version: v0.1
- Status: Draft
- Owner: Product + Operaciones + Finanzas + Contratos
- Last Updated: 2026-02-26

## Rule Priority Model
- P0 (Hard blocker): regla no negociable, bloquea transicion.
- P1 (Strong): regla que puede tener excepcion solo con aprobacion de rol superior + auditoria.
- P2 (Operational): regla recomendada que no bloquea, pero deja warning.

## Conflict Resolution Policy
1. Aplicar primero reglas P0.
2. Si hay conflicto entre reglas de igual prioridad, gana la regla de seguridad/legal.
3. Si sigue conflicto, gana la regla mas especifica por tipo de contrato.
4. Overrides manuales solo para P1/P2, nunca para P0.
5. Todo override debe registrar `workflow_event` con `reason_code`.

## Rules by Domain

### Lead and Quote
| ID | Rule | Trigger | Enforcement | Priority | Exception |
| --- | --- | --- | --- | --- | --- |
| BR-001 | Todo lead nuevo inicia en `interested` | create lead | reject estado distinto | P0 | none |
| BR-002 | Lead debe tener canal de origen | create lead | require `source` | P1 | supervisor override |
| BR-003 | Datos minimos lead: nombre + contacto | create lead | schema validation | P0 | none |
| BR-004 | Lead cerrado no vuelve a `interested` | update lead_status | transition guard | P1 | re-open con aprobacion |
| BR-005 | Cotizacion solo para unidad disponible | generate quote | check unit_status=available | P0 | none |
| BR-006 | Cada cotizacion guarda snapshot inmutable | quote generated | persist snapshot_id | P0 | none |
| BR-007 | Moneda y redondeo definidos en quote | quote calculation | deterministic formula | P1 | none |
| BR-008 | Cotizacion tiene vigencia explicita | quote generated | include expires_at | P2 | none |

### Lead to Applicant and Assignment
| ID | Rule | Trigger | Enforcement | Priority | Exception |
| --- | --- | --- | --- | --- | --- |
| BR-009 | Solo lead en `quoted` puede pasar a `applicant` | convert action | transition guard | P0 | none |
| BR-010 | Conversion lead->applicant requiere actor interno autorizado | convert action | RBAC check | P0 | none |
| BR-011 | Se crea `rental_application` unica por conversion | convert action | unique application per action | P1 | merge manual autorizado |
| BR-012 | Asignacion de unidad debe ser deterministica (regla configurable) | assign unit | assignment policy | P1 | manual assignment |
| BR-013 | Unidad asignada debe pertenecer a inventario activo | assign unit | inventory validation | P0 | none |
| BR-014 | Cambio de unidad asignada requiere motivo | reassign unit | reason required | P1 | none |

### Reservation and Listing
| ID | Rule | Trigger | Enforcement | Priority | Exception |
| --- | --- | --- | --- | --- | --- |
| BR-015 | Maximo 1 reserva activa por unidad | create reservation | unique active index (logical) | P0 | none |
| BR-016 | Reserva activa requiere `application_id` | create reservation | foreign key required | P0 | none |
| BR-017 | Reserva activa define `expires_at` | create reservation | TTL required | P1 | none |
| BR-018 | Reserva `expired/cancelled` libera unidad | reservation update | unit_status sync | P0 | none |
| BR-019 | Reserva `consumed` no puede volver a `active` | reservation update | transition guard | P0 | none |
| BR-020 | Al crear reserva activa, unidad pasa a `reserved` | create reservation | state sync | P0 | none |
| BR-021 | Unidad `reserved` se baja de listing publico | unit status change | publication sync | P0 | none |

### Evaluation
| ID | Rule | Trigger | Enforcement | Priority | Exception |
| --- | --- | --- | --- | --- | --- |
| BR-022 | Evaluacion inicia solo con reserva activa | start evaluation | check reservation_status=active | P0 | none |
| BR-023 | Evaluacion requiere checklist versionado | start evaluation | checklist id required | P1 | none |
| BR-024 | Decision requiere actor evaluador autorizado | decision submit | RBAC check | P0 | none |
| BR-025 | Rechazo requiere reason_code y comentario | decision reject | mandatory fields | P0 | none |
| BR-026 | Aprobacion bloqueada si faltan datos criticos | decision approve | completeness gate | P0 | none |
| BR-027 | `evaluation_rejected` habilita reasignacion | reject decision | workflow branch | P1 | close case |
| BR-028 | `evaluation_approved` crea contract_case | approve decision | auto case creation | P0 | none |
| BR-029 | Una application no puede tener 2 evaluaciones activas | evaluation start | unique active evaluation | P0 | none |

### Contract and Hydration
| ID | Rule | Trigger | Enforcement | Priority | Exception |
| --- | --- | --- | --- | --- | --- |
| BR-030 | Contract case inicia en `drafting` | create contract_case | default state | P0 | none |
| BR-031 | Tipo de contrato permitido: standard/subarriendo_propietario | set contract_type | enum validation | P0 | none |
| BR-032 | contract_pending requiere evaluacion aprobada | move to pending | transition guard | P0 | none |
| BR-033 | Hydratacion usa 3 fuentes: postulante/aval + propietario + empresa | hydrate payload | source merge policy | P0 | none |
| BR-034 | Precedencia: confirmacion postulante > registro previo > defaults | hydrate payload | precedence engine | P1 | none |
| BR-035 | Campos faltantes bloquean emision | pre-issue validation | blocking validator | P0 | none |
| BR-036 | Tipo subarriendo_propietario aplica reglas especificas | contract validation | profile checks | P0 | none |
| BR-037 | Payload hidratado guarda metadata de origen por campo | hydrate payload | provenance map | P1 | none |
| BR-038 | Emision contrato requiere template activo compatible | issue contract | template guard | P0 | none |
| BR-039 | Emision contrato es idempotente por hash request | issue contract | idempotency check | P0 | none |
| BR-040 | Contrato emitido es inmutable salvo anulacion controlada | post-issue | write protection | P0 | void flow |
| BR-041 | Toda anulacion requiere aprobacion admin + motivo | void contract | RBAC + reason_code | P1 | none |

### Tenant Payments and Documents
| ID | Rule | Trigger | Enforcement | Priority | Exception |
| --- | --- | --- | --- | --- | --- |
| BR-042 | Modelo de cobro centralizado obligatorio en MVP | register payment | source_of_funds check | P0 | none |
| BR-043 | Pago aplica a contrato emitido activo | register payment | contract state check | P0 | none |
| BR-044 | Pago `paid` crea evento financiero auditado | payment update | workflow_event | P0 | none |
| BR-045 | Pago fallido no puede emitir documento final | payment fail | document gate | P0 | pending_document |
| BR-046 | Reintentos de cobro deben ser idempotentes por referencia externa | payment retry | external_ref uniqueness | P1 | none |
| BR-047 | Todo pago `paid` requiere boleta/resumen | payment paid | document generation required | P0 | none |
| BR-048 | Documento debe referenciar payment_id y contract_id | document issue | referential check | P0 | none |
| BR-049 | Reemision documental requiere versionado | document reissue | version increment | P1 | none |

### Owner Settlements
| ID | Rule | Trigger | Enforcement | Priority | Exception |
| --- | --- | --- | --- | --- | --- |
| BR-050 | Settlement se calcula por periodo cerrado | build settlement | period lock | P1 | reopen with approval |
| BR-051 | Neto = ingresos - deducciones en orden definido | settlement calc | formula engine | P0 | none |
| BR-052 | Deducciones deben pertenecer a catalogo permitido | add deduction | category whitelist | P0 | none |
| BR-053 | Deducciones manuales requieren respaldo | manual deduction | attachment required | P1 | none |
| BR-054 | Cierre de settlement requiere conciliacion sin diferencias no explicadas | close settlement | reconciliation gate | P0 | none |
| BR-055 | Settlement cerrado no editable, solo ajustable | post-close | status lock | P0 | adjustment flow |
| BR-056 | Pago a propietario se ejecuta solo desde settlement `closed` | payout | status guard | P0 | none |
| BR-057 | Contracargo post-cierre crea ajuste `adjusted` | reverse payment | adjustment workflow | P0 | none |
| BR-058 | Ajuste conserva historial completo de line items | adjustment | immutable ledger rows | P1 | none |
| BR-059 | Disputa de propietario abre ticket con SLA | dispute raised | case creation | P2 | none |

### Audit, Security and Governance
| ID | Rule | Trigger | Enforcement | Priority | Exception |
| --- | --- | --- | --- | --- | --- |
| BR-060 | Toda transicion de estado produce workflow_event | any state change | mandatory event write | P0 | none |
| BR-061 | Event debe incluir actor_id y request_id | event write | schema requirement | P0 | none |
| BR-062 | Logs no deben exponer PII sensible | logging | masking policy | P0 | none |
| BR-063 | Permisos por rol para operaciones criticas | protected actions | RBAC matrix | P0 | none |
| BR-064 | Overrides manuales requieren reason_code | manual override | reason mandatory | P1 | none |
| BR-065 | Operaciones criticas deben soportar idempotency-key | API call | request validation | P1 | none |
| BR-066 | Fallos parciales requieren reintento seguro | transient failure | retry policy | P1 | none |
| BR-067 | Retencion de eventos >= 24 meses | audit retention | retention policy | P2 | legal override |
| BR-068 | Cambios de reglas requieren decision log | governance update | ADR entry required | P2 | none |
| BR-069 | Emision/void de contrato limitado a admin/editor | contract actions | RBAC strict | P0 | none |
| BR-070 | Cierre settlement limitado a finanzas autorizadas | settlement close | RBAC strict | P0 | none |
| BR-071 | Reapertura de periodo requiere doble aprobacion | reopen period | two-person rule | P1 | none |
| BR-072 | Toda accion denegada genera evento de seguridad | access denied | security event | P1 | none |

## Rule Versioning
- Estructura de version: `BR-xxx@version`.
- Cambios de severidad o comportamiento deben crear nueva version y actualizar decision log.
- Cambios retrocompatibles deben documentar impacto en AC y riesgos.

## Changelog
- v0.1 (2026-02-26): Catalogo inicial BR-001..BR-072 con prioridades y politica de conflictos.
