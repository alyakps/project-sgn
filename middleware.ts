import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("sgn_token")?.value || null;

  // ✅ role dari cookie
  const role = (req.cookies.get("sgn_role")?.value || "").toLowerCase();

  // ✅ must change dari cookie
  const mustChange =
    (req.cookies.get("sgn_must_change_password")?.value || "0") === "1";

  const pathname = req.nextUrl.pathname;

  const isAuthPage = pathname.startsWith("/login");
  const isAdminPage = pathname.startsWith("/admin");
  const isDashboardPage = pathname.startsWith("/dashboard");

  // ✅ halaman change password karyawan
  const isChangePasswordPage = pathname === "/dashboard/password";

  // 1) Belum login: blok /dashboard & /admin
  if (!token && (isDashboardPage || isAdminPage)) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 2) ✅ Proteksi role admin: karyawan tidak boleh masuk /admin
  if (token && isAdminPage && role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // 3) ✅ Must change password: hanya mengunci karyawan (admin cookie always 0)
  if (token && mustChange && !isChangePasswordPage && !isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard/password", req.url));
  }

  // 4) Sudah login ke /login → redirect sesuai mustChange
  if (token && isAuthPage) {
    return NextResponse.redirect(
      new URL(mustChange ? "/dashboard/password" : "/dashboard", req.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/dashboard/:path*", "/admin/:path*"],
};
