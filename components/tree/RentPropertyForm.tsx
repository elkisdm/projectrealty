"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight, Loader2, CheckCircle, X } from "lucide-react";
import { z } from "zod";
import { track, ANALYTICS_EVENTS } from "@lib/analytics";
import { buildWhatsAppUrl } from "@lib/whatsapp";
import { normalizeWhatsApp } from "@lib/utils/whatsapp";
import { WhatsAppInput } from "./WhatsAppInput";
import { useFormPersistence, loadFormData, clearFormData } from "@lib/utils/form-persistence";
import { cn } from "@/lib/utils";

const RentPropertySchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100),
  whatsapp: z.string().min(8, "El WhatsApp debe tener al menos 8 caracteres").max(32),
  email: z.string().email("Ingresa un email válido").optional(),
  direccion: z.string().min(5, "La dirección es requerida").max(200),
  tipoPropiedad: z.enum(["departamento", "casa", "oficina", "local", "otro"], {
    errorMap: () => ({ message: "Selecciona el tipo de propiedad" })
  }),
  dormitorios: z.enum(["estudio", "1d", "2d", "3d", "4d+"], {
    errorMap: () => ({ message: "Selecciona número de dormitorios" })
  }).optional(),
  precioAproximado: z.string().min(1, "Indica un precio aproximado").optional(),
  disponibilidad: z.enum(["inmediata", "1-mes", "2-3-meses", "mas-3-meses"], {
    errorMap: () => ({ message: "Selecciona disponibilidad" })
  }),
  consent: z.boolean().refine((val) => val === true, {
    message: "Debes aceptar el tratamiento de datos"
  }),
});

type RentPropertyFormData = z.infer<typeof RentPropertySchema>;
type FormData = Partial<RentPropertyFormData>;

const TOTAL_STEPS = 9;

const TIPO_PROPIEDAD_OPTIONS = [
  { value: "departamento", label: "Departamento" },
  { value: "casa", label: "Casa" },
  { value: "oficina", label: "Oficina" },
  { value: "local", label: "Local" },
  { value: "otro", label: "Otro" },
];

const DORMITORIOS_OPTIONS = [
  { value: "estudio", label: "Estudio" },
  { value: "1d", label: "1 Dormitorio" },
  { value: "2d", label: "2 Dormitorios" },
  { value: "3d", label: "3 Dormitorios" },
  { value: "4d+", label: "4+ Dormitorios" },
];

const DISPONIBILIDAD_OPTIONS = [
  { value: "inmediata", label: "Inmediata" },
  { value: "1-mes", label: "En 1 mes" },
  { value: "2-3-meses", label: "En 2-3 meses" },
  { value: "mas-3-meses", label: "Más de 3 meses" },
];

