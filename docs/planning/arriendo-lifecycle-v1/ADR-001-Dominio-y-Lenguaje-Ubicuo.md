# ADR-001 - Dominio y Lenguaje Ubicuo

## Document Control
- ADR ID: ADR-001
- Version: v1.0
- Status: Accepted
- Date: 2026-02-26
- Owner: Founder + AI pair
- Scope: Arriendo lifecycle E2E (MVP documental)

## Contexto
El flujo de arriendo estaba definido en multiples documentos con riesgo de ambiguedad semantica entre etapas comerciales, contractuales y financieras. Esto generaba riesgo en estados, ownership de datos y eventos cross-context.

## Decision

### D1. Lenguaje ubicuo canonico
Se adopta el diccionario v0 como vocabulario obligatorio para documentos, issues y contratos API:
- Referencia: [ELK-21-Diccionario-v0-y-Aliases-Prohibidos.md](/Users/macbookpro/Documents/hommie-0-commission-next/docs/planning/arriendo-lifecycle-v1/execution/ELK-21-Diccionario-v0-y-Aliases-Prohibidos.md)

### D2. Roles por etapa
- Pre-emision contractual: `lead_contact` y `applicant_person`.
- Post-emision contractual: `tenant_person`.
- Se prohbe usar `arrendatario` como etiqueta generica en etapas previas a `contract_issued`.

### D3. Delimitacion de bounded contexts
Se formalizan 7 contextos:
1. `LeadAndQuote`
2. `ApplicationAndReservation`
3. `Evaluation`
4. `Contracting`
5. `TenantCollections`
6. `OwnerSettlement`
7. `AuditAndGovernance`

Referencia: [ELK-22-Bounded-Contexts-y-Fronteras-de-Eventos.md](/Users/macbookpro/Documents/hommie-0-commission-next/docs/planning/arriendo-lifecycle-v1/execution/ELK-22-Bounded-Contexts-y-Fronteras-de-Eventos.md)

### D4. Sincronizacion de estados macro y micro
- `lead_status` es embudo macro.
- `contract_case_status` modela subetapas contractuales.
- Regla: `lead_status=contract_pending` mientras `contract_case_status in (drafting, hydrated, validated)`.
- Regla: `lead_status=contract_issued` solo cuando `contract_case_status=issued`.

### D5. Reglas semanticas criticas
- `reservation_status=consumed` se marca en `contract_issued` exitoso.
- `reservation_status` activa es SoT de exclusividad; `unit_status` es derivado reconciliable.
- `document_status` se mantiene `pending|issued|failed`; `pending_document` se modela con `reason_code`.
- `doc_type` soporta `boleta|resumen`, con default MVP `resumen` hasta cierre legal.

### D6. SoT de datos estrategicos
- Propietario: SoT en `owner_master`; `application_parties` conserva snapshot contractual.
- Pagos: se explicita entidad logica `tenant_payments` en evolucion de DataModel (v0.2 documental previa a implementacion).

### D7. Eventos obligatorios de frontera
Todo evento cross-context debe contener:
- `event_id`
- `actor_id`
- `request_id`
- `occurred_at`
- `aggregate_id`

## Consecuencias

### Positivas
- Menor ambiguedad en tickets y decisiones tecnicas.
- Mejor trazabilidad entre estado de funnel y estado contractual.
- Base clara para ELK-12 (maquinas de estado e invariantes).

### Costos / trade-offs
- Requiere disciplina de nomenclatura en todos los equipos.
- Introduce trabajo adicional para modelar `tenant_payments` y `owner_master`.
- Mantiene decision legal de `boleta` abierta (con fallback operativo).

## Alternativas descartadas
1. Unificar `lead_status` y `contract_case_status` en un unico enum.
2. Agregar `pending_document` al enum canonico de documentos.
3. Mantener owner solo en `application_parties` sin entidad maestra.

## Implementacion documental inmediata
1. Aplicar diccionario v0 a nuevos artefactos.
2. Alinear FlowMap/DataModel con decisiones D4-D6 en iteracion siguiente.
3. Transferir checklist de adopcion a ELK-12.

## Artefactos vinculados
- [ELK-19-Inventario-Terminos-y-Fuentes.md](/Users/macbookpro/Documents/hommie-0-commission-next/docs/planning/arriendo-lifecycle-v1/execution/ELK-19-Inventario-Terminos-y-Fuentes.md)
- [ELK-20-Mapa-Actores-y-Entidades-Canonicas.md](/Users/macbookpro/Documents/hommie-0-commission-next/docs/planning/arriendo-lifecycle-v1/execution/ELK-20-Mapa-Actores-y-Entidades-Canonicas.md)
- [ELK-21-Diccionario-v0-y-Aliases-Prohibidos.md](/Users/macbookpro/Documents/hommie-0-commission-next/docs/planning/arriendo-lifecycle-v1/execution/ELK-21-Diccionario-v0-y-Aliases-Prohibidos.md)
- [ELK-22-Bounded-Contexts-y-Fronteras-de-Eventos.md](/Users/macbookpro/Documents/hommie-0-commission-next/docs/planning/arriendo-lifecycle-v1/execution/ELK-22-Bounded-Contexts-y-Fronteras-de-Eventos.md)
- [ELK-23-Resolucion-de-Conflictos-Semanticos.md](/Users/macbookpro/Documents/hommie-0-commission-next/docs/planning/arriendo-lifecycle-v1/execution/ELK-23-Resolucion-de-Conflictos-Semanticos.md)

## Changelog
- v1.0 (2026-02-26): ADR aceptado con decisiones de lenguaje, fronteras, SoT y estados.
