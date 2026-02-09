"use client";

import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title?: string;
  description: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorState({
  title = "No pudimos completar la operacion",
  description,
  onRetry,
  retryLabel = "Reintentar",
}: ErrorStateProps) {
  return (
    <Alert variant="destructive" className="rounded-2xl border-rose-500/40 bg-rose-500/10">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="space-y-3">
        <p>{description}</p>
        {onRetry ? (
          <Button type="button" size="sm" variant="outline" onClick={onRetry} className="border-rose-300/40 bg-transparent text-rose-200 hover:bg-rose-500/20">
            {retryLabel}
          </Button>
        ) : null}
      </AlertDescription>
    </Alert>
  );
}
