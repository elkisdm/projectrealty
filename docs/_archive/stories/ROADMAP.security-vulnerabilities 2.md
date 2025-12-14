# Roadmap — Security Vulnerabilities Sprint

Este roadmap define el orden de ejecución de los pasos para eliminar las vulnerabilidades de seguridad identificadas, los archivos que se deben leer ANTES de cada cambio, comandos útiles y criterios de salida por paso. Mantener cambios atómicos y registrar todo en `stories/CHANGELOG.security-vulnerabilities.md`.

## Vulnerabilidades Identificadas

### **🚨 CRÍTICAS (1)**
- **Authorization Bypass in Next.js Middleware** (GHSA-f82v-jwr5-mffw)
  - Versión vulnerable: >=14.0.0 <14.2.25
  - Versión parcheada: >=14.2.25

### **🔴 ALTAS (2)**
- **Next.js Cache Poisoning** (GHSA-gp8f-8m3g-qvj9)
  - Versión vulnerable: >=14.0.0 <14.2.10
  - Versión parcheada: >=14.2.10
- **Next.js authorization bypass vulnerability** (GHSA-7gfc-8cq8-jh5f)
  - Versión vulnerable: >=9.5.5 <14.2.15
  - Versión parcheada: >=14.2.15

### **🟡 MODERADAS (2)**
- **Denial of Service in Next.js image optimization** (GHSA-g77x-44xx-532m)
  - Versión vulnerable: >=10.0.0 <14.2.7
  - Versión parcheada: >=14.2.7
- **Next.js Allows DoS with Server Actions** (GHSA-7m27-7ghc-44w9)
  - Versión vulnerable: >=14.0.0 <14.2.21
  - Versión parcheada: >=14.2.21

### **🟢 BAJAS (2)**
- **Next.js Race Condition to Cache Poisoning** (GHSA-qpjv-v59x-3qc4)
  - Versión vulnerable: <14.2.24
  - Versión parcheada: >=14.2.24
- **Information exposure in Next.js dev server** (GHSA-3h52-269p-cp9r)
  - Versión vulnerable: >=13.0 <14.2.30
  - Versión parcheada: >=14.2.30

## Orden de pasos
1) 🔄 **Paso 01 — Actualizar Next.js a versión segura**
2) 🔄 **Paso 02 — Verificar compatibilidad de dependencias**
3) 🔄 **Paso 03 — Actualizar dependencias relacionadas**
4) 🔄 **Paso 04 — Verificar build post-actualización**
5) 🔄 **Paso 05 — Verificar tests post-actualización**
6) 🔄 **Paso 06 — Verificar funcionalidad crítica**
7) 🔄 **Paso 07 — Actualizar configuraciones de seguridad**
8) 🔄 **Paso 08 — Verificar middleware y API routes**
9) 🔄 **Paso 09 — Configurar headers de seguridad**
10) 🔄 **Paso 10 — Test de seguridad final**

---

## 🔄 **Paso 01 — Actualizar Next.js a versión segura**

### **Objetivo:** 
Actualizar Next.js de 14.2.5 a 14.2.30+ para resolver todas las vulnerabilidades

### **Pre-lectura (obligatoria):**
- `package.json` (versión actual de Next.js)
- `next.config.mjs` (configuración actual)
- `pnpm-lock.yaml` (dependencias actuales)

### **Comandos de verificación:**
```bash
# Verificar versión actual
pnpm list next

# Verificar vulnerabilidades actuales
pnpm audit

# Verificar dependencias relacionadas
pnpm list | grep -E "(next|react|typescript)"
```

### **Comandos de actualización:**
```bash
# Actualizar Next.js a la última versión estable
pnpm update next@latest

# Verificar que se actualizó correctamente
pnpm list next
```

### **Criterio de salida:**
- ✅ Next.js actualizado a 14.2.30+
- ✅ `pnpm audit` muestra 0 vulnerabilidades críticas/altas
- ✅ Build exitoso sin errores de compatibilidad

---

## 🔄 **Paso 02 — Verificar compatibilidad de dependencias**

### **Objetivo:** 
Asegurar que todas las dependencias sean compatibles con la nueva versión de Next.js

### **Pre-lectura (obligatoria):**
- `package.json` (todas las dependencias)
- `next.config.mjs` (configuraciones específicas)
- `tsconfig.json` (configuración TypeScript)

### **Problemas potenciales:**
1. **React version mismatch**
2. **TypeScript version incompatibility**
3. **Plugin incompatibilities**

