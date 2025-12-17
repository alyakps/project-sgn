// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  // Baca token dari cookie (nama cookie: sgn_token)
  const token = req.cookies.get("sgn_token")?.value || null;

  // ✅ Baca flag must change password dari cookie
  const mustChange =
    (req.cookies.get("sgn_must_change_password")?.value || "0") === "1";

  const pathname = req.nextUrl.pathname;

  const isAuthPage = pathname.startsWith("/login");
  const isAdminPage = pathname.startsWith("/admin");
  const isDashboardPage = pathname.startsWith("/dashboard");

  // ✅ halaman change password (biar allowed & gak loop)
  const isChangePasswordPage = pathname === "/dashboard/password";

  // Kalau BELUM login dan mau ke dashboard/admin → lempar ke /login
  if (!token && (isDashboardPage || isAdminPage)) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // ✅ Kalau SUDAH login + wajib ganti password → blok semua selain /dashboard/password (dan /login)
  if (token && mustChange && !isChangePasswordPage && !isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard/password", req.url));
  }

  // Kalau SUDAH login dan masih ke /login → lempar ke /dashboard
  // ✅ tapi kalau mustChange true, lemparnya ke halaman change password
  if (token && isAuthPage) {
    return NextResponse.redirect(
      new URL(mustChange ? "/dashboard/password" : "/dashboard", req.url)
    );
  }

  return NextResponse.next();
}

// Daftar route yang akan diproteksi oleh middleware
export const config = {
  matcher: ["/login", "/dashboard/:path*", "/admin/:path*"],
};
