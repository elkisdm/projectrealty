# 📊 SISTEMA DE INGESTA MASTER - HOMMIE

## 🎯 **RESUMEN**

El Sistema de Ingesta Master es el proceso estándar para cargar datos de propiedades desde archivos CSV de AssetPlan hacia la base de datos Supabase de Hommie. Este sistema ha sido diseñado para ser robusto, reutilizable y tolerante a fallos.

---

## 🚀 **USO RÁPIDO**

### Comando Principal
```bash
# Ingesta estándar con archivo por defecto
pnpm run ingest

# Ingesta con archivo específico  
pnpm run ingest mi-archivo.csv

# Versión detallada
pnpm run ingest:master
```

### Preparación
1. **Colocar CSV** en `data/sources/assetplan-export.csv`
2. **Verificar credenciales** Supabase en `.env.local`
3. **Ejecutar ingesta**: `pnpm run ingest`
4. **Verificar resultados**: `pnpm run verify:real-data`

---

## 📋 **PROCESO COMPLETO**

### 1. **Pre-Ingesta**
- ✅ Validación de credenciales Supabase
- ✅ Verificación de archivo CSV
- ✅ Creación de backup automático (opcional)
- ✅ Inicialización de métricas

### 2. **Procesamiento CSV**
- 📄 Lectura con encoding UTF-8
- 🔍 Detección automática de headers
- ⚠️ Manejo de filas malformadas
- 📊 Parsing de números chilenos (puntos/comas)
- 🏗️ Agrupación por edificios

### 3. **Transformación**
- 🔄 Mapeo a esquema Supabase
- 📐 Normalización de tipologías
- 🧭 Mapeo de orientaciones
- 💰 Cálculo de rangos de precios
- ✅ Validación de datos

### 4. **Carga a Supabase**
- 🏗️ Detección de edificios existentes
- 🧹 Limpieza de datos anteriores
- 📦 Inserción en lotes de 100
- 🔄 Reintentos automáticos (3x)
- 📊 Logging detallado

### 5. **Post-Ingesta**
- 📋 Generación de reporte detallado
- 🔍 Verificación de datos cargados
- 📁 Guardado de métricas
- ✅ Confirmación de éxito

---

## 📊 **DATOS PROCESADOS**

### Campos Principales CSV
| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| `OP` | Código único de unidad | `AMGD104` |
| `Direccion` | Dirección del edificio | `Gral Amengual 102` |
| `Comuna` | Comuna | `Estación Central` |
| `Condominio` | Nombre del edificio | `Amengual` |
| `Tipologia` | Tipo de unidad | `2D1B (3C)` |
| `Arriendo Total` | Precio mensual | `350000.00` |
| `GC Total` | Gastos comunes | `91000.00` |
| `m2 Depto` | Área interior | `40.34` |
| `Estado` | Estado disponibilidad | `Lista para arrendar` |

### Transformaciones Aplicadas
- **Tipologías**: `2D1B (3C)` → `2D1B`
- **Precios**: `350.000,00` → `350000`
- **Áreas**: `40,34` → `40.34`
- **Orientaciones**: `NP` → `N`
- **Disponibilidad**: `Lista para arrendar` → `true`

---

## ⚙️ **CONFIGURACIÓN**

### Archivo: `config/ingesta.config.js`

```javascript
export const INGESTA_CONFIG = {
  BATCH_SIZE: 100,              // Unidades por lote
  MAX_RETRIES: 3,               // Reintentos por lote
  PROVIDER: 'assetplan',        // Proveedor de datos
  CSV_DELIMITER: ';',           // Separador CSV
  BACKUP_ENABLED: true,         // Crear backup
  VALIDATION_ENABLED: true      // Validar datos
};
```

### Variables de Entorno Requeridas
```bash
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
USE_SUPABASE=true
```

---

## 🏗️ **ARQUITECTURA DE DATOS**

### Esquema Supabase

#### Tabla `buildings`
```sql
CREATE TABLE buildings (
  id UUID PRIMARY KEY,
  provider TEXT NOT NULL,
  source_building_id TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  comuna TEXT NOT NULL,
  direccion TEXT,
  precio_desde INTEGER,
  precio_hasta INTEGER,
  has_availability BOOLEAN DEFAULT TRUE,
  gc_mode TEXT DEFAULT 'MF',
  featured BOOLEAN DEFAULT FALSE
);
```

#### Tabla `units`
```sql
CREATE TABLE units (
  id UUID PRIMARY KEY,
  provider TEXT NOT NULL,
  source_unit_id TEXT NOT NULL,
  building_id UUID REFERENCES buildings(id),
  unidad TEXT,
  tipologia TEXT NOT NULL,
  bedrooms INTEGER,
  bathrooms INTEGER,
  area_m2 DECIMAL(5,2),
  precio INTEGER NOT NULL,
  disponible BOOLEAN DEFAULT TRUE,
  guarantee_installments INTEGER,
  rentas_necesarias DECIMAL(3,2),
  -- ... más campos
);
```

---

## 🔧 **SCRIPTS AUXILIARES**