### **Comandos de verificación:**
```bash
# Verificar compatibilidad de React
pnpm list react react-dom

# Verificar TypeScript
pnpm list typescript @types/react @types/node

# Verificar plugins de Next.js
pnpm list | grep -E "(eslint|tailwind|postcss)"
```

### **Criterio de salida:**
- ✅ Todas las dependencias son compatibles
- ✅ No hay warnings de peer dependencies
- ✅ TypeScript compila sin errores

---

## 🔄 **Paso 03 — Actualizar dependencias relacionadas**

### **Objetivo:** 
Actualizar dependencias que puedan tener vulnerabilidades relacionadas

### **Pre-lectura (obligatoria):**
- `pnpm audit` (reporte completo)
- `package.json` (dependencias de desarrollo)

### **Comandos de actualización:**
```bash
# Actualizar dependencias de desarrollo
pnpm update --dev

# Actualizar dependencias de producción
pnpm update --prod

# Verificar vulnerabilidades restantes
pnpm audit
```

### **Criterio de salida:**
- ✅ Todas las dependencias actualizadas
- ✅ `pnpm audit` muestra 0 vulnerabilidades
- ✅ No hay conflictos de versiones

---

## 🔄 **Paso 04 — Verificar build post-actualización**

### **Objetivo:** 
Asegurar que el build funcione correctamente con las nuevas versiones

### **Pre-lectura (obligatoria):**
- `next.config.mjs` (configuraciones específicas)
- `app/` (estructura de páginas)
- `components/` (componentes críticos)

### **Comandos de verificación:**
```bash
# Build de producción
pnpm build

# Verificar que no hay errores de compilación
pnpm typecheck

# Verificar que no hay warnings críticos
pnpm build 2>&1 | grep -E "(error|Error|ERROR)"
```

### **Criterio de salida:**
- ✅ Build exitoso sin errores
- ✅ TypeScript sin errores
- ✅ No hay warnings críticos de compatibilidad

---

## 🔄 **Paso 05 — Verificar tests post-actualización**

### **Objetivo:** 
Asegurar que todos los tests sigan funcionando después de la actualización

### **Pre-lectura (obligatoria):**
- `tests/` (todos los archivos de test)
- `jest.config.ts` (configuración de Jest)
- `tests/setupTests.ts` (setup de tests)

### **Comandos de verificación:**
```bash
# Ejecutar todos los tests
pnpm test --passWithNoTests

# Verificar tests críticos
pnpm test tests/integration/
pnpm test tests/unit/

# Verificar que mantiene 100% green
pnpm test --passWithNoTests --silent | grep -E "(PASS|FAIL|Tests:|Test Suites:)" | tail -5
```

### **Criterio de salida:**
- ✅ Todos los tests pasan (100% green)
- ✅ No hay regresiones en funcionalidad
- ✅ Tests de integración funcionan correctamente

---

## 🔄 **Paso 06 — Verificar funcionalidad crítica**

### **Objetivo:** 
Verificar que las funcionalidades críticas sigan funcionando

### **Pre-lectura (obligatoria):**
- `app/api/` (API routes críticas)
- `components/` (componentes principales)
- `hooks/` (hooks críticos)

### **Funcionalidades a verificar:**
1. **API Routes** (booking, buildings, waitlist)
2. **Componentes principales** (ResultsGrid, BuildingCard)
3. **Hooks críticos** (useBuildingsData, useBuildingsPagination)
4. **Feature flags** (sistema de flags)

### **Comandos de verificación:**
```bash
# Verificar que el servidor inicia correctamente
pnpm dev &
sleep 10
curl -f http://localhost:3000 || echo "Server not responding"

# Verificar API routes
curl -f http://localhost:3000/api/buildings || echo "API not responding"

# Detener servidor
pkill -f "next dev"
```

### **Criterio de salida:**
- ✅ Servidor inicia correctamente
- ✅ API routes responden
- ✅ Componentes renderizan correctamente

---

## 🔄 **Paso 07 — Actualizar configuraciones de seguridad**

### **Objetivo:** 
Implementar configuraciones de seguridad adicionales

### **Pre-lectura (obligatoria):**
- `next.config.mjs` (configuración actual)
- `middleware.ts` (si existe)
- `app/api/` (API routes)

### **Configuraciones a implementar:**
1. **Headers de seguridad**
2. **Rate limiting mejorado**
3. **CORS configuration**
4. **Content Security Policy**

