# 📋 Formulario de Contexto de Datos - Hommie

**Propósito:** Agregar información de contexto de negocio a cada campo de datos para configurar correctamente Supabase.

**Instrucciones:** Completa la columna "Tu Contexto" con información relevante. Marca "¿Usar?" para indicar si el campo debe estar en la base de datos.

---

## 📊 Campos del CSV de Assetplan (Fuente de Datos)

### Identificación de la Unidad

| Campo CSV | ¿Usar? | Tu Contexto | Descripción del Campo |
|-----------|--------|-------------|----------------------|
| `OP` | ☐ Sí ☐ No | | Código único de operación (ej: GMND2201-B). Identificador interno de Assetplan. |
| `Unidad` | ☐ Sí ☐ No | | Número/código de la unidad dentro del edificio (ej: 2201-B). | tambien numero de departamento por ejemplo la unidad 2201 está en el piso 22, departamento numero 1
| `Estado` | ☐ Sí ☐ No | | Estado de disponibilidad: "Lista para arrendar", "reacondicionamiento" |
| `Especial` | ☐ Sí ☐ No | | Tipo de arriendo: "Arriendo Normal" u otro tipo especial. | ignorar este campo por ahora

### Ubicación del Edificio

| Campo CSV | ¿Usar? | Tu Contexto | Descripción del Campo |
|-----------|--------|-------------|----------------------|
| `Direccion` | ☐ Sí ☐ No | | Dirección completa (ej: "Av. Vicuña Mackenna 2362"). |
| `Comuna` | ☐ Sí ☐ No | | Comuna de ubicación (ej: "Ñuñoa"). |
| `Condominio` | ☐ Sí ☐ No | | Nombre del edificio/condominio (ej: "Guillermo Mann"). |
| `Tipo edificio` | ☐ Sí ☐ No | | Tipo de proyecto: "1" = Multifamily, etc. |

### Características de la Unidad

| Campo CSV | ¿Usar? | Tu Contexto | Descripción del Campo |
|-----------|--------|-------------|----------------------|
| `Tipologia` | ☐ Sí ☐ No | | Tipología: "Estudio", "1D1B", "2D2B", etc. |
| `m2 Depto` | ☐ Sí ☐ No | | Metros cuadrados del departamento (ej: 54.00). |
| `m2 Terraza` | ☐ Sí ☐ No | | Metros cuadrados de terraza (ej: 3.00). |
| `Orientacion` | ☐ Sí ☐ No | | Orientación: N=Norte, S=Sur, E=Este, O=Oeste, P=Poniente. | tanmbien tener en cuenta que tambien habran unidades con NP, SO, SP, NO
| `Estac` | ☐ Sí ☐ No | | Estacionamiento incluido (vacío = no, valor = sí/cantidad). en edificios MF siempre son opcionales 
| `Bod` | ☐ Sí ☐ No | | Bodega incluida |en edificios MF siempre son opcionales 

### Precios y Costos

| Campo CSV | ¿Usar? | Tu Contexto | Descripción del Campo |
|-----------|--------|-------------|----------------------|
| `Arriendo Total` | ☐ Sí ☐ No | | Precio mensual de arriendo en CLP (ej: 529000.00). |
| `GC Total` | ☐ Sí ☐ No | | Gastos comunes mensuales en CLP (ej: 118000.00). |

A partir de aqui crear "Total mensual" sumando arriendo y gc

### Promociones y Descuentos

| Campo CSV | ¿Usar? | Tu Contexto | Descripción del Campo |
|-----------|--------|-------------|----------------------|
| `% Descuento` | ☐ Sí ☐ No | | Porcentaje de descuento sobre arriendo (ej: 10.00 = 10%). |
| `Cant. Meses Descuento` | ☐ Sí ☐ No | | Cantidad de meses que aplica el descuento (ej: 3). |
| `Tremenda promo` | ☐ Sí ☐ No | | ID de promoción especial o código numérico. | esta ignorarla por ahora

### Condiciones de Contrato

| Campo CSV | ¿Usar? | Tu Contexto | Descripción del Campo |
|-----------|--------|-------------|----------------------|
| `Max inicio cttos (Días)` | ☐ Sí ☐ No | | Días máximos para inicio de contrato (ej: 30). |
| `Reajuste por contrato` | ☐ Sí ☐ No | | Cada cuántos meses hay reajuste (ej: 3). |
| `Meses sin reajuste` | ☐ Sí ☐ No | | Meses iniciales sin reajuste (ej: 3). |

### Condiciones de Garantía

| Campo CSV | ¿Usar? | Tu Contexto | Descripción del Campo |
|-----------|--------|-------------|----------------------|
| `Cant. Garantías (Meses)` | ☐ Sí ☐ No | | Meses de garantía requeridos (ej: 1). |
| `Cant. Garantías Mascota (Meses)` | ☐ Sí ☐ No | | Meses adicionales de garantía por mascota (ej: 0). |
| `Sin Garantia` | ☐ Sí ☐ No | | ¿Permite arriendo sin garantía? "Sí"/"No". |
| `Cuotas Garantía` | ☐ Sí ☐ No | | Cantidad de cuotas para pagar garantía (ej: 3). |

