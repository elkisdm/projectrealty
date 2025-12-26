# Debug de Componentes Móviles

## Problema Reportado
Los componentes móviles no se muestran en iPhone 17 Pro Max y tablets.

## Cambios Realizados

### 1. Viewport Configurado
- ✅ Creado `app/viewport.ts` con configuración correcta para Next.js 14
- ✅ Viewport: `device-width`, `initialScale: 1`

### 2. Breakpoints Actualizados
- ✅ Cambiado de `md:` (768px) a `lg:` (1024px)
- ✅ Componentes móviles se muestran en pantallas < 1024px
- ✅ Componentes desktop se muestran en pantallas ≥ 1024px

### 3. Componentes Verificados
- ✅ `MobileSearchInput` - Con animaciones premium
- ✅ `MobileFilterPills` - Con scroll horizontal
- ✅ `MobileFilterSheet` - Bottom sheet tipo iOS
- ✅ `MobileResultsList` - Lista optimizada
- ✅ `MobileSearchBar` - Barra sticky
- ✅ `MobileEmptyState` - Estado vacío animado

## Cómo Verificar

### Paso 1: Limpiar Caché
```bash
# Limpiar caché del navegador en iPhone
# Safari: Configuración > Safari > Limpiar historial y datos

# O en desarrollo:
rm -rf .next
pnpm run dev
```

### Paso 2: Verificar en DevTools
1. Abrir Chrome DevTools (F12)
2. Activar modo responsive (Ctrl+Shift+M / Cmd+Shift+M)
3. Seleccionar "iPhone 15 Pro Max" o establecer ancho manual a 430px
4. Verificar que aparezcan los componentes móviles

### Paso 3: Verificar Breakpoints
Los componentes móviles deben aparecer cuando:
- Ancho de pantalla < 1024px
- En iPhone 17 Pro Max (430px portrait, 932px landscape)
- En tablets pequeñas/medianas (< 1024px)

### Paso 4: Inspeccionar HTML
En DevTools, buscar:
- `<div class="lg:hidden">` - Debe estar visible en móvil
- `<div class="hidden lg:block">` - Debe estar oculto en móvil
- Componentes `MobileSearchInput`, `MobileFilterPills`, etc.

## Posibles Problemas

### 1. Caché del Navegador
**Solución**: Limpiar caché y hard refresh (Cmd+Shift+R / Ctrl+Shift+R)

### 2. Tailwind CSS no está compilando
**Solución**: Verificar que Tailwind esté procesando las clases `lg:hidden` y `hidden lg:block`

### 3. JavaScript deshabilitado
**Solución**: Los componentes móviles requieren JavaScript (son client components)

### 4. Viewport incorrecto
**Solución**: Verificar que `app/viewport.ts` esté siendo usado por Next.js

## Comandos de Debug

```bash
# Verificar build
pnpm run build

# Desarrollo con hot reload
pnpm run dev

# Verificar clases Tailwind
# Buscar en el HTML generado las clases lg:hidden y hidden lg:block
```

## Verificación Manual

1. Abrir la página en iPhone 17 Pro Max
2. Verificar que los pills tengan scroll horizontal (no se envuelvan)
3. Verificar que el input tenga animaciones al hacer focus
4. Verificar que el bottom sheet se abra al hacer clic en "Filtros"
5. Verificar que la barra sticky aparezca al hacer scroll

## Si Sigue Sin Funcionar

1. Verificar que el servidor esté corriendo (`pnpm run dev`)
2. Verificar que no haya errores en la consola del navegador
3. Verificar que Tailwind esté compilando correctamente
4. Probar en modo incógnito para descartar extensiones
5. Verificar que el viewport meta tag esté presente en el HTML generado








