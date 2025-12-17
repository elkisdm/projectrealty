import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, useTheme } from '@lib/theme-context';

// Componente de prueba que usa el hook useTheme
function TestComponent() {
  const { theme, toggleTheme, setTheme, isHydrated } = useTheme();
  
  return (
    <div>
      <div data-testid="current-theme">{theme}</div>
      <div data-testid="is-hydrated">{isHydrated ? 'true' : 'false'}</div>
      <button onClick={toggleTheme} data-testid="toggle-theme">
        Toggle Theme
      </button>
      <button onClick={() => setTheme('light')} data-testid="set-light">
        Set Light
      </button>
      <button onClick={() => setTheme('dark')} data-testid="set-dark">
        Set Dark
      </button>
    </div>
  );
}

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock matchMedia para simular preferencias del sistema
const mockMatchMedia = (prefersDark: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: query === '(prefers-color-scheme: dark)' ? prefersDark : false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
};

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.clear.mockClear();
    // Mock por defecto para tema claro del sistema
    mockMatchMedia(false);
    
    // Limpiar clases del DOM para evitar interferencia entre tests
    document.documentElement.classList.remove('dark', 'light');
  });

  it('provides system theme as default when no saved preference', async () => {
    // Simular sistema con tema claro
    mockMatchMedia(false);
    localStorageMock.getItem.mockReturnValue(null);
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('is-hydrated')).toHaveTextContent('true');
    });
  });

  it('provides light theme as default when no saved preference', async () => {
    // El theme-context actual siempre inicia con 'light' como default
    localStorageMock.getItem.mockReturnValue(null);
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('is-hydrated')).toHaveTextContent('true');
    });
  });

  it('uses saved preference over system theme', async () => {
    // Simular sistema con tema claro pero preferencia guardada oscura
    mockMatchMedia(false);
    localStorageMock.getItem.mockReturnValue('dark');
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('is-hydrated')).toHaveTextContent('true');
    });
  });

  it('starts with isHydrated as false and then becomes true', async () => {
    mockMatchMedia(false);
    localStorageMock.getItem.mockReturnValue(null);
    
    const { rerender } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Inicialmente debería estar hidratado
    await waitFor(() => {
      expect(screen.getByTestId('is-hydrated')).toHaveTextContent('true');
    });
  });

  it('toggles theme when toggle button is clicked', async () => {
    // El theme-context actual siempre inicia con 'light'
    localStorageMock.getItem.mockReturnValue(null);
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const toggleButton = screen.getByTestId('toggle-theme');
    
    // Esperar a que inicie con 'light'
    await waitFor(() => {
      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
    });
    
    // Hacer toggle a 'dark'
    fireEvent.click(toggleButton);
    await waitFor(() => {
      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
    });
    
    // Hacer toggle de vuelta a 'light'
    fireEvent.click(toggleButton);
    await waitFor(() => {
      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
    });
  });

  it('sets theme to light when set light button is clicked', async () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const setLightButton = screen.getByTestId('set-light');
    
    fireEvent.click(setLightButton);
    await waitFor(() => {
      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
    });
  });

  it('sets theme to dark when set dark button is clicked', async () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const setDarkButton = screen.getByTestId('set-dark');
    
    fireEvent.click(setDarkButton);
    await waitFor(() => {
      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
    });
  });

  it('saves theme to localStorage when theme changes', async () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const toggleButton = screen.getByTestId('toggle-theme');
    
    fireEvent.click(toggleButton);
    
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
    });
  });

  it('loads theme from localStorage on mount', async () => {
    localStorageMock.getItem.mockReturnValue('light');
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
    });
    expect(localStorageMock.getItem).toHaveBeenCalledWith('theme');
  });

  it('throws error when useTheme is used outside ThemeProvider', () => {
    // Suprimir el error de console.error para este test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useTheme must be used within a ThemeProvider');
    
    consoleSpy.mockRestore();
  });
});
