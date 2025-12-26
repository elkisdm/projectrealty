import { useRef, useCallback, useState, useEffect } from 'react';

export interface UseLongPressOptions {
  onLongPress: (event: TouchEvent | MouseEvent) => void;
  delay?: number; // Delay en ms antes de activar (default: 500)
  threshold?: number; // Distancia máxima en px que puede moverse (default: 10)
  enableHapticFeedback?: boolean; // Feedback táctil cuando esté disponible
  disabled?: boolean;
}

export interface UseLongPressReturn {
  handlers: {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: (e: React.TouchEvent) => void;
    onMouseDown: (e: React.MouseEvent) => void;
    onMouseMove: (e: React.MouseEvent) => void;
    onMouseUp: (e: React.MouseEvent) => void;
    onMouseLeave: (e: React.MouseEvent) => void;
  };
  isPressing: boolean;
}

/**
 * Hook para detectar long press (presión prolongada)
 * Soporta tanto touch como mouse events
 */
export function useLongPress({
  onLongPress,
  delay = 500,
  threshold = 10,
  enableHapticFeedback = true,
  disabled = false,
}: UseLongPressOptions): UseLongPressReturn {
  const [isPressing, setIsPressing] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startPositionRef = useRef<{ x: number; y: number } | null>(null);
  const hasMovedRef = useRef(false);

  // Feedback táctil (vibración)
  const triggerHapticFeedback = useCallback(() => {
    if (!enableHapticFeedback || typeof navigator === 'undefined') return;
    
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(50); // Vibración corta de 50ms
      } catch {
        // Ignorar errores si no está disponible
      }
    }
  }, [enableHapticFeedback]);

  const startPress = useCallback(
    (event: TouchEvent | MouseEvent, clientX: number, clientY: number) => {
      if (disabled) return;

      startPositionRef.current = { x: clientX, y: clientY };
      hasMovedRef.current = false;
      setIsPressing(true);

      timeoutRef.current = setTimeout(() => {
        if (!hasMovedRef.current && startPositionRef.current) {
          triggerHapticFeedback();
          onLongPress(event);
        }
      }, delay);
    },
    [onLongPress, delay, disabled, triggerHapticFeedback]
  );

  const cancelPress = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsPressing(false);
    startPositionRef.current = null;
    hasMovedRef.current = false;
  }, []);

  const checkMovement = useCallback(
    (clientX: number, clientY: number) => {
      if (!startPositionRef.current) return;

      const dx = Math.abs(clientX - startPositionRef.current.x);
      const dy = Math.abs(clientY - startPositionRef.current.y);
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > threshold) {
        hasMovedRef.current = true;
        cancelPress();
      }
    },
    [threshold, cancelPress]
  );

  // Touch handlers
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      startPress(e.nativeEvent, touch.clientX, touch.clientY);
    },
    [startPress]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      checkMovement(touch.clientX, touch.clientY);
    },
    [checkMovement]
  );

  const handleTouchEnd = useCallback(() => {
    cancelPress();
  }, [cancelPress]);

  // Mouse handlers (para desktop/testing)
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Solo procesar botón izquierdo
      if (e.button !== 0) return;
      startPress(e.nativeEvent, e.clientX, e.clientY);
    },
    [startPress]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      checkMovement(e.clientX, e.clientY);
    },
    [checkMovement]
  );

  const handleMouseUp = useCallback(() => {
    cancelPress();
  }, [cancelPress]);

  const handleMouseLeave = useCallback(() => {
    cancelPress();
  }, [cancelPress]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onMouseLeave: handleMouseLeave,
    },
    isPressing,
  };
}

