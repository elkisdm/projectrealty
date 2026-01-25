# 🚀 METODOLOGÍA DE TRABAJO - [NOMBRE DEL PROYECTO]

## 📋 RESUMEN EJECUTIVO

Esta metodología está diseñada para desarrollar [TIPO DE PROYECTO] con **excelencia técnica**, **performance optimizada** y **[OBJETIVOS ESPECÍFICOS]**. Combina **Context Engineering**, **Microtasking** y **Quality Gates** para garantizar entregas consistentes y de alta calidad.

### **Stack Tecnológico**
- **[TECNOLOGÍA PRINCIPAL]**: [Versión y configuración específica]
- **Build**: [Herramientas de build y compilación]
- **Testing**: [Framework de testing + herramientas de validación]
- **i18n**: [Sistema de internacionalización si aplica]
- **Performance**: [Herramientas de optimización y monitoreo]

### **Objetivos del Proyecto**
- **Performance**: [Métricas específicas de performance]
- **Funcionalidad**: [Objetivos de funcionalidad y features]
- **Calidad**: [Estándares de calidad y accesibilidad]
- **Escalabilidad**: [Objetivos de escalabilidad y mantenimiento]
- **Experiencia**: [Objetivos de UX/UI y developer experience]

### **DoD (Definition of Done)**
- [Criterio 1]: [Descripción específica]
- [Criterio 2]: [Descripción específica]
- [Criterio 3]: [Descripción específica]
- [Criterio 4]: [Descripción específica]
- [Criterio 5]: [Descripción específica]

### **Estado Actual del Proyecto**
- **Tareas completadas**: [X/Y] ([%]%)
- **Roadmap activo**: [Descripción del roadmap actual]
- **Próxima tarea**: [ID y descripción de la próxima tarea]
- **Estado**: [Estado actual: idle/en progreso/bloqueado]

---

## 🎯 CONTEXTO ENGINEERING

### **Sistema de Contexto en Capas**

Nuestra metodología se basa en un **sistema de contexto obligatorio** que debe leerse antes de cualquier trabajo:

#### **1. Contexto Obligatorio (Siempre al iniciar)**
```
📁 Archivos de contexto obligatorio:
├── CONTEXT.md          # Stack, objetivos, estado actual
├── TASKS.md           # Backlog de microtareas y estado
├── docs/PRD.md        # Requisitos del producto
├── docs/ARCHITECTURE.md # Decisiones técnicas
├── docs/DECISIONS.md  # ADR log
├── docs/QA.md         # Checklist de validación
└── .cursor/roadmap-context.md # Contexto específico por objetivo
```

#### **2. Contexto por Objetivo (R01-R10)**
```
📁 Contexto específico por roadmap:
├── R01 - Critical CSS Strategy
├── R02 - Social Proof Engine  
├── R03 - UX Optimization Suite
├── R04 - A/B Testing Framework
├── R05 - Advanced Lazy Loading
├── R06 - Performance Monitoring
├── R07 - Revenue Optimization
├── R08 - AI-Powered Recommendations
├── R09 - Mobile-First Excellence
└── R10 - Enterprise Analytics
```

#### **3. Contexto por Microtarea**
Cada microtarea tiene:
- **Dependencias**: Tareas previas que deben estar "done"
- **Inputs**: Archivos/contexto necesario
- **Outputs**: Entregables específicos
- **Métricas**: Qué medir durante desarrollo
- **DoD**: Criterios de aceptación

### **Context Auto-Updater**
- **Antes de cualquier cambio**: Carga CONTEXT.md y TASKS.md
- **Si no hay tarea activa**: NO avances
- **Tras completar tarea**: Actualiza TASKS.md → commit → context:update automático

---

## 🔄 MICROTASKING SYSTEM

### **Principios Fundamentales**
- **1 chat = 1 microtarea** - No avanzar si no está "Done"
- **Cambios mínimos por commit** - Conventional Commits obligatorio
- **Sin dependencias innecesarias** - Liquid con lógica mínima
- **Strings SIEMPRE en `locales/`** - i18n obligatorio
- **Accesibilidad y performance por defecto**

### **Estados de Microtareas**
```
pendiente → en progreso → bloqueada → done
```

### **Formato de Entrega por Microtarea**
1. **Lista de archivos** a crear/modificar
2. **Código COMPLETO** de cada archivo (sin "...")
3. **Pasos de QA manual** (qué y cómo probar)
4. **Mensaje de commit** (Conventional)

