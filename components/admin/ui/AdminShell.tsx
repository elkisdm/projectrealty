"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import type { AdminNavItem, AdminRole } from "@/types/admin-ui";
import { AdminSidebar } from "@components/admin/ui/AdminSidebar";
import { AdminTopbar } from "@components/admin/ui/AdminTopbar";
import { Sheet, SheetContent } from "@/components/ui/sheet";

interface AdminShellProps {
  navItems: AdminNavItem[];
  role: AdminRole;
  email?: string;
  pathname: string;
  onLogout: () => void;
  isLoggingOut?: boolean;
  children: ReactNode;
}

export function AdminShell({
  navItems,
  role,
  email,
  pathname,
  onLogout,
  isLoggingOut = false,
  children,
}: AdminShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="hidden md:block">
        <AdminSidebar
          items={navItems}
          role={role}
          pathname={pathname}
          collapsed={collapsed}
          onToggleCollapsed={() => setCollapsed((prev) => !prev)}
        />
      </div>

      <div className="flex min-h-screen flex-1 flex-col">
        <AdminTopbar
          pathname={pathname}
          email={email}
          role={role}
          onOpenMobileMenu={() => setMobileOpen(true)}
          onLogout={onLogout}
          isLoggingOut={isLoggingOut}
        />
        <main className="min-h-[calc(100vh-4rem)] pt-8 px-4 pb-4 md:pt-10 md:px-6 md:pb-6">{children}</main>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[280px] p-0 md:hidden">
          <AdminSidebar
            items={navItems}
            role={role}
            pathname={pathname}
            collapsed={false}
            onToggleCollapsed={() => null}
            onNavigate={() => setMobileOpen(false)}
            className="w-full border-r-0"
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
