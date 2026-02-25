"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: "up" | "down" | "neutral";
  href?: string;
}

function trendClass(trend?: KpiCardProps["trend"]) {
  if (trend === "up") return "success";
  if (trend === "down") return "destructive";
  return "neutral";
}

export function KpiCard({ title, value, subtitle, icon, trend, href }: KpiCardProps) {
  const content = (
    <Card className="rounded-2xl border-[var(--admin-border-subtle)] bg-[var(--admin-surface-1)] shadow-sm transition-all hover:border-[var(--admin-border-strong)] hover:shadow-md">
      <CardContent className="p-5">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[var(--subtext)]">{icon}</span>
        {trend ? (
          <Badge variant={trendClass(trend) as "success" | "destructive" | "neutral"} className="px-2 py-0 text-[10px]">
            {trend === "up" ? "▲" : trend === "down" ? "▼" : "•"}
          </Badge>
        ) : null}
      </div>
      <p className="text-xs uppercase tracking-wide text-[var(--subtext)]">{title}</p>
      <p className="mt-1 text-3xl font-bold text-[var(--text)]">{value}</p>
      {subtitle ? <p className="mt-2 text-xs text-[var(--subtext)]">{subtitle}</p> : null}
      </CardContent>
    </Card>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}
