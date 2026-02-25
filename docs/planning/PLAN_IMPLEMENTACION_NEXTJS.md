# 🚀 PLAN DE IMPLEMENTACIÓN - Metodología de Trabajo para Next.js

## 📋 RESUMEN EJECUTIVO

Este documento presenta un **plan de implementación completo** de nuestra metodología de trabajo adaptada para proyectos **Next.js con Node.js, Tailwind CSS, Zustand y tecnologías modernas**. La metodología se basa en **Context Engineering**, **Microtasking** y **Quality Gates** para garantizar entregas consistentes y de alta calidad.

### **Stack Tecnológico Objetivo**
- **Frontend**: Next.js 14+ (App Router), React 18+, TypeScript
- **Styling**: Tailwind CSS, CSS Modules, PostCSS
- **State Management**: Zustand, React Query/TanStack Query
- **Backend**: Node.js, Express/Fastify, Prisma/TypeORM
- **Database**: PostgreSQL/MongoDB, Redis (caching)
- **Testing**: Jest, React Testing Library, Playwright E2E
- **Performance**: Lighthouse CI, Web Vitals, Bundle Analyzer
- **Deployment**: Vercel/Railway/Docker, CI/CD con GitHub Actions

### **Objetivos del Proyecto**
- **Performance**: LCP <2.5s, Lighthouse >95, Core Web Vitals optimizados
- **Developer Experience**: Hot reload, TypeScript strict, ESLint/Prettier
- **Scalability**: Componentes reutilizables, arquitectura escalable
- **Quality**: 0 errores TypeScript, 100% test coverage, A11y AA
- **Maintainability**: Código limpio, documentación completa, CI/CD

---

## 🎯 ANÁLISIS DEL PROYECTO ACTUAL

### **Estado Actual Identificado**
```
📊 Proyecto Next.js - Estado Actual:
├── 🟡 Stack: Next.js + Node.js + Tailwind + Zustand
├── 🟡 Arquitectura: Por definir según análisis específico
├── 🟡 Testing: Configuración básica (asumido)
├── 🟡 Performance: Sin optimizaciones específicas
├── 🟡 CI/CD: Configuración básica (asumido)
└── 🟡 Documentación: Mínima (asumido)
```

### **Gaps Identificados**
- ❌ **Context Engineering**: Sin sistema de contexto estructurado
- ❌ **Microtasking**: Sin backlog organizado de tareas
- ❌ **Quality Gates**: Sin validaciones automatizadas
- ❌ **Performance Monitoring**: Sin métricas de performance
- ❌ **Testing Strategy**: Sin estrategia de testing estructurada
- ❌ **Documentation**: Sin documentación técnica completa

---

## 🏗️ ARQUITECTURA PROPUESTA

### **Estructura de Directorios Adaptada**
```
📁 Proyecto Next.js:
├── 📁 src/                          # Código fuente
│   ├── 📁 app/                      # App Router (Next.js 13+)
│   │   ├── 📁 (routes)/             # Route groups
│   │   ├── 📁 api/                  # API routes
│   │   ├── 📁 globals.css           # Global styles
│   │   └── 📁 layout.tsx            # Root layout
│   ├── 📁 components/               # Componentes reutilizables
│   │   ├── 📁 ui/                   # UI primitives
│   │   ├── 📁 forms/                # Form components
│   │   ├── 📁 layout/               # Layout components
│   │   └── 📁 features/             # Feature components
│   ├── 📁 lib/                      # Utilities y configs
│   │   ├── 📁 utils/                # Utility functions
│   │   ├── 📁 hooks/                # Custom hooks
│   │   ├── 📁 stores/               # Zustand stores
│   │   └── 📁 types/                # TypeScript types
│   ├── 📁 styles/                   # Estilos globales
│   └── 📁 middleware.ts             # Next.js middleware
├── 📁 public/                       # Assets estáticos
├── 📁 docs/                         # Documentación
│   ├── 📁 architecture/             # Decisiones técnicas
│   ├── 📁 api/                      # API documentation
│   └── 📁 components/               # Component documentation
├── 📁 tests/                        # Testing suite
│   ├── 📁 __tests__/                # Jest tests
│   ├── 📁 e2e/                      # Playwright E2E
│   ├── 📁 fixtures/                 # Test fixtures
│   └── 📁 utils/                    # Test utilities
├── 📁 scripts/                      # Scripts de automatización
├── 📁 .cursor/                      # Configuración Cursor
├── 📁 .github/workflows/            # CI/CD
└── 📁 config/                       # Configuraciones
```

