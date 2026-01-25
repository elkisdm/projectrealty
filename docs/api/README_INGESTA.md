# 🚀 SISTEMA DE INGESTA HOMMIE - GUÍA RÁPIDA

> **Sistema Master de Ingesta de Datos - Proceso Estándar Oficial**

## ⚡ **INICIO RÁPIDO**

### 1. **Ingesta Estándar** (Recomendado)
```bash
# Colocar CSV en data/sources/assetplan-export.csv
pnpm run ingest
```

### 2. **Verificar Resultados**
```bash
pnpm run verify:real-data
```

### 3. **Ver Estadísticas**
```bash
pnpm run tools stats
```

---

## 📋 **COMANDOS PRINCIPALES**

| Comando | Descripción | Uso |
|---------|-------------|-----|
| `pnpm run ingest` | **Ingesta estándar** | Proceso principal |
| `pnpm run ingest:master` | Ingesta con detalles | Debug y desarrollo |
| `pnpm run verify:real-data` | Verificar datos cargados | Post-ingesta |
| `pnpm run tools stats` | Estadísticas detalladas | Monitoreo |
| `pnpm run tools verify` | Verificar integridad | Mantenimiento |
| `pnpm run tools clean assetplan` | Limpiar datos | Emergencia |

---

## 🎯 **PROCESO ESTÁNDAR**

### **Preparación**
1. ✅ Archivo CSV en `data/sources/assetplan-export.csv`
2. ✅ Credenciales Supabase en `.env.local`
3. ✅ `USE_SUPABASE=true`

### **Ejecución**
```bash
pnpm run ingest
```

### **Resultado Esperado**
- 📊 ~1,400 unidades procesadas
- 🏗️ ~270 edificios únicos
- ⏱️ ~4 segundos de duración
- ✅ 98%+ tasa de éxito
- 💾 Backup automático creado

---

## 📊 **CARACTERÍSTICAS**

### ✅ **Funcionalidades**
- **Backup automático** antes de cada ingesta
- **Parsing robusto** de números chilenos
- **Mapeo de tipologías** a formato canónico
- **Detección automática** de edificios existentes
- **Procesamiento en lotes** (100 unidades)
- **Reintentos automáticos** (3 intentos por lote)
- **Reportes detallados** con métricas
- **Validación de integridad** automática

### 🔧 **Configuración**
- **Archivo**: `config/ingesta.config.js`
- **Documentación**: `docs/INGESTA_MASTER.md`
- **Backups**: `backups/{timestamp}/`
- **Reportes**: `reports/ingesta-*.json`

---

## 🏗️ **DATOS PROCESADOS**

### **Entrada: CSV AssetPlan**
- **Formato**: Separado por `;` (punto y coma)
- **Encoding**: UTF-8
- **Campos**: 36 columnas esperadas
- **Filas**: ~1,400 unidades típicas

### **Salida: Supabase**
- **Tabla `buildings`**: Edificios únicos
- **Tabla `units`**: Unidades individuales
- **Relación**: 1 edificio → N unidades
- **Campos v2**: Listos para cotizaciones

---

## ⚠️ **SOLUCIÓN DE PROBLEMAS**

### **Errores Comunes**

| Error | Causa | Solución |
|-------|--------|----------|
| `Credenciales no configuradas` | Falta `.env.local` | `pnpm run update:credentials` |
| `ENOENT: no such file` | CSV no encontrado | Copiar a `data/sources/` |
| `numeric field overflow` | Números muy grandes | Automático (convierte a 0) |
| `Conexión fallida` | Supabase offline | Verificar credenciales |

### **Comandos de Diagnóstico**
```bash
pnpm run debug:supabase          # Verificar conexión
pnpm run inspect:schema          # Revisar estructura
pnpm run test:mapping           # Probar mapeo
pnpm run tools verify           # Integridad de datos
```

---

## 📈 **MÉTRICAS TÍPICAS**

### **Performance**
- ⏱️ **Duración**: 4-6 segundos
- 📦 **Lotes**: 15 lotes de 100 unidades
- 🔄 **Reintentos**: <1% de lotes fallan
- 💾 **Backup**: 2-5 MB por backup

### **Datos**
- 🏗️ **Edificios**: ~270 únicos
- 🏠 **Unidades**: ~1,400 total
- ✅ **Disponibles**: ~1,000 (70%)
- 📊 **Validez**: 98%+ datos válidos

### **Calidad**
- ✅ **Precios válidos**: 100k - 5M CLP
- ✅ **Áreas válidas**: 10 - 300 m²
- ✅ **Tipologías**: Studio, 1D1B, 2D1B, 2D2B, 3D2B
- ✅ **Estados**: Lista/Acondicionamiento

---

## 🔄 **FLUJO DE TRABAJO**

### **Actualización Regular** (Semanal)
```bash
# 1. Obtener nuevo CSV de AssetPlan
cp nuevo-export.csv data/sources/assetplan-export.csv

# 2. Ejecutar ingesta
pnpm run ingest

# 3. Verificar resultados
pnpm run verify:real-data

# 4. Ver estadísticas (opcional)
pnpm run tools stats
```

### **Mantenimiento** (Mensual)
```bash
# Verificar integridad
pnpm run tools verify

# Limpiar backups antiguos (manual)
ls backups/

# Ver reportes históricos
ls reports/
```

### **Emergencia** (Si algo falla)
```bash
# 1. Ver último backup
pnpm run tools backups

# 2. Limpiar datos problemáticos
pnpm run tools clean assetplan

# 3. Re-ejecutar ingesta
pnpm run ingest

# 4. Verificar reparación
pnpm run tools verify
```

---

## 📚 **DOCUMENTACIÓN COMPLETA**

### **Archivos Clave**
- 📖 **Guía completa**: `docs/INGESTA_MASTER.md`
- ⚙️ **Configuración**: `config/ingesta.config.js`
- 🔧 **Scripts**: `scripts/ingest-*.mjs`

### **Estructura de Archivos**
```
data/sources/          # CSVs de entrada
  assetplan-export.csv # Archivo principal

backups/              # Backups automáticos
  2024-01-15T10-30/   # Por timestamp
    buildings.json
    units.json

reports/              # Reportes de ingesta
  ingesta-*.json      # Por ejecución

config/               # Configuración
  ingesta.config.js   # Parámetros del sistema
```

---

## 🎯 **PRÓXIMOS PASOS**

Una vez completada la ingesta:

1. ✅ **Verificar datos**: `pnpm run verify:real-data`
2. 🚀 **Iniciar aplicación**: `pnpm run dev`
3. 💰 **Probar cotizaciones**: Navegar a `/cotizador`
4. 🏠 **Explorar propiedades**: Ver catálogo actualizado

---

## 🆘 **SOPORTE**

### **Contacto Técnico**
- 📧 **Issues**: Crear issue en repositorio
- 📖 **Docs**: `docs/INGESTA_MASTER.md`
- 🔧 **Config**: `config/ingesta.config.js`

### **Auto-Diagnóstico**
```bash
pnpm run tools help     # Ver todos los comandos
pnpm run debug:supabase # Verificar conectividad
pnpm run tools verify   # Verificar integridad
```

---

**🎉 ¡Sistema de Ingesta Master listo para usar!**

> *Última actualización: Enero 2024*  
> *Versión: 1.0.0 Master Edition*
