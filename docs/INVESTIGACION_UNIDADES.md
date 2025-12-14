# 🔍 Investigación: Unidades no aparecen en la página

## ✅ Problemas Encontrados y Corregidos

### 1. Query de Supabase en `supabase-data-processor.ts`
**Problema:** La query intentaba seleccionar columnas que no existen en la tabla `units`:
- `unidad` ❌ (no existe)
- `area_interior_m2` ❌ (no existe)
- `gastos_comunes` ❌ (no existe)
- `piso`, `orientacion`, `amoblado`, `pet_friendly`, `status` ❌ (no existen)

**Corrección:** ✅ Eliminadas columnas inexistentes, usando solo:
- `id`, `building_id`, `tipologia`, `bedrooms`, `bathrooms`, `m2`, `price`, `disponible`, `estacionamiento`, `bodega`

**Resultado:** API `/api/buildings` ahora funciona correctamente (retorna 12 unidades de 16 totales)

### 2. Schema de `Unit` - `dormitorios`
**Problema:** Schema requería `dormitorios: z.number().int().positive()`, pero Studio tiene `dormitorios: 0`

**Corrección:** ✅ Cambiado a `z.number().int().nonnegative()` para permitir 0

### 3. Schema de `Unit` - `bedrooms`
**Problema:** Schema requería `bedrooms: z.number().int().positive().optional()`, pero Studio tiene `bedrooms: 0`

**Corrección:** ✅ Cambiado a `z.number().int().nonnegative().optional()`

### 4. Schema de `Building` - `amenities`
**Problema:** Schema requería `amenities: z.array(z.string().min(1)).min(1)`, pero edificio en Supabase tiene array vacío

**Corrección:** ✅ Agregado default `['Áreas comunes']` en el código de transformación

### 5. Schema de `Building` - `gallery`
**Problema:** Schema requería `gallery: z.array(z.string().min(1)).min(3)`, pero edificio en Supabase tiene array vacío

**Corrección:** ✅ Agregado lógica para completar gallery con 3 imágenes (cover_image repetido o default)

### 6. Schema de `Building` - `serviceLevel`
**Problema:** Schema requería `serviceLevel: z.enum(["pro", "standard"])`, pero edificio tiene `null`

**Corrección:** ✅ Ya era opcional, pero agregada validación para convertir `null` a `undefined`

## 🔴 Problema Pendiente

### `getAllBuildings()` retorna array vacío en runtime del servidor

**Síntomas:**
- ✅ Query directa a Supabase funciona (1 edificio, 16 unidades)
- ✅ API `/api/buildings` funciona (retorna 12 unidades)
- ❌ `getAllBuildings()` en `getFeaturedUnits()` retorna array vacío
- ❌ `FeaturedUnitsSection` retorna `null` porque no encuentra unidades

**Posibles causas:**

1. **Validación de Building falla silenciosamente**
   - El edificio podría estar fallando validación por algún campo que no hemos detectado
   - Los logs de error no se están mostrando en la consola del servidor

2. **Problema con `USE_SUPABASE` en runtime**
   - Aunque está configurado como `true`, podría no estar leyéndose correctamente en el servidor
   - El código podría estar cayendo a mocks en lugar de Supabase

3. **Problema con normalización de datos**
   - Las unidades podrían estar fallando validación de `UnitSchema`
   - El edificio podría estar siendo filtrado por alguna condición

## 📋 Próximos Pasos Recomendados

### 1. Verificar logs del servidor
```bash
# Ver logs en tiempo real
tail -f ~/.cursor/projects/Users-macbookpro-Documents-hommie-0-commission-next/terminals/[ID].txt
```

### 2. Agregar más logs de depuración
- En `readFromSupabase()` para ver cuántos edificios se obtienen antes de validación
- En `validateBuilding()` para ver qué edificios pasan/fallan validación
- En `getFeaturedUnits()` para ver qué está retornando `getAllBuildings()`

### 3. Verificar validación de unidades
- Las unidades Studio tienen `bedrooms: 0` y `dormitorios: 0`
- Verificar que `normalizeUnit()` esté generando todos los campos requeridos
- Verificar que `UnitSchema` valide correctamente unidades con `dormitorios: 0`

### 4. Test directo en runtime
- Crear un endpoint `/api/test-buildings` que llame a `getAllBuildings()` directamente
- Verificar qué retorna en runtime del servidor

## 🎯 Nota sobre Imágenes

**NO es un problema de imágenes:**
- `UnitCard` tiene fallback a `/images/default-unit.jpg`
- Las unidades deberían mostrarse aunque no tengan imágenes
- El problema es que `getFeaturedUnits()` no encuentra unidades porque `getAllBuildings()` retorna array vacío

## 🔧 Comandos Útiles

```bash
# Verificar API
curl "http://localhost:3000/api/buildings?limit=2"

# Verificar conexión Supabase
node scripts/test-supabase-connection.mjs

# Verificar unidades disponibles
node scripts/check-units-disponible.mjs

# Verificar query de edificios
node scripts/test-getAllBuildings.mjs
```
