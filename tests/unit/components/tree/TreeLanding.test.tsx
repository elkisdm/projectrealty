import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TreeLanding } from '@/components/tree/TreeLanding';
import { track } from '@/lib/analytics';
import { ANALYTICS_EVENTS } from '@/lib/analytics/events';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock analytics
jest.mock('@/lib/analytics', () => ({
  track: jest.fn(),
  ANALYTICS_EVENTS: require('@/lib/analytics/events').ANALYTICS_EVENTS,
}));

describe('TreeLanding', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debería renderizar el componente correctamente', () => {
    render(<TreeLanding />);

    expect(screen.getByText('Elkis Daza')).toBeInTheDocument();
    expect(screen.getByText('Elkis Realtor')).toBeInTheDocument();
    expect(screen.getByText('Quiero arrendar')).toBeInTheDocument();
    expect(screen.getByText('Quiero comprar')).toBeInTheDocument();
  });

  it('debería trackear tree_view al montar', () => {
    render(<TreeLanding />);

    expect(track).toHaveBeenCalledWith(ANALYTICS_EVENTS.TREE_VIEW);
  });

  it('debería tener links a las rutas correctas', () => {
    const { useRouter } = require('next/navigation');
    const mockPush = jest.fn();
    useRouter.mockReturnValue({ push: mockPush });

    render(<TreeLanding />);

    const rentButton = screen.getByLabelText('Quiero arrendar');
    fireEvent.click(rentButton);

    expect(mockPush).toHaveBeenCalledWith('/tree/arrendar');
    expect(track).toHaveBeenCalledWith(ANALYTICS_EVENTS.TREE_CLICK_CTA, { flow: 'rent' });
  });

  it('debería trackear click en CTA comprar', () => {
    const { useRouter } = require('next/navigation');
    const mockPush = jest.fn();
    useRouter.mockReturnValue({ push: mockPush });

    render(<TreeLanding />);

    const buyButton = screen.getByLabelText('Quiero comprar');
    fireEvent.click(buyButton);

    expect(mockPush).toHaveBeenCalledWith('/tree/comprar');
    expect(track).toHaveBeenCalledWith(ANALYTICS_EVENTS.TREE_CLICK_CTA, { flow: 'buy' });
  });
});
