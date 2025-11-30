#!/usr/bin/env node

/**
 * 🎨 CLI Final para Generador de SVGs Glass - Hommie Icon System
 * 
 * Interfaz de línea de comandos completamente independiente para procesar glyphs.json
 * y generar SVGs con efectos glass minimal.
 */

import { readFileSync, existsSync, writeFileSync, mkdirSync, readdirSync } from 'fs';
import { join, dirname, basename, extname, resolve } from 'path';
import { 
  IconSize, 
  StrokeWeight, 
  OpacityLevel, 
  IconVariant,
  ICON_SIZES,
  STROKE_WEIGHTS,
  OPACITY_LEVELS,
  LIGHT_PRESET,
  DARK_PRESET,
  BRAND_PRESET,
  getPreset
} from './tokens';

// ============================================================================
// INTERFACES Y TIPOS
// ============================================================================

/**
 * Estructura de un path SVG individual
 */
interface SVGPath {
  /** Comando SVG (M, L, C, etc.) */
  command: string;
  /** Parámetros del comando */
  params: number[];
  /** Atributos opcionales del path */
  attributes?: Record<string, string>;
}

/**
 * Estructura de un glyph individual
 */
interface Glyph {
  /** Nombre único del glyph */
  name: string;
  /** Array de paths SVG que forman el ícono */
  paths: SVGPath[];
  /** Tamaño recomendado (opcional) */
  recommendedSize?: IconSize;
  /** Stroke recomendado (opcional) */
  recommendedStroke?: StrokeWeight;
  /** Categoría del ícono (opcional) */
  category?: string;
  /** Tags para búsqueda (opcional) */
  tags?: string[];
  /** Descripción del ícono (opcional) */
  description?: string;
}

/**
 * Estructura completa del archivo glyphs.json
 */
interface GlyphsData {
  /** Metadatos del archivo */
  metadata: {
    /** Versión del formato */
    version: string;
    /** Fecha de generación */
    generatedAt: string;
    /** Autor o fuente */
    author?: string;
    /** Descripción del conjunto */
    description?: string;
  };
  /** Array de glyphs */
  glyphs: Glyph[];
  /** Configuración global (opcional) */
  config?: {
    /** Tamaño por defecto */
    defaultSize?: IconSize;
    /** Stroke por defecto */
    defaultStroke?: StrokeWeight;
    /** Preset por defecto */
    defaultPreset?: 'light' | 'dark' | 'brand';
  };
}

/**
 * Opciones de configuración para el generador
 */
interface GeneratorOptions {
  /** Preset a usar (light, dark, brand) */
  preset: 'light' | 'dark' | 'brand';
  /** Tamaños a generar */
  sizes: IconSize[];
  /** Strokes a generar */
  strokes: StrokeWeight[];
  /** Variantes a generar */
  variants: IconVariant[];
  /** Directorio de salida */
  outputDir: string;
  /** Si debe sobrescribir archivos existentes */
  overwrite: boolean;
  /** Nivel de verbosidad */
  verbose: boolean;
}

/**
 * Argumentos de línea de comandos
 */
interface CLIArgs {
  /** Archivo de entrada (glyphs.json) */
  input?: string;
  /** Directorio de salida */
  output?: string;
  /** Preset a usar */
  preset?: 'light' | 'dark' | 'brand';
  /** Tamaños a generar (comma-separated) */
  sizes?: string;
  /** Strokes a generar (comma-separated) */
  strokes?: string;
  /** Variantes a generar (comma-separated) */
  variants?: string;
  /** Si debe sobrescribir archivos existentes */
  overwrite?: boolean;
  /** Nivel de verbosidad */
  verbose?: boolean;
  /** Modo batch para múltiples archivos */
  batch?: boolean;
  /** Patrón de archivos para batch */
  pattern?: string;
  /** Si debe generar reporte */
  report?: boolean;
  /** Si debe validar solo (sin generar) */
  validate?: boolean;
  /** Si debe mostrar ayuda */
  help?: boolean;
}

