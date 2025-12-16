# 🛡️ CONFIGURACIÓN DE PROTECCIÓN DE RAMAS - GITHUB

## 🎯 **OBJETIVO**
Configurar protección estricta para las 2 ramas principales y establecer reglas de merge automáticas.

## 📋 **PASOS A SEGUIR**

### **1. IR A GITHUB REPOSITORY SETTINGS**
```
https://github.com/elkisdm/tremendoarriendo/settings/branches
```

### **2. CONFIGURAR PROTECCIÓN PARA `main`**

#### **✅ Configuraciones OBLIGATORIAS:**
- [ ] **Restrict pushes that create files** → ✅ ACTIVAR
- [ ] **Require a pull request before merging** → ✅ ACTIVAR
  - [ ] **Require approvals** → ✅ ACTIVAR (1 approval mínimo)
  - [ ] **Dismiss stale PR approvals when new commits are pushed** → ✅ ACTIVAR
  - [ ] **Require review from code owners** → ✅ ACTIVAR
- [ ] **Require status checks to pass before merging** → ✅ ACTIVAR
  - [ ] **Require branches to be up to date before merging** → ✅ ACTIVAR
- [ ] **Require conversation resolution before merging** → ✅ ACTIVAR
- [ ] **Require signed commits** → ✅ ACTIVAR
- [ ] **Require linear history** → ✅ ACTIVAR
- [ ] **Include administrators** → ✅ ACTIVAR
- [ ] **Allow force pushes** → ❌ DESACTIVAR
- [ ] **Allow deletions** → ❌ DESACTIVAR

### **3. CONFIGURAR PROTECCIÓN PARA `develop`**

#### **✅ Configuraciones MODERADAS:**
- [ ] **Restrict pushes that create files** → ✅ ACTIVAR
- [ ] **Require a pull request before merging** → ✅ ACTIVAR
  - [ ] **Require approvals** → ✅ ACTIVAR (1 approval mínimo)
  - [ ] **Dismiss stale PR approvals when new commits are pushed** → ✅ ACTIVAR
- [ ] **Require status checks to pass before merging** → ✅ ACTIVAR
- [ ] **Require conversation resolution before merging** → ✅ ACTIVAR
- [ ] **Include administrators** → ✅ ACTIVAR
- [ ] **Allow force pushes** → ❌ DESACTIVAR
- [ ] **Allow deletions** → ❌ DESACTIVAR

### **4. CONFIGURAR CODE OWNERS**

#### **Crear archivo `.github/CODEOWNERS`:**
```
# Global owners
* @elkisdm

# Critical files
/.github/ @elkisdm
/package.json @elkisdm
/next.config.mjs @elkisdm
/tsconfig.json @elkisdm

# API routes
/app/api/ @elkisdm

# Core components
/components/property/ @elkisdm
/components/marketing/ @elkisdm
/lib/ @elkisdm
```

### **5. CONFIGURAR STATUS CHECKS**

#### **Requisitos para merge:**
- [ ] **Build must pass** (GitHub Actions)
- [ ] **Tests must pass** (GitHub Actions)
- [ ] **Lint must pass** (GitHub Actions)
- [ ] **Type check must pass** (GitHub Actions)

### **6. CONFIGURAR MERGE STRATEGY**

#### **Para `main`:**
- **Merge method:** "Create a merge commit"
- **Automatically delete head branches:** ✅ ACTIVAR

#### **Para `develop`:**
- **Merge method:** "Squash and merge"
- **Automatically delete head branches:** ✅ ACTIVAR

## 🚨 **REGLAS ESTRICTAS ESTABLECIDAS**

### **`main` (Producción):**
- ❌ **NUNCA** push directo
- ❌ **NUNCA** force push
- ❌ **NUNCA** delete
- ✅ **SOLO** merge desde develop
- ✅ **SIEMPRE** PR con approval
- ✅ **SIEMPRE** status checks pasando
- ✅ **SIEMPRE** signed commits

