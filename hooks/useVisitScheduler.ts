import { useState, useCallback, useMemo } from 'react';
import { 
  AvailabilityResponse, 
  CreateVisitRequest, 
  CreateVisitResponse,
  VisitSlot,
  DaySlot,
  TimeSlot,
  formatRFC3339,
  generateIdempotencyKey,
  TIME_SLOTS_30MIN
} from '../types/visit';
import { logger } from '@lib/logger';

interface UseVisitSchedulerProps {
  listingId: string;
  timezone?: string;
}

interface UseVisitSchedulerReturn {
  // Estado
  isLoading: boolean;
  error: string | null;
  selectedDate: string | null;
  selectedTime: string | null;
  selectedSlot: VisitSlot | null;
  
  // Datos
  availableDays: DaySlot[];
  availableSlots: TimeSlot[];
  
  // Acciones
  fetchAvailability: (startDate: Date, endDate: Date) => Promise<void>;
  selectDateTime: (date: string, time: string) => void;
  createVisit: (userData: { name: string; phone: string; email?: string }) => Promise<CreateVisitResponse | null>;
  clearSelection: () => void;
  clearError: () => void;
}

export function useVisitScheduler({ 
  listingId, 
  timezone = 'America/Santiago' 
}: UseVisitSchedulerProps): UseVisitSchedulerReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<VisitSlot | null>(null);
  const [availabilityData, setAvailabilityData] = useState<AvailabilityResponse | null>(null);

  // Generar días disponibles - siempre mostrar próximos 7 días
  const availableDays = useMemo((): DaySlot[] => {
    const days: DaySlot[] = [];
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    
    // Generar próximos 7 días a partir de hoy
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      const dateString = date.toISOString().split('T')[0];
      const dayOfWeek = date.getDay();
      
      // Solo incluir días laborales (lunes a viernes)
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        // Contar slots disponibles para este día
        const slotsForDay = availabilityData?.slots.filter(slot => 
          slot.startTime.startsWith(dateString)
        ) || [];
        
        // Debug: logger.log(`📅 Day ${dateString}: ${slotsForDay.length} slots available`);
        
        days.push({
          id: `day-${i + 1}`,
          date: dateString,
          day: dayNames[dayOfWeek],
          number: date.getDate().toString(),
          available: slotsForDay.length > 0,
          premium: false,
          price: undefined,
          slotsCount: slotsForDay.length
        });
      }
    }
    
    logger.debug('📅 Generated days:', days);
    return days;
  }, [availabilityData]);

  // Generar slots de tiempo disponibles - siempre mostrar horarios disponibles
  const availableSlots = useMemo((): TimeSlot[] => {
    if (!selectedDate) return [];
    
    // Siempre mostrar horarios disponibles, independientemente de los datos de API
    return TIME_SLOTS_30MIN.map(time => {
      // Buscar slot real si existe
      const realSlot = availabilityData?.slots.find(slot => {
        const slotDate = slot.startTime.split('T')[0];
        const slotTime = new Date(slot.startTime).toLocaleTimeString('es-CL', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
        return slotDate === selectedDate && slotTime === time;
      });
      
      return {
        id: `time-${time}`,
        time,
        available: true, // Siempre disponible
        premium: false,
        instantBooking: false,
        slotId: realSlot?.id || `mock-slot-${selectedDate}-${time}`
      };
    });
  }, [selectedDate, availabilityData]);

  // Obtener disponibilidad de la API
  const fetchAvailability = useCallback(async (startDate: Date, endDate: Date) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const startRFC3339 = formatRFC3339(startDate, timezone);
      const endRFC3339 = formatRFC3339(endDate, timezone);
      
      logger.debug('🔍 Fetching availability:', { listingId, startRFC3339, endRFC3339 });
      
      const response = await fetch(
        `/api/availability?listingId=${listingId}&start=${startRFC3339}&end=${endRFC3339}`
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al obtener disponibilidad');
      }
      
      const data: AvailabilityResponse = await response.json();
      logger.debug('📅 Availability data received:', { 
        slotsCount: data.slots.length, 
        slots: data.slots.map(s => ({ 
          id: s.id, 
          startTime: s.startTime, 
          status: s.status 
        }))
      });
      
      setAvailabilityData(data);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      logger.error('Error fetching availability:', err);
    } finally {
      setIsLoading(false);
    }
  }, [listingId, timezone]);

  // Seleccionar fecha y hora
  const selectDateTime = useCallback((date: string, time: string) => {
    logger.debug('📅 Selecting date/time:', { date, time, availabilityData: !!availabilityData });
    
    setSelectedDate(date);
    setSelectedTime(time);
    
    // Buscar slot real o crear uno mock
    const realSlot = availabilityData?.slots.find(s => {
      const slotDate = s.startTime.split('T')[0];
      const slotTime = new Date(s.startTime).toLocaleTimeString('es-CL', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      return slotDate === date && slotTime === time;
    });
    
    if (realSlot) {
      logger.debug('🎯 Found real slot:', realSlot);
      setSelectedSlot(realSlot);
    } else {
      // Crear slot mock siempre disponible
      const mockSlot: VisitSlot = {
        id: `mock-slot-${date}-${time}`,
        listingId,
        startTime: `${date}T${time}:00-03:00`,
        endTime: `${date}T${time}:30:00-03:00`,
        status: 'open',
        source: 'system',
        createdAt: new Date().toISOString()
      };
      logger.debug('🎯 Created mock slot:', mockSlot);
      setSelectedSlot(mockSlot);
    }
    
    setError(null);
  }, [availabilityData, listingId]);

  // Crear visita con optimistic UI
  const createVisit = useCallback(async (_userData: { name: string; phone: string; email?: string }) => {
    if (!selectedSlot || !selectedDate || !selectedTime) {
      setError('Debes seleccionar una fecha y hora');
      return null;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const idempotencyKey = generateIdempotencyKey();
      const visitData: CreateVisitRequest = {
        listingId,
        slotId: selectedSlot.id,
        userId: `user_${Date.now()}`, // Mock user ID
        channel: 'web',
        idempotencyKey
      };
      
      // Optimistic update: marcar slot como no disponible localmente
      if (availabilityData) {
        const updatedSlots = availabilityData.slots.map(slot =>
          slot.id === selectedSlot.id 
            ? { ...slot, status: 'reserved' as const }
            : slot
        );
        
        setAvailabilityData({
          ...availabilityData,
          slots: updatedSlots
        });
      }
      
      const response = await fetch('/api/visits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey
        },
        body: JSON.stringify(visitData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        
        // Revertir optimistic update en caso de error
        if (availabilityData) {
          const revertedSlots = availabilityData.slots.map(slot =>
            slot.id === selectedSlot.id 
              ? { ...slot, status: 'open' as const }
              : slot
          );
          
          setAvailabilityData({
            ...availabilityData,
            slots: revertedSlots
          });
        }
        
        throw new Error(errorData.message || 'Error al crear la visita');
      }
      
      const result: CreateVisitResponse = await response.json();
      
      // Limpiar selección después de éxito
      clearSelection();
      
      return result;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      logger.error('Error creating visit:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- clearSelection is stable
  }, [listingId, selectedSlot, selectedDate, selectedTime, availabilityData]);

  // Limpiar selección
  const clearSelection = useCallback(() => {
    setSelectedDate(null);
    setSelectedTime(null);
    setSelectedSlot(null);
  }, []);

  // Limpiar error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Estado
    isLoading,
    error,
    selectedDate,
    selectedTime,
    selectedSlot,
    
    // Datos
    availableDays,
    availableSlots,
    
    // Acciones
    fetchAvailability,
    selectDateTime,
    createVisit,
    clearSelection,
    clearError
  };
}
