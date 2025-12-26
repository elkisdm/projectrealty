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
  verifySlotAvailability: (slotId: string) => Promise<boolean>;
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

  // Generar días disponibles - mostrar próximos 6 días (excluyendo domingos)
  const availableDays = useMemo((): DaySlot[] => {
    const days: DaySlot[] = [];
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    
    // Generar próximos 6 días válidos (excluyendo solo domingos)
    let dayIndex = 0;
    let validDaysCount = 0;
    
    while (validDaysCount < 6) {
      const date = new Date();
      date.setDate(date.getDate() + dayIndex);
      
      const dateString = date.toISOString().split('T')[0];
      const dayOfWeek = date.getDay();
      
      // Excluir solo domingos (dayOfWeek === 0), incluir todos los demás días
      if (dayOfWeek !== 0) {
        // Contar slots disponibles para este día
        const slotsForDay = availabilityData?.slots.filter(slot => 
          slot.startTime.startsWith(dateString)
        ) || [];
        
        days.push({
          id: `day-${validDaysCount + 1}`,
          date: dateString,
          day: dayNames[dayOfWeek],
          number: date.getDate().toString(),
          available: slotsForDay.length > 0,
          premium: false,
          price: undefined,
          slotsCount: slotsForDay.length
        });
        
        validDaysCount++;
      }
      
      dayIndex++;
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
        
        // Mensajes de error específicos para disponibilidad
        let errorMessage = 'Error al obtener disponibilidad';
        if (response.status === 429) {
          errorMessage = 'Has realizado muchas solicitudes. Por favor, espera un momento e intenta nuevamente.';
        } else if (response.status === 400) {
          errorMessage = errorData.error || 'Parámetros inválidos. Por favor, intenta nuevamente.';
        } else if (response.status >= 500) {
          errorMessage = 'Error del servidor. Por favor, intenta más tarde.';
        } else {
          errorMessage = errorData.error || errorMessage;
        }
        
        throw new Error(errorMessage);
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

  // Verificar disponibilidad del slot en tiempo real
  const verifySlotAvailability = useCallback(async (slotId: string): Promise<boolean> => {
    if (!selectedDate || !selectedTime) return false;
    
    try {
      // Obtener disponibilidad para el rango del slot seleccionado
      const slotDate = new Date(`${selectedDate}T${selectedTime}:00-03:00`);
      const startDate = new Date(slotDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(slotDate);
      endDate.setHours(23, 59, 59, 999);
      
      const startRFC3339 = formatRFC3339(startDate, timezone);
      const endRFC3339 = formatRFC3339(endDate, timezone);
      
      const response = await fetch(
        `/api/availability?listingId=${listingId}&start=${startRFC3339}&end=${endRFC3339}`
      );
      
      if (!response.ok) {
        logger.error('Error verificando disponibilidad:', await response.text());
        return false;
      }
      
      const data: AvailabilityResponse = await response.json();
      
      // Buscar el slot específico
      const slot = data.slots.find(s => s.id === slotId);
      return slot?.status === 'open' || false;
      
    } catch (err) {
      logger.error('Error verificando disponibilidad:', err);
      return false;
    }
  }, [listingId, selectedDate, selectedTime, timezone]);

  // Crear visita con optimistic UI
  const createVisit = useCallback(async (userData: { name: string; phone: string; email?: string }) => {
    if (!selectedSlot || !selectedDate || !selectedTime) {
      setError('Debes seleccionar una fecha y hora');
      return null;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Verificar disponibilidad en tiempo real antes de crear
      const isAvailable = await verifySlotAvailability(selectedSlot.id);
      if (!isAvailable) {
        setError('El horario seleccionado ya no está disponible. Por favor, selecciona otro horario.');
        return null;
      }
      
      const idempotencyKey = generateIdempotencyKey();
      const visitData: CreateVisitRequest = {
        listingId,
        slotId: selectedSlot.id,
        userId: `user_${Date.now()}`, // Mock user ID
        channel: 'web',
        idempotencyKey,
        contactData: {
          name: userData.name,
          phone: userData.phone,
          email: userData.email
        }
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
        
        // Mensajes de error específicos según el código de error
        let errorMessage = 'Error al crear la visita';
        if (errorData.code) {
          switch (errorData.code) {
            case 'SLOT_UNAVAILABLE':
              errorMessage = 'El horario seleccionado ya no está disponible. Por favor, selecciona otro horario.';
              break;
            case 'INVALID_DAY':
              errorMessage = 'No se pueden agendar visitas los domingos. Por favor, selecciona otro día.';
              break;
            case 'INVALID_TIME':
              errorMessage = `Los horarios disponibles son de ${errorData.message?.includes('9:00') ? '9:00' : '9:00'} a 20:00 hrs. Por favor, selecciona un horario válido.`;
              break;
            case 'PAST_TIME':
              errorMessage = 'No se pueden agendar visitas en el pasado. Por favor, selecciona una fecha y hora futura.';
              break;
            case 'RATE_LIMIT':
              errorMessage = 'Has realizado muchas solicitudes. Por favor, espera un momento e intenta nuevamente.';
              break;
            default:
              errorMessage = errorData.message || errorMessage;
          }
        } else if (errorData.error) {
          if (errorData.error.includes('Rate limit')) {
            errorMessage = 'Has realizado muchas solicitudes. Por favor, espera un momento e intenta nuevamente.';
          } else if (errorData.error.includes('Slot no disponible')) {
            errorMessage = 'El horario seleccionado ya no está disponible. Por favor, selecciona otro horario.';
          } else {
            errorMessage = errorData.message || errorData.error || errorMessage;
          }
        } else {
          errorMessage = errorData.message || errorMessage;
        }
        
        throw new Error(errorMessage);
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
  }, [listingId, selectedSlot, selectedDate, selectedTime, availabilityData, verifySlotAvailability]);

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
    verifySlotAvailability,
    createVisit,
    clearSelection,
    clearError
  };
}