### **`develop` (Desarrollo):**
- ❌ **NUNCA** push directo (excepto hotfixes)
- ❌ **NUNCA** force push
- ❌ **NUNCA** delete
- ✅ **SÍ** merge de feature branches
- ✅ **SIEMPRE** PR con approval
- ✅ **SIEMPRE** status checks pasando

## 🔧 **COMANDOS DE VERIFICACIÓN**

### **Verificar protección localmente:**
```bash
# Verificar que no se puede push directo a main
git checkout main
git push origin main  # Debe fallar

# Verificar que develop permite merge
git checkout develop
git push origin develop  # Debe funcionar
```

### **Verificar configuración:**
```bash
# Ver ramas protegidas
git ls-remote --heads origin

# Ver configuración de protección
curl -H "Authorization: token YOUR_TOKEN" \
  https://api.github.com/repos/elkisdm/tremendoarriendo/branches/main/protection
```

## ✅ **CHECKLIST DE CONFIGURACIÓN**

### **Antes de empezar:**
- [ ] Acceso de administrador al repositorio
- [ ] Token de GitHub con permisos de repo
- [ ] Lista de colaboradores actualizada

### **Durante la configuración:**
- [ ] Protección de `main` configurada
- [ ] Protección de `develop` configurada
- [ ] CODEOWNERS creado
- [ ] Status checks configurados
- [ ] Merge strategy establecida

### **Después de la configuración:**
- [ ] Probar push directo a main (debe fallar)
- [ ] Probar PR a develop (debe funcionar)
- [ ] Probar PR a main (debe funcionar)
- [ ] Verificar que develop permite push directo

## 🎯 **RESULTADO ESPERADO**

Después de la configuración:
- ✅ **main completamente protegida** (solo merge desde develop)
- ✅ **develop moderadamente protegida** (merge de features)
- ✅ **PRs obligatorios** para todos los cambios
- ✅ **Status checks automáticos** antes de merge
- ✅ **Code review obligatorio** para cambios críticos
- ✅ **Historial limpio** y trazable

---

**¿Listo para configurar? ¡Vamos paso a paso!** 🚀

## 🎯 **OBJETIVO**
Proteger las ramas `main` y `develop` para mantener la organización y prevenir cambios accidentales.

## 📋 **PASOS PARA CONFIGURAR PROTECCIÓN**

### **1. ACCEDER A CONFIGURACIÓN DE RAMAS**
1. Ve a tu repositorio: `https://github.com/elkisdm/tremendoarriendo`
2. Haz clic en **Settings** (Configuración)
3. En el menú lateral, haz clic en **Branches** (Ramas)

### **2. CONFIGURAR PROTECCIÓN DE RAMA `main`**

#### **🔒 Reglas de Protección para `main`:**
- ✅ **Require a pull request before merging**
- ✅ **Require approvals** (1 approval mínimo)
- ✅ **Dismiss stale PR approvals when new commits are pushed**
- ✅ **Require review from code owners**
- ✅ **Require status checks to pass before merging**
- ✅ **Require branches to be up to date before merging**
- ✅ **Require conversation resolution before merging**
- ✅ **Require signed commits**
- ✅ **Require linear history**
- ✅ **Include administrators**
- ✅ **Restrict pushes that create files**

#### **🚫 Restricciones Adicionales:**
- ❌ **No direct pushes to main**
- ❌ **No force pushes**
- ❌ **No deletion of main branch**

### **3. CONFIGURAR PROTECCIÓN DE RAMA `develop`**

#### **🔒 Reglas de Protección para `develop`:**
- ✅ **Require a pull request before merging**
- ✅ **Require approvals** (1 approval mínimo)
- ✅ **Dismiss stale PR approvals when new commits are pushed**
- ✅ **Require status checks to pass before merging**
- ✅ **Require branches to be up to date before merging**
- ✅ **Require conversation resolution before merging**
- ❌ **NO require signed commits** (para desarrollo ágil)
- ❌ **NO require linear history** (permite merge commits)
- ✅ **Include administrators**
- ❌ **NO restrict pushes that create files** (permite desarrollo)

