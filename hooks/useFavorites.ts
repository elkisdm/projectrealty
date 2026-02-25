'use client';

import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'hommie_favorites';

/**
 * Hook to manage favorites with localStorage persistence
 * Future: can be extended to sync with API when user is logged in
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setFavorites(new Set(parsed));
        }
      }
    } catch (error) {
      console.warn('Error loading favorites from localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(favorites)));
      } catch (error) {
        console.warn('Error saving favorites to localStorage:', error);
      }
    }
  }, [favorites, isLoading]);

  /**
   * Check if a unit is favorited
   */
  const isFavorited = useCallback((unitId: string): boolean => {
    return favorites.has(unitId);
  }, [favorites]);

  /**
   * Add a unit to favorites (optimistic update)
   */
  const addFavorite = useCallback((unitId: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      next.add(unitId);
      return next;
    });
    
    // TODO: Sync with API when user is logged in
    // try {
    //   await api.addFavorite(unitId);
    // } catch (error) {
    //   // Revert on error
    //   setFavorites(prev => {
    //     const next = new Set(prev);
    //     next.delete(unitId);
    //     return next;
    //   });
    // }
  }, []);

  /**
   * Remove a unit from favorites (optimistic update)
   */
  const removeFavorite = useCallback((unitId: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      next.delete(unitId);
      return next;
    });
    
    // TODO: Sync with API when user is logged in
  }, []);

  /**
   * Toggle favorite status
   */
  const toggleFavorite = useCallback((unitId: string) => {
    if (favorites.has(unitId)) {
      removeFavorite(unitId);
      return false;
    } else {
      addFavorite(unitId);
      return true;
    }
  }, [favorites, addFavorite, removeFavorite]);

  /**
   * Get all favorited unit IDs
   */
  const getFavorites = useCallback((): string[] => {
    return Array.from(favorites);
  }, [favorites]);

  /**
   * Get count of favorites
   */
  const count = favorites.size;

  return {
    favorites,
    isFavorited,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    getFavorites,
    count,
    isLoading,
  };
}

/**
 * Simple hook to check/toggle a single unit's favorite status
 * More lightweight than useFavorites for individual card usage
 */
export function useUnitFavorite(unitId: string) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial state
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setIsFavorited(parsed.includes(unitId));
        }
      }
    } catch (error) {
      console.warn('Error loading favorite state:', error);
    } finally {
      setIsLoading(false);
    }
  }, [unitId]);

  const toggle = useCallback(() => {
    setIsFavorited(prev => {
      const newValue = !prev;
      
      // Update localStorage
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const favorites: string[] = stored ? JSON.parse(stored) : [];
        
        if (newValue) {
          if (!favorites.includes(unitId)) {
            favorites.push(unitId);
          }
        } else {
          const index = favorites.indexOf(unitId);
          if (index !== -1) {
            favorites.splice(index, 1);
          }
        }
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
      } catch (error) {
        console.warn('Error updating favorite:', error);
      }
      
      return newValue;
    });
  }, [unitId]);

  return {
    isFavorited,
    toggle,
    isLoading,
  };
}

export default useFavorites;
