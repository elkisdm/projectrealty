import { computeQuotation } from "@lib/quotation";
import { QuotationInputSchema, QuotationResultSchema } from "@schemas/quotation";
import type { Building, Unit, PromotionBadge } from "@schemas/models";

describe("Sistema de Cotizaciones", () => {
  // Mock data para tests
  const mockUnit: Unit = {
    id: "test-unit-1",
    tipologia: "1D1B",
    m2: 45,
    price: 500000,
    estacionamiento: false,
    bodega: false,
    disponible: true,
    guarantee_months: 1,
    guarantee_installments: 3,
  };

  const mockBuilding: Building = {
    id: "test-building-1",
    slug: "test-building",
    name: "Edificio Test",
    comuna: "Las Condes",
    address: "Calle Test 123",
    amenities: ["gimnasio", "piscina"],
    gallery: ["img1.jpg", "img2.jpg", "img3.jpg"],
    units: [mockUnit],
    gc_mode: "MF",
  };

  describe("Esquemas Zod", () => {
    it("valida input de cotización correctamente", () => {
      const validInput = {
        unitId: "test-unit-1",
        startDate: "2025-02-15",
        options: {
          parkingSelected: false,
          storageSelected: false,
          creditReportFee: 6000,
        },
      };

      const result = QuotationInputSchema.parse(validInput);
      expect(result).toEqual(validInput);
    });

    it("rechaza input inválido", () => {
      const invalidInput = {
        unitId: "",
        startDate: "fecha-inválida",
      };

      expect(() => QuotationInputSchema.parse(invalidInput)).toThrow();
    });

    it("usa defaults para options cuando no se proporcionan", () => {
      const input = {
        unitId: "test-unit-1",
        startDate: "2025-02-15",
      };

      const result = QuotationInputSchema.parse(input);
      expect(result.options.parkingSelected).toBe(false);
      expect(result.options.storageSelected).toBe(false);
      expect(result.options.creditReportFee).toBe(6000);
    });
  });

  describe("Motor de Cálculo", () => {
    it("calcula cotización básica sin promociones", () => {
      const result = computeQuotation(
        mockUnit,
        mockBuilding,
        "2025-02-01" // Inicio de mes
      );

      // Verificar estructura del resultado
      expect(result).toHaveProperty("meta");
      expect(result).toHaveProperty("lines");
      expect(result).toHaveProperty("totals");
      expect(result).toHaveProperty("flags");

      // Verificar meta información
      expect(result.meta.unitId).toBe("test-unit-1");
      expect(result.meta.buildingId).toBe("test-building-1");
      expect(result.meta.currency).toBe("CLP");

      // Verificar cálculos básicos
      expect(result.lines.baseMonthly).toBe(500000);
      expect(result.lines.gcMonthly).toBe(Math.round(500000 * 0.18));
      expect(result.lines.guaranteeTotal).toBe(500000); // 1 mes
      expect(result.lines.creditReportFee).toBe(6000);
    });

    it("calcula prorrateo correctamente para fecha mid-month", () => {
      const result = computeQuotation(
        mockUnit,
        mockBuilding,
        "2025-02-15" // Mitad de febrero
      );

      // Febrero 2025 tiene 28 días, del 15 al 28 son 14 días
      expect(result.meta.daysInMonth).toBe(28);
      expect(result.meta.daysCharged).toBe(14);
      expect(result.meta.prorationFactor).toBeCloseTo(0.5, 2);

      // Verificar que el arriendo está prorrateado
      expect(result.lines.proratedRent).toBe(Math.round(500000 * 0.5));
    });

    it("aplica descuentos promocionales correctamente", () => {
      const unitWithPromo: Unit = {
        ...mockUnit,
        promotions: [
          {
            label: "50% OFF",
            type: "discount_percent",
            tag: "50",
          } as PromotionBadge,
        ],
      };

      const result = computeQuotation(
        unitWithPromo,
        mockBuilding,
        "2025-02-01"
      );

      expect(result.flags.discountPercent).toBe(50);
      expect(result.lines.discountPromo).toBe(250000); // 50% de 500000
      expect(result.lines.netRent).toBe(250000); // 500000 - 250000
    });

    it("calcula comisión con IVA o sin comisión por promo", () => {
      // Sin promoción de comisión gratis
      const resultWithCommission = computeQuotation(
        mockUnit,
        mockBuilding,
        "2025-02-01"
      );

      const expectedCommissionBase = Math.round(500000 * 0.5); // 50%
      const expectedCommissionWithIVA = Math.round(expectedCommissionBase * 1.19);
      expect(resultWithCommission.lines.commission).toBe(expectedCommissionWithIVA);
      expect(resultWithCommission.flags.hasFreeCommission).toBe(false);

      // Con promoción de comisión gratis
      const unitFreeComm: Unit = {
        ...mockUnit,
        promotions: [
          {
            label: "Sin Comisión",
            type: "free_commission",
          } as PromotionBadge,
        ],
      };

      const resultFreeComm = computeQuotation(
        unitFreeComm,
        mockBuilding,
        "2025-02-01"
      );

      expect(resultFreeComm.lines.commission).toBe(0);
      expect(resultFreeComm.flags.hasFreeCommission).toBe(true);
    });

    it("incluye estacionamiento y bodega en el cálculo", () => {
      const result = computeQuotation(
        mockUnit,
        mockBuilding,
        "2025-02-01",
        {
          parkingSelected: true,
          parkingPrice: 50000,
          storageSelected: true,
          storagePrice: 25000,
        }
      );

      expect(result.lines.baseMonthly).toBe(575000); // 500000 + 50000 + 25000
    });

    it("valida el resultado con schema Zod", () => {
      const result = computeQuotation(
        mockUnit,
        mockBuilding,
        "2025-02-01"
      );

      // El resultado debe pasar la validación del schema
      expect(() => QuotationResultSchema.parse(result)).not.toThrow();
    });

    it("calcula el primer pago total correctamente", () => {
      const result = computeQuotation(
        mockUnit,
        mockBuilding,
        "2025-02-01"
      );

      const expectedFirstPayment = 
        result.lines.netRent +
        result.lines.gcProrated +
        result.lines.guaranteeEntry +
        result.lines.creditReportFee +
        result.lines.commission;

      expect(result.totals.firstPayment).toBe(expectedFirstPayment);
    });
  });

  describe("Casos Edge", () => {
    it("maneja building sin gc_amount definido", () => {
      const buildingWithoutGC: Building = {
        ...mockBuilding,
        gc_mode: undefined,
      };

      const result = computeQuotation(
        mockUnit,
        buildingWithoutGC,
        "2025-02-01"
      );

      // Debe usar el fallback del 18%
      expect(result.lines.gcMonthly).toBe(Math.round(500000 * 0.18));
    });

    it("maneja unidades sin configuración de garantía", () => {
      const unitWithoutGuarantee: Unit = {
        ...mockUnit,
        guarantee_months: undefined,
        guarantee_installments: undefined,
      };

      const result = computeQuotation(
        unitWithoutGuarantee,
        mockBuilding,
        "2025-02-01"
      );

      // Debe usar defaults: 1 mes, 3 cuotas
      expect(result.lines.guaranteeMonths).toBe(1);
      expect(result.lines.guaranteeInstallments).toBe(3);
    });

    it("maneja fechas de fin de mes correctamente", () => {
      const result = computeQuotation(
        mockUnit,
        mockBuilding,
        "2025-02-28" // Último día de febrero
      );

      expect(result.meta.daysCharged).toBe(1);
      expect(result.meta.prorationFactor).toBeCloseTo(1/28, 3);
    });
  });
});
