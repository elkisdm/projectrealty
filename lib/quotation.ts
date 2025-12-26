// lib/quotation.ts
import { QuotationResult } from "@schemas/quotation";
import { Building, Unit, PromotionBadge } from "@schemas/models";

const IVA = 0.19;

function daysInMonth(y: number, m: number) {
  return new Date(y, m, 0).getDate();
}

function inclusiveDaysFrom(date: Date) {
  const dim = daysInMonth(date.getFullYear(), date.getMonth() + 1);
  return dim - date.getDate() + 1;
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
  // Parse fecha en local timezone
  const dateParts = startDateISO.split('-').map(Number);
  const date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
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
  const discountPromo = Math.round(baseMonthly * (discountPercent / 100) * proration);
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
