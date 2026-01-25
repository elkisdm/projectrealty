"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InvestmentRequestSchema, type InvestmentRequest } from "@schemas/investment";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { track } from "@lib/analytics";

type FormState = "idle" | "loading" | "success" | "error";

export function InvestmentForm() {
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const form = useForm<InvestmentRequest>({
    resolver: zodResolver(InvestmentRequestSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
      source: "links-page",
    },
  });

  const onSubmit = async (data: InvestmentRequest) => {
    setFormState("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/investment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al enviar la solicitud");
      }

      setFormState("success");
      form.reset();
      
      track("investment_form_submitted", {
        source: data.source ?? "links-page",
      });

      // Reset to idle after 3 seconds
      setTimeout(() => {
        setFormState("idle");
      }, 3000);
    } catch (error) {
      setFormState("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Error al enviar la solicitud"
      );
    }
  };

  if (formState === "success") {
    return (
      <Card className="rounded-2xl">
        <CardContent className="pt-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center text-center space-y-4 py-8"
          >
            <div className="rounded-full bg-accent-success/10 p-3">
              <CheckCircle className="h-8 w-8 text-accent-success" aria-hidden="true" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">
                ¡Solicitud enviada!
              </h3>
              <p className="text-sm text-muted-foreground">
                Gracias por tu interés. Te contactaremos pronto.
              </p>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="text-xl">Interesado en Inversión Inmobiliaria</CardTitle>
        <CardDescription>
          Completa el formulario y nos pondremos en contacto contigo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
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

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="+56 9 1234 5678"
                      {...field}
                      disabled={formState === "loading"}
                      aria-required="true"
                    />
                  </FormControl>
                  <FormDescription>
                    Incluye código de país si es internacional
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mensaje (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Cuéntanos sobre tu interés en inversión inmobiliaria..."
                      className="min-h-[100px] resize-none"
                      {...field}
                      disabled={formState === "loading"}
                    />
                  </FormControl>
                  <FormDescription>
                    Máximo 500 caracteres
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

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
  );
}
