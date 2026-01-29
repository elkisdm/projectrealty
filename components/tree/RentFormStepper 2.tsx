"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight, Loader2, CheckCircle } from "lucide-react";
import { TreeRentRequestSchema, type TreeRentRequest } from "@schemas/tree";
import { track, ANALYTICS_EVENTS } from "@lib/analytics";
import { buildWhatsAppUrl } from "@lib/whatsapp";
import { normalizeWhatsApp } from "@lib/utils/whatsapp";

const STORAGE_KEY = "tree_rent_form_data";
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

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(parsed);
        // Restore step if form was partially completed
        if (parsed.currentStep) {
          setCurrentStep(parsed.currentStep);
        }
      } catch {
        // Invalid data, ignore
      }
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (Object.keys(formData).length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...formData, currentStep }));
    }
  }, [formData, currentStep]);

  // Track step view
  useEffect(() => {
    track(ANALYTICS_EVENTS.FORM_STEP_VIEW, {
      flow: "rent",
      step_id: currentStep,
    });
  }, [currentStep]);

  // Track abandon on beforeunload
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

  const updateField = (field: keyof FormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!formData.comuna && formData.comuna.trim().length > 0;
      case 2:
        return !!formData.presupuesto;
      case 3:
        return !!formData.fechaMudanza;
      case 4:
        return !!formData.tieneMascotas;
      case 5:
        return !!formData.dormitorios;
      case 6:
        return !!formData.estacionamiento;
      case 7:
        return !!formData.bodega;
      case 8:
        return (
          !!formData.name &&
          formData.name.trim().length >= 2 &&
          !!formData.whatsapp &&
          formData.whatsapp.trim().length >= 8
        );
      case 9:
        return formData.consent === true;
      default:
        return true;
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
      // Normalize WhatsApp before validation
      const formDataWithNormalizedWhatsApp = {
        ...formData,
        whatsapp: formData.whatsapp ? normalizeWhatsApp(formData.whatsapp) : formData.whatsapp,
      };

      // Validate full form
      const validated = TreeRentRequestSchema.parse(formDataWithNormalizedWhatsApp);

      // Get UTMs from URL
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
        whatsapp: validated.whatsapp, // Already normalized
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

      // Clear localStorage
      localStorage.removeItem(STORAGE_KEY);

      track(ANALYTICS_EVENTS.TREE_FORM_SUBMIT, { flow: "rent" });

      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar el formulario");
      setIsSubmitting(false);
    }
  };

  const progress = (currentStep / TOTAL_STEPS) * 100;

  if (isSuccess) {
    const whatsappUrl = buildWhatsAppUrl({
      message: `Hola, completé el formulario de arriendo. Mi nombre es ${formData.name}.`,
    });

    return (
      <Card className="rounded-2xl max-w-md mx-auto">
        <CardContent className="pt-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center text-center space-y-4 py-8"
          >
            <div className="rounded-full bg-green-500/10 p-3">
              <CheckCircle className="h-8 w-8 text-green-500" aria-hidden="true" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">
                ¡Formulario enviado!
              </h3>
              <p className="text-sm text-muted-foreground">
                Te contactaremos pronto con opciones que se ajusten a tus necesidades.
              </p>
            </div>
            {whatsappUrl && (
              <Button
                onClick={() => {
                  track(ANALYTICS_EVENTS.CTA_WHATSAPP_CLICK, { flow: "rent" });
                  window.open(whatsappUrl, "_blank");
                }}
                className="w-full mt-4"
                size="lg"
              >
                Contactar por WhatsApp
              </Button>
            )}
          </motion.div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-md">
        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Paso {currentStep} de {TOTAL_STEPS}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <motion.div
              className="bg-primary h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-xl">
              {currentStep === 1 && "¿En qué comuna buscas?"}
              {currentStep === 2 && "¿Cuál es tu presupuesto aproximado?"}
              {currentStep === 3 && "¿Cuándo te mudarías?"}
              {currentStep === 4 && "¿Tienes mascotas?"}
              {currentStep === 5 && "¿Cuántos dormitorios necesitas?"}
              {currentStep === 6 && "¿Necesitas estacionamiento?"}
              {currentStep === 7 && "¿Necesitas bodega?"}
              {currentStep === 8 && "Datos de contacto"}
              {currentStep === 9 && "Consentimiento"}
              {currentStep === 10 && "¡Listo!"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* Step 1: Comuna */}
                {currentStep === 1 && (
                  <div>
                    <Label htmlFor="comuna">Comuna</Label>
                    <Input
                      id="comuna"
                      value={formData.comuna || ""}
                      onChange={(e) => updateField("comuna", e.target.value)}
                      placeholder="Ej: Las Condes, Providencia..."
                      className="mt-2"
                      autoFocus
                    />
                  </div>
                )}

                {/* Step 2: Presupuesto */}
                {currentStep === 2 && (
                  <div>
                    <Label>Presupuesto mensual</Label>
                    <div className="mt-2 space-y-2">
                      {PRESUPUESTO_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => updateField("presupuesto", option.value)}
                          className={`w-full text-left p-4 rounded-xl border-2 transition-colors ${formData.presupuesto === option.value
                              ? "border-primary bg-primary/10"
                              : "border-muted hover:border-primary/50"
                            }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 3: Fecha mudanza */}
                {currentStep === 3 && (
                  <div>
                    <Label>Fecha tentativa de mudanza</Label>
                    <div className="mt-2 space-y-2">
                      {FECHA_MUDANZA_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => updateField("fechaMudanza", option.value)}
                          className={`w-full text-left p-4 rounded-xl border-2 transition-colors ${formData.fechaMudanza === option.value
                              ? "border-primary bg-primary/10"
                              : "border-muted hover:border-primary/50"
                            }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 4: Mascotas */}
                {currentStep === 4 && (
                  <div>
                    <Label>¿Tienes mascotas?</Label>
                    <div className="mt-2 grid grid-cols-2 gap-3">
                      <button
                        onClick={() => updateField("tieneMascotas", "si")}
                        className={`p-4 rounded-xl border-2 transition-colors ${formData.tieneMascotas === "si"
                            ? "border-primary bg-primary/10"
                            : "border-muted hover:border-primary/50"
                          }`}
                      >
                        Sí
                      </button>
                      <button
                        onClick={() => updateField("tieneMascotas", "no")}
                        className={`p-4 rounded-xl border-2 transition-colors ${formData.tieneMascotas === "no"
                            ? "border-primary bg-primary/10"
                            : "border-muted hover:border-primary/50"
                          }`}
                      >
                        No
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 5: Dormitorios */}
                {currentStep === 5 && (
                  <div>
                    <Label>Dormitorios</Label>
                    <div className="mt-2 space-y-2">
                      {DORMITORIOS_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => updateField("dormitorios", option.value)}
                          className={`w-full text-left p-4 rounded-xl border-2 transition-colors ${formData.dormitorios === option.value
                              ? "border-primary bg-primary/10"
                              : "border-muted hover:border-primary/50"
                            }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 6: Estacionamiento */}
                {currentStep === 6 && (
                  <div>
                    <Label>¿Necesitas estacionamiento?</Label>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      <button
                        onClick={() => updateField("estacionamiento", "si")}
                        className={`p-4 rounded-xl border-2 transition-colors text-sm ${formData.estacionamiento === "si"
                            ? "border-primary bg-primary/10"
                            : "border-muted hover:border-primary/50"
                          }`}
                      >
                        Sí
                      </button>
                      <button
                        onClick={() => updateField("estacionamiento", "no")}
                        className={`p-4 rounded-xl border-2 transition-colors text-sm ${formData.estacionamiento === "no"
                            ? "border-primary bg-primary/10"
                            : "border-muted hover:border-primary/50"
                          }`}
                      >
                        No
                      </button>
                      <button
                        onClick={() => updateField("estacionamiento", "me-da-igual")}
                        className={`p-4 rounded-xl border-2 transition-colors text-sm ${formData.estacionamiento === "me-da-igual"
                            ? "border-primary bg-primary/10"
                            : "border-muted hover:border-primary/50"
                          }`}
                      >
                        Me da igual
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 7: Bodega */}
                {currentStep === 7 && (
                  <div>
                    <Label>¿Necesitas bodega?</Label>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      <button
                        onClick={() => updateField("bodega", "si")}
                        className={`p-4 rounded-xl border-2 transition-colors text-sm ${formData.bodega === "si"
                            ? "border-primary bg-primary/10"
                            : "border-muted hover:border-primary/50"
                          }`}
                      >
                        Sí
                      </button>
                      <button
                        onClick={() => updateField("bodega", "no")}
                        className={`p-4 rounded-xl border-2 transition-colors text-sm ${formData.bodega === "no"
                            ? "border-primary bg-primary/10"
                            : "border-muted hover:border-primary/50"
                          }`}
                      >
                        No
                      </button>
                      <button
                        onClick={() => updateField("bodega", "me-da-igual")}
                        className={`p-4 rounded-xl border-2 transition-colors text-sm ${formData.bodega === "me-da-igual"
                            ? "border-primary bg-primary/10"
                            : "border-muted hover:border-primary/50"
                          }`}
                      >
                        Me da igual
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 8: Contacto */}
                {currentStep === 8 && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Nombre completo</Label>
                      <Input
                        id="name"
                        value={formData.name || ""}
                        onChange={(e) => updateField("name", e.target.value)}
                        placeholder="Tu nombre"
                        className="mt-2"
                        autoFocus
                      />
                    </div>
                    <div>
                      <Label htmlFor="whatsapp">WhatsApp</Label>
                      <Input
                        id="whatsapp"
                        type="tel"
                        value={formData.whatsapp || ""}
                        onChange={(e) => updateField("whatsapp", e.target.value)}
                        placeholder="+56 9 1234 5678"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Correo electrónico (opcional)</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email || ""}
                        onChange={(e) => updateField("email", e.target.value)}
                        placeholder="tu@email.com"
                        className="mt-2"
                      />
                    </div>
                  </div>
                )}

                {/* Step 9: Consentimiento */}
                {currentStep === 9 && (
                  <div>
                    <Label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.consent === true}
                        onChange={(e) => updateField("consent", e.target.checked)}
                        className="mt-1"
                      />
                      <span className="text-sm">
                        Acepto el tratamiento de mis datos personales según la{" "}
                        <a href="/privacidad" className="underline">
                          política de privacidad
                        </a>
                      </span>
                    </Label>
                  </div>
                )}

                {/* Error message */}
                {error && (
                  <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                    {error}
                  </div>
                )}

                {/* Navigation buttons */}
                <div className="flex gap-3 pt-4">
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleBack}
                      disabled={isSubmitting}
                      className="flex-1"
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Atrás
                    </Button>
                  )}
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : currentStep === TOTAL_STEPS ? (
                      "Enviar"
                    ) : (
                      <>
                        Siguiente
                        <ChevronRight className="w-4 h-4 ml-2" />
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
