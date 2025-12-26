"use client";

import { useState, useEffect } from 'react';
import { Switch } from '@headlessui/react';
// TODO: Uncomment when heroicons is installed
// import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

// Iconos temporales hasta que heroicons esté instalado
const CheckIcon = (props: React.ComponentProps<'div'>) => <div data-testid="check-icon" {...props} />;
const XMarkIcon = (props: React.ComponentProps<'div'>) => <div data-testid="xmark-icon" {...props} />;
import { track } from '@lib/analytics';

interface FlagToggleProps {
  flag: 'comingSoon';
  label: string;
  description: string;
  initialValue: boolean;
  overridden?: boolean;
  expiresAt?: string;
}

interface OverrideRequest {
  flag: 'comingSoon';
  value: boolean;
  duration: number;
}

export function FlagToggle({ 
  flag, 
  label, 
  description, 
  initialValue, 
  overridden = false,
  expiresAt 
}: FlagToggleProps) {
  const [enabled, setEnabled] = useState(initialValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Reset state when props change
  useEffect(() => {
    setEnabled(initialValue);
    setError(null);
    setSuccess(null);
  }, [initialValue, overridden]);

  const handleToggle = async (newValue: boolean) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const override: OverrideRequest = {
        flag,
        value: newValue,
        duration: 1800 // 30 minutos por defecto
      };

      const response = await fetch('/api/flags/override', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(override),
      });

      const result = await response.json();

      if (result.success) {
        setEnabled(newValue);
        setSuccess(result.message);
        
        // Track analytics
        track('flag_override_applied', {
          flag,
          value: newValue,
          duration: override.duration
        });

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.error || 'Error al aplicar override');
      }
    } catch {
      setError('Error de conexión');
      // console.error('Flag toggle error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatExpiration = (expiresAt: string) => {
    const date = new Date(expiresAt);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 1) return 'Expira pronto';
    if (diffMins < 60) return `Expira en ${diffMins} min`;
    
    const diffHours = Math.round(diffMins / 60);
    return `Expira en ${diffHours}h`;
  };

  return (
    <div className="rounded-2xl bg-[var(--soft)]/90 ring-1 ring-white/10 p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-[var(--text)]">
              {label}
            </h3>
            {overridden && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-400/20 text-yellow-300 ring-1 ring-yellow-400/30">
                Override
              </span>
            )}
          </div>
          
          <p className="text-sm text-[var(--subtext)] mb-4">
            {description}
          </p>

          {overridden && expiresAt && (
            <p className="text-xs text-yellow-300/80 mb-4">
              ⏰ {formatExpiration(expiresAt)}
            </p>
          )}

          {/* Status Messages */}
          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm mb-3">
              <XMarkIcon className="w-4 h-4" aria-hidden />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 text-green-400 text-sm mb-3">
              <CheckIcon className="w-4 h-4" aria-hidden />
              <span>{success}</span>
            </div>
          )}
        </div>

        <div className="ml-4">
          <Switch
            checked={enabled}
            onChange={handleToggle}
            disabled={loading}
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2 focus:ring-offset-[var(--bg)]
              ${enabled 
                ? 'bg-brand-violet' 
                : 'bg-gray-600'
              }
              ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            aria-label={`Toggle ${label} flag`}
            aria-describedby={`${flag}-description`}
          >
            <span
              className={`
                inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                ${enabled ? 'translate-x-6' : 'translate-x-1'}
              `}
            />
          </Switch>
        </div>
      </div>

      {/* Hidden description for screen readers */}
      <div id={`${flag}-description`} className="sr-only">
        {description}. Currently {enabled ? 'enabled' : 'disabled'}.
        {overridden && ' This flag has been overridden and will expire soon.'}
      </div>
    </div>
  );
}
