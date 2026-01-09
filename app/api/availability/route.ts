import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createRateLimiter } from '@lib/rate-limit';
import { logger } from '@lib/logger';
import { 
  AvailabilityResponse, 
  VisitSlot, 
  formatRFC3339,
  TIME_SLOTS_30MIN 
} from '@/types/visit';

// Rate limiter: 20 requests per minute per IP
const rateLimiter = createRateLimiter({ windowMs: 60_000, max: 20 });

// Schema de validación para query params
const availabilityQuerySchema = z.object({
  listingId: z.string().min(1, 'listingId es requerido'),
  start: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/, 'Formato RFC 3339 requerido'),
  end: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/, 'Formato RFC 3339 requerido'),
});

// Mock data para desarrollo (en producción vendría de base de datos)
const generateMockSlots = (listingId: string, startDate: Date, endDate: Date): VisitSlot[] => {
  const slots: VisitSlot[] = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    // Solo generar slots para días laborales (lunes a viernes)
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      
      TIME_SLOTS_30MIN.forEach(time => {
        const [hours, minutes] = time.split(':').map(Number);
        const slotDate = new Date(currentDate);
        slotDate.setHours(hours, minutes, 0, 0);
        
        // Solo slots futuros (permitir slots de hoy en adelante)
        const now = new Date();
        now.setHours(0, 0, 0, 0); // Resetear a medianoche para comparar solo fechas
        if (slotDate >= now) {
          const startTime = formatRFC3339(slotDate);
          const endTime = formatRFC3339(new Date(slotDate.getTime() + 30 * 60 * 1000));
          
          // Simular disponibilidad (80% disponible)
          const isAvailable = Math.random() > 0.2;
          
          slots.push({
            id: `slot_${listingId}_${slotDate.getTime()}`,
            listingId,
            startTime,
            endTime,
            status: isAvailable ? 'open' : 'blocked',
            source: 'system',
            createdAt: new Date().toISOString()
          });
        }
      });
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return slots;
};

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
    
    // Parsear y validar query params
    const { searchParams } = new URL(request.url);
    const queryParams = {
      listingId: searchParams.get('listingId'),
      start: searchParams.get('start'),
      end: searchParams.get('end'),
    };
    
    const validation = availabilityQuerySchema.safeParse(queryParams);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Parámetros inválidos', 
          details: validation.error.errors 
        }, 
        { status: 400 }
      );
    }
    
    const { listingId, start, end } = validation.data;
    
    // Validar que start < end
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    if (startDate >= endDate) {
      return NextResponse.json(
        { error: 'La fecha de inicio debe ser anterior a la fecha de fin' },
        { status: 400 }
      );
    }
    
    // Validar que no se soliciten más de 7 días (una semana completa)
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > 7) {
      return NextResponse.json(
        { error: 'No se pueden consultar más de 7 días de disponibilidad' },
        { status: 400 }
      );
    }
    
    // Generar slots disponibles (en producción consultar base de datos)
    const slots = generateMockSlots(listingId, startDate, endDate);
    
    // Filtrar solo slots abiertos
    const availableSlots = slots.filter(slot => slot.status === 'open');
    
    // Calcular próxima fecha disponible si no hay slots
    let nextAvailableDate: string | undefined;
    if (availableSlots.length === 0) {
      const nextDate = new Date(endDate);
      nextDate.setDate(nextDate.getDate() + 1);
      nextAvailableDate = formatRFC3339(nextDate);
    }
    
    const response: AvailabilityResponse = {
      listingId,
      timezone: 'America/Santiago', // Hardcoded para Chile por ahora
      slots: availableSlots,
      nextAvailableDate
    };
    
    // Log de métricas (sin PII)
    logger.log(`📊 Disponibilidad consultada para listing ${listingId}: ${availableSlots.length} slots disponibles`);
    
    return NextResponse.json(response);
    
  } catch (error) {
    logger.error('❌ Error en API de disponibilidad:', error);
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        message: 'No se pudo consultar la disponibilidad'
      },
      { status: 500 }
    );
  }
}