### Diagnóstico
```bash
pnpm run debug:supabase        # Verificar conexión
pnpm run inspect:schema        # Revisar estructura
pnpm run verify:real-data      # Validar datos cargados
```

### Mantenimiento
```bash
pnpm run update:credentials    # Actualizar credenciales
pnpm run test:mapping         # Probar mapeo de datos
```

---

## 📈 **MÉTRICAS Y REPORTES**

### Reporte Automático
Cada ingesta genera un reporte en `reports/ingesta-{timestamp}.json`:

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "duration": 45,
  "stats": {
    "totalRows": 1473,
    "processedRows": 1447,
    "skippedRows": 26,
    "buildings": 270,
    "units": 1447,
    "errors": []
  },
  "config": { ... }
}
```

### Métricas Típicas
- **Procesamiento**: ~1,400 unidades en 45 segundos
- **Edificios únicos**: ~270 edificios
- **Tasa de éxito**: >95% de filas válidas
- **Disponibilidad**: ~70% unidades disponibles

---

## ⚠️ **MANEJO DE ERRORES**

### Errores Comunes y Soluciones

| Error | Causa | Solución |
|-------|-------|----------|
| `Credenciales no configuradas` | Falta `.env.local` | Ejecutar `pnpm run update:credentials` |
| `numeric field overflow` | Números muy grandes | Automático: convertir a 0 |
| `Could not find column` | Schema desactualizado | Verificar mapeo de campos |
| `ENOENT: no such file` | CSV no encontrado | Colocar archivo en `data/sources/` |

### Estrategia de Reintentos
1. **Fallo de lote**: Reintento automático 3x con delay incremental
2. **Fallo de conexión**: Reintento con backoff exponencial  
3. **Fallo crítico**: Abort con reporte detallado

---

## 🔄 **FLUJO DE ACTUALIZACIÓN**

### Ingesta Incremental
El sistema detecta automáticamente:
- ✅ **Edificios existentes**: Solo actualiza unidades
- ✅ **Edificios nuevos**: Inserta edificios + unidades  
- ✅ **Datos duplicados**: Evita duplicación por `source_unit_id`

### Proceso de Backup
1. **Backup automático** antes de cada ingesta
2. **Guardado en** `backups/{timestamp}/`
3. **Incluye**: `buildings.json` + `units.json`
4. **Retención**: Manual (no auto-limpieza)

---

## 🧪 **TESTING Y VALIDACIÓN**

### Suite de Pruebas
```bash
# Prueba completa del sistema
pnpm run test:mapping

# Verificación de datos
pnpm run verify:real-data

# Diagnóstico de conexión
pnpm run debug:supabase
```

### Validaciones Automáticas
- ✅ **Formato de códigos**: Patrón `^[A-Z]{2,4}D?\d+$`
- ✅ **Rangos de precios**: 100k - 5M CLP
- ✅ **Áreas válidas**: 10 - 300 m²
- ✅ **Tipologías canónicas**: Studio, 1D1B, 2D1B, 2D2B, 3D2B
- ✅ **Estados reconocidos**: Lista disponibles

---

## 📚 **CASOS DE USO**

### 1. **Primera Instalación**
```bash
# Setup inicial del proyecto
git clone proyecto
pnpm install
cp config/env.example .env.local
# Configurar credenciales Supabase
pnpm run ingest data/mi-export.csv
```

### 2. **Actualización Regular**
```bash
# Actualización semanal
cp nuevo-export.csv data/sources/assetplan-export.csv
pnpm run ingest
pnpm run verify:real-data
```

### 3. **Migración de Datos**
```bash
# Migración completa con backup
pnpm run ingest:master --backup-enabled
pnpm run verify:real-data
```

---

## 🎯 **PRÓXIMAS MEJORAS**

### Roadmap v2
- [ ] **Ingesta incremental** por fecha de modificación
- [ ] **Validación de duplicados** más inteligente  
- [ ] **Detección de cambios** de precios
- [ ] **Notificaciones** de fallos por email
- [ ] **Dashboard** de métricas en tiempo real
- [ ] **API REST** para ingesta programática
- [ ] **Soporte multi-proveedor** (no solo AssetPlan)

### Optimizaciones
- [ ] **Streaming CSV** para archivos grandes
- [ ] **Paralelización** de lotes
- [ ] **Compresión** de backups
- [ ] **Cache** de resultados
- [ ] **Monitoreo** de performance

---

## 🆘 **SOPORTE**

### Contacto
- **Documentación**: `docs/INGESTA_MASTER.md`
- **Configuración**: `config/ingesta.config.js`
- **Logs**: `reports/ingesta-*.json`
- **Backups**: `backups/{timestamp}/`

### Comandos de Emergencia
```bash
# Restaurar desde backup
cp backups/2024-01-15T10-30-00/buildings.json data/restore/
# Limpiar datos problemáticos
pnpm run clean:provider assetplan
# Verificar integridad
pnpm run verify:integrity
```

---

**🎉 ¡El Sistema de Ingesta Master está listo para usar!**

*Última actualización: Enero 2024*
