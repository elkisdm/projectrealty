# Ejemplo de Uso: BaseModal

Este documento muestra cómo usar `BaseModal` para crear modales correctamente.

## Uso Básico

```typescript
"use client";

import { BaseModal } from "@/components/ui/BaseModal";
import { useState } from "react";

export function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Abrir Modal</button>
      
      <BaseModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Título del Modal"
        description="Descripción del modal para accesibilidad"
      >
        <div className="space-y-4">
          <p>Contenido del modal aquí</p>
          <button onClick={() => setIsOpen(false)}>Cerrar</button>
        </div>
      </BaseModal>
    </>
  );
}
```

## Ejemplo Completo: Modal de Confirmación

```typescript
"use client";

import { BaseModal } from "@/components/ui/BaseModal";
import { X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}: ConfirmModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={message}
      panelClassName="max-w-md"
    >
      <div className="space-y-6">
        {/* Header personalizado */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-text">{title}</h2>
            <p className="mt-2 text-sm text-subtext">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5 text-text" />
          </button>
        </div>

        {/* Contenido */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-text transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 rounded-xl bg-brand-violet hover:bg-brand-violet/90 text-white transition-colors"
          >
            Confirmar
          </button>
        </div>
      </div>
    </BaseModal>
  );
}
```

## Ejemplo: Modal con Contenido Scrollable

```typescript
"use client";

import { BaseModal } from "@/components/ui/BaseModal";

export function ScrollableModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Lista de Items"
      panelClassName="max-w-2xl"
    >
      <div className="flex flex-col h-full">
        {/* Header fijo */}
        <div className="flex-shrink-0 pb-4 border-b border-white/10">
          <h2 className="text-xl font-bold text-text">Items</h2>
        </div>

        {/* Contenido scrollable */}
        <div className="flex-1 overflow-y-auto mt-4 space-y-2">
          {Array.from({ length: 50 }).map((_, i) => (
            <div key={i} className="p-3 bg-white/5 rounded-xl">
              Item {i + 1}
            </div>
          ))}
        </div>

        {/* Footer fijo */}
        <div className="flex-shrink-0 pt-4 border-t border-white/10 mt-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 rounded-xl bg-brand-violet text-white"
          >
            Cerrar
          </button>
        </div>
      </div>
    </BaseModal>
  );
}
```

## Personalización Avanzada

```typescript
"use client";

import { BaseModal } from "@/components/ui/BaseModal";
import { type Variants } from "framer-motion";

// Variantes de animación personalizadas
const customOverlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const customPanelVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8, y: 50 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { 
      type: "spring",
      stiffness: 300,
      damping: 30
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.8, 
    y: 50,
    transition: { duration: 0.2 }
  },
};

export function CustomAnimatedModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Modal Personalizado"
      overlayVariants={customOverlayVariants}
      panelVariants={customPanelVariants}
      zIndex={10000}
      closeOnOverlayClick={true}
      closeOnEscape={true}
      lockBodyScroll={true}
      panelClassName="max-w-lg"
    >
      <div className="space-y-4">
        <p>Este modal tiene animaciones personalizadas</p>
        <button onClick={onClose}>Cerrar</button>
      </div>
    </BaseModal>
  );
}
```

## Props Disponibles

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `isOpen` | `boolean` | - | Controla si el modal está abierto |
| `onClose` | `() => void` | - | Función que se llama al cerrar el modal |
| `children` | `ReactNode` | - | Contenido del modal |
| `title` | `string?` | - | Título para accesibilidad (opcional) |
| `description` | `string?` | - | Descripción para accesibilidad (opcional) |
| `className` | `string?` | `""` | Clase CSS adicional para el contenedor |
| `panelClassName` | `string?` | `""` | Clase CSS adicional para el panel |
| `zIndex` | `number?` | `9999` | Z-index del modal |
| `closeOnOverlayClick` | `boolean?` | `true` | Si el overlay cierra el modal |
| `closeOnEscape` | `boolean?` | `true` | Si Escape cierra el modal |
| `lockBodyScroll` | `boolean?` | `true` | Si bloquea el scroll del body |
| `overlayVariants` | `Variants?` | - | Variantes de animación del overlay |
| `panelVariants` | `Variants?` | - | Variantes de animación del panel |

## Ventajas de BaseModal

✅ **Patrón correcto garantizado**: Usa el patrón correcto de AnimatePresence + Portal  
✅ **Accesibilidad**: Focus trap, ARIA labels, manejo de teclado  
✅ **Animaciones**: Respeta prefers-reduced-motion automáticamente  
✅ **Scroll lock**: Bloquea el scroll del body cuando está abierto  
✅ **Reutilizable**: Fácil de usar y personalizar  
✅ **Type-safe**: Completamente tipado con TypeScript  

## Migración desde Modal Personalizado

Si tienes un modal personalizado, puedes migrarlo fácilmente:

```typescript
// Antes
function MyModal({ isOpen, onClose }) {
  return createPortal(
    <AnimatePresence>
      {isOpen && <motion.div>...</motion.div>}
    </AnimatePresence>,
    document.body
  );
}

// Después
function MyModal({ isOpen, onClose }) {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Mi Modal">
      {/* Tu contenido aquí */}
    </BaseModal>
  );
}
```



