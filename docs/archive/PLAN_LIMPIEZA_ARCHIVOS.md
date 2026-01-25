# 🧹 PLAN DE LIMPIEZA Y ORGANIZACIÓN DE ARCHIVOS

## 📋 ANÁLISIS DE PROBLEMAS IDENTIFICADOS

### **Problemas Principales**
1. **Archivos duplicados** con sufijo " 2" en múltiples ubicaciones
2. **Documentación dispersa** en raíz y docs/
3. **Archivos de configuración** duplicados
4. **Estructura inconsistente** de directorios
5. **Archivos obsoletos** sin uso
6. **Nombres inconsistentes** (camelCase vs kebab-case)

### **Archivos Duplicados Identificados**
- `COTIZADOR_MEJORADO_RESUMEN 2.md` vs `COTIZADOR_MEJORADO_RESUMEN.md`
- `DATOS_REALES_IMPLEMENTADO 2.md` vs `DATOS_REALES_IMPLEMENTADO.md`
- `PropertyClient_v1 2.tsx` vs `PropertyClient_v1.tsx`
- `debug 2.js` vs `debug.js`
- `lighthouserc 2.json` vs `lighthouserc.json`
- Múltiples archivos en `docs/` con sufijo " 2"
- Múltiples archivos en `reports/` con sufijo " 2"

---

## 🎯 PLAN DE REORGANIZACIÓN

### **FASE 1: LIMPIEZA DE DUPLICADOS**

#### **1.1 Archivos de Documentación**
```
MOVER A docs/:
├── COTIZADOR_MEJORADO_RESUMEN.md → docs/cotizador/MEJORADO_RESUMEN.md
├── COTIZADOR_SISTEMA_FUNCIONAL.md → docs/cotizador/SISTEMA_FUNCIONAL.md
├── DATOS_REALES_IMPLEMENTADO.md → docs/data/DATOS_REALES.md
├── DEPLOY.md → docs/deploy/DEPLOY.md
├── ERROR_HANDLING_SUMMARY.md → docs/errors/SUMMARY.md
├── LINT_ANALYSIS.md → docs/quality/LINT_ANALYSIS.md
├── METODOLOGIA_TRABAJO.md → docs/methodology/WORK_METHODOLOGY.md
├── METODOLOGIA_IMPLEMENTADA_RESUMEN.md → docs/methodology/IMPLEMENTED_SUMMARY.md
├── PLAN_IMPLEMENTACION_NEXTJS.md → docs/planning/NEXTJS_IMPLEMENTATION.md
├── PRODUCTION_README.md → docs/deploy/PRODUCTION_README.md
├── PULL_REQUEST.md → docs/process/PULL_REQUEST.md
├── QUOTATION_MASTER_CONTROL.md → docs/quotation/MASTER_CONTROL.md
├── README_INGESTA.md → docs/data/INGESTA_README.md
├── README-ICONS.md → docs/components/ICONS_README.md
├── REPORTE_ARQUITECTURA_DATOS_PARA_COTIZACIONES.md → docs/architecture/DATA_ARCHITECTURE.md
├── SPRINT_1_SUMMARY.md → docs/sprints/SPRINT_1_SUMMARY.md
├── SPRINT_2_ROADMAP.md → docs/sprints/SPRINT_2_ROADMAP.md
├── SPRINT_2_STORIES.md → docs/sprints/SPRINT_2_STORIES.md
├── TESTING_FINAL_SUMMARY.md → docs/testing/FINAL_SUMMARY.md
├── TESTING_SETUP_COMPLETED.md → docs/testing/SETUP_COMPLETED.md
├── TESTING_SETUP_SUMMARY.md → docs/testing/SETUP_SUMMARY.md
└── TASKS.md → docs/tasks/TASKS.md
```

#### **1.2 Archivos de Configuración**
```
MOVER A config/:
├── debug.js → config/debug.js
├── lighthouserc.json → config/lighthouse.json
├── lighthouserc-flash-videos.json → config/lighthouse-flash-videos.json
└── lint-report.txt → config/lint-report.txt
```

#### **1.3 Archivos de Componentes**
```
MOVER A components/:
├── PropertyClient_v1.tsx → components/property/PropertyClient.tsx
└── PromotionBadge.tsx → components/ui/PromotionBadge.tsx
```

#### **1.4 Archivos de Schemas**
```
MOVER A schemas/:
├── quotation.ts → schemas/quotation.ts
└── quotation 2.ts → ELIMINAR (duplicado)
```

### **FASE 2: REORGANIZACIÓN DE DIRECTORIOS**

