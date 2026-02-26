# Risk Register - Arriendo Lifecycle v1

## Document Control
- Version: v0.1
- Status: Draft
- Owner: Product + Engineering + Finanzas
- Last Updated: 2026-02-26

## Risk Register
| ID | Risk | Type | Impact | Likelihood | Early Signal | Mitigation | Contingency | Owner | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| R-001 | Doble reserva por race condition | Tech/Ops | High | Medium | 2 reservas activas para misma unidad | Constraint logico + idempotencia + test concurrencia | Bloqueo inmediato de transiciones y resolucion manual | Engineering | Open |
| R-002 | Desalineacion entre reserva y listing publico | Product/Ops | High | Medium | Unidad reservada sigue visible como disponible | Regla de sincronizacion obligatoria + monitor | Degradar a modo "solo interno" y pausar publicacion | Ops | Open |
| R-003 | Campos faltantes en hidratacion de contrato | Product/Legal | High | High | Alto ratio de contratos bloqueados | Matriz de campos requeridos por tipo | Cola de correccion y SLA de completitud | Contratos | Open |
| R-004 | Duplicacion de contratos en reintentos | Tech/Legal | High | Medium | Mismo caso con multiples contratos emitidos | Hash + ventana idempotencia | Invalidacion y anulacion con auditoria | Engineering | Open |
| R-005 | Formula de liquidacion no consensuada | Product/Finance | High | Medium | Reclamos de propietarios por neto | Tabla de deducciones y orden fijo | Cierre en hold hasta aprobacion financiera | Finanzas | Open |
| R-006 | Reversos/contracargos sin ajuste de settlement | Finance/Ops | High | Medium | Diferencias de conciliacion mensual | Flujo explicito de ajuste y notas de cargo | Bloqueo de payout y recalculo | Finanzas | Open |
| R-007 | Exceso de permisos en overrides manuales | Security/Ops | High | Medium | Cambios criticos sin aprobacion | Matriz de roles y doble aprobacion P0 | Revocacion inmediata + auditoria incidente | Security + Ops | Open |
| R-008 | Bajo entendimiento operativo del nuevo flujo | Ops | Medium | Medium | Errores de estado manuales | Manual operativo + checklist por etapa | Soporte de guardia durante rampa inicial | Operaciones | Open |
| R-009 | KPI baseline no confirmado | Product/Data | Medium | High | No existe dato historico consolidado | Instrumentacion de eventos desde dia 1 | Ajustar target tras baseline real | Product Analytics | Open |
| R-010 | Ambiguedad legal en documento boleta/resumen | Legal/Finance | High | Medium | Observaciones de auditoria o legal | Definir legal minimo y disclaimer en docs | Mantener estado "resumen no fiscal" hasta cierre legal | Legal | Open |
| R-011 | Dependencia fuerte de servicio de documentos | Tech/Ops | Medium | Medium | Timeouts al emitir documentos | Reintento con backoff y cola | Emision diferida con trazabilidad | Engineering | Open |
| R-012 | Datos PII expuestos en eventos/logs | Security/Privacy | High | Low | Hallazgos en revision de logs | Politica de enmascaramiento y minimizacion | Rotacion de secretos + purge + incidente | Security | Open |

## Assumptions Linked To Risks
| Assumption ID | Assumption | Confidence | Linked Risk IDs | Validation Date |
| --- | --- | --- | --- | --- |
| A-001 | Baseline conversion actual = 6.0% | Low | R-009 | 2026-03-07 |
| A-002 | TTL de reserva activa = 48h | Medium | R-001, R-002 | 2026-03-05 |
| A-003 | Cobro centralizado aplica a todo MVP | Medium | R-005, R-006 | 2026-03-08 |
| A-004 | Boleta/resumen legalmente util en modo minimo | Low | R-010 | 2026-03-10 |
| A-005 | Idempotencia por hash+ventana es suficiente | Medium | R-004 | 2026-03-09 |

## Dependency Risk Map
| Dependency | Team / Vendor | Failure Mode | Fallback | SLA / Constraint |
| --- | --- | --- | --- | --- |
| Motor de contratos | Team Contratos/Engineering | Falla de validacion/plantilla | Bloquear emision y abrir correction task | Debe impedir contratos invalidos |
| Storage de documentos | Infra | No se puede firmar/descargar | Cola de reintento y URL diferida | Disponibilidad >= 99.5% |
| Pasarela de cobro | Vendor de pagos | Pago en pending/failed | Reintento, notificacion y estado reversible | Reconciliacion diaria |
| Canal de payout | Banco/transferencia | Pago rechazado | Estado paid_failed + reproceso | SLA financiero interno |
| Master data propietario | Ops/CRM | Datos incompletos o stale | Bloqueo de cierre settlement | Datos obligatorios antes de payout |

## Trade-Off Log
| Date | Decision | Benefit | Cost | Why Accepted |
| --- | --- | --- | --- | --- |
| 2026-02-26 | Alcance end-to-end en MVP | Cierra circuito real de negocio | Mayor complejidad documental | Evita rediseno posterior |
| 2026-02-26 | Legal minimo en primera version | Acelera definicion funcional | Quedan preguntas regulatorias | Necesidad de avanzar en diseno |
| 2026-02-26 | Cobro centralizado por defecto | Mayor control de trazabilidad | Mayor responsabilidad operativa | Alineado con direccion de negocio |
| 2026-02-26 | Unicidad de reserva por unidad | Elimina sobreventa | Puede bajar throughput en picos | Prioriza confianza operacional |

## Rollout Safeguards
- Feature flags:
  - `lifecycle_reservations_v1`
  - `contract_hydration_v1`
  - `tenant_docs_v1`
  - `owner_settlements_v1`
- Monitoring alerts:
  - alerta por reserva duplicada > 0.
  - alerta por contratos fallidos > 2% diario.
  - alerta por desbalance de liquidacion > 1 CLP no explicado.
- Kill-switch or rollback condition:
  - Cualquier violacion de unicidad de reserva en produccion.
  - Cualquier duplicacion de contrato emitido para mismo caso.
- Incident owner:
  - Engineering On-call + Ops Lead.

## Changelog
- v0.1 (2026-02-26): Registro inicial de riesgos con mitigaciones y dependencias.
