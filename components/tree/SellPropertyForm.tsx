"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight, Loader2, CheckCircle, X, Home } from "lucide-react";
import { z } from "zod";
import { track, ANALYTICS_EVENTS } from "@lib/analytics";
import { buildWhatsAppUrl } from "@lib/whatsapp";
import { normalizeWhatsApp } from "@lib/utils/whatsapp";
import { WhatsAppInput } from "./WhatsAppInput";
import { useFormPersistence, loadFormData, clearFormData } from "@lib/utils/form-persistence";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

const SellPropertySchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100),
  whatsapp: z.string().min(8, "El WhatsApp debe tener al menos 8 caracteres").max(32),
  email: z.string().email("Ingresa un email válido").optional(),
  direccion: z.string().min(5, "La dirección es requerida").max(200),
  tipoPropiedad: z.enum(["departamento", "casa", "oficina", "local", "terreno", "otro"], {
    errorMap: () => ({ message: "Selecciona el tipo de propiedad" })
  }),
  precioEstimado: z.string().min(1, "Indica un precio estimado").optional(),
  motivoVenta: z.enum(["cambio-residencia", "inversion", "divorcio", "hereda", "otro"], {
    errorMap: () => ({ message: "Selecciona el motivo de venta" })
  }).optional(),
  urgencia: z.enum(["inmediata", "1-3-meses", "3-6-meses", "sin-urgencia"], {
    errorMap: () => ({ message: "Selecciona la urgencia" })
  }),
  consent: z.boolean().refine((val) => val === true, {
    message: "Debes aceptar el tratamiento de datos"
  }),
});

type SellPropertyFormData = z.infer<typeof SellPropertySchema>;
type FormData = Partial<SellPropertyFormData>;

const TOTAL_STEPS = 9;

const TIPO_PROPIEDAD_OPTIONS = [
  { value: "departamento", label: "Departamento" },
  { value: "casa", label: "Casa" },
  { value: "oficina", label: "Oficina" },
  { value: "local", label: "Local" },
  { value: "terreno", label: "Terreno" },
  { value: "otro", label: "Otro" },
];

const MOTIVO_VENTA_OPTIONS = [
  { value: "cambio-residencia", label: "Cambio de residencia" },
  { value: "inversion", label: "Inversión" },
  { value: "divorcio", label: "Divorcio" },
  { value: "hereda", label: "Herencia" },
  { value: "otro", label: "Otro" },
];

const URGENCIA_OPTIONS = [
  { value: "inmediata", label: "Inmediata" },
  { value: "1-3-meses", label: "En 1-3 meses" },
  { value: "3-6-meses", label: "En 3-6 meses" },
  { value: "sin-urgencia", label: "Sin urgencia" },
];

