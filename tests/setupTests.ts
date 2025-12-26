// Solo cargar jest-dom si estamos en entorno jsdom
if (typeof window !== 'undefined') {
  require('@testing-library/jest-dom');
  // Configurar jest-axe para tests de accesibilidad
  const { toHaveNoViolations } = require('jest-axe');
  expect.extend(toHaveNoViolations);
}

// Silence Next.js router warnings if any component uses it indirectly
// and provide generic mocks where helpful.
// Solo ejecutar si estamos en entorno con window (jsdom)
if (typeof window !== 'undefined') {
  window.scrollTo = window.scrollTo || (() => {});
}

// Polyfill fetch for jsdom if not present
if (!(global as any).fetch) {
  (global as any).fetch = jest.fn();
}

// Mock matchMedia for components that use it (solo en jsdom)
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}

// Mock ResizeObserver (disponible tanto en node como jsdom)
global.ResizeObserver = global.ResizeObserver || jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver (disponible tanto en node como jsdom)
global.IntersectionObserver = global.IntersectionObserver || jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock WhatsApp module globally
jest.mock('@lib/whatsapp', () => ({
  buildWhatsAppUrl: jest.fn((params: any) => {
    const baseUrl = 'https://wa.me/1234567890';
    const message = params?.message || 'Hola, me interesa';
    const encodedMessage = encodeURIComponent(message);
    return `${baseUrl}?text=${encodedMessage}`;
  })
}));

// Mock Next.js server components - Solo para tests que lo necesiten
// jest.mock('next/server', () => ({
//   NextRequest: class MockNextRequest {
//     public method: string;
//     public headers: Headers;
//     public body: string;
//     public url: string;

//     constructor(url: string, init?: RequestInit) {
//       this.url = url;
//       this.method = init?.method || 'GET';
//       this.headers = new Headers(init?.headers);
//       this.body = init?.body as string || '';
//     }

//     async json() {
//       return JSON.parse(this.body);
//     }
//   },
//   NextResponse: {
//     json: jest.fn((data: any, init?: ResponseInit) => ({
//       json: () => Promise.resolve(data),
//       status: init?.status || 200,
//       headers: new Headers(init?.headers),
//     })),
//   },
// }));

// Mock Next.js components - Comentado temporalmente
// jest.mock('next/image', () => ({
//   __esModule: true,
//   default: ({ src, alt, ...props }: any) => {
//     const React = require('react');
//     return React.createElement('img', { src, alt, ...props });
//   },
// }));

// jest.mock('next/navigation', () => ({
//   useRouter: () => ({
//     push: jest.fn(),
//     replace: jest.fn(),
//     back: jest.fn(),
//     forward: jest.fn(),
//     refresh: jest.fn(),
//     prefetch: jest.fn(),
//   }),
//   useSearchParams: () => new URLSearchParams(),
//   usePathname: () => '/',
// }));

// Mock del hook useVisitScheduler para evitar warnings de act()
jest.mock('@/hooks/useVisitScheduler', () => ({
  useVisitScheduler: jest.fn(() => ({
    isLoading: false,
    error: null,
    selectedDate: null,
    selectedTime: null,
    availableDays: [
      { id: 'day-1', date: '2025-01-15', day: 'Lun', number: '15', available: true, slotsCount: 3, premium: false },
      { id: 'day-2', date: '2025-01-16', day: 'Mar', number: '16', available: true, slotsCount: 2, premium: false },
    ],
    availableSlots: [
      { id: 'slot-1', time: '10:00', available: true, premium: false },
      { id: 'slot-2', time: '14:00', available: true, premium: false },
    ],
    fetchAvailability: jest.fn(),
    selectDateTime: jest.fn(),
    createVisit: jest.fn().mockResolvedValue({ success: true, visitId: '123' }),
    clearError: jest.fn(),
  }))
}));


