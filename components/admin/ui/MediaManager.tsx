"use client";

import { useMemo, useRef, useState } from "react";

type MediaType = "image" | "video";

interface MediaManagerProps {
  title: string;
  description?: string;
  mediaType: MediaType;
  urls: string[];
  uploading?: boolean;
  maxItems: number;
  accept: string;
  helperText?: string;
  onUpload: (files: FileList) => Promise<void> | void;
  onChange: (urls: string[]) => void;
  onSetCover?: (url: string) => void;
}

export function MediaManager({
  title,
  description,
  mediaType,
  urls,
  uploading = false,
  maxItems,
  accept,
  helperText,
  onUpload,
  onChange,
  onSetCover,
}: MediaManagerProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const remaining = useMemo(() => Math.max(maxItems - urls.length, 0), [maxItems, urls.length]);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    await onUpload(files);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-[var(--text)]">{title}</h4>
          {description ? <p className="text-xs text-[var(--subtext)]">{description}</p> : null}
        </div>
        <span className="rounded-full bg-[var(--admin-surface-2)] px-2 py-1 text-xs text-[var(--subtext)] ring-1 ring-[var(--admin-border-subtle)]">
          {urls.length}/{maxItems}
        </span>
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          if (uploading || remaining <= 0) return;
          handleFiles(event.dataTransfer.files).catch(() => null);
        }}
        disabled={uploading || remaining <= 0}
        className={`w-full rounded-xl border border-dashed p-4 text-left transition-colors ${
          dragging
            ? "border-brand-violet bg-brand-violet/10"
            : "border-[var(--admin-border-strong)] bg-[var(--admin-surface-2)]"
        } disabled:cursor-not-allowed disabled:opacity-60`}
      >
        <p className="text-sm font-medium text-[var(--text)]">
          {uploading ? "Subiendo archivos..." : `Arrastra y suelta o selecciona ${mediaType === "image" ? "imagenes" : "videos"}`}
        </p>
        <p className="mt-1 text-xs text-[var(--subtext)]">{helperText || `Puedes cargar hasta ${remaining} mas.`}</p>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        className="hidden"
        onChange={(event) => {
          handleFiles(event.target.files).catch(() => null);
          event.target.value = "";
        }}
      />

      {urls.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {urls.map((url, index) => (
            <div key={`${url}-${index}`} className="overflow-hidden rounded-xl border border-[var(--admin-border-subtle)] bg-[var(--admin-surface-2)]">
              <div className="aspect-video bg-black/20">
                {mediaType === "image" ? (
                  <img src={url} alt={`${title} ${index + 1}`} className="h-full w-full object-cover" />
                ) : (
                  <video src={url} controls className="h-full w-full object-cover" preload="metadata" />
                )}
              </div>
              <div className="flex items-center justify-between gap-2 p-2">
                <p className="truncate text-xs text-[var(--subtext)]">{url}</p>
                <div className="flex items-center gap-2">
                  {mediaType === "image" && onSetCover ? (
                    <button
                      type="button"
                      onClick={() => onSetCover(url)}
                      className="rounded-md bg-[var(--bg)] px-2 py-1 text-xs text-[var(--text)] ring-1 ring-[var(--admin-border-subtle)] hover:bg-[var(--admin-surface-1)]"
                    >
                      Portada
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => onChange(urls.filter((item) => item !== url))}
                    className="rounded-md bg-rose-500/20 px-2 py-1 text-xs text-rose-300 hover:bg-rose-500/30"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
