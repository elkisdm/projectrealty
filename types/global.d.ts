// Global type declarations
declare global {
  interface Window {
    // Google Analytics gtag function
    // Supports multiple overloads: gtag('config', id, config), gtag('event', name, params), etc.
    gtag: (
      command: string,
      targetId: string,
      config?: Record<string, unknown>
    ) => void;
  }
}

export {};
