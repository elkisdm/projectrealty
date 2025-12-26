"use client";
import React from "react";
import { Sparkles } from "lucide-react";
import type { Building, Unit } from "@schemas/models";
import { getPropertyTags, type PropertyTag } from "@lib/property-tags";

interface PropertyTagsProps {
  building: Building;
  unit?: Unit;
  variant?: "catalog" | "marketing" | "admin";
  className?: string;
}

/**
 * Componente que renderiza tags de estado y urgencia para propiedades
 * Basado en mejores prácticas de QuintoAndar
 */
export function PropertyTags({
  building,
  unit,
  variant = "catalog",
  className = "",
}: PropertyTagsProps) {
  const tags = getPropertyTags(building, unit);

  // Si no hay tags, no renderizar nada
  if (tags.length === 0) {
    return null;
  }

  const handleTagClick = (tag: PropertyTag) => {
    // Analytics tracking
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "tag_click", {
        tag_type: tag.type,
        tag_label: tag.label,
        property_id: building.id,
        variant,
      });
    }
  };

  return (
    <div
      className={`flex flex-wrap gap-2 lg:gap-3 ${className}`}
      role="group"
      aria-label="Tags de estado y urgencia"
    >
      {tags.map((tag) => (
        <div
          key={tag.type}
          className={`flex-1 lg:flex-none inline-flex items-center justify-center gap-2 lg:gap-3 px-4 lg:px-6 py-2.5 lg:py-3 bg-gradient-to-r ${tag.color} text-white text-sm lg:text-base font-bold rounded-xl lg:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 group cursor-pointer`}
          tabIndex={0}
          role="button"
          aria-label={tag.label}
          onClick={() => handleTagClick(tag)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleTagClick(tag);
            }
          }}
        >
          {tag.icon ? (
            <tag.icon className="w-4 h-4 lg:w-5 lg:h-5 group-hover:scale-110 transition-transform duration-200" />
          ) : (
            <Sparkles className="w-4 h-4 lg:w-5 lg:h-5 group-hover:scale-110 transition-transform duration-200" />
          )}
          <span className="whitespace-nowrap hidden sm:inline">{tag.label}</span>
          <span className="whitespace-nowrap sm:hidden">{tag.label.split(" ")[0]}</span>
        </div>
      ))}
    </div>
  );
}

