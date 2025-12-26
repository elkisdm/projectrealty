#!/usr/bin/env node

/**
 * 🎨 CLI Standalone para Generador de SVGs Glass - Hommie Icon System
 * 
 * Interfaz de línea de comandos independiente para procesar glyphs.json y generar SVGs
 * con efectos glass minimal. Solo ejecuta procesamiento cuando se llama explícitamente.
 */

import { readFileSync, existsSync, writeFileSync, mkdirSync, readdirSync } from 'fs';
import { join, dirname, basename, extname, resolve } from 'path';
import { 
  readGlyphsFile,
  analyzeGlyphs,
  processGlyphs,
  type GlyphsData,
  type GeneratorOptions,
  type Glyph
} from './index';
import { 
  IconSize, 
  StrokeWeight, 
  IconVariant,
  getPreset,
  LIGHT_PRESET,
  DARK_PRESET,
  BRAND_PRESET
} from './tokens';

// ============================================================================
// INTERFACES Y TIPOS
// ============================================================================

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
  npx ts-node scripts/icon-gen/cli-standalone.ts [OPCIONES]

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
  npx ts-node scripts/icon-gen/cli-standalone.ts

  # Con preset oscuro y tamaños específicos
  npx ts-node scripts/icon-gen/cli-standalone.ts --preset dark --sizes md,lg

  # Solo validación
  npx ts-node scripts/icon-gen/cli-standalone.ts --validate

  # Modo verbose con reporte
  npx ts-node scripts/icon-gen/cli-standalone.ts --verbose --report

  # Batch processing
  npx ts-node scripts/icon-gen/cli-standalone.ts --batch --pattern "glyphs-*.json"
`);
}

/**
 * Encuentra archivos que coinciden con un patrón
 */
function findFiles(pattern: string, directory: string = '.'): string[] {
  const files: string[] = [];
  
  try {
    const items = readdirSync(directory);
    
    for (const item of items) {
      const fullPath = join(directory, item);
      const stat = require('fs').statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Recursivamente buscar en subdirectorios
        files.push(...findFiles(pattern, fullPath));
      } else if (stat.isFile()) {
        // Convertir patrón glob a regex
        const regexPattern = pattern
          .replace(/\./g, '\\.')
          .replace(/\*/g, '.*')
          .replace(/\?/g, '.');
        const regex = new RegExp(regexPattern);
        
        if (regex.test(item)) {
          files.push(fullPath);
        }
      }
    }
  } catch (error) {
    console.warn(`⚠️  Error leyendo directorio ${directory}: ${error}`);
  }
  
  return files;
}

/**
 * Genera reporte detallado
 */
function generateReport(
  glyphsData: GlyphsData,
  options: GeneratorOptions,
  stats: CLIResult['stats']
): void {
  const reportPath = join(options.outputDir, 'generation-report.json');
  
  const report = {
    generatedAt: new Date().toISOString(),
    input: {
      file: glyphsData.metadata,
      glyphsCount: glyphsData.glyphs.length,
      config: glyphsData.config
    },
    options,
    stats,
    preset: getPreset(options.preset)
  };
  
  try {
    writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');
    console.log(`📊 Reporte guardado: ${reportPath}`);
  } catch (error) {
    console.warn(`⚠️  Error guardando reporte: ${error}`);
  }
}

// ============================================================================
// PROCESAMIENTO PRINCIPAL
// ============================================================================

/**
 * Procesa un archivo individual
 */
async function processFile(filePath: string, options: GeneratorOptions, validateOnly: boolean = false): Promise<CLIResult> {
  try {
    console.log(`\n🎨 Procesando: ${filePath}`);
    
    // Leer y validar archivo
    const glyphsData = readGlyphsFile(filePath);
    
    // Analizar glyphs
    analyzeGlyphs(glyphsData.glyphs);
    
    // Si solo validación, terminar aquí
    if (validateOnly) {
      return {
        success: true,
        message: `✅ Validación exitosa: ${glyphsData.glyphs.length} glyphs válidos`,
        stats: {
          filesProcessed: 1,
          glyphsProcessed: glyphsData.glyphs.length,
          svgsGenerated: 0,
          totalSize: 0,
          errors: 0
        }
      };
    }
    
    // Procesar glyphs
    processGlyphs(glyphsData.glyphs, options);
    
    // Calcular estadísticas
    const totalSVGs = glyphsData.glyphs.length * options.sizes.length * options.strokes.length * options.variants.length;
    
    return {
      success: true,
      message: `✅ Procesamiento exitoso: ${totalSVGs} SVGs generados`,
      stats: {
        filesProcessed: 1,
        glyphsProcessed: glyphsData.glyphs.length,
        svgsGenerated: totalSVGs,
        totalSize: 0, // Se calcularía leyendo los archivos generados
        errors: 0
      }
    };
    
  } catch (error) {
    return {
      success: false,
      message: `❌ Error procesando ${filePath}: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      errors: [error instanceof Error ? error.message : 'Error desconocido']
    };
  }
}

