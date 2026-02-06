"use client";
import React, { useState, useRef } from "react";
import Image from "next/image";
import { Share2, Heart, ArrowLeft, MapPin, ChevronLeft, ChevronRight, Star, Square, Sun, Play, PawPrint } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Building, Unit } from "@schemas/models";
import { StickyCtaBar } from "@components/ui/StickyCtaBar";
import { PropertyVideoModal } from "@components/property/PropertyVideoModal";

const DEFAULT_BLUR = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==";

// Función helper para obtener todas las imágenes según prioridad (extraída de PropertyGalleryGrid)
// Elimina duplicados para evitar mostrar la misma imagen múltiples veces
function getAllImages(unit?: Unit, building?: Building): string[] {
    const images: string[] = [];
    const seen = new Set<string>(); // Para detectar duplicados

    // Helper para agregar imágenes sin duplicados
    const addImages = (imageArray: string[]) => {
        imageArray.forEach(img => {
            if (img && !seen.has(img)) {
                seen.add(img);
                images.push(img);
            }
        });
    };

    // Prioridad 1: Imágenes de la unidad (interior) - mayor prioridad para imágenes específicas de la unidad
    if (unit?.images && Array.isArray(unit.images) && unit.images.length > 0) {
        addImages(unit.images);
    }

    // Prioridad 2: Imágenes de tipología
    if (unit?.imagesTipologia && Array.isArray(unit.imagesTipologia) && unit.imagesTipologia.length > 0) {
        addImages(unit.imagesTipologia);
    }

    // Prioridad 3: Imágenes de áreas comunes del edificio
    if (unit?.imagesAreasComunes && Array.isArray(unit.imagesAreasComunes) && unit.imagesAreasComunes.length > 0) {
        addImages(unit.imagesAreasComunes);
    }

    // Prioridad 4: Imágenes del edificio (galería) - solo si NO hay imágenes de la unidad
    if (!unit?.images || unit.images.length === 0) {
        if (building?.gallery && Array.isArray(building.gallery) && building.gallery.length > 0) {
            addImages(building.gallery);
        }
    }

    // Prioridad 5: CoverImage del edificio (solo si no está ya incluida)
    if (building?.coverImage && !seen.has(building.coverImage)) {
        images.push(building.coverImage);
        seen.add(building.coverImage);
    }

    // Fallback: si no hay imágenes, usar coverImage del edificio
    if (images.length === 0 && building?.coverImage) {
        images.push(building.coverImage);
    }

    // Excluir parque-mackenna.jpg (no existe en public)
    return images.filter((url) => !url.includes("parque-mackenna.jpg"));
}

interface PropertyAboveFoldMobileProps {
    building: Building;
    selectedUnit: Unit;
    variant?: "catalog" | "marketing" | "admin";
    onScheduleVisit: () => void;
    onWhatsApp?: () => void;
    onSelectOtherUnit?: () => void;
    onSave?: () => void;
    onShare?: () => void;
}

