"use client";

import { Menu, LogOut, ChevronDown } from "lucide-react";
import type { AdminRole } from "@/types/admin-ui";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AdminTopbarProps {
  pathname: string;
  email?: string;
  role: AdminRole;
  onOpenMobileMenu: () => void;
  onLogout: () => void;
  isLoggingOut?: boolean;
}

function toLabel(segment: string) {
  if (segment === "admin") return "Admin";
  if (segment === "units") return "Unidades";
  if (segment === "buildings") return "Edificios";
  if (segment === "completeness") return "Completitud";
  if (segment === "flags") return "Feature Flags";
  if (segment === "listar-propiedad") return "Listar propiedad";
  if (segment === "login") return "Login";
  return segment.replace(/-/g, " ");
}

function buildCrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  return segments.map((segment) => toLabel(segment));
}

export function AdminTopbar({
  pathname,
  email,
  role,
  onOpenMobileMenu,
  onLogout,
  isLoggingOut = false,
}: AdminTopbarProps) {
  const crumbs = buildCrumbs(pathname);

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-[var(--admin-border-subtle)] bg-[var(--bg)]/90 backdrop-blur-md">
      <div className="flex h-full items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <Button
            onClick={onOpenMobileMenu}
            variant="ghost"
            size="icon"
            className="text-[var(--subtext)] hover:bg-[var(--admin-surface-2)] hover:text-[var(--text)] md:hidden"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <nav className="flex items-center gap-2 text-xs text-[var(--subtext)]">
            {crumbs.map((crumb, index) => (
              <div key={`${crumb}-${index}`} className="flex items-center gap-2">
                <span className={index === crumbs.length - 1 ? "font-semibold text-[var(--text)]" : ""}>{crumb}</span>
                {index < crumbs.length - 1 ? <span>/</span> : null}
              </div>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="neutral" className="uppercase">{role}</Badge>
          {email ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="hidden lg:flex items-center gap-2 text-[var(--subtext)]">
                  {email}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="px-2 py-1.5 text-xs text-muted-foreground">{email}</div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} disabled={isLoggingOut} className="text-rose-400 focus:text-rose-300">
                  <LogOut className="mr-2 h-4 w-4" />
                  {isLoggingOut ? "Cerrando..." : "Cerrar sesion"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
          {!email ? (
            <Button onClick={onLogout} disabled={isLoggingOut} variant="ghost" size="sm" className="hidden lg:inline-flex">
              {isLoggingOut ? "Cerrando..." : "Cerrar sesion"}
            </Button>
          ) : null}
          <Button
            onClick={onLogout}
            disabled={isLoggingOut}
            variant="ghost"
            size="sm"
            className="lg:hidden"
          >
            {isLoggingOut ? "Cerrando..." : "Salir"}
          </Button>
        </div>
      </div>
    </header>
  );
}
