// Configuración estándar del sistema de ingesta Hommie
// Este archivo define los parámetros por defecto para la ingesta de datos

export const INGESTA_CONFIG = {
  // Configuración de procesamiento
  BATCH_SIZE: 100,              // Unidades por lote en Supabase
  MAX_RETRIES: 3,               // Reintentos por lote fallido
  RETRY_DELAY_MS: 1000,         // Delay base entre reintentos
  
  // Proveedor de datos
  PROVIDER: 'assetplan',         // Identificador del proveedor principal
  CSV_DELIMITER: ';',           // Separador de campos en CSV
  CSV_ENCODING: 'utf-8',        // Codificación del archivo
  
  // Características del sistema
  BACKUP_ENABLED: true,         // Crear backup antes de ingesta
  VALIDATION_ENABLED: true,     // Validar datos antes de insertar
  PROGRESS_LOGGING: true,       // Mostrar progreso detallado
  
  // Archivos y directorios
  DEFAULT_CSV_FILE: 'assetplan-export.csv',
  SOURCES_DIR: '_workspace/data/sources',
  BACKUP_DIR: '_workspace/data/backups',
  REPORTS_DIR: '_workspace/docs/reports',
  
  // Límites de validación
  MAX_INTEGER: 2147483647,      // Límite PostgreSQL INTEGER
  MIN_PRICE: 100000,            // Precio mínimo válido (CLP)
  MAX_PRICE: 5000000,           // Precio máximo válido (CLP)
  MIN_AREA: 10,                 // Área mínima válida (m²)
  MAX_AREA: 300,                // Área máxima válida (m²)
  
  // Estados de disponibilidad reconocidos
  ESTADOS_DISPONIBLES: [
    'Lista para arrendar',
    'RE - Acondicionamiento'
  ],
  
  // Mapeo de tipologías a formato canónico
  TIPOLOGIA_MAPPING: {
    'Estudio': 'Studio',
    '1D1B': '1D1B',
    '2D1B (3C)': '2D1B',
    '2D1B (4C)': '2D1B', 
    '2D1B': '2D1B',
    '2D2B (4C)': '2D2B',
    '2D2B': '2D2B',
    '3D2B': '3D2B'
  },
  
  // Mapeo de orientaciones válidas
  ORIENTACION_MAPPING: {
    'N': 'N', 'NE': 'NE', 'E': 'E', 'SE': 'SE',
    'S': 'S', 'SO': 'SO', 'O': 'O', 'NO': 'NO',
    'NP': 'N',    // Norte genérico
    'SP': 'S',    // Sur genérico
    'P': undefined // Sin orientación específica
  },
  
  // Campos obligatorios en el CSV
  REQUIRED_CSV_FIELDS: [
    'OP',                    // Código de unidad
    'Direccion',             // Dirección del edificio
    'Comuna',                // Comuna
    'Condominio',            // Nombre del edificio
    'Tipologia',             // Tipología de la unidad
    'Arriendo Total',        // Precio de arriendo
    'Estado'                 // Estado de la unidad
  ],
  
  // Campos opcionales con valores por defecto
  OPTIONAL_FIELDS_DEFAULTS: {
    'GC Total': 0,
    'm2 Depto': null,
    'm2 Terraza': null,
    'Cuotas Garantía': 3,
    'Cant. Garantías (Meses)': 1,
    'Rentas Necesarias': 3.0,
    'Acepta Mascotas?': false
  },
  
  // Configuración de logging
  LOG_LEVELS: {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3
  },
  CURRENT_LOG_LEVEL: 2,       // INFO por defecto
  
  // Configuración de reportes
  GENERATE_REPORTS: true,
  REPORT_FORMAT: 'json',      // json | csv | both
  INCLUDE_SAMPLE_DATA: true,  // Incluir ejemplos en reporte
  
  // Configuración de performance
  MEMORY_LIMIT_MB: 512,       // Límite de memoria sugerido
  TIMEOUT_MS: 300000,         // Timeout total (5 minutos)
  CHUNK_SIZE: 1000,           // Filas por chunk en memoria
  
  // Validaciones específicas de AssetPlan
  ASSETPLAN_VALIDATIONS: {
    CODIGO_PATTERN: /^[A-Z]{2,4}D?\d+$/,  // Patrón código unidad
    PRECIO_MIN_CUARTIL: 200000,            // Filtro outliers precio
    PRECIO_MAX_CUARTIL: 2000000,
    AREA_MIN_CUARTIL: 15,                  // Filtro outliers área
    AREA_MAX_CUARTIL: 150
  }
};

// Configuración específica por ambiente
export const ENVIRONMENT_CONFIGS = {
  development: {
    ...INGESTA_CONFIG,
    CURRENT_LOG_LEVEL: 3,      // DEBUG en desarrollo
    BATCH_SIZE: 50,            // Lotes más pequeños
    BACKUP_ENABLED: false      // Sin backup en dev
  },
  
  staging: {
    ...INGESTA_CONFIG,
    CURRENT_LOG_LEVEL: 2,      // INFO en staging
    VALIDATION_ENABLED: true,
    BACKUP_ENABLED: true
  },
  
  production: {
    ...INGESTA_CONFIG,
    CURRENT_LOG_LEVEL: 1,      // WARN en producción
    BATCH_SIZE: 200,           // Lotes más grandes
    MAX_RETRIES: 5,            // Más reintentos
    BACKUP_ENABLED: true,      // Backup obligatorio
    VALIDATION_ENABLED: true
  }
};

// Función para obtener configuración según ambiente
export function getConfig(environment = 'development') {
  return ENVIRONMENT_CONFIGS[environment] || INGESTA_CONFIG;
}

export default INGESTA_CONFIG;
