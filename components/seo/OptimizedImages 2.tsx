import Image from "next/image";

interface OptimizedImagesProps {
    className?: string;
}

export function OptimizedImages({ className = "" }: OptimizedImagesProps) {
    return (
        <div className={`hidden ${className}`}>
            {/* Imágenes optimizadas para OG y Twitter */}
            {/* Nota: Las imágenes reales deben ser agregadas en public/images/ */}
            {/* flash-videos-og.jpg (1200x630) y flash-videos-twitter.jpg (1200x600) */}
        </div>
    );
}
