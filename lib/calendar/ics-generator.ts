/**
 * Generador de archivos ICS (iCalendar) para eventos de calendario
 * Formato RFC 5545 estándar
 */

interface ICSEventData {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: string;
  organizer?: {
    name: string;
    email?: string;
  };
  url?: string;
}

/**
 * Escapa caracteres especiales para formato ICS
 */
function escapeICSValue(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Formatea fecha en formato ICS (UTC)
 */
function formatICSDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

/**
 * Genera contenido de archivo ICS para un evento
 */
export function generateICS(eventData: ICSEventData): string {
  const lines: string[] = [];

  // Header
  lines.push('BEGIN:VCALENDAR');
  lines.push('VERSION:2.0');
  lines.push('PRODID:-//Hommie//Visit Scheduler//EN');
  lines.push('CALSCALE:GREGORIAN');
  lines.push('METHOD:REQUEST');

  // Event
  lines.push('BEGIN:VEVENT');
  lines.push(`UID:${Date.now()}-${Math.random().toString(36).substring(2, 15)}@hommie.cl`);
  lines.push(`DTSTAMP:${formatICSDate(new Date())}`);
  lines.push(`DTSTART:${formatICSDate(eventData.startDate)}`);
  lines.push(`DTEND:${formatICSDate(eventData.endDate)}`);
  lines.push(`SUMMARY:${escapeICSValue(eventData.title)}`);
  lines.push(`DESCRIPTION:${escapeICSValue(eventData.description)}`);
  lines.push(`LOCATION:${escapeICSValue(eventData.location)}`);

  if (eventData.organizer) {
    if (eventData.organizer.email) {
      lines.push(`ORGANIZER;CN=${escapeICSValue(eventData.organizer.name)}:MAILTO:${eventData.organizer.email}`);
    } else {
      lines.push(`ORGANIZER;CN=${escapeICSValue(eventData.organizer.name)}:mailto:noreply@hommie.cl`);
    }
  }

  if (eventData.url) {
    lines.push(`URL:${eventData.url}`);
  }

  // Default reminder (15 minutes before)
  lines.push('BEGIN:VALARM');
  lines.push('TRIGGER:-PT15M');
  lines.push('ACTION:DISPLAY');
  lines.push(`DESCRIPTION:Recordatorio: ${escapeICSValue(eventData.title)}`);
  lines.push('END:VALARM');

  lines.push('END:VEVENT');
  lines.push('END:VCALENDAR');

  return lines.join('\r\n');
}

/**
 * Descarga un archivo ICS
 */
export function downloadICS(icsContent: string, filename: string = 'event.ics'): void {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Genera y descarga un evento ICS
 */
export function generateAndDownloadICS(eventData: ICSEventData, filename?: string): void {
  const icsContent = generateICS(eventData);
  const defaultFilename = `${eventData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${formatICSDate(eventData.startDate).replace(/[^0-9]/g, '')}.ics`;
  downloadICS(icsContent, filename || defaultFilename);
}