### **DoD por Microtarea**
- `npm run build` y `npm run check` pasan
- Si hay UI: foco/aria/teclado OK
- Sin hardcode de textos (usar `t`)
- Mantener compatibilidad OS 2.0 (secciones/templates JSON)

---

## 🏗️ ARQUITECTURA DEL PROYECTO

### **Estructura de Directorios**
```
📁 Proyecto Root:
├── 📁 [DIRECTORIO_PRINCIPAL]/    # [Descripción del directorio principal]
│   ├── 📁 [SUBDIRECTORIO_1]/   # [Descripción específica]
│   ├── 📁 [SUBDIRECTORIO_2]/   # [Descripción específica]
│   └── 📁 [SUBDIRECTORIO_3]/   # [Descripción específica]
├── 📁 src/                      # Código fuente
│   ├── 📁 [ESTRUCTURA_1]/      # [Descripción de la estructura]
│   └── 📁 [ESTRUCTURA_2]/      # [Descripción de la estructura]
├── 📁 docs/                     # Documentación completa
├── 📁 tests/                    # Testing suite
│   ├── 📁 [TIPO_TEST_1]/       # [Descripción del tipo de test]
│   ├── 📁 [TIPO_TEST_2]/       # [Descripción del tipo de test]
│   └── 📁 fixtures/            # Test utilities
├── 📁 scripts/                  # Scripts de automatización
├── 📁 .cursor/                  # Configuración Cursor
└── 📁 .github/workflows/       # CI/CD
```

### **Componentes/Funcionalidades Implementadas**
- **[COMPONENTE_1]**: [Descripción de la funcionalidad]
- **[COMPONENTE_2]**: [Descripción de la funcionalidad]
- **[COMPONENTE_3]**: [Descripción de la funcionalidad]
- **[COMPONENTE_4]**: [Descripción de la funcionalidad]
- **[COMPONENTE_5]**: [Descripción de la funcionalidad]
- **[COMPONENTE_6]**: [Descripción de la funcionalidad]

### **Componentes Base**
- **[COMPONENTE_BASE_1]**: [Descripción y características]
- **[COMPONENTE_BASE_2]**: [Descripción y características]
- **[COMPONENTE_BASE_3]**: [Descripción y características]
- **[COMPONENTE_BASE_4]**: [Descripción y características]
- **[COMPONENTE_BASE_5]**: [Descripción y características]
- **[COMPONENTE_BASE_6]**: [Descripción y características]

---

## 🧪 TESTING & QUALITY GATES

### **Scripts de Validación**
```bash
# Build y validación básica
npm run build          # [Descripción del comando build]
npm run check          # [Descripción del comando check]
npm run release:gate  # [Descripción del gate completo]

# Testing suite
npm run test:[TIPO_1]  # [Descripción del tipo de test]
npm run test:[TIPO_2]  # [Descripción del tipo de test]
npm run test:[TIPO_3]  # [Descripción del tipo de test]
npm run test:[TIPO_4]  # [Descripción del tipo de test]

# Performance y optimización
npm run [COMANDO_PERF_1]    # [Descripción del comando de performance]
npm run [COMANDO_PERF_2]    # [Descripción del comando de performance]
npm run [COMANDO_PERF_3]    # [Descripción del comando de performance]
```

### **Quality Gates por Fase**
```
FASE 1 (Foundation):
├── [OBJETIVO_1]: [Descripción] → [Métrica específica]
├── [OBJETIVO_2]: [Descripción] → [Métrica específica]
└── [OBJETIVO_3]: [Descripción] → [Métrica específica]

FASE 2 (Development):
├── [OBJETIVO_4]: [Descripción] → [Métrica específica]
├── [OBJETIVO_5]: [Descripción] → [Métrica específica]
├── [OBJETIVO_6]: [Descripción] → [Métrica específica]
└── [OBJETIVO_7]: [Descripción] → [Métrica específica]

FASE 3 (Production):
├── [OBJETIVO_8]: [Descripción] → [Métrica específica]
├── [OBJETIVO_9]: [Descripción] → [Métrica específica]
└── [OBJETIVO_10]: [Descripción] → [Métrica específica]
```

### **Métricas de Éxito**
- **Performance**: [Métricas específicas de performance]
- **Funcionalidad**: [Métricas específicas de funcionalidad]
- **Calidad**: [Métricas específicas de calidad]
- **Technical**: [Métricas técnicas específicas]

---

## 🚀 ROADMAP FUSIONADO

### **[OBJETIVO_1] - [NOMBRE_OBJETIVO]** ⚡
**Meta**: [Descripción de la meta específica]
**Estado**: [Estado actual del objetivo]
**Funcionalidad**: [Descripción de la funcionalidad específica]

### **[OBJETIVO_2] - [NOMBRE_OBJETIVO]** 🎯
**Meta**: [Descripción de la meta específica]
**Funcionalidades**: [Lista de funcionalidades específicas]
- [FUNCIONALIDAD_1]
- [FUNCIONALIDAD_2]
- [FUNCIONALIDAD_3]
- [FUNCIONALIDAD_4]
- [FUNCIONALIDAD_5]

### **[OBJETIVO_3] - [NOMBRE_OBJETIVO]** 📱
**Meta**: [Descripción de la meta específica]
**Funcionalidad**: [Descripción de la funcionalidad específica]

### **[OBJETIVO_4] - [NOMBRE_OBJETIVO]** 🧪
**Meta**: [Descripción de la meta específica]
**Funcionalidad**: [Descripción de la funcionalidad específica]

### **[OBJETIVO_5-10] - Advanced Features**
- [FEATURE_1]
- [FEATURE_2]
- [FEATURE_3]
- [FEATURE_4]
- [FEATURE_5]
- [FEATURE_6]

---

## 🔧 FLUJO DE TRABAJO

### **1. Al Iniciar Chat**
```
✅ Lee archivos de contexto obligatorio
✅ Confirma tarea activa en TASKS.md
✅ Valida dependencias completadas
✅ Establece métricas objetivo
```

### **2. Durante Desarrollo**
```
✅ Usa docs/QA.md para validaciones
✅ Mantén A11y AA por defecto
✅ Sin hardcode de textos (usar locales/)
✅ Performance optimizada
```

### **3. Al Finalizar**
```
✅ Actualiza estado en TASKS.md
✅ Documenta decisiones en docs/DECISIONS.md
✅ Valida DoD completo
✅ Prepara contexto para siguiente tarea
```

### **4. Scripts de Automatización**
```bash
# Context management
npm run context:update    # [Descripción del comando]
npm run context:check    # [Descripción del comando]

# Release management
npm run release:gate     # [Descripción del comando]
npm run release:sync    # [Descripción del comando]

# Performance
npm run [COMANDO_PERF_1]    # [Descripción del comando]
npm run [COMANDO_PERF_2]    # [Descripción del comando]
```

---

## 📚 DOCUMENTACIÓN COMPLETA

### **Documentación Técnica**
- `docs/ARCHITECTURE.md` - [Descripción de la documentación]
- `docs/DECISIONS.md` - [Descripción de la documentación]
- `docs/PRD.md` - [Descripción de la documentación]
- `docs/QA.md` - [Descripción de la documentación]

### **Documentación de [CATEGORIA_1]**
- `docs/[ARCHIVO_1].md` - [Descripción de la documentación]
- `docs/[ARCHIVO_2].md` - [Descripción de la documentación]
- `[ARCHIVO_CONFIG_1]` - [Descripción de la configuración]
- `[ARCHIVO_CONFIG_2]` - [Descripción de la configuración]

### **Documentación de [CATEGORIA_2]**
- `docs/[ARCHIVO_3].md` - [Descripción de la documentación]
- `tests/[DIRECTORIO]/` - [Descripción de los tests]

### **Documentación de [CATEGORIA_3]**
- `docs/[ARCHIVO_4].md` - [Descripción de la documentación]
- `[DIRECTORIO]/` - [Descripción del directorio]
- `scripts/[SCRIPT].mjs` - [Descripción del script]

### **Documentación de Testing**
- `docs/[ARCHIVO_5].md` - [Descripción de la documentación]
- `tests/` - [Descripción de la suite de tests]
- `[ARCHIVO_CONFIG_3]` - [Descripción de la configuración]

---

## 🚫 REGLAS DE NO HACER

### **Prohibido**
- ❌ [REGLA_PROHIBIDA_1]
- ❌ [REGLA_PROHIBIDA_2]
- ❌ [REGLA_PROHIBIDA_3]
- ❌ [REGLA_PROHIBIDA_4]
- ❌ [REGLA_PROHIBIDA_5]
- ❌ [REGLA_PROHIBIDA_6]

### **Obligatorio**
- ✅ [REGLA_OBLIGATORIA_1]
- ✅ [REGLA_OBLIGATORIA_2]
- ✅ [REGLA_OBLIGATORIA_3]
- ✅ [REGLA_OBLIGATORIA_4]
- ✅ [REGLA_OBLIGATORIA_5]
- ✅ [REGLA_OBLIGATORIA_6]

