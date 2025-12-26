'use client';

import { useEffect } from 'react';
import { track, ANALYTICS_EVENTS } from '@lib/analytics';

interface PageViewTrackerProps {
  pageName: string;
  pageType?: 'home' | 'search' | 'property';
  additionalParams?: Record<string, unknown>;
}

/**
 * Componente para trackear page views
 * Debe usarse en componentes client de páginas
 */
export function PageViewTracker({
  pageName,
  pageType = 'home',
  additionalParams
}: PageViewTrackerProps) {
  useEffect(() => {
    track(ANALYTICS_EVENTS.PAGE_VIEW, {
      page_name: pageName,
      page_type: pageType,
      page_location: typeof window !== 'undefined' ? window.location.href : '',
      ...additionalParams,
    });
  }, [pageName, pageType, additionalParams]);

  return null;
}




