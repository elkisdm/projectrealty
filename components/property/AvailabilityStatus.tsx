"use client";
import React, { useState } from "react";
import { Bell, CheckCircle2, Info } from "lucide-react";
import type { Unit } from "@schemas/models";

interface AvailabilityStatusProps {
  unit: Unit;
  buildingName?: string;
  className?: string;
}

/**
 * Determina si una unidad está "Em breve" (disponible pronto)
 * Función helper local que replica la lógica de lib/property-tags.ts
 */
function checkIsComingSoon(unit: Unit): boolean {
  // Verificar campo estado con valor "RE - Acondicionamiento"
  if (unit.estado === "RE - Acondicionamiento") {
    return true;
  }

  // Verificar campo estadoRaw (preservado desde AssetPlan)
  const estadoRaw = (unit as { estadoRaw?: string }).estadoRaw;
  if (estadoRaw) {
    const estadoLower = estadoRaw.toLowerCase();
    if (
      estadoLower.includes("re - acondicionamiento") ||
      estadoLower.includes("reacondicionamiento") ||
      estadoLower.includes("acondicionamiento")
    ) {
      return true;
    }
  }

  // Verificar si disponible es true pero status no es "available" (puede estar en reacondicionamiento)
  // Esto es un fallback si el estado no está bien mapeado
  if (unit.disponible && unit.status !== "available" && unit.status !== "reserved" && unit.status !== "rented") {
    return true;
  }

  return false;
}

/**
 * Componente que muestra el estado de disponibilidad de una unidad
 * Basado en mejores prácticas de QuintoAndar
 */
export function AvailabilityStatus({
  unit,
  buildingName,
  className = "",
}: AvailabilityStatusProps) {
  const [showNotificationForm, setShowNotificationForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isComingSoonStatus = checkIsComingSoon(unit);

  // Solo mostrar si la unidad está "Em breve"
  if (!isComingSoonStatus) {
    return null;
  }

  const handleNotifyMe = async () => {
    setShowNotificationForm(true);
  };

  const handleSubmitNotification = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string | null;
    const name = formData.get("name") as string | null;

    try {
      const response = await fetch("/api/availability-notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          phone: phone || undefined,
          name: name || undefined,
          unitId: unit.id,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        setShowNotificationForm(false);
        
        // Analytics tracking
        if (typeof window !== "undefined" && window.gtag) {
          window.gtag("event", "availability_notification_subscribed", {
            unit_id: unit.id,
            building_name: buildingName,
          });
        }
      } else {
        // Verificar Content-Type antes de parsear JSON
        const contentType = response.headers.get("content-type") || "";
        let errorMessage = "Hubo un error. Por favor, intenta nuevamente.";
        
        if (contentType.includes("application/json")) {
          try {
            const error = await response.json();
            console.error("Error al suscribirse:", error);
            errorMessage = error.message || error.error || errorMessage;
          } catch {
            // Si falla el parseo, usar mensaje por defecto
            console.error("Error al suscribirse: Respuesta inválida");
          }
        } else {
          // Si no es JSON, leer como texto
          try {
            const text = await response.text();
            console.error("Error al suscribirse:", text.substring(0, 200));
          } catch {
            console.error("Error al suscribirse: No se pudo leer respuesta");
          }
        }
        
        alert(errorMessage);
      }
    } catch (error) {
      console.error("Error al suscribirse:", error);
      alert("Hubo un error. Por favor, intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div
        className={`rounded-2xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 ${className}`}
      >
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-100">
              Te notificaremos cuando esté disponible
            </p>
            <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
              Te avisaremos por email cuando esta unidad esté lista para arrendar.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (showNotificationForm) {
    return (
      <div
        className={`rounded-2xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 ${className}`}
      >
        <form onSubmit={handleSubmitNotification} className="space-y-3">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-yellow-900 dark:text-yellow-100 mb-1">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="w-full px-3 py-2 rounded-lg border border-yellow-300 dark:border-yellow-700 bg-white dark:bg-slate-800 text-text focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="tu@email.com"
            />
          </div>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-yellow-900 dark:text-yellow-100 mb-1">
              Nombre (opcional)
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="w-full px-3 py-2 rounded-lg border border-yellow-300 dark:border-yellow-700 bg-white dark:bg-slate-800 text-text focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="Tu nombre"
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-yellow-900 dark:text-yellow-100 mb-1">
              Teléfono (opcional)
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              className="w-full px-3 py-2 rounded-lg border border-yellow-300 dark:border-yellow-700 bg-white dark:bg-slate-800 text-text focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="+56 9 1234 5678"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Enviando..." : "Suscribirme"}
            </button>
            <button
              type="button"
              onClick={() => setShowNotificationForm(false)}
              className="px-4 py-2 border border-yellow-300 dark:border-yellow-700 text-yellow-900 dark:text-yellow-100 font-medium rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/40 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 ${className}`}
    >
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-100">
              Disponible pronto
            </p>
            <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
              Esta unidad está en reacondicionamiento y estará disponible próximamente.
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-yellow-200 dark:border-yellow-800">
          <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-3">
            Si tu propuesta es aceptada, serás notificado cuando la unidad esté lista.
          </p>
          <button
            onClick={handleNotifyMe}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
          >
            <Bell className="w-4 h-4" />
            Avisar cuando esté disponible
          </button>
        </div>
      </div>
    </div>
  );
}

