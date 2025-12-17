"use client";

import * as React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie"; // ✅ tambah
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  LayoutDashboard,
  LineChart,
  BarChart,
  User,
  LogOut,
} from "lucide-react";

/* shadcn/ui untuk top bar */
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

/* 🔐 auth helpers */
import { getUser, clearAuth, getToken } from "@/lib/auth-storage";
import { getFirstName } from "@/lib/competency";
import { apiLogout } from "@/lib/api";

/* React Query */
import { useQuery } from "@tanstack/react-query";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Role = "karyawan" | "admin";

/* ✅ helper: lock UI kalau wajib ganti password */
function useMustChangeLock() {
  const pathname = usePathname();
  const router = useRouter();

  const token = Cookies.get("sgn_token") || null;
  const mustChange = Cookies.get("sgn_must_change_password") === "1";
  const isPasswordPage = pathname === "/dashboard/password";

  React.useEffect(() => {
    if (token && mustChange && !isPasswordPage) {
      router.replace("/dashboard/password");
    }
  }, [token, mustChange, isPasswordPage, router]);

  return {
    locked: !!token && mustChange && !isPasswordPage,
  };
}

function DashboardShell({
  children,
  role: _role, // disiapkan untuk nanti (shared), sekarang belum dipakai
}: {
  children: React.ReactNode;
  role: Role;
}) {
  const pathname = usePathname();

  const isActive = (base: string) =>
    pathname === base || pathname.startsWith(base + "/");

  const { locked } = useMustChangeLock(); // ✅ tambah

  return (
    <div className="h-screen w-full bg-zinc-50 flex flex-col overflow-hidden">
      <TooltipProvider delayDuration={100}>
        {/* === TOP BAR FULL WIDTH === */}
        <TopBarNoSSR />

        {/* === BODY: SIDEBAR + MAIN === */}
        <div className="flex flex-1 overflow-hidden relative">
          {/* ✅ overlay & disable interaksi saat locked */}
          {locked && (
            <div className="absolute inset-0 z-50 bg-white/60 backdrop-blur-[2px]">
              <div className="h-full w-full flex items-center justify-center p-4">
                <div className="max-w-md w-full rounded-xl border border-zinc-200 bg-white p-5 shadow-sm text-center">
                  <div className="text-base font-semibold text-zinc-900">
                    Wajib ganti password
                  </div>
                  <div className="mt-1 text-sm text-zinc-600">
                    Kamu harus mengganti password dulu sebelum mengakses halaman lain.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ✅ wrapper: kalau locked, semua klik mati */}
          <div className={locked ? "pointer-events-none opacity-60 flex flex-1 overflow-hidden" : "flex flex-1 overflow-hidden"}>
            {/* SIDEBAR */}
            <aside
              className={[
                "h-full",
                "w-14 md:w-56",
                "border-r border-zinc-200 bg-white",
                "p-2 md:p-3",
                "flex flex-col",
              ].join(" ")}
            >
              {/* Items */}
              <div className="flex-1 flex flex-col gap-2 md:gap-2.5 overflow-hidden">
                <SidebarItem
                  href="/dashboard"
                  label="Dashboard"
                  active={isActive("/dashboard") && pathname === "/dashboard"}
                  icon={<LayoutDashboard className="h-5 w-5" />}
                />

                <div className="hidden md:block text-[17px] font-semibold uppercase tracking-wide text-zinc-900 mt-1">
                  Overview
                </div>

                <SidebarItem
                  href="/dashboard/hard"
                  label="Hard Competency"
                  active={isActive("/dashboard/hard")}
                  icon={<BarChart className="h-5 w-5" />}
                />
                <SidebarItem
                  href="/dashboard/soft"
                  label="Soft Competency"
                  active={isActive("/dashboard/soft")}
                  icon={<LineChart className="h-5 w-5" />}
                />
              </div>

              {/* Footer */}
              <div className="pt-3 md:pt-4 border-t border-zinc-200">
                <div className="hidden md:block text-[17px] font-semibold uppercase tracking-wide text-zinc-900 mb-2">
                  Settings
                </div>

                <SidebarItem
                  href="/dashboard/profile"
                  label="Profile"
                  active={isActive("/dashboard/profile")}
                  icon={<User className="h-5 w-5" />}
                />

                {/* ini cuma link ke "/" biasa, logout yang bener lewat top bar */}
                <SidebarItem
                  href="/"
                  label="Logout"
                  active={false}
                  icon={<LogOut className="h-5 w-5" />}
                />
              </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 h-full overflow-y-auto bg-white p-4 sm:p-6 md:p-8">
              {children}
            </main>
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
}

/** Layout default untuk /dashboard (karyawan) */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell role="karyawan">{children}</DashboardShell>;
}

/** Sidebar Item (custom div, bukan Button shadcn) */
function SidebarItem({
  href,
  label,
  active,
  icon,
}: {
  href: string;
  label: string;
  active: boolean;
  icon: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link href={href} className="block">
          <div
            className={[
              "w-full flex items-center justify-center md:justify-start gap-2",
              "rounded-md transition-colors duration-200",
              "h-10 md:h-auto md:px-2.5 md:py-2",
              active
                ? "bg-[#05398f] text-white"
                : "text-[#05398f] hover:bg-[#05398f] hover:text-white",
            ].join(" ")}
          >
            {icon}
            <span className="hidden md:inline text-[15px] font-semibold">
              {label}
            </span>
          </div>
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}

/* ===== TOP BAR (Persona Talent + avatar kanan, pakai data user + summary API) ===== */

// helper fetcher untuk React Query
async function fetchProfileSummary(token: string) {
  if (!API_URL) {
    throw new Error("API_URL is not defined");
  }

  const res = await fetch(`${API_URL}/api/dashboard/karyawan/summary`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await res.json().catch(() => ({} as any));

  if (!res.ok) {
    throw new Error(json?.message || "Gagal memuat summary profil");
  }

  return json as any; // shape: { data: { profile: {...}, ... } } atau { profile: {...} }
}

function TopBar() {
  const router = useRouter();

  // dasar dari localStorage (hasil login)
  const baseUser = getUser();
  const token = getToken();

  const { data } = useQuery({
    // ⬇️ masukkan token ke queryKey biar kalau login/logout, re-fetch
    queryKey: ["profile", "me", token],
    queryFn: () => fetchProfileSummary(token as string),
    enabled: !!token && !!API_URL,
    // Biar gampang refresh data setelah invalidation
    staleTime: 0,
  });

  const raw = (data as any) ?? {};
  const profile = raw.data?.profile ?? raw.profile ?? {};

  const name =
    profile.nama_lengkap ?? profile.name ?? baseUser?.name ?? "User";

  const subtitle =
    profile.jabatan_terakhir ??
    profile.jabatan ??
    profile.unit_kerja ??
    baseUser?.jabatan_terakhir ??
    baseUser?.role ??
    baseUser?.unit_kerja ??
    baseUser?.unit ??
    "Karyawan";

  const avatarUrlRaw =
    profile.photo_url ??
    baseUser?.photo_url ??
    baseUser?.profile?.photo_url ??
    null;

  const firstName = getFirstName(name);
  const firstInitial = firstName.charAt(0).toUpperCase() || "U";

  const safeAvatarUrl =
    avatarUrlRaw &&
    typeof avatarUrlRaw === "string" &&
    avatarUrlRaw.trim() !== ""
      ? avatarUrlRaw
      : undefined;

  const handleGoProfile = () => router.push("/dashboard/profile");
  const handleChangePassword = () => router.push("/dashboard/password");

  const handleLogout = async () => {
    try {
      const token = getToken();
      if (token) {
        await apiLogout(token);
      }
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      clearAuth();
      router.push("/login");
    }
  };

  return (
    <div className="flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-4 sm:px-6 md:px-8">
      {/* Nama website kiri, full sampai pojok kiri */}
      <div className="flex items-baseline gap-1 text-lg sm:text-xl font-semibold tracking-tight">
        <span className="text-[#05398f]">Persona</span>
        <span className="text-zinc-900">Talent</span>
      </div>

      {/* Avatar + dropdown kanan */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative h-10 w-10 rounded-full p-0"
          >
            <Avatar className="h-10 w-10 border border-zinc-300 overflow-hidden">
              {safeAvatarUrl && <AvatarImage src={safeAvatarUrl} alt={name} />}
              <AvatarFallback className="flex h-full w-full items-center justify-center rounded-full bg-zinc-200 text-zinc-700 text-sm font-semibold">
                {firstInitial}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span className="text-sm font-medium truncate">{name}</span>
              <span className="text-xs text-muted-foreground truncate">
                {subtitle}
              </span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleGoProfile}>Profile</DropdownMenuItem>
          <DropdownMenuItem onClick={handleChangePassword}>
            Change Password
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

/* Matikan SSR hanya untuk TopBar (ada Radix Dropdown) */
const TopBarNoSSR = dynamic(() => Promise.resolve(TopBar), { ssr: false });
