import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createRateLimiter } from '@lib/rate-limit';
import { logger } from '@lib/logger';
import { 
  CreateVisitRequest, 
  CreateVisitResponse, 
  Visit, 
  VisitSlot,
  Agent 
} from '@/types/visit';

// Rate limiter: 10 requests per minute per IP (more restrictive for visit creation)
const rateLimiter = createRateLimiter({ windowMs: 60_000, max: 10 });

// Schema de validación para crear visitas
const createVisitSchema = z.object({
  listingId: z.string().min(1, 'listingId es requerido'),
  slotId: z.string().min(1, 'slotId es requerido'),
  userId: z.string().min(1, 'userId es requerido'),
  channel: z.enum(['whatsapp', 'web']).optional().default('web'),
  idempotencyKey: z.string().min(1, 'idempotencyKey es requerido'),
});

// Mock data para desarrollo
const mockAgents: Record<string, Agent> = {
  'agent_001': {
    id: 'agent_001',
    name: 'María González',
    phone: '+56912345678',
    whatsappNumber: '+56912345678',
    email: 'maria@hommie.cl'
  },
  'agent_002': {
    id: 'agent_002',
    name: 'Carlos Silva',
    phone: '+56987654321',
    whatsappNumber: '+56987654321',
    email: 'carlos@hommie.cl'
  }
};

const mockSlots: Record<string, VisitSlot> = {};
const mockVisits: Record<string, Visit> = {};
const idempotencyCache: Record<string, { visitId: string; timestamp: number }> = {};

// Simular base de datos con transacciones
class MockDatabase {
  private static instance: MockDatabase;
  
  static getInstance(): MockDatabase {
    if (!MockDatabase.instance) {
      MockDatabase.instance = new MockDatabase();
    }
    return MockDatabase.instance;
  }
  
  // Simular SELECT ... FOR UPDATE
  async lockSlot(slotId: string): Promise<VisitSlot | null> {
    const slot = mockSlots[slotId];
    
    // Si es un slot mock (creado en el frontend), aceptarlo siempre
    if (slotId.startsWith('mock-slot-')) {
      // Simular delay de base de datos
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Crear un slot mock válido
      const mockSlot: VisitSlot = {
        id: slotId,
        listingId: slotId.split('-')[2], // Extraer listingId del slotId
        startTime: slotId.split('-')[3] + 'T' + slotId.split('-')[4] + ':00-03:00',
        endTime: slotId.split('-')[3] + 'T' + slotId.split('-')[4] + ':30:00-03:00',
        status: 'open',
        source: 'system',
        createdAt: new Date().toISOString()
      };
      
      return mockSlot;
    }
    
    if (!slot) return null;
    
    // Simular delay de base de datos
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Verificar que el slot sigue disponible
    if (slot.status !== 'open') {
      return null;
    }
    
    return slot;
  }
  
