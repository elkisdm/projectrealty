# Rate-limit en debug* y test

## Contexto
Los endpoints de debug y test son críticos para el desarrollo y testing, pero pueden ser vulnerables a abuso. Se implementó rate limiting para proteger estos endpoints.

## Implementación

### Endpoints Protegidos
- `GET /api/debug` - Endpoint de debug general
- `GET /api/debug-admin` - Endpoint de debug con permisos admin
- `GET /api/test` - Endpoint de pruebas
- `POST /api/flags/override` - Endpoint de override de feature flags

### Configuración de Rate Limiting

#### Endpoints debug y test
```typescript
const limiter = createRateLimiter({ windowMs: 60_000, max: 20 });
```
- **Ventana**: 60 segundos (1 minuto)
- **Máximo**: 20 requests por IP
- **Headers**: Incluye `Retry-After` en respuesta 429

#### Endpoint flags/override
```typescript
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minuto
const RATE_LIMIT_MAX_REQUESTS = 5;
```
- **Ventana**: 60 segundos (1 minuto)
- **Máximo**: 5 requests por IP (más restrictivo por ser admin)

### Detección de IP
```typescript
const ipHeader = request.headers.get("x-forwarded-for");
const ip = ipHeader ? ipHeader.split(",")[0].trim() : "unknown";
```

### Respuesta de Rate Limit
```typescript
return NextResponse.json(
  { error: "rate_limited" },
  { status: 429, headers: { "Retry-After": String(retryAfter ?? 60) } }
);
```

## Beneficios
- ✅ Protección contra abuso de endpoints sensibles
- ✅ Prevención de spam en endpoints de debug
- ✅ Control granular por tipo de endpoint
- ✅ Headers estándar HTTP para rate limiting
- ✅ Implementación in-memory eficiente

## Consideraciones
- El rate limiting es in-memory (se resetea al reiniciar el servidor)
- Para producción, considerar Redis o similar para persistencia
- Los límites son apropiados para desarrollo/testing
- Endpoints admin tienen límites más restrictivos

## Testing
Los endpoints incluyen logging para monitoreo:
- `🔍 Endpoint de debug llamado`
- `🔍 Endpoint de debug admin llamado`
- `🧪 Endpoint de prueba llamado`
