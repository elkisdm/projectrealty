"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff, AlertTriangle } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAdminAuth } from "@hooks/useAdminAuth";
import { validateAdminRedirect } from "@lib/admin/validate-redirect";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const LoginSchema = z.object({
  email: z.string().email("Email invalido"),
  password: z.string().min(1, "Password requerido"),
});

type LoginFormData = z.infer<typeof LoginSchema>;

export default function LoginForm() {
  const searchParams = useSearchParams();
  const { login, isLoading, error } = useAdminAuth();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onBlur",
  });

  const errorMessage = useMemo(() => {
    if (!error) return null;
    const code = error instanceof Error && "code" in error ? (error as Error & { code?: string }).code : "";
    const message = error instanceof Error ? error.message : String(error);

    if (code === "invalid_credentials" || message.includes("incorrectos")) {
      return "Email o password incorrectos.";
    }
    if (code === "rate_limited" || message.includes("Demasiados intentos")) {
      return "Demasiados intentos. Espera un momento e intenta nuevamente.";
    }
    return message || "No fue posible iniciar sesion.";
  }, [error]);

  const onSubmit = async (values: LoginFormData) => {
    try {
      await login(values.email, values.password);
      const redirectParam = searchParams.get("redirect");
      const redirectTo = validateAdminRedirect(redirectParam, "/admin");
      await new Promise((resolve) => setTimeout(resolve, 150));
      window.location.replace(redirectTo);
    } catch {
      // Hook already exposes toast/banner state
    }
  };

  return (
    <Card className="border-[var(--admin-border-subtle)] bg-[var(--admin-surface-1)] shadow-lg">
      <CardHeader>
        <CardTitle>Ingresar al panel</CardTitle>
        <CardDescription>Acceso restringido para administradores y editores.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      autoComplete="email"
                      placeholder="admin@empresa.com"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="••••••••"
                        disabled={isLoading}
                        className="pr-10"
                        {...field}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-0 top-0 h-10 w-10 text-[var(--subtext)]"
                      aria-label={showPassword ? "Ocultar password" : "Mostrar password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {errorMessage ? (
              <Alert variant="destructive" className="border-rose-500/40 bg-rose-500/10 text-rose-200">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Acceso denegado</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            ) : null}

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Iniciando sesion..." : "Iniciar sesion"}
            </Button>

            <p className="text-center text-xs text-[var(--subtext)]">
              Si necesitas ayuda, contacta al administrador del sistema.
            </p>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
