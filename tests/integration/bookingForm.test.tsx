import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BookingForm } from '@components/forms/BookingForm';

// Setup fetch mock
global.fetch = jest.fn();
const mockFetch = global.fetch as jest.Mock;

describe('BookingForm', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, bookingId: 'bk_123456' }),
    } as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('muestra errores de validación y no envía si hay campos inválidos', async () => {
    render(<BookingForm buildingId="bld-nunoa" buildingName="Condominio Parque Ñuñoa" />);

    // Dispara validación por campo (el submit nativo es bloqueado por required)
    fireEvent.blur(screen.getByLabelText(/Nombre completo/i));
    fireEvent.blur(screen.getByLabelText(/Email/i));
    fireEvent.blur(screen.getByLabelText(/Teléfono/i));

    fireEvent.click(screen.getByRole('button', { name: /reservar visita/i }));

    expect(await screen.findByText(/El nombre debe tener al menos 2 caracteres/i)).toBeInTheDocument();
    expect(await screen.findByText(/Ingresa un email válido/i)).toBeInTheDocument();
    expect(await screen.findByText(/Ingresa un teléfono válido/i)).toBeInTheDocument();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  test('envía correctamente cuando el formulario es válido', async () => {
    render(<BookingForm buildingId="bld-nunoa" buildingName="Condominio Parque Ñuñoa" defaultUnitId="nu-302" />);

    fireEvent.change(screen.getByLabelText(/Nombre completo/i), { target: { value: 'Juan Pérez' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'juan@example.com' } });
    fireEvent.change(screen.getByLabelText(/Teléfono/i), { target: { value: '+56 9 1234 5678' } });

    fireEvent.click(screen.getByRole('button', { name: /reservar visita/i }));

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));

    const call = mockFetch.mock.calls[0];
    expect(call[0]).toBe('/api/booking');
    const body = JSON.parse(call[1].body);
    expect(body).toMatchObject({
      name: 'Juan Pérez',
      email: 'juan@example.com',
      phone: '+56 9 1234 5678',
      buildingId: 'bld-nunoa',
      unitId: 'nu-302',
    });

    expect(await screen.findByText(/¡Solicitud enviada!/i)).toBeInTheDocument();
  });

  test('muestra mensaje de error cuando la petición falla', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false } as any);
    render(<BookingForm buildingId="bld-nunoa" buildingName="Condominio Parque Ñuñoa" />);

    fireEvent.change(screen.getByLabelText(/Nombre completo/i), { target: { value: 'Juan Pérez' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'juan@example.com' } });
    fireEvent.change(screen.getByLabelText(/Teléfono/i), { target: { value: '+56 9 1234 5678' } });

    fireEvent.click(screen.getByRole('button', { name: /reservar visita/i }));

    expect(await screen.findByText(/Error al enviar la solicitud/i)).toBeInTheDocument();
  });
});


