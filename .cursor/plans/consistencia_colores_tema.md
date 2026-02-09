# Plan: Consistencia de colores del tema

## Análisis de inconsistencias

### Problemas identificados

1. **Clases con sintaxis incorrecta en PriceBreakdown.tsx:**
   - `bg-gray-800:bg-gray-800` (línea 97) → debería ser `bg-gray-800 dark:bg-gray-800` o usar variables CSS
   - `text-white:text-white` (múltiples líneas) → debería ser `text-white` o usar variables
   - `text-gray-300:text-gray-400` (líneas 103, 111, 132, etc.) → debería ser `text-gray-300 dark:text-gray-400`
   - `border-gray-700:border-gray-700` (línea 97) → debería ser `border-gray-700 dark:border-gray-700`
   - `bg-gray-900:bg-gray-700` (líneas 124, 207) → debería ser `bg-gray-900 dark:bg-gray-700`
   - `bg-gray-800:bg-gray-600` (líneas 212, 217, 222, etc.) → debería ser `bg-gray-800 dark:bg-gray-600`
   - `border-gray-700:border-gray-600` (línea 186) → debería ser `border-gray-700 dark:border-gray-600`

2. **Colores hardcodeados que no respetan el tema:**
   - En `StickyCtaBar.tsx` línea 381: `bg-white` → debería usar `bg-[var(--card)]` o `bg-white dark:bg-gray-900`
   - En `StickyCtaBar.tsx` líneas 390, 417, 439: `text-gray-900` → debería usar `text-[var(--text)]` o `text-gray-900 dark:text-white`

---

## Plan de cambios

### Parte A: Corregir sintaxis incorrecta en PriceBreakdown.tsx

| Paso | Línea | Cambio |
|------|-------|--------|
| A1 | 97 | `bg-gray-800:bg-gray-800` → `bg-[var(--card)] dark:bg-gray-800` |
| A2 | 97 | `border-gray-700:border-gray-700` → `border-[var(--border)] dark:border-gray-700` |
| A3 | 100, 114, 125, 136, 145, 160, 176, 187, 188, 208, 214, 219, 224, 230, 238, 252 | `text-white:text-white` → `text-[var(--text)]` |
| A4 | 103, 111, 117, 132, 141, 150, 163, 215, 220, 225, 231, 239, 259, 266, 300, 304, 308 | `text-gray-300:text-gray-400` → `text-[var(--text-secondary)] dark:text-[var(--subtext)]` |
| A5 | 124, 207 | `bg-gray-900:bg-gray-700` → `bg-[var(--surface)] dark:bg-gray-700` |
| A6 | 186 | `border-gray-700:border-gray-600` → `border-[var(--border)] dark:border-gray-600` |
| A7 | 212, 217, 222, 229, 235 | `bg-gray-800:bg-gray-600` → `bg-[var(--soft)] dark:bg-gray-600` |

### Parte B: Reemplazar colores hardcodeados por variables del tema

| Paso | Archivo | Línea | Cambio |
|------|---------|-------|--------|
| B1 | StickyCtaBar.tsx | 381 | `bg-white` → `bg-[var(--card)]` |
| B2 | StickyCtaBar.tsx | 390, 417, 439 | `text-gray-900` → `text-[var(--text)]` |

---

## Estrategia de reemplazo

**Para fondos:**
- Contenedores principales → `bg-[var(--card)]`
- Superficies secundarias → `bg-[var(--surface)]` o `bg-[var(--soft)]`
- Fondos de página → `bg-[var(--bg)]`

**Para texto:**
- Texto principal → `text-[var(--text)]`
- Texto secundario → `text-[var(--text-secondary)]`
- Texto muted → `text-[var(--subtext)]`

**Para bordes:**
- Bordes principales → `border-[var(--border)]`
- Bordes secundarios → `border-[var(--border-secondary)]`

---

## Resumen de archivos

| Archivo | Cambios principales |
|---------|---------------------|
| `components/property/PriceBreakdown.tsx` | Corregir sintaxis incorrecta de clases (A1-A7) |
| `components/ui/StickyCtaBar.tsx` | Reemplazar `bg-white` y `text-gray-900` por variables del tema (B1-B2) |

---

## Verificación

- Tras los cambios, cargar una página de propiedad en modo dark: todos los elementos deben usar colores consistentes del tema dark, sin bloques blancos o grises claros que destaquen.
- En modo light: los elementos deben mantener colores claros consistentes.
- No debe haber clases con sintaxis `:` duplicada (ej: `bg-gray-800:bg-gray-800`).

## Riesgos y rollback

- Riesgo bajo: solo cambios de clases CSS, sin lógica.
- Rollback: revertir cambios en `PriceBreakdown.tsx` y `StickyCtaBar.tsx`.
