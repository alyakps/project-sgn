// src/app/dashboard/page.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

/* ======= ROUTE TARGETS ======= */
const TARGET_HARD = "/dashboard/hard";
const TARGET_SOFT = "/dashboard/soft";

/* ======= USER INFO ======= */
const EMP_NAME = "Andrian Tambunan";
const EMP_AVATAR = "/avatar.png";
const EMP_NO = "5025211018";
const EMP_TITLE = "UX/UI Designer";
const EMP_UNIT = "Divisi Produk Digital";

/* ======= HARD COMPETENCY DATA ======= */
type Row = { id: string; status: "Tercapai" | "Tidak Tercapai"; nilai: number | null };
const DATA: Row[] = [
  { id: "1", status: "Tercapai", nilai: 92 },
  { id: "2", status: "Tidak Tercapai", nilai: 61 },
  { id: "3", status: "Tercapai", nilai: 95 },
  { id: "4", status: "Tidak Tercapai", nilai: 39 },
];

/* ======= SOFT COMPETENCY DATA ======= */
type SoftComp = { avg: number };
const SOFT: SoftComp[] = [
  { avg: 88 }, { avg: 80 }, { avg: 78 }, { avg: 84 }, { avg: 86 }, { avg: 75 },
  { avg: 82 }, { avg: 79 }, { avg: 91 }, { avg: 73 }, { avg: 77 }, { avg: 85 },
  { avg: 83 }, { avg: 76 }, { avg: 90 }, { avg: 79 }, { avg: 87 },
];

/* ======= HELPERS ======= */
const firstName = EMP_NAME.split(" ")[0] ?? EMP_NAME;

const achievedHard = DATA.filter((d) => d.status === "Tercapai").length;
const notAchievedHard = DATA.length - achievedHard;
const hardAvg =
  Math.round(((DATA.reduce((s, r) => s + (r.nilai ?? 0), 0) / DATA.length) || 0) * 10) / 10;

const achievedSoft = SOFT.filter((s) => s.avg >= 70).length;
const notAchievedSoft = SOFT.length - achievedSoft;
const softAvg =
  Math.round(((SOFT.reduce((s, r) => s + (r.avg ?? 0), 0) / SOFT.length) || 0) * 10) / 10;

function avgBoxClass(v: number) {
  if (v >= 86) return "bg-emerald-50 border-emerald-200";
  if (v >= 70) return "bg-amber-50 border-amber-200";
  return "bg-rose-50 border-rose-200";
}
function avgTextClass(v: number) {
  if (v >= 86) return "text-emerald-700";
  if (v >= 70) return "text-amber-700";
  return "text-rose-700";
}