#### **2.1 Estructura de Documentación**
```
docs/
├── architecture/          # Decisiones de arquitectura
├── components/           # Documentación de componentes
├── cotizador/           # Documentación del cotizador
├── data/                # Documentación de datos
├── deploy/              # Documentación de deploy
├── errors/              # Documentación de errores
├── methodology/         # Metodología de trabajo
├── planning/            # Planes de implementación
├── process/             # Procesos de desarrollo
├── quality/             # Documentación de calidad
├── quotation/           # Documentación de cotizaciones
├── sprints/             # Documentación de sprints
├── testing/             # Documentación de testing
└── tasks/               # Gestión de tareas
```

#### **2.2 Estructura de Configuración**
```
config/
├── env.example
├── env.production.example
├── feature-flags.json
├── feature-flags.ts
├── ingesta.config.js
├── use-real-data.sh
├── debug.js
├── lighthouse.json
├── lighthouse-flash-videos.json
└── lint-report.txt
```

#### **2.3 Estructura de Reports**
```
reports/
├── audit/               # Reportes de auditoría
├── data/                # Reportes de datos
├── deploy/              # Reportes de deploy
├── quality/              # Reportes de calidad
├── sprints/               # Reportes de sprints
└── specs/               # Especificaciones
```

### **FASE 3: LIMPIEZA DE ARCHIVOS OBSOLETOS**

#### **3.1 Archivos a Eliminar**
```
ELIMINAR:
├── COTIZADOR_MEJORADO_RESUMEN 2.md
├── COTIZADOR_SISTEMA_FUNCIONAL 2.md
├── DATOS_REALES_IMPLEMENTADO 2.md
├── PropertyClient_v1 2.tsx
├── debug 2.js
├── lighthouserc 2.json
├── quotation 2.ts
├── use-real-data 2.sh
├── ingesta.config 2.js
└── Todos los archivos con sufijo " 2" en docs/ y reports/
```

#### **3.2 Directorios a Limpiar**
```
LIMPIAR:
├── backups/             # Mover a .backups/ o eliminar
├── coverage/            # Mover a .coverage/ o eliminar
├── playwright-report/   # Mover a .playwright-report/ o eliminar
├── test-results/        # Mover a .test-results/ o eliminar
└── static-build/        # Mover a .static-build/ o eliminar
```

### **FASE 4: REORGANIZACIÓN DE COMPONENTES**

#### **4.1 Estructura de Componentes**
```
components/
├── ui/                  # Componentes base
├── forms/               # Formularios
├── layout/              # Layout components
├── marketing/           # Marketing components
├── property/            # Property components
├── calendar/            # Calendar components
├── filters/             # Filter components
├── flow/                # Flow components
├── admin/               # Admin components
├── icons/               # Icon components
├── seo/                 # SEO components
└── social/              # Social components
```

#### **4.2 Archivos Sueltos a Organizar**
```
MOVER:
├── BuildingCard.tsx → components/property/BuildingCard.tsx
├── PromotionBadge.tsx → components/ui/PromotionBadge.tsx
├── SeoJsonLdPerson.tsx → components/seo/SeoJsonLdPerson.tsx
├── StickyMobileCTA.tsx → components/ui/StickyMobileCTA.tsx
└── UnitSelector.tsx → components/property/UnitSelector.tsx
```

---

## 🔧 SCRIPT DE AUTOMATIZACIÓN

