import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Alias for cn - backward compatibility */
export const clx = cn

/** Format price in Chilean pesos */
export function formatPrice(price?: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price ?? 0)
}

/** Alias for formatPrice - backward compatibility */
export const currency = formatPrice

/** Resolve after specified delay (ms) - for mocks and tests */
export function fakeDelay(ms = 100): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
