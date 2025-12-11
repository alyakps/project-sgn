"use client";

import * as React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
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

type DashboardShellProps = {
  children: React.ReactNode;
  role: Role;
};

export function DashboardShell({ children, role }: DashboardShellProps) {
  const pathname = usePathname();

  const isActive = (base: string) =>
    pathname === base || pathname.startsWith(base + "/");

  // === CONFIG SIDEBAR BERDASARKAN ROLE ===
  const overviewItems =
    role === "karyawan"
      ? [
          {
            href: "/dashboard",
            label: "Dashboard",
            checkActive: () =>
              isActive("/dashboard") && pathname === "/dashboard",
            icon: <LayoutDashboard className="h-5 w-5" />,
          },
          {
            href: "/dashboard/hard",
            label: "Hard Competency",
            checkActive: () => isActive("/dashboard/hard"),
            icon: <BarChart className="h-5 w-5" />,
          },
          {
            href: "/dashboard/soft",
            label: "Soft Competency",
            checkActive: () => isActive("/dashboard/soft"),
            icon: <LineChart className="h-5 w-5" />,
          },
        ]
      : [
          {
            href: "/admin",
            label: "Dashboard",
            checkActive: () =>
              isActive("/admin") && pathname === "/admin",
            icon: <LayoutDashboard className="h-5 w-5" />,
          },
          {
            href: "/admin/data-entry",
            label: "Data Entry",
            checkActive: () => isActive("/admin/data-entry"),
            icon: <BarChart className="h-5 w-5" />,
          },
          {
            href: "/admin/hard",
            label: "Hard Competency",
            checkActive: () => isActive("/admin/hard"),
            icon: <BarChart className="h-5 w-5" />,
          },
          {
            href: "/admin/soft",
            label: "Soft Competency",
            checkActive: () => isActive("/admin/soft"),
            icon: <LineChart className="h-5 w-5" />,
          },
          {
            href: "/admin/users",
            label: "User Management",
            checkActive: () => isActive("/admin/users"),
            icon: <User className="h-5 w-5" />,
          },
        ];

  // Settings di sidebar:
  // - Karyawan: Profile + Logout
  // - Admin: hanya Logout (Profile dihapus dari sidebar)
  const settingsItems =
    role === "admin"
      ? [
          {
            href: "/",
            label: "Logout",
            checkActive: () => false,
            icon: <LogOut className="h-5 w-5" />,
          },
        ]
      : [
          {
            href: "/dashboard/profile",
            label: "Profile",
            checkActive: () => isActive("/dashboard/profile"),
            icon: <User className="h-5 w-5" />,
          },
          {
            href: "/",
            label: "Logout",
            checkActive: () => false,
            icon: <LogOut className="h-5 w-5" />,
          },
        ];

  return (
    <div className="h-screen w-full bg-zinc-50 flex flex-col overflow-hidden">
      <TooltipProvider delayDuration={100}>
        {/* === TOP BAR FULL WIDTH === */}
        <TopBarNoSSR />

        {/* === BODY: SIDEBAR + MAIN === */}
        <div className="flex flex-1 overflow-hidden">
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
              {/* ✅ Overview title sekarang di ATAS menu */}
              <div className="hidden md:block text-[17px] font-semibold uppercase tracking-wide text-zinc-900 mb-2">
                Overview
              </div>

              {overviewItems.map((item) => (
                <SidebarItem
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  active={item.checkActive()}
                  icon={item.icon}
                />
              ))}
            </div>

            {/* Footer */}
            <div className="pt-3 md:pt-4 border-t border-zinc-200">
              <div className="hidden md:block text-[17px] font-semibold uppercase tracking-wide text-zinc-900 mb-2">
                Settings
              </div>

              {settingsItems.map((item) => (
                <SidebarItem
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  active={item.checkActive()}
                  icon={item.icon}
                />
              ))}
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <main className="flex-1 h-full overflow-y-auto bg-white p-4 sm:p-6 md:p-8">
            {children}
          </main>
        </div>
      </TooltipProvider>
    </div>
  );
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

  // role dipakai untuk mengatur dropdown (admin vs karyawan)
  const role = (baseUser?.role as Role | undefined) ?? "karyawan";

  const { data } = useQuery({
    queryKey: ["profile", "me", token],
    queryFn: () => fetchProfileSummary(token as string),
    enabled: !!token && !!API_URL,
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

          {/* Dropdown:
              - Karyawan: Profile + Change Password + Logout
              - Admin:    Change Password + Logout (Profile di-hide)
           */}
          {role !== "admin" && (
            <DropdownMenuItem onClick={handleGoProfile}>
              Profile
            </DropdownMenuItem>
          )}
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
