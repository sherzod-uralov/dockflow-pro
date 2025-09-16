// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token =
    req.cookies.get("accessToken")?.value || req.headers.get("Authorization");

  console.log(req.cookies.get("accessToken"));
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
  matcher: ["/dashboard/:path*", "/login"],
};
