# 🎯 PROMPT PARA CORRECCIONES CRÍTICAS - HOMMIE 0% COMISIÓN

## 📋 CONTEXTO DEL PROYECTO

**Proyecto**: Hommie 0% Comisión - Plataforma de arriendo sin comisión  
**Estado**: Limpieza completada, estructura organizada  
**Health Score**: 60% (Requiere 2 correcciones críticas)  
**Objetivo**: Tener base sólida para desarrollo continuo  

## 🚨 CORRECCIONES CRÍTICAS IDENTIFICADAS

### **1. Archivo Faltante Crítico**
- ❌ **`components/ui/Button.tsx`** - Componente base necesario para UI
- **Impacto**: Componente base necesario para toda la interfaz
- **Prioridad**: Crítica
- **Tiempo estimado**: 15 minutos

### **2. Configuración TypeScript**
- ⚠️ **`allowSyntheticDefaultImports`** - Configuración faltante en tsconfig.json
- **Impacto**: Puede causar problemas con imports de módulos
- **Prioridad**: Media
- **Tiempo estimado**: 5 minutos

## 🎯 TAREAS ESPECÍFICAS A REALIZAR

### **TAREA 1: Crear Componente Button.tsx**
**Archivo**: `components/ui/Button.tsx`  
**Tipo**: Componente React con TypeScript  
**Funcionalidad**: Botón base con variantes y tamaños  

**Código requerido**:
```typescript
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background',
          {
            'bg-primary text-primary-foreground hover:bg-primary/90': variant === 'primary',
            'bg-secondary text-secondary-foreground hover:bg-secondary/80': variant === 'secondary',
            'hover:bg-accent hover:text-accent-foreground': variant === 'ghost',
            'bg-destructive text-destructive-foreground hover:bg-destructive/90': variant === 'destructive',
          },
          {
            'h-9 px-3': size === 'sm',
            'h-10 py-2 px-4': size === 'md',
            'h-11 px-8': size === 'lg',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button };
```

### **TAREA 2: Corregir tsconfig.json**
**Archivo**: `tsconfig.json`  
**Acción**: Agregar configuración faltante  
**Ubicación**: En `compilerOptions`  

**Configuración a agregar**:
```json
{
  "compilerOptions": {
    // ... configuración existente ...
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true
  }
}
```

## 🔧 COMANDOS DE VERIFICACIÓN

### **Después de cada corrección**:
```bash
# Verificar TypeScript
pnpm run typecheck

# Verificar build
pnpm run build

# Verificar linting
pnpm run lint
```

### **Verificación final**:
```bash
# Health check completo
pnpm run health:check

# Tests completos
pnpm run test:all

# Metodología
pnpm run methodology:check
```

## 📊 CRITERIOS DE ÉXITO

### **Objetivos Inmediatos**:
- ✅ **Health Score**: >80%
- ✅ **TypeScript**: Sin errores
- ✅ **Build**: Exitoso
- ✅ **Tests**: Pasando
- ✅ **Metodología**: Funcionando

### **Indicadores de Calidad**:
- 📊 **Cobertura de tests**: >80%
- 📊 **Performance**: LCP ≤ 2.5s
- 📊 **Accesibilidad**: A11y AA compliance
- 📊 **SEO**: Score >90

## 🎯 ORDEN DE EJECUCIÓN

### **Sesión de 1 Hora (Corrección Crítica)**:
1. **Crear Button.tsx** (15 min)
2. **Corregir tsconfig.json** (5 min)
3. **Verificar build** (10 min)
4. **Ejecutar tests** (30 min)

### **Verificación Final**:
1. **Health check** (5 min)
2. **Metodología check** (10 min)
3. **Quality gates** (10 min)
4. **Prueba manual** (5 min)

## 📚 ARCHIVOS DE REFERENCIA

### **Documentación disponible**:
- `ROADMAP_DESARROLLO_ORDENADO.md` - Plan completo de desarrollo
- `PRÓXIMOS_PASOS_ESPECÍFICOS.md` - Acciones inmediatas específicas
- `scripts/quick-health-check.mjs` - Verificación de salud del proyecto

### **Comandos disponibles**:
```bash
# Verificación de salud
pnpm run health:check

# Metodología completa
pnpm run methodology:check

# Quality gates
pnpm run quality:gates

# Limpieza
pnpm run cleanup:files
```

## 🚀 PROMPT PARA EL ASISTENTE

**"Necesito que implementes las 2 correcciones críticas identificadas en el proyecto Hommie 0% Comisión:**

**1. Crear el componente `components/ui/Button.tsx` con el código TypeScript proporcionado**
**2. Corregir `tsconfig.json` agregando `allowSyntheticDefaultImports: true`**

**Después de cada corrección, ejecuta los comandos de verificación:**
- `pnpm run typecheck`
- `pnpm run build`
- `pnpm run health:check`

**El objetivo es alcanzar un Health Score >80% y tener el proyecto listo para desarrollo continuo.**

**Archivos de referencia disponibles:**
- `ROADMAP_DESARROLLO_ORDENADO.md`
- `PRÓXIMOS_PASOS_ESPECÍFICOS.md`
- `scripts/quick-health-check.mjs`

**Tiempo estimado total: 1 hora**
**Prioridad: Crítica**"

## 📋 CHECKLIST DE VERIFICACIÓN

### **Antes de continuar con desarrollo**:
- [ ] Crear `components/ui/Button.tsx` (crítico)
- [ ] Corregir `tsconfig.json` (importante)
- [ ] Ejecutar `pnpm run typecheck` (verificar)
- [ ] Ejecutar `pnpm run build` (verificar)
- [ ] Ejecutar `pnpm run test:all` (verificar)
- [ ] Ejecutar `pnpm run health:check` (verificar)
- [ ] Ejecutar `pnpm run methodology:check` (verificar)

### **Después de correcciones**:
- [ ] Health Score >80%
- [ ] TypeScript sin errores
- [ ] Build exitoso
- [ ] Tests pasando
- [ ] Metodología funcionando

## 🎯 RESULTADO ESPERADO

**Una vez completadas las 2 correcciones críticas, el proyecto tendrá:**
- ✅ Base sólida para desarrollo continuo
- ✅ Metodología de trabajo establecida
- ✅ Quality gates funcionando
- ✅ Estructura organizada y limpia
- ✅ Health Score >80%

**El proyecto estará listo para continuar con el desarrollo de forma ordenada y con calidad garantizada.**

---

**📅 Fecha**: 2025-01-27  
**🎯 Objetivo**: Base sólida para desarrollo continuo  
**⏱️ Tiempo total estimado**: 1 hora  
**🚀 Estado**: Listo para ejecutar correcciones