### **4. CONFIGURAR CODE OWNERS**

#### **Crear archivo `.github/CODEOWNERS`:**
```
# Global owners
* @elkisdm

# Specific file patterns
/app/ @elkisdm
/components/ @elkisdm
/lib/ @elkisdm
/tests/ @elkisdm

# Critical files
package.json @elkisdm
next.config.mjs @elkisdm
tailwind.config.ts @elkisdm
tsconfig.json @elkisdm
```

### **5. CONFIGURAR STATUS CHECKS**

#### **Checks Requeridos:**
- ✅ **Build** (npm run build)
- ✅ **Lint** (npm run lint)
- ✅ **Type Check** (npm run type-check)
- ✅ **Tests** (npm run test)

#### **Configuración en GitHub Actions:**
```yaml
name: Branch Protection Checks
on:
  pull_request:
    branches: [main, develop]

jobs:
  protection-checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run lint
        run: npm run lint
      
      - name: Run type check
        run: npm run type-check
      
      - name: Run tests
        run: npm run test
      
      - name: Build
        run: npm run build
```

## 🔧 **CONFIGURACIÓN AVANZADA**

### **6. CONFIGURAR MERGE STRATEGY**

#### **Para `main`:**
- **Merge method:** Squash and merge
- **Auto-merge:** Disabled
- **Delete head branches:** Enabled

#### **Para `develop`:**
- **Merge method:** Merge commit
- **Auto-merge:** Enabled (con approvals)
- **Delete head branches:** Enabled

### **7. CONFIGURAR NOTIFICACIONES**

#### **Webhooks para Protección:**
- ✅ **Push notifications**
- ✅ **PR notifications**
- ✅ **Status check notifications**
- ✅ **Branch protection notifications**

## 📊 **DASHBOARD DE PROTECCIÓN**

### **Métricas a Monitorear:**
- 📈 **PR approval rate**
- ⏱️ **Average time to merge**
- 🔄 **Branch protection violations**
- ✅ **Status check success rate**

## 🚨 **RESPONDER A VIOLACIONES**

### **Si alguien intenta push directo:**
1. **GitHub bloqueará** automáticamente
2. **Notificación** al administrador
3. **Redirección** a crear PR
4. **Log de intento** en auditoría

### **Si fallan los status checks:**
1. **PR bloqueado** hasta que pasen
2. **Notificación** al autor
3. **Instrucciones** para corregir
4. **Re-run** automático disponible

## ✅ **CHECKLIST DE IMPLEMENTACIÓN**

### **Configuración Básica:**
- [ ] Protección de `main` configurada
- [ ] Protección de `develop` configurada
- [ ] Code owners definidos
- [ ] Status checks configurados

### **Configuración Avanzada:**
- [ ] GitHub Actions configurado
- [ ] Merge strategy definida
- [ ] Notificaciones configuradas
- [ ] Dashboard de monitoreo

### **Validación:**
- [ ] Test de protección funcionando
- [ ] PR flow validado
- [ ] Team notificado
- [ ] Documentación actualizada

## 🎯 **BENEFICIOS ESPERADOS**

### **Inmediatos:**
- 🛡️ **Protección automática** de ramas críticas
- 🚫 **Prevención de cambios accidentales**
- ✅ **Calidad de código garantizada**
- 📊 **Visibilidad de cambios**

### **A Largo Plazo:**
- 🔄 **Flujo de trabajo consistente**
- 🐛 **Menos bugs en producción**
- 👥 **Colaboración mejorada**
- 📈 **Métricas de desarrollo**

---

**¿Listo para configurar la protección de ramas?** 🚀
