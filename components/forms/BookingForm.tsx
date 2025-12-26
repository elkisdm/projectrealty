"use client";
import { useState, useRef, useEffect } from "react";
import { Calendar, MessageSquare, Phone, Mail, User, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { track } from "@lib/analytics";
import { buildWhatsAppUrl } from "@lib/whatsapp";

type BookingFormProps = {
  buildingId: string;
  buildingName: string;
  defaultUnitId?: string;
};

type FormData = {
  name: string;
  email: string;
  phone: string;
  message: string;
  preferredDate: string;
};

type FormState = "idle" | "loading" | "success" | "error";

export function BookingForm({ buildingId, buildingName, defaultUnitId }: BookingFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    message: "",
    preferredDate: "",
  });

  const [formState, setFormState] = useState<FormState>("idle");
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const formRef = useRef<HTMLFormElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  // Focus management for mobile panels
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === "#booking-form" && firstFieldRef.current) {
        setTimeout(() => {
          firstFieldRef.current?.focus();
        }, 100);
      }
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const validateField = (field: keyof FormData, value: string): string | null => {
    switch (field) {
      case "name":
        return value.trim().length < 2 ? "El nombre debe tener al menos 2 caracteres" : null;
      case "email": {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return !emailRegex.test(value) ? "Ingresa un email válido" : null;
      }
      case "phone": {
        const phoneRegex = /^[+]?[\d\s-()]{8,}$/;
        return !phoneRegex.test(value.replace(/\s/g, "")) ? "Ingresa un teléfono válido" : null;
      }
      default:
        return null;
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleBlur = (field: keyof FormData) => {
    const error = validateField(field, formData[field]);
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    (["name", "email", "phone"] as const).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setFormState("loading");

    try {
      const payload = {
        ...formData,
        buildingId,
        unitId: defaultUnitId || "",
        preferredDate: formData.preferredDate ? new Date(formData.preferredDate).toISOString() : undefined,
      };

      const response = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Error al enviar la solicitud");

      setFormState("success");
      // booking_submitted event (no PII)
      track("booking_submitted", {
        property_id: buildingId,
        unit_id: defaultUnitId || "",
        contacto_metodo: "form",
      });
      setFormData({ name: "", email: "", phone: "", message: "", preferredDate: "" });
    } catch {
      setFormState("error");
    }
  };

  const resetForm = () => {
    setFormState("idle");
    setErrors({});
  };

  if (formState === "success") {
    return (
      <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-6 text-center">
        <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">¡Solicitud enviada!</h3>
        <p className="text-[var(--subtext)] mb-4">
          Te contactaremos pronto para coordinar tu visita a {buildingName}.
        </p>
        <button
          onClick={resetForm}
          className="text-[var(--ring)] hover:underline focus:outline-none focus:underline"
        >
          Enviar otra solicitud
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-6">
      <h3 className="text-lg font-semibold mb-4">Reservar visita</h3>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        {/* Name Field */}
        <div>
          <label htmlFor="booking-name" className="block text-sm font-medium mb-1">
            Nombre completo *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--subtext)]" aria-hidden="true" />
            <input
              ref={firstFieldRef}
              id="booking-name"
              name="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              onBlur={() => handleBlur("name")}
              className={`w-full pl-10 pr-3 py-2 bg-[var(--soft)]/50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent ${errors.name ? "border-red-400" : "border-white/10"
                }`}
              placeholder="Tu nombre completo"
              required
              autoComplete="name"
              aria-required="true"
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "name-error" : undefined}
            />
          </div>
          {errors.name && (
            <p id="name-error" className="text-red-400 text-sm mt-1" role="alert">
              {errors.name}
            </p>
          )}
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="booking-email" className="block text-sm font-medium mb-1">
            Email *
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--subtext)]" aria-hidden="true" />
            <input
              id="booking-email"
              name="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              onBlur={() => handleBlur("email")}
              className={`w-full pl-10 pr-3 py-2 bg-[var(--soft)]/50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent ${errors.email ? "border-red-400" : "border-white/10"
                }`}
              placeholder="tu@email.com"
              required
              autoComplete="email"
              aria-required="true"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
          </div>
          {errors.email && (
            <p id="email-error" className="text-red-400 text-sm mt-1" role="alert">
              {errors.email}
            </p>
          )}
        </div>

        {/* Phone Field */}
        <div>
          <label htmlFor="booking-phone" className="block text-sm font-medium mb-1">
            Teléfono *
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--subtext)]" aria-hidden="true" />
            <input
              id="booking-phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              onBlur={() => handleBlur("phone")}
              className={`w-full pl-10 pr-3 py-2 bg-[var(--soft)]/50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent ${errors.phone ? "border-red-400" : "border-white/10"
                }`}
              placeholder="+56 9 1234 5678"
              required
              autoComplete="tel"
              aria-required="true"
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={errors.phone ? "phone-error" : undefined}
            />
          </div>
          {errors.phone && (
            <p id="phone-error" className="text-red-400 text-sm mt-1" role="alert">
              {errors.phone}
            </p>
          )}
        </div>

        {/* Preferred Date Field */}
        <div>
          <label htmlFor="booking-date" className="block text-sm font-medium mb-1">
            Fecha preferida (opcional)
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--subtext)]" aria-hidden="true" />
            <input
              id="booking-date"
              name="preferredDate"
              type="datetime-local"
              value={formData.preferredDate}
              onChange={(e) => handleInputChange("preferredDate", e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              className="w-full pl-10 pr-3 py-2 bg-[var(--soft)]/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent"
            />
          </div>
        </div>

        {/* Message Field */}
        <div>
          <label htmlFor="booking-message" className="block text-sm font-medium mb-1">
            Comentarios adicionales
          </label>
          <div className="relative">
            <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-[var(--subtext)]" aria-hidden="true" />
            <textarea
              id="booking-message"
              name="message"
              value={formData.message}
              onChange={(e) => handleInputChange("message", e.target.value)}
              rows={3}
              className="w-full pl-10 pr-3 py-2 bg-[var(--soft)]/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-transparent resize-none"
              placeholder="Cuéntanos sobre tus necesidades específicas..."
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={formState === "loading"}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[var(--ring)] text-white font-medium rounded-lg hover:bg-[var(--ring)]/90 focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2 focus:ring-offset-[var(--bg)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {formState === "loading" ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Enviando...
            </>
          ) : (
            "Reservar visita"
          )}
        </button>

        {formState === "error" && (
          <div className="flex items-center gap-2 p-3 bg-red-400/10 border border-red-400/20 rounded-lg text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p className="text-sm">Error al enviar la solicitud. Por favor intenta nuevamente.</p>
          </div>
        )}
      </form>

      {/* WhatsApp Link */}
      <div className="mt-4 pt-4 border-t border-white/10">
        {(() => {
          const message = `Hola, me interesa ${buildingName}`;
          const href = buildWhatsAppUrl({
            message: message,
            url: typeof window !== "undefined" ? window.location.href : undefined
          }) || "";
          const canWhatsApp = Boolean(process.env.NEXT_PUBLIC_WHATSAPP_PHONE) && Boolean(href);
          return canWhatsApp ? (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              onClick={() => track("cta_whatsapp_click", { context: "booking_form", property_id: buildingId })}
              className="text-center text-sm text-[var(--subtext)] hover:underline inline-flex items-center justify-center gap-2 w-full"
            >
              <Phone className="w-4 h-4" aria-hidden="true" />
              o escríbenos por WhatsApp
            </a>
          ) : (
            <button
              type="button"
              className="text-center text-sm text-[var(--subtext)] inline-flex items-center justify-center gap-2 w-full cursor-not-allowed opacity-60"
              aria-disabled="true"
              title="Pronto disponible"
            >
              <Phone className="w-4 h-4" aria-hidden="true" />
              o escríbenos por WhatsApp
            </button>
          );
        })()}
      </div>
    </div>
  );
}
