"use client";

import Link from "next/link";
import type { AdminNavItem, AdminRole } from "@/types/admin-ui";
import { canAccess } from "@components/admin/ui/role";
import { Button } from "@/components/ui/button";

interface AdminSidebarProps {
  items: AdminNavItem[];
  role: AdminRole;
  pathname: string;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onNavigate?: () => void;
  className?: string;
}

export function AdminSidebar({
  items,
  role,
  pathname,
  collapsed,
  onToggleCollapsed,
  onNavigate,
  className,
}: AdminSidebarProps) {
  const visibleItems = items.filter((item) => canAccess(role, item.minRole));

  return (
    <aside className={`flex h-full flex-col border-r border-[var(--admin-border-subtle)] bg-[var(--admin-surface-1)] ${collapsed ? "w-[84px]" : "w-[260px]"} transition-[width] duration-150 ${className || ""}`}>
      <div className="flex h-16 items-center justify-between border-b border-[var(--admin-border-subtle)] px-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-violet/20 text-brand-violet">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21h18M5 21V7l8-4 6 3v15M9 9h.01M9 12h.01M9 15h.01M13 9h.01M13 12h.01M13 15h.01" />
            </svg>
          </div>
          {!collapsed ? <span className="text-sm font-semibold text-[var(--text)]">Admin Ops</span> : null}
        </div>
        <Button
          onClick={onToggleCollapsed}
          variant="ghost"
          size="icon"
          className="hidden text-[var(--subtext)] hover:bg-[var(--admin-surface-2)] hover:text-[var(--text)] md:inline-flex"
          aria-label="Colapsar menu"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={collapsed ? "M13 5l7 7-7 7M5 5h5v14H5z" : "M11 5l-7 7 7 7M14 5h5v14h-5z"} />
          </svg>
        </Button>
      </div>

      <nav className="flex-1 space-y-1 p-2">
        {visibleItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.key}
              href={item.href}
              onClick={onNavigate}
              className={`group flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-brand-violet/20 text-brand-violet ring-1 ring-brand-violet/40"
                  : "text-[var(--subtext)] hover:bg-[var(--admin-surface-2)] hover:text-[var(--text)]"
              }`}
            >
              <span className="inline-flex h-5 w-5 items-center justify-center">{item.icon}</span>
              {!collapsed ? <span className="truncate">{item.label}</span> : null}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