### **Componentes Base Propuestos**
```
📁 Componentes UI (src/components/ui/):
├── Button.tsx                       # Botones con variantes
├── Input.tsx                        # Inputs accesibles
├── Modal.tsx                        # Modales con focus trap
├── Card.tsx                         # Cards reutilizables
├── Badge.tsx                        # Badges dinámicos
├── Loading.tsx                      # Estados de carga
├── ErrorBoundary.tsx                # Error boundaries
└── index.ts                         # Barrel exports
```

### **Stores Zustand Propuestos**
```
📁 State Management (src/lib/stores/):
├── useAuthStore.ts                  # Autenticación
├── useUserStore.ts                  # Datos de usuario
├── useAppStore.ts                   # Estado global
├── useThemeStore.ts                 # Tema (dark/light)
├── useNotificationStore.ts          # Notificaciones
└── index.ts                         # Store exports
```

---

## 🔄 CONTEXT ENGINEERING ADAPTADO

### **Sistema de Contexto para Next.js**

#### **1. Archivos de Contexto Obligatorio**
```
📁 Contexto obligatorio:
├── CONTEXT.md                       # Stack, objetivos, estado actual
├── TASKS.md                         # Backlog de microtareas
├── docs/PRD.md                      # Product Requirements Document
├── docs/ARCHITECTURE.md             # Decisiones técnicas
├── docs/DECISIONS.md                # ADR log
├── docs/QA.md                       # Testing checklist
├── docs/API.md                      # API documentation
└── docs/PERFORMANCE.md              # Performance guidelines
```

#### **2. Contexto por Feature**
```
📁 Contexto por feature:
├── docs/features/auth.md            # Autenticación
├── docs/features/dashboard.md       # Dashboard
├── docs/features/api.md             # API endpoints
├── docs/features/components.md      # Component library
└── docs/features/testing.md         # Testing strategy
```

#### **3. Context Auto-Updater para Next.js**
```javascript
// scripts/context-updater.mjs
import fs from 'fs';
import path from 'path';

const updateContext = () => {
  // Analizar package.json para dependencias
  // Analizar estructura de componentes
  // Actualizar métricas de performance
  // Generar reporte de testing
  // Actualizar documentación automáticamente
};
```

---

## 🧪 MICROTASKING SYSTEM ADAPTADO

### **Estados de Microtareas**
```
pendiente → en progreso → bloqueada → done
```

### **Tipos de Microtareas para Next.js**
```
📁 Tipos de microtareas:
├── 🎨 UI/UX Tasks
│   ├── Component development
│   ├── Styling implementation
│   ├── Responsive design
│   └── Accessibility improvements
├── 🔧 Backend Tasks
│   ├── API endpoint development
│   ├── Database schema changes
│   ├── Authentication implementation
│   └── Performance optimization
├── 🧪 Testing Tasks
│   ├── Unit test implementation
│   ├── Integration test setup
│   ├── E2E test scenarios
│   └── Performance testing
├── 📚 Documentation Tasks
│   ├── API documentation
│   ├── Component documentation
│   ├── Architecture decisions
│   └── Deployment guides
└── 🚀 DevOps Tasks
    ├── CI/CD setup
    ├── Deployment configuration
    ├── Monitoring setup
    └── Security implementation
```

