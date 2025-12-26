import type { 
  WeekViewData, 
  WeekDay, 
  CalendarEventType, 
  VisitEvent, 
  CalendarEvent, 
  InternalBlock,
  IsoDate 
} from '@/types/calendar';

export function generateWeekView(
  startDate: IsoDate,
  visits: VisitEvent[] = [],
  externalEvents: CalendarEvent[] = [],
  internalBlocks: InternalBlock[] = []
): WeekViewData {
  const weekStart = new Date(startDate);
  const days: WeekDay[] = [];
  const timeSlots = generateTimeSlots();

  // Generar días de la semana (Lun-Dom)
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + i);
    
    const dayDate = date.toISOString().slice(0, 10) as IsoDate;
    const today = new Date().toISOString().slice(0, 10);
    
    const day: WeekDay = {
      date: dayDate,
      dayName: date.toLocaleDateString('es-CL', { weekday: 'short' }),
      dayNumber: date.getDate(),
      isToday: dayDate === today,
      events: []
    };

    // Filtrar eventos para este día
    const dayStart = new Date(dayDate + 'T00:00:00Z');
    const dayEnd = new Date(dayDate + 'T23:59:59Z');

    // Visitas
    const dayVisits = visits.filter(visit => {
      const visitStart = new Date(visit.start);
      return visitStart >= dayStart && visitStart <= dayEnd;
    });

    // Eventos externos
    const dayExternalEvents = externalEvents.filter(event => {
      const eventStart = new Date(event.start);
      return eventStart >= dayStart && eventStart <= dayEnd;
    });

    // Bloques internos
    const dayInternalBlocks = internalBlocks.filter(block => {
      const blockStart = new Date(block.start);
      return blockStart >= dayStart && blockStart <= dayEnd;
    });

    // Convertir a CalendarEventType
    day.events = [
      ...dayVisits.map(visit => ({ type: 'visit' as const, data: visit })),
      ...dayExternalEvents.map(event => ({ type: 'external-block' as const, data: event })),
      ...dayInternalBlocks.map(block => ({ type: 'internal-block' as const, data: block }))
    ];

    days.push(day);
  }

  return {
    weekStart: weekStart.toISOString().slice(0, 10) as IsoDate,
    days,
    timeSlots
  };
}

function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let hour = 8; hour <= 20; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
  }
  return slots;
}

export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Ajustar para que lunes sea 1
  return new Date(d.setDate(diff));
}

export function formatWeekRange(startDate: IsoDate): string {
  const start = new Date(startDate);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  
  const startFormatted = start.toLocaleDateString('es-CL', { 
    day: 'numeric', 
    month: 'short' 
  });
  const endFormatted = end.toLocaleDateString('es-CL', { 
    day: 'numeric', 
    month: 'short',
    year: 'numeric'
  });
  
  return `${startFormatted} - ${endFormatted}`;
}

export function getEventPosition(event: CalendarEventType): {
  top: number;
  height: number;
  left: number;
  width: number;
} {
  const start = new Date(event.data.start);
  const end = new Date(event.data.end);
  
  // Calcular posición vertical (top)
  const startHour = start.getHours() + start.getMinutes() / 60;
  const top = ((startHour - 8) / 12) * 100; // 8-20 = 12 horas
  
  // Calcular altura
  const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60); // horas
  const height = (duration / 12) * 100;
  
  // Para eventos que se solapan, calcular posición horizontal
  // Por ahora, todos ocupan el ancho completo
  return {
    top,
    height,
    left: 0,
    width: 100
  };
}
