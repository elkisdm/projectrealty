# 🔍 Diagnóstico: Unidades no aparecen en la página

## ✅ Estado Actual

### Conexión a Supabase
- ✅ **Conexión exitosa**
- ✅ **Variables de entorno configuradas correctamente**
- ✅ **1 edificio en la base de datos**: "Guillermo Mann"
- ✅ **16 unidades disponibles** en Supabase

### API `/api/buildings`
- ✅ **Funciona correctamente** después de corregir la query
- ✅ **Retorna 12 unidades** (página 1 de 16 totales)
- ✅ **Query corregida**: Eliminadas columnas inexistentes (`unidad`, `area_interior_m2`, etc.)

### Query de `readFromSupabase()` en `lib/data.ts`
- ✅ **Funciona correctamente**
- ✅ **Retorna 1 edificio con 16 unidades**
- ✅ **Comuna**: "Ñuñoa" (con Ñ mayúscula)

## 🔴 Problema Identificado

### `getFeaturedUnits()` no encuentra unidades

El componente `FeaturedUnitsSection` usa `getFeaturedUnits()` que:
1. Llama a `getAllBuildings()` de `lib/data.ts`
2. Filtra por comuna: 'Ñuñoa', 'Las Condes', 'Providencia'
3. Si no encuentra unidades, retorna `null` (no muestra nada)

### Posibles causas:

1. **`getAllBuildings()` no retorna datos en runtime del servidor**
   - Aunque la query funciona en tests, podría haber un problema en el servidor
   - Verificar logs del servidor cuando se renderiza la página

2. **Problema de normalización de comuna**
   - La comuna en DB es "Ñuñoa" (con Ñ mayúscula)
   - El filtro busca exactamente "Ñuñoa"
   - Podría haber un problema de encoding o normalización

3. **Filtro de unidades disponibles**
   - `getFeaturedUnits()` filtra solo unidades con `disponible = true`
   - Aunque todas las unidades tienen `disponible = true`, podría haber un problema en el mapeo

## 🔧 Soluciones Aplicadas

1. ✅ **Corregida query en `supabase-data-processor.ts`**
   - Eliminadas columnas inexistentes de la query
   - API `/api/buildings` ahora funciona

2. ✅ **Agregados logs de depuración**
   - Logs en `getFeaturedUnits()` para ver qué está pasando
   - Logs en `readAll()` para verificar datos

## 📋 Próximos Pasos

1. **Verificar logs del servidor** cuando se carga la página
2. **Verificar si `getAllBuildings()` retorna datos** en runtime
3. **Verificar normalización de comuna** en el filtro
4. **Verificar si las imágenes son el problema** (aunque `UnitCard` tiene fallback)

## 🎯 Nota sobre Imágenes

**NO es un problema de imágenes:**
- `UnitCard` tiene fallback a `/images/default-unit.jpg`
- Las unidades deberían mostrarse aunque no tengan imágenes
- El problema es que `FeaturedUnitsSection` retorna `null` porque no encuentra unidades

## 🔍 Comandos de Diagnóstico

```bash
# Verificar API
curl "http://localhost:3000/api/buildings?limit=2"

# Verificar query directa
node scripts/test-supabase-connection.mjs

# Verificar unidades disponibles
node scripts/check-units-disponible.mjs
```
