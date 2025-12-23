"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { DashboardShell } from "@/components/layouts/dashboard-shell";
import { getUser } from "@/lib/auth-storage";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  // ✅ penting: cegah render sebelum role valid
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const user = getUser();

    // ❌ belum login
    if (!user) {
      setAllowed(false);
      router.replace("/login");
      return;
    }

    const role = String(user.role || "").toLowerCase();

    // ❌ admin TIDAK BOLEH di /dashboard
    if (role === "admin") {
      setAllowed(false);
      router.replace("/admin");
      return;
    }

    // ✅ karyawan boleh
    setAllowed(true);
  }, [router]);

  // ⛔ jangan render apa pun sebelum valid
  if (!allowed) return null;

  return <DashboardShell role="karyawan">{children}</DashboardShell>;
}
