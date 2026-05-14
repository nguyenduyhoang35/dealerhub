import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = [
  "/",
  "/products",
  "/login",
  "/api/auth/login",
  "/api/auth/logout",
  "/api/auth/me",
  "/api/products",
  "/api/export/order-template",
];

const AUTH_REQUIRED_PATHS = [
  "/orders",
  "/debt",
  "/my-route",
  "/admin",
];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/auth/")) {
    return NextResponse.next();
  }

  const session = req.cookies.get("kho_session")?.value;

  const needsAuth = AUTH_REQUIRED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  ) || pathname.startsWith("/api/");

  if (needsAuth && !session) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