---

## 🎯 ADAPTACIÓN A OTROS PROYECTOS

### **Checklist de Adaptación**
1. **Identificar stack tecnológico** del proyecto objetivo
2. **Mapear funcionalidades existentes** vs roadmap
3. **Adaptar scripts de validación** al stack específico
4. **Configurar contexto obligatorio** para el proyecto
5. **Establecer métricas de éxito** específicas
6. **Implementar quality gates** apropiados

### **Archivos Clave para Replicar**
```
📁 Archivos de metodología:
├── CONTEXT.md              # Contexto del proyecto
├── TASKS.md               # Backlog de microtareas
├── docs/PRD.md            # Requisitos del producto
├── docs/ARCHITECTURE.md   # Decisiones técnicas
├── docs/DECISIONS.md      # ADR log
├── docs/QA.md             # Checklist de validación
├── .cursor/boot.md        # Boot de contexto
├── .cursor/rules-*.md     # Reglas específicas
└── scripts/               # Scripts de automatización
```

### **Scripts de Automatización Replicables**
- `context-updater.mjs` - [Descripción del script]
- `[SCRIPT_1].sh` - [Descripción del script]
- `[SCRIPT_2].sh` - [Descripción del script]
- `[SCRIPT_3].sh` - [Descripción del script]
- `[SCRIPT_4].mjs` - [Descripción del script]
- `[SCRIPT_5].mjs` - [Descripción del script]

---

## 📊 MÉTRICAS DE ÉXITO GLOBALES

### **Performance Targets**
- ✅ **[METRICA_PERF_1]**: [Métrica específica]
- ✅ **[METRICA_PERF_2]**: [Métrica específica]
- ✅ **[METRICA_PERF_3]**: [Métrica específica]
- ✅ **[METRICA_PERF_4]**: [Métrica específica]
- ✅ **[METRICA_PERF_5]**: [Métrica específica]

### **Technical Excellence**
- ✅ **[METRICA_TECNICA_1]**: [Métrica específica]
- ✅ **[METRICA_TECNICA_2]**: [Métrica específica]
- ✅ **[METRICA_TECNICA_3]**: [Métrica específica]
- ✅ **[METRICA_TECNICA_4]**: [Métrica específica]
- ✅ **[METRICA_TECNICA_5]**: [Métrica específica]

### **Funcionalidades Específicas Operativas**
- ✅ **[FUNCIONALIDAD_1]**: [Métrica específica]
- ✅ **[FUNCIONALIDAD_2]**: [Métrica específica]
- ✅ **[FUNCIONALIDAD_3]**: [Métrica específica]
- ✅ **[FUNCIONALIDAD_4]**: [Métrica específica]
- ✅ **[FUNCIONALIDAD_5]**: [Métrica específica]

---

## 🔄 MANTENIMIENTO Y EVOLUCIÓN

### **Actualización de Contexto**
- **Automática**: [Descripción del proceso automático]
- **Manual**: [Descripción del proceso manual]
- **Validación**: [Descripción del proceso de validación]

### **Evolución de Metodología**
- **ADR Log**: [Descripción del proceso]
- **Retrospectivas**: [Descripción del proceso]
- **Mejoras**: [Descripción del proceso]

### **Escalabilidad**
- **Nuevos objetivos**: [Descripción del proceso]
- **Nuevas funcionalidades**: [Descripción del proceso]
- **Nuevos proyectos**: [Descripción del proceso]

---

## 🎯 PRÓXIMOS PASOS

### **Inmediato**
1. **[TAREA_INMEDIATA_1]** ([Descripción específica])
2. **[TAREA_INMEDIATA_2]** ([Descripción específica])
3. **[TAREA_INMEDIATA_3]** ([Descripción específica])

### **Mediano Plazo**
1. **[TAREA_MEDIANO_1]** ([Descripción específica])
2. **[TAREA_MEDIANO_2]** ([Descripción específica])
3. **[TAREA_MEDIANO_3]** ([Descripción específica])

### **Largo Plazo**
1. **[TAREA_LARGO_1]** ([Descripción específica])
2. **[TAREA_LARGO_2]** ([Descripción específica])
3. **[TAREA_LARGO_3]** ([Descripción específica])

---

**Esta metodología combina rigor técnico con resultados medibles, garantizando entregas consistentes y de alta calidad que impactan directamente en [OBJETIVOS_ESPECÍFICOS_DEL_PROYECTO].**
