# Contract Hydration Specification - Arriendo Lifecycle v1

## Document Control
- Version: v0.1
- Status: Draft
- Owner: Contratos + Engineering
- Last Updated: 2026-02-26

## Objective
Definir como se construye el payload canonico de contrato desde tres fuentes:
1. Confirmacion de datos de postulante y aval(es).
2. Datos de propietario.
3. Datos fijos de empresa (Hommie).

El resultado debe ser deterministico, auditable y bloqueante ante datos criticos faltantes.

## Target Payload
- Payload objetivo: contrato canonico compatible con `schemas/contracts.ts`.
- Tipos en alcance: `standard`, `subarriendo_propietario`.

## Source Inputs

### Source A: Applicant Confirmation
- applicant_full_name, rut, email, phone, address.
- civil_status, nationality, profession.
- guarantor data (si aplica).
- flags de consentimiento y declaraciones requeridas.

### Source B: Owner Data
- owner_name, owner_rut.
- owner_address/contact data.
- datos de cuenta para liquidacion (si aplica por proceso financiero).

### Source C: Company Fixed Data
- razon social, rut empresa, domicilio legal, representante.
- parametros por defecto de contrato (aviso_termino_dias, textos base, referencia legal).

## Hydration Precedence
1. Confirmacion explicita en flujo actual (A).
2. Registro reutilizable validado previamente (B/C segun campo).
3. Defaults de empresa y reglas automaticas.

Si un campo P0 requerido sigue vacio tras precedencia, se bloquea emision.

## Field Mapping Matrix

### Contract Header
| Contract Field | Source | Rule | Fallback | Blocking |
| --- | --- | --- | --- | --- |
| contrato.tipo | workflow | debe ser standard/subarriendo_propietario | none | yes |
| contrato.ciudad_firma | C | default empresa | "Santiago" | yes |
| contrato.fecha_inicio | workflow | requerida | none | yes |
| contrato.fecha_firma | workflow/C | hoy o fecha definida | current date | yes |
| contrato.fecha_termino | rules engine | +1 ano default si no viene | computed | yes |
| contrato.aviso_termino_dias | C/rules | default segun tipo | 60 standard / 30 subarriendo | no |

### Arrendadora / Empresa
| Contract Field | Source | Rule | Fallback | Blocking |
| --- | --- | --- | --- | --- |
| arrendadora.razon_social | C | fijo empresa | none | yes |
| arrendadora.rut | C | rut valido | none | yes |
| arrendadora.domicilio | C | obligatorio | none | yes |
| arrendadora.email | C | email valido | none | yes |
| arrendadora.representante.* | C | requerido en standard | defaults empresa | conditional |

### Propietario
| Contract Field | Source | Rule | Fallback | Blocking |
| --- | --- | --- | --- | --- |
| propietario.nombre | B | requerido | none | yes |
| propietario.rut | B | rut valido | none | yes |
| propietario.genero | B | opcional segun plantilla | unknown | no |

### Arrendatario / Postulante
| Contract Field | Source | Rule | Fallback | Blocking |
| --- | --- | --- | --- | --- |
| arrendatario.nombre | A | requerido | none | yes |
| arrendatario.rut | A | rut valido | none | yes |
| arrendatario.email | A | email valido | none | yes |
| arrendatario.telefono | A | formato telefono | empty | no |
| arrendatario.domicilio | A | requerido | none | yes |
| arrendatario.nacionalidad | A | requerido en standard | default "Chilena" | conditional |
| arrendatario.estado_civil | A | requerido en standard | empty | conditional |

### Aval
| Contract Field | Source | Rule | Fallback | Blocking |
| --- | --- | --- | --- | --- |
| flags.hay_aval | A/workflow | true si aval requerido | false | yes |
| aval.* | A | requerido si hay_aval=true | none | conditional |

### Inmueble y Finanzas
| Contract Field | Source | Rule | Fallback | Blocking |
| --- | --- | --- | --- | --- |
| inmueble.* | unit/building snapshot | direccion/comuna/ciudad requeridas | none | yes |
| renta.monto_clp | quote snapshot | monto positivo | none | yes |
| renta.monto_uf | quote/rules | conversion referencial | 0 | no |
| garantia.* | quote/rules | coherencia con renta en standard | computed | conditional |

### Subarriendo (tipo especifico)
| Contract Field | Source | Rule | Fallback | Blocking |
| --- | --- | --- | --- | --- |
| subarriendo.permitido | workflow/rules | true para subarriendo_propietario | false | yes for subarriendo |
| subarriendo.propietario_autoriza | workflow | true requerido en subarriendo | false | yes for subarriendo |
| subarriendo.notificacion_obligatoria | rules | true requerido | true | yes for subarriendo |
| subarriendo.plazo_notificacion_habiles | rules | >0 requerido | 2 | yes for subarriendo |

## Contract-Type Specific Required Fields

### `standard`
- Requiere arrendadora (incluye representante y personeria), propietario, arrendatario, inmueble, renta y garantia coherentes.

### `subarriendo_propietario`
- Requiere arrendatario juridico + representante legal.
- Requiere subarriendo permitido y autorizado.
- Requiere coincidencia de identidad segun reglas del tipo.

## Hydration Pipeline
1. Load workflow context (`application`, `reservation`, `unit`, `contract_type`).
2. Fetch source datasets A/B/C.
3. Normalize values (RUT, fechas, montos, strings).
4. Merge por precedencia.
5. Apply automatic rules por tipo de contrato.
6. Validate payload completo.
7. Persist `hydrated_payload_json` + `hydration_provenance_json` + `validation_result`.

## Validation and Blocking Codes
- `HYD-001`: required field missing.
- `HYD-002`: invalid rut format.
- `HYD-003`: incompatible contract type data.
- `HYD-004`: financial incoherence.
- `HYD-005`: source conflict not resolvable.

## Observability Requirements
- Registrar `contract_hydrated` con:
  - `contract_case_id`
  - `missing_fields_count`
  - `source_completeness_score`
  - `contract_type`

## Security and Privacy
- No loguear payload completo con PII en texto plano.
- Guardar hash del payload para auditoria de integridad.
- Enmascarar identificadores sensibles en trazas operativas.

## Changelog
- v0.1 (2026-02-26): Especificacion inicial de hidratacion de contrato.