/**
 * Procesa múltiples archivos en modo batch
 */
async function processBatch(pattern: string, options: GeneratorOptions): Promise<CLIResult> {
  console.log(`\n🔄 Modo batch: buscando archivos con patrón "${pattern}"`);
  
  const files = findFiles(pattern);
  
  if (files.length === 0) {
    return {
      success: false,
      message: `❌ No se encontraron archivos que coincidan con el patrón "${pattern}"`,
      errors: [`Patrón: ${pattern}`]
    };
  }
  
  console.log(`📁 Archivos encontrados: ${files.length}`);
  files.forEach(file => console.log(`   ${file}`));
  
  let totalSuccess = 0;
  let totalErrors = 0;
  let totalGlyphs = 0;
  let totalSVGs = 0;
  const errors: string[] = [];
  
  // Procesar cada archivo
  for (const file of files) {
    const result = await processFile(file, options, false);
    
    if (result.success) {
      totalSuccess++;
      if (result.stats) {
        totalGlyphs += result.stats.glyphsProcessed;
        totalSVGs += result.stats.svgsGenerated;
      }
    } else {
      totalErrors++;
      if (result.errors) {
        errors.push(...result.errors);
      }
    }
  }
  
  return {
    success: totalErrors === 0,
    message: `📊 Batch completado: ${totalSuccess} exitosos, ${totalErrors} errores`,
    stats: {
      filesProcessed: files.length,
      glyphsProcessed: totalGlyphs,
      svgsGenerated: totalSVGs,
      totalSize: 0,
      errors: totalErrors
    },
    errors: errors.length > 0 ? errors : undefined
  };
}

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
    
    let result: CLIResult;
    
    // Procesar según el modo
    if (args.batch && args.pattern) {
      result = await processBatch(args.pattern, options);
    } else {
      const inputFile = args.input || join(process.cwd(), 'data', 'glyphs.json');
      result = await processFile(inputFile, options, args.validate);
    }
    
    // Mostrar resultado
    console.log(`\n${result.message}`);
    
    if (result.stats) {
      console.log(`\n📊 Estadísticas:`);
      console.log(`   Archivos procesados: ${result.stats.filesProcessed}`);
      console.log(`   Glyphs procesados: ${result.stats.glyphsProcessed}`);
      console.log(`   SVGs generados: ${result.stats.svgsGenerated}`);
      console.log(`   Errores: ${result.stats.errors}`);
    }
    
    if (result.errors && result.errors.length > 0) {
      console.log(`\n❌ Errores:`);
      result.errors.forEach(error => console.log(`   ${error}`));
    }
    
    // Generar reporte si se solicita
    if (args.report && result.success && result.stats) {
      const glyphsData = readGlyphsFile(args.input || join(process.cwd(), 'data', 'glyphs.json'));
      generateReport(glyphsData, options, result.stats);
    }
    
    // Salir con código apropiado
    process.exit(result.success ? 0 : 1);
    
  } catch (error) {
    console.error(`\n💥 Error fatal: ${error instanceof Error ? error.message : 'Error desconocido'}`);
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
