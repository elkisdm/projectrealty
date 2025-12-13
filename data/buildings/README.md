# Edificios - Datos Individuales

Esta carpeta contiene archivos JSON individuales para cada edificio, listos para importar al sistema.

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

## Edificios Disponibles

### Alferex Real
- **Archivo**: `alferex-real.json`
- **Ubicación**: Las Condes
- **Unidades**: 4 unidades (1D1B, 2D1B, 2D2B, 3D2B)
- **Precio desde**: $650,000 CLP
- **Precio hasta**: $1,350,000 CLP

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
  -d @data/buildings/alferex-real.json
```

### Opción 3: Script de Importación
```bash
# Crear script de importación (pendiente)
pnpm run import:building data/buildings/alferex-real.json
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