/**
 * Resultado del procesamiento CLI
 */
interface CLIResult {
  /** Si el procesamiento fue exitoso */
  success: boolean;
  /** Mensaje de resultado */
  message: string;
  /** Estadísticas del procesamiento */
  stats?: {
    filesProcessed: number;
    glyphsProcessed: number;
    svgsGenerated: number;
    totalSize: number;
    errors: number;
  };
  /** Errores si los hay */
  errors?: string[];
}

// ============================================================================
// FUNCIONES DE VALIDACIÓN
// ============================================================================

/**
 * Valida que un path SVG sea válido
 */
function isValidSVGPath(path: SVGPath): boolean {
  if (!path.command || typeof path.command !== 'string') {
    return false;
  }
  
  if (!Array.isArray(path.params)) {
    return false;
  }
  
  // Validar que todos los parámetros sean números
  return path.params.every(param => typeof param === 'number' && !isNaN(param));
}

/**
 * Valida que un glyph sea válido
 */
function isValidGlyph(glyph: Glyph): boolean {
  if (!glyph.name || typeof glyph.name !== 'string') {
    return false;
  }
  
  if (!Array.isArray(glyph.paths) || glyph.paths.length === 0) {
    return false;
  }
  
  // Validar que todos los paths sean válidos
  return glyph.paths.every(isValidSVGPath);
}

/**
 * Valida que los datos de glyphs sean válidos
 */
function validateGlyphsData(data: unknown): data is GlyphsData {
  if (!data || typeof data !== 'object') {
    return false;
  }
  
  const glyphsData = data as GlyphsData;
  
  // Validar metadata
  if (!glyphsData.metadata || typeof glyphsData.metadata !== 'object') {
    return false;
  }
  
  if (!glyphsData.metadata.version || typeof glyphsData.metadata.version !== 'string') {
    return false;
  }
  
  // Validar glyphs
  if (!Array.isArray(glyphsData.glyphs)) {
    return false;
  }
  
  return glyphsData.glyphs.every(isValidGlyph);
}

/**
 * Lee y valida el archivo glyphs.json
 */
