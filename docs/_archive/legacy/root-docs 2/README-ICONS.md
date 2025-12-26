# 🎨 Librería de Íconos - Hommie

Sistema completo de gestión de íconos para la aplicación Hommie, optimizado para Next.js 14 y TypeScript estricto.

## 📋 Índice

### 1. 🎯 Tokens
- **Tamaños**: xs (12px), sm (16px), md (20px), lg (24px), xl (32px), 2xl (48px)
- **Colores**: primary, secondary, accent, muted, destructive, success
- **Estados**: default, hover, active, disabled, loading
- **Variantes**: outline, filled, duotone, gradient

### 2. 🛠️ Presets
- **Navegación**: menu, close, back, forward, home, search
- **Acciones**: edit, delete, save, share, download, upload
- **Comunicación**: phone, email, chat, notification, message
- **Estados**: check, error, warning, info, success
- **Social**: facebook, instagram, twitter, linkedin, whatsapp

### 3. 🔧 Generator
- **SVG → React**: Conversión automática con optimización
- **Batch Processing**: Procesamiento en lotes para múltiples íconos
- **Customization**: Personalización de props y estilos
- **TypeScript**: Generación automática de tipos

### 4. 💻 CLI
```bash
# Generar ícono individual
pnpm icon:generate --input=./source/icon.svg --output=./components/icons/

# Procesar directorio completo
pnpm icon:generate --dir=./source/icons/ --preset=outline

# Optimizar íconos existentes
pnpm icon:optimize --dir=./public/icons/

# Build completo
pnpm icon:build
```

### 5. 🎨 Creator UI
- **Editor Visual**: Interfaz para crear/editar íconos
- **Preview Real-time**: Vista previa en tiempo real
- **Export Options**: Múltiples formatos de exportación
- **Collaboration**: Sistema de versionado y colaboración

### 6. ✅ QA
- **Linting**: Validación de SVGs y componentes
- **Testing**: Tests unitarios y de integración
- **Performance**: Auditoría de rendimiento
- **Accessibility**: Validación de a11y
- **Bundle Analysis**: Análisis de tamaño de bundle

## 🏗️ Arquitectura

```
scripts/icon-gen/     # Generadores y herramientas CLI
├── svg-to-react.ts   # Conversor SVG → React
├── optimizer.ts      # Optimización de SVGs
├── tokenizer.ts      # Sistema de tokens
└── cli.ts           # Interfaz de línea de comandos

lib/icons/           # Lógica de procesamiento
├── tokens.ts        # Definición de tokens
├── presets.ts       # Presets predefinidos
├── types.ts         # Tipos TypeScript
└── utils.ts         # Utilidades

components/icons/    # Componentes React
├── IconProvider.tsx # Contexto de íconos
├── IconWrapper.tsx  # Wrapper base
├── IconSet.tsx      # Conjunto de íconos
└── index.ts         # Exportaciones

public/icons/        # Íconos estáticos
├── navigation/      # Íconos de navegación
├── actions/         # Íconos de acciones
├── states/          # Íconos de estados
└── social/          # Íconos sociales
```

## 🚀 Uso Básico

```tsx
import { Icon } from '@/components/icons';

// Uso simple
<Icon name="home" size="md" />

// Con variantes
<Icon name="arrow-right" variant="outline" color="primary" />

// Con estados
<Icon name="check" state="success" size="lg" />
```

## 📊 Métricas

- **Tiempo de carga**: < 50ms para íconos críticos
- **Bundle size**: < 10KB para conjunto básico
- **Lighthouse**: 100/100 en Performance
- **Accessibility**: WCAG 2.1 AA compliant

## 🔄 Workflow

1. **Diseño**: Crear SVG en Figma/Sketch
2. **Optimización**: Procesar con `icon:optimize`
3. **Generación**: Convertir a React con `icon:generate`
4. **Testing**: Validar con tests automatizados
5. **Deploy**: Integrar en build de producción

---

*Documentación generada automáticamente - Última actualización: $(date)*
