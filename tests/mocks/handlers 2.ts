import { rest } from 'msw';

// Mock data para las APIs
const mockBuildings = [
  {
    id: 'test-building-1',
    name: 'Casa Amengual',
    address: 'Av. Amengual 123, Santiago',
    commune: 'Santiago',
    priceFrom: 2500000,
    units: [
      {
        id: 'unit-207',
        number: '207',
        bedrooms: 2,
        bathrooms: 1,
        area: 65,
        price: 2500000,
        available: true
      }
    ]
  }
];

const mockAvailability = {
  listingId: 'test-listing',
  timezone: 'America/Santiago',
  slots: [
    {
      id: 'slot-1',
      startTime: '2025-01-16T10:00:00-03:00',
      endTime: '2025-01-16T10:30:00-03:00',
      status: 'open' as const
    },
    {
      id: 'slot-2',
      startTime: '2025-01-16T11:00:00-03:00',
      endTime: '2025-01-16T11:30:00-03:00',
      status: 'open' as const
    },
    {
      id: 'slot-3',
      startTime: '2025-01-17T10:00:00-03:00',
      endTime: '2025-01-17T10:30:00-03:00',
      status: 'open' as const
    }
  ],
  nextAvailableDate: '2025-01-21T00:00:00-03:00'
};

const mockVisit = {
  id: 'visit-123',
  listingId: 'test-listing',
  date: '2025-01-16',
  time: '10:00',
  status: 'confirmed',
  createdAt: '2025-01-15T10:00:00Z'
};

// Handlers para MSW
export const handlers = [
  // API de edificios
  rest.get('/api/buildings', (req, res, ctx) => {
    return res(
      ctx.json({
        buildings: mockBuildings,
        total: mockBuildings.length,
        page: 1,
        limit: 10
      })
    );
  }),

  // API de disponibilidad
  rest.get('/api/availability', (req, res, ctx) => {
    const listingId = req.url.searchParams.get('listingId');
    
    if (!listingId) {
      return res(
        ctx.status(400),
        ctx.json({ error: 'listingId es requerido' })
      );
    }

    return res(ctx.json(mockAvailability));
  }),

  // API de visitas
  rest.post('/api/visits', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        visit: mockVisit
      })
    );
  }),

  // API de filtros
  rest.get('/api/filters', (req, res, ctx) => {
    return res(
      ctx.json({
        communes: ['Santiago', 'Providencia', 'Las Condes'],
        priceRanges: [
          { min: 0, max: 2000000, label: 'Hasta $2.000.000' },
          { min: 2000000, max: 4000000, label: '$2.000.000 - $4.000.000' },
          { min: 4000000, max: 6000000, label: '$4.000.000 - $6.000.000' }
        ],
        bedrooms: [1, 2, 3, 4],
        bathrooms: [1, 2, 3]
      })
    );
  }),

  // API de health check
  rest.get('/api/health', (req, res, ctx) => {
    return res(
      ctx.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      })
    );
  })
];

// Handlers para errores de red
export const errorHandlers = [
  rest.get('/api/availability', (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({ error: 'Error de servidor' })
    );
  }),

  rest.post('/api/visits', (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({ error: 'Error de red' })
    );
  }),

  rest.get('/api/buildings', (req, res, ctx) => {
    return res(
      ctx.status(503),
      ctx.json({ error: 'Servicio no disponible' })
    );
  })
];

// Handlers para timeouts
export const timeoutHandlers = [
  rest.get('/api/availability', (req, res, ctx) => {
    return res(ctx.delay('infinite'));
  }),

  rest.post('/api/visits', (req, res, ctx) => {
    return res(ctx.delay('infinite'));
  })
];