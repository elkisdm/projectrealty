import Image from "next/image";
import Link from "next/link";

type BuildingCardProps = {
  id: string;
  title: string;
  area: string;
  tipology: string;
  slug: string;
  image: string;
  priority?: boolean;
};

const DEFAULT_BLUR =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMTYnIGhlaWdodD0nMTAnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc+PHJlY3Qgd2lkdGg9JzE2JyBoZWlnaHQ9JzEwJyBmaWxsPSIjMjIyMjIyIi8+PC9zdmc+";

export function BuildingCard({ 
  id: _id, 
  title, 
  area, 
  tipology, 
  slug, 
  image, 
  priority = false 
}: BuildingCardProps) {
  const href = `/propiedades/${slug}`;
  
  // Enhanced aria-label for accessibility
  const ariaLabel = `Ver propiedad ${title} en ${area}, ${tipology}`;

  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      data-analytics="property_view"
      className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] rounded-2xl"
    >
      <article className="rounded-2xl bg-[var(--soft)]/90 ring-1 ring-white/10 overflow-hidden transition-all group-hover:ring-[var(--ring)]/60">
        <div className="relative aspect-video">
          <Image
            src={image}
            alt={`Portada ${title}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            placeholder="blur"
            blurDataURL={DEFAULT_BLUR}
            priority={priority}
          />
        </div>
        <div className="p-4">
          <div className="mb-3">
            <h3 className="font-semibold leading-tight truncate" title={title}>
              {title}
            </h3>
            <p className="text-[13px] text-[var(--subtext)] truncate">{area}</p>
          </div>
          
          {/* Tipology display */}
          <div className="flex flex-wrap gap-1.5">
            <span className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-medium bg-[var(--soft)] text-[var(--text)] ring-1 ring-white/10">
              {tipology}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
