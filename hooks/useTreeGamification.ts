"use client";

import { useState, useEffect, useCallback } from "react";

interface GamificationData {
  firstVisit: string; // ISO date
  visitCount: number;
  lastVisit: string; // ISO date
  consecutiveDays: number;
  clickedFlows: string[]; // 'rent', 'buy', etc.
}

const STORAGE_KEY = "tree_gamification";

const DEFAULT_DATA: GamificationData = {
  firstVisit: new Date().toISOString(),
  visitCount: 0,
  lastVisit: new Date().toISOString(),
  consecutiveDays: 0,
  clickedFlows: [],
};

export type BadgeType = 
  | "first_visit" 
  | "frequent_visitor" 
  | "consecutive_days" 
  | "explorer"
  | null;

interface BadgeInfo {
  type: BadgeType;
  label: string;
  description?: string;
}

export function useTreeGamification() {
  const [data, setData] = useState<GamificationData | null>(null);
  const [currentBadge, setCurrentBadge] = useState<BadgeInfo | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Cargar datos desde localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as GamificationData;
        // Validar estructura
        if (
          parsed.firstVisit &&
          typeof parsed.visitCount === 'number' &&
          parsed.lastVisit &&
          typeof parsed.consecutiveDays === 'number' &&
          Array.isArray(parsed.clickedFlows)
        ) {
          setData(parsed);
        } else {
          setData(DEFAULT_DATA);
        }
      } else {
        setData(DEFAULT_DATA);
      }
    } catch (error) {
      console.error('Error loading gamification data:', error);
      setData(DEFAULT_DATA);
    }
    setIsHydrated(true);
  }, []);

  // Guardar datos en localStorage
  const saveData = useCallback((newData: GamificationData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
      setData(newData);
    } catch (error) {
      console.error('Error saving gamification data:', error);
      // No romper la app si localStorage falla
    }
  }, []);

  // Registrar visita
  const recordVisit = useCallback(() => {
    if (!isHydrated || !data) return;

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const lastVisitDate = new Date(data.lastVisit).toISOString().split('T')[0];

    let newConsecutiveDays = data.consecutiveDays;
    
    // Calcular días consecutivos
    if (today === lastVisitDate) {
      // Misma visita hoy, no incrementar
      newConsecutiveDays = data.consecutiveDays;
    } else {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      if (lastVisitDate === yesterdayStr) {
        // Visita consecutiva
        newConsecutiveDays = data.consecutiveDays + 1;
      } else {
        // Rompió la racha
        newConsecutiveDays = 1;
      }
    }

    const newData: GamificationData = {
      ...data,
      visitCount: data.visitCount + 1,
      lastVisit: now.toISOString(),
      consecutiveDays: newConsecutiveDays,
    };

    saveData(newData);
  }, [data, isHydrated, saveData]);

  // Registrar click en flow
  const recordFlowClick = useCallback((flow: "rent" | "buy" | "rent-property" | "sell-property") => {
    if (!isHydrated || !data) return;

    const newClickedFlows = [...new Set([...data.clickedFlows, flow])];
    const newData: GamificationData = {
      ...data,
      clickedFlows: newClickedFlows,
    };

    saveData(newData);
  }, [data, isHydrated, saveData]);

  // Calcular badge actual
  useEffect(() => {
    if (!isHydrated || !data) return;

    let badge: BadgeInfo | null = null;

    // Badge: Primera visita
    if (data.visitCount === 1) {
      badge = {
        type: "first_visit",
        label: "Primera visita",
        description: "¡Bienvenido!",
      };
    }
    // Badge: Visitante frecuente (5+ visitas)
    else if (data.visitCount >= 5 && data.visitCount < 10) {
      badge = {
        type: "frequent_visitor",
        label: "Visitante frecuente",
        description: `${data.visitCount} visitas`,
      };
    }
    // Badge: Días consecutivos (3+ días)
    else if (data.consecutiveDays >= 3) {
      badge = {
        type: "consecutive_days",
        label: `Día ${data.consecutiveDays} consecutivo`,
        description: "¡Sigue así!",
      };
    }
    // Badge: Explorador (clickeó todas las opciones)
    else if (data.clickedFlows.length >= 4) {
      badge = {
        type: "explorer",
        label: "Explorador",
        description: "Has explorado todas las opciones",
      };
    }

    setCurrentBadge(badge);
  }, [data, isHydrated]);

  return {
    data,
    currentBadge,
    isHydrated,
    recordVisit,
    recordFlowClick,
  };
}
