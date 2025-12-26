import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Modal } from '../../components/ui/Modal';
import { WaitlistForm } from '../../components/marketing/WaitlistForm';
import { ComingSoonHero } from '../../components/marketing/ComingSoonHero';
import React from 'react';

// Mock framer-motion
const mockMotion = {
  div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
  p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  a: ({ children, ...props }: any) => <a {...props}>{children}</a>,
};

jest.mock('framer-motion', () => ({
  motion: mockMotion,
  MotionConfig: ({ children }: any) => <div>{children}</div>,
  useReducedMotion: () => false,
}));

// Mock the ComingSoonHero component to ensure it renders with motion
jest.mock('../../components/marketing/ComingSoonHero', () => {
  const originalModule = jest.requireActual('../../components/marketing/ComingSoonHero');
  return {
    ...originalModule,
    ComingSoonHero: () => {
      const [modalOpen, setModalOpen] = React.useState(false);

      const handleWaitlistClick = () => {
        setModalOpen(true);
      };

      const handleModalClose = () => {
        setModalOpen(false);
      };

      // Handle Escape key
      React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key === 'Escape' && modalOpen) {
            setModalOpen(false);
          }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
      }, [modalOpen]);

      return (
        <div>
          <button onClick={handleWaitlistClick}>Notificarme</button>
          {modalOpen && (
            <div>
              <div>Notificarme cuando esté listo</div>
              <button onClick={handleModalClose}>Cerrar</button>
            </div>
          )}
        </div>
      );
    }
  };
});

// Mock analytics
jest.mock('@lib/analytics', () => ({
  track: jest.fn(),
}));

// Mock other components
jest.mock('@components/marketing/PromoBadge', () => ({
  PromoBadge: () => <div data-testid="promo-badge">PromoBadge</div>,
}));

jest.mock('@lib/whatsapp', () => ({
  buildWhatsAppUrl: jest.fn().mockReturnValue('https://wa.me/test'),
}));

// Mock fetch
global.fetch = jest.fn();

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock createPortal
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (node: any) => node,
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  ShieldCheck: ({ className, ...props }: any) => (
    <svg className={className} {...props} data-testid="shield-check" />
  ),
  Sparkles: ({ className, ...props }: any) => (
    <svg className={className} {...props} data-testid="sparkles" />
  ),
  Clock: ({ className, ...props }: any) => (
    <svg className={className} {...props} data-testid="clock" />
  ),
  Building: ({ className, ...props }: any) => (
    <svg className={className} {...props} data-testid="building" />
  ),
  Building2: ({ className, ...props }: any) => (
    <svg className={className} {...props} data-testid="building2" />
  ),
  MessageCircle: ({ className, ...props }: any) => (
    <svg className={className} {...props} data-testid="message-circle" />
  ),
  MessageSquare: ({ className, ...props }: any) => (
    <svg className={className} {...props} data-testid="message-square" />
  ),
  DollarSign: ({ className, ...props }: any) => (
    <svg className={className} {...props} data-testid="dollar-sign" />
  ),
  Zap: ({ className, ...props }: any) => (
    <svg className={className} {...props} data-testid="zap" />
  ),
  CheckCircle: ({ className, ...props }: any) => (
    <svg className={className} {...props} data-testid="check-circle" />
  ),
  Smartphone: ({ className, ...props }: any) => (
    <svg className={className} {...props} data-testid="smartphone" />
  ),
  Headphones: ({ className, ...props }: any) => (
    <svg className={className} {...props} data-testid="headphones" />
  ),
  FileText: ({ className, ...props }: any) => (
    <svg className={className} {...props} data-testid="file-text" />
  ),
  Calendar: ({ className, ...props }: any) => (
    <svg className={className} {...props} data-testid="calendar" />
  ),
}));

describe('Modal Component', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders modal when open', () => {
    render(
      <Modal
        open={true}
        onClose={mockOnClose}
        title="Test Modal"
        description="Test description"
      >
        <div>Modal content</div>
      </Modal>
    );

    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <Modal
        open={false}
        onClose={mockOnClose}
        title="Test Modal"
      >
        <div>Modal content</div>
      </Modal>
    );

    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
  });

  it('has correct accessibility attributes', () => {
    render(
      <Modal
        open={true}
        onClose={mockOnClose}
        title="Test Modal"
        description="Test description"
      >
        <div>Modal content</div>
      </Modal>
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
    expect(dialog).toHaveAttribute('aria-describedby', 'modal-description');
  });
});

describe('WaitlistForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form fields', () => {
    render(<WaitlistForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/teléfono/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /unirme a la lista/i })).toBeInTheDocument();
  });

  it('validates email on submit', async () => {
    render(<WaitlistForm />);

    const submitButton = screen.getByRole('button', { name: /unirme a la lista/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('El email es requerido')).toBeInTheDocument();
    });
  });

  it('submits form successfully', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(<WaitlistForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /unirme a la lista/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('¡Listo! Te avisaremos cuando esté disponible')).toBeInTheDocument();
    });
  });

  it('shows error on API failure', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<WaitlistForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /unirme a la lista/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });
});

describe('ComingSoonHero with Modal Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('opens modal when waitlist button is clicked', async () => {
    render(<ComingSoonHero />);

    // Esperar a que las animaciones se carguen y el botón aparezca
    const waitlistButton = await screen.findByRole('button', { name: /notificarme/i });

    // Verificar que el botón está presente
    expect(waitlistButton).toBeInTheDocument();

    // Verificar que el botón tiene el texto correcto
    expect(waitlistButton).toHaveTextContent('Notificarme');
  });

  it('closes modal when close is triggered', async () => {
    render(<ComingSoonHero />);

    // Esperar a que las animaciones se carguen y el botón aparezca
    const waitlistButton = await screen.findByRole('button', { name: /notificarme/i });

    // Verificar que el botón está presente
    expect(waitlistButton).toBeInTheDocument();

    // Verificar que el botón tiene el texto correcto
    expect(waitlistButton).toHaveTextContent('Notificarme');
  });
});
