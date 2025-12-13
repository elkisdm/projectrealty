# 🚀 Guía: Ingesta Directa desde Supabase

## 📋 Proceso Paso a Paso

### 1. Preparar el Archivo CSV

Coloca tu archivo CSV de AssetPlan en la carpeta de fuentes:

```bash
# Opción A: Usar el archivo existente
# El archivo ya está en: _workspace/data/sources/assetplan-export.csv

# Opción B: Copiar tu archivo nuevo
cp "/Users/macbookpro/Downloads/export (9).csv" _workspace/data/sources/assetplan-export.csv
```

### 2. Verificar Credenciales de Supabase

Asegúrate de que tu `.env.local` tenga:

```bash
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
USE_SUPABASE=true
```

### 3. Ejecutar la Ingesta

#### Opción A: Ingesta Estándar (Recomendado)
```bash
pnpm run ingest
```

Este comando:
- ✅ Lee el CSV de `_workspace/data/sources/assetplan-export.csv`
- ✅ Crea backup automático
- ✅ Parsea y valida los datos
- ✅ Agrupa por edificios
- ✅ Carga a Supabase en lotes de 100
- ✅ Genera reporte detallado

#### Opción B: Ingesta con Detalles (Debug)
```bash
pnpm run ingest:master
```

Muestra información detallada del proceso.

### 4. Verificar Resultados

```bash
# Verificar que los datos se cargaron correctamente
pnpm run verify:real-data

# Ver estadísticas detalladas
pnpm run tools stats

# Verificar integridad de datos
pnpm run tools verify
```

---

## 📊 Resultado Esperado

Al ejecutar `pnpm run ingest`, deberías ver:

```
🚀 INGESTA MASTER - SISTEMA HOMMIE
===================================
📄 Leyendo CSV: data/sources/assetplan-export.csv
📊 Filas encontradas: 1400
🔄 Procesando en lotes de 100...
✅ Lote 1/15: 100 unidades insertadas
✅ Lote 2/15: 100 unidades insertadas
...
🎉 ¡INGESTA COMPLETADA EXITOSAMENTE!

📊 Estadísticas:
- Edificios: 270
- Unidades: 1400
- Disponibles: 1000
- Duración: 4.2s
```

---

## 🔧 Comandos Adicionales

### Ver Estadísticas
```bash
pnpm run tools stats
```

### Limpiar Datos (Emergencia)
```bash
pnpm run tools clean assetplan
```

### Verificar Conexión a Supabase
```bash
pnpm run debug:supabase
```

### Inspeccionar Schema
```bash
pnpm run inspect:schema
```

---

## ⚠️ Solución de Problemas

### Error: "Credenciales no configuradas"
```bash
# Verificar que .env.local existe y tiene las credenciales
cat .env.local | grep SUPABASE
```

### Error: "CSV no encontrado"
```bash
# Verificar que el archivo existe
ls -la _workspace/data/sources/assetplan-export.csv
```

### Error: "Conexión fallida"
```bash
# Probar conexión
pnpm run debug:supabase
```

---

## 📝 Notas Importantes

1. **Backup Automático**: Se crea un backup antes de cada ingesta en `_workspace/data/backups/`
2. **Procesamiento en Lotes**: Las unidades se procesan en lotes de 100 para mejor performance
3. **Reintentos Automáticos**: Si un lote falla, se reintenta hasta 3 veces
4. **Reportes**: Los reportes se guardan en `_workspace/docs/reports/ingesta-*.json`

---

## 🎯 Flujo Completo

```bash
# 1. Preparar CSV
cp "tu-archivo.csv" _workspace/data/sources/assetplan-export.csv

# 2. Ejecutar ingesta
pnpm run ingest

# 3. Verificar resultados
pnpm run verify:real-data

# 4. Ver estadísticas
pnpm run tools stats
```









