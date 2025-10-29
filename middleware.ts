import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  let token = req.cookies.get("accessToken")?.value;
  const authHeader = req.headers.get("Authorization");

  if (!token && authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  }

  if (process.env.NODE_ENV === "development") {
    console.log("Middleware - Path:", req.nextUrl.pathname);
    console.log("Middleware - Token:", token ? "Present" : "Missing");
  }

  const isAuth = !!token;
  const isLoginPage = req.nextUrl.pathname.startsWith("/login");
  const isRootPage = req.nextUrl.pathname === "/";
  const isDashboard = req.nextUrl.pathname.startsWith("/dashboard");

  if (isRootPage) {
    if (isAuth) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (!isAuth && isDashboard) {
    const response = NextResponse.redirect(new URL("/login", req.url));
    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");
    return response;
  }

  if (isAuth && isLoginPage) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    "/",
    "/dashboard/:path*",
    "/login",
  ],
};
