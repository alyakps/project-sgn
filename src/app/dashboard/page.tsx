"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import ProfileCard from "@/components/dashboard/ProfileCard";
import ProgressSummaryCard from "@/components/dashboard/ProgressSummaryCard";

import type { HardRow, SoftRow } from "@/types/competency";
import { useCompetencyStats } from "@/app/hooks/useCompetencyStats";
import { getFirstName } from "@/lib/competency";

/* ======= USER INFO ======= */
const EMP_NAME = "Andrian Tambunan";
const EMP_AVATAR = "/avatar.png";
const EMP_NO = "5025211018";
const EMP_TITLE = "UX/UI Designer";
const EMP_UNIT = "Divisi Produk Digital";

/* ======= HARD COMPETENCY DATA ======= */
const DATA: HardRow[] = [
  { id: "1", status: "Tercapai", nilai: 92 },
  { id: "2", status: "Tidak Tercapai", nilai: 61 },
  { id: "3", status: "Tercapai", nilai: 95 },
  { id: "4", status: "Tidak Tercapai", nilai: 39 },
];

/* ======= SOFT COMPETENCY DATA ======= */
const SOFT: SoftRow[] = [
  { avg: 88 }, { avg: 80 }, { avg: 78 }, { avg: 84 }, { avg: 86 }, { avg: 75 },
  { avg: 82 }, { avg: 79 }, { avg: 91 }, { avg: 73 }, { avg: 77 }, { avg: 85 },
  { avg: 83 }, { avg: 76 }, { avg: 90 }, { avg: 79 }, { avg: 87 },
];

export default function DashboardPage() {
  const router = useRouter();
  const firstName = getFirstName(EMP_NAME);

  // Hitung ringkasan via hook
  const { hard, soft } = useCompetencyStats(DATA, SOFT);

  return (
    <div className="flex flex-col gap-4">
      {/* Heading */}
      <header className="px-6 sm:px-8 mt-2">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight leading-tight text-zinc-900">
          Welcome, {firstName}
        </h1>
      </header>

      {/* Profile */}
      <ProfileCard
        name={EMP_NAME}
        avatarUrl={EMP_AVATAR}
        empNo={EMP_NO}
        title={EMP_TITLE}
        unit={EMP_UNIT}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ProgressSummaryCard
          title="Progress – Hard Competency"
          totalItems={DATA.length}
          achieved={hard.achieved}
          notAchieved={hard.notAchieved}
          average={hard.average}
          onClick={() => router.push("/dashboard/hard")}
        />

        <ProgressSummaryCard
          title="Progress – Soft Competency"
          totalItems={SOFT.length}
          achieved={soft.achieved}
          notAchieved={soft.notAchieved}
          average={soft.average}
          onClick={() => router.push("/dashboard/soft")}
        />
      </div>
    </div>
  );
}