function readGlyphsFile(filePath: string): GlyphsData {
  console.log(`📖 Leyendo archivo: ${filePath}`);
  
  // Verificar que el archivo existe
  if (!existsSync(filePath)) {
    throw new Error(`❌ Archivo no encontrado: ${filePath}`);
  }
  
  try {
    // Leer el archivo
    const fileContent = readFileSync(filePath, 'utf-8');
    const data = JSON.parse(fileContent);
    
    // Validar la estructura
    if (!validateGlyphsData(data)) {
      throw new Error('❌ Formato de glyphs.json inválido');
    }
    
    console.log(`✅ Archivo leído correctamente`);
    console.log(`📊 Metadatos: v${data.metadata.version} - ${data.metadata.generatedAt}`);
    
    return data;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`❌ Error de sintaxis JSON en ${filePath}: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Analiza y reporta estadísticas de los glyphs
 */
function analyzeGlyphs(glyphs: Glyph[]): void {
  console.log(`\n📈 ANÁLISIS DE GLYPHS:`);
  console.log(`   Total de glyphs: ${glyphs.length}`);
  
  // Contar por categorías
  const categories = new Map<string, number>();
  const sizes = new Map<IconSize, number>();
  const strokes = new Map<StrokeWeight, number>();
  
  glyphs.forEach(glyph => {
    // Categorías
    const category = glyph.category || 'Sin categoría';
    categories.set(category, (categories.get(category) || 0) + 1);
    
    // Tamaños recomendados
    if (glyph.recommendedSize) {
      sizes.set(glyph.recommendedSize, (sizes.get(glyph.recommendedSize) || 0) + 1);
    }
    
    // Strokes recomendados
    if (glyph.recommendedStroke) {
      strokes.set(glyph.recommendedStroke, (strokes.get(glyph.recommendedStroke) || 0) + 1);
    }
  });
  
  // Mostrar estadísticas
  console.log(`\n   📂 Categorías:`);
  categories.forEach((count, category) => {
    console.log(`      ${category}: ${count} glyphs`);
  });
  
  console.log(`\n   📏 Tamaños recomendados:`);
  sizes.forEach((count, size) => {
    console.log(`      ${size}: ${count} glyphs`);
  });
  
  console.log(`\n   🖊️ Strokes recomendados:`);
  strokes.forEach((count, stroke) => {
    console.log(`      ${stroke}: ${count} glyphs`);
  });
  
  // Validar paths
  let totalPaths = 0;
  let validPaths = 0;
  
  glyphs.forEach(glyph => {
    totalPaths += glyph.paths.length;
    validPaths += glyph.paths.filter(isValidSVGPath).length;
  });
  
  console.log(`\n   🛣️ Paths SVG:`);
  console.log(`      Total: ${totalPaths}`);
  console.log(`      Válidos: ${validPaths}`);
  console.log(`      Inválidos: ${totalPaths - validPaths}`);
  
  if (validPaths < totalPaths) {
    console.log(`   ⚠️  Algunos paths SVG son inválidos`);
  }
}

// ============================================================================
// FUNCIONES DE GENERACIÓN
// ============================================================================

/**
 * Convierte un path SVG a string
 */
function pathToString(path: SVGPath): string {
  const command = path.command;
  const params = path.params.join(' ');
  const attributes = path.attributes || {};
  
  // Construir atributos
  const attrString = Object.entries(attributes)
    .map(([key, value]) => `${key}="${value}"`)
    .join(' ');
  
  return `<path d="${command} ${params}" ${attrString} />`;
}

/**
 * Genera un SVG con efectos glass
 */
function makeGlassSVG(
  glyph: Glyph,
  size: IconSize,
  stroke: StrokeWeight,
  variant: IconVariant,
  preset: ReturnType<typeof getPreset>
): string {
  const iconSize = ICON_SIZES[size];
  const strokeWidth = STROKE_WEIGHTS[stroke];
  
  // Convertir paths a strings
  const pathElements = glyph.paths.map(pathToString).join('\n    ');
  
  // Determinar colores según la variante
  let fillColor = 'none';
  let strokeColor = preset.colors.primary;
  
  switch (variant) {
    case 'filled':
      fillColor = preset.colors.primary;
      strokeColor = 'none';
      break;
    case 'duotone':
      fillColor = preset.colors.secondary;
      strokeColor = preset.colors.primary;
      break;
    case 'gradient':
      fillColor = `url(#${glyph.name}-gradient)`;
      strokeColor = preset.colors.primary;
      break;
    default: // outline
      fillColor = 'none';
      strokeColor = preset.colors.primary;
  }
  
  // Generar definiciones de gradiente si es necesario
  const gradientDefs = variant === 'gradient' 
    ? `
  <defs>
    <linearGradient id="${glyph.name}-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${preset.colors.primary};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${preset.colors.secondary};stop-opacity:1" />
    </linearGradient>
  </defs>`
    : '';
  
  // Generar filtros glass
  const glassFilter = `
  <defs>
    <filter id="glass-${glyph.name}" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
      <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="glow" />
      <feBlend in="SourceGraphic" in2="glow" mode="normal" />
    </filter>
  </defs>`;
  
  // Construir el SVG
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <title>${glyph.name} - ${variant} - ${size}</title>
  <desc>${glyph.description || `Ícono ${glyph.name} con estilo ${variant}`}</desc>
  ${gradientDefs}
  ${glassFilter}
  <g filter="url(#glass-${glyph.name})" style="backdrop-filter: ${preset.blur.medium};">
    <rect width="24" height="24" fill="${preset.colors.glass}" stroke="${preset.colors.glassBorder}" stroke-width="0.5" rx="4" />
    <g fill="${fillColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">
    ${pathElements}
    </g>
  </g>
</svg>`;
  
  return svg;
}

/**
 * Genera el nombre del archivo SVG
 */
function generateSVGFilename(glyph: Glyph, size: IconSize, stroke: StrokeWeight, variant: IconVariant): string {
  return `${glyph.name}-${variant}-${size}-${stroke}.svg`;
}

/**
 * Asegura que el directorio de salida existe
 */
function ensureOutputDirectory(outputDir: string): void {
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
    console.log(`📁 Directorio creado: ${outputDir}`);
  }
}

/**
 * Procesa todos los glyphs y genera SVGs
 */
function processGlyphs(glyphs: Glyph[], options: GeneratorOptions): void {
  console.log(`\n🎨 PROCESANDO GLYPHS:`);
  console.log(`   Preset: ${options.preset}`);
  console.log(`   Tamaños: ${options.sizes.join(', ')}`);
  console.log(`   Strokes: ${options.strokes.join(', ')}`);
  console.log(`   Variantes: ${options.variants.join(', ')}`);
  console.log(`   Salida: ${options.outputDir}`);
  
  // Obtener preset
  const preset = getPreset(options.preset);
  
  // Asegurar directorio de salida
  ensureOutputDirectory(options.outputDir);
  
  // Estadísticas
  let totalGenerated = 0;
  let totalSuccess = 0;
  let totalErrors = 0;
  let totalSize = 0;
  
  // Procesar cada glyph
  glyphs.forEach((glyph, index) => {
    console.log(`\n   📝 Procesando ${index + 1}/${glyphs.length}: ${glyph.name}`);
    
    let successCount = 0;
    let errorCount = 0;
    let sizeSum = 0;
    
    // Generar todas las combinaciones
    for (const size of options.sizes) {
      for (const stroke of options.strokes) {
        for (const variant of options.variants) {
          try {
            // Generar SVG
            const svgContent = makeGlassSVG(glyph, size, stroke, variant, preset);
            
            // Generar nombre de archivo
            const filename = generateSVGFilename(glyph, size, stroke, variant);
            const filepath = join(options.outputDir, filename);
            
            // Escribir archivo
            writeFileSync(filepath, svgContent, 'utf-8');
            
            // Obtener tamaño del archivo
            const stats = require('fs').statSync(filepath);
            
            successCount++;
            sizeSum += stats.size;
            
            if (options.verbose) {
              console.log(`   ✅ ${filename} (${stats.size} bytes)`);
            }
            
          } catch (error) {
            errorCount++;
            if (options.verbose) {
              const filename = generateSVGFilename(glyph, size, stroke, variant);
              console.log(`   ❌ ${filename}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
            }
          }
        }
      }
    }
    
    totalGenerated += options.sizes.length * options.strokes.length * options.variants.length;
    totalSuccess += successCount;
    totalErrors += errorCount;
    totalSize += sizeSum;
    
    console.log(`      ✅ ${successCount} exitosos, ❌ ${errorCount} errores, 📦 ${(sizeSum / 1024).toFixed(2)} KB`);
  });
  
  // Reporte final
  console.log(`\n📊 REPORTE FINAL:`);
  console.log(`   Total generados: ${totalGenerated}`);
  console.log(`   Exitosos: ${totalSuccess}`);
  console.log(`   Errores: ${totalErrors}`);
  console.log(`   Tamaño total: ${(totalSize / 1024).toFixed(2)} KB`);
  console.log(`   Tasa de éxito: ${((totalSuccess / totalGenerated) * 100).toFixed(1)}%`);
}

