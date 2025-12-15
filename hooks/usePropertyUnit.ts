import { useState, useEffect, useCallback, useMemo } from "react";
import type { Unit, Building } from "@schemas/models";

interface UsePropertyUnitProps {
  building: Building;
  defaultUnitId?: string;
}

interface UnitDetails {
  dormitorios: number;
  banos: number;
  m2: number;
  area_interior?: number;
  area_exterior?: number;
  tipologia: string;
  piso: string;
  orientacion: string;
  estacionamiento: boolean;
  bodega: boolean;
  amoblado: boolean;
  petFriendly: boolean;
  parkingOptions: string[];
  storageOptions: string[];
  codigoInterno?: string;
  garantia_cuotas?: number;
  garantia_meses?: number;
  renta_minima?: number;
}

interface FirstPaymentCalculation {
  netRentStorage: number;
  proratedGC: number;
  initialDeposit: number;
  commissionToPay: number;
  totalFirstPayment: number;
  daysChargedCount: number;
  daysInMonth: number;
  prorateFactor: number;
  promoDays: number;
  regularDays: number;
  totalRent: number;
  totalParking: number;
  totalStorage: number;
}

export function usePropertyUnit({ building, defaultUnitId }: UsePropertyUnitProps) {
  const availableUnits = useMemo(() => 
    building.units.filter(unit => unit.disponible), 
    [building.units]
  );

  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [moveInDate, setMoveInDate] = useState<Date>(() => {
    const today = new Date();
    const firstDayNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    return firstDayNextMonth;
  });
  const [includeParking, setIncludeParking] = useState(false);
  const [includeStorage, setIncludeStorage] = useState(false);

  // Seleccionar unidad por defecto basada en defaultUnitId o la primera disponible
  const getDefaultUnit = useCallback(() => {
    if (defaultUnitId) {
      const unit = availableUnits.find(u => u.id === defaultUnitId);
      if (unit) return unit;
    }
    return availableUnits[0] || null;
  }, [defaultUnitId, availableUnits]);

  // Inicializar unidad seleccionada
  useEffect(() => {
    const defaultUnit = getDefaultUnit();
    if (defaultUnit) {
      setSelectedUnit(defaultUnit);
    }
  }, [getDefaultUnit]);

  // Datos estratégicos basados en AssetPlan
  const originalPrice = useMemo(() => 
    selectedUnit?.price || building.precio_desde || 290000, 
    [selectedUnit?.price, building.precio_desde]
  );

  const discountPrice = useMemo(() => 
    Math.round(originalPrice * 0.5), // 50% OFF primer mes
    [originalPrice]
  );

  // Detalles de la unidad seleccionada
  // Regla especial: Estudios siempre tienen 1 ambiente + 1 baño
  const unitDetails: UnitDetails = useMemo(() => {
    const tipologia = selectedUnit?.tipologia || "1D1B";
    const isEstudio = tipologia === "Studio" || tipologia === "Estudio";
    
    return {
      dormitorios: isEstudio 
        ? 1  // Estudios siempre tienen 1 ambiente
        : (selectedUnit?.dormitorios || selectedUnit?.bedrooms || 1),
      banos: isEstudio 
        ? 1  // Estudios siempre tienen 1 baño
        : (selectedUnit?.banos || selectedUnit?.bathrooms || 1),
      m2: selectedUnit?.m2 || 45,
      area_interior: selectedUnit?.area_interior_m2,
      area_exterior: selectedUnit?.area_exterior_m2,
      tipologia: selectedUnit?.tipologia || "1D1B",
      piso: String(selectedUnit?.piso || "N/A"),
      orientacion: selectedUnit?.orientacion || "N/A",
      estacionamiento: selectedUnit?.estacionamiento || false,
      bodega: selectedUnit?.bodega || false,
      amoblado: selectedUnit?.amoblado || false,
      petFriendly: selectedUnit?.petFriendly || false,
      parkingOptions: selectedUnit?.parkingOptions || [],
      storageOptions: selectedUnit?.storageOptions || [],
      codigoInterno: selectedUnit?.codigoInterno,
      garantia_cuotas: selectedUnit?.guarantee_installments,
      garantia_meses: selectedUnit?.guarantee_months,
      renta_minima: selectedUnit?.renta_minima
    };
  }, [selectedUnit]);

  // Función para calcular el primer pago optimizada
  const calculateFirstPayment = useCallback((startDate: Date): FirstPaymentCalculation => {
    const RENT = originalPrice;
    const PARKING_RENT = includeParking ? 50000 : 0;
    const STORAGE_RENT = includeStorage ? 30000 : 0;
    const GC_RENT = Math.round(originalPrice * 0.21);
    const PROMO_RATE = 0.50;
    const DEPOSIT_MONTHS = 1;
    const DEPOSIT_INIT_PCT = 0.33;
    const COMMISSION_RATE = 0.50;
    const VAT = 0.19;
    const COMMISSION_BONIF_RATE = 1;

    const daysInMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate();
    const daysCharged = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getTime() - startDate.getTime() + (24 * 60 * 60 * 1000);
    const daysChargedCount = Math.ceil(daysCharged / (24 * 60 * 60 * 1000));
    const prorateFactor = daysChargedCount / daysInMonth;

    const promoDays = Math.min(30, daysChargedCount);
    const regularDays = Math.max(0, daysChargedCount - 30);

    const dailyRent = RENT / 30;
    const dailyParking = PARKING_RENT / 30;
    const dailyStorage = STORAGE_RENT / 30;

    const promoRent = Math.round(dailyRent * promoDays * (1 - PROMO_RATE));
    const regularRent = Math.round(dailyRent * regularDays);
    const totalRent = promoRent + regularRent;

    const promoParking = Math.round(dailyParking * promoDays * (1 - PROMO_RATE));
    const regularParking = Math.round(dailyParking * regularDays);
    const totalParking = promoParking + regularParking;

    const promoStorage = Math.round(dailyStorage * promoDays * (1 - PROMO_RATE));
    const regularStorage = Math.round(dailyStorage * regularDays);
    const totalStorage = promoStorage + regularStorage;

    const netRentStorage = totalRent + totalParking + totalStorage;
    const proratedGC = Math.round(GC_RENT * prorateFactor);
    const totalDeposit = Math.round(DEPOSIT_MONTHS * (RENT + PARKING_RENT + STORAGE_RENT));
    const initialDeposit = Math.round(totalDeposit * DEPOSIT_INIT_PCT);

    const commissionBase = Math.round(COMMISSION_RATE * (RENT + PARKING_RENT + STORAGE_RENT));
    const commissionVAT = Math.round(commissionBase * VAT);
    const totalCommission = commissionBase + commissionVAT;
    const commissionToPay = Math.max(0, Math.round(totalCommission * (1 - COMMISSION_BONIF_RATE)));

    const totalFirstPayment = netRentStorage + proratedGC + initialDeposit + commissionToPay;

    return {
      netRentStorage,
      proratedGC,
      initialDeposit,
      commissionToPay,
      totalFirstPayment,
      daysChargedCount,
      daysInMonth,
      prorateFactor,
      promoDays,
      regularDays,
      totalRent,
      totalParking,
      totalStorage
    };
  }, [originalPrice, includeParking, includeStorage]);

  const firstPaymentCalculation = useMemo(() => 
    calculateFirstPayment(moveInDate), 
    [calculateFirstPayment, moveInDate]
  );

  // Función para manejar cambio de fecha
  const handleDateChange = useCallback((date: Date) => {
    setMoveInDate(date);
  }, []);

  // Función para formatear fecha
  const formatDate = useCallback((date: Date) => {
    return date.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }, []);

  const formatDateForSummary = useCallback((date: Date) => {
    return date.toLocaleDateString('es-CL', {
      day: 'numeric',
      month: 'short'
    });
  }, []);

  const getSummaryText = useCallback(() => {
    const dateText = formatDateForSummary(moveInDate);
    const total = firstPaymentCalculation.totalFirstPayment.toLocaleString('es-CL');
    return `Te mudas con $${total} el ${dateText}`;
  }, [firstPaymentCalculation.totalFirstPayment, formatDateForSummary, moveInDate]);

  const getSummaryPrice = useCallback(() => {
    return firstPaymentCalculation.totalFirstPayment.toLocaleString('es-CL');
  }, [firstPaymentCalculation.totalFirstPayment]);

  return {
    // Estado
    selectedUnit,
    setSelectedUnit,
    moveInDate,
    setMoveInDate,
    includeParking,
    setIncludeParking,
    includeStorage,
    setIncludeStorage,
    
    // Datos calculados
    availableUnits,
    originalPrice,
    discountPrice,
    unitDetails,
    firstPaymentCalculation,
    
    // Funciones
    handleDateChange,
    formatDate,
    formatDateForSummary,
    getSummaryText,
    getSummaryPrice,
    
    // Utilidades
    getDefaultUnit
  };
}
