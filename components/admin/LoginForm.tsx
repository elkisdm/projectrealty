'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { z } from 'zod';
import { useAdminAuth } from '@hooks/useAdminAuth';
import { validateAdminRedirect } from '@lib/admin/validate-redirect';

// Schema de validación
const LoginSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(1, 'Password requerido'),
});

type LoginFormData = z.infer<typeof LoginSchema>;

export default function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login, isLoading, error } = useAdminAuth();

    const [formData, setFormData] = useState<LoginFormData>({
        email: '',
        password: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    const handleChange = (field: keyof LoginFormData) => (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const value = e.target.value;
        setFormData((prev) => ({ ...prev, [field]: value }));

        // Validar campo en tiempo real
        if (touched[field]) {
            const result = LoginSchema.shape[field].safeParse(value);
            if (!result.success) {
                setErrors((prev) => ({
                    ...prev,
                    [field]: result.error.errors[0]?.message ?? '',
                }));
            } else {
                setErrors((prev) => ({ ...prev, [field]: '' }));
            }
        }
    };

    const handleBlur = (field: keyof LoginFormData) => () => {
        setTouched((prev) => ({ ...prev, [field]: true }));
        const result = LoginSchema.shape[field].safeParse(formData[field]);
        if (!result.success) {
            setErrors((prev) => ({
                ...prev,
                [field]: result.error.errors[0]?.message ?? '',
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Marcar todos los campos como touched
        setTouched({ email: true, password: true });

        // Validar formulario completo
        const result = LoginSchema.safeParse(formData);
        if (!result.success) {
            const newErrors: Record<string, string> = {};
            result.error.errors.forEach((err) => {
                if (err.path[0]) {
                    newErrors[err.path[0] as string] = err.message;
                }
            });
            setErrors(newErrors);
            return;
        }

        // Limpiar errores previos
        setErrors({});

        try {
            await login(formData.email, formData.password);

            // Redirigir después de login exitoso (validado para prevenir open redirect)
            const redirectParam = searchParams.get('redirect');
            const redirectTo = validateAdminRedirect(redirectParam, '/admin');
            router.push(redirectTo);
            router.refresh();
        } catch {
            // El error ya está manejado en el hook
            // Solo necesitamos asegurarnos de que se muestre
        }
    };

    const getErrorMessage = () => {
        if (error) {
            // Verificar el código de error primero (más confiable)
            const errorCode = error instanceof Error && 'code' in error ? (error as Error & { code?: string }).code : null;
            const errorMessage = error instanceof Error ? error.message : String(error);

            if (errorCode === 'invalid_credentials' || errorMessage.includes('invalid_credentials') || errorMessage.includes('Email o password incorrectos')) {
                return 'Email o password incorrectos';
            }
            if (errorCode === 'rate_limited' || errorMessage.includes('rate_limited') || errorMessage.includes('Demasiados intentos')) {
                return 'Demasiados intentos. Por favor intenta más tarde.';
            }
            return errorMessage || 'Error al iniciar sesión. Por favor intenta nuevamente.';
        }
        return null;
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div>
                <label
                    htmlFor="email"
                    className="block text-sm font-medium text-[var(--text)] mb-2"
                >
                    Email
                </label>
                <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange('email')}
                    onBlur={handleBlur('email')}
                    aria-invalid={touched.email && !!errors.email}
                    aria-describedby={touched.email && errors.email ? 'email-error' : undefined}
                    className={`w-full px-4 py-3 rounded-lg bg-[var(--bg)] border ${touched.email && errors.email
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-white/10 focus:ring-brand-violet'
                        } text-[var(--text)] placeholder-[var(--subtext)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--soft)] transition-colors`}
                    placeholder="admin@example.com"
                    disabled={isLoading}
                />
                {touched.email && errors.email && (
                    <p id="email-error" className="mt-1 text-sm text-red-400" role="alert">
                        {errors.email}
                    </p>
                )}
            </div>

            <div>
                <label
                    htmlFor="password"
                    className="block text-sm font-medium text-[var(--text)] mb-2"
                >
                    Password
                </label>
                <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange('password')}
                    onBlur={handleBlur('password')}
                    aria-invalid={touched.password && !!errors.password}
                    aria-describedby={
                        touched.password && errors.password ? 'password-error' : undefined
                    }
                    className={`w-full px-4 py-3 rounded-lg bg-[var(--bg)] border ${touched.password && errors.password
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-white/10 focus:ring-brand-violet'
                        } text-[var(--text)] placeholder-[var(--subtext)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--soft)] transition-colors`}
                    placeholder="••••••••"
                    disabled={isLoading}
                />
                {touched.password && errors.password && (
                    <p id="password-error" className="mt-1 text-sm text-red-400" role="alert">
                        {errors.password}
                    </p>
                )}
            </div>

            {getErrorMessage() && (
                <div
                    className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                    role="alert"
                >
                    {getErrorMessage()}
                </div>
            )}

            <button
                type="submit"
                disabled={isLoading}
                className="w-full px-4 py-3 rounded-lg bg-brand-violet text-white font-medium hover:bg-brand-violet/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-brand-violet focus:ring-offset-2 focus:ring-offset-[var(--soft)]"
            >
                {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>

            <div className="text-center">
                <a
                    href="#"
                    className="text-sm text-[var(--subtext)] hover:text-[var(--text)] transition-colors"
                    onClick={(e) => {
                        e.preventDefault();
                        // TODO: Implementar recuperación de password
                        alert('Funcionalidad de recuperación de password próximamente');
                    }}
                >
                    ¿Olvidaste tu contraseña?
                </a>
            </div>
        </form>
    );
}

