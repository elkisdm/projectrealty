"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TreeBuyRequestSchema, type TreeBuyRequest } from "@schemas/tree";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { track, ANALYTICS_EVENTS } from "@lib/analytics";
import { buildWhatsAppUrl } from "@lib/whatsapp";
import { normalizeWhatsApp } from "@lib/utils/whatsapp";

const RENTA_MENSUAL_OPTIONS = [
  { value: "<1.0M", label: "Menos de $1.0M" },
  { value: "1.0-1.5M", label: "$1.0M - $1.5M" },
  { value: "1.5-2.5M", label: "$1.5M - $2.5M" },
  { value: "2.5-4M", label: "$2.5M - $4M" },
  { value: "4M+", label: "Más de $4M" },
];

const COMPLEMENTAR_RENTA_OPTIONS = [
  { value: "si-aval-pareja", label: "Sí, con aval/pareja" },
  { value: "si-otros-ingresos", label: "Sí, otros ingresos" },
  { value: "no", label: "No" },
];

const SITUACION_FINANCIERA_OPTIONS = [
  { value: "sin-deudas", label: "Sin deudas" },
  { value: "deudas-manejables", label: "Deudas manejables" },
  { value: "alto-endeudamiento", label: "Alto endeudamiento" },
  { value: "no-estoy-seguro", label: "No estoy seguro" },
];

const CAPACIDAD_AHORRO_OPTIONS = [
  { value: "<200k", label: "Menos de $200k" },
  { value: "200-500k", label: "$200k - $500k" },
  { value: "500-1M", label: "$500k - $1M" },
  { value: "1M+", label: "Más de $1M" },
];

const PREFERENCIA_CONTACTO_OPTIONS = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "llamada", label: "Llamada" },
  { value: "correo", label: "Correo" },
];

export function BuyForm() {
  const [formState, setFormState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [submittedData, setSubmittedData] = useState<TreeBuyRequest | null>(null);

  const form = useForm<TreeBuyRequest>({
    resolver: zodResolver(TreeBuyRequestSchema),
    defaultValues: {
      name: "",
      whatsapp: "",
      email: "",
      rentaMensual: undefined,
      complementarRenta: undefined,
      situacionFinanciera: undefined,
      capacidadAhorro: undefined,
      preferenciaContacto: undefined,
      consent: false,
    },
  });

  useEffect(() => {
    track(ANALYTICS_EVENTS.FORM_STEP_VIEW, {
      flow: "buy",
      step_id: 1,
    });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleBeforeUnload = () => {
      track(ANALYTICS_EVENTS.FORM_ABANDON, {
        flow: "buy",
        step_id: 1,
      });
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const onSubmit = async (data: TreeBuyRequest) => {
    setFormState("loading");
    setErrorMessage("");

    try {
      // Normalize WhatsApp before sending
      const normalizedData = {
        ...data,
        whatsapp: normalizeWhatsApp(data.whatsapp),
      };

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
        flow: "buy" as const,
        payload: normalizedData,
        name: normalizedData.name,
        whatsapp: normalizedData.whatsapp,
        email: normalizedData.email,
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

      track(ANALYTICS_EVENTS.TREE_FORM_SUBMIT, { flow: "buy" });

      setSubmittedData(data);
      setFormState("success");
      form.reset();
    } catch (error) {
      setFormState("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Error al enviar el formulario"
      );
    }
  };

  if (formState === "success") {
    const whatsappUrl = buildWhatsAppUrl({
      message: `Hola, completé el formulario de compra. Mi nombre es ${submittedData?.name}.`,
    });

    return (
      <Card className="rounded-2xl max-w-2xl mx-auto">
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
                Te enviaré una propuesta estimada (pie, dividendo, renta proyectada) en menos de 24h.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full mt-6">
              <Button
                onClick={() => {
                  track(ANALYTICS_EVENTS.CTA_SCHEDULE_CLICK, { flow: "buy" });
                  window.location.href = "/agendamiento";
                }}
                className="flex-1"
                size="lg"
              >
                Agendar una asesoría
              </Button>
              {whatsappUrl && (
                <Button
                  onClick={() => {
                    track(ANALYTICS_EVENTS.CTA_WHATSAPP_CLICK, { flow: "buy" });
                    window.open(whatsappUrl, "_blank");
                  }}
                  variant="secondary"
                  className="flex-1"
                  size="lg"
                >
                  WhatsApp directo
                </Button>
              )}
            </div>
          </motion.div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-xl">Interesado en Comprar Propiedad</CardTitle>
            <CardDescription>
              Completa el formulario y te enviaremos una propuesta estimada en menos de 24h
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Nombre */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre completo</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Tu nombre"
                          {...field}
                          disabled={formState === "loading"}
                          aria-required="true"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* WhatsApp */}
                <FormField
                  control={form.control}
                  name="whatsapp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono WhatsApp</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="+56 9 1234 5678"
                          {...field}
                          disabled={formState === "loading"}
                          aria-required="true"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo electrónico</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="tu@email.com"
                          {...field}
                          disabled={formState === "loading"}
                          aria-required="true"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Renta mensual */}
                <FormField
                  control={form.control}
                  name="rentaMensual"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>¿Cuál es tu renta mensual promedio?</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          disabled={formState === "loading"}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Selecciona una opción</option>
                          {RENTA_MENSUAL_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Complementar renta */}
                <FormField
                  control={form.control}
                  name="complementarRenta"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>¿Puedes complementar renta?</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          disabled={formState === "loading"}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Selecciona una opción</option>
                          {COMPLEMENTAR_RENTA_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Situación financiera */}
                <FormField
                  control={form.control}
                  name="situacionFinanciera"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>¿Cuál es tu situación financiera?</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          disabled={formState === "loading"}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Selecciona una opción</option>
                          {SITUACION_FINANCIERA_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Capacidad ahorro */}
                <FormField
                  control={form.control}
                  name="capacidadAhorro"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>¿Cuál es tu capacidad de ahorro mensual?</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          disabled={formState === "loading"}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Selecciona una opción</option>
                          {CAPACIDAD_AHORRO_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Preferencia contacto */}
                <FormField
                  control={form.control}
                  name="preferenciaContacto"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>¿Cómo prefieres que te contactemos?</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          disabled={formState === "loading"}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Selecciona una opción</option>
                          {PREFERENCIA_CONTACTO_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Consentimiento */}
                <FormField
                  control={form.control}
                  name="consent"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          disabled={formState === "loading"}
                          className="mt-1"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm">
                          Acepto el tratamiento de mis datos personales según la{" "}
                          <a href="/privacidad" className="underline">
                            política de privacidad
                          </a>
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                {/* Turnstile placeholder (opcional en MVP) */}
                {/* <div id="turnstile-widget" className="mt-4" /> */}

                {/* Error message */}
                <AnimatePresence mode="wait">
                  {formState === "error" && errorMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
                      role="alert"
                      aria-live="polite"
                    >
                      <AlertCircle className="h-4 w-4" aria-hidden="true" />
                      <span>{errorMessage}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit button */}
                <Button
                  type="submit"
                  className="w-full rounded-xl"
                  disabled={formState === "loading"}
                  size="lg"
                >
                  {formState === "loading" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar Solicitud"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
