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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isActive = (base: string) =>
    pathname === base || pathname.startsWith(base + "/");

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
            {/* (header 'PROJECT' dihapus, brand ada di top bar) */}

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

/* ===== TOP BAR (Persona Talent + avatar kanan) ===== */

function TopBar() {
  const router = useRouter();

  const userName = "Muchammad Hardhiaz Maulana Putra";
  const avatarUrl = "/avatar.png";
  const firstInitial = userName.charAt(0).toUpperCase();

  const handleGoProfile = () => router.push("/dashboard/profile");
  const handleChangePassword = () => router.push("/dashboard/password");
  const handleLogout = () => router.push("/");

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
            <Avatar className="h-10 w-10">
              <AvatarImage src={avatarUrl} alt={userName} />
              <AvatarFallback>{firstInitial}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span className="text-sm font-medium truncate">{userName}</span>
              <span className="text-xs text-muted-foreground">Alumni</span>
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
