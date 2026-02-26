# Payments and Settlements Specification - Arriendo Lifecycle v1

## Document Control
- Version: v0.1
- Status: Draft
- Owner: Finanzas + Product + Engineering
- Last Updated: 2026-02-26

## Objective
Definir el modelo operativo de:
1. Cobro centralizado de arriendo a arrendatario.
2. Emision de boleta/resumen asociado al cobro.
3. Liquidacion automatica de arriendo al propietario con deducciones.

## Operating Model (Locked Default)
- El arrendatario paga a Hommie (cobro centralizado).
- Hommie registra el cobro, emite documento al arrendatario y luego liquida al propietario.
- La liquidacion usa deducciones automaticas sobre fondos efectivamente cobrados.

## Tenant Payment Lifecycle
- `pending`: cobro iniciado, sin confirmacion final.
- `paid`: cobro confirmado.
- `failed`: cobro rechazado/fallido.
- `reversed`: cobro revertido por contracargo/anulacion.

### Payment Data Minimum
- contract_case_id
- tenant_id (o referencia arrendatario)
- billing_period (YYYY-MM)
- amount_clp
- payment_method
- external_payment_ref
- payment_status
- paid_at (cuando corresponda)

## Tenant Documents (Boleta/Resumen)

### Document Rules
1. Todo pago `paid` debe generar documento arrendatario.
2. Documento debe referenciar `payment_id`, `contract_case_id`, periodo y monto.
3. Si falla emision documental, estado queda `pending_document` con reintento.
4. Reemision incrementa `version` y conserva historial.

### Document Status
- `pending`
- `issued`
- `failed`

## Owner Settlement Lifecycle
- `draft`: settlement en construccion.
- `ready_to_close`: conciliado y listo para cierre.
- `closed`: neto aprobado; no editable.
- `paid`: payout al propietario ejecutado.
- `adjusted`: ajuste posterior por reversos/disputas.

## Settlement Formula

### Inputs
- Ingresos cobrados del periodo.
- Deducciones permitidas por catalogo.
- Ajustes por reversos/contracargos del mismo periodo o arrastrados.

### Formula
```text
gross_income_clp = sum(payment.amount_clp where payment_status = paid and in_period)

total_deductions_clp =
  admin_fee
+ maintenance_charges_approved
+ chargeback_reserve
+ legal_collections_costs_approved
+ other_catalog_deductions

net_amount_clp = gross_income_clp - total_deductions_clp
```

## Deduction Catalog (Proposed MVP)
| Category | Description | Sign | Required Evidence | Auto/Manual |
| --- | --- | --- | --- | --- |
| admin_fee | Fee de administracion del servicio | debit | regla contractual | auto |
| maintenance_charge | Cobro mantencion autorizado | debit | comprobante | manual+approval |
| legal_collection_cost | Gasto legal de cobranza autorizado | debit | boleta/factura | manual+approval |
| chargeback_adjustment | Ajuste por contracargo | debit | referencia reverso | auto |
| prior_period_adjustment | Ajuste de periodos previos | credit/debit | nota ajuste | manual+approval |

## Deduction Ordering Rule
1. `admin_fee`
2. `chargeback_adjustment`
3. `maintenance_charge`
4. `legal_collection_cost`
5. `prior_period_adjustment`

Orden fijo para reproducibilidad y auditoria.

## Settlement Closing Rules
1. Solo `ready_to_close` puede pasar a `closed`.
2. Requiere conciliacion sin diferencias no explicadas.
3. Requiere actor de finanzas autorizado.
4. Al cerrar, se genera instruccion de payout.

## Payout Rules
- Payout se ejecuta solo para settlements `closed`.
- Cambia a `paid` solo con confirmacion de referencia de transferencia.
- Si falla payout, estado intermedio recomendado: `paid_failed` (o mantener `closed` + incidente).

## Reversal / Chargeback Handling
1. Si un cobro `paid` pasa a `reversed`, se crea evento financiero.
2. Si settlement aun no cierra: recalculo en mismo periodo.
3. Si settlement ya cerro/pago: crear settlement `adjusted` o line item de arrastre.
4. Toda correccion debe mantener trazabilidad de `source_reference`.

## Reconciliation and Controls
- Control diario:
  - pagos confirmados vs documentos emitidos.
  - pagos confirmados vs line items de settlement.
- Control mensual:
  - neto liquidado vs neto pagado.
  - ajustes abiertos y antiguedad.

## Audit and Reporting Requirements
- Eventos minimos:
  - `tenant_payment_registered`
  - `tenant_document_issued`
  - `owner_settlement_closed`
  - `owner_settlement_paid`
  - `payment_reversed`
  - `settlement_adjusted`
- Reportes minimos:
  - exactitud settlement por periodo.
  - aging de disputas y ajustes.
  - tasa de documentos fallidos.

## Open Legal/Policy Items
- Definir alcance legal exacto de "boleta" vs "resumen" segun naturaleza del cobro.
- Definir politica de retencion de fondo por contracargos.
- Definir SLA y proceso formal de disputa de propietarios.

## Changelog
- v0.1 (2026-02-26): Especificacion inicial de cobros y liquidaciones centralizadas.