// ============================================================================
// UTILIDADES CLI
// ============================================================================

/**
 * Parsea argumentos de línea de comandos
 */
function parseArgs(): CLIArgs {
  const args: CLIArgs = {};
  const argv = process.argv.slice(2);
  
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const nextArg = argv[i + 1];
    
    switch (arg) {
      case '--input':
      case '-i':
        args.input = nextArg;
        i++;
        break;
      case '--output':
      case '-o':
        args.output = nextArg;
        i++;
        break;
      case '--preset':
      case '-p':
        args.preset = nextArg as 'light' | 'dark' | 'brand';
        i++;
        break;
      case '--sizes':
      case '-s':
        args.sizes = nextArg;
        i++;
        break;
      case '--strokes':
      case '-w':
        args.strokes = nextArg;
        i++;
        break;
      case '--variants':
      case '-v':
        args.variants = nextArg;
        i++;
        break;
      case '--overwrite':
        args.overwrite = true;
        break;
      case '--verbose':
        args.verbose = true;
        break;
      case '--batch':
        args.batch = true;
        break;
      case '--pattern':
        args.pattern = nextArg;
        i++;
        break;
      case '--report':
        args.report = true;
        break;
      case '--validate':
        args.validate = true;
        break;
      case '--help':
      case '-h':
        args.help = true;
        break;
    }
  }
  
  return args;
}

