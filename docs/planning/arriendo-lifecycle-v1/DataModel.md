# Logical Data Model - Arriendo Lifecycle v1

## Document Control
- Version: v0.1
- Status: Draft
- Owner: Engineering + Product
- Last Updated: 2026-02-26

## Scope
Modelo logico de entidades y relaciones para soportar el flujo end-to-end.
No define SQL final ni migraciones; define contrato de dominio.

## Canonical Enums

### lead_status
- `interested`
- `quoted`
- `applicant`
- `evaluation_in_progress`
- `evaluation_approved`
- `evaluation_rejected`
- `contract_pending`
- `contract_issued`
- `closed`

### unit_status
- `available`
- `reserved`
- `rented`

### reservation_status
- `active`
- `expired`
- `cancelled`
- `consumed`

### additional operational enums (proposed)
- `evaluation_status`: `pending`, `in_progress`, `approved`, `rejected`.
- `contract_case_status`: `drafting`, `hydrated`, `validated`, `issued`, `void`.
- `tenant_payment_status`: `pending`, `paid`, `failed`, `reversed`.
- `owner_settlement_status`: `draft`, `ready_to_close`, `closed`, `paid`, `adjusted`.

## Entity Relationship Overview
- `leads` 1 -> N `rental_applications`
- `rental_applications` 1 -> N `application_parties`
- `rental_applications` 1 -> N `unit_reservations`
- `rental_applications` 1 -> N `contract_cases`
- `contract_cases` 1 -> N `tenant_payment_documents` (via payment records)
- `owner_settlements` 1 -> N `settlement_line_items`
- `workflow_events` N -> 1 aggregate (`leads`/`applications`/`reservations`/`contracts`/`payments`/`settlements`)

## Core Entities

### 1) `rental_applications`
| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| id | uuid | yes | PK |
| lead_id | uuid | yes | FK -> leads.id |
| assigned_unit_id | text/uuid | yes | FK -> units.id |
| lead_status | enum lead_status | yes | mirror operational stage |
| evaluation_status | enum | yes | pending/in_progress/approved/rejected |
| current_reservation_id | uuid | no | FK -> unit_reservations.id |
| contract_case_id | uuid | no | FK -> contract_cases.id |
| created_at | timestamptz | yes | audit |
| updated_at | timestamptz | yes | audit |

### 2) `application_parties`
| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| id | uuid | yes | PK |
| application_id | uuid | yes | FK -> rental_applications.id |
| role | enum | yes | applicant, guarantor, owner, company_representative |
| full_name | text | yes | |
| rut | text | yes | normalized |
| email | text | no | |
| phone | text | no | |
| metadata_json | jsonb | yes | civil_status, nationality, profession, address |
| confirmed_at | timestamptz | no | data confirmation checkpoint |

### 3) `unit_reservations`
| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| id | uuid | yes | PK |
| unit_id | text/uuid | yes | FK -> units.id |
| application_id | uuid | yes | FK -> rental_applications.id |
| reservation_status | enum reservation_status | yes | active/expired/cancelled/consumed |
| expires_at | timestamptz | yes | TTL |
| consumed_at | timestamptz | no | set when linked to issued contract |
| cancelled_reason | text | no | |
| created_by | uuid/text | yes | actor |
| created_at | timestamptz | yes | |

### 4) `contract_cases`
| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| id | uuid | yes | PK |
| application_id | uuid | yes | FK -> rental_applications.id |
| contract_type | enum | yes | standard/subarriendo_propietario |
| contract_case_status | enum | yes | drafting/hydrated/validated/issued/void |
| hydrated_payload_json | jsonb | no | payload canonico |
| hydration_provenance_json | jsonb | no | source per field |
| issued_contract_id | uuid | no | FK -> contracts.id |
| validation_errors_json | jsonb | no | |
| created_at | timestamptz | yes | |
| updated_at | timestamptz | yes | |

### 5) `tenant_payment_documents`
| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| id | uuid | yes | PK |
| payment_id | uuid/text | yes | payment aggregate id |
| contract_case_id | uuid | yes | FK -> contract_cases.id |
| doc_type | enum | yes | boleta/resumen |
| document_status | enum | yes | pending/issued/failed |
| gross_amount_clp | bigint | yes | |
| issued_at | timestamptz | no | |
| external_ref | text | no | proveedor documento |
| version | int | yes | reemision control |

### 6) `owner_settlements`
| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| id | uuid | yes | PK |
| owner_party_id | uuid | yes | FK -> application_parties.id (role=owner) |
| period_start | date | yes | |
| period_end | date | yes | |
| owner_settlement_status | enum | yes | draft/ready_to_close/closed/paid/adjusted |
| gross_income_clp | bigint | yes | |
| total_deductions_clp | bigint | yes | |
| net_amount_clp | bigint | yes | |
| payout_reference | text | no | |
| closed_at | timestamptz | no | |
| paid_at | timestamptz | no | |

### 7) `settlement_line_items`
| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| id | uuid | yes | PK |
| settlement_id | uuid | yes | FK -> owner_settlements.id |
| category | enum/text | yes | rent_income, admin_fee, maintenance, adjustment, reversal |
| sign | enum | yes | credit/debit |
| amount_clp | bigint | yes | positive value |
| source_reference | text | no | payment/ref/invoice |
| description | text | no | |
| created_at | timestamptz | yes | |

### 8) `workflow_events`
| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| id | uuid | yes | PK |
| aggregate_type | text | yes | lead/application/reservation/contract/payment/settlement |
| aggregate_id | uuid/text | yes | |
| event_type | text | yes | domain event |
| from_state | text | no | |
| to_state | text | no | |
| actor_id | uuid/text | yes | |
| request_id | text | yes | correlation |
| payload_json | jsonb | yes | redacted |
| occurred_at | timestamptz | yes | |

## Invariants (Must Hold)
1. Maximo una reserva `active` por `unit_id`.
2. `unit_status=reserved` si existe reserva `active`.
3. `contract_case_status=issued` implica `issued_contract_id` no nulo.
4. `owner_settlement.net_amount_clp = gross_income_clp - total_deductions_clp`.
5. `settlement_line_items` no se eliminan tras `owner_settlement_status in (closed, paid, adjusted)`.
6. Transiciones de estado solo segun FlowMap.
7. Eventos de auditoria obligatorios para toda transicion P0.

## Suggested Logical Constraints
- Unique partial key: (`unit_id`) where `reservation_status='active'`.
- Unique key: (`application_id`, `contract_case_status='issued'`) para prevenir doble emision.
- Check: `period_end >= period_start` en settlement.
- Check: `amount_clp > 0` en line items.

## Data Retention and Privacy
- `workflow_events`: retencion minima 24 meses.
- PII en `application_parties`: acceso por rol y enmascarado en logs.
- Documentos financieros: hash y versionado inmutable.

## Changelog
- v0.1 (2026-02-26): Modelo logico inicial con enums, entidades e invariantes.
