// middleware.ts (root of project)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  // Your token logic here (unchanged)
  let token = req.cookies.get("accessToken")?.value;
  const authHeader = req.headers.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  }

  if (process.env.NODE_ENV === "development") {
    console.log("Access Token (dev only):", token ? "Present" : "Missing");
  }

  const isAuth = !!token;
  const isLoginPage = req.nextUrl.pathname.startsWith("/login");
  const isDashboard = req.nextUrl.pathname.startsWith("/dashboard");

  if (!isAuth && isDashboard) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isAuth && isLoginPage) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Exclude API, static files, and images to avoid 404/blocks
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
    // Your protected paths
    "/dashboard/:path*",
    "/login",
  ],
};
