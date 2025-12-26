import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { FlagsAdminClient } from '../../app/admin/flags/FlagsAdminClient';

// Mock fetch
global.fetch = jest.fn();

// Mock analytics
jest.mock('@lib/analytics', () => ({
  track: jest.fn()
}));

// Mock FlagToggle component
jest.mock('@components/admin/FlagToggle', () => ({
  FlagToggle: ({ flag, label, description, initialValue, overridden, expiresAt }: any) => (
    <div data-testid="flag-toggle">
      <h3>{label}</h3>
      <p>{description}</p>
      <span data-testid="flag-value">{initialValue ? 'true' : 'false'}</span>
      <span data-testid="flag-overridden">{overridden ? 'true' : 'false'}</span>
      {expiresAt && <span data-testid="flag-expires">{expiresAt}</span>}
    </div>
  )
}));

describe('FlagsAdminClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(<FlagsAdminClient />);

    expect(screen.getByText('Feature Flags')).toBeInTheDocument();
    expect(screen.getByText('Cargando configuración...')).toBeInTheDocument();
  });

  it('renders flags when data is loaded successfully', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        flags: {
          comingSoon: {
            value: true,
            overridden: false
          }
        }
      })
    } as Response);

    render(<FlagsAdminClient />);

    await waitFor(() => {
      expect(screen.getByText('Controla el comportamiento del sitio en tiempo real')).toBeInTheDocument();
    });

    expect(screen.getByTestId('flag-toggle')).toBeInTheDocument();
    expect(screen.getByText('Coming Soon')).toBeInTheDocument();
  });

  it('renders error state when API fails', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: false,
        error: 'API Error'
      })
    } as Response);

    render(<FlagsAdminClient />);

    await waitFor(() => {
      expect(screen.getByText('Error al cargar flags')).toBeInTheDocument();
    });

    expect(screen.getByText('Reintentar')).toBeInTheDocument();
  });

  it('renders network error state', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    render(<FlagsAdminClient />);

    await waitFor(() => {
      expect(screen.getByText('Error de conexión')).toBeInTheDocument();
    });
  });

  it('refreshes data when refresh button is clicked', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

    // Initial load
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        flags: {
          comingSoon: {
            value: true,
            overridden: false
          }
        }
      })
    } as Response);

    // Refresh load
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        flags: {
          comingSoon: {
            value: false,
            overridden: true
          }
        }
      })
    } as Response);

    render(<FlagsAdminClient />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Controla el comportamiento del sitio en tiempo real')).toBeInTheDocument();
    });

    // Click refresh button
    const refreshButton = screen.getByText('Actualizar');

    await act(async () => {
      fireEvent.click(refreshButton);
    });

    // Wait for refresh to complete
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  it('shows placeholder for future flags', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        flags: {
          comingSoon: {
            value: true,
            overridden: false
          }
        }
      })
    } as Response);

    render(<FlagsAdminClient />);

    await waitFor(() => {
      expect(screen.getByText('Más flags próximamente')).toBeInTheDocument();
    });
  });

  it('shows important information footer', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        flags: {
          comingSoon: {
            value: true,
            overridden: false
          }
        }
      })
    } as Response);

    render(<FlagsAdminClient />);

    await waitFor(() => {
      expect(screen.getByText('Información importante')).toBeInTheDocument();
      expect(screen.getByText(/Los overrides tienen una duración máxima/)).toBeInTheDocument();
      expect(screen.getByText(/Los cambios se aplican inmediatamente/)).toBeInTheDocument();
    });
  });

  it('passes correct props to FlagToggle', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        flags: {
          comingSoon: {
            value: true,
            overridden: false
          }
        }
      })
    } as Response);

    render(<FlagsAdminClient />);

    await waitFor(() => {
      expect(screen.getByText('Coming Soon')).toBeInTheDocument();
    });

    expect(screen.getByTestId('flag-value')).toHaveTextContent('true');
    expect(screen.getByTestId('flag-overridden')).toHaveTextContent('false');
  });
});
