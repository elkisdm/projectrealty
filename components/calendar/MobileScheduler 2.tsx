import { clx } from "@lib/utils";
import type { CalendarEvent, TimeRange, MobileSchedulerProps } from "@/types/calendar";
import dynamic from "next/dynamic";
import AvailabilitySection from "./AvailabilitySection";

const SlotPicker = dynamic(() => import("./SlotPicker"), { ssr: false });

// RSC, no estado/efectos. Interactividad vendrá en cliente.
export default function MobileScheduler({ date, events = [], className }: MobileSchedulerProps) {
    const visibleHours = { start: "08:00", end: "20:00" };
    const headerTitle = undefined;
    const hours = computeHourSlots(visibleHours);
    const labelId = `scheduler-label-${date}`;
    const descId = `scheduler-desc-${date}`;

    return (
        <section aria-labelledby={labelId} aria-describedby={descId} role="group" className={clx(
            "w-full max-w-md mx-auto rounded-2xl border border-[var(--ring)]/20 bg-white/80 dark:bg-zinc-900/70 backdrop-blur",
            "shadow-[0_10px_30px_rgba(17,24,39,0.15)]",
            className
        )}>
            <header className="px-4 pt-4 pb-3">
                <p id={descId} className="text-xs text-zinc-500 dark:text-zinc-400">{formatReadableDate(date)}</p>
                <h2 id={labelId} className="mt-1 text-base font-semibold text-zinc-900 dark:text-zinc-50">
                    {headerTitle ?? "Disponibilidad"}
                </h2>
            </header>
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {hours.map((h) => (
                    <div key={h}
                        className="grid grid-cols-[64px_1fr] items-start gap-3 px-4 py-3">
                        <time className="mt-0.5 text-[11px] tabular-nums text-zinc-500 dark:text-zinc-400" dateTime={`${date}T${h}:00`}>
                            {h}
                        </time>
                        <div className="relative">
                            <div className="h-10 rounded-xl bg-gradient-to-b from-zinc-100 to-zinc-50 dark:from-zinc-800/70 dark:to-zinc-900/40 ring-1 ring-inset ring-[var(--ring)]/10" />
                            {/* Eventos que caen en este bloque (placeholder visual) */}
                            <div className="absolute inset-0 pointer-events-none">
                                {renderEventsForHour(events, date, h)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {/* Disponibilidad real basada en motor (SSR) + SlotPicker (cliente) */}
            <AvailabilitySection date={date} visibleHours={visibleHours} />
            <footer className="px-4 py-3">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Seleccione un horario disponible para agendar una visita.
                </p>
            </footer>
        </section>
    );
}

function computeHourSlots(range: TimeRange): string[] {
    const [startH] = range.start.split(":").map(Number);
    const [endH] = range.end.split(":").map(Number);
    const output: string[] = [];
    for (let h = startH; h <= endH; h++) {
        output.push(`${String(h).padStart(2, "0")}:00`);
    }
    return output;
}

function formatReadableDate(yyyyMmDd: string): string {
    const [y, m, d] = yyyyMmDd.split("-").map(Number);
    const date = new Date(Date.UTC(y, (m - 1), d));
    return date.toLocaleDateString("es-CL", { weekday: "long", day: "2-digit", month: "long" });
}

function renderEventsForHour(events: CalendarEvent[], day: string, hour: string) {
    const items = events.filter((ev) => isEventInHour(ev, day, hour));
    if (items.length === 0) return null;
    return (
        <ul className="flex h-full gap-1 p-0.5">
            {items.map((ev) => (
                <li key={String(ev.id)} className={clx(
                    "flex-1 rounded-lg border text-[10px] leading-tight px-2 py-1",
                    "bg-violet-50/70 text-violet-900 border-violet-200/70 dark:bg-violet-900/30 dark:text-violet-100 dark:border-violet-700",
                    ev.busy && "opacity-60"
                )}>
                    <span className="block truncate">{ev.title}</span>
                </li>
            ))}
        </ul>
    );
}

function isEventInHour(ev: CalendarEvent, day: string, hour: string): boolean {
    const start = new Date(ev.start);
    const end = new Date(ev.end);
    const [y, m, d] = day.split("-").map(Number);
    const hourNum = Number(hour.split(":")[0]);
    const slotStart = new Date(Date.UTC(y, m - 1, d, hourNum, 0, 0));
    const slotEnd = new Date(Date.UTC(y, m - 1, d, hourNum, 59, 59));
    return end > slotStart && start < slotEnd;
}
