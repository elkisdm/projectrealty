import { useRef, useState, useCallback } from 'react';
import { useDrag } from '@use-gesture/react';

export interface UseSwipeGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number; // Distancia mínima en px para considerar swipe
  velocityThreshold?: number; // Velocidad mínima para considerar swipe rápido
  preventScroll?: boolean; // Prevenir scroll durante swipe horizontal
  disabled?: boolean;
}

export interface UseSwipeGestureReturn {
  bind: ReturnType<typeof useDrag>;
  isDragging: boolean;
  offset: number;
}

/**
 * Hook personalizado para detectar gestos de swipe horizontal
 * Usa react-use-gesture para gestos fluidos y naturales
 */
export function useSwipeGesture({
  onSwipeLeft,
  onSwipeRight,
  threshold = 50,
  velocityThreshold = 0.5,
  preventScroll = true,
  disabled = false,
}: UseSwipeGestureOptions = {}): UseSwipeGestureReturn {
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState(0);
  const startX = useRef<number>(0);
  const lastDirection = useRef<'left' | 'right' | null>(null);

  const bind = useDrag(
    (state) => {
      if (disabled) return;

      const {
        movement: [mx],
        velocity: [vx],
        direction: [dx],
        first,
        last,
        active,
      } = state;

      if (first) {
        setIsDragging(true);
        startX.current = mx;
        lastDirection.current = null;
        setOffset(0);
      }

      if (active) {
        setOffset(mx);
        // Determinar dirección basada en movimiento
        if (Math.abs(mx) > 10) {
          lastDirection.current = mx > 0 ? 'right' : 'left';
        }
      }

      if (last) {
        setIsDragging(false);
        const distance = Math.abs(mx);
        const velocity = Math.abs(vx);

        // Determinar si es un swipe válido
        const isValidSwipe =
          distance >= threshold || (velocity >= velocityThreshold && distance > 20);

        if (isValidSwipe && lastDirection.current) {
          if (lastDirection.current === 'left' && onSwipeLeft) {
            onSwipeLeft();
          } else if (lastDirection.current === 'right' && onSwipeRight) {
            onSwipeRight();
          }
        }

        // Reset después de un breve delay para animación
        setTimeout(() => {
          setOffset(0);
          lastDirection.current = null;
        }, 100);
      }
    },
    {
      axis: 'x', // Solo movimiento horizontal
      filterTaps: true, // Filtrar taps simples
      preventScroll: preventScroll, // Prevenir scroll durante drag horizontal
      threshold: 5, // Threshold mínimo para iniciar drag
    }
  );

  return {
    bind,
    isDragging,
    offset,
  };
}






