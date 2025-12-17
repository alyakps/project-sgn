"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";

export function MustChangePasswordGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    const token = Cookies.get("sgn_token");
    const mustChange = Cookies.get("sgn_must_change_password") === "1";

    // kalau login + mustChange, paksa ke halaman change password
    if (token && mustChange && pathname !== "/dashboard/password") {
      router.replace("/dashboard/password");
    }
  }, [pathname, router]);

  const token = Cookies.get("sgn_token");
  const mustChange = Cookies.get("sgn_must_change_password") === "1";
  const isPasswordPage = pathname === "/dashboard/password";

  // kalau mustChange dan bukan di halaman password, matiin interaksi UI
  if (token && mustChange && !isPasswordPage) {
    return (
      <div className="relative">
        <div className="pointer-events-none opacity-60">{children}</div>

        {/* overlay blocker */}
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm">
          <div className="rounded-xl border bg-white p-4 shadow-sm text-center">
            <div className="font-semibold text-zinc-900">Wajib ganti password</div>
            <div className="mt-1 text-sm text-zinc-600">
              Kamu harus ganti password dulu sebelum mengakses halaman lain.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
