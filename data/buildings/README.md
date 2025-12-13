# Edificios - Datos Individuales

Esta carpeta contiene archivos JSON individuales para cada edificio, listos para importar al sistema.

> **Nota:** Actualmente todos los datos de edificios provienen de Supabase. Esta carpeta se mantiene para futuras importaciones manuales si es necesario.

## Estructura

Cada archivo JSON sigue el schema `BuildingSchema` definido en `schemas/models.ts`:

- **id**: Identificador único del edificio
- **slug**: URL-friendly identifier
- **name**: Nombre del edificio
- **comuna**: Comuna (sin números)
- **address**: Dirección completa
- **amenities**: Array de amenidades (mínimo 1)
- **gallery**: Array de imágenes (mínimo 3)
- **units**: Array de unidades (mínimo 1)
- **gastosComunes**: Campo opcional en unidades para gastos comunes

## Edificios en Producción

### Guillermo Mann
- **Slug**: `guillermo-mann-74012ca7`
- **ID**: `74012ca7-a07f-4364-9164-a8859814b739`
- **Ubicación**: Ñuñoa
- **Dirección**: Av. Vicuña Mackenna 2362
- **Tipologías**: Estudio, 1D1B, 2D2B
- **Fuente**: Supabase (datos reales)
- **URL**: `/property/guillermo-mann-74012ca7`

## Cómo Importar

### Opción 1: Panel de Administración
1. Ir a `/admin/buildings`
2. Clic en "Importar"
3. Seleccionar el archivo JSON
4. Confirmar importación

### Opción 2: API Directa
```bash
curl -X POST http://localhost:3000/api/admin/buildings \
  -H "Content-Type: application/json" \
  -d @data/buildings/[nombre-edificio].json
```

## Validación

Todos los archivos deben cumplir con:
- ✅ `BuildingSchema` de Zod
- ✅ Mínimo 3 imágenes en gallery
- ✅ Mínimo 1 amenidad
- ✅ Mínimo 1 unidad válida
- ✅ Unidades con `UnitSchema` válido

## Notas

- Los campos opcionales pueden omitirse
- `gastosComunes` es opcional en unidades
- Las imágenes deben existir en `/public/images/`
- Los precios deben ser enteros positivos
- **Los datos en producción provienen de Supabase**, no de archivos JSON locales










