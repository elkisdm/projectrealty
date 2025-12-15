"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface RotatingCommunesProps {
  communes: string[];
  interval?: number; // default 2500ms
}

/**
 * Componente RotatingCommunes Optimizado
 * Animación tipo "Slot Machine" con Motion Blur y Gradiente
 */
export function RotatingCommunes({
  communes,
  interval = 2000,
}: RotatingCommunesProps) {
  const prefersReducedMotion = useReducedMotion();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Memoizar comunas válidas
  const validCommunes = useMemo(() => {
    if (!communes || communes.length === 0) {
      return ["Santiago"];
    }
    return Array.from(new Set(communes.filter((c) => c && c.trim())));
  }, [communes]);

  // Memoizar la longitud para evitar re-renders innecesarios
  const validCommunesLength = validCommunes.length;

  // Rotación automática
  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/bf5372fb-b70d-4713-b992-51094d7d9401',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'RotatingCommunes.tsx:35',message:'useEffect ENTRY',data:{prefersReducedMotion,isPaused,validCommunesLength,interval},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'F'})}).catch(()=>{});
    // #endregion
    if (prefersReducedMotion || isPaused || validCommunesLength <= 1) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/bf5372fb-b70d-4713-b992-51094d7d9401',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'RotatingCommunes.tsx:37',message:'useEffect EARLY RETURN',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'F'})}).catch(()=>{});
      // #endregion
      return;
    }

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/bf5372fb-b70d-4713-b992-51094d7d9401',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'RotatingCommunes.tsx:42',message:'setInterval BEFORE',data:{validCommunesLength},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'F'})}).catch(()=>{});
    // #endregion
    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/bf5372fb-b70d-4713-b992-51094d7d9401',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'RotatingCommunes.tsx:47',message:'setCurrentIndex CALL',data:{prev,validCommunesLength},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'F'})}).catch(()=>{});
        // #endregion
        return (prev + 1) % validCommunesLength;
      });
    }, interval);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/bf5372fb-b70d-4713-b992-51094d7d9401',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'RotatingCommunes.tsx:52',message:'setInterval AFTER',data:{timerId:typeof timer},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'F'})}).catch(()=>{});
    // #endregion

    return () => {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/bf5372fb-b70d-4713-b992-51094d7d9401',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'RotatingCommunes.tsx:55',message:'CLEANUP clearInterval',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'F'})}).catch(()=>{});
      // #endregion
      clearInterval(timer);
    };
  }, [interval, validCommunesLength, prefersReducedMotion, isPaused]);

  // Variantes de animación "Slot Machine" Pro
  const variants = {
    enter: {
      y: 20,
      opacity: 0,
      filter: "blur(4px)",
      scale: 0.95,
      rotateX: 10
    },
    center: {
      zIndex: 1,
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      scale: 1,
      rotateX: 0
    },
    exit: {
      zIndex: 0,
      y: -20,
      opacity: 0,
      filter: "blur(4px)",
      scale: 0.95,
      rotateX: -10
    }
  };

  const transition = prefersReducedMotion
    ? { duration: 0 }
    : {
      y: { type: "spring", stiffness: 400, damping: 30 }, // Snappier spring
      opacity: { duration: 0.2 },
      filter: { duration: 0.2 },
      scale: { duration: 0.2 }
    };

  const currentCommune = validCommunes[currentIndex] || "Santiago";

  return (
    <span
      className="inline-grid grid-cols-1 grid-rows-1 h-[1.1em] min-w-[200px] sm:min-w-[400px] lg:min-w-[450px] items-center justify-items-start overflow-hidden align-text-bottom text-left"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      aria-live="polite"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={currentCommune}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={transition}
          className="col-start-1 row-start-1 whitespace-nowrap bg-gradient-to-r from-primary via-indigo-500 to-secondary bg-clip-text text-transparent font-extrabold tracking-tight"
          style={{ lineHeight: 1.1 }}
        >
          {currentCommune}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