export function SellPropertyForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRecoveryBanner, setShowRecoveryBanner] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Persistencia mejorada
  const { hasSavedData } = useFormPersistence("sell-property", formData, currentStep);

  // Cargar datos guardados al montar
  useEffect(() => {
    const saved = loadFormData("sell-property");
    if (saved) {
      setFormData(saved.data as FormData);
      if (saved.currentStep) {
        setCurrentStep(saved.currentStep);
      }
      setShowRecoveryBanner(true);
    }
  }, []);

  // Mostrar banner de recuperación si hay datos guardados
  useEffect(() => {
    if (hasSavedData() && Object.keys(formData).length === 0) {
      setShowRecoveryBanner(true);
    }
  }, [hasSavedData, formData]);

  useEffect(() => {
    track(ANALYTICS_EVENTS.FORM_STEP_VIEW, {
      flow: "sell-property",
      step_id: currentStep,
    });
  }, [currentStep]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleBeforeUnload = () => {
      track(ANALYTICS_EVENTS.FORM_ABANDON, {
        flow: "sell-property",
        step_id: currentStep,
      });
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [currentStep]);

  const updateField = useCallback((field: keyof FormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  }, []);

  // Handler memoizado para WhatsApp (evita recrear función en cada render)
  const handleWhatsAppChange = useCallback((value: string) => {
    updateField("whatsapp", value);
  }, [updateField]);

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: return !!formData.name && formData.name.trim().length >= 2;
      case 2: return !!formData.whatsapp && formData.whatsapp.trim().length >= 8;
      case 3: return true; // Email es opcional
      case 4: return !!formData.direccion && formData.direccion.trim().length >= 5;
      case 5: return !!formData.tipoPropiedad;
      case 6: return true; // Precio estimado es opcional
      case 7: return true; // Motivo venta es opcional
      case 8: return !!formData.urgencia;
      case 9: return formData.consent === true;
      default: return false;
    }
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      setError("Completa este campo para continuar");
      return;
    }

    track(ANALYTICS_EVENTS.FORM_STEP_COMPLETE, {
      flow: "sell-property",
      step_id: currentStep,
    });

    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const normalizedData = {
        ...formData,
        whatsapp: normalizeWhatsApp(formData.whatsapp || ""),
      } as SellPropertyFormData;

      // Validar con Zod
      const validatedData = SellPropertySchema.parse(normalizedData);

      const urlParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();
      const utmData = {
        utm_source: urlParams.get("utm_source") || undefined,
        utm_medium: urlParams.get("utm_medium") || undefined,
        utm_campaign: urlParams.get("utm_campaign") || undefined,
        utm_content: urlParams.get("utm_content") || undefined,
        utm_term: urlParams.get("utm_term") || undefined,
      };

      const payload = {
        flow: "sell-property" as const,
        payload: validatedData,
        name: validatedData.name,
        whatsapp: validatedData.whatsapp,
        email: validatedData.email,
        referrer: typeof document !== "undefined" ? document.referrer || undefined : undefined,
        ...utmData,
      };

      const response = await fetch("/api/tree/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al enviar el formulario");
      }

      clearFormData("sell-property");
      track(ANALYTICS_EVENTS.TREE_FORM_SUBMIT, { flow: "sell-property" });
      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar el formulario");
      setIsSubmitting(false);
    }
  };

  const progress = (currentStep / TOTAL_STEPS) * 100;
  const remainingSteps = TOTAL_STEPS - currentStep;

  // Calcular tiempo estimado
  const getEstimatedTime = (): number => {
    const stepTimes: Record<number, number> = {
      1: 5,   // Nombre
      2: 15,  // WhatsApp
      3: 5,   // Email
      4: 10,  // Dirección
      5: 5,   // Tipo propiedad
      6: 5,   // Precio
      7: 5,   // Motivo venta
      8: 5,   // Urgencia
      9: 3,   // Consentimiento
    };

    let total = 0;
    for (let i = currentStep; i <= TOTAL_STEPS; i++) {
      total += stepTimes[i] || 5;
    }
    return total;
  };

  const estimatedSeconds = getEstimatedTime();
  const estimatedMinutes = Math.floor(estimatedSeconds / 60);
  const estimatedSecondsRemaining = estimatedSeconds % 60;

  if (isSuccess) {
    const whatsappUrl = buildWhatsAppUrl({
      message: `Hola, completé el formulario para vender mi propiedad. Mi nombre es ${formData.name}.`,
    });

    return (
      <div className="min-h-screen bg-bg py-6 sm:py-8 safe-area-bottom">
        <div className="container mx-auto px-4 sm:px-6 max-w-md">
          <Card className="rounded-2xl border-border bg-card">
            <CardContent className="pt-6 sm:pt-8">
              <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3 }}
                className="flex flex-col items-center justify-center text-center space-y-4 sm:space-y-6 py-6 sm:py-8"
              >
                <div className="rounded-full bg-accent-success/10 dark:bg-accent-success/20 p-3 sm:p-4">
                  <CheckCircle className="h-8 w-8 sm:h-10 sm:w-10 text-accent-success" aria-hidden="true" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg sm:text-xl font-semibold text-text">
                    ¡Formulario enviado!
                  </h3>
                  <p className="text-sm sm:text-base text-subtext px-2">
                    Te contactaremos pronto para asesorarte en la venta de tu propiedad.
                  </p>
                </div>
                {whatsappUrl && (
                  <Button
                    onClick={() => {
                      track(ANALYTICS_EVENTS.CTA_WHATSAPP_CLICK, { flow: "sell-property" });
                      window.open(whatsappUrl, "_blank");
                    }}
                    className="w-full mt-4 sm:mt-6 min-h-[44px] rounded-xl bg-brand-aqua hover:bg-brand-aqua/90 text-black"
                    size="lg"
                  >
                    Contactar por WhatsApp
                  </Button>
                )}
                <Link
                  href="/tree"
                  className="mt-4 text-sm text-subtext hover:text-text underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-aqua focus-visible:ring-offset-2 focus-visible:rounded"
                >
                  Volver al inicio
                </Link>
              </motion.div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg py-6 sm:py-8 safe-area-bottom">
      <div className="container mx-auto px-4 sm:px-6 max-w-md">
        {/* Banner de recuperación */}
        {showRecoveryBanner && Object.keys(formData).length > 0 && (
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3 }}
            className="mb-4 p-3 sm:p-4 rounded-xl bg-brand-aqua/10 dark:bg-brand-aqua/20 border border-brand-aqua/20 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-brand-aqua flex-shrink-0" />
              <p className="text-xs sm:text-sm text-text">
                Formulario recuperado. Continúa desde donde lo dejaste.
              </p>
            </div>
            <button
              onClick={() => setShowRecoveryBanner(false)}
              className="text-subtext hover:text-text transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* Botón volver al inicio */}
        <div className="mb-3 sm:mb-4">
          <Link
            href="/tree"
            className="inline-flex items-center gap-2 text-xs sm:text-sm text-subtext hover:text-text transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-aqua focus-visible:ring-offset-2 focus-visible:rounded"
          >
            <Home className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Volver al inicio</span>
          </Link>
        </div>

        {/* Barra de progreso */}
        <div className="mb-4 sm:mb-6">
          <div className="flex justify-between items-center text-xs sm:text-sm text-subtext mb-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">Paso {currentStep} de {TOTAL_STEPS}</span>
              {remainingSteps > 0 && (
                <span className="text-subtext">({remainingSteps} {remainingSteps === 1 ? 'restante' : 'restantes'})</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{Math.round(progress)}%</span>
              {estimatedSeconds > 0 && (
                <span className="text-subtext text-xs">
                  ~{estimatedMinutes > 0 ? `${estimatedMinutes}m ` : ''}{estimatedSecondsRemaining}s
                </span>
              )}
            </div>
          </div>

          <div className="relative w-full mb-2">
            <div className="w-full bg-surface dark:bg-surface rounded-full h-2 sm:h-2.5 overflow-hidden">
              <motion.div
                className="bg-brand-aqua h-full rounded-full shadow-sm"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3, ease: "easeOut" }}
              />
            </div>
            <div className="absolute top-0 left-0 right-0 h-2 sm:h-2.5 flex justify-between items-center pointer-events-none">
              {Array.from({ length: TOTAL_STEPS }).map((_, index) => {
                const stepNum = index + 1;
                const isCompleted = stepNum < currentStep;
                const isCurrent = stepNum === currentStep;
                return (
                  <div
                    key={stepNum}
                    className={cn(
                      "w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all",
                      isCompleted && "bg-brand-aqua",
                      isCurrent && "bg-brand-aqua ring-2 ring-brand-aqua ring-offset-1 ring-offset-surface dark:ring-offset-surface",
                      !isCompleted && !isCurrent && "bg-surface dark:bg-surface border border-border"
                    )}
                    aria-label={`Paso ${stepNum}`}
                  />
                );
              })}
            </div>
          </div>

          {progress >= 30 && progress < 100 && (
            <motion.p
              initial={prefersReducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3 }}
              className="text-xs text-subtext text-center"
            >
              ¡Ya completaste el {Math.round(progress)}%!
            </motion.p>
          )}
        </div>

        <Card className="rounded-2xl border-border bg-card shadow-sm">
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="text-lg sm:text-xl text-text">
              {currentStep === 1 && "Vender mi Propiedad"}
              {currentStep === 2 && "Datos de contacto"}
              {currentStep === 3 && "Correo electrónico"}
              {currentStep === 4 && "Dirección de la propiedad"}
              {currentStep === 5 && "Tipo de propiedad"}
              {currentStep === 6 && "Precio estimado"}
              {currentStep === 7 && "Motivo de venta"}
              {currentStep === 8 && "Urgencia"}
              {currentStep === 9 && "Consentimiento"}
            </CardTitle>
            {currentStep === 1 && (
              <p className="text-sm sm:text-base text-subtext mt-2">
                Completa el formulario y te contactaremos para asesorarte en la venta
              </p>
            )}
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={prefersReducedMotion ? false : { opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: -20 }}
                transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3, ease: "easeOut" }}
                className="space-y-4 sm:space-y-6"
              >
                {currentStep === 1 && (
                  <div>
                    <Label htmlFor="name" className="text-sm sm:text-base text-text font-medium mb-2 block">Nombre completo</Label>
                    <Input
                      id="name"
                      value={formData.name || ""}
                      onChange={(e) => updateField("name", e.target.value)}
                      placeholder="Tu nombre"
                      className="mt-2 rounded-xl min-h-[44px] bg-surface dark:bg-surface border-border text-text placeholder:text-subtext focus-visible:ring-brand-aqua"
                      autoFocus
                    />
                  </div>
                )}

                {currentStep === 2 && (
                  <WhatsAppInput
                    value={formData.whatsapp || ""}
                    onChange={handleWhatsAppChange}
                    label="Teléfono WhatsApp"
                    id="whatsapp"
                    required
                  />
                )}

                {currentStep === 3 && (
                  <div>
                    <Label htmlFor="email" className="text-sm sm:text-base text-text font-medium mb-2 block">Correo electrónico (opcional)</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email || ""}
                      onChange={(e) => updateField("email", e.target.value)}
                      placeholder="tu@email.com"
                      className="mt-2 rounded-xl min-h-[44px] bg-surface dark:bg-surface border-border text-text placeholder:text-subtext focus-visible:ring-brand-aqua"
                      autoFocus
                    />
                  </div>
                )}

                {currentStep === 4 && (
                  <div>
                    <Label htmlFor="direccion" className="text-sm sm:text-base text-text font-medium mb-2 block">Dirección de la propiedad</Label>
                    <Input
                      id="direccion"
                      value={formData.direccion || ""}
                      onChange={(e) => updateField("direccion", e.target.value)}
                      placeholder="Ej: Av. Providencia 123, Las Condes"
                      className="mt-2 rounded-xl min-h-[44px] bg-surface dark:bg-surface border-border text-text placeholder:text-subtext focus-visible:ring-brand-aqua"
                      autoFocus
                    />
                  </div>
                )}

                {currentStep === 5 && (
                  <div>
                    <Label className="text-sm sm:text-base text-text font-medium mb-3 block">Tipo de propiedad</Label>
                    <div className="mt-2 space-y-2 sm:space-y-3">
                      {TIPO_PROPIEDAD_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => updateField("tipoPropiedad", option.value)}
                          className={`w-full text-left p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 min-h-[44px] text-sm sm:text-base font-medium ${formData.tipoPropiedad === option.value
                            ? "border-brand-aqua bg-brand-aqua/10 dark:bg-brand-aqua/20 text-brand-aqua dark:text-brand-violet shadow-sm"
                            : "border-border hover:border-brand-aqua/50 dark:hover:border-brand-aqua/40 bg-card hover:bg-surface dark:hover:bg-surface text-text"
                            } focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-aqua focus-visible:ring-offset-2`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {currentStep === 6 && (
                  <div>
                    <Label htmlFor="precioEstimado" className="text-sm sm:text-base text-text font-medium mb-2 block">Precio estimado (opcional)</Label>
                    <Input
                      id="precioEstimado"
                      value={formData.precioEstimado || ""}
                      onChange={(e) => updateField("precioEstimado", e.target.value)}
                      placeholder="Ej: $150.000.000"
                      className="mt-2 rounded-xl min-h-[44px] bg-surface dark:bg-surface border-border text-text placeholder:text-subtext focus-visible:ring-brand-aqua"
                      autoFocus
                    />
                  </div>
                )}

                {currentStep === 7 && (
                  <div>
                    <Label className="text-sm sm:text-base text-text font-medium mb-3 block">Motivo de venta (opcional)</Label>
                    <div className="mt-2 space-y-2 sm:space-y-3">
                      {MOTIVO_VENTA_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => updateField("motivoVenta", option.value)}
                          className={`w-full text-left p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 min-h-[44px] text-sm sm:text-base font-medium ${formData.motivoVenta === option.value
                            ? "border-brand-aqua bg-brand-aqua/10 dark:bg-brand-aqua/20 text-brand-aqua dark:text-brand-violet shadow-sm"
                            : "border-border hover:border-brand-aqua/50 dark:hover:border-brand-aqua/40 bg-card hover:bg-surface dark:hover:bg-surface text-text"
                            } focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-aqua focus-visible:ring-offset-2`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {currentStep === 8 && (
                  <div>
                    <Label className="text-sm sm:text-base text-text font-medium mb-3 block">¿Qué tan urgente es la venta?</Label>
                    <div className="mt-2 space-y-2 sm:space-y-3">
                      {URGENCIA_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => updateField("urgencia", option.value)}
                          className={`w-full text-left p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 min-h-[44px] text-sm sm:text-base font-medium ${formData.urgencia === option.value
                            ? "border-brand-aqua bg-brand-aqua/10 dark:bg-brand-aqua/20 text-brand-aqua dark:text-brand-violet shadow-sm"
                            : "border-border hover:border-brand-aqua/50 dark:hover:border-brand-aqua/40 bg-card hover:bg-surface dark:hover:bg-surface text-text"
                            } focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-aqua focus-visible:ring-offset-2`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {currentStep === 9 && (
                  <div>
                    <Label className="flex items-start space-x-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={formData.consent === true}
                        onChange={(e) => updateField("consent", e.target.checked)}
                        className="mt-1 w-5 h-5 sm:w-6 sm:h-6 rounded border-2 border-border text-brand-aqua focus:ring-brand-aqua focus:ring-2 focus:ring-offset-2 cursor-pointer"
                      />
                      <span className="text-sm sm:text-base text-text leading-relaxed">
                        Acepto el tratamiento de mis datos personales según la{" "}
                        <a href="/privacidad" className="underline text-brand-aqua hover:text-brand-violet focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-aqua focus-visible:ring-offset-2 focus-visible:rounded">
                          política de privacidad
                        </a>
                      </span>
                    </Label>
                  </div>
                )}

                {error && (
                  <motion.div
                    initial={prefersReducedMotion ? false : { opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3 }}
                    className="rounded-xl bg-accent-error/10 dark:bg-accent-error/20 border border-accent-error/20 p-3 sm:p-4 text-sm sm:text-base text-accent-error"
                    role="alert"
                  >
                    {error}
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navegación */}
            <div className="flex justify-between gap-3 mt-6 sm:mt-8">
              <Button
                onClick={handleBack}
                disabled={currentStep === 1 || isSubmitting}
                variant="outline"
                className="rounded-xl min-h-[44px]"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                <span className="text-sm sm:text-base">Anterior</span>
              </Button>
              {currentStep < TOTAL_STEPS ? (
                <Button
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className="rounded-xl min-h-[44px] bg-brand-aqua hover:bg-brand-aqua/90 text-black"
                >
                  <span className="text-sm sm:text-base">Siguiente</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="rounded-xl min-h-[44px] bg-brand-aqua hover:bg-brand-aqua/90 text-black"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      <span className="text-sm sm:text-base">Enviando...</span>
                    </>
                  ) : (
                    <span className="text-sm sm:text-base">Enviar</span>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
