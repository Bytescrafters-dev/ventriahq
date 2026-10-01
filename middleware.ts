import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Read directly instead of importing lib/env: the middleware only needs the
// cookie name and must not crash every request when BACKEND_URL is missing.
const JWT_COOKIE = process.env.JWT_COOKIE_NAME || "platform_jwt";
const PROTECTED = ["/", "/products", "/admins", "/my-profile"];

export const middleware = (req: NextRequest) => {
  const path = req.nextUrl.pathname;

  const needsAuth = PROTECTED.some(
    (p) => path === p || path.startsWith(`${p}/`),
  );

  if (!needsAuth) return NextResponse.next();

  const token = req.cookies.get(JWT_COOKIE)?.value;

  if (!token) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
};

export const config = {
  matcher: ["/((?!_next|favicon.ico|api/auth/login).*)"],
};
