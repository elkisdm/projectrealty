"use client";

import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";

interface IconifyIconProps {
  icon: string; // Ej: "tabler:home"
  className?: string;
  size?: number | string;
  "aria-hidden"?: boolean;
  "aria-label"?: string;
}

export function IconifyIcon({
  icon,
  className,
  size,
  "aria-hidden": ariaHidden,
  "aria-label": ariaLabel,
}: IconifyIconProps) {
  return (
    <Icon
      icon={icon}
      className={cn("flex-shrink-0", className)}
      width={size || "1em"}
      height={size || "1em"}
      aria-hidden={ariaHidden}
      aria-label={ariaLabel}
    />
  );
}
