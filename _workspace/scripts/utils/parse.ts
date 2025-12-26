/**
 * Utility functions for parsing CSV files
 */

/**
 * Normalize a CSV URL by adding protocol if missing
 * @param url - URL to normalize (may be relative or without protocol)
 * @returns Normalized URL with protocol
 */
export function normalizeCsvUrl(url: string): string {
  if (!url || url.trim() === '') {
    return url;
  }
  
  // If already has protocol, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If starts with //, add https:
  if (url.startsWith('//')) {
    return `https:${url}`;
  }
  
  // Otherwise, assume it's a relative URL or needs https://
  // For relative URLs, we'll prepend https://
  return `https://${url}`;
}

/**
 * Load CSV from a URL
 * @param url - URL to fetch CSV from
 * @returns CSV content as string
 */
export async function loadCsv(url: string): Promise<string> {
  const normalizedUrl = normalizeCsvUrl(url);
  const response = await fetch(normalizedUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch CSV from ${normalizedUrl}: ${response.statusText}`);
  }
  return response.text();
}


