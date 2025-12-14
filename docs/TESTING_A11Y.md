# 🎯 Guía de Testing de Accesibilidad (A11y)

Este documento describe cómo verificar la accesibilidad de la aplicación según estándares WCAG 2.1.

## 📋 Tests Automatizados

### Ejecutar Tests de A11y

```bash
# Ejecutar todos los tests de a11y
pnpm run test tests/a11y

# Ejecutar tests de a11y en modo watch
pnpm run test:watch tests/a11y
```

### Qué Verifican los Tests Automatizados

Los tests en `tests/a11y/pages.test.tsx` verifican:

- **Violaciones automáticas detectadas por axe-core:**
  - Elementos sin labels
  - Contraste insuficiente (básico)
  - ARIA attributes incorrectos
  - Estructura semántica incorrecta
  - Elementos interactivos sin accesibilidad

- **Navegación por teclado:**
  - Elementos con `tabindex` apropiado
  - Orden lógico de focus

- **Labels y textos descriptivos:**
  - Labels en formularios
  - `aria-label` en elementos complejos
  - Textos descriptivos en links y botones

## 🔍 Verificaciones Manuales

### Checklist de A11y - Antes de cada Release

#### 1. Navegación por Teclado

- [ ] **Tab Navigation:** Navegar solo con `Tab` a través de toda la página
  - El orden debe ser lógico (de arriba a abajo, izquierda a derecha)
  - El focus debe ser visible (outline o ring visible)
  - No debe haber "trampas" de focus (elementos que atrapan el Tab)

- [ ] **Enter/Space:** Todos los elementos interactivos deben activarse con Enter o Space
  - Botones: Enter y Space
  - Links: Enter
  - Checkboxes/Radios: Space

- [ ] **Escape:** Los modales y dropdowns deben cerrarse con Escape

- [ ] **Arrow Keys:** En componentes complejos (calendarios, tabs), las flechas deben funcionar

#### 2. Screen Reader (Lectores de Pantalla)

**Con VoiceOver (Mac) o NVDA (Windows):**

- [ ] Abrir página en navegador
- [ ] Activar VoiceOver (Cmd+F5) o NVDA
- [ ] Navegar con VO+Arrow Keys (VoiceOver) o Arrow Keys (NVDA)
- [ ] Verificar que:
  - Todos los elementos se anuncian correctamente
  - Los botones dicen "botón [texto]" o "button [text]"
  - Los links dicen "link [texto]" o "link [text]"
  - Los formularios tienen labels anunciados
  - Las imágenes tienen `alt` text descriptivo
  - Los elementos decorativos tienen `aria-hidden="true"`

#### 3. Contraste de Colores

