"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { normalizeWhatsApp, isValidWhatsAppCL } from "@/lib/utils/whatsapp";
import { cn } from "@/lib/utils";

interface WhatsAppInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  label?: string;
  id?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  error?: string;
  required?: boolean;
}

type ValidationState = "idle" | "typing" | "valid" | "invalid";

export function WhatsAppInput({
  value,
  onChange,
  onBlur,
  placeholder = "+56 9 1234 5678",
  className = "",
  label,
  id = "whatsapp",
  autoFocus = false,
  disabled = false,
  error,
  required = true,
}: WhatsAppInputProps) {
  const [localValue, setLocalValue] = useState(value);
  const [validationState, setValidationState] = useState<ValidationState>("idle");
  const [normalizedValue, setNormalizedValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Normalizar y validar mientras el usuario escribe
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (localValue.trim().length === 0) {
      setValidationState("idle");
      setNormalizedValue("");
      onChange("");
      return;
    }

    if (localValue.trim().length < 3) {
      setValidationState("typing");
      setNormalizedValue("");
      onChange(localValue);
      return;
    }

    // Debounce de validación
    timeoutRef.current = setTimeout(() => {
      const normalized = normalizeWhatsApp(localValue);
      const isValid = isValidWhatsAppCL(localValue);

      setNormalizedValue(normalized);
      setValidationState(isValid ? "valid" : "invalid");
      onChange(localValue); // Mantener el valor original para que el usuario pueda seguir editando
    }, 300);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [localValue, onChange]);

  // Sincronizar con valor externo
  useEffect(() => {
    if (value !== localValue) {
      setLocalValue(value);
    }
  }, [value]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
  }, []);

  const handleBlur = useCallback(() => {
    // Al perder el foco, normalizar el valor si es válido
    if (validationState === "valid" && normalizedValue) {
      setLocalValue(normalizedValue);
      onChange(normalizedValue);
    }
    onBlur?.();
  }, [validationState, normalizedValue, onChange, onBlur]);

  const hasError = error || (validationState === "invalid" && localValue.length >= 3);
  const showSuccess = validationState === "valid" && localValue.length >= 8;

  return (
    <div className={cn("relative", className)}>
      {label && (
        <Label htmlFor={id} className="text-sm sm:text-base text-text font-medium mb-2 block">
          {label}
          {required && <span className="text-accent-error ml-1">*</span>}
        </Label>
      )}
      <div className="relative">
        <Input
          ref={inputRef}
          id={id}
          type="tel"
          value={localValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          autoFocus={autoFocus}
          disabled={disabled}
          className={cn(
            "mt-2 rounded-xl min-h-[44px] bg-surface dark:bg-surface border-border text-text placeholder:text-subtext focus-visible:ring-brand-violet pr-10",
            hasError && "border-accent-error focus-visible:ring-accent-error",
            showSuccess && "border-accent-success"
          )}
          aria-required={required}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${id}-error` : showSuccess ? `${id}-success` : undefined}
        />
        {showSuccess && (
          <div
            id={`${id}-success`}
            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          >
            <CheckCircle className="w-5 h-5 text-accent-success" />
          </div>
        )}
        {hasError && validationState === "invalid" && !error && (
          <div
            id={`${id}-error-icon`}
            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          >
            <AlertCircle className="w-5 h-5 text-accent-error" />
          </div>
        )}
      </div>

      {/* Mensajes de ayuda y error */}
      {hasError && (
        <p
          id={`${id}-error`}
          className="mt-1.5 text-xs sm:text-sm text-accent-error"
          role="alert"
        >
          {error || "Formato inválido. Usa: +56 9 1234 5678"}
        </p>
      )}
      {validationState === "typing" && localValue.length >= 3 && localValue.length < 8 && !error && (
        <p className="mt-1.5 text-xs text-subtext">
          Formato: +56 9 1234 5678
        </p>
      )}
      {showSuccess && !error && (
        <p
          id={`${id}-success-message`}
          className="mt-1.5 text-xs text-accent-success"
        >
          Número válido
        </p>
      )}
    </div>
  );
}
