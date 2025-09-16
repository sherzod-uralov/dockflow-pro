"use client";

import { NextRequest, NextResponse } from "next/server";

export interface CookieConfig {
  name: string;
  value: string;
  maxAge?: number;
  expires?: Date;
  path?: string;
  domain?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: "strict" | "lax" | "none";
}

export class CookieHandler {
  /**
   * Set cookie manually in response
   */
  static setCookie(response: NextResponse, config: CookieConfig): void {
    const { name, value, ...options } = config;

    response.cookies.set(name, value, {
      httpOnly: options.httpOnly ?? true,
      secure: options.secure ?? process.env.NODE_ENV === "production",
      sameSite: options.sameSite ?? "lax",
      path: options.path ?? "/",
      maxAge: options.maxAge ?? 60 * 60 * 24 * 7, // 7 days default
      ...options,
    });
  }

  /**
   * Extract refresh token from Set-Cookie header and manually set it
   */
  static extractAndSetRefreshToken(
    backendResponse: Response,
    nextResponse: NextResponse
  ): string | null {
    const setCookieHeader = backendResponse.headers.get("set-cookie");

    if (!setCookieHeader) return null;

    console.log("🔧 Set-Cookie header:", setCookieHeader);

    // Extract refresh token value
    const refreshTokenMatch = setCookieHeader.match(/refresh-token=([^;]+)/);

    if (!refreshTokenMatch) return null;

    const refreshTokenValue = refreshTokenMatch[1];
    console.log("🔧 Extracted refresh token:", refreshTokenValue.substring(0, 20) + "...");

    // Extract cookie attributes from original Set-Cookie header
    const maxAgeMatch = setCookieHeader.match(/Max-Age=(\d+)/i);
    const pathMatch = setCookieHeader.match(/Path=([^;]+)/i);
    const expiresMatch = setCookieHeader.match(/Expires=([^;]+)/i);
    const httpOnlyMatch = setCookieHeader.includes("HttpOnly");
    const secureMatch = setCookieHeader.includes("Secure");
    const sameSiteMatch = setCookieHeader.match(/SameSite=([^;]+)/i);

    // Set the cookie with extracted attributes
    const cookieConfig: CookieConfig = {
      name: "refresh-token",
      value: refreshTokenValue,
      httpOnly: httpOnlyMatch,
      secure: secureMatch,
      path: pathMatch ? pathMatch[1] : "/",
      sameSite: sameSiteMatch ? sameSiteMatch[1].toLowerCase() as "strict" | "lax" | "none" : "lax",
    };

    if (maxAgeMatch) {
      cookieConfig.maxAge = parseInt(maxAgeMatch[1]);
    } else if (expiresMatch) {
      cookieConfig.expires = new Date(expiresMatch[1]);
    }

    this.setCookie(nextResponse, cookieConfig);
    console.log("🔧 Refresh token cookie set successfully");

    return refreshTokenValue;
  }

  /**
   * Get cookie value from request
   */
  static getCookie(request: NextRequest, name: string): string | undefined {
    return request.cookies.get(name)?.value;
  }

  /**
   * Delete cookie
   */
  static deleteCookie(response: NextResponse, name: string, path: string = "/"): void {
    response.cookies.set(name, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path,
      maxAge: 0,
      expires: new Date(0),
    });
  }

  /**
   * Client-side cookie management
   */
  static client = {
    set(name: string, value: string, days: number = 7): void {
      if (typeof document === "undefined") return;

      const expires = new Date();
      expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);

      document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
    },

    get(name: string): string | null {
      if (typeof document === "undefined") return null;

      const nameEQ = name + "=";
      const cookies = document.cookie.split(";");

      for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.indexOf(nameEQ) === 0) {
          return cookie.substring(nameEQ.length);
        }
      }
      return null;
    },

    delete(name: string): void {
      if (typeof document === "undefined") return;

      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    },

    getAll(): Record<string, string> {
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
    },
  };

  /**
   * Debug helper to log all cookie information
   */
  static debug(request?: NextRequest): void {
    if (process.env.NODE_ENV !== "development") return;

    console.log("🔧 Cookie Debug Information:");

    if (request) {
      console.log("📝 Server-side cookies:");
      request.cookies.getAll().forEach(cookie => {
        console.log(`  ${cookie.name}: ${cookie.value.substring(0, 20)}...`);
      });
    }

    if (typeof document !== "undefined") {
      console.log("📝 Client-side cookies:");
      const clientCookies = this.client.getAll();
      Object.entries(clientCookies).forEach(([name, value]) => {
        console.log(`  ${name}: ${value.substring(0, 20)}...`);
      });
    }
  }
}

export default CookieHandler;
