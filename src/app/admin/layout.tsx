"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { DashboardShell } from "@/components/layouts/dashboard-shell";
import { getUser } from "@/lib/auth-storage";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const user = getUser(); // ambil dari localStorage

    if (!user) {
      router.replace("/login");
      return;
    }

    const role = String(user.role).toLowerCase();

    // kalau bukan admin -> lempar ke dashboard karyawan
    if (role !== "admin") {
      router.replace("/"); // atau "/dashboard" sesuai punyamu
      return;
    }
  }, [router]);

  return <DashboardShell role="admin">{children}</DashboardShell>;
}
