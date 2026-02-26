# Arriendo Lifecycle v1 - Documentation Package

## Document Control
- Version: v0.1
- Status: Draft
- Owner: Product + Operaciones + Engineering
- Last Updated: 2026-02-26
- Target Freeze Date: 2026-03-15

## Purpose
Este paquete define, sin implementacion tecnica, el flujo end-to-end de arriendo:
`Lead interesado -> Cotizacion -> Postulacion -> Evaluacion -> Reserva de unidad -> Emision de contrato -> Cobro arrendatario -> Liquidacion propietario`.

## Scope
- In scope: definicion de producto, reglas de negocio, estados, modelo de datos logico, contratos API objetivo, criterios de aceptacion y riesgos.
- Out of scope: cambios en codigo, migraciones DB, endpoints productivos, integraciones reales.

## Package Contents
1. `PRD.md` - Contrato de producto con FR/NFR, metricas y plan de entrega.
2. `Scope.md` - Delimitacion MVP/Later/Rejected.
3. `Risks.md` - Registro de riesgos y mitigaciones.
4. `AcceptanceCriteria.md` - Criterios de aceptacion y trazabilidad FR/NFR.
5. `FlowMap.md` - Flujo principal, alternos y maquinas de estado.
6. `BusinessRules.md` - Catalogo de reglas BR-xxx y resolucion de conflictos.
7. `DataModel.md` - Modelo de datos logico con entidades, relaciones e invariantes.
8. `ApiContracts.md` - Contratos API objetivo (sin implementacion).
9. `ContractHydrationSpec.md` - Especificacion de hidratacion de contrato.
10. `PaymentsAndSettlements.md` - Cobros, documentos a arrendatario y liquidaciones.
11. `ADR-001-Dominio-y-Lenguaje-Ubicuo.md` - Decision arquitectonica final de dominio y lenguaje ubicuo.

## Sprint Execution Artifacts
- `execution/ELK-19-Inventario-Terminos-y-Fuentes.md` - Inventario inicial de terminos canonicos, fuentes y ambiguedades priorizadas.
- `execution/ELK-20-Mapa-Actores-y-Entidades-Canonicas.md` - Mapa de actores internos/externos, entidades canonicas y fronteras difusas.
- `execution/ELK-21-Diccionario-v0-y-Aliases-Prohibidos.md` - Diccionario canonico v0 y aliases prohibidos.
- `execution/ELK-22-Bounded-Contexts-y-Fronteras-de-Eventos.md` - Delimitacion de contextos y contratos de frontera por eventos.
- `execution/ELK-23-Resolucion-de-Conflictos-Semanticos.md` - Resolucion de conflictos y decisiones candidatas a ADR.
- `execution/ELK-24-Handoff-a-ELK-12.md` - Handoff operativo y checklist de adopcion para ELK-12.

## Locked Defaults (2026-02-26)
- MVP end-to-end completo.
- KPI primario: conversion a contrato.
- Profundidad legal: operativo + legal minimo.
- Modelo financiero: cobro centralizado; liquidacion de propietario via deducciones automaticas.
- Tipos de contrato en alcance: `standard`, `subarriendo_propietario`.
- Regla de reserva: 1 reserva activa por unidad; al reservar, se baja del listing publico.

## Timeline
- 2026-02-27: estructura del paquete + baseline v0.1.
- 2026-02-28 a 2026-03-04: PRD/Scope/Risks/AcceptanceCriteria.
- 2026-03-05 a 2026-03-09: FlowMap/BusinessRules/DataModel/ApiContracts.
- 2026-03-10 a 2026-03-12: ContractHydrationSpec/PaymentsAndSettlements.
- 2026-03-13 a 2026-03-15: cierre v1.0, observaciones y freeze documental.

## Quality Gate Checklist
- [ ] No ambiguedad en FR/NFR.
- [ ] Trazabilidad FR/NFR -> AC completa.
- [ ] Estados y transiciones con reglas de bloqueo.
- [ ] Riesgos con mitigacion y owner.
- [ ] Supuestos y preguntas abiertas explicitos.
- [ ] Changelog actualizado en todos los archivos.

## Changelog
- v0.1 (2026-02-26): Baseline inicial del paquete documental.
- v0.1 (2026-02-26): Se agrega artefacto de ejecucion `ELK-19`.
- v0.1 (2026-02-26): Se agrega artefacto de ejecucion `ELK-20`.
- v0.1 (2026-02-26): Se agregan artefactos de ejecucion `ELK-21`, `ELK-22`, `ELK-23`, `ELK-24`.
- v1.0 (2026-02-26): Se publica `ADR-001-Dominio-y-Lenguaje-Ubicuo`.
