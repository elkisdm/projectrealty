# ELK-24 - Handoff a ELK-12 (Maquinas de Estado e Invariantes)

## Document Control
- Issue: ELK-24
- Parent: ELK-11
- Version: v0.1
- Status: Draft (DoD completado para ELK-24)
- Owner: Founder + AI pair
- Last Updated: 2026-02-26

## Objetivo
Formalizar el handoff operativo de ADR-001 hacia ELK-12 para ejecutar cierre de maquinas de estado e invariantes sin bloqueos semanticos.

## Publicacion ADR-001
- ADR final publicado en:
  - [ADR-001-Dominio-y-Lenguaje-Ubicuo.md](/Users/macbookpro/Documents/hommie-0-commission-next/docs/planning/arriendo-lifecycle-v1/ADR-001-Dominio-y-Lenguaje-Ubicuo.md)
- Estado ADR: `Accepted`
- Fecha: `2026-02-26`

## Checklist de adopcion para ELK-12

### 1) Estado macro/micro
- [ ] Aplicar mapeo `lead_status` <-> `contract_case_status`.
- [ ] Documentar transiciones invalidas y `STATE_TRANSITION_FORBIDDEN`.
- [ ] Agregar matriz de sincronizacion en FlowMap v0.2.

### 2) Reserva y unidad
- [ ] Fijar trigger oficial de `reservation_status=consumed` en `contract_issued`.
- [ ] Declarar `reservation_status` como SoT de exclusividad.
- [ ] Definir reconciliador `reservation_status` vs `unit_status`.

### 3) Documento de pago
- [ ] Mantener enum `document_status=pending|issued|failed`.
- [ ] Modelar `pending_document` solo via `reason_code`.
- [ ] Definir regla operacional para default `doc_type=resumen`.

### 4) Entidades pendientes de modelo
- [ ] Agregar `tenant_payments` (logical entity) en DataModel v0.2.
- [ ] Definir `owner_master` + `owner_master_id` en snapshot contractual.
- [ ] Documentar impacto de migracion de data existente.

### 5) Ownership de campos
- [ ] Incorporar matriz de campos editables por rol (`ops_agent` vs `contracts_editor`).
- [ ] Registrar BR nuevas de ownership por fase.
- [ ] Definir excepciones auditables por `admin`.

### 6) Eventos de frontera
- [ ] Exigir `event_id`, `actor_id`, `request_id`, `occurred_at`, `aggregate_id`.
- [ ] Mapear eventos obligatorios por contexto C1..C7.
- [ ] Confirmar idempotencia de consumidores de eventos criticos.

## Riesgos abiertos para ELK-12
1. Politica legal final de `boleta` puede requerir ajuste de documentacion.
2. Falta de `tenant_payments` explicito puede afectar consistencia del modelo.
3. Backfill de `owner_master` puede requerir limpieza de datos legacy.

## Criterio de salida de ELK-12 (propuesto)
1. Maquinas de estado cerradas sin contradicciones entre docs.
2. Invariantes P0 expresadas y trazables a BR + AC.
3. Decisiones de ownership y SoT consolidadas en DataModel/FlowMap.

## DoD de ELK-24
- [x] ADR-001 final publicado y referenciado.
- [x] Handoff ejecutable hacia ELK-12 documentado.
- [x] Checklist de adopcion y riesgos abiertos listados.

## Changelog
- v0.1 (2026-02-26): Handoff inicial de ADR-001 a ELK-12.