/**
 * Valida argumentos CLI
 */
function validateArgs(args: CLIArgs): string[] {
  const errors: string[] = [];
  
  // Validar preset
  if (args.preset && !['light', 'dark', 'brand'].includes(args.preset)) {
    errors.push('Preset debe ser: light, dark, o brand');
  }
  
  // Validar tamaños
  if (args.sizes) {
    const sizes = args.sizes.split(',');
    const validSizes: IconSize[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
    const invalidSizes = sizes.filter(size => !validSizes.includes(size as IconSize));
    if (invalidSizes.length > 0) {
      errors.push(`Tamaños inválidos: ${invalidSizes.join(', ')}`);
    }
  }
  
  // Validar strokes
  if (args.strokes) {
    const strokes = args.strokes.split(',');
    const validStrokes: StrokeWeight[] = ['thin', 'light', 'normal', 'bold'];
    const invalidStrokes = strokes.filter(stroke => !validStrokes.includes(stroke as StrokeWeight));
    if (invalidStrokes.length > 0) {
      errors.push(`Strokes inválidos: ${invalidStrokes.join(', ')}`);
    }
  }
  
  // Validar variantes
  if (args.variants) {
    const variants = args.variants.split(',');
    const validVariants: IconVariant[] = ['outline', 'filled', 'duotone', 'gradient'];
    const invalidVariants = variants.filter(variant => !validVariants.includes(variant as IconVariant));
    if (invalidVariants.length > 0) {
      errors.push(`Variantes inválidas: ${invalidVariants.join(', ')}`);
    }
  }
  
  return errors;
}

/**
 * Convierte argumentos CLI a opciones de generador
 */
function argsToOptions(args: CLIArgs): GeneratorOptions {
  return {
    preset: args.preset || 'light',
    sizes: args.sizes ? args.sizes.split(',') as IconSize[] : ['sm', 'md', 'lg'],
    strokes: args.strokes ? args.strokes.split(',') as StrokeWeight[] : ['light', 'normal'],
    variants: args.variants ? args.variants.split(',') as IconVariant[] : ['outline', 'filled'],
    outputDir: args.output || join(process.cwd(), 'public', 'icons', 'generated'),
    overwrite: args.overwrite || false,
    verbose: args.verbose || false
  };
}

/**
 * Muestra ayuda del CLI
 */
function showHelp(): void {
  console.log(`
🎨 Generador de SVGs Glass - Hommie Icon System

USO:
  npx ts-node scripts/icon-gen/cli-final.ts [OPCIONES]

OPCIONES:
  -i, --input <archivo>     Archivo glyphs.json de entrada (default: data/glyphs.json)
  -o, --output <directorio> Directorio de salida (default: public/icons/generated)
  -p, --preset <preset>     Preset a usar: light, dark, brand (default: light)
  -s, --sizes <tamaños>     Tamaños a generar: xs,sm,md,lg,xl,2xl (default: sm,md,lg)
  -w, --strokes <strokes>   Strokes a generar: thin,light,normal,bold (default: light,normal)
  -v, --variants <variantes> Variantes a generar: outline,filled,duotone,gradient (default: outline,filled)
  --overwrite               Sobrescribir archivos existentes
  --verbose                 Mostrar logs detallados
  --batch                   Modo batch para múltiples archivos
  --pattern <patrón>        Patrón de archivos para batch (ej: *.json)
  --report                  Generar reporte detallado
  --validate                Solo validar sin generar
  -h, --help                Mostrar esta ayuda

EJEMPLOS:
  # Generación básica
  npx ts-node scripts/icon-gen/cli-final.ts

  # Con preset oscuro y tamaños específicos
  npx ts-node scripts/icon-gen/cli-final.ts --preset dark --sizes md,lg

  # Solo validación
  npx ts-node scripts/icon-gen/cli-final.ts --validate

  # Modo verbose con reporte
  npx ts-node scripts/icon-gen/cli-final.ts --verbose --report

  # Batch processing
  npx ts-node scripts/icon-gen/cli-final.ts --batch --pattern "glyphs-*.json"
`);
}

// ============================================================================
// FUNCIÓN PRINCIPAL
// ============================================================================

/**
 * Función principal del CLI
 */
async function main(): Promise<void> {
  console.log(`🎨 Generador de SVGs Glass - Hommie Icon System\n`);
  
  try {
    // Parsear argumentos
    const args = parseArgs();
    
    // Mostrar ayuda si se solicita
    if (args.help) {
      showHelp();
      process.exit(0);
    }
    
    // Validar argumentos
    const validationErrors = validateArgs(args);
    if (validationErrors.length > 0) {
      console.error(`❌ Errores de validación:`);
      validationErrors.forEach(error => console.error(`   ${error}`));
      process.exit(1);
    }
    
    // Convertir a opciones
    const options = argsToOptions(args);
    
    // Mostrar configuración
    console.log(`⚙️  Configuración:`);
    console.log(`   Preset: ${options.preset}`);
    console.log(`   Tamaños: ${options.sizes.join(', ')}`);
    console.log(`   Strokes: ${options.strokes.join(', ')}`);
    console.log(`   Variantes: ${options.variants.join(', ')}`);
    console.log(`   Salida: ${options.outputDir}`);
    console.log(`   Verbose: ${options.verbose}`);
    
    // Leer archivo glyphs.json
    const inputFile = args.input || join(process.cwd(), 'data', 'glyphs.json');
    const glyphsData = readGlyphsFile(inputFile);
    
    // Analizar glyphs
    analyzeGlyphs(glyphsData.glyphs);
    
    // Mostrar configuración del archivo
    console.log(`\n⚙️  CONFIGURACIÓN:`);
    console.log(`   Preset por defecto: ${glyphsData.config?.defaultPreset || 'light'}`);
    console.log(`   Tamaño por defecto: ${glyphsData.config?.defaultSize || 'md'}`);
    console.log(`   Stroke por defecto: ${glyphsData.config?.defaultStroke || 'normal'}`);
    
    // Obtener preset
    const preset = getPreset(glyphsData.config?.defaultPreset || 'light');
    console.log(`\n🎨 Preset activo: ${preset.name}`);
    console.log(`   Colores: ${Object.keys(preset.colors).join(', ')}`);
    console.log(`   Blur: ${preset.blur.light}, ${preset.blur.medium}, ${preset.blur.strong}`);
    
    // Si solo validación, terminar aquí
    if (args.validate) {
      console.log(`\n✅ Validación exitosa: ${glyphsData.glyphs.length} glyphs válidos`);
      process.exit(0);
    }
    
    // Procesar glyphs
    processGlyphs(glyphsData.glyphs, options);
    
    console.log(`\n✅ Procesamiento completado exitosamente.`);
    
  } catch (error) {
    console.error(`\n❌ Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    process.exit(1);
  }
}

// ============================================================================
// EJECUCIÓN
// ============================================================================

// Ejecutar CLI solo si es el archivo principal
if (require.main === module) {
  main().catch(error => {
    console.error(`\n💥 Error fatal: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    process.exit(1);
  });
}
