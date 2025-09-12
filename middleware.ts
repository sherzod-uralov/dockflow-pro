import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const protectedRoutes = [
  "/dashboard",
  "/profile",
  "/settings",
  "/admin",
  "/api/protected",
];
const publicRoutes = ["/", "/login", "/register", "/about", "/contact"];

function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some((route) => pathname.startsWith(route));
}

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.includes(pathname) || pathname.startsWith("/api/auth");
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Static fayl va API auth yo'llarini skip qilish
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/auth/") ||
    pathname.includes("favicon.ico") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    // Ngrok uchun secure: true qo'shish
    secureCookie: process.env.NODE_ENV === "production",
  });

  if (!token && pathname.startsWith("/dashboard")) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (!token && pathname === "/") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (token?.accessToken || token?.refreshToken) {
    const response = NextResponse.next();

    // CORS headerlari qo'shish
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set(
      "Access-Control-Allow-Origin",
      request.headers.get("origin") || "*",
    );

    if (token.accessToken) {
      response.cookies.set("access-token", token.accessToken as string, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        path: "/",
        maxAge: 60 * 60 * 24,
        domain: process.env.NODE_ENV === "production" ? ".ngrok.io" : undefined,
      });
    }
    if (token.refreshToken) {
      response.cookies.set("refresh-token", token.refreshToken as string, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
        domain: process.env.NODE_ENV === "production" ? ".ngrok.io" : undefined,
      });
    }
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
