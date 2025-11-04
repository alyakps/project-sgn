"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (base: string) =>
    pathname === base || pathname.startsWith(base + "/");

  return (
    <div className="min-h-screen w-full bg-zinc-50">
      <div className="flex min-h-screen">
        {/* === SIDEBAR === */}
        <aside className="w-64 shrink-0 bg-white border-r border-zinc-200 p-4">
          <div className="flex h-full flex-col">
            {/* PROJECT */}
            <div className="text-[20px] font-semibold uppercase tracking-wide text-yellow-500">
              Project
            </div>

            {/* DASHBOARD */}
            <div className="mt-4">
              <SidebarItem
                href="/dashboard"
                label="Dashboard"
                active={pathname === "/dashboard"}
                fontSize="text-[19px]"
              />
            </div>

            {/* OVERVIEW */}
            <div className="flex flex-col gap-2 mt-6">
              <div className="text-[21px] font-semibold uppercase tracking-wide text-zinc-900">
                Overview
              </div>

              <SidebarItem
                href="/dashboard/hard"
                label="Hard Competency"
                active={isActive("/dashboard/hard")}
                fontSize="text-[19px]"
              />
              <SidebarItem
                href="/dashboard/soft"
                label="Soft Competency"
                active={isActive("/dashboard/soft")}
                fontSize="text-[19px]"
              />
            </div>

            {/* SETTINGS */}
            <div className="mt-8 border-t border-zinc-200 pt-4 flex flex-col gap-2">
              <div className="text-[21px] font-semibold uppercase tracking-wide text-zinc-900">
                Settings
              </div>

              <SidebarItem
                href="/dashboard/profile"
                label="Profile"
                active={isActive("/dashboard/profile")}
                fontSize="text-[19px]"
              />

              <button
                onClick={() => router.push("/")}
                className="text-[19px] px-3 py-2 rounded-md text-[#05398f] transition-all duration-200 hover:bg-[#05398f] hover:text-white text-left font-normal"
              >
                Logout
              </button>
            </div>
          </div>
        </aside>

        {/* === MAIN === */}
        <main className="flex-1 bg-white p-6 sm:p-8">{children}</main>
      </div>
    </div>
  );
}

/** Sidebar Item */
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