### **Comandos de verificación:**
```bash
# Verificar headers de seguridad
curl -I http://localhost:3000 | grep -E "(X-Frame-Options|X-Content-Type-Options|Referrer-Policy)"

# Verificar que las configuraciones se aplican
pnpm build
```

### **Criterio de salida:**
- ✅ Headers de seguridad implementados
- ✅ Rate limiting funcionando
- ✅ Configuraciones aplicadas correctamente

---

## 🔄 **Paso 08 — Verificar middleware y API routes**

### **Objetivo:** 
Asegurar que el middleware y API routes funcionen con la nueva versión

### **Pre-lectura (obligatoria):**
- `middleware.ts` (si existe)
- `app/api/` (todas las API routes)
- `lib/rate-limit.ts` (rate limiting)

### **Verificaciones específicas:**
1. **Middleware de autenticación**
2. **Rate limiting en API routes**
3. **CORS en API routes**
4. **Error handling**

### **Comandos de verificación:**
```bash
# Verificar middleware
pnpm build 2>&1 | grep -i middleware

# Verificar API routes
pnpm build 2>&1 | grep -E "api/.*route"

# Verificar que no hay errores de middleware
pnpm build 2>&1 | grep -E "(error|Error|ERROR)" | grep -i middleware
```

### **Criterio de salida:**
- ✅ Middleware funciona correctamente
- ✅ API routes compilan sin errores
- ✅ Rate limiting funciona

---

## 🔄 **Paso 09 — Configurar headers de seguridad**

### **Objetivo:** 
Implementar headers de seguridad adicionales

### **Pre-lectura (obligatoria):**
- `next.config.mjs` (configuración actual)
- `app/layout.tsx` (layout principal)

### **Headers a implementar:**
```javascript
// next.config.mjs
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
];
```

### **Criterio de salida:**
- ✅ Headers de seguridad implementados
- ✅ Headers se aplican correctamente
- ✅ No hay conflictos con funcionalidad existente

---

## 🔄 **Paso 10 — Test de seguridad final**

### **Objetivo:** 
Ejecutar un test completo de seguridad

### **Pre-lectura (obligatoria):**
- `pnpm audit` (reporte final)
- `package.json` (versiones finales)
- `next.config.mjs` (configuración final)

### **Comandos de verificación final:**
```bash
# Test completo de seguridad
echo "🔒 === TEST DE SEGURIDAD FINAL ==="

# 1. Verificar vulnerabilidades
echo "📊 1. VERIFICACIÓN DE VULNERABILIDADES"
pnpm audit

# 2. Verificar build
echo "🏗️ 2. VERIFICACIÓN DE BUILD"
pnpm build

# 3. Verificar tests
echo "🧪 3. VERIFICACIÓN DE TESTS"
pnpm test --passWithNoTests --silent | grep -E "(PASS|FAIL|Tests:|Test Suites:)" | tail -5

# 4. Verificar TypeScript
echo "📝 4. VERIFICACIÓN DE TYPESCRIPT"
pnpm typecheck

# 5. Verificar headers de seguridad
echo "🛡️ 5. VERIFICACIÓN DE HEADERS DE SEGURIDAD"
pnpm dev &
sleep 10
curl -I http://localhost:3000 | grep -E "(X-Frame-Options|X-Content-Type-Options|Referrer-Policy)"
pkill -f "next dev"

echo "🎯 ESTADO FINAL: SEGURIDAD VERIFICADA"
```

### **Criterio de salida:**
- ✅ `pnpm audit` muestra 0 vulnerabilidades críticas/altas
- ✅ Build exitoso
- ✅ Tests 100% green
- ✅ TypeScript sin errores
- ✅ Headers de seguridad implementados

---

## 🎯 **Objetivo Final: 0 Vulnerabilidades**

### **Estado Actual:**
- **Vulnerabilidades:** 7 total (1 crítica, 2 altas, 2 moderadas, 2 bajas)
- **Todas relacionadas con Next.js 14.2.5**

### **Estado Objetivo:**
- **Vulnerabilidades:** 0 críticas, 0 altas
- **Next.js:** 14.2.30+
- **Seguridad:** Headers implementados

### **Comando de verificación final:**
```bash
pnpm audit
```

### **Criterio de éxito:**
- ✅ 0 vulnerabilidades críticas
- ✅ 0 vulnerabilidades altas
- ✅ Build exitoso
- ✅ Tests 100% green
- ✅ Funcionalidad intacta