### **Script de Limpieza**
```bash
#!/bin/bash
# cleanup-files.sh

echo "🧹 Iniciando limpieza de archivos..."

# Crear directorios necesarios
mkdir -p docs/{architecture,components,cotizador,data,deploy,errors,methodology,planning,process,quality,quotation,sprints,testing,tasks}
mkdir -p config
mkdir -p reports/{audit,data,deploy,quality,sprints,specs}

# Mover archivos de documentación
echo "📁 Moviendo archivos de documentación..."
mv COTIZADOR_MEJORADO_RESUMEN.md docs/cotizador/MEJORADO_RESUMEN.md
mv COTIZADOR_SISTEMA_FUNCIONAL.md docs/cotizador/SISTEMA_FUNCIONAL.md
mv DATOS_REALES_IMPLEMENTADO.md docs/data/DATOS_REALES.md
mv DEPLOY.md docs/deploy/DEPLOY.md
mv ERROR_HANDLING_SUMMARY.md docs/errors/SUMMARY.md
mv LINT_ANALYSIS.md docs/quality/LINT_ANALYSIS.md
mv METODOLOGIA_TRABAJO.md docs/methodology/WORK_METHODOLOGY.md
mv METODOLOGIA_IMPLEMENTADA_RESUMEN.md docs/methodology/IMPLEMENTED_SUMMARY.md
mv PLAN_IMPLEMENTACION_NEXTJS.md docs/planning/NEXTJS_IMPLEMENTATION.md
mv PRODUCTION_README.md docs/deploy/PRODUCTION_README.md
mv PULL_REQUEST.md docs/process/PULL_REQUEST.md
mv QUOTATION_MASTER_CONTROL.md docs/quotation/MASTER_CONTROL.md
mv README_INGESTA.md docs/data/INGESTA_README.md
mv README-ICONS.md docs/components/ICONS_README.md
mv REPORTE_ARQUITECTURA_DATOS_PARA_COTIZACIONES.md docs/architecture/DATA_ARCHITECTURE.md
mv SPRINT_1_SUMMARY.md docs/sprints/SPRINT_1_SUMMARY.md
mv SPRINT_2_ROADMAP.md docs/sprints/SPRINT_2_ROADMAP.md
mv SPRINT_2_STORIES.md docs/sprints/SPRINT_2_STORIES.md
mv TESTING_FINAL_SUMMARY.md docs/testing/FINAL_SUMMARY.md
mv TESTING_SETUP_COMPLETED.md docs/testing/SETUP_COMPLETED.md
mv TESTING_SETUP_SUMMARY.md docs/testing/SETUP_SUMMARY.md
mv TASKS.md docs/tasks/TASKS.md

# Mover archivos de configuración
echo "⚙️ Moviendo archivos de configuración..."
mv debug.js config/debug.js
mv lighthouserc.json config/lighthouse.json
mv lighthouserc-flash-videos.json config/lighthouse-flash-videos.json
mv lint-report.txt config/lint-report.txt

# Mover archivos de componentes
echo "🧩 Moviendo archivos de componentes..."
mv PropertyClient_v1.tsx components/property/PropertyClient.tsx
mv PromotionBadge.tsx components/ui/PromotionBadge.tsx
mv SeoJsonLdPerson.tsx components/seo/SeoJsonLdPerson.tsx
mv StickyMobileCTA.tsx components/ui/StickyMobileCTA.tsx
mv UnitSelector.tsx components/property/UnitSelector.tsx
mv BuildingCard.tsx components/property/BuildingCard.tsx

# Eliminar archivos duplicados
echo "🗑️ Eliminando archivos duplicados..."
rm -f "COTIZADOR_MEJORADO_RESUMEN 2.md"
rm -f "COTIZADOR_SISTEMA_FUNCIONAL 2.md"
rm -f "DATOS_REALES_IMPLEMENTADO 2.md"
rm -f "PropertyClient_v1 2.tsx"
rm -f "debug 2.js"
rm -f "lighthouserc 2.json"
rm -f "quotation 2.ts"
rm -f "use-real-data 2.sh"
rm -f "ingesta.config 2.js"

# Eliminar archivos duplicados en docs/
find docs/ -name "* 2.*" -delete

# Eliminar archivos duplicados en reports/
find reports/ -name "* 2.*" -delete

# Mover directorios temporales
echo "📁 Moviendo directorios temporales..."
mv backups .backups 2>/dev/null || true
mv coverage .coverage 2>/dev/null || true
mv playwright-report .playwright-report 2>/dev/null || true
mv test-results .test-results 2>/dev/null || true
mv static-build .static-build 2>/dev/null || true

echo "✅ Limpieza completada!"
```

---

## 📊 MÉTRICAS DE LIMPIEZA

### **Archivos a Mover**: 25
### **Archivos a Eliminar**: 15+
### **Directorios a Reorganizar**: 8
### **Estructura a Crear**: 12 directorios

---

## 🎯 RESULTADO ESPERADO

### **Estructura Final Limpia**
```
hommie-0-commission-next/
├── app/                  # Next.js app
├── components/           # Componentes organizados
├── config/              # Configuración centralizada
├── docs/                # Documentación organizada
├── lib/                 # Librerías
├── scripts/             # Scripts de automatización
├── tests/               # Tests
├── types/               # Tipos TypeScript
├── hooks/               # React hooks
├── stores/              # Estado global
├── schemas/             # Schemas de validación
├── data/                # Datos estáticos
├── public/              # Assets públicos
├── reports/             # Reportes organizados
├── .backups/            # Backups (oculto)
├── .coverage/           # Coverage (oculto)
├── .playwright-report/  # Playwright reports (oculto)
├── .test-results/       # Test results (oculto)
├── .static-build/       # Static build (oculto)
├── CONTEXT.md           # Contexto del proyecto
├── README.md            # README principal
├── package.json         # Dependencias
├── next.config.mjs      # Configuración Next.js
├── tailwind.config.ts   # Configuración Tailwind
├── tsconfig.json        # Configuración TypeScript
└── .gitignore           # Git ignore
```

---

## 🚀 PRÓXIMOS PASOS

1. **Ejecutar script de limpieza**
2. **Verificar que todo funciona**
3. **Actualizar imports y referencias**
4. **Verificar que no se rompió nada**
5. **Commit de la limpieza**

---

**Este plan garantiza una estructura limpia, organizada y mantenible para el proyecto.**
