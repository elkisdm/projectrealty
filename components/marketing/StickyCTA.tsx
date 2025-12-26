// RSC: Sticky CTA optimizado para mobile - anyoneAI Style
interface StickyCTAProps {
    href: string;
    label: string;
    note: string;
}

export default function StickyCTA({ href, label, note }: StickyCTAProps) {
    return (
        <div className="fixed bottom-0 left-0 right-0 z-40 px-3 sm:px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 glass-card border-t border-white/10">
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 max-w-4xl mx-auto">
                {/* Información */}
                <div className="flex-1 text-center sm:text-left">
                    <p className="text-xs sm:text-sm text-text-muted font-medium">
                        {note}
                    </p>
                </div>

                {/* CTA Button - anyoneAI Style */}
                <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cta-accent w-full sm:w-auto inline-flex items-center justify-center gap-2 min-h-[48px] sm:min-h-[44px] mobile-optimized"
                    aria-label={`${label} por WhatsApp`}
                >
                    <span className="text-lg">💬</span>
                    <span>{label}</span>
                </a>
            </div>
        </div>
    );
}
