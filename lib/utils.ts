type ClxInput = string | false | null | undefined | (string | false | null | undefined)[];
export function clx(...classes: ClxInput[]): string {
  return classes.flat().filter(Boolean).join(" ");
}

// cn function compatible with classnames library (supports objects)
export function cn(...inputs: any[]): string {
  const classes: string[] = [];
  
  for (const input of inputs) {
    if (!input) continue;
    
    if (typeof input === 'string') {
      classes.push(input);
    } else if (typeof input === 'object' && !Array.isArray(input)) {
      for (const [key, value] of Object.entries(input)) {
        if (value) {
          classes.push(key);
        }
      }
    }
  }
  
  return classes.join(' ');
}
export function formatPrice(value?: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value ?? 0);
}

// Backwards compatibility for existing imports
export function currency(clp?: number) {
  return formatPrice(clp);
}
export const fakeDelay = (ms = 800) => new Promise((res) => setTimeout(res, ms));
