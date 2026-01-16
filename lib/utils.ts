import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generates a protocol-safe base URL from a request.
 * Forces http for localhost to avoid common OAuth redirect_uri_mismatch issues.
 */
export function getSafeBaseUrl(request: Request) {
  const { origin } = new URL(request.url);
  let baseUrl = process.env.BASE_URL || origin;

  // Force http for localhost
  if (baseUrl.includes("localhost")) {
    baseUrl = baseUrl.replace("https://", "http://");
  }

  // Trim trailing slash
  if (baseUrl.endsWith("/")) {
    baseUrl = baseUrl.slice(0, -1);
  }

  return baseUrl;
}
export function parseVariables(content: string, elements: any[]) {
  if (!content) return content;
  return content.replace(/\{\{([^.]+)\.([^}]+)\}\}/g, (match, nId, vKey) => {
    const node = elements.find((n) => n.id === nId);
    if (!node) return match;

    const sampleData = node.data.metadata?.sampleData || {};
    if (sampleData[vKey] !== undefined) {
      if (typeof sampleData[vKey] === "object") {
        return JSON.stringify(sampleData[vKey]);
      }
      return String(sampleData[vKey]);
    }
    return match; // Fallback to raw tag if no data
  });
}