/* ======= PAGE ======= */
export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-4">
      {/* ====== SIMPLE HEADING ====== */}
      <header className="px-6 sm:px-8 mt-2">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight leading-tight text-zinc-900">
          Welcome, {firstName}
        </h1>
      </header>

      {/* ====== ROW 1: PROFILE ====== */}
      <Card className="rounded-xl border border-zinc-200">
        <CardContent className="p-4">
          {/* Desktop: 3 kolom (avatar | nama+NIP | jabatan+unit) */}
          <div className="hidden sm:grid sm:grid-cols-[auto_1fr_1fr] items-center gap-y-4 gap-x-3">
            {/* Avatar */}
            <div className="flex items-center justify-start">
              <Avatar className="h-24 w-24 rounded-full ring-4 ring-white shadow-xl">
                <AvatarImage src={EMP_AVATAR} alt={EMP_NAME} />
                <AvatarFallback>
                  {EMP_NAME.split(" ").map((s) => s[0]).join("").slice(0, 2)}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Kolom tengah */}
            <div className="flex flex-col justify-center pl-4">
              <div>
                <div className="text-[11px] text-zinc-500">Nama</div>
                <div className="text-lg font-semibold text-zinc-900">{EMP_NAME}</div>
              </div>
              <div className="mt-2">
                <div className="text-[11px] text-zinc-500">Employee Number</div>
                <div className="text-sm font-medium">{EMP_NO}</div>
              </div>
            </div>

            {/* Kolom kanan */}
            <div className="flex flex-col justify-center gap-3">
              <div>
                <div className="text-[11px] text-zinc-500">Jabatan</div>
                <div className="text-sm font-medium">{EMP_TITLE}</div>
              </div>
              <div>
                <div className="text-[11px] text-zinc-500">Unit Kerja</div>
                <div className="text-sm font-medium">{EMP_UNIT}</div>
              </div>
            </div>
          </div>

          {/* Mobile: avatar di atas, lalu detail grid 2 kolom (label | value) supaya lurus */}
          <div className="sm:hidden space-y-4">
            <div className="flex justify-start">
              <Avatar className="h-24 w-24 rounded-full ring-4 ring-white shadow-xl">
                <AvatarImage src={EMP_AVATAR} alt={EMP_NAME} />
                <AvatarFallback>
                  {EMP_NAME.split(" ").map((s) => s[0]).join("").slice(0, 2)}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="grid grid-cols-[120px_1fr] gap-x-4 gap-y-2">
              <div className="text-[11px] text-zinc-500">Nama</div>
              <div className="text-base font-semibold text-zinc-900">{EMP_NAME}</div>

              <div className="text-[11px] text-zinc-500">Employee Number</div>
              <div className="text-sm font-medium">{EMP_NO}</div>

              <div className="text-[11px] text-zinc-500">Jabatan</div>
              <div className="text-sm font-medium">{EMP_TITLE}</div>

              <div className="text-[11px] text-zinc-500">Unit Kerja</div>
              <div className="text-sm font-medium">{EMP_UNIT}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ====== ROW 2: HARD & SOFT ====== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* HARD */}
        <Link href={TARGET_HARD} className="group block focus:outline-none">
          <Card className="rounded-xl border border-zinc-200 transition ring-0 group-hover:ring-2 group-hover:ring-violet-300">
            <CardContent className="pt-2 pb-2 px-4 sm:pt-3 sm:pb-3">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-[15px] sm:text-base font-semibold text-zinc-900">
                  Progress – Hard Competency
                </h2>
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-700">
                  {DATA.length} item
                </span>
              </div>

              <div className="mb-2 flex items-center gap-4 text-[11px] text-zinc-600">
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" /> High (86–100)
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-amber-500" /> Middle (70–85)
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-rose-500" /> Low (0–69)
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg border p-3">
                  <div className="text-[11px] text-zinc-500">Tercapai</div>
                  <div className="text-lg font-semibold text-emerald-600">{achievedHard}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-[11px] text-zinc-500">Tidak Tercapai</div>
                  <div className="text-lg font-semibold text-amber-600">{notAchievedHard}</div>
                </div>
                <div className={`rounded-lg border p-3 ${avgBoxClass(hardAvg)}`}>
                  <div className="text-[11px] text-zinc-600">Rata-rata</div>
                  <div className={`text-lg font-semibold ${avgTextClass(hardAvg)}`}>{hardAvg}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* SOFT */}
        <Link href={TARGET_SOFT} className="group block focus:outline-none">
          <Card className="rounded-xl border border-zinc-200 transition ring-0 group-hover:ring-2 group-hover:ring-violet-300">
            <CardContent className="pt-2 pb-2 px-4 sm:pt-3 sm:pb-3">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-[15px] sm:text-base font-semibold text-zinc-900">
                  Progress – Soft Competency
                </h2>
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-700">
                  {SOFT.length} item
                </span>
              </div>

              <div className="mb-2 flex items-center gap-4 text-[11px] text-zinc-600">
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" /> High (86–100)
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-amber-500" /> Middle (70–85)
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-rose-500" /> Low (0–69)
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg border p-3">
                  <div className="text-[11px] text-zinc-500">Tercapai</div>
                  <div className="text-lg font-semibold text-emerald-600">{achievedSoft}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-[11px] text-zinc-500">Tidak Tercapai</div>
                  <div className="text-lg font-semibold text-amber-600">{notAchievedSoft}</div>
                </div>
                <div className={`rounded-lg border p-3 ${avgBoxClass(softAvg)}`}>
                  <div className="text-[11px] text-zinc-600">Rata-rata</div>
                  <div className={`text-lg font-semibold ${avgTextClass(softAvg)}`}>{softAvg}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
