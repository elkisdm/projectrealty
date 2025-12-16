import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createRateLimiter } from '@lib/rate-limit';
import { logger } from '@lib/logger';
import { supabaseAdmin } from '@lib/supabase';
import { 
  CreateVisitRequest, 
  CreateVisitResponse, 
  Visit, 
  VisitSlot,
  Agent,
  OPERATIONAL_HOURS
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
  contactData: z.object({
    name: z.string().min(1, 'Nombre es requerido'),
    phone: z.string().min(1, 'Teléfono es requerido'),
    email: z.string().email('Email inválido').optional(),
  }).optional(),
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

// Función para crear visita en Supabase
async function createVisitInSupabase(visitData: CreateVisitRequest): Promise<{ visit: Visit; slot: VisitSlot }> {
  if (!supabaseAdmin) {
    throw new Error('Supabase no configurado');
  }

  // 1. Verificar idempotencia primero
  const { data: existingVisit } = await supabaseAdmin
    .from('visits')
    .select('id, status, slot_id')
    .eq('idempotency_key', visitData.idempotencyKey)
    .single();

  if (existingVisit) {
    // Retornar visita existente
    const { data: existingSlot } = await supabaseAdmin
      .from('visit_slots')
      .select('*')
      .eq('id', existingVisit.slot_id)
      .single();

    if (existingSlot) {
      const visit: Visit = {
        id: existingVisit.id,
        listingId: visitData.listingId,
        slotId: existingVisit.slot_id,
        userId: visitData.userId,
        status: existingVisit.status as Visit['status'],
        createdAt: new Date().toISOString(),
        idempotencyKey: visitData.idempotencyKey,
        agentId: 'agent_001'
      };

      const slot: VisitSlot = {
        id: existingSlot.id,
        listingId: existingSlot.listing_id,
        startTime: existingSlot.start_time,
        endTime: existingSlot.end_time,
        status: existingSlot.status as VisitSlot['status'],
        source: existingSlot.source as VisitSlot['source'],
        createdAt: existingSlot.created_at
      };

      return { visit, slot };
    }
  }

  // 2. Verificar o crear el slot
  let slot: VisitSlot;
  const { data: existingSlot } = await supabaseAdmin
    .from('visit_slots')
    .select('*')
    .eq('id', visitData.slotId)
    .single();

  if (existingSlot) {
    // Verificar que el slot esté disponible
    if (existingSlot.status !== 'open') {
      throw new Error('Slot no disponible o ya reservado');
    }
    slot = {
      id: existingSlot.id,
      listingId: existingSlot.listing_id,
      startTime: existingSlot.start_time,
      endTime: existingSlot.end_time,
      status: existingSlot.status as VisitSlot['status'],
      source: existingSlot.source as VisitSlot['source'],
      createdAt: existingSlot.created_at
    };
  } else if (visitData.slotId.startsWith('mock-slot-')) {
    // Crear slot mock si no existe
    const withoutPrefix = visitData.slotId.replace('mock-slot-', '');
    const timeMatch = withoutPrefix.match(/-(\d{2}:\d{2})$/);
    
    if (!timeMatch) {
      throw new Error('Slot no disponible: formato inválido');
    }

    const time = timeMatch[1]; // HH:MM
    const datePart = withoutPrefix.replace(`-${time}`, ''); // YYYY-MM-DD
    
    const startTime = `${datePart}T${time}:00-03:00`;
    const endTime = `${datePart}T${time}:30:00-03:00`;

    const { data: newSlot, error: slotError } = await supabaseAdmin
      .from('visit_slots')
      .insert({
        id: visitData.slotId,
        listing_id: visitData.listingId,
        start_time: startTime,
        end_time: endTime,
        status: 'open',
        source: 'system'
      })
      .select()
      .single();

    if (slotError) {
      logger.error('❌ Error creando slot:', slotError);
      throw new Error('Error al crear el slot de visita');
    }

    slot = {
      id: newSlot.id,
      listingId: newSlot.listing_id,
      startTime: newSlot.start_time,
      endTime: newSlot.end_time,
      status: newSlot.status as VisitSlot['status'],
      source: newSlot.source as VisitSlot['source'],
      createdAt: newSlot.created_at
    };
  } else {
    throw new Error('Slot no disponible');
  }

  // 3. Bloquear slot y crear visita en una transacción
  // Usar rpc o múltiples queries atómicas
  const visitId = `visit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Actualizar slot a 'confirmed' y crear visita en paralelo
  const [slotUpdateResult, visitInsertResult] = await Promise.all([
    supabaseAdmin
      .from('visit_slots')
      .update({ status: 'confirmed', updated_at: new Date().toISOString() })
      .eq('id', visitData.slotId)
      .eq('status', 'open') // Solo actualizar si sigue abierto
      .select()
      .single(),
    supabaseAdmin
      .from('visits')
      .insert({
        id: visitId,
        listing_id: visitData.listingId,
        slot_id: visitData.slotId,
        user_id: visitData.userId,
        status: 'confirmed',
        idempotency_key: visitData.idempotencyKey,
        agent_id: 'agent_001',
        channel: visitData.channel || 'web'
      })
      .select()
      .single()
  ]);

  if (slotUpdateResult.error) {
    logger.error('❌ Error actualizando slot:', slotUpdateResult.error);
    throw new Error('Slot no disponible o ya reservado');
  }

  if (visitInsertResult.error) {
    logger.error('❌ Error creando visita:', visitInsertResult.error);
    
    // Si falla por idempotencia duplicada, buscar la visita existente
    if (visitInsertResult.error.code === '23505') { // Unique constraint violation
      const { data: existingVisitData } = await supabaseAdmin
        .from('visits')
        .select('*')
        .eq('idempotency_key', visitData.idempotencyKey)
        .single();

      if (existingVisitData) {
        const visit: Visit = {
          id: existingVisitData.id,
          listingId: existingVisitData.listing_id,
          slotId: existingVisitData.slot_id,
          userId: existingVisitData.user_id,
          status: existingVisitData.status as Visit['status'],
          createdAt: existingVisitData.created_at,
          idempotencyKey: existingVisitData.idempotency_key,
          agentId: existingVisitData.agent_id
        };

        return { visit, slot };
      }
    }

    throw new Error('Error al crear la visita');
  }

  const visit: Visit = {
    id: visitInsertResult.data.id,
    listingId: visitInsertResult.data.listing_id,
    slotId: visitInsertResult.data.slot_id,
    userId: visitInsertResult.data.user_id,
    status: visitInsertResult.data.status as Visit['status'],
    createdAt: visitInsertResult.data.created_at,
    idempotencyKey: visitInsertResult.data.idempotency_key,
    agentId: visitInsertResult.data.agent_id
  };

  // Actualizar slot local
  slot.status = 'confirmed';

  // 4. Guardar datos de contacto si están presentes
  if (visitData.contactData) {
    const { error: contactError } = await supabaseAdmin
      .from('visit_contacts')
      .insert({
        visit_id: visit.id,
        name: visitData.contactData.name,
        phone: visitData.contactData.phone,
        email: visitData.contactData.email || null
      });

    if (contactError) {
      logger.error('❌ Error guardando contacto:', contactError);
      // No fallar la visita si falla guardar el contacto, solo loguear
    }
  }

  return { visit, slot };
}

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
  async lockSlot(slotId: string, listingId?: string): Promise<VisitSlot | null> {
    const slot = mockSlots[slotId];
    
    // Si es un slot mock (creado en el frontend), aceptarlo siempre
    if (slotId.startsWith('mock-slot-')) {
      // Simular delay de base de datos
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Parsear mock-slot-{date}-{time}
      // Ejemplo: mock-slot-2025-01-15-09:00
      // El formato es: mock-slot-YYYY-MM-DD-HH:MM
      const withoutPrefix = slotId.replace('mock-slot-', '');
      // Buscar el patrón de tiempo (HH:MM) al final
      const timeMatch = withoutPrefix.match(/-(\d{2}:\d{2})$/);
      
      if (timeMatch) {
        const time = timeMatch[1]; // HH:MM
        const datePart = withoutPrefix.replace(`-${time}`, ''); // YYYY-MM-DD
        
        const mockSlot: VisitSlot = {
          id: slotId,
          listingId: listingId || 'unknown',
          startTime: `${datePart}T${time}:00-03:00`,
          endTime: `${datePart}T${time}:30:00-03:00`,
          status: 'open',
          source: 'system',
          createdAt: new Date().toISOString()
        };
        
        // Guardar en mockSlots para referencia futura
        mockSlots[slotId] = mockSlot;
        
        return mockSlot;
      }
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
  async createVisitTransaction(visitData: CreateVisitRequest): Promise<{ visit: Visit; slot: VisitSlot }> {
    // 1. Bloquear el slot (pasar listingId para mock slots)
    let slot = await this.lockSlot(visitData.slotId, visitData.listingId);
    
    // Si es un slot mock y no se encontró, crearlo automáticamente
    if (!slot && visitData.slotId.startsWith('mock-slot-')) {
      // Parsear mock-slot-{date}-{time}
      // Ejemplo: mock-slot-2025-01-15-09:00
      const withoutPrefix = visitData.slotId.replace('mock-slot-', '');
      const timeMatch = withoutPrefix.match(/-(\d{2}:\d{2})$/);
      
      if (timeMatch) {
        const time = timeMatch[1]; // HH:MM
        const datePart = withoutPrefix.replace(`-${time}`, ''); // YYYY-MM-DD
        
        slot = {
          id: visitData.slotId,
          listingId: visitData.listingId,
          startTime: `${datePart}T${time}:00-03:00`,
          endTime: `${datePart}T${time}:30:00-03:00`,
          status: 'open',
          source: 'system',
          createdAt: new Date().toISOString()
        };
        
        // Guardar en mockSlots
        mockSlots[visitData.slotId] = slot;
      } else {
        // Si no se puede parsear el mock slot, lanzar error descriptivo
        logger.error('❌ Error parseando mock slot:', { slotId: visitData.slotId });
        throw new Error('Slot no disponible: formato inválido');
      }
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
        const existingSlot = mockSlots[existingVisit.slotId];
        if (existingSlot) {
          return { visit: existingVisit, slot: existingSlot };
        }
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

    // Nota: En mock, los datos de contacto no se guardan persistentemente
    // Solo se usan para logging/desarrollo (sin PII)
    if (visitData.contactData) {
      logger.log(`📝 Contacto recibido (mock) para visita ${visit.id}`);
    }
    
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
    
    return { visit, slot };
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
      
      if (date.getDay() >= 1 && date.getDay() <= 6) { // Solo días laborales (lunes-sábado, excluyendo domingos)
        const timeSlots = ['09:00', '10:00', '11:00', '15:00', '16:00', '17:00'];
        
        timeSlots.forEach(time => {
          const [hours, minutes] = time.split(':').map(Number);
          const slotDate = new Date(date);
          slotDate.setHours(hours, minutes, 0, 0);
          
          const slotId = `slot_${date.getTime()}_${time}`;
          mockSlots[slotId] = {
            id: slotId,
            listingId: 'guillermo-mann-74012ca7',
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
        listingId: 'guillermo-mann',
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

    // Determinar si usar Supabase o mock
    const USE_SUPABASE = process.env.USE_SUPABASE === 'true';

    // Validación server-side: Verificar horarios y días permitidos
    // Primero obtener el slot para validar fecha/hora
    let slotToValidate: VisitSlot | null = null;
    
    if (USE_SUPABASE && supabaseAdmin) {
      const { data: slotData } = await supabaseAdmin
        .from('visit_slots')
        .select('*')
        .eq('id', visitData.slotId)
        .single();
      
      if (slotData) {
        slotToValidate = {
          id: slotData.id,
          listingId: slotData.listing_id,
          startTime: slotData.start_time,
          endTime: slotData.end_time,
          status: slotData.status as VisitSlot['status'],
          source: slotData.source as VisitSlot['source'],
          createdAt: slotData.created_at
        };
      }
    } else {
      // Para mock, parsear directamente del slotId si es mock-slot
      if (visitData.slotId.startsWith('mock-slot-')) {
        const withoutPrefix = visitData.slotId.replace('mock-slot-', '');
        const timeMatch = withoutPrefix.match(/-(\d{2}:\d{2})$/);
        
        if (timeMatch) {
          const time = timeMatch[1];
          const datePart = withoutPrefix.replace(`-${time}`, '');
          slotToValidate = {
            id: visitData.slotId,
            listingId: visitData.listingId,
            startTime: `${datePart}T${time}:00-03:00`,
            endTime: `${datePart}T${time}:30:00-03:00`,
            status: 'open',
            source: 'system',
            createdAt: new Date().toISOString()
          };
        }
      } else {
        // Para slots reales en mock, intentar obtenerlo
        const db = MockDatabase.getInstance();
        db.initializeMockData();
        slotToValidate = await db.lockSlot(visitData.slotId, visitData.listingId);
      }
    }

    // Validar slot si se pudo obtener
    if (slotToValidate) {
      const slotStartTime = new Date(slotToValidate.startTime);
      const dayOfWeek = slotStartTime.getDay();
      const hours = slotStartTime.getHours();
      const minutes = slotStartTime.getMinutes();
      const timeInMinutes = hours * 60 + minutes;
      const startMinutes = OPERATIONAL_HOURS.start * 60; // 9:00 = 540
      const endMinutes = OPERATIONAL_HOURS.end * 60; // 20:00 = 1200
      
      // Validar que no sea domingo
      if (dayOfWeek === 0) {
        return NextResponse.json(
          { 
            error: 'Horario no disponible',
            message: 'No se pueden agendar visitas los domingos',
            code: 'INVALID_DAY'
          },
          { status: 400 }
        );
      }
      
      // Validar que esté en horario operacional (9:00-20:00)
      if (timeInMinutes < startMinutes || timeInMinutes >= endMinutes) {
        return NextResponse.json(
          { 
            error: 'Horario no disponible',
            message: `Los horarios disponibles son de ${OPERATIONAL_HOURS.start}:00 a ${OPERATIONAL_HOURS.end}:00 hrs`,
            code: 'INVALID_TIME'
          },
          { status: 400 }
        );
      }
      
      // Validar que no sea en el pasado
      if (slotStartTime < new Date()) {
        return NextResponse.json(
          { 
            error: 'Horario no disponible',
            message: 'No se pueden agendar visitas en el pasado',
            code: 'PAST_TIME'
          },
          { status: 400 }
        );
      }
    }
    
    let visit: Visit;
    let slot: VisitSlot;
    
    if (USE_SUPABASE) {
      // Usar Supabase para persistencia real
      const result = await createVisitInSupabase(visitData);
      visit = result.visit;
      slot = result.slot;
    } else {
      // Usar mock para desarrollo
      const db = MockDatabase.getInstance();
      db.initializeMockData();
      const result = await db.createVisitTransaction(visitData);
      visit = result.visit;
      slot = result.slot;
    }
    
    // Obtener agente
    const agent = mockAgents[visit.agentId];
    if (!agent) {
      throw new Error('Agente no encontrado');
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
            'X-RateLimit-Limit': '20',
            'X-RateLimit-Window': '60'
          }
        }
      );
    }

    // Endpoint para obtener visitas del usuario
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'userId es requerido' },
        { status: 400 }
      );
    }
    
    const USE_SUPABASE = process.env.USE_SUPABASE === 'true';
    
    let upcoming: Visit[] = [];
    let past: Visit[] = [];
    let canceled: Visit[] = [];
    
    if (USE_SUPABASE && supabaseAdmin) {
      // Consultar desde Supabase
      try {
        const { data: dbVisits, error } = await supabaseAdmin
          .from('visits')
          .select('*, visit_slots(start_time, end_time)')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) {
          logger.error('❌ Error consultando visitas en Supabase:', error);
          throw error;
        }

        // Obtener slots para todas las visitas
        const slotIds = [...new Set((dbVisits || []).map(v => v.slot_id))];
        const { data: dbSlots } = await supabaseAdmin
          .from('visit_slots')
          .select('id, start_time, end_time')
          .in('id', slotIds);

        const slotsMap = new Map((dbSlots || []).map(s => [s.id, s]));

        const now = new Date();
        const visits: Visit[] = (dbVisits || []).map(dbVisit => ({
          id: dbVisit.id,
          listingId: dbVisit.listing_id,
          slotId: dbVisit.slot_id,
          userId: dbVisit.user_id,
          status: dbVisit.status as Visit['status'],
          createdAt: dbVisit.created_at,
          idempotencyKey: dbVisit.idempotency_key,
          agentId: dbVisit.agent_id
        }));

        // Agrupar por estado
        upcoming = visits.filter(visit => {
          const slot = slotsMap.get(visit.slotId);
          if (!slot) return false;
          return visit.status === 'confirmed' && new Date(slot.start_time) > now;
        });

        past = visits.filter(visit => {
          const slot = slotsMap.get(visit.slotId);
          if (!slot) return false;
          return visit.status === 'completed' || new Date(slot.start_time) <= now;
        });

        canceled = visits.filter(visit => visit.status === 'canceled');
      } catch (error) {
        logger.error('❌ Error procesando visitas:', error);
        // Fallback a mock en caso de error
        const userVisits = Object.values(mockVisits).filter(
          visit => visit.userId === userId
        );
        
        upcoming = userVisits.filter(
          visit => visit.status === 'confirmed' && new Date(mockSlots[visit.slotId]?.startTime || '') > new Date()
        );
        
        past = userVisits.filter(
          visit => visit.status === 'completed' || new Date(mockSlots[visit.slotId]?.startTime || '') <= new Date()
        );
        
        canceled = userVisits.filter(visit => visit.status === 'canceled');
      }
    } else {
      // Usar mock para desarrollo
      const userVisits = Object.values(mockVisits).filter(
        visit => visit.userId === userId
      );
      
      upcoming = userVisits.filter(
        visit => visit.status === 'confirmed' && new Date(mockSlots[visit.slotId]?.startTime || '') > new Date()
      );
      
      past = userVisits.filter(
        visit => visit.status === 'completed' || new Date(mockSlots[visit.slotId]?.startTime || '') <= new Date()
      );
      
      canceled = userVisits.filter(visit => visit.status === 'canceled');
    }
    
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
