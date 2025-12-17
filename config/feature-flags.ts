export const featureFlags = {
  comingSoon: false, // fuente de verdad (editamos este archivo en commits)
  pagination: false, // paginación real con React Query - deshabilitado por defecto
  landingV2: true, // nueva landing con datos reales - ACTIVADA ✅
  FOOTER_ENABLED: false, // footer deshabilitado para landing flash
  mvpMode: true, // modo MVP activado - solo rutas MVP disponibles
} as const;
