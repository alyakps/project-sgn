"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { DashboardShell } from "@/components/layouts/dashboard-shell";
import { getUser } from "@/lib/auth-storage";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();

  // ✅ new: cegah admin shell ke-render sebelum validasi selesai
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const user = getUser();

    if (!user) {
      setAllowed(false);
      router.replace("/login");
      return;
    }

    const role = String(user.role).toLowerCase();

    if (role !== "admin") {
      setAllowed(false);
      router.replace("/dashboard");
      return;
    }

    // ✅ only admin can render
    setAllowed(true);
  }, [router]);

  // ✅ penting: jangan render apa-apa sebelum status allowed true
  if (!allowed) return null;

  return <DashboardShell role="admin">{children}</DashboardShell>;
}
