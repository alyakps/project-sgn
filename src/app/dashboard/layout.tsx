"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background sugarcane blur */}
      <Image
        src="/sugarcane.png"
        alt="Sugarcane background"
        fill
        priority
        className="object-cover blur-[8px] brightness-[0.9]"
      />

      {/* Overlay putih lembut */}
      <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px]" />

      {/* Layout floating */}
      <div className="relative z-10 flex min-h-screen w-full p-4 sm:p-8 lg:p-12 gap-8">
        {/* === SIDEBAR === */}
        <Card className="w-56 shrink-0 bg-white/80 backdrop-blur-md shadow-[0_20px_60px_rgba(0,0,0,0.12)] ring-1 ring-black/5 rounded-xl border-none flex flex-col justify-between">
          <CardContent className="flex flex-col justify-between h-full p-4">
            <div className="flex flex-col gap-6">
              {/* PROJECT title */}
              <div>
                <div className="text-[20px] font-semibold uppercase tracking-wide text-yellow-500">
                  Project
                </div>
              </div>

              {/* OVERVIEW */}
              <div className="flex flex-col gap-2">
                <div className="text-[21px] font-semibold uppercase tracking-wide text-zinc-900">
                  Overview
                </div>

                <SidebarItem
                  href="/dashboard/hard"
                  label="Hard Competency"
                  active={pathname === "/dashboard/hard/page"}
                  fontSize="text-[19px]"
                />

                <SidebarItem
                  href="/dashboard/soft"
                  label="Soft Competency"
                  active={pathname === "/dashboard/soft/page"}
                  fontSize="text-[19px]"
                />
              </div>
            </div>

            {/* SETTINGS + Footer */}
            <div className="flex flex-col gap-4 mt-8 border-t border-zinc-200 pt-4">
              <div className="flex flex-col gap-2">
                <div className="text-[21px] font-semibold uppercase tracking-wide text-zinc-900">
                  Settings
                </div>

                <SidebarItem
                  href="/dashboard/profile"
                  label="Profile"
                  active={pathname === "/dashboard/profile"}
                  fontSize="text-[19px]"
                />

                {/* ✅ Logout tanpa bulatan & non-bold */}
                <button
                  onClick={() => router.push("/")}
                  className="text-[19px] px-3 py-2 rounded-md text-[#05398f] transition-all duration-200 hover:bg-[#05398f] hover:text-white text-left font-normal"
                >
                  Logout
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* === MAIN CONTENT PANEL === */}
        <Card className="flex-1 bg-white/80 backdrop-blur-md shadow-[0_20px_60px_rgba(0,0,0,0.12)] ring-1 ring-black/5 border-none rounded-xl">
          <CardContent className="p-6 sm:p-8 h-full">{children}</CardContent>
        </Card>
      </div>
    </div>
  );
}

/**
 * Sidebar Item component
 */
function SidebarItem({
  href,
  label,
  active,
  fontSize = "text-[11px]",
}: {
  href: string;
  label: string;
  active: boolean;
  fontSize?: string;
}) {
  return (
    <Link
      href={href}
      className={[
        `flex items-start gap-2 ${fontSize} leading-[1.2] cursor-pointer transition-all duration-200`,
        active
          ? "bg-[#05398f] text-white px-3 py-2 rounded-md font-semibold shadow-sm"
          : "text-[#05398f] hover:bg-[#05398f] hover:text-white px-3 py-2 rounded-md",
      ].join(" ")}
    >
      <span className="whitespace-nowrap">{label}</span>
    </Link>
  );
}
