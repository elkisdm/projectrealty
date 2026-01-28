"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight, Loader2, CheckCircle, X } from "lucide-react";
import { TreeRentRequestSchema, type TreeRentRequest } from "@schemas/tree";
import { track, ANALYTICS_EVENTS } from "@lib/analytics";
import { buildWhatsAppUrl } from "@lib/whatsapp";
import { normalizeWhatsApp } from "@lib/utils/whatsapp";
import { CommuneAutocomplete } from "./CommuneAutocomplete";
import { WhatsAppInput } from "./WhatsAppInput";
import { useFormPersistence, loadFormData, clearFormData } from "@lib/utils/form-persistence";
import { cn } from "@/lib/utils";
import { isValidCommune } from "@lib/data/chilean-communes";

const TOTAL_STEPS = 10;

const PRESUPUESTO_OPTIONS = [
  { value: "<350k", label: "Menos de $350k" },
  { value: "350-450", label: "$350k - $450k" },
  { value: "450-600", label: "$450k - $600k" },
  { value: "600-800", label: "$600k - $800k" },
  { value: "800+", label: "Más de $800k" },
  { value: "flexible", label: "Flexible" },
];

const FECHA_MUDANZA_OPTIONS = [
  { value: "0-15", label: "0-15 días" },
  { value: "15-30", label: "15-30 días" },
  { value: "30-60", label: "30-60 días" },
  { value: "60+", label: "Más de 60 días" },
  { value: "solo-cotizando", label: "Solo cotizando" },
];

const DORMITORIOS_OPTIONS = [
  { value: "estudio", label: "Estudio" },
  { value: "1d", label: "1 Dormitorio" },
  { value: "2d", label: "2 Dormitorios" },
  { value: "3d+", label: "3+ Dormitorios" },
];

type FormData = Partial<TreeRentRequest>;