export function PropertyAboveFoldMobile({
    building,
    selectedUnit,
    variant = "catalog",
    onScheduleVisit,
    onWhatsApp,
    onSelectOtherUnit,
    onSave,
    onShare
}: PropertyAboveFoldMobileProps) {
    const [isSaved, setIsSaved] = useState(false);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const firstVideoUrl = selectedUnit?.videos?.[0];
    const hasVideo = Boolean(firstVideoUrl);

    // Obtener todas las imágenes
    const allImages = getAllImages(selectedUnit, building);
    
    // Debug en desarrollo
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
        console.log('[PropertyAboveFoldMobile] Debug imágenes:', {
            tipologia: selectedUnit?.tipologia,
            hasImagesTipologia: !!selectedUnit?.imagesTipologia,
            imagesTipologiaLength: selectedUnit?.imagesTipologia?.length,
            hasImagesAreasComunes: !!selectedUnit?.imagesAreasComunes,
            imagesAreasComunesLength: selectedUnit?.imagesAreasComunes?.length,
            buildingGalleryLength: building?.gallery?.length,
            allImagesLength: allImages.length,
        });
    }
    
    // Fallback: parque-mackenna.jpg no existe en public; usar IMG_4922.jpg
    const safeCoverImage = building.coverImage?.includes("parque-mackenna.jpg")
        ? "/images/parque-mackenna-305/IMG_4922.jpg"
        : building.coverImage;
    const baseImages = allImages.length > 0
        ? allImages
        : safeCoverImage
            ? [safeCoverImage]
            : ['/images/lascondes-cover.jpg'];

    // Scroll infinito: duplicar imágenes para loop seamless (clone última al inicio, primera al final)
    const finalImages = baseImages.length > 1
        ? [baseImages[baseImages.length - 1], ...baseImages, baseImages[0]]
        : baseImages;

    const totalImages = baseImages.length;

    const isInfinite = finalImages.length > baseImages.length;

    // Manejar scroll del slider (incluye lógica de loop infinito)
    const handleScroll = () => {
        if (!scrollRef.current || !isInfinite) {
            if (scrollRef.current && baseImages.length > 0) {
                const { scrollLeft, clientWidth } = scrollRef.current;
                const newIndex = Math.round(scrollLeft / clientWidth);
                if (newIndex !== activeImageIndex && newIndex >= 0 && newIndex < baseImages.length) {
                    setActiveImageIndex(newIndex);
                }
            }
            return;
        }
        const { scrollLeft, clientWidth } = scrollRef.current;
        const totalWidth = clientWidth * finalImages.length;
        // Al llegar al clone del final (primera imagen duplicada al final), saltar a la real
        if (scrollLeft >= totalWidth - clientWidth * 0.5) {
            scrollRef.current.scrollLeft = clientWidth;
            setActiveImageIndex(0);
            return;
        }
        // Al llegar al clone del inicio (última imagen duplicada al inicio), saltar a la real
        if (scrollLeft <= clientWidth * 0.5) {
            scrollRef.current.scrollLeft = totalWidth - clientWidth * 2;
            setActiveImageIndex(baseImages.length - 1);
            return;
        }
        const newIndex = Math.round((scrollLeft - clientWidth) / clientWidth);
        if (newIndex !== activeImageIndex && newIndex >= 0 && newIndex < baseImages.length) {
            setActiveImageIndex(newIndex);
        }
    };

    // Inicializar scroll en posición correcta para loop infinito (mostrar primera imagen real)
    React.useEffect(() => {
        if (scrollRef.current && isInfinite && baseImages.length > 1) {
            scrollRef.current.scrollLeft = scrollRef.current.clientWidth;
        }
    }, [isInfinite, baseImages.length]);

    // Navegar a imagen anterior
    const goToPrevious = () => {
        if (scrollRef.current) {
            const idx = isInfinite ? (activeImageIndex === 0 ? baseImages.length - 1 : activeImageIndex - 1) : Math.max(0, activeImageIndex - 1);
            const scrollPos = isInfinite ? (idx + 1) * scrollRef.current.clientWidth : idx * scrollRef.current.clientWidth;
            scrollRef.current.scrollTo({ left: scrollPos, behavior: 'smooth' });
            setActiveImageIndex(idx);
        }
    };

    // Navegar a imagen siguiente
    const goToNext = () => {
        if (scrollRef.current) {
            const idx = isInfinite ? (activeImageIndex === baseImages.length - 1 ? 0 : activeImageIndex + 1) : Math.min(baseImages.length - 1, activeImageIndex + 1);
            const scrollPos = isInfinite ? (idx + 1) * scrollRef.current.clientWidth : idx * scrollRef.current.clientWidth;
            scrollRef.current.scrollTo({ left: scrollPos, behavior: 'smooth' });
            setActiveImageIndex(idx);
        }
    };

    // Calcular precio total por mes (arriendo + GGCC)
    const arriendo = selectedUnit?.price || building.precio_desde || 290000;
    const ggcc = selectedUnit?.gastoComun || selectedUnit?.gc || selectedUnit?.gastosComunes || 0;
    const precioTotalMes = arriendo + ggcc;

    // Datos para overlay informativo (desde Supabase)
    const tipologia = selectedUnit?.tipologia || "2D";
    const m2 = selectedUnit?.area_interior_m2 || selectedUnit?.m2;
    const m2Balcon = selectedUnit?.m2_terraza ?? selectedUnit?.area_exterior_m2;
    const dormitorios = selectedUnit?.dormitorios || selectedUnit?.bedrooms || 0;
    const estacionamiento = selectedUnit?.estacionamiento ? 1 : (selectedUnit?.parkingOptions?.length || 0);
    const petFriendly = selectedUnit?.petFriendly ?? selectedUnit?.pet_friendly;
    // Metro: siempre usar el metro más cercano del edificio si está disponible
    const minutosMetro = building.metroCercano?.tiempoCaminando;
    const nombreMetro = building.metroCercano?.nombre;
    const stock = building.units?.filter(u => u.disponible).length;
    const totalUnitsCount = building.units?.length || 0;
    // Mostrar botón "Cambiar" solo si hay más de una unidad en el edificio
    const shouldShowChangeButton = onSelectOtherUnit && totalUnitsCount > 1;

    // Formatear texto informativo
    const getInfoText = () => {
        const parts: string[] = [];
        parts.push(`${m2}m²`);
        if (dormitorios > 0) {
            parts.push(`${dormitorios} ${dormitorios === 1 ? 'dormitorio' : 'dormitorios'}`);
        }
        if (estacionamiento > 0) {
            parts.push(`${estacionamiento} ${estacionamiento === 1 ? 'estacionamiento' : 'estacionamientos'}`);
        }
        return `Apartamento para arrendar con ${parts.join(', ')}`;
    };

    // Navegar a mapa (scroll a tabs)
    const handleMapClick = () => {
        const tabsSection = document.querySelector('[role="tablist"]');
        if (tabsSection) {
            tabsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Activar tab de características que contiene ubicación
            const caracteristicasTab = document.querySelector('[data-tab-id="caracteristicas"]') as HTMLElement;
            caracteristicasTab?.click();
        }
    };

    return (
        <>
        <section aria-labelledby="af-title" className="relative">
            {/* Hero Image con Overlay (60-70vh) - anchura completa, bordes cuadrados, imagen hasta el top */}
            <div className="w-screen relative left-1/2 -translate-x-1/2 -mt-4 lg:-mt-8">
                <div className="relative min-h-[60vh] max-h-[70vh] h-[65vh] w-full overflow-hidden">
                {/* Slider de imágenes */}
                <div
                    ref={scrollRef}
                    className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide h-full w-full"
                    onScroll={handleScroll}
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {finalImages.map((image, index) => (
                        <div
                            key={`hero-slide-${index}`}
                            className="flex-shrink-0 w-full h-full relative snap-center"
                        >
                            <Image
                                src={image}
                                alt={`Imagen ${index + 1} de ${totalImages} de la propiedad`}
                                fill
                                className="object-cover"
                                priority={index === 0}
                                loading={index === 0 ? "eager" : "lazy"}
                                sizes="100vw"
                                placeholder="blur"
                                blurDataURL={DEFAULT_BLUR}
                            />
                        </div>
                    ))}
                </div>

                {/* Overlay superior: Acciones rápidas */}
                <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4">
                    {/* Botón back */}
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 flex items-center justify-center bg-black/40 backdrop-blur-sm hover:bg-black/60 text-white rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                        aria-label="Volver"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>

                    {/* Acciones derecha: Share y Favorito */}
                    <div className="flex gap-2">
                        <button
                            onClick={onShare}
                            className="w-10 h-10 flex items-center justify-center bg-black/40 backdrop-blur-sm hover:bg-black/60 text-white rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                            aria-label="Compartir propiedad"
                        >
                            <Share2 className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => {
                                setIsSaved(!isSaved);
                                onSave?.();
                            }}
                            className={`w-10 h-10 flex items-center justify-center backdrop-blur-sm rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 ${
                                isSaved
                                    ? "bg-red-500/80 hover:bg-red-500/90 text-white"
                                    : "bg-black/40 hover:bg-black/60 text-white"
                            }`}
                            aria-label={isSaved ? "Quitar de favoritos" : "Guardar en favoritos"}
                        >
                            <Heart className={`w-5 h-5 ${isSaved ? "fill-current" : ""}`} />
                        </button>
                    </div>
                </div>

                {/* Overlay inferior: Información clave + Pills navegación */}
                <div className="absolute bottom-0 left-0 right-0 z-20 p-4 pb-6 bg-gradient-to-t from-black/90 via-black/75 to-black/40">
                    {/* Pills de navegación */}
                    <div className="flex gap-2 mb-4">
                        {hasVideo && (
                            <button
                                onClick={() => setIsVideoModalOpen(true)}
                                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/25 backdrop-blur-md hover:bg-white/35 text-white text-xs sm:text-sm font-semibold rounded-full border border-white/40 shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/70 flex items-center gap-1.5"
                                aria-label="Ver video"
                            >
                                <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current shrink-0" aria-hidden />
                                Ver video
                            </button>
                        )}
                        <button
                            onClick={handleMapClick}
                            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/25 backdrop-blur-md hover:bg-white/35 text-white text-xs sm:text-sm font-semibold rounded-full border border-white/40 shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/70 flex items-center gap-1.5"
                            aria-label="Ver ubicación"
                        >
                            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span>Ver ubicación</span>
                        </button>
                    </div>

                    {/* Texto informativo con mejor contraste */}
                    <p className="text-white text-base sm:text-lg font-bold leading-tight [text-shadow:_0_2px_8px_rgb(0_0_0_/_80%)]">
                        {getInfoText()}
                    </p>
                </div>

                {/* Indicador de imagen activa (si hay más de una) */}
                {totalImages > 1 && (
                    <div className="absolute top-20 right-4 z-20 bg-black/50 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-medium">
                        {activeImageIndex + 1} / {totalImages}
                    </div>
                )}

                {/* Flechas de navegación interactivas */}
                {totalImages > 1 && (
                    <>
                        {/* Flecha izquierda */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                goToPrevious();
                            }}
                            disabled={!isInfinite && activeImageIndex === 0}
                            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white rounded-full transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg"
                            aria-label="Imagen anterior"
                        >
                            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                        </button>

                        {/* Flecha derecha */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                goToNext();
                            }}
                            disabled={!isInfinite && activeImageIndex === totalImages - 1}
                            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white rounded-full transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg"
                            aria-label="Imagen siguiente"
                        >
                            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                        </button>
                    </>
                )}
                </div>
            </div>

            {/* Breadcrumb y título (debajo del hero) */}
            <div className="px-4 pt-4 pb-2">
                <nav aria-label="breadcrumb" className="text-xs text-gray-600 dark:text-slate-400 mb-2">
                    <span className="font-medium">{building.comuna}</span>
                    <span className="mx-2 text-gray-300 dark:text-slate-500">·</span>
                    <span className="text-gray-700 dark:text-slate-300">{building.name}</span>
                </nav>
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#8B6CFF]/15 text-[#8B6CFF] border border-[#8B6CFF]/30">
                                <Star className="w-3.5 h-3.5 shrink-0" aria-hidden />
                                Destacado
                            </span>
                            {stock === 1 && (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/40 shadow-sm">
                                    Última unidad disponible
                                </span>
                            )}
                        </div>
                        <h1 id="af-title" className="text-xl font-semibold leading-tight text-gray-900 dark:text-white">
                            Departamento {selectedUnit?.codigoUnidad ?? selectedUnit?.id?.split("-").pop() ?? "—"}
                        </h1>
                        <p className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-slate-400 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 shrink-0 text-[#8B6CFF]" aria-hidden />
                            <span>{building.address}</span>
                        </p>
                    </div>
                    {shouldShowChangeButton && (
                        <button
                            onClick={onSelectOtherUnit}
                            className="shrink-0 px-3 py-1.5 text-xs font-medium text-[#8B6CFF] hover:text-[#7a5ce6] border border-[#8B6CFF]/30 hover:border-[#8B6CFF]/50 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8B6CFF] focus-visible:ring-offset-2"
                            aria-label="Seleccionar otra unidad"
                        >
                            Cambiar
                        </button>
                    )}
                </div>
            </div>

            {/* Precio total/mes */}
            <div className="px-4 py-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-end justify-between gap-4">
                    <div className="flex flex-col">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            ${arriendo.toLocaleString('es-CL')}
                            <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
                                / mes
                            </span>
                        </p>
                        {ggcc > 0 && (
                            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                                + ${ggcc.toLocaleString('es-CL')}
                                <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
                                    (GGCC)
                                </span>
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col items-end shrink-0 pb-1">
                        <span className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium mb-1">
                            Operado por
                        </span>
                        <div className="flex items-center">
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                Elkis Realtor
                            </span>
                        </div>
                    </div>
                </div>

                {/* Badges clave */}
                <div className="mt-4 flex flex-wrap items-center gap-2">
                    {m2 && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 shadow-sm">
                            <Square className="w-3.5 h-3.5 shrink-0 text-[#8B6CFF]" aria-hidden />
                            {m2} m²
                        </span>
                    )}
                    {m2Balcon != null && m2Balcon > 0 && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 shadow-sm">
                            <Sun className="w-3.5 h-3.5 shrink-0 text-[#8B6CFF]" aria-hidden />
                            {m2Balcon} m²
                        </span>
                    )}
                    {petFriendly !== undefined && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 shadow-sm">
                            <PawPrint className="w-3.5 h-3.5 shrink-0 text-[#8B6CFF]" aria-hidden />
                            {petFriendly ? 'Pet-friendly' : 'No mascotas'}
                        </span>
                    )}
                    {/* Badge de metro: logo + estación + tiempo */}
                    {building.metroCercano && minutosMetro != null && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 shadow-sm">
                            <Image src="/icons/metro-santiago.png" alt="" width={16} height={16} className="shrink-0 object-contain" aria-hidden />
                            {nombreMetro ? `${nombreMetro} ${minutosMetro} min` : `${minutosMetro} min`}
                        </span>
                    )}

                    {/* Badge de urgencia si stock bajo (2 o 3 unidades; "Última unidad disponible" va junto a Destacado) */}
                    {stock !== undefined && stock > 1 && stock <= 3 && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/40 shadow-sm">
                            Quedan {stock}
                        </span>
                    )}
                </div>
            </div>

            {/* Sticky CTA Bar - aparece después de scroll > 120px (solo arriendo, sin gasto común) */}
            <StickyCtaBar
                priceMonthly={arriendo}
                onBook={onScheduleVisit}
                onWhatsApp={onWhatsApp || (() => {})}
                propertyId={selectedUnit?.id}
                commune={building.comuna}
                unit={selectedUnit}
                buildingId={building.id}
            />

            {hasVideo && (
                <PropertyVideoModal
                    isOpen={isVideoModalOpen}
                    onClose={() => setIsVideoModalOpen(false)}
                    videoUrl={firstVideoUrl!}
                />
            )}
        </section>
        </>
    );
}