export function RentPropertyForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRecoveryBanner, setShowRecoveryBanner] = useState(false);

  // Persistencia mejorada
  const { hasSavedData } = useFormPersistence("rent-property", formData, currentStep);

  // Cargar datos guardados al montar
  useEffect(() => {
    const saved = loadFormData("rent-property");
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
      flow: "rent-property",
      step_id: currentStep,
    });
  }, [currentStep]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleBeforeUnload = () => {
      track(ANALYTICS_EVENTS.FORM_ABANDON, {
        flow: "rent-property",
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
      case 6: return true; // Dormitorios es opcional
      case 7: return true; // Precio aproximado es opcional
      case 8: return !!formData.disponibilidad;
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
      flow: "rent-property",
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
      } as RentPropertyFormData;

      // Validar con Zod
      const validatedData = RentPropertySchema.parse(normalizedData);

      const urlParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();
      const utmData = {
        utm_source: urlParams.get("utm_source") || undefined,
        utm_medium: urlParams.get("utm_medium") || undefined,
        utm_campaign: urlParams.get("utm_campaign") || undefined,
        utm_content: urlParams.get("utm_content") || undefined,
        utm_term: urlParams.get("utm_term") || undefined,
      };

      const payload = {
        flow: "rent-property" as const,
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

      clearFormData("rent-property");
      track(ANALYTICS_EVENTS.TREE_FORM_SUBMIT, { flow: "rent-property" });
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
      6: 5,   // Dormitorios
      7: 5,   // Precio
      8: 5,   // Disponibilidad
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
      message: `Hola, completé el formulario para arrendar mi propiedad. Mi nombre es ${formData.name}.`,
    });

    return (
      <div className="min-h-screen bg-bg py-6 sm:py-8 safe-area-bottom">
        <div className="container mx-auto px-4 sm:px-6 max-w-md">
          <Card className="rounded-2xl border-border bg-card">
            <CardContent className="pt-6 sm:pt-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
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
                    Te contactaremos pronto para ayudarte a publicar tu propiedad.
                  </p>
                </div>
                {whatsappUrl && (
                  <Button
                    onClick={() => {
                      track(ANALYTICS_EVENTS.CTA_WHATSAPP_CLICK, { flow: "rent-property" });
                      window.open(whatsappUrl, "_blank");
                    }}
                    className="w-full mt-4 sm:mt-6 min-h-[44px] rounded-xl bg-brand-violet hover:bg-brand-violet/90 text-white"
                    size="lg"
                  >
                    Contactar por WhatsApp
                  </Button>
                )}
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
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 sm:p-4 rounded-xl bg-brand-violet/10 dark:bg-brand-violet/20 border border-brand-violet/20 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-brand-violet flex-shrink-0" />
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
                className="bg-brand-violet h-full rounded-full shadow-sm"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: "easeOut" }}
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
                      isCompleted && "bg-brand-violet",
                      isCurrent && "bg-brand-violet ring-2 ring-brand-violet ring-offset-1 ring-offset-surface dark:ring-offset-surface",
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-subtext text-center"
            >
              ¡Ya completaste el {Math.round(progress)}%!
            </motion.p>
          )}
        </div>

        <Card className="rounded-2xl border-border bg-card shadow-sm">
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="text-lg sm:text-xl text-text">
              {currentStep === 1 && "Arrendar mi Propiedad"}
              {currentStep === 2 && "Datos de contacto"}
              {currentStep === 3 && "Correo electrónico"}
              {currentStep === 4 && "Dirección de la propiedad"}
              {currentStep === 5 && "Tipo de propiedad"}
              {currentStep === 6 && "Dormitorios"}
              {currentStep === 7 && "Precio aproximado"}
              {currentStep === 8 && "Disponibilidad"}
              {currentStep === 9 && "Consentimiento"}
            </CardTitle>
            {currentStep === 1 && (
              <p className="text-sm sm:text-base text-subtext mt-2">
                Completa el formulario y te contactaremos para publicar tu propiedad
              </p>
            )}
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
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
                      className="mt-2 rounded-xl min-h-[44px] bg-surface dark:bg-surface border-border text-text placeholder:text-subtext focus-visible:ring-brand-violet"
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
                      className="mt-2 rounded-xl min-h-[44px] bg-surface dark:bg-surface border-border text-text placeholder:text-subtext focus-visible:ring-brand-violet"
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
                      className="mt-2 rounded-xl min-h-[44px] bg-surface dark:bg-surface border-border text-text placeholder:text-subtext focus-visible:ring-brand-violet"
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
                            ? "border-brand-violet bg-brand-violet/10 dark:bg-brand-violet/20 text-brand-violet dark:text-brand-aqua shadow-sm"
                            : "border-border hover:border-brand-violet/50 dark:hover:border-brand-violet/40 bg-card hover:bg-surface dark:hover:bg-surface text-text"
                            } focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet focus-visible:ring-offset-2`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {currentStep === 6 && (
                  <div>
                    <Label className="text-sm sm:text-base text-text font-medium mb-3 block">Dormitorios (opcional)</Label>
                    <div className="mt-2 space-y-2 sm:space-y-3">
                      {DORMITORIOS_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => updateField("dormitorios", option.value)}
                          className={`w-full text-left p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 min-h-[44px] text-sm sm:text-base font-medium ${formData.dormitorios === option.value
                            ? "border-brand-violet bg-brand-violet/10 dark:bg-brand-violet/20 text-brand-violet dark:text-brand-aqua shadow-sm"
                            : "border-border hover:border-brand-violet/50 dark:hover:border-brand-violet/40 bg-card hover:bg-surface dark:hover:bg-surface text-text"
                            } focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet focus-visible:ring-offset-2`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {currentStep === 7 && (
                  <div>
                    <Label htmlFor="precioAproximado" className="text-sm sm:text-base text-text font-medium mb-2 block">Precio aproximado mensual (opcional)</Label>
                    <Input
                      id="precioAproximado"
                      value={formData.precioAproximado || ""}
                      onChange={(e) => updateField("precioAproximado", e.target.value)}
                      placeholder="Ej: $500.000"
                      className="mt-2 rounded-xl min-h-[44px] bg-surface dark:bg-surface border-border text-text placeholder:text-subtext focus-visible:ring-brand-violet"
                      autoFocus
                    />
                  </div>
                )}

                {currentStep === 8 && (
                  <div>
                    <Label className="text-sm sm:text-base text-text font-medium mb-3 block">¿Cuándo está disponible?</Label>
                    <div className="mt-2 space-y-2 sm:space-y-3">
                      {DISPONIBILIDAD_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => updateField("disponibilidad", option.value)}
                          className={`w-full text-left p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 min-h-[44px] text-sm sm:text-base font-medium ${formData.disponibilidad === option.value
                            ? "border-brand-violet bg-brand-violet/10 dark:bg-brand-violet/20 text-brand-violet dark:text-brand-aqua shadow-sm"
                            : "border-border hover:border-brand-violet/50 dark:hover:border-brand-violet/40 bg-card hover:bg-surface dark:hover:bg-surface text-text"
                            } focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet focus-visible:ring-offset-2`}
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
                        className="mt-1 w-5 h-5 sm:w-6 sm:h-6 rounded border-2 border-border text-brand-violet focus:ring-brand-violet focus:ring-2 focus:ring-offset-2 cursor-pointer"
                      />
                      <span className="text-sm sm:text-base text-text leading-relaxed">
                        Acepto el tratamiento de mis datos personales según la{" "}
                        <a href="/privacidad" className="underline text-brand-violet hover:text-brand-aqua focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet focus-visible:ring-offset-2 focus-visible:rounded">
                          política de privacidad
                        </a>
                      </span>
                    </Label>
                  </div>
                )}

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
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
                  className="rounded-xl min-h-[44px] bg-brand-violet hover:bg-brand-violet/90 text-white"
                >
                  <span className="text-sm sm:text-base">Siguiente</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="rounded-xl min-h-[44px] bg-brand-violet hover:bg-brand-violet/90 text-white"
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
