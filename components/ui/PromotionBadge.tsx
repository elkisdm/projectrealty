import { BadgePercent } from "lucide-react";

type PromotionBadgeProps = {
  label?: string;
  tag?: string;
  variant?: 'primary' | 'secondary';
  className?: string;
};

export function PromotionBadge({ 
  label = "0% Comisión", 
  tag = "Promo", 
  variant = 'primary',
  className = ""
}: PromotionBadgeProps) {
  const baseClasses = "inline-flex items-center gap-2 rounded-full ring-1 px-3 py-1 text-xs text-white";
  
  const variantClasses = variant === 'primary' 
    ? "bg-[var(--soft)]/90 ring-white/10 font-medium" 
    : "bg-[var(--soft)]/60 ring-white/5 text-sm opacity-80";
  
  return (
    <div className={`${baseClasses} ${variantClasses} ${className}`}>
      <BadgePercent className="w-4 h-4" aria-hidden />
      <span>{label}</span>
      <span className="text-[10px] text-[var(--subtext)]">{tag}</span>
    </div>
  );
}
