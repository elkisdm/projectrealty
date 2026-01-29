"use client";

import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorMessageProps {
  error?: string | { message?: string };
  className?: string;
  id?: string;
}

/**
 * ErrorMessage - Componente reutilizable para mostrar mensajes de error
 * Usado en formularios con react-hook-form + Zod
 */
export function ErrorMessage({ error, className, id }: ErrorMessageProps) {
  if (!error) return null;

  const message = typeof error === "string" ? error : error.message;
  if (!message) return null;

  return (
    <p
      id={id}
      role="alert"
      className={cn(
        "mt-1 text-sm text-accent-error dark:text-red-400",
        "flex items-center gap-1.5",
        className
      )}
    >
      <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </p>
  );
}
