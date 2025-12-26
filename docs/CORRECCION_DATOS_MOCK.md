# ✅ Corrección: Eliminado fallback a datos mock cuando USE_SUPABASE=true

## Problema Identificado

En la página de "Ver todos los departamentos" (`/buscar`), se estaban mostrando propiedades mock en lugar de los datos reales de Supabase, incluso cuando `USE_SUPABASE=true`.

## Causa Raíz

En `lib/data.ts`, la función `readAll()` tenía un fallback que caía a `readFromMock()` cuando:
1. `USE_SUPABASE=true` pero `readFromSupabase()` retornaba un array vacío
2. `USE_SUPABASE=true` pero `readFromSupabase()` lanzaba un error

Esto causaba que se mostraran datos mock (como "Edificio Mirador de La Florida", "Parque Ñuñoa Residence", etc.) en lugar de los datos reales de Supabase.

## Solución Aplicada

### Cambio en `readAll()` - `lib/data.ts`

**Antes:**
```typescript
if (USE_SUPABASE) {
  try {
    const buildings = await readFromSupabase();
    if (buildings.length > 0) {
      return buildings;
    }
    // ❌ PROBLEMA: Caía a mocks si no había edificios
  } catch (error) {
    // ❌ PROBLEMA: Caía a mocks si había error
    return await readFromMock();
  }
}
return await readFromMock();
```

**Después:**
```typescript
if (USE_SUPABASE) {
  try {
    const buildings = await readFromSupabase();
    if (buildings.length > 0) {
      return buildings; // ✅ Retornar edificios de Supabase si hay
    } else {
      // ✅ NO caer a mocks - retornar array vacío
      logger.warn(`[readAll] ⚠️ USE_SUPABASE=true pero no se encontraron edificios en Supabase. Retornando array vacío.`);
      return [];
    }
  } catch (error) {
    // ✅ NO caer a mocks - retornar array vacío y loggear error
    logger.error(`[readAll] ❌ Error leyendo de Supabase:`, error);
    return [];
  }
}

// ✅ Solo usar mocks si USE_SUPABASE es explícitamente false
logger.log(`[readAll] USE_SUPABASE=false, usando datos mock`);
return await readFromMock();
```

## Comportamiento Actual

### Cuando `USE_SUPABASE=true`:
- ✅ **Si hay edificios en Supabase**: Retorna los edificios de Supabase
- ✅ **Si NO hay edificios en Supabase**: Retorna array vacío (NO mocks)
- ✅ **Si hay error leyendo Supabase**: Retorna array vacío y loggea error (NO mocks)

### Cuando `USE_SUPABASE=false`:
- ✅ Retorna datos mock (comportamiento esperado para desarrollo/testing)

## Verificación

Para verificar que funciona correctamente:

1. **Verificar variable de entorno:**
   ```bash
   grep USE_SUPABASE .env.production
   # Debe mostrar: USE_SUPABASE=true
   ```

2. **Verificar que no se muestran mocks:**
   - Ir a `/buscar` (Ver todos los departamentos)
   - NO deberían aparecer edificios como:
     - "Edificio Mirador de La Florida"
     - "Parque Ñuñoa Residence"
     - "Sky Alto Las Condes"
   - Solo deberían aparecer edificios que estén en Supabase

3. **Verificar logs del servidor:**
   ```bash
   # Buscar en logs:
   [readAll] USE_SUPABASE: true
   [readAll] Edificios desde Supabase: X
   ```

## Notas Importantes

1. **Si no aparecen unidades**: Verificar que:
   - `USE_SUPABASE=true` en `.env.production`
   - Hay edificios y unidades en Supabase
   - Las unidades tienen `disponible=true`
   - Los edificios pasan validación del schema

2. **Si aparecen datos mock**: Verificar que:
   - `USE_SUPABASE` NO esté configurado como `"true"` (debe ser exactamente `true`, no string)
   - El servidor esté leyendo `.env.production` correctamente

3. **Para desarrollo con mocks**: Configurar `USE_SUPABASE=false` en `.env.local`
