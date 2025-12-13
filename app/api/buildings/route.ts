import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseProcessor } from '@/lib/supabase-data-processor';
import { createRateLimiter } from '@lib/rate-limit';
import { logger } from '@lib/logger';

// Rate limiter: 20 requests per minute per IP
const rateLimiter = createRateLimiter({ windowMs: 60_000, max: 20 });

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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    
    const offset = (page - 1) * limit;
    
    const processor = await getSupabaseProcessor();
    const result = await processor.getLandingBuildings(limit, offset);
    
    // Convertir LandingBuilding a BuildingSummary
    const buildings = result.buildings.map(building => ({
      id: building.id,
      slug: building.slug,
      name: building.name,
      comuna: building.comuna,
      address: building.address,
      coverImage: building.coverImage,
      gallery: building.gallery,
      precioDesde: building.precioDesde,
      hasAvailability: building.hasAvailability,
      badges: building.badges.map(badge => ({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Badge type compatibility with API response
        type: badge.type as unknown as string,
        label: badge.label,
        description: badge.description,
      })),
      amenities: building.amenities,
      typologySummary: building.typologySummary,
    }));

    return NextResponse.json({
      buildings,
      total: result.total,
      hasMore: result.hasMore,
      page,
      limit
    });
    
  } catch (error) {
    logger.error('Error en API buildings:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}