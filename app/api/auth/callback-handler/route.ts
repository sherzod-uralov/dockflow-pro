import { NextRequest, NextResponse } from "next/server";
import { signIn } from "next-auth/react";
import CookieHandler from "@/lib/cookie-handler";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    // Make request to backend
    const backendResponse = await fetch(`${process.env.BACKEND_API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!backendResponse.ok) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const data = await backendResponse.json();
    console.log("🔧 Backend login response:", data);

    // Create NextResponse
    const response = NextResponse.json({
      success: true,
      user: data.user,
      accessToken: data.accessToken,
    });

    // Extract and set refresh token cookie from backend response
    const refreshToken = CookieHandler.extractAndSetRefreshToken(
      backendResponse,
      response
    );

    console.log("🔧 Refresh token extracted:", refreshToken ? "✅ Success" : "❌ Failed");

    // Also set a flag cookie to indicate we have auth data
    CookieHandler.setCookie(response, {
      name: "auth-ready",
      value: "true",
      httpOnly: false, // Allow client access
      maxAge: 60 * 15, // 15 minutes
    });

    return response;

  } catch (error) {
    console.error("🔧 Auth callback error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    CookieHandler.debug(request);

    const refreshToken = CookieHandler.getCookie(request, "refresh-token");
    const authReady = CookieHandler.getCookie(request, "auth-ready");

    return NextResponse.json({
      hasRefreshToken: !!refreshToken,
      refreshTokenPreview: refreshToken ? refreshToken.substring(0, 20) + "..." : null,
      authReady: !!authReady,
      allCookies: request.cookies.getAll().map(c => ({
        name: c.name,
        preview: c.value.substring(0, 20) + "..."
      }))
    });

  } catch (error) {
    console.error("🔧 Error checking auth cookies:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
