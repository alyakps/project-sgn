// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  // Baca token dari cookie (nama cookie: sgn_token)
  const token = req.cookies.get("sgn_token")?.value || null;

  const pathname = req.nextUrl.pathname;

  const isAuthPage = pathname.startsWith("/login");
  const isAdminPage = pathname.startsWith("/admin");
  const isDashboardPage = pathname.startsWith("/dashboard");

  // Kalau BELUM login dan mau ke dashboard/admin → lempar ke /login
  if (!token && (isDashboardPage || isAdminPage)) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Kalau SUDAH login dan masih ke /login → lempar ke /dashboard
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

// Daftar route yang akan diproteksi oleh middleware
export const config = {
  matcher: ["/login", "/dashboard/:path*", "/admin/:path*"],
};
