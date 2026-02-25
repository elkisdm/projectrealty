"use client";

import Link from "next/link";
import { Fragment } from "react";
import type { AdminPageAction, AdminRole } from "@/types/admin-ui";
import { canAccess } from "@components/admin/ui/role";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface BreadcrumbEntry {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbEntry[];
  actions?: AdminPageAction[];
  role?: AdminRole;
}

function actionClass(variant: AdminPageAction["variant"]) {
  if (variant === "danger") return "destructive";
  if (variant === "secondary") return "outline";
  if (variant === "ghost") return "ghost";
  return "primary";
}

export function PageHeader({
  title,
  description,
  breadcrumbs = [],
  actions = [],
  role = "viewer",
}: PageHeaderProps) {
  const visibleActions = actions.filter((action) => canAccess(role, action.minRole || "viewer"));

  return (
    <header className="mb-6">
      {breadcrumbs.length > 0 ? (
        <Breadcrumb className="mb-3">
          <BreadcrumbList>
            {breadcrumbs.map((item, index) => (
              <Fragment key={`${item.label}-${index}`}>
                <BreadcrumbItem>
                  {item.href ? (
                    <BreadcrumbLink asChild>
                      <Link href={item.href}>{item.label}</Link>
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                {index < breadcrumbs.length - 1 ? <BreadcrumbSeparator /> : null}
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      ) : null}

      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">{title}</h1>
          {description ? <p className="mt-1 text-sm text-[var(--subtext)]">{description}</p> : null}
        </div>
        {visibleActions.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            {visibleActions.map((action) =>
              action.href ? (
                <Button key={action.key} asChild size="sm" variant={actionClass(action.variant) as "primary" | "outline" | "destructive" | "ghost"}>
                  <Link href={action.href} className="inline-flex items-center gap-2">
                    {action.icon}
                    {action.label}
                  </Link>
                </Button>
              ) : (
                <Button
                  key={action.key}
                  onClick={action.onClick}
                  disabled={action.disabled}
                  size="sm"
                  variant={actionClass(action.variant) as "primary" | "outline" | "destructive" | "ghost"}
                  className="inline-flex items-center gap-2"
                >
                  {action.icon}
                  {action.label}
                </Button>
              )
            )}
          </div>
        ) : null}
      </div>
    </header>
  );
}
