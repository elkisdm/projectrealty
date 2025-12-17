import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { server } from '../mocks/server';
import { rest } from 'msw';

// Base URL for tests
const BASE_URL = 'http://localhost:3000';

// Start MSW server before tests
beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Componente de prueba que hace llamadas a la API
const TestComponent = () => {
    const [data, setData] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${BASE_URL}/api/buildings`);
                if (!response.ok) {
                    throw new Error('Error en la API');
                }
                const result = await response.json();
                setData(result);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error desconocido');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div>Cargando...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!data) return <div>Sin datos</div>;

    return (
        <div>
            <h1>Edificios</h1>
            <p>Total: {data.total}</p>
            {data.buildings.map((building: any) => (
                <div key={building.id}>
                    <h2>{building.name}</h2>
                    <p>{building.address}</p>
                </div>
            ))}
        </div>
    );
};

// NOTE: These tests require MSW 2.x for proper Node.js fetch interception
// MSW 1.x has limitations with node-fetch and absolute URLs
// TODO: Upgrade to MSW 2.x for full integration test support
describe.skip('MSW Integration Tests', () => {
    beforeEach(() => {
        // Limpiar handlers antes de cada test
        server.resetHandlers();
    });

    it('debería interceptar llamadas a la API correctamente', async () => {
        render(<TestComponent />);

        // Verificar que se muestra el estado de carga inicialmente
        expect(screen.getByText('Cargando...')).toBeInTheDocument();

        // Esperar a que se carguen los datos
        await waitFor(() => {
            expect(screen.getByText('Edificios')).toBeInTheDocument();
        });

        // Verificar que los datos mock se muestran correctamente
        expect(screen.getByText('Total: 1')).toBeInTheDocument();
        expect(screen.getByText('Casa Amengual')).toBeInTheDocument();
        expect(screen.getByText('Av. Amengual 123, Santiago')).toBeInTheDocument();
    });

    it('debería manejar errores de API correctamente', async () => {
        // Configurar un handler que retorne error
        server.use(
            rest.get(`${BASE_URL}/api/buildings`, (req, res, ctx) => {
                return res(
                    ctx.status(500),
                    ctx.json({ error: 'Error de servidor' })
                );
            })
        );

        render(<TestComponent />);

        // Esperar a que se muestre el error
        await waitFor(() => {
            expect(screen.getByText('Error: Error en la API')).toBeInTheDocument();
        });
    });

    it('debería interceptar llamadas a la API de disponibilidad', async () => {
        const TestAvailabilityComponent = () => {
            const [availability, setAvailability] = React.useState<any>(null);
            const [loading, setLoading] = React.useState(true);

            React.useEffect(() => {
                const fetchAvailability = async () => {
                    try {
                        const response = await fetch(`${BASE_URL}/api/availability?listingId=test-listing`);
                        const result = await response.json();
                        setAvailability(result);
                    } catch (err) {
                        console.error('Error:', err);
                    } finally {
                        setLoading(false);
                    }
                };

                fetchAvailability();
            }, []);

            if (loading) return <div>Cargando disponibilidad...</div>;
            if (!availability) return <div>Sin disponibilidad</div>;

            return (
                <div>
                    <h1>Disponibilidad</h1>
                    <p>Listing ID: {availability.listingId}</p>
                    <p>Timezone: {availability.timezone}</p>
                    <p>Slots disponibles: {availability.slots.length}</p>
                </div>
            );
        };

        render(<TestAvailabilityComponent />);

        await waitFor(() => {
            expect(screen.getByText('Disponibilidad')).toBeInTheDocument();
        });

        expect(screen.getByText('Listing ID: test-listing')).toBeInTheDocument();
        expect(screen.getByText('Timezone: America/Santiago')).toBeInTheDocument();
        expect(screen.getByText('Slots disponibles: 3')).toBeInTheDocument();
    });

    it('debería interceptar llamadas POST a la API de visitas', async () => {
        const TestVisitComponent = () => {
            const [visit, setVisit] = React.useState<any>(null);
            const [loading, setLoading] = React.useState(false);

            const createVisit = async () => {
                setLoading(true);
                try {
                    const response = await fetch(`${BASE_URL}/api/visits`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            listingId: 'test-listing',
                            date: '2025-01-16',
                            time: '10:00',
                            name: 'Juan Pérez',
                            email: 'juan@example.com',
                            phone: '912345678'
                        }),
                    });
                    const result = await response.json();
                    setVisit(result);
                } catch (err) {
                    console.error('Error:', err);
                } finally {
                    setLoading(false);
                }
            };

            return (
                <div>
                    <button onClick={createVisit} disabled={loading}>
                        {loading ? 'Creando...' : 'Crear Visita'}
                    </button>
                    {visit && (
                        <div>
                            <h2>Visita Creada</h2>
                            <p>ID: {visit.visit.id}</p>
                            <p>Fecha: {visit.visit.date}</p>
                            <p>Hora: {visit.visit.time}</p>
                        </div>
                    )}
                </div>
            );
        };

        render(<TestVisitComponent />);

        const createButton = screen.getByText('Crear Visita');
        expect(createButton).toBeInTheDocument();

        // Hacer clic en el botón para crear la visita
        createButton.click();

        // Esperar a que se cree la visita
        await waitFor(() => {
            expect(screen.getByText('Visita Creada')).toBeInTheDocument();
        });

        expect(screen.getByText('ID: visit-123')).toBeInTheDocument();
        expect(screen.getByText('Fecha: 2025-01-16')).toBeInTheDocument();
        expect(screen.getByText('Hora: 10:00')).toBeInTheDocument();
    });

    it('debería manejar validación de parámetros faltantes', async () => {
        const TestValidationComponent = () => {
            const [error, setError] = React.useState<string | null>(null);

            const testValidation = async () => {
                try {
                    const response = await fetch(`${BASE_URL}/api/availability`); // Sin parámetros
                    const result = await response.json();
                    if (!response.ok) {
                        setError(result.error);
                    }
                } catch (err) {
                    setError('Error de red');
                }
            };

            return (
                <div>
                    <button onClick={testValidation}>Probar Validación</button>
                    {error && <div>Error: {error}</div>}
                </div>
            );
        };

        render(<TestValidationComponent />);

        const testButton = screen.getByText('Probar Validación');
        testButton.click();

        await waitFor(() => {
            expect(screen.getByText('Error: listingId es requerido')).toBeInTheDocument();
        });
    });

    it('debería interceptar múltiples llamadas simultáneas', async () => {
        const TestMultipleCallsComponent = () => {
            const [results, setResults] = React.useState<any[]>([]);
            const [loading, setLoading] = React.useState(false);

            const makeMultipleCalls = async () => {
                setLoading(true);
                try {
                    const promises = [
                        fetch(`${BASE_URL}/api/buildings`),
                        fetch(`${BASE_URL}/api/availability?listingId=test-listing`),
                        fetch(`${BASE_URL}/api/filters`)
                    ];

                    const responses = await Promise.all(promises);
                    const data = await Promise.all(responses.map(r => r.json()));
                    setResults(data);
                } catch (err) {
                    console.error('Error:', err);
                } finally {
                    setLoading(false);
                }
            };

            return (
                <div>
                    <button onClick={makeMultipleCalls} disabled={loading}>
                        {loading ? 'Cargando...' : 'Hacer Múltiples Llamadas'}
                    </button>
                    {results.length > 0 && (
                        <div>
                            <p>Llamadas completadas: {results.length}</p>
                            <p>Edificios: {results[0]?.total || 0}</p>
                            <p>Slots: {results[1]?.slots?.length || 0}</p>
                            <p>Filtros: {results[2]?.communes?.length || 0}</p>
                        </div>
                    )}
                </div>
            );
        };

        render(<TestMultipleCallsComponent />);

        const callButton = screen.getByText('Hacer Múltiples Llamadas');
        callButton.click();

        await waitFor(() => {
            expect(screen.getByText('Llamadas completadas: 3')).toBeInTheDocument();
        });

        expect(screen.getByText('Edificios: 1')).toBeInTheDocument();
        expect(screen.getByText('Slots: 3')).toBeInTheDocument();
        expect(screen.getByText('Filtros: 3')).toBeInTheDocument();
    });
});
