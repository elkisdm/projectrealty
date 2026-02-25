"use client";

import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
  label?: string;
}

const statusVariants: Record<string, "success" | "warning" | "destructive" | "info" | "neutral"> = {
  published: "success",
  draft: "warning",
  archived: "neutral",
  active: "success",
  inactive: "destructive",
  success: "success",
  warning: "warning",
  error: "destructive",
  info: "info",
};

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const normalized = String(status || "").toLowerCase();
  const variant = statusVariants[normalized] || "neutral";

  return <Badge variant={variant}>{label || status}</Badge>;
}
