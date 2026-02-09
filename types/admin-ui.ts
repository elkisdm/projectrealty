import type { ReactNode } from "react";

export type AdminRole = "viewer" | "editor" | "admin";

export interface AdminNavItem {
  key: string;
  label: string;
  href: string;
  icon: ReactNode;
  minRole: AdminRole;
}

export interface AdminPageAction {
  key: string;
  label: string;
  icon?: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  onClick?: () => void;
  href?: string;
  minRole?: AdminRole;
  disabled?: boolean;
}

export type UiStatus = "idle" | "loading" | "success" | "error" | "empty" | "forbidden";

export interface DataGridColumn<T> {
  key: keyof T | string;
  label: string;
  width?: string;
  align?: "left" | "center" | "right";
  sortable?: boolean;
  renderCell?: (value: unknown, row: T) => ReactNode;
}

export interface DataGridRowAction<T> {
  key: string;
  label: string;
  variant?: "default" | "danger";
  onClick: (row: T) => void;
  minRole?: AdminRole;
}

export interface AdminDataTableState {
  sorting: Array<{ id: string; desc: boolean }>;
  rowSelection: Record<string, boolean>;
}

export interface AdminDataTable<T> {
  columns: DataGridColumn<T>[];
  data: T[];
  state: AdminDataTableState;
  onStateChange?: (state: AdminDataTableState) => void;
  rowActions?: DataGridRowAction<T>[];
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
  };
}

export interface FilterField {
  key: string;
  label: string;
  controlType: "select" | "checkbox" | "range";
  options?: Array<{ label: string; value: string }>;
  min?: number;
  max?: number;
  visibleWhen?: (values: Record<string, string | number | boolean>) => boolean;
}

export type AdminStatus = "success" | "warning" | "destructive" | "info" | "neutral";

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  requiredFields?: string[];
  completionRule?: (data: Record<string, unknown>) => number;
}
