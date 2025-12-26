# 🎯 MASTER CONTROL - Sistema de Cotizaciones
<!-- ARCHIVO ÚNICO DE CONTROL - Lee solo este archivo para saber exactamente qué hacer -->

---

## 🔥 ESTADO ACTUAL: 2025-01-27

**STATUS**: 🟢 **SPRINT_8_COMPLETED** - Sistema básico completo  
**PROGRESO**: 100% Sistema básico | 100% Core implementado  
**NEXT_ACTION**: Sistema listo para testing en desarrollo  
**ESTIMATED_TIME**: 15min  

---

## ⚡ ACCIÓN INMEDIATA

### 🎯 LO QUE DEBES HACER AHORA:

1. **Verificar estado build actual**:
   ```bash
   # Verificación mínima (debe pasar)
   pnpm typecheck
   
   # Verificación completa (tiene issue conocido en coming-soon)
   # pnpm build  # ⚠️ Temporalmente skip por error SSR en coming-soon
   ```

2. **Crear archivo exacto**: `schemas/quotation.ts`
   ```typescript
   // schemas/quotation.ts
   import { z } from "zod";

   export const QuotationInputSchema = z.object({
     unitId: z.string().min(1, "unitId requerido"),
     startDate: z.string().refine(s => !isNaN(Date.parse(s)), "Fecha inválida"),
     options: z.object({
       parkingSelected: z.boolean().default(false),
       storageSelected: z.boolean().default(false),
       parkingPrice: z.number().int().nonnegative().optional(),
       storagePrice: z.number().int().nonnegative().optional(),
       creditReportFee: z.number().int().nonnegative().default(6000),
     }).default({}),
   });

   export type QuotationInput = z.infer<typeof QuotationInputSchema>;

   export const QuotationResultSchema = z.object({
     meta: z.object({
       unitId: z.string(),
       buildingId: z.string(),
       startDate: z.string(),
       daysCharged: z.number().int().positive(),
       daysInMonth: z.number().int().positive(),
       prorationFactor: z.number().min(0).max(1),
       currency: z.literal("CLP"),
     }),
     lines: z.object({
       baseMonthly: z.number().int(),
       proratedRent: z.number().int(),
       discountPromo: z.number().int(),
       netRent: z.number().int(),
       gcMonthly: z.number().int(),
       gcProrated: z.number().int(),
       guaranteeTotal: z.number().int(),
       guaranteeEntry: z.number().int(),
       guaranteeInstallments: z.number().int(),
       guaranteeMonths: z.number().int(),
       commission: z.number().int(),
       creditReportFee: z.number().int(),
     }),
     totals: z.object({
       firstPayment: z.number().int(),
     }),
     flags: z.object({
       hasFreeCommission: z.boolean(),
       discountPercent: z.number().int().min(0).max(100),
     })
   });

   export type QuotationResult = z.infer<typeof QuotationResultSchema>;
   ```

3. **Verificar que funciona**:
   ```bash
   pnpm typecheck
   ```

4. **Si funciona, actualizar este archivo**:
   - Cambiar STATUS a `SPRINT_1_STEP_2`
   - Cambiar NEXT_ACTION a próximo paso

---

## 🚦 MATRIZ DE ESTADOS

| STATUS | ARCHIVO A CREAR | NEXT_ACTION | TIME |
|--------|----------------|-------------|------|
| **SPRINT_1_STEP_1** | `schemas/quotation.ts` | Crear schemas Zod | 15min |
| **SPRINT_1_STEP_2** | `lib/quotation.ts` | Crear motor de cálculo | 45min |
| **SPRINT_2_STEP_1** | Modificar `lib/data.ts` | Añadir getUnitWithBuilding | 30min |
| **SPRINT_3_STEP_1** | `app/api/quotations/route.ts` | API endpoint POST | 45min |
| **SPRINT_4_STEP_1** | Instalar deps | `pnpm add @react-pdf/renderer resend` | 5min |
| **SPRINT_4_STEP_2** | `components/pdf/QuotationPDF.tsx` | Componente PDF | 60min |
| **SPRINT_4_STEP_3** | `app/api/quotations/[id]/pdf/route.ts` | PDF endpoint | 30min |
| **SPRINT_5_STEP_1** | `lib/notify.ts` | Sistema notificaciones | 45min |
| **SPRINT_6_STEP_1** | `components/quotation/QuoteWidget.tsx` | UI widget | 60min |
| **SPRINT_7_STEP_1** | `tests/unit/quotation.test.ts` | Tests unitarios | 60min |
| **SPRINT_8_STEP_1** | Integration testing | E2E verification | 30min |

