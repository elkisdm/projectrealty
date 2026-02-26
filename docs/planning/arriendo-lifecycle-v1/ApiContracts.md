# Target API Contracts (Design Only) - Arriendo Lifecycle v1

## Document Control
- Version: v0.1
- Status: Draft
- Owner: Engineering + Product
- Last Updated: 2026-02-26

## Scope
Contratos API objetivo para futura implementacion. No implica endpoints productivos existentes.

## Conventions
- Content-Type: `application/json`.
- Correlation: `X-Request-Id` recomendado en todas las requests.
- Idempotencia: `Idempotency-Key` obligatorio en operaciones criticas.
- Standard success envelope:
```json
{
  "success": true,
  "data": {},
  "meta": {
    "request_id": "uuid-or-trace-id",
    "timestamp": "2026-02-26T00:00:00Z"
  },
  "error": null
}
```
- Standard error envelope:
```json
{
  "success": false,
  "data": null,
  "meta": {
    "request_id": "uuid-or-trace-id",
    "timestamp": "2026-02-26T00:00:00Z"
  },
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable message",
    "details": {}
  }
}
```

## Error Catalog (Proposed)
- `VALIDATION_ERROR`
- `STATE_TRANSITION_FORBIDDEN`
- `UNIT_ALREADY_RESERVED`
- `IDEMPOTENCY_REUSED`
- `HYDRATION_INCOMPLETE`
- `PERMISSION_DENIED`
- `NOT_FOUND`
- `EXTERNAL_PROVIDER_ERROR`

## Endpoint Contracts

### 1) Quote by Unit
- `POST /api/lifecycle/quotes`
- Purpose: generar cotizacion y snapshot para lead.
- Request:
```json
{
  "lead_id": "uuid",
  "unit_id": "unit-123",
  "start_date": "2026-03-10",
  "options": {
    "parking_selected": false,
    "storage_selected": false
  }
}
```
- Success response:
```json
{
  "success": true,
  "data": {
    "quote_id": "uuid",
    "lead_status": "quoted",
    "snapshot": {
      "currency": "CLP",
      "lines": [],
      "totals": {}
    }
  },
  "meta": {},
  "error": null
}
```

### 2) Convert Lead to Applicant
- `POST /api/lifecycle/leads/{lead_id}/convert-to-applicant`
- Purpose: accion interna para crear postulacion.
- Request:
```json
{
  "operator_id": "user-ops-1",
  "reason": "Lead confirma interes"
}
```
- Success response:
```json
{
  "success": true,
  "data": {
    "application_id": "uuid",
    "lead_status": "applicant"
  },
  "meta": {},
  "error": null
}
```

### 3) Automatic Unit Assignment
- `POST /api/lifecycle/applications/{application_id}/assign-unit`
- Purpose: asignar unidad candidata segun policy.
- Request:
```json
{
  "assignment_policy": "lowest_price_available",
  "preferred_unit_id": "optional"
}
```
- Success response:
```json
{
  "success": true,
  "data": {
    "application_id": "uuid",
    "unit_id": "unit-123",
    "unit_status": "available"
  },
  "meta": {},
  "error": null
}
```

### 4) Reserve Unit (Unique Active)
- `POST /api/lifecycle/applications/{application_id}/reserve-unit`
- Headers: `Idempotency-Key: <key>`
- Request:
```json
{
  "unit_id": "unit-123",
  "ttl_hours": 48
}
```
- Success response:
```json
{
  "success": true,
  "data": {
    "reservation_id": "uuid",
    "reservation_status": "active",
    "unit_status": "reserved",
    "listing_visible": false,
    "expires_at": "2026-03-12T14:00:00Z"
  },
  "meta": {},
  "error": null
}
```
- Conflict response: `UNIT_ALREADY_RESERVED`.

### 5) Start Evaluation
- `POST /api/lifecycle/applications/{application_id}/evaluation/start`
- Request:
```json
{
  "checklist_version": "v1",
  "analyst_id": "user-ev-1"
}
```
- Success response: `evaluation_status=in_progress`, `lead_status=evaluation_in_progress`.

### 6) Evaluation Decision
- `POST /api/lifecycle/applications/{application_id}/evaluation/decision`
- Request:
```json
{
  "decision": "approved",
  "reason_code": "income_validated",
  "comment": "optional"
}
```
- Success response:
```json
{
  "success": true,
  "data": {
    "evaluation_status": "approved",
    "lead_status": "evaluation_approved",
    "contract_case_id": "uuid"
  },
  "meta": {},
  "error": null
}
```

### 7) Issue Contract from Hydrated Case
- `POST /api/lifecycle/contract-cases/{contract_case_id}/issue`
- Headers: `Idempotency-Key` required.
- Request:
```json
{
  "template_id": "uuid",
  "contract_type": "standard"
}
```
- Success response:
```json
{
  "success": true,
  "data": {
    "contract_id": "uuid",
    "contract_case_status": "issued",
    "lead_status": "contract_issued",
    "pdf_url": "signed-url",
    "idempotent_reused": false
  },
  "meta": {},
  "error": null
}
```
- Error `HYDRATION_INCOMPLETE` si faltan campos.

### 8) Register Tenant Payment
- `POST /api/lifecycle/tenant-payments`
- Headers: `Idempotency-Key` required.
- Request:
```json
{
  "contract_case_id": "uuid",
  "amount_clp": 650000,
  "period": "2026-04",
  "external_payment_ref": "gw-123"
}
```
- Success response: `tenant_payment_status=paid|pending` segun confirmacion.

### 9) Issue Tenant Payment Document
- `POST /api/lifecycle/tenant-payments/{payment_id}/documents`
- Request:
```json
{
  "doc_type": "boleta",
  "issuer_context": "hommie_centralized_collection"
}
```
- Success response: document metadata (`document_id`, `status=issued`, `version`).

### 10) Close Owner Settlement
- `POST /api/lifecycle/owner-settlements/{settlement_id}/close`
- Headers: `Idempotency-Key` required.
- Request:
```json
{
  "approved_by": "finance-user-1",
  "notes": "period close"
}
```
- Success response:
```json
{
  "success": true,
  "data": {
    "settlement_id": "uuid",
    "owner_settlement_status": "closed",
    "net_amount_clp": 510000,
    "payout_instruction_id": "uuid"
  },
  "meta": {},
  "error": null
}
```

### 11) Reverse Tenant Payment (Adjustment)
- `POST /api/lifecycle/tenant-payments/{payment_id}/reverse`
- Request:
```json
{
  "reason_code": "chargeback",
  "amount_clp": 650000
}
```
- Success response: payment `reversed`, settlement `adjusted`.

## Idempotency Rules
- Required operations: reserve-unit, issue-contract, register-payment, close-settlement.
- Behavior:
  - Si misma key + mismo payload dentro de ventana -> retornar resultado previo.
  - Si misma key + payload distinto -> error `IDEMPOTENCY_CONFLICT`.

## Permission Matrix (High Level)
- viewer: solo lectura.
- editor: operaciones comerciales y evaluacion.
- contracts_editor: hidratacion y emision de contrato.
- finance_editor: pagos, documentos, liquidaciones.
- admin: todas las operaciones + overrides auditados.

## Changelog
- v0.1 (2026-02-26): Contratos API objetivo iniciales para flujo end-to-end.