  // Simular transacción
  async createVisitTransaction(visitData: CreateVisitRequest): Promise<Visit> {
    // 1. Bloquear el slot
    let slot = await this.lockSlot(visitData.slotId);
    
    // Si es un slot mock y no se encontró, crearlo automáticamente
    if (!slot && visitData.slotId.startsWith('mock-slot-')) {
      slot = {
        id: visitData.slotId,
        listingId: visitData.listingId,
        startTime: visitData.slotId.split('-')[3] + 'T' + visitData.slotId.split('-')[4] + ':00-03:00',
        endTime: visitData.slotId.split('-')[3] + 'T' + visitData.slotId.split('-')[4] + ':30:00-03:00',
        status: 'open',
        source: 'system',
        createdAt: new Date().toISOString()
      };
    }
    
    if (!slot) {
      throw new Error('Slot no disponible o ya reservado');
    }
    
    // 2. Verificar idempotencia
    const existingIdempotency = idempotencyCache[visitData.idempotencyKey];
    if (existingIdempotency) {
      // Retornar visita existente
      const existingVisit = mockVisits[existingIdempotency.visitId];
      if (existingVisit) {
        return existingVisit;
      }
    }
    
    // 3. Crear la visita
    const visit: Visit = {
      id: `visit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      listingId: visitData.listingId,
      slotId: visitData.slotId,
      userId: visitData.userId,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      idempotencyKey: visitData.idempotencyKey,
      agentId: 'agent_001' // Hardcoded por ahora
    };
    
    // 4. Actualizar slot
    slot.status = 'confirmed';
    mockSlots[visitData.slotId] = slot;
    
    // 5. Guardar visita
    mockVisits[visit.id] = visit;
    
    // 6. Cache de idempotencia (expira en 24 horas)
    idempotencyCache[visitData.idempotencyKey] = {
      visitId: visit.id,
      timestamp: Date.now()
    };
    
    // Limpiar cache expirado
    this.cleanExpiredIdempotency();
    
    return visit;
  }
  
  private cleanExpiredIdempotency() {
    const now = Date.now();
    const expiredKeys = Object.keys(idempotencyCache).filter(
      key => now - idempotencyCache[key].timestamp > 24 * 60 * 60 * 1000
    );
    
    expiredKeys.forEach(key => delete idempotencyCache[key]);
  }
  
  // Inicializar slots mock
  initializeMockData() {
    const today = new Date();
    for (let i = 1; i <= 5; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      if (date.getDay() >= 1 && date.getDay() <= 5) { // Solo días laborales
        const timeSlots = ['09:00', '10:00', '11:00', '15:00', '16:00', '17:00'];
        
        timeSlots.forEach(time => {
          const [hours, minutes] = time.split(':').map(Number);
          const slotDate = new Date(date);
          slotDate.setHours(hours, minutes, 0, 0);
          
          const slotId = `slot_${date.getTime()}_${time}`;
          mockSlots[slotId] = {
            id: slotId,
            listingId: 'home-amengual',
            startTime: slotDate.toISOString(),
            endTime: new Date(slotDate.getTime() + 60 * 60 * 1000).toISOString(),
            status: 'open',
            source: 'system',
            createdAt: new Date().toISOString()
          };
        });
      }
    }
    
    // Agregar slots de prueba para tests
    const testDate = new Date('2025-01-15T09:00:00Z');
    const testSlots = ['09:00', '10:00', '11:00', '15:00', '16:00', '17:00'];
    
    testSlots.forEach(time => {
      const [hours, minutes] = time.split(':').map(Number);
      const slotDate = new Date(testDate);
      slotDate.setHours(hours, minutes, 0, 0);
      
      const slotId = `slot_${testDate.getTime()}_${time}`;
      mockSlots[slotId] = {
        id: slotId,
        listingId: 'home-amengual',
        startTime: slotDate.toISOString(),
        endTime: new Date(slotDate.getTime() + 60 * 60 * 1000).toISOString(),
        status: 'open',
        source: 'system',
        createdAt: new Date().toISOString()
      };
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting check
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
    const rateLimitResult = await rateLimiter.check(ip);
    
    if (!rateLimitResult.ok) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', retryAfter: rateLimitResult.retryAfter },
        { 
          status: 429,
          headers: {
            'Retry-After': rateLimitResult.retryAfter?.toString() || '60',
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Window': '60'
          }
        }
      );
    }
    
    // Verificar idempotency key en headers
    const idempotencyKey = request.headers.get('idempotency-key');
    if (!idempotencyKey) {
      return NextResponse.json(
        { error: 'Header Idempotency-Key es requerido' },
        { status: 400 }
      );
    }
    
    // Parsear y validar body
    const body = await request.json();
    const validation = createVisitSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Datos inválidos', 
          details: validation.error.errors 
        },
        { status: 400 }
      );
    }
    
    const visitData = validation.data;
    
    // Verificar que el idempotency key del header coincida con el del body
    if (visitData.idempotencyKey !== idempotencyKey) {
      return NextResponse.json(
        { error: 'Idempotency-Key del header no coincide con el del body' },
        { status: 400 }
      );
    }
    
    // Inicializar base de datos mock
    const db = MockDatabase.getInstance();
    db.initializeMockData();
    
    // Crear visita en transacción
    const visit = await db.createVisitTransaction(visitData);
    
    // Obtener agente
    const agent = mockAgents[visit.agentId];
    if (!agent) {
      throw new Error('Agente no encontrado');
    }
    
    // Obtener slot
    const slot = mockSlots[visit.slotId];
    if (!slot) {
      throw new Error('Slot no encontrado');
    }
    
    // Preparar respuesta
    const response: CreateVisitResponse = {
      visitId: visit.id,
      status: visit.status === 'confirmed' ? 'confirmed' : 'pending',
      agent: {
        name: agent.name,
        phone: agent.phone,
        whatsappNumber: agent.whatsappNumber
      },
      slot: {
        startTime: slot.startTime,
        endTime: slot.endTime
      },
      confirmationMessage: `¡Perfecto! Tu visita ha sido confirmada para el ${new Date(slot.startTime).toLocaleDateString('es-CL')} a las ${new Date(slot.startTime).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}. Te contactaremos por WhatsApp para confirmar los detalles.`
    };
    
    // Log de métricas (sin PII)
    logger.log(`✅ Visita creada: ${visit.id} para listing ${visit.listingId} en slot ${visit.slotId}`);
    
    // En producción aquí se enviaría la notificación por WhatsApp
    // await sendWhatsAppConfirmation(visit, agent, slot);
    
    return NextResponse.json(response, { status: 201 });
    
  } catch (error) {
    logger.error('❌ Error creando visita:', error);
    
    if (error instanceof Error && error.message.includes('Slot no disponible')) {
      return NextResponse.json(
        { 
          error: 'Slot no disponible',
          message: 'El horario seleccionado ya no está disponible. Por favor, selecciona otro horario.',
          code: 'SLOT_UNAVAILABLE'
        },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        message: 'No se pudo crear la visita. Por favor, intenta nuevamente.'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Endpoint para obtener visitas del usuario
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'userId es requerido' },
        { status: 400 }
      );
    }
    
    // Filtrar visitas por usuario
    const userVisits = Object.values(mockVisits).filter(
      visit => visit.userId === userId
    );
    
    // Agrupar por estado
    const upcoming = userVisits.filter(
      visit => visit.status === 'confirmed' && new Date(mockSlots[visit.slotId]?.startTime || '') > new Date()
    );
    
    const past = userVisits.filter(
      visit => visit.status === 'completed' || new Date(mockSlots[visit.slotId]?.startTime || '') <= new Date()
    );
    
    const canceled = userVisits.filter(visit => visit.status === 'canceled');
    
    return NextResponse.json({
      upcoming,
      past,
      canceled
    });
    
  } catch (error) {
    logger.error('❌ Error obteniendo visitas:', error);
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
