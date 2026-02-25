"use client";

import { ShieldAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface PermissionStateProps {
  title?: string;
  description?: string;
}

export function PermissionState({
  title = "No tienes permisos para esta accion",
  description = "Contacta a un administrador si necesitas acceso adicional.",
}: PermissionStateProps) {
  return (
    <Alert className="rounded-2xl border-amber-500/30 bg-amber-500/10 text-amber-200">
      <ShieldAlert className="h-4 w-4 text-amber-300" />
      <AlertTitle className="text-amber-300">{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  );
}