---

## 📋 CÓDIGO DE PRÓXIMOS PASOS

### Para SPRINT_1_STEP_2 (Motor de cálculo):

```typescript
// lib/quotation.ts
import { QuotationResult } from "@/schemas/quotation";
import { Building, Unit, PromotionBadge } from "@/schemas/models";

const IVA = 0.19;

function daysInMonth(y: number, m: number) {
  return new Date(y, m, 0).getDate();
}

function inclusiveDaysFrom(date: Date) {
  const dim = daysInMonth(date.getFullYear(), date.getMonth() + 1);
  return (dim - date.getDate()) + 1;
}

function getDiscountPercent(badges?: PromotionBadge[]) {
  const pct = (badges ?? [])
    .filter(b => b.type === "discount_percent")
    .map(b => {
      const maybe = parseInt(b.tag ?? b.label ?? "0", 10);
      return isNaN(maybe) ? 0 : maybe;
    });
  return pct.length ? Math.max(...pct) : 0;
}

function hasFreeCommission(badges?: PromotionBadge[]) {
  return (badges ?? []).some(b => b.type === "free_commission");
}

export function computeQuotation(
  unit: Unit,
  building: Building,
  startDateISO: string,
  opts?: {
    parkingSelected?: boolean;
    storageSelected?: boolean;
    parkingPrice?: number;
    storagePrice?: number;
    creditReportFee?: number;
  }
): QuotationResult {
  const date = new Date(startDateISO);
  const dim = daysInMonth(date.getFullYear(), date.getMonth() + 1);
  const days = inclusiveDaysFrom(date);
  const proration = days / dim;

  const addParking = opts?.parkingSelected ? (opts?.parkingPrice ?? 0) : 0;
  const addStorage = opts?.storageSelected ? (opts?.storagePrice ?? 0) : 0;
  const baseMonthly = Math.round(unit.price + addParking + addStorage);

  const gcMonthly = building.gc_mode === "MF" && (building as any).gc_amount
    ? Math.round((building as any).gc_amount)
    : Math.round(unit.price * 0.18);

  const proratedRent = Math.round(baseMonthly * proration);

  const discountPercent = Math.max(
    getDiscountPercent(unit.promotions),
    getDiscountPercent(building.badges)
  );
  const discountPromo = Math.round(proratedRent * (discountPercent / 100));
  const netRent = proratedRent - discountPromo;

  const gcProrated = Math.round(gcMonthly * proration);

  const guaranteeMonths = unit.guarantee_months ?? 1;
  const guaranteeInstallments = unit.guarantee_installments ?? 3;
  const guaranteeTotal = Math.round(baseMonthly * guaranteeMonths);
  const guaranteeEntry = Math.round(guaranteeTotal / guaranteeInstallments);

  const freeComm = hasFreeCommission(unit.promotions) || hasFreeCommission(building.badges);
  const commissionBase = Math.round(baseMonthly * 0.5);
  const commission = freeComm ? 0 : Math.round(commissionBase * (1 + IVA));

  const creditReportFee = opts?.creditReportFee ?? 6000;
  const firstPayment = netRent + gcProrated + guaranteeEntry + creditReportFee + commission;

  return {
    meta: {
      unitId: unit.id,
      buildingId: building.id,
      startDate: startDateISO,
      daysCharged: days,
      daysInMonth: dim,
      prorationFactor: proration,
      currency: "CLP",
    },
    lines: {
      baseMonthly,
      proratedRent,
      discountPromo,
      netRent,
      gcMonthly,
      gcProrated,
      guaranteeTotal,
      guaranteeEntry,
      guaranteeInstallments,
      guaranteeMonths,
      commission,
      creditReportFee,
    },
    totals: { firstPayment },
    flags: { hasFreeCommission: freeComm, discountPercent }
  };
}
```

### Para SPRINT_2_STEP_1 (Data Access):

**Modificar `lib/data.ts` - Añadir al final**:
```typescript
export async function getUnitWithBuilding(unitId: string): Promise<{ unit: Unit; building: Building } | null> {
  try {
    const buildings = await readBuildingsData();
    if (!buildings) return null;

    for (const building of buildings) {
      const unit = building.units?.find(u => u.id === unitId);
      if (unit) {
        return { unit, building };
      }
    }
    return null;
  } catch (error) {
    console.error('Error getting unit with building:', error);
    throw error;
  }
}
```

