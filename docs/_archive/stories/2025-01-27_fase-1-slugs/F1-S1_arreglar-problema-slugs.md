# Story: F1-S1 - Arreglar Problema de Slugs

**Fase:** 1 - Corrección Crítica  
**Prioridad:** CRÍTICA  
**Estado:** PENDIENTE  
**Asignado:** Desarrollador  
**Fecha:** 2025-01-27

## 🎯 Objetivo
Resolver el problema crítico de URLs incorrectas que causan 404s en todas las páginas de propiedades.

## 🚨 Problema Identificado
```bash
❌ URL incorrecta: /property/bld-las-condes (404)
✅ URL correcta: /property/edificio-vista-las-condes (200)
```

**Causa:** Inconsistencia entre `id` y `slug` en la base de datos
- **ID:** `bld-las-condes` (usado en URLs incorrectas)
- **Slug:** `edificio-vista-las-condes` (correcto para URLs)

## 📋 Tareas
- [ ] **Analizar generación de URLs** en BuildingCard components
- [ ] **Identificar dónde se usa `id` en lugar de `slug`**
- [ ] **Corregir generación de URLs** en todos los componentes
- [ ] **Verificar consistencia** en toda la aplicación
- [ ] **Testing manual** de property pages
- [ ] **Validar que no hay regresiones**

## 🔧 Archivos a Modificar
- `components/BuildingCard.tsx`
- `components/BuildingCardV2.tsx`
- `components/lists/ResultsGrid.tsx`
- `hooks/useBuildingsData.ts`
- `components/ui/BuildingCardSkeleton.tsx` (si existe)

## ✅ Criterios de Éxito
- [ ] **0% 404s** en property pages
- [ ] **URLs consistentes** en toda la app
- [ ] **Testing manual exitoso** en al menos 5 property pages
- [ ] **No regresiones** en landing page
- [ ] **Logs limpios** sin errores de routing

## 📊 Métricas
- **404s Property Pages:** 100% → 0%
- **URLs Consistentes:** 0% → 100%
- **Property Pages Funcionando:** 0% → 100%

## 🔍 Análisis Técnico

### **Datos Actuales desde Supabase:**
```json
{
  "id": "bld-las-condes",
  "slug": "edificio-vista-las-condes",
  "name": "Edificio Vista Las Condes"
}
```

### **URLs Generadas Actualmente:**
```bash
❌ /property/bld-las-condes (404)
✅ /property/edificio-vista-las-condes (200)
```

### **Componentes a Revisar:**
1. **BuildingCard.tsx** - Generación de enlaces
2. **BuildingCardV2.tsx** - Generación de enlaces
3. **ResultsGrid.tsx** - Renderizado de cards
4. **useBuildingsData.ts** - Manejo de datos

## 🛠️ Plan de Implementación

### **Paso 1: Análisis**
```bash
# Verificar URLs actuales
curl -s "http://localhost:3000/api/buildings?limit=5" | jq '.buildings[] | {id, slug, name}'

# Verificar property pages
curl -s "http://localhost:3000/property/edificio-vista-las-condes" | grep -o "<title>.*</title>"
```

### **Paso 2: Identificar Problema**
- Buscar uso de `building.id` en lugar de `building.slug`
- Verificar generación de URLs en componentes
- Identificar todos los lugares donde se genera la URL

### **Paso 3: Corrección**
- Cambiar `building.id` por `building.slug` en URLs
- Asegurar consistencia en todos los componentes
- Mantener `id` solo para identificadores internos

### **Paso 4: Validación**
- Testing manual de property pages
- Verificar que landing page sigue funcionando
- Comprobar que no hay regresiones

## 📝 Notas
- **Riesgo:** Cambios en URLs pueden afectar SEO
- **Mitigación:** Verificar que slugs son SEO-friendly
- **Rollback:** Mantener backup de archivos modificados

## 🔄 Estado de Implementación

### **Pendiente**
- [ ] Análisis de archivos
- [ ] Identificación de problemas
- [ ] Implementación de correcciones
- [ ] Testing y validación

### **En Progreso**
- [ ] (Ninguno)

### **Completado**
- [ ] (Ninguno)

---

**🎯 PRÓXIMO PASO:** Iniciar análisis de archivos para identificar dónde se genera la URL incorrecta.

*Story creado el 2025-01-27 - Fase 1*
