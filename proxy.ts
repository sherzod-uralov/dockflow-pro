import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function proxy(req: NextRequest) {
  let token = req.cookies.get("accessToken")?.value;
  const authHeader = req.headers.get("Authorization");

  if (!token && authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  }

  if (process.env.NODE_ENV === "development") {
  }

  const isAuth = !!token;
  const { pathname, search } = req.nextUrl;
  const isLoginPage = pathname.startsWith("/login");
  const isRootPage = pathname === "/";
  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/document-edit") ||
    pathname.startsWith("/pdf");

  if (isRootPage) {
    if (isAuth) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (!isAuth && isProtected) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname + search);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");
    return response;
  }

  if (isAuth && isLoginPage) {
    const callbackUrl = req.nextUrl.searchParams.get("callbackUrl");
    const target = callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/dashboard";
    return NextResponse.redirect(new URL(target, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/dashboard/:path*",
    "/document-edit/:path*",
    "/pdf/:path*",
  ],
};