---

## 🚫 LIMITACIONES CRÍTICAS

### ❌ NUNCA MODIFICAR:
- `schemas/models.ts` - Solo importar, NUNCA cambiar
- `app/api/buildings/` - Sistema existente
- `app/api/booking/` - Sistema existente  
- `lib/supabase.ts` - Cliente configurado
- `tests/` - Solo añadir nuevos, no modificar existentes

### ✅ SEGURO CREAR/MODIFICAR:
- `schemas/quotation.ts` - Nuevo archivo
- `lib/quotation.ts` - Nuevo archivo
- `lib/data.ts` - Solo añadir getUnitWithBuilding
- `app/api/quotations/` - Nueva ruta completa
- `components/quotation/` - Nuevo directorio
- `components/pdf/` - Nuevo directorio

---

## 🧪 VERIFICACIÓN AUTOMÁTICA

### Después de cada paso:
```bash
# Verificación mínima (DEBE PASAR)
pnpm typecheck && echo "✅ TypeScript OK"

# Verificación completa (skip build por issue coming-soon)
pnpm lint && pnpm typecheck && pnpm test
# pnpm build  # ⚠️ Skip temporalmente por error SSR
```

### Test específico por step:
```bash
# SPRINT_1_STEP_1: Schemas
pnpm dlx tsx -e "import { QuotationInputSchema } from './schemas/quotation.ts'; console.log('✅ Schemas OK')"

# SPRINT_1_STEP_2: Motor
pnpm dlx tsx -e "import { computeQuotation } from './lib/quotation.ts'; console.log('✅ Motor OK')"

# SPRINT_2_STEP_1: Data
pnpm dlx tsx -e "import { getUnitWithBuilding } from './lib/data.ts'; console.log('✅ Data access OK')"
```

---

## 📊 CÓMO ACTUALIZAR ESTE ARCHIVO

### Después de completar cada paso:

1. **Cambiar STATUS** en la línea 7:
   ```
   **STATUS**: 🟡 **SPRINT_X_STEP_Y** - Descripción del próximo paso
   ```

2. **Actualizar NEXT_ACTION** en la línea 9:
   ```
   **NEXT_ACTION**: Lo que hay que hacer exactamente ahora
   ```

3. **Incrementar PROGRESO** en la línea 8:
   ```
   **PROGRESO**: X% Sistema completo | Y% Sprint actual
   ```

### Estados de progreso:
- 🔴 No iniciado  
- 🟡 En progreso
- 🟢 Completado

---

## 🎯 DEPENDENCIES CHECK

### Instaladas ✅:
- `zod` - Validación
- `@tanstack/react-query` - State management  
- `framer-motion` - Animaciones

### Pendientes ❌:
```bash
# Instalar cuando llegues a SPRINT_4_STEP_1
pnpm add @react-pdf/renderer resend
pnpm add -D @types/react-pdf
```

### Environment Variables ❌:
```bash
# Configurar cuando llegues a SPRINT_5
RESEND_API_KEY=re_your_key_here
APP_URL=https://your-domain.com  
MANYCHAT_WEBHOOK_URL=https://optional.com
```

---

## 🆘 TROUBLESHOOTING

### "Cannot resolve @/schemas/quotation":
- STATUS debe ser mínimo SPRINT_1_STEP_2
- Verificar que `schemas/quotation.ts` existe

### "Cannot find getUnitWithBuilding":  
- STATUS debe ser mínimo SPRINT_2_STEP_2
- Verificar que se añadió a `lib/data.ts`

### TypeScript errors:
```bash
# Siempre usar imports absolutos
import { ... } from "@/schemas/quotation"  # ✅
import { ... } from "../schemas/quotation" # ❌
```

---

## 🏁 COMPLETION CRITERIA

**Sistema 100% completo cuando**:
- STATUS = `SPRINT_8_COMPLETED`
- Todos los archivos de la matriz creados
- Verification pasa: `pnpm lint && pnpm typecheck && pnpm test`
- Test E2E manual funciona:
  ```bash
  curl -X POST http://localhost:3000/api/quotations \
    -H "Content-Type: application/json" \
    -d '{"unitId":"mock-unit-1","startDate":"2025-08-18"}'
  ```
- ⚠️ **Issue conocido**: Build falla por SSR error en coming-soon (no afecta cotizaciones)

---

**🎯 INSTRUCCIÓN**: Lee solo este archivo. Ejecuta la ACCIÓN INMEDIATA. Actualiza el STATUS. Repite hasta completar.
