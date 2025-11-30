export function normalizeCsvUrl(url: string): string {
  const driveFileMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)\//);
  if (driveFileMatch) {
    const id = driveFileMatch[1];
    return `https://drive.google.com/uc?export=download&id=${id}`;
  }

  const sheetsMatch = url.match(/docs\.google\.com\/spreadsheets\/d\/([^/]+)/);
  if (sheetsMatch) {
    const id = sheetsMatch[1];
    return `https://docs.google.com/spreadsheets/d/${id}/export?format=csv`;
  }

  return url;
}

export async function loadCsv(url: string): Promise<string> {
  const normalizedUrl = normalizeCsvUrl(url);
  const response = await fetch(normalizedUrl);

  const contentType = (response.headers.get("content-type") || "").toLowerCase();

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  // Only allow CSV or generic octet-stream (often used by Drive direct download)
  const isCsvMime = contentType.includes("text/csv") || contentType.includes("application/octet-stream");
  if (!isCsvMime) {
    throw new Error("CSV expected");
  }

  const text = await response.text();

  // Heuristic: Google Drive confirm/sign-in pages can be served with octet-stream
  // Detect HTML bodies and reject as not-CSV
  const head = text.slice(0, 1024).trim().toLowerCase();
  const looksLikeHtml = head.startsWith("<") && /<(?:!doctype\s+html|html|head|body)[\s>]/i.test(head);
  if (looksLikeHtml) {
    throw new Error("CSV expected");
  }

  return text;
}


