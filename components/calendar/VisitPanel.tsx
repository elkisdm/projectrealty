import Link from 'next/link';
import { clx } from '@lib/utils';

export type VisitPanelProps = {
  propertyTitle: string;
  unitLabel: string; // p.ej. "Depto 1204 · 2D/2B"
  address?: string;
  visitDate?: string; // YYYY-MM-DD
  visitHour?: string; // HH:mm
  onQuoteHref?: string; // ruta a página/modal de cotización
  className?: string;
};

export default function VisitPanel({ propertyTitle, unitLabel, address, visitDate, visitHour, onQuoteHref = '#', className }: VisitPanelProps){
  const titleId = `visitpanel-title-${propertyTitle.replace(/\s+/g, '-')}`;
  return (
    <section aria-labelledby={titleId} className={clx(
      'w-full max-w-md mx-auto rounded-2xl border border-[var(--ring)]/20 bg-white/90 dark:bg-zinc-900/70 backdrop-blur',
      'shadow-[0_10px_30px_rgba(17,24,39,0.15)] p-4',
      className
    )}>
      <h3 id={titleId} className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
        {propertyTitle}
      </h3>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{unitLabel}</p>
      {address && (
        <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{address}</p>
      )}

      {(visitDate || visitHour) && (
        <div className="mt-3 text-sm text-zinc-700 dark:text-zinc-200">
          {visitDate && <span className="tabular-nums">{formatDate(visitDate)}</span>} {visitHour && <span className="tabular-nums">{visitHour}</span>}
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <Link
          href={onQuoteHref}
          className={clx(
            'inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium',
            'bg-[radial-gradient(120%_120%_at_30%_10%,#8B6CFF_0%,#6D4AFF_40%,#5233D3_100%)] text-white shadow-[0_10px_30px_rgba(109,74,255,.35)]',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-900'
          )}
          aria-label="Cotizar esta unidad"
        >
          Cotizar unidad
        </Link>
        <Link
          href={onQuoteHref}
          className={clx(
            'inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium border border-[var(--ring)]/20',
            'bg-white/70 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100'
          )}
          aria-label="Cotizar otra unidad"
        >
          Cotizar otra unidad
        </Link>
      </div>
    </section>
  );
}

function formatDate(yyyyMmDd?: string){
  if (!yyyyMmDd) return '';
  const [y,m,d] = yyyyMmDd.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.toLocaleDateString('es-CL', { weekday: 'short', day: '2-digit', month: 'short' });
}
