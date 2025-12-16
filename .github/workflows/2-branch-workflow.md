# 🔄 Flujo de Trabajo: 2 Ramas Principales

## 📊 Estado Actual
✅ **Solo 2 ramas activas:**
- `main` → Producción estable
- `develop` → Desarrollo e integración

## 🎯 Flujo de Trabajo Simplificado

### **Para Nuevas Features:**
```bash
# 1. Crear feature branch desde develop
git checkout develop
git pull origin develop
git checkout -b feature/nueva-funcionalidad

# 2. Desarrollar y commitear
git add .
git commit -m "feat: nueva funcionalidad"

# 3. Merge a develop
git checkout develop
git merge feature/nueva-funcionalidad --no-ff
git push origin develop

# 4. Eliminar feature branch
git branch -d feature/nueva-funcionalidad
```

### **Para Deploy a Producción:**
```bash
# 1. Merge develop → main
git checkout main
git merge develop --no-ff
git push origin main

# 2. Tag de release
git tag v1.0.0
git push origin v1.0.0
```

## 🚫 Reglas Estrictas

### **main (Producción)**
- ❌ **NUNCA** commit directo
- ✅ **SOLO** merge desde develop
- ✅ **SIEMPRE** probado antes de merge
- ✅ **SIEMPRE** tag de release

### **develop (Desarrollo)**
- ✅ **SÍ** commits directos para desarrollo
- ✅ **SÍ** merge de feature branches
- ✅ **SÍ** testing y validación
- ❌ **NUNCA** merge directo a main

## 🔧 Comandos de Mantenimiento

### **Limpieza Semanal:**
```bash
# Limpiar ramas remotas obsoletas
git remote prune origin

# Limpiar ramas locales obsoletas
git branch --merged develop | grep -v "develop\|main" | xargs -n 1 git branch -d
```

### **Backup Antes de Cambios Grandes:**
```bash
git tag backup-$(date +%Y%m%d-%H%M%S)
git push origin backup-$(date +%Y%m%d-%H%M%S)
```

## ✅ Checklist de Merge

### **Antes de merge develop → main:**
- [ ] Tests pasando
- [ ] Build exitoso
- [ ] No errores de lint
- [ ] Documentación actualizada
- [ ] Backup creado

### **Después de merge:**
- [ ] Deploy exitoso
- [ ] Monitoreo activo
- [ ] Rollback plan listo
- [ ] Notificación al equipo

## 🎉 Beneficios Logrados

- ✅ **2 ramas claras** en lugar de 8+
- ✅ **934+ archivos duplicados eliminados**
- ✅ **Flujo de trabajo simplificado**
- ✅ **Deploy más confiable**
- ✅ **Colaboración más fácil**
