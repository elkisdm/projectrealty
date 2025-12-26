# Patrón Correcto para Modales con Framer Motion

## ⚠️ Problema Común

Un error frecuente al crear modales con `AnimatePresence` y `createPortal` es colocar el portal dentro de la condición `{isOpen &&}`, lo que impide que las animaciones funcionen correctamente.

## ❌ Patrón INCORRECTO

```typescript
// ❌ INCORRECTO - El portal se crea/elimina, no se anima
return (
  <AnimatePresence>
    {isOpen &&
      typeof document !== "undefined" &&
      createPortal(
        <motion.div>
          {/* contenido del modal */}
        </motion.div>,
        document.body
      )}
  </AnimatePresence>
);
```

**Problemas:**
- El portal se crea/elimina del DOM en lugar de animarse
- `AnimatePresence` no puede detectar el montaje/desmontaje
- Las animaciones de entrada/salida no funcionan

## ✅ Patrón CORRECTO

```typescript
// ✅ CORRECTO - El portal permanece, el contenido se anima
if (typeof document === "undefined") return null;

return createPortal(
  <AnimatePresence mode="wait">
    {isOpen && (
      <motion.div key="modal-unique-key">
        {/* contenido del modal */}
      </motion.div>
    )}
  </AnimatePresence>,
  document.body
);
```

**Por qué funciona:**
- El portal se crea una vez y permanece montado
- `AnimatePresence` envuelve directamente el componente que se anima
- La condición `{isOpen &&}` está dentro de `AnimatePresence`
- La `key` única ayuda a `AnimatePresence` a rastrear el componente

## 📋 Reglas de Oro

1. **Portal primero**: `createPortal()` debe ser la función externa
2. **AnimatePresence dentro**: `AnimatePresence` debe estar dentro del portal
3. **Condición dentro**: `{isOpen &&}` debe estar dentro de `AnimatePresence`
4. **Key única**: El `motion.div` debe tener una `key` única
5. **Check de document**: Verificar `typeof document !== "undefined"` antes del return

## 🎯 Uso del BaseModal

Para evitar este problema, usa el componente `BaseModal`:

```typescript
import { BaseModal } from "@/components/ui/BaseModal";

function MyModal({ isOpen, onClose }) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Título del Modal"
      description="Descripción del modal"
    >
      {/* Tu contenido aquí */}
    </BaseModal>
  );
}
```

## 🔍 Ejemplo Completo

```typescript
"use client";

import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

function MyCustomModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const shouldReduceMotion = useReducedMotion();

  // 1. Verificar document
  if (typeof document === "undefined") return null;

  // 2. Variantes de animación
  const overlayVariants = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      };

  const panelVariants = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 20, scale: 0.95 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 20, scale: 0.95 },
      };

  // 3. Portal primero, AnimatePresence dentro, condición dentro
  return createPortal(
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          key="my-modal"
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ position: "fixed", zIndex: 9999 }}
          {...overlayVariants}
          onClick={onClose}
        >
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            style={{ position: "fixed", zIndex: 9998 }}
            {...overlayVariants}
          />

          {/* Panel */}
          <motion.div
            className="relative z-[9999] bg-card rounded-2xl p-6"
            style={{ position: "relative", zIndex: 9999 }}
            {...panelVariants}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Contenido */}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
```

## 🧪 Checklist para Nuevos Modales

- [ ] El `createPortal` está en el return principal
- [ ] `AnimatePresence` está dentro del portal
- [ ] La condición `{isOpen &&}` está dentro de `AnimatePresence`
- [ ] El `motion.div` tiene una `key` única
- [ ] Se verifica `typeof document !== "undefined"` antes del return
- [ ] Se respeta `prefers-reduced-motion`
- [ ] Se bloquea el scroll del body cuando está abierto
- [ ] Se maneja la tecla Escape
- [ ] Se implementa focus trap
- [ ] Se usan estilos inline para z-index como respaldo

## 📚 Referencias

- [Framer Motion AnimatePresence](https://www.framer.com/motion/animate-presence/)
- [React Portal](https://react.dev/reference/react-dom/createPortal)
- [BaseModal Component](../../components/ui/BaseModal.tsx)