**Usar herramienta:** [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

- [ ] **Texto normal:** Contraste mínimo 4.5:1 (WCAG AA)
- [ ] **Texto grande (18pt+):** Contraste mínimo 3:1 (WCAG AA)
- [ ] **Elementos interactivos:** Contraste suficiente para ser distinguibles
- [ ] **Estados de focus:** El outline/ring del focus debe tener contraste suficiente

**Elementos a verificar:**
- Texto principal sobre fondo
- Texto secundario sobre fondo
- Links sobre fondo
- Botones (texto sobre color de fondo)
- Bordes de campos de formulario
- Mensajes de error y éxito

#### 4. Estructura Semántica

- [ ] **Headings jerárquicos:** H1 → H2 → H3 (sin saltar niveles)
- [ ] **Landmarks:** Uso correcto de `<main>`, `<nav>`, `<header>`, `<footer>`, `<aside>`
- [ ] **Listas:** Usar `<ul>`, `<ol>` para listas reales
- [ ] **Formularios:** Agrupar campos relacionados con `<fieldset>` y `<legend>`

#### 5. ARIA Labels y Roles

- [ ] **Elementos complejos:** Usar `aria-label` descriptivo
  - Botones de iconos sin texto
  - Links con solo iconos
  - Elementos interactivos complejos

- [ ] **Estados dinámicos:** Usar `aria-live` para contenido que cambia
  - Mensajes de éxito/error
  - Contadores que se actualizan
  - Resultados de búsqueda

- [ ] **Elementos interactivos:** Usar roles apropiados
  - `role="button"` para elementos clickeables que no son botones nativos
  - `role="dialog"` para modales
  - `role="tablist"`, `role="tab"`, `role="tabpanel"` para tabs

#### 6. Imágenes y Multimedia

- [ ] **Todas las imágenes tienen `alt` text:**
  - Imágenes informativas: `alt` descriptivo
  - Imágenes decorativas: `alt=""` o `aria-hidden="true"`
  - Imágenes funcionales (iconos): `alt` descriptivo o `aria-label`

- [ ] **Videos (si aplica):** Subtítulos y transcripciones disponibles

#### 7. Animaciones y Motion

- [ ] **prefers-reduced-motion:** Verificar que las animaciones respetan la preferencia
  - En Chrome DevTools → Rendering → Emulate CSS media feature `prefers-reduced-motion`
  - Las animaciones deben ser mínimas o deshabilitadas

#### 8. Formularios

- [ ] **Labels:** Todos los campos tienen `<label for="id">` o `aria-label`
- [ ] **Mensajes de error:** Descriptivos y asociados al campo (`aria-describedby`)
- [ ] **Estados:** Campos con errores deben tener `aria-invalid="true"`
- [ ] **Grupos:** Campos relacionados agrupados con `<fieldset>` y `<legend>`

## 🛠️ Herramientas Recomendadas

### Automatizadas

1. **axe DevTools (Browser Extension)**
   - Chrome/Edge: [axe DevTools](https://chrome.google.com/webstore/detail/axe-devtools-web-accessib/lhdoppojpmngadmnindnejefpokejbdd)
   - Firefox: Disponible también
   - Uso: Abrir página → Click en icono → Ver violaciones

2. **WAVE (Web Accessibility Evaluation Tool)**
   - Browser extension o sitio web
   - Muestra problemas visualmente en la página

3. **Lighthouse (Chrome DevTools)**
   - Abrir DevTools → Lighthouse → Accessibility
   - Genera reporte de accesibilidad

### Manuales

1. **Screen Readers:**
   - **Mac:** VoiceOver (Cmd+F5)
   - **Windows:** NVDA (gratis) o JAWS (pago)
   - **iOS:** VoiceOver (Settings → Accessibility)
   - **Android:** TalkBack

2. **Contraste:**
   - [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
   - [Contrast Ratio](https://contrast-ratio.com/)

3. **Keyboard Navigation:**
   - Navegar solo con teclado (Tab, Enter, Space, Arrow keys, Escape)

## 📝 Proceso de QA A11y

### Antes de cada Release

1. **Ejecutar tests automatizados:**
   ```bash
   pnpm run test tests/a11y
   ```

2. **Ejecutar axe DevTools en:**
   - Home page (`/`)
   - Search page (`/buscar`)
   - Property page (`/property/[slug]`)

3. **Verificar manualmente:**
   - Navegación por teclado en las 3 páginas principales
   - Contraste de colores (mínimo 3 elementos críticos por página)
   - Screen reader (VoiceOver/NVDA) en al menos 1 página completa

4. **Documentar issues encontrados:**
   - Crear issues con etiqueta `a11y`
   - Priorizar según severidad (WCAG level: A, AA, AAA)

## 🎯 Objetivos WCAG

- **Nivel A (Mínimo):** ✅ Cumplido
- **Nivel AA (Objetivo):** 🎯 En progreso
- **Nivel AAA (Ideal):** 🔮 Futuro

## 📚 Recursos

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Resources](https://webaim.org/resources/)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)
- [MDN Accessibility Guide](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

---

**⚠️ Nota:** La accesibilidad es un proceso continuo. Los tests automatizados detectan ~30-40% de los problemas. Las verificaciones manuales son críticas.


