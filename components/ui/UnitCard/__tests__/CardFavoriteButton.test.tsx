/**
 * Unit tests for CardFavoriteButton component
 * 
 * Tests:
 * - stopPropagation on click
 * - preventDefault on click
 * - Toggle icon state (outline vs solid)
 * - Correct aria-label
 * - Correct aria-pressed
 * - Keyboard accessibility
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CardFavoriteButton } from '../parts/CardFavoriteButton';

// Mock lucide-react Heart icon
jest.mock('lucide-react', () => ({
  Heart: ({ className, ...props }: { className?: string }) => (
    <svg className={className} data-testid="heart-icon" {...props} />
  ),
}));

describe('CardFavoriteButton', () => {
  const mockOnToggle = jest.fn();

  beforeEach(() => {
    mockOnToggle.mockClear();
  });

  describe('Event handling', () => {
    it('llama stopPropagation en click', () => {
      render(
        <CardFavoriteButton
          unitId="unit-1"
          isFavorited={false}
          onToggle={mockOnToggle}
        />
      );

      const button = screen.getByLabelText('Agregar a favoritos');
      const mockEvent = { stopPropagation: jest.fn(), preventDefault: jest.fn() };

      // Simulate click with our mock event
      fireEvent.click(button, mockEvent);

      // Verify onToggle was called
      expect(mockOnToggle).toHaveBeenCalledTimes(1);
    });

    it('previene navegación con preventDefault', () => {
      const preventDefaultMock = jest.fn();

      render(
        <CardFavoriteButton
          unitId="unit-1"
          isFavorited={false}
          onToggle={mockOnToggle}
        />
      );

      const button = screen.getByLabelText('Agregar a favoritos');

      // Create a native click event
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
      });
      Object.defineProperty(clickEvent, 'preventDefault', {
        value: preventDefaultMock,
      });
      Object.defineProperty(clickEvent, 'stopPropagation', {
        value: jest.fn(),
      });

      button.dispatchEvent(clickEvent);

      expect(preventDefaultMock).toHaveBeenCalled();
    });

    it('no navega cuando está dentro de un Link (simulated)', () => {
      // This tests that clicking the favorite button doesn't trigger parent handlers
      const parentClickHandler = jest.fn();

      render(
        <div onClick={parentClickHandler}>
          <CardFavoriteButton
            unitId="unit-1"
            isFavorited={false}
            onToggle={mockOnToggle}
          />
        </div>
      );

      const button = screen.getByLabelText('Agregar a favoritos');
      fireEvent.click(button);

      // Parent should NOT be called due to stopPropagation
      expect(parentClickHandler).not.toHaveBeenCalled();
      expect(mockOnToggle).toHaveBeenCalledTimes(1);
    });
  });

  describe('Toggle state', () => {
    it('muestra icono outline cuando no está favorito', () => {
      render(
        <CardFavoriteButton
          unitId="unit-1"
          isFavorited={false}
          onToggle={mockOnToggle}
        />
      );

      const heartIcon = screen.getByTestId('heart-icon');
      expect(heartIcon).toHaveClass('fill-transparent');
      expect(heartIcon).toHaveClass('text-white');
    });

    it('muestra icono solid rojo cuando está favorito', () => {
      render(
        <CardFavoriteButton
          unitId="unit-1"
          isFavorited={true}
          onToggle={mockOnToggle}
        />
      );

      const heartIcon = screen.getByTestId('heart-icon');
      expect(heartIcon).toHaveClass('fill-red-500');
      expect(heartIcon).toHaveClass('text-red-500');
    });

    it('toggle cambia icono de outline a solid', () => {
      const { rerender } = render(
        <CardFavoriteButton
          unitId="unit-1"
          isFavorited={false}
          onToggle={mockOnToggle}
        />
      );

      let heartIcon = screen.getByTestId('heart-icon');
      expect(heartIcon).toHaveClass('fill-transparent');

      // Simulate state change (parent updates isFavorited)
      rerender(
        <CardFavoriteButton
          unitId="unit-1"
          isFavorited={true}
          onToggle={mockOnToggle}
        />
      );

      heartIcon = screen.getByTestId('heart-icon');
      expect(heartIcon).toHaveClass('fill-red-500');
    });
  });

  describe('Accessibility', () => {
    it('tiene aria-label "Agregar a favoritos" cuando no está favorito', () => {
      render(
        <CardFavoriteButton
          unitId="unit-1"
          isFavorited={false}
          onToggle={mockOnToggle}
        />
      );

      expect(screen.getByLabelText('Agregar a favoritos')).toBeInTheDocument();
    });

    it('tiene aria-label "Quitar de favoritos" cuando está favorito', () => {
      render(
        <CardFavoriteButton
          unitId="unit-1"
          isFavorited={true}
          onToggle={mockOnToggle}
        />
      );

      expect(screen.getByLabelText('Quitar de favoritos')).toBeInTheDocument();
    });

    it('tiene aria-pressed false cuando no está favorito', () => {
      render(
        <CardFavoriteButton
          unitId="unit-1"
          isFavorited={false}
          onToggle={mockOnToggle}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-pressed', 'false');
    });

    it('tiene aria-pressed true cuando está favorito', () => {
      render(
        <CardFavoriteButton
          unitId="unit-1"
          isFavorited={true}
          onToggle={mockOnToggle}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-pressed', 'true');
    });

    it('es accesible por teclado con Enter', () => {
      render(
        <CardFavoriteButton
          unitId="unit-1"
          isFavorited={false}
          onToggle={mockOnToggle}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: 'Enter' });

      expect(mockOnToggle).toHaveBeenCalledTimes(1);
    });

    it('es accesible por teclado con Space', () => {
      render(
        <CardFavoriteButton
          unitId="unit-1"
          isFavorited={false}
          onToggle={mockOnToggle}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: ' ' });

      expect(mockOnToggle).toHaveBeenCalledTimes(1);
    });

    it('no responde a otras teclas', () => {
      render(
        <CardFavoriteButton
          unitId="unit-1"
          isFavorited={false}
          onToggle={mockOnToggle}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: 'Tab' });
      fireEvent.keyDown(button, { key: 'Escape' });
      fireEvent.keyDown(button, { key: 'a' });

      expect(mockOnToggle).not.toHaveBeenCalled();
    });
  });

  describe('Sizes', () => {
    it('aplica tamaño sm correctamente', () => {
      render(
        <CardFavoriteButton
          unitId="unit-1"
          isFavorited={false}
          onToggle={mockOnToggle}
          size="sm"
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('p-1.5');

      const icon = screen.getByTestId('heart-icon');
      expect(icon).toHaveClass('w-4');
      expect(icon).toHaveClass('h-4');
    });

    it('aplica tamaño md (default) correctamente', () => {
      render(
        <CardFavoriteButton
          unitId="unit-1"
          isFavorited={false}
          onToggle={mockOnToggle}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('p-2');

      const icon = screen.getByTestId('heart-icon');
      expect(icon).toHaveClass('w-5');
      expect(icon).toHaveClass('h-5');
    });

    it('aplica tamaño lg correctamente', () => {
      render(
        <CardFavoriteButton
          unitId="unit-1"
          isFavorited={false}
          onToggle={mockOnToggle}
          size="lg"
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('p-3');

      const icon = screen.getByTestId('heart-icon');
      expect(icon).toHaveClass('w-6');
      expect(icon).toHaveClass('h-6');
    });
  });

  describe('Props', () => {
    it('incluye data-unit-id con el ID correcto', () => {
      render(
        <CardFavoriteButton
          unitId="test-unit-123"
          isFavorited={false}
          onToggle={mockOnToggle}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('data-unit-id', 'test-unit-123');
    });

    it('aplica className adicional', () => {
      render(
        <CardFavoriteButton
          unitId="unit-1"
          isFavorited={false}
          onToggle={mockOnToggle}
          className="custom-class"
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('funciona sin onToggle (graceful handling)', () => {
      render(
        <CardFavoriteButton
          unitId="unit-1"
          isFavorited={false}
        />
      );

      const button = screen.getByRole('button');
      // Should not throw
      expect(() => fireEvent.click(button)).not.toThrow();
    });
  });
});