### Requisitos del Arrendatario

| Campo CSV | ¿Usar? | Tu Contexto | Descripción del Campo |
|-----------|--------|-------------|----------------------|
| `Rentas Necesarias` | ☐ Sí ☐ No | | Múltiplo de renta líquida requerida (ej: 3.00 = 3x arriendo). |
| `Requiere Aval(es)` | ☐ Sí ☐ No | | ¿Requiere aval? 0=No, 1=Sí. |
| `Plan Sin Aval` | ☐ Sí ☐ No | | ¿Tiene plan sin aval disponible? 0=No, 1=Sí. |

### Mascotas

| Campo CSV | ¿Usar? | Tu Contexto | Descripción del Campo |
|-----------|--------|-------------|----------------------|
| `Acepta Mascotas?` | ☐ Sí ☐ No | | ¿Pet friendly? "Si"/"No". |

### Estado Operativo (Interno) esto ignorarlo para la parte publica

| Campo CSV | ¿Usar? | Tu Contexto | Descripción del Campo |
|-----------|--------|-------------|----------------------|
| `Estatus LLave` | ☐ Sí ☐ No | | Estado de llave para visitas. |
| `Candado` | ☐ Sí ☐ No | | Código de candado/caja de llaves (0 = sin candado). |
| `Status Video` | ☐ Sí ☐ No | | Estado del video: "OK"/"NOK". |
| `Comentario` | ☐ Sí ☐ No | | Notas internas de la unidad. |
| `Fecha Reparacion` | ☐ Sí ☐ No | | Fecha programada de reparación. |
| `Presupuesto` | ☐ Sí ☐ No | | Presupuesto de reparación. | 

### Enlaces solo para uso local, no estará en publico, es el enlace exter del proveedor de los datos

| Campo CSV | ¿Usar? | Tu Contexto | Descripción del Campo |
|-----------|--------|-------------|----------------------|
| `Link Listing` | ☐ Sí ☐ No | | URL del listing en Assetplan. |

---

## 📌 Resumen de Campos por Categoría

| Categoría | Total Campos | ¿Cuáles son prioritarios para ti? |
|-----------|--------------|-----------------------------------|
| Identificación | 4 | |
| Ubicación | 4 | |
| Características | 6 | |
| Precios | 2 | |
| Promociones | 3 | |
| Contrato | 3 | |
| Garantía | 4 | |
| Requisitos | 3 | |
| Mascotas | 1 | |
| Estado Operativo | 6 | |
| Enlaces | 1 | |
| **TOTAL** | **37** | |

---

## 🎯 Decisiones de Negocio

| Pregunta | Tu Respuesta |
|----------|--------------|
| ¿Qué campos deben ser visibles al público? | |
| ¿Qué campos son solo para uso interno/admin? | |
| ¿Hay campos que quieras calcular automáticamente? | |
| ¿Qué promociones están activas actualmente? | |
| ¿Cuáles son las comunas prioritarias? | |
| ¿Hay algún dato del CSV que NO uses nunca? | |

---

## 📝 Mapeo Actual Supabase ↔ CSV

| Schema Supabase Actual | Campo CSV Correspondiente | Estado |
|------------------------|---------------------------|--------|
| `units.id` | `OP` | ✅ Mapeado |
| `units.tipologia` | `Tipologia` | ✅ Mapeado |
| `units.price` | `Arriendo Total` | ✅ Mapeado |
| `units.m2` | `m2 Depto` | ✅ Mapeado |
| `units.estacionamiento` | `Estac` | ✅ Mapeado |
| `units.bodega` | `Bod` | ✅ Mapeado |
| `units.disponible` | `Estado` | ✅ Mapeado |
| `buildings.name` | `Condominio` | ✅ Mapeado |
| `buildings.address` | `Direccion` | ✅ Mapeado |
| `buildings.comuna` | `Comuna` | ✅ Mapeado |
| ❌ No existe | `GC Total` | ⚠️ FALTA |
| ❌ No existe | `Orientacion` | ⚠️ FALTA |
| ❌ No existe | `m2 Terraza` | ⚠️ FALTA |
| ❌ No existe | `% Descuento` | ⚠️ FALTA |
| ❌ No existe | `Cant. Meses Descuento` | ⚠️ FALTA |
| ❌ No existe | `Cant. Garantías` | ⚠️ FALTA |
| ❌ No existe | `Cuotas Garantía` | ⚠️ FALTA |
| ❌ No existe | `Rentas Necesarias` | ⚠️ FALTA |
| ❌ No existe | `Acepta Mascotas?` | ⚠️ FALTA |
| ❌ No existe | `Reajuste por contrato` | ⚠️ FALTA |
| ❌ No existe | `Link Listing` | ⚠️ FALTA |

---

**📅 Última actualización:** _______________  
**👤 Completado por:** _______________

---

> **Próximo paso:** Una vez completes este formulario, actualizaré el schema de Supabase para incluir los campos marcados como "Sí".
