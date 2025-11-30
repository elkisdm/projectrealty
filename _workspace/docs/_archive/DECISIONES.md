# DECISIONES TÉCNICAS (ADR)

## ADR-001: Render Strategy
**Fecha:** 2024-01-01  
**Estado:** Aceptado

**Contexto:** Necesitamos optimizar performance y SEO.

**Decisión:** RSC + ISR donde suma, "use client" solo para estado/efectos.

**Consecuencias:**
- ✅ Mejor SEO y performance
- ✅ Menos JavaScript en cliente
- ❌ Complejidad en data fetching

---

## ADR-002: Data Source Migration
**Fecha:** 2024-01-01  
**Estado:** En progreso

**Contexto:** Datos mock vs Supabase.

**Decisión:** Migrar de mock a Supabase gradualmente.

**Consecuencias:**
- ✅ Datos reales y persistentes
- ✅ Escalabilidad
- ❌ Complejidad de migración

---

## ADR-003: Promotion System
**Fecha:** 2024-01-01  
**Estado:** Pendiente

**Contexto:** Sistema de promociones dinámico.

**Decisión:** Overrides configurables + promociones por propiedad.

**Consecuencias:**
- ✅ Flexibilidad de marketing
- ✅ A/B testing
- ❌ Complejidad de UI

---

## ADR-004: WhatsApp Integration
**Fecha:** 2024-01-01  
**Estado:** Aceptado

**Contexto:** Deep link para contacto directo.

**Decisión:** WhatsApp deep link con pre-filled message.

**Consecuencias:**
- ✅ Conversión directa
- ✅ UX simplificada
- ❌ Dependencia externa
