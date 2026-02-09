"use client";

import React, { useMemo } from "react";
import { X } from "lucide-react";
import { BaseModal } from "@/components/ui/BaseModal";
import { VideoPlayer } from "@/components/ui/video-player";

function getYouTubeEmbedUrl(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]+)/,
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m) return `https://www.youtube.com/embed/${m[1]}?autoplay=1`;
  }
  return null;
}

function getVimeoEmbedUrl(url: string): string | null {
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (m) return `https://player.vimeo.com/video/${m[1]}?autoplay=1`;
  return null;
}

type VideoType = "youtube" | "vimeo" | "direct";

function getVideoType(url: string): VideoType {
  if (getYouTubeEmbedUrl(url)) return "youtube";
  if (getVimeoEmbedUrl(url)) return "vimeo";
  return "direct";
}

export interface PropertyVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
}

export function PropertyVideoModal({ isOpen, onClose, videoUrl }: PropertyVideoModalProps) {
  const { type, embedUrl } = useMemo(() => {
    const t = getVideoType(videoUrl);
    if (t === "youtube") {
      return { type: "youtube" as const, embedUrl: getYouTubeEmbedUrl(videoUrl)! };
    }
    if (t === "vimeo") {
      return { type: "vimeo" as const, embedUrl: getVimeoEmbedUrl(videoUrl)! };
    }
    return { type: "direct" as const, embedUrl: videoUrl };
  }, [videoUrl]);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Video de la propiedad"
      description="Reproductor de video de la propiedad"
      panelClassName="max-w-4xl w-full p-0 overflow-hidden"
      closeOnOverlayClick
      closeOnEscape
    >
      <div className="relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/70"
          aria-label="Cerrar video"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="aspect-video w-full bg-black rounded-b-2xl overflow-hidden [&_.rounded-lg]:rounded-none">
          {type === "youtube" || type === "vimeo" ? (
            <iframe
              src={embedUrl}
              title="Video de la propiedad"
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <VideoPlayer
              src={embedUrl}
              title="Video de la propiedad"
              description="Reproductor de video de la propiedad"
            />
          )}
        </div>
      </div>
    </BaseModal>
  );
}
