# Auditoría de Backgrounds - Coming Soon

## Resumen Ejecutivo

Se identificó el problema del "corte" de color en `/coming-soon`. El fondo gradiente está aplicado **solo al componente hero** en lugar de cubrir toda la página, causando una transición abrupta entre el gradiente y el fondo base de la aplicación.

## Hallazgos Principales

### 1. Fondo Base de la Aplicación
- **Archivo**: `app/layout.tsx:25`
- **Clase**: `bg-gray-900`
- **Descripción**: Fondo base gris oscuro aplicado al `<body>` de toda la aplicación

### 2. Fondo Gradiente del Hero
- **Archivo**: `components/marketing/ComingSoonHero.tsx:228-235`
- **Líneas**: 228-235
- **Clase**: `bg-gradient-to-br from-violet-900/20 via-purple-900/10 to-cyan-900/20`
- **Descripción**: Gradiente animado aplicado solo al `<section>` del hero con `min-h-[70vh]`

### 3. Variables CSS de Fondo
- **Archivo**: `app/globals.css:6`
- **Variable**: `--bg: #0B0B10`
- **Descripción**: Color de fondo base definido como variable CSS

## Análisis del Problema

### Estructura Actual
```
<body class="bg-gray-900">                    # Fondo base gris
  <ComingSoonHero>
    <section class="min-h-[70vh]">            # Solo 70vh de altura
      <div class="bg-gradient-to-br...">      # Gradiente solo en hero
    </section>
  </ComingSoonHero>
</body>
```

### Problema Identificado
1. **Altura limitada**: El hero tiene `min-h-[70vh]`, no cubre toda la pantalla
2. **Fondo fragmentado**: El gradiente está en el hero, no en la página completa
3. **Transición abrupta**: Al final del hero aparece el fondo base `bg-gray-900`

## Rutas de Archivos Afectados

### Archivos Principales
- `app/coming-soon/page.tsx` - Página que renderiza solo el hero
- `app/coming-soon/layout.tsx` - Layout sin background personalizado
- `components/marketing/ComingSoonHero.tsx` - Componente con gradiente limitado
- `app/layout.tsx` - Layout raíz con fondo base
- `app/globals.css` - Variables CSS de fondo

### Archivos de Configuración
- `tailwind.config.ts` - Configuración de colores brand

## Plan de Solución Mínima

### Opción 1: Mover Gradiente al Layout de Ruta
1. **Crear wrapper en `app/coming-soon/layout.tsx`**:
   ```tsx
   <div className="min-h-screen bg-gradient-to-br from-violet-900/20 via-purple-900/10 to-cyan-900/20">
     {children}
   </div>
   ```

2. **Remover gradiente del hero**:
   - Eliminar líneas 228-235 en `ComingSoonHero.tsx`
   - Cambiar `min-h-[70vh]` a `min-h-screen`

### Opción 2: Aplicar Gradiente al Body (Recomendado)
1. **Modificar `app/coming-soon/layout.tsx`**:
   ```tsx
   <body className="min-h-screen bg-gradient-to-br from-violet-900/20 via-purple-900/10 to-cyan-900/20">
   ```

2. **Remover gradiente del hero** y mantener solo patrones

## Recomendación

**Opción 2** es preferible porque:
- Mantiene consistencia con el patrón de la aplicación
- Evita duplicación de estilos
- Permite que el gradiente cubra toda la página naturalmente
- Facilita mantenimiento futuro

## Archivos a Modificar

1. `app/coming-soon/layout.tsx` - Agregar wrapper con gradiente
2. `components/marketing/ComingSoonHero.tsx` - Remover gradiente del hero
3. `app/globals.css` - Opcional: agregar clase utility para el gradiente

## Impacto
- **Alto**: Soluciona el problema visual del corte de color
- **Bajo**: Cambios mínimos en estructura existente
- **Sin breaking changes**: Mantiene funcionalidad actual