### **Formato de Entrega Adaptado**
1. **Lista de archivos** a crear/modificar
2. **Código COMPLETO** de cada archivo (sin "...")
3. **Tests asociados** (unit, integration, e2e)
4. **Pasos de QA manual** (qué y cómo probar)
5. **Mensaje de commit** (Conventional)

---

## 🛠️ QUALITY GATES ADAPTADOS

### **Scripts de Validación para Next.js**
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:ui": "playwright test --ui",
    "analyze": "cross-env ANALYZE=true next build",
    "lighthouse": "lhci autorun",
    "perf": "next build && next start & sleep 5 && lighthouse http://localhost:3000 --output=html --output-path=./lighthouse-report.html",
    "release:gate": "npm run type-check && npm run lint && npm run test && npm run build",
    "context:update": "node scripts/context-updater.mjs",
    "context:check": "node scripts/context-updater.mjs --check"
  }
}
```

### **Quality Gates por Fase**
```
FASE 1 (Foundation):
├── TypeScript strict mode
├── ESLint + Prettier configurado
├── Jest + RTL setup
├── Playwright E2E configurado
└── Basic CI/CD pipeline

FASE 2 (Development):
├── Component library estable
├── State management implementado
├── API endpoints funcionales
├── Authentication flow
└── Performance optimizations

FASE 3 (Production):
├── Monitoring y alertas
├── Security hardening
├── Performance monitoring
├── Error tracking
└── Analytics implementation
```

---

## 📊 TESTING STRATEGY

### **Testing Pyramid para Next.js**
```
📊 Testing Strategy:
├── 🧪 Unit Tests (70%)
│   ├── Component testing (RTL)
│   ├── Hook testing
│   ├── Utility function testing
│   └── Store testing (Zustand)
├── 🔗 Integration Tests (20%)
│   ├── API route testing
│   ├── Database integration
│   ├── Authentication flow
│   └── Component integration
└── 🎭 E2E Tests (10%)
    ├── Critical user journeys
    ├── Cross-browser testing
    ├── Performance testing
    └── Accessibility testing
