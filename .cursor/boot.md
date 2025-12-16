# 🚀 BOOT DE CONTEXTO - HOMMIE 0% COMISIÓN

## 📋 CONTEXTO OBLIGATORIO

**ANTES DE CUALQUIER TRABAJO, LEER SIEMPRE:**

### **1. Archivos de Contexto Obligatorio**
```
📁 Archivos de contexto obligatorio:
├── CONTEXT.md          # Stack, objetivos, estado actual
├── TASKS.md           # Backlog de microtareas y estado
├── docs/PRD.md        # Requisitos del producto
├── docs/ARQUITECTURA.md # Decisiones técnicas
├── docs/DECISIONES.md  # ADR log
└── .cursor/rules/     # Reglas específicas por dominio
```

### **2. Stack Tecnológico**
- **Frontend**: Next.js 14 (App Router), React 18, TypeScript estricto
- **Styling**: Tailwind CSS, Framer Motion (11.0.0)
- **Backend**: Next.js API Routes, Supabase
- **Testing**: Jest, Playwright, Testing Library
- **Build**: Next.js build system, pnpm package manager

### **3. Objetivos del Proyecto**
- **Performance**: LCP ≤ 2.5s, A11y AA, SEO score >90
- **Funcionalidad**: Landing con filtros, Property detail con booking, WhatsApp integration
- **Calidad**: TypeScript estricto, testing completo, accesibilidad AA
- **Escalabilidad**: Supabase backend, feature flags, A/B testing

### **4. DoD (Definition of Done)**
- ✅ Build exitoso (`pnpm run build`)
- ✅ Tests pasando (`pnpm run test:all`)
- ✅ TypeScript estricto sin errores
- ✅ A11y AA compliance
- ✅ Performance targets cumplidos
- ✅ Conventional Commits
- ✅ Sin hardcode de textos (i18n ready)

---

## 🎯 CONTEXTO POR OBJETIVO (R01-R10)

### **R01 - Critical CSS Strategy** ⚡
**Meta**: Optimizar CSS crítico para LCP ≤ 2.5s  
**Estado**: Pendiente  
**Funcionalidad**: CSS crítico inline, lazy loading de estilos no críticos

### **R02 - Social Proof Engine** 🎯
**Meta**: Sistema de testimonios y social proof dinámico  
**Funcionalidades**: Testimonials dinámicos, ratings, social proof contextual, trust badges

### **R03 - UX Optimization Suite** 📱
**Meta**: Optimización completa de UX/UI  
**Funcionalidad**: Dark theme, animaciones suaves, responsive perfecto

### **R04 - A/B Testing Framework** 🧪
**Meta**: Framework completo de A/B testing  
**Funcionalidad**: Feature flags, experimentos, métricas automáticas

### **R05 - Advanced Lazy Loading** 🚀
**Meta**: Lazy loading inteligente de imágenes y componentes  
**Funcionalidad**: Intersection Observer, progressive loading, skeleton states

### **R06 - Performance Monitoring** 📊
**Meta**: Monitoreo completo de performance  
**Funcionalidad**: Web Vitals, Core Web Vitals, performance budgets

### **R07 - Revenue Optimization** 💰
**Meta**: Optimización de conversión y revenue  
**Funcionalidad**: Analytics avanzado, funnel optimization, CRO

### **R08 - AI-Powered Recommendations** 🤖
**Meta**: Recomendaciones inteligentes de propiedades  
**Funcionalidad**: ML recommendations, personalización, smart matching

### **R09 - Mobile-First Excellence** 📱
**Meta**: Excelencia en experiencia móvil  
**Funcionalidad**: PWA, offline support, mobile optimizations

### **R10 - Enterprise Analytics** 📈
**Meta**: Analytics empresarial completo  
**Funcionalidad**: Dashboards, reporting, business intelligence

---

## 🔄 MICROTASKING SYSTEM

### **Principios Fundamentales**
- **1 chat = 1 microtarea** - No avanzar si no está "Done"
- **Cambios mínimos por commit** - Conventional Commits obligatorio
- **Sin dependencias innecesarias** - Lógica mínima
- **Strings SIEMPRE en `locales/`** - i18n obligatorio
- **Accesibilidad y performance por defecto**

### **Estados de Microtareas**
```
pendiente → en_progress → bloqueada → done
```

### **Formato de Entrega por Microtarea**
1. **Lista de archivos** a crear/modificar
2. **Código COMPLETO** de cada archivo (sin "...")
3. **Pasos de QA manual** (qué y cómo probar)
4. **Mensaje de commit** (Conventional)

---

## 🚫 REGLAS TÉCNICAS

### **Prohibido**
- ❌ Usar `any` en TypeScript
- ❌ Hardcode de textos (usar i18n)
- ❌ Romper SSR/A11y
- ❌ Ignorar `prefers-reduced-motion`
- ❌ Modificar schemas/ fuera del alcance
- ❌ Commits sin Conventional Commits

### **Obligatorio**
- ✅ TypeScript estricto
- ✅ RSC por defecto
- ✅ "use client" solo si necesario
- ✅ A11y AA por defecto
- ✅ Performance optimizada
- ✅ Conventional Commits

---

## 🔧 SCRIPTS ESENCIALES

### **Development**
```bash
pnpm run dev              # Desarrollo local
pnpm run build           # Build de producción
pnpm run start           # Servidor de producción
```

### **Testing**
```bash
pnpm run test:all        # Suite completa de tests
pnpm run test:unit       # Tests unitarios
pnpm run test:integration # Tests de integración
pnpm run test:e2e        # Tests end-to-end
```

### **Quality**
```bash
pnpm run lint            # Linting
pnpm run typecheck       # TypeScript check
pnpm run smoke           # Smoke tests
```

### **Data**
```bash
pnpm run ingest          # Ingesta estándar
pnpm run ingest:master   # Ingesta detallada
pnpm run migrate:mock    # Migración mock → Supabase
```

---

## 📊 ESTADO ACTUAL

### **Tareas Completadas**: 15/20 (75%)
### **Tareas En Progreso**: 2/20 (10%)
### **Tareas Pendientes**: 3/20 (15%)

### **Branch Activo**: `feature/tests-stability-green`
### **Última Actualización**: 2025-01-27

---

## 🎯 PRÓXIMOS PASOS

### **Inmediato (Esta sesión)**
1. Completar Context Engineering System
2. Implementar Microtasking System
3. Configurar Quality Gates

### **Siguiente Sesión**
1. Automated Workflow
2. R01 - Critical CSS Strategy
3. R02 - Social Proof Engine

---

**Este boot debe leerse ANTES de cualquier trabajo para mantener contexto y consistencia.**
