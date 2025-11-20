// Utility functions for handling cookies from Set-Cookie headers

export interface CookieOptions {
  maxAge?: number;
  expires?: Date;
  path?: string;
  domain?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: "strict" | "lax" | "none";
}

export interface ParsedCookie {
  name: string;
  value: string;
  options: CookieOptions;
}

/**
 * Parse a single Set-Cookie header value
 */
export function parseCookie(cookieString: string): ParsedCookie | null {
  if (!cookieString) return null;

  const parts = cookieString.split(";").map((part) => part.trim());
  const firstPart = parts[0];

  if (!firstPart) return null;

  const [name, value] = firstPart.split("=");
  if (!name || value === undefined) return null;

  const options: CookieOptions = {};

  // Parse cookie attributes
  for (let i = 1; i < parts.length; i++) {
    const part = parts[i].toLowerCase();

    if (part.startsWith("max-age=")) {
      options.maxAge = parseInt(part.split("=")[1]);
    } else if (part.startsWith("expires=")) {
      options.expires = new Date(part.split("=")[1]);
    } else if (part.startsWith("path=")) {
      options.path = part.split("=")[1];
    } else if (part.startsWith("domain=")) {
      options.domain = part.split("=")[1];
    } else if (part === "secure") {
      options.secure = true;
    } else if (part === "httponly") {
      options.httpOnly = true;
    } else if (part.startsWith("samesite=")) {
      const sameSiteValue = part.split("=")[1] as "strict" | "lax" | "none";
      options.sameSite = sameSiteValue;
    }
  }

  return {
    name: name.trim(),
    value: value.trim(),
    options,
  };
}

/**
 * Parse multiple Set-Cookie headers
 */
export function parseSetCookieHeaders(headers: Headers): ParsedCookie[] {
  const cookies: ParsedCookie[] = [];

  // Get all Set-Cookie headers (there can be multiple)
  const setCookieValues = headers.get("set-cookie");

  if (!setCookieValues) return cookies;

  // Handle multiple Set-Cookie headers properly
  // Set-Cookie headers are NOT comma-separated, each cookie is a separate header
  // But fetch API combines them with commas, so we need to be careful
  const cookieStrings = [setCookieValues];

  for (const cookieString of cookieStrings) {
    const parsed = parseCookie(cookieString);
    if (parsed) {
      cookies.push(parsed);
    }
  }

  return cookies;
}

/**
 * Extract a specific cookie value from Set-Cookie headers
 */
export function extractCookieValue(
  headers: Headers,
  cookieName: string,
): string | null {
  const setCookieHeader = headers.get("set-cookie");
  if (!setCookieHeader) return null;

  // Use regex to find the specific cookie value
  const regex = new RegExp(`${cookieName}=([^;]+)`);
  const match = setCookieHeader.match(regex);

  return match ? match[1] : null;
}

/**
 * Extract refresh token specifically from response headers
 */
export function extractRefreshToken(response: Response): string | null {
  const setCookieHeader = response.headers.get("set-cookie");
  if (!setCookieHeader) return null;

  console.log("Full Set-Cookie header:", setCookieHeader);

  // Look for refresh-token specifically
  const refreshTokenMatch = setCookieHeader.match(/refresh-token=([^;]+)/);
  if (refreshTokenMatch) {
    console.log("Found refresh-token:", refreshTokenMatch[1]);
    return refreshTokenMatch[1];
  }

  return null;
}

/**
 * Set cookie in document (client-side only)
 */
export function setClientCookie(
  name: string,
  value: string,
  options: CookieOptions = {},
): void {
  if (typeof document === "undefined") return;

  let cookieString = `${name}=${value}`;

  if (options.maxAge) {
    cookieString += `; Max-Age=${options.maxAge}`;
  }

  if (options.expires) {
    cookieString += `; Expires=${options.expires.toUTCString()}`;
  }

  if (options.path) {
    cookieString += `; Path=${options.path}`;
  }

  if (options.domain) {
    cookieString += `; Domain=${options.domain}`;
  }

  if (options.secure) {
    cookieString += "; Secure";
  }

  if (options.sameSite) {
    cookieString += `; SameSite=${options.sameSite}`;
  }

  document.cookie = cookieString;
}

/**
 * Get cookie value from document (client-side only)
 */
export function getClientCookie(name: string): string | null {
  if (typeof document === "undefined") return null;

  const cookies = document.cookie.split(";");

  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.trim().split("=");
    if (cookieName === name) {
      return cookieValue || null;
    }
  }

  return null;
}

/**
 * Delete cookie from document (client-side only)
 */
export function deleteClientCookie(name: string, path: string = "/"): void {
  if (typeof document === "undefined") return;

  document.cookie = `${name}=; Path=${path}; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

/**
 * Get all cookies from document as object (client-side only)
 */
export function getAllClientCookies(): Record<string, string> {
  if (typeof document === "undefined") return {};

  const cookies: Record<string, string> = {};
  const cookieStrings = document.cookie.split(";");

  for (const cookieString of cookieStrings) {
    const [name, value] = cookieString.trim().split("=");
    if (name && value) {
      cookies[name] = value;
    }
  }

  return cookies;
}