```

### **Configuración de Testing**
```typescript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testMatch: ['**/__tests__/**/*.test.{js,jsx,ts,tsx}'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

---

## 🚀 PERFORMANCE OPTIMIZATION

### **Next.js Performance Strategy**
```
📊 Performance Targets:
├── 🎯 Core Web Vitals
│   ├── LCP: <2.5s
│   ├── FID: <100ms
│   ├── CLS: <0.1
│   └── FCP: <1.8s
├── 📦 Bundle Optimization
│   ├── Code splitting
│   ├── Dynamic imports
│   ├── Tree shaking
│   └── Bundle analysis
├── 🖼️ Image Optimization
│   ├── Next.js Image component
│   ├── WebP/AVIF formats
│   ├── Lazy loading
│   └── Responsive images
└── 🚀 Runtime Optimization
    ├── Server-side rendering
    ├── Static generation
    ├── Incremental static regeneration
    └── Edge functions
```

### **Performance Monitoring**
```typescript
// lib/analytics.ts
export const trackWebVitals = (metric: any) => {
  // Send to analytics service
  if (metric.label === 'web-vital') {
    gtag('event', metric.name, {
      value: Math.round(metric.value),
      event_category: 'Web Vitals',
      event_label: metric.id
    });
  }
};
```

---

## 🔧 CI/CD PIPELINE

### **GitHub Actions Workflow**
```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run type-check
      - run: npm run lint
      - run: npm run test:coverage
      - run: npm run test:e2e
      
  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run build
      - run: npm run lighthouse
      
  deploy:
    needs: [test, build]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to Vercel
        # Deployment steps
```

---

## 📚 DOCUMENTACIÓN COMPLETA

### **Documentación Técnica**
```
📁 Documentación:
├── 📄 README.md                     # Project overview
├── 📄 CONTEXT.md                    # Current state
├── 📄 TASKS.md                      # Task backlog
├── 📁 docs/
│   ├── 📄 PRD.md                    # Product requirements
│   ├── 📄 ARCHITECTURE.md           # Technical decisions
│   ├── 📄 API.md                    # API documentation
│   ├── 📄 COMPONENTS.md             # Component library
│   ├── 📄 TESTING.md                # Testing strategy
│   ├── 📄 DEPLOYMENT.md             # Deployment guide
│   └── 📄 PERFORMANCE.md            # Performance guidelines
└── 📁 docs/features/               # Feature documentation
```

### **Component Documentation**
```typescript
// components/ui/Button.tsx
/**
 * Button component with multiple variants and sizes
 * 
 * @example
 * <Button variant="primary" size="lg">
 *   Click me
 * </Button>
 */
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  children: React.ReactNode;
}
```

---

## 🎯 ROADMAP DE IMPLEMENTACIÓN

### **FASE 1: Foundation (Semanas 1-2)**
```
📋 Tareas de Foundation:
├── T01 — Setup inicial del proyecto
│   ├── Next.js 14+ con App Router
│   ├── TypeScript strict mode
│   ├── Tailwind CSS configurado
│   └── ESLint + Prettier setup
├── T02 — Context Engineering setup
│   ├── CONTEXT.md creado
│   ├── TASKS.md con backlog inicial
│   ├── docs/ estructura creada
│   └── Scripts de automatización
├── T03 — Testing infrastructure
│   ├── Jest + RTL configurado
│   ├── Playwright E2E setup
│   ├── Coverage thresholds
│   └── CI/CD básico
└── T04 — Component library base
    ├── UI primitives creados
    ├── Storybook setup (opcional)
    ├── Design system base
    └── Accessibility foundation
```

### **FASE 2: Development (Semanas 3-6)**
```
📋 Tareas de Development:
├── T05 — State management (Zustand)
│   ├── Auth store implementado
│   ├── App store global
│   ├── Theme store (dark/light)
│   └── Notification store
├── T06 — API layer
│   ├── API routes implementadas
│   ├── Database integration
│   ├── Authentication flow
│   └── Error handling
├── T07 — Core features
│   ├── Dashboard implementation
│   ├── User management
│   ├── Data visualization
│   └── Form handling
└── T08 — Performance optimization
    ├── Code splitting
    ├── Image optimization
    ├── Bundle analysis
    └── Web Vitals monitoring
```

### **FASE 3: Production (Semanas 7-8)**
```
📋 Tareas de Production:
├── T09 — Security hardening
│   ├── Authentication security
│   ├── API security
│   ├── Input validation
│   └── Rate limiting
├── T10 — Monitoring & Analytics
│   ├── Error tracking (Sentry)
│   ├── Performance monitoring
│   ├── User analytics
│   └── Uptime monitoring
├── T11 — Deployment & DevOps
│   ├── Production deployment
│   ├── Environment management
│   ├── Backup strategies
│   └── Rollback procedures
└── T12 — Documentation & Training
    ├── API documentation
    ├── User guides
    ├── Developer onboarding
    └── Maintenance procedures
```

---

## 🔄 FLUJO DE TRABAJO ADAPTADO

### **1. Al Iniciar Chat**
```
✅ Lee archivos de contexto obligatorio
✅ Confirma tarea activa en TASKS.md
✅ Valida dependencias completadas
✅ Establece métricas objetivo
✅ Verifica stack tecnológico
```

### **2. Durante Desarrollo**
```
✅ Usa TypeScript strict mode
✅ Sigue convenciones de código
✅ Implementa tests asociados
✅ Mantén performance optimizada
✅ Documenta decisiones técnicas
```

### **3. Al Finalizar**
```
✅ Actualiza estado en TASKS.md
✅ Documenta decisiones en docs/DECISIONS.md
✅ Valida DoD completo
✅ Ejecuta tests y validaciones
✅ Prepara contexto para siguiente tarea
```

---

## 🚫 REGLAS DE NO HACER (Next.js)

### **Prohibido**
- ❌ No usar `any` en TypeScript
- ❌ No hardcodear strings (usar i18n)
- ❌ No romper SSR/SSG
- ❌ No introducir dependencias pesadas
- ❌ No ignorar accessibility
- ❌ No commitear sin tests

### **Obligatorio**
- ✅ TypeScript strict mode
- ✅ ESLint + Prettier
- ✅ Test coverage >80%
- ✅ Performance budgets
- ✅ Accessibility AA
- ✅ Conventional Commits

---

## 📊 MÉTRICAS DE ÉXITO

### **Technical Excellence**
- ✅ **TypeScript**: 0 errores, strict mode
- ✅ **Testing**: >80% coverage, 0 flaky tests
- ✅ **Performance**: LCP <2.5s, Lighthouse >95
- ✅ **Accessibility**: A11y AA compliance
- ✅ **Security**: 0 vulnerabilidades críticas

### **Development Experience**
- ✅ **Hot Reload**: <1s reload time
- ✅ **Build Time**: <2min build time
- ✅ **Bundle Size**: <500KB initial bundle
- ✅ **Developer Onboarding**: <1 day setup

### **Production Readiness**
- ✅ **Uptime**: >99.9% availability
- ✅ **Error Rate**: <0.1% error rate
- ✅ **Response Time**: <200ms API response
- ✅ **Monitoring**: 100% observability

---

## 🎯 PRÓXIMOS PASOS

### **Inmediato**
1. **Analizar proyecto actual** específico
2. **Adaptar roadmap** según estado actual
3. **Implementar Context Engineering**
4. **Setup inicial** de testing y CI/CD

### **Mediano Plazo**
1. **Desarrollar core features**
2. **Optimizar performance**
3. **Implementar monitoring**
4. **Preparar para producción**

### **Largo Plazo**
1. **Escalabilidad** del sistema
2. **Nuevas funcionalidades**
3. **Optimización continua**
4. **Team scaling**

---

## 🔍 INSTRUCCIONES DE ANÁLISIS E IMPLEMENTACIÓN

### **PASO 1: ANÁLISIS DEL PROYECTO ACTUAL**

#### **Checklist de Análisis Inicial**
```
📋 Análisis del Proyecto Next.js:
├── 🔍 Stack Tecnológico
│   ├── ¿Next.js versión? (12, 13, 14+)
│   ├── ¿App Router o Pages Router?
│   ├── ¿TypeScript configurado?
│   ├── ¿Tailwind CSS instalado?
│   ├── ¿Zustand implementado?
│   └── ¿Otras dependencias clave?
├── 🏗️ Arquitectura Actual
│   ├── ¿Estructura de directorios?
│   ├── ¿Componentes organizados?
│   ├── ¿State management implementado?
│   ├── ¿API routes configuradas?
│   └── ¿Middleware implementado?
├── 🧪 Testing Setup
│   ├── ¿Jest configurado?
│   ├── ¿React Testing Library?
│   ├── ¿Playwright E2E?
│   ├── ¿Coverage configurado?
│   └── ¿Tests existentes?
├── 🚀 Performance & Build
│   ├── ¿Bundle analyzer configurado?
│   ├── ¿Lighthouse CI?
│   ├── ¿Web Vitals monitoring?
│   ├── ¿Image optimization?
│   └── ¿Code splitting implementado?
├── 🔧 DevOps & CI/CD
│   ├── ¿GitHub Actions configurado?
│   ├── ¿Deployment pipeline?
│   ├── ¿Environment management?
│   ├── ¿Monitoring setup?
│   └── ¿Error tracking?
└── 📚 Documentación
    ├── ¿README actualizado?
    ├── ¿API documentation?
    ├── ¿Component documentation?
    ├── ¿Architecture decisions?
    └── ¿Deployment guides?
```

#### **Comandos de Análisis**
```bash
# 1. Analizar estructura del proyecto
find . -type f -name "*.json" -o -name "*.js" -o -name "*.ts" -o -name "*.tsx" | head -20

# 2. Verificar dependencias
npm list --depth=0

# 3. Analizar configuración TypeScript
cat tsconfig.json

# 4. Verificar configuración Next.js
cat next.config.js

# 5. Analizar scripts disponibles
cat package.json | grep -A 20 '"scripts"'

# 6. Verificar estructura de testing
find . -name "*.test.*" -o -name "*.spec.*" | wc -l

# 7. Analizar coverage actual
npm run test:coverage 2>/dev/null || echo "No coverage configurado"

# 8. Verificar performance
npm run build && npm run analyze 2>/dev/null || echo "No analyzer configurado"
```

### **PASO 2: IMPLEMENTACIÓN DE CONTEXT ENGINEERING**

#### **Archivos de Contexto a Crear**
```
📁 Archivos de contexto obligatorio:
├── CONTEXT.md                       # Estado actual del proyecto
├── TASKS.md                         # Backlog de microtareas
├── docs/
│   ├── PRD.md                       # Product Requirements Document
│   ├── ARCHITECTURE.md              # Decisiones técnicas
│   ├── DECISIONS.md                 # ADR log
│   ├── QA.md                        # Testing checklist
│   ├── API.md                       # API documentation
│   ├── COMPONENTS.md                # Component library
│   ├── TESTING.md                   # Testing strategy
│   ├── DEPLOYMENT.md                # Deployment guide
│   └── PERFORMANCE.md               # Performance guidelines
└── .cursor/
    ├── boot.md                      # Boot de contexto
    ├── rules-nextjs.md              # Reglas específicas Next.js
    └── templates/
        └── microtask.md             # Plantilla de microtareas
```

#### **Template de CONTEXT.md**
```markdown
# CONTEXT

• **Stack tecnológico**: Next.js 14+, TypeScript, Tailwind CSS, Zustand, [otras dependencias]
• **Objetivos**: [Objetivos específicos del proyecto]
• **DoD**: TypeScript 0 errores, Test coverage >80%, Lighthouse >95, A11y AA
• **Tarea activa**: [Tarea actual en progreso]
• **Estado**: [Estado actual del proyecto]
```

#### **Template de TASKS.md**
```markdown
# Backlog · Microtareas Next.js

## Estados
- pendiente | en progreso | bloqueada | done

## Tareas
- T01 — Setup inicial del proyecto
  - Estado: **pendiente**
  - Entregables: Next.js configurado, TypeScript strict, Tailwind CSS, ESLint/Prettier

- T02 — Context Engineering setup
  - Estado: **pendiente**
  - Entregables: CONTEXT.md, TASKS.md, docs/ estructura, scripts automatización

- T03 — Testing infrastructure
  - Estado: **pendiente**
  - Entregables: Jest + RTL, Playwright E2E, coverage thresholds, CI/CD básico

- T04 — Component library base
  - Estado: **pendiente**
  - Entregables: UI primitives, design system base, accessibility foundation
```

### **PASO 3: SCRIPTS DE AUTOMATIZACIÓN**

#### **Context Updater para Next.js**
```javascript
// scripts/context-updater.mjs
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const updateContext = async () => {
  console.log('🔄 Actualizando contexto del proyecto...');
  
  // Analizar package.json
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const dependencies = Object.keys(packageJson.dependencies || {});
  const devDependencies = Object.keys(packageJson.devDependencies || {});
  
  // Analizar estructura de componentes
  const components = await analyzeComponents();
  
  // Analizar tests
  const testStats = await analyzeTests();
  
  // Analizar performance
  const performanceStats = await analyzePerformance();
  
  // Generar reporte
  const context = {
    stack: {
      nextjs: packageJson.dependencies.next || 'No instalado',
      typescript: devDependencies.includes('typescript'),
      tailwind: devDependencies.includes('tailwindcss'),
      zustand: dependencies.includes('zustand'),
      testing: {
        jest: devDependencies.includes('jest'),
        rtl: devDependencies.includes('@testing-library/react'),
        playwright: devDependencies.includes('@playwright/test')
      }
    },
    architecture: {
      components: components.length,
      pages: await countPages(),
      api: await countApiRoutes()
    },
    testing: testStats,
    performance: performanceStats,
    lastUpdated: new Date().toISOString()
  };
  
  // Actualizar CONTEXT.md
  updateContextFile(context);
  
  console.log('✅ Contexto actualizado exitosamente');
};

const analyzeComponents = async () => {
  const componentsDir = 'src/components';
  if (!fs.existsSync(componentsDir)) return [];
  
  const files = fs.readdirSync(componentsDir, { recursive: true });
  return files.filter(file => file.endsWith('.tsx') || file.endsWith('.jsx'));
};

const analyzeTests = async () => {
  try {
    const coverage = execSync('npm run test:coverage --silent', { encoding: 'utf8' });
    return { coverage: 'Configurado', status: 'OK' };
  } catch (error) {
    return { coverage: 'No configurado', status: 'Pendiente' };
  }
};

const analyzePerformance = async () => {
  try {
    const buildOutput = execSync('npm run build --silent', { encoding: 'utf8' });
    return { build: 'OK', bundleSize: 'Analizar' };
  } catch (error) {
    return { build: 'Error', bundleSize: 'N/A' };
  }
};

const updateContextFile = (context) => {
  const contextContent = `# CONTEXT

• **Stack tecnológico**: ${Object.entries(context.stack).map(([key, value]) => `${key}: ${value}`).join(', ')}
• **Arquitectura**: ${context.architecture.components} componentes, ${context.architecture.pages} páginas, ${context.architecture.api} API routes
• **Testing**: ${context.testing.status} (${context.testing.coverage})
• **Performance**: ${context.performance.build} (${context.performance.bundleSize})
• **Última actualización**: ${context.lastUpdated}
`;

  fs.writeFileSync('CONTEXT.md', contextContent);
};

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  updateContext();
}

export { updateContext };
```

#### **Scripts de Validación**
```json
{
  "scripts": {
    "context:update": "node scripts/context-updater.mjs",
    "context:check": "node scripts/context-updater.mjs --check",
    "analyze:project": "node scripts/analyze-project.mjs",
    "setup:context": "node scripts/setup-context.mjs",
    "validate:all": "npm run type-check && npm run lint && npm run test && npm run build"
  }
}
```

### **PASO 4: IMPLEMENTACIÓN GRADUAL**

#### **Fase 1: Foundation (Semana 1)**
```
📋 Tareas de Foundation:
├── T01 — Análisis completo del proyecto
│   ├── Ejecutar checklist de análisis
│   ├── Documentar stack actual
│   ├── Identificar gaps
│   └── Crear roadmap específico
├── T02 — Setup Context Engineering
│   ├── Crear CONTEXT.md
│   ├── Crear TASKS.md
│   ├── Crear docs/ estructura
│   └── Implementar context-updater.mjs
├── T03 — Configuración base
│   ├── TypeScript strict mode
│   ├── ESLint + Prettier
│   ├── Tailwind CSS optimizado
│   └── Scripts de validación
└── T04 — Testing foundation
    ├── Jest + RTL setup
    ├── Playwright E2E
    ├── Coverage thresholds
    └── CI/CD básico
```

#### **Fase 2: Development (Semanas 2-4)**
```
📋 Tareas de Development:
├── T05 — Component library
│   ├── UI primitives
│   ├── Design system
│   ├── Storybook (opcional)
│   └── Accessibility base
├── T06 — State management
│   ├── Zustand stores
│   ├── React Query setup
│   ├── Global state
│   └── Persistence
├── T07 — API layer
│   ├── API routes
│   ├── Database integration
│   ├── Authentication
│   └── Error handling
└── T08 — Core features
    ├── Dashboard
    ├── User management
    ├── Data visualization
    └── Form handling
```

#### **Fase 3: Production (Semanas 5-6)**
```
📋 Tareas de Production:
├── T09 — Performance optimization
│   ├── Code splitting
│   ├── Image optimization
│   ├── Bundle analysis
│   └── Web Vitals
├── T10 — Security & Monitoring
│   ├── Security hardening
│   ├── Error tracking
│   ├── Performance monitoring
│   └── Analytics
├── T11 — Deployment
│   ├── Production deployment
│   ├── Environment management
│   ├── CI/CD pipeline
│   └── Rollback procedures
└── T12 — Documentation
    ├── API documentation
    ├── Component docs
    ├── Deployment guides
    └── Maintenance procedures
```

### **PASO 5: VALIDACIÓN Y MONITOREO**

#### **Checklist de Validación**
```
📋 Validación por Fase:
├── ✅ Foundation
│   ├── TypeScript 0 errores
│   ├── ESLint + Prettier configurado
│   ├── Tests básicos funcionando
│   └── Context Engineering operativo
├── ✅ Development
│   ├── Component library estable
│   ├── State management implementado
│   ├── API endpoints funcionales
│   └── Core features implementadas
└── ✅ Production
    ├── Performance optimizada
    ├── Security implementada
    ├── Monitoring activo
    └── Deployment automatizado
```

#### **Métricas de Éxito**
```
📊 Métricas por Fase:
├── 🎯 Foundation
│   ├── TypeScript: 0 errores
│   ├── Test coverage: >80%
│   ├── Build time: <2min
│   └── Context updates: Automático
├── 🎯 Development
│   ├── Components: >20 primitives
│   ├── API routes: >10 endpoints
│   ├── State stores: >5 stores
│   └── Features: >5 core features
└── 🎯 Production
    ├── Performance: LCP <2.5s
    ├── Security: 0 vulnerabilidades
    ├── Uptime: >99.9%
    └── Monitoring: 100% observability
```

### **PASO 6: MANTENIMIENTO CONTINUO**

#### **Rutinas de Mantenimiento**
```
📋 Rutinas semanales:
├── 🔄 Context updates automáticos
├── 📊 Performance monitoring
├── 🧪 Test execution
├── 📚 Documentation updates
└── 🚀 Deployment validation
```

#### **Escalabilidad**
```
📋 Escalabilidad:
├── 👥 Team scaling
├── 🏗️ Architecture evolution
├── 📈 Performance optimization
├── 🔧 Tool updates
└── 📚 Knowledge sharing
```

---

## 🎯 INSTRUCCIONES FINALES

### **Para Implementar en el Nuevo Proyecto:**

1. **Copia este documento** al nuevo proyecto
2. **Ejecuta el análisis inicial** con los comandos proporcionados
3. **Implementa Context Engineering** siguiendo los templates
4. **Configura scripts de automatización** 
5. **Sigue el roadmap** fase por fase
6. **Valida cada fase** antes de continuar
7. **Mantén documentación actualizada**

### **Archivos Clave a Crear:**
- `CONTEXT.md` - Estado actual
- `TASKS.md` - Backlog de microtareas  
- `docs/` - Documentación completa
- `scripts/context-updater.mjs` - Automatización
- `.cursor/rules-nextjs.md` - Reglas específicas

### **Comandos de Inicio:**
```bash
# 1. Análisis inicial
npm run analyze:project

# 2. Setup contexto
npm run setup:context

# 3. Validación completa
npm run validate:all

# 4. Iniciar desarrollo
npm run dev
```

---

**Esta metodología adaptada para Next.js mantiene los principios fundamentales de Context Engineering y Microtasking, pero optimizada para el stack tecnológico moderno y las necesidades específicas de desarrollo web con React/Next.js.**
