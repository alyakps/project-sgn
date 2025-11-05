// src/app/dashboard/layout.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  LineChart,
  BarChart,
  User,
  LogOut,
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isActive = (base: string) =>
    pathname === base || pathname.startsWith(base + "/");

  return (
    // body wrapper: full height, cegah scroll horizontal
    <div className="h-screen w-full bg-zinc-50 overflow-hidden">
      <TooltipProvider delayDuration={100}>
        {/* === FIXED SIDEBAR === */}
        <aside
          className={[
            "fixed inset-y-0 left-0 z-40",
            "w-16 md:w-64",
            "border-r border-zinc-200 bg-white",
            "p-2 md:p-4",
            "flex flex-col",
          ].join(" ")}
        >
          {/* Header */}
          <div className="flex items-center justify-center md:justify-start mb-3 md:mb-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-yellow-400 text-zinc-900 font-bold md:hidden">
              P
            </div>
            <div className="hidden md:block text-xl font-semibold uppercase tracking-wide text-yellow-500">
              Project
            </div>
          </div>

          {/* Items (pakai flex-1 supaya footer selalu nempel bawah) */}
          <div className="flex-1 flex flex-col gap-2 md:gap-3 overflow-hidden">
            <SidebarItem
              href="/dashboard"
              label="Dashboard"
              active={isActive("/dashboard") && pathname === "/dashboard"}
              icon={<LayoutDashboard className="h-5 w-5" />}
            />

            <div className="hidden md:block text-[21px] font-semibold uppercase tracking-wide text-zinc-900 mt-1">
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

          {/* Footer / Settings SELALU di bawah sidebar, tetap kelihatan */}
          <div className="pt-3 md:pt-4 border-t border-zinc-200">
            <div className="hidden md:block text-[21px] font-semibold uppercase tracking-wide text-zinc-900 mb-2">
              Settings
            </div>

            <SidebarItem
              href="/dashboard/profile"
              label="Profile"
              active={isActive("/dashboard/profile")}
              icon={<User className="h-5 w-5" />}
            />

            {/* Logout now reuses SidebarItem so styling matches exactly */}
            <SidebarItem
              href="/"
              label="Logout"
              active={false}
              icon={<LogOut className="h-5 w-5" />}
            />
          </div>
        </aside>

        {/* === MAIN: digeser sesuai lebar sidebar, hanya main yang scroll === */}
        <main className="h-screen ml-16 md:ml-64 overflow-y-auto bg-white p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </TooltipProvider>
    </div>
  );
}

/** Sidebar Item */
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
        <Link href={href}>
          <Button
            variant={active ? "default" : "ghost"}
            className={[
              "w-full flex items-center justify-center md:justify-start gap-2",
              "rounded-md transition-all duration-200",
              active
                ? "bg-[#05398f] text-white hover:bg-[#042E71]"
                : "text-[#05398f] hover:bg-[#05398f] hover:text-white",
              "h-10 md:h-auto md:px-3 md:py-2",
            ].join(" ")}
          >
            {icon}
            <span className="hidden md:inline text-[17px] font-semibold">
              {label}
            </span>
          </Button>
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}