export function RentFormStepper() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRecoveryBanner, setShowRecoveryBanner] = useState(false);

  // Persistencia mejorada
  const { hasSavedData } = useFormPersistence("rent", formData, currentStep);

  // Cargar datos guardados al montar
  useEffect(() => {
    const saved = loadFormData("rent");
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
      flow: "rent",
      step_id: currentStep,
    });
  }, [currentStep]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleBeforeUnload = () => {
      track(ANALYTICS_EVENTS.FORM_ABANDON, {
        flow: "rent",
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

  // Handlers memoizados para campos específicos (evita recrear funciones en cada render)
  const handleWhatsAppChange = useCallback((value: string) => {
    updateField("whatsapp", value);
  }, [updateField]);

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: {
        if (!formData.comuna || formData.comuna.trim().length === 0) return false;
        // Validar que la comuna esté en la lista válida
        return isValidCommune(formData.comuna);
      }
      case 2: return !!formData.presupuesto;
      case 3: return !!formData.fechaMudanza;
      case 4: return !!formData.tieneMascotas;
      case 5: return !!formData.dormitorios;
      case 6: return !!formData.estacionamiento;
      case 7: return !!formData.bodega;
      case 8: return !!formData.name && formData.name.trim().length >= 2 && !!formData.whatsapp && formData.whatsapp.trim().length >= 8;
      case 9: return formData.consent === true;
      default: return true;
    }
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      setError("Completa este campo para continuar");
      return;
    }

    track(ANALYTICS_EVENTS.FORM_STEP_COMPLETE, {
      flow: "rent",
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
      const formDataWithNormalizedWhatsApp = {
        ...formData,
        whatsapp: formData.whatsapp ? normalizeWhatsApp(formData.whatsapp) : formData.whatsapp,
      };

      const validated = TreeRentRequestSchema.parse(formDataWithNormalizedWhatsApp);

      const urlParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();
      const utmData = {
        utm_source: urlParams.get("utm_source") || undefined,
        utm_medium: urlParams.get("utm_medium") || undefined,
        utm_campaign: urlParams.get("utm_campaign") || undefined,
        utm_content: urlParams.get("utm_content") || undefined,
        utm_term: urlParams.get("utm_term") || undefined,
      };

      const payload = {
        flow: "rent" as const,
        payload: validated,
        name: validated.name,
        whatsapp: validated.whatsapp,
        email: validated.email,
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

      clearFormData("rent");
      track(ANALYTICS_EVENTS.TREE_FORM_SUBMIT, { flow: "rent" });
      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar el formulario");
      setIsSubmitting(false);
    }
  };

  const progress = (currentStep / TOTAL_STEPS) * 100;
  const remainingSteps = TOTAL_STEPS - currentStep;

  // Calcular tiempo estimado basado en el paso actual
  const getEstimatedTime = (): number => {
    const stepTimes: Record<number, number> = {
      1: 5,   // Comuna
      2: 5,   // Presupuesto
      3: 5,   // Fecha mudanza
      4: 5,   // Mascotas
      5: 5,   // Dormitorios
      6: 5,   // Estacionamiento
      7: 5,   // Bodega
      8: 15,  // Contacto (más tiempo)
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
      message: `Hola, completé el formulario de arriendo. Mi nombre es ${formData.name}.`,
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
                  <h3 className="text-lg sm:text-xl font-semibold text-text">¡Formulario enviado!</h3>
                  <p className="text-sm sm:text-base text-subtext px-2">Te contactaremos pronto con opciones que se ajusten a tus necesidades.</p>
                </div>
                {whatsappUrl && (
                  <Button
                    onClick={() => {
                      track(ANALYTICS_EVENTS.CTA_WHATSAPP_CLICK, { flow: "rent" });
                      window.open(whatsappUrl, "_blank");
                    }}
                    className="w-full mt-4 sm:mt-6 min-h-[44px] rounded-xl"
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

        {/* Barra de progreso mejorada */}
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

          {/* Barra de progreso con marcadores */}
          <div className="relative w-full mb-2">
            <div className="w-full bg-surface dark:bg-surface rounded-full h-2 sm:h-2.5 overflow-hidden">
              <motion.div
                className="bg-brand-violet h-full rounded-full shadow-sm"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            </div>
            {/* Marcadores de pasos */}
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

          {/* Mensaje de progreso */}
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
              {currentStep === 1 && "Encuentra tu próximo hogar"}
              {currentStep === 2 && "¿Cuál es tu presupuesto aproximado?"}
              {currentStep === 3 && "¿Cuándo te mudarías?"}
              {currentStep === 4 && "¿Tienes mascotas?"}
              {currentStep === 5 && "¿Cuántos dormitorios necesitas?"}
              {currentStep === 6 && "¿Necesitas estacionamiento?"}
              {currentStep === 7 && "¿Necesitas bodega?"}
              {currentStep === 8 && "Datos de contacto"}
              {currentStep === 9 && "Consentimiento"}
            </CardTitle>
            {currentStep === 1 && (
              <p className="text-sm sm:text-base text-subtext mt-2">
                Cuéntanos qué buscas y te ayudaremos a encontrar el departamento perfecto
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
                  <CommuneAutocomplete
                    value={formData.comuna || ""}
                    onChange={(value) => updateField("comuna", value)}
                    placeholder="Ej: Las Condes, Providencia..."
                    label="Comuna"
                    id="comuna"
                    autoFocus
                    error={error && currentStep === 1 ? error : undefined}
                  />
                )}

                {currentStep === 2 && (
                  <div>
                    <Label className="text-sm sm:text-base text-text font-medium mb-3 block">Presupuesto mensual</Label>
                    <div className="mt-2 space-y-2 sm:space-y-3">
                      {PRESUPUESTO_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => updateField("presupuesto", option.value)}
                          className={`w-full text-left p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 min-h-[44px] text-sm sm:text-base font-medium ${formData.presupuesto === option.value
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

                {currentStep === 3 && (
                  <div>
                    <Label className="text-sm sm:text-base text-text font-medium mb-3 block">Fecha tentativa de mudanza</Label>
                    <div className="mt-2 space-y-2 sm:space-y-3">
                      {FECHA_MUDANZA_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => updateField("fechaMudanza", option.value)}
                          className={`w-full text-left p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 min-h-[44px] text-sm sm:text-base font-medium ${formData.fechaMudanza === option.value
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

                {currentStep === 4 && (
                  <div>
                    <Label className="text-sm sm:text-base text-text font-medium mb-3 block">¿Tienes mascotas?</Label>
                    <div className="mt-2 grid grid-cols-2 gap-2 sm:gap-3">
                      <button
                        onClick={() => updateField("tieneMascotas", "si")}
                        className={`p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 min-h-[44px] text-sm sm:text-base font-medium ${formData.tieneMascotas === "si"
                          ? "border-brand-violet bg-brand-violet/10 dark:bg-brand-violet/20 text-brand-violet dark:text-brand-aqua shadow-sm"
                          : "border-border hover:border-brand-violet/50 dark:hover:border-brand-violet/40 bg-card hover:bg-surface dark:hover:bg-surface text-text"
                          } focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet focus-visible:ring-offset-2`}
                      >
                        Sí
                      </button>
                      <button
                        onClick={() => updateField("tieneMascotas", "no")}
                        className={`p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 min-h-[44px] text-sm sm:text-base font-medium ${formData.tieneMascotas === "no"
                          ? "border-brand-violet bg-brand-violet/10 dark:bg-brand-violet/20 text-brand-violet dark:text-brand-aqua shadow-sm"
                          : "border-border hover:border-brand-violet/50 dark:hover:border-brand-violet/40 bg-card hover:bg-surface dark:hover:bg-surface text-text"
                          } focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet focus-visible:ring-offset-2`}
                      >
                        No
                      </button>
                    </div>
                  </div>
                )}

                {currentStep === 5 && (
                  <div>
                    <Label className="text-sm sm:text-base text-text font-medium mb-3 block">Dormitorios</Label>
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

                {currentStep === 6 && (
                  <div>
                    <Label className="text-sm sm:text-base text-text font-medium mb-3 block">¿Necesitas estacionamiento?</Label>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      <button
                        onClick={() => updateField("estacionamiento", "si")}
                        className={`p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 min-h-[44px] text-xs sm:text-sm font-medium ${formData.estacionamiento === "si"
                          ? "border-brand-violet bg-brand-violet/10 dark:bg-brand-violet/20 text-brand-violet dark:text-brand-aqua shadow-sm"
                          : "border-border hover:border-brand-violet/50 dark:hover:border-brand-violet/40 bg-card hover:bg-surface dark:hover:bg-surface text-text"
                          } focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet focus-visible:ring-offset-2`}
                      >
                        Sí
                      </button>
                      <button
                        onClick={() => updateField("estacionamiento", "no")}
                        className={`p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 min-h-[44px] text-xs sm:text-sm font-medium ${formData.estacionamiento === "no"
                          ? "border-brand-violet bg-brand-violet/10 dark:bg-brand-violet/20 text-brand-violet dark:text-brand-aqua shadow-sm"
                          : "border-border hover:border-brand-violet/50 dark:hover:border-brand-violet/40 bg-card hover:bg-surface dark:hover:bg-surface text-text"
                          } focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet focus-visible:ring-offset-2`}
                      >
                        No
                      </button>
                      <button
                        onClick={() => updateField("estacionamiento", "me-da-igual")}
                        className={`p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 min-h-[44px] text-xs sm:text-sm font-medium ${formData.estacionamiento === "me-da-igual"
                          ? "border-brand-violet bg-brand-violet/10 dark:bg-brand-violet/20 text-brand-violet dark:text-brand-aqua shadow-sm"
                          : "border-border hover:border-brand-violet/50 dark:hover:border-brand-violet/40 bg-card hover:bg-surface dark:hover:bg-surface text-text"
                          } focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet focus-visible:ring-offset-2`}
                      >
                        Me da igual
                      </button>
                    </div>
                  </div>
                )}

                {currentStep === 7 && (
                  <div>
                    <Label className="text-sm sm:text-base text-text font-medium mb-3 block">¿Necesitas bodega?</Label>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      <button
                        onClick={() => updateField("bodega", "si")}
                        className={`p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 min-h-[44px] text-xs sm:text-sm font-medium ${formData.bodega === "si"
                          ? "border-brand-violet bg-brand-violet/10 dark:bg-brand-violet/20 text-brand-violet dark:text-brand-aqua shadow-sm"
                          : "border-border hover:border-brand-violet/50 dark:hover:border-brand-violet/40 bg-card hover:bg-surface dark:hover:bg-surface text-text"
                          } focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet focus-visible:ring-offset-2`}
                      >
                        Sí
                      </button>
                      <button
                        onClick={() => updateField("bodega", "no")}
                        className={`p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 min-h-[44px] text-xs sm:text-sm font-medium ${formData.bodega === "no"
                          ? "border-brand-violet bg-brand-violet/10 dark:bg-brand-violet/20 text-brand-violet dark:text-brand-aqua shadow-sm"
                          : "border-border hover:border-brand-violet/50 dark:hover:border-brand-violet/40 bg-card hover:bg-surface dark:hover:bg-surface text-text"
                          } focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet focus-visible:ring-offset-2`}
                      >
                        No
                      </button>
                      <button
                        onClick={() => updateField("bodega", "me-da-igual")}
                        className={`p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 min-h-[44px] text-xs sm:text-sm font-medium ${formData.bodega === "me-da-igual"
                          ? "border-brand-violet bg-brand-violet/10 dark:bg-brand-violet/20 text-brand-violet dark:text-brand-aqua shadow-sm"
                          : "border-border hover:border-brand-violet/50 dark:hover:border-brand-violet/40 bg-card hover:bg-surface dark:hover:bg-surface text-text"
                          } focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet focus-visible:ring-offset-2`}
                      >
                        Me da igual
                      </button>
                    </div>
                  </div>
                )}

                {currentStep === 8 && (
                  <div className="space-y-4 sm:space-y-5">
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
                    <WhatsAppInput
                      value={formData.whatsapp || ""}
                      onChange={handleWhatsAppChange}
                      label="WhatsApp"
                      id="whatsapp"
                      required
                    />
                    <div>
                      <Label htmlFor="email" className="text-sm sm:text-base text-text font-medium mb-2 block">Correo electrónico (opcional)</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email || ""}
                        onChange={(e) => updateField("email", e.target.value)}
                        placeholder="tu@email.com"
                        className="mt-2 rounded-xl min-h-[44px] bg-surface dark:bg-surface border-border text-text placeholder:text-subtext focus-visible:ring-brand-violet"
                      />
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
                      <span className="text-sm sm:text-base text-text flex-1">
                        Acepto el tratamiento de mis datos personales según la{" "}
                        <a href="/privacidad" className="underline text-brand-violet hover:text-brand-aqua focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet focus-visible:ring-offset-2 focus-visible:rounded">
                          política de privacidad
                        </a>
                      </span>
                    </Label>
                  </div>
                )}

                {error && (
                  <div className="p-3 sm:p-4 rounded-xl bg-accent-error/10 dark:bg-accent-error/20 border border-accent-error/20 text-accent-error text-sm sm:text-base">
                    {error}
                  </div>
                )}

                <div className="flex gap-2 sm:gap-3 pt-4 sm:pt-6">
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleBack}
                      disabled={isSubmitting}
                      className="flex-1 min-h-[44px] rounded-xl"
                    >
                      <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      <span className="text-sm sm:text-base">Atrás</span>
                    </Button>
                  )}
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={isSubmitting}
                    className="flex-1 min-h-[44px] rounded-xl bg-brand-violet hover:bg-brand-violet/90 text-white"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                        <span className="text-sm sm:text-base">Enviando...</span>
                      </>
                    ) : currentStep === TOTAL_STEPS ? (
                      <span className="text-sm sm:text-base">Enviar</span>
                    ) : (
                      <>
                        <span className="text-sm sm:text-base">Siguiente</span>
                        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
