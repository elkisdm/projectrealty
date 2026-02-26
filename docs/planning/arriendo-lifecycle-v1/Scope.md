# Scope Definition - Arriendo Lifecycle v1

## Document Control
- Version: v0.1
- Status: Draft
- Owner: Product + Operaciones
- Last Updated: 2026-02-26

## Hypothesis Under Test
- If we ship: un flujo integrado y auditable desde lead hasta liquidacion propietario.
- For user segment: Operaciones, Contratos y Finanzas internas.
- Metric will move: conversion `quoted -> contract_issued`.
- Target and date: de 6.0% (assumption) a 9.0% para 2026-06-30.

## MVP Scope (Build Now)
| Area | Item | Why It Is Core | User Value | Risk If Excluded |
| --- | --- | --- | --- | --- |
| Lead/Cotizacion | Estado canonico `interested/quoted` y snapshot de cotizacion | Sin baseline no hay funnel | Trazabilidad comercial | Conversion no medible |
| Postulacion | Conversion interna `lead -> applicant` | Punto de quiebre operativo | Flujo accionable | Leads huerfanos |
| Reserva | Reserva activa unica por unidad | Evita doble promesa | Confianza operacional | Doble reserva y conflictos |
| Listing sync | Baja automatica de listing al reservar | Consistencia externa | Menos friccion comercial | Publicacion inconsistente |
| Evaluacion | Checklist + decision approve/reject | Gate previo a contrato | Menos reproceso legal | Contratos invalidos |
| Contrato | Contract case + hidratacion + emision idempotente | Centro legal del flujo | Emision confiable | Duplicados y fallas |
| Cobro arrendatario | Registro de cobro centralizado | Base de liquidacion | Control financiero | Caja no conciliada |
| Boleta/Resumen | Emision documental por cobro | Evidencia para arrendatario | Transparencia | Disputas de cobro |
| Liquidacion propietario | Calculo neto con deducciones + cierre | Resultado financiero del modelo | Pago correcto y trazable | Reclamos de propietario |
| Auditoria | workflow_events end-to-end | Cumplimiento y soporte | Investigacion de incidentes | Sin trazabilidad |

## Later Scope (Defer)
| Area | Item | Reason Deferred | Trigger To Pull In |
| --- | --- | --- | --- |
| Firma avanzada | Firma electronica avanzada integrada | No bloquea definicion funcional | Requisito legal de go-live |
| Portal propietario | Autoservicio de liquidaciones | Alto esfuerzo UI/soporte | Escala de propietarios > umbral definido |
| Motor antifraude | Scoring antifraude avanzado | MVP usa validaciones basicas | Aumento de fraude/reversos |
| Integracion tributaria completa | Emision fiscal full automatizada | Fuera de legal minimo MVP | Confirmacion de obligacion regulatoria |
| Orquestacion multi-pasarela | Smart routing de cobros | Complejidad no esencial inicial | Volumen transaccional alto |

## Rejected Scope
| Area | Item | Reason Rejected |
| --- | --- | --- |
| Comercial | Marketplace externo multi-corredora en MVP | Desvia foco de conversion interna |
| Data | Modelado de todo ciclo post-termino de contrato | No contribuye a objetivo inmediato |
| BI | Data warehouse completo en fase documental | Puede definirse despues de dominio core |

## Scope Boundaries
- Explicitly in:
  - Estados y transiciones canonicas de lead, reserva, evaluacion, contrato, cobro y liquidacion.
  - Reglas de negocio bloqueantes para operaciones.
  - Modelo de datos logico y contratos API objetivo.
- Explicitly out:
  - Implementacion en codigo y DB.
  - Integraciones reales con proveedores externos.
  - Operacion post-termino de contrato.
- Constraints that force these cuts:
  - Fecha objetivo de freeze documental: 2026-03-15.
  - Necesidad de reducir riesgo de ambiguedad antes de construir.

## Dependency Notes
- External dependencies:
  - Proveedor de pagos (futuro).
  - Servicio de documentos/fiscalidad (futuro).
- Internal dependencies:
  - Dominio de contratos existente (`standard`, `subarriendo_propietario`).
  - Estados de unidades ya usados por plataforma (`available`, `reserved`, `rented`).
- Critical path constraints:
  - Cerrar reglas de reserva y evaluacion antes de contratos.
  - Cerrar reglas de deduccion antes de liquidaciones.

## Changelog
- v0.1 (2026-02-26): Delimitacion inicial de alcance MVP/Later/Rejected.
