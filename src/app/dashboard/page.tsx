"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import ProfileCard from "@/components/dashboard/ProfileCard";
import ProgressSummaryCard from "@/components/dashboard/ProgressSummaryCard";

import type { HardRow, SoftRow } from "@/types/competency";
import { useCompetencyStats } from "@/app/hooks/useCompetencyStats";
import { getFirstName } from "@/lib/competency";

/* shadcn/ui */
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

/* ======= USER INFO ======= */
const EMP_NAME = "Muchammad Hardhiaz Maulana Putra";
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

/* ======= YEAR FILTER ======= */
const YEAR_OPTIONS = ["All", "2022", "2023", "2024"] as const;
const HARD_YEAR: (typeof YEAR_OPTIONS)[number][] = ["2022", "2023", "2023", "2024"];
const SOFT_YEAR: (typeof YEAR_OPTIONS)[number][] = [
  "2022","2022","2022","2023","2023","2023",
  "2023","2023","2024","2024","2024","2024",
  "2024","2024","2024","2024","2024",
];

export default function DashboardPage() {
  const router = useRouter();
  const firstName = getFirstName(EMP_NAME);

  // filter per card
  const [yearHard, setYearHard] = React.useState<(typeof YEAR_OPTIONS)[number]>("All");
  const [yearSoft, setYearSoft] = React.useState<(typeof YEAR_OPTIONS)[number]>("All");

  const filteredHard = React.useMemo(
    () => DATA.filter((_, i) => yearHard === "All" || HARD_YEAR[i] === yearHard),
    [yearHard]
  );
  const filteredSoft = React.useMemo(
    () => SOFT.filter((_, i) => yearSoft === "All" || SOFT_YEAR[i] === yearSoft),
    [yearSoft]
  );

  const { hard, soft } = useCompetencyStats(filteredHard, filteredSoft);

  return (
    <div className="flex flex-col gap-4">
      {/* ===== WRAPPER KONTEN ===== */}
      <div className="px-6 sm:px-8 mt-2 space-y-4">
        {/* Heading */}
        <header>
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
          {/* HARD */}
          <ProgressSummaryCard
            title="Progress – Hard Competency"
            totalItems={filteredHard.length}
            achieved={hard.achieved}
            notAchieved={hard.notAchieved}
            average={hard.average}
            onClick={() => router.push("/dashboard/hard")}
            filterSlot={
              <div className="flex items-center gap-2">
                <Label htmlFor="year-hard" className="text-xs text-muted-foreground">
                  Year
                </Label>
                <Select value={yearHard} onValueChange={(v) => setYearHard(v as any)}>
                  <SelectTrigger id="year-hard" className="h-8 w-28">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent align="end">
                    {YEAR_OPTIONS.map((y) => (
                      <SelectItem key={y} value={y}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            }
          />

          {/* SOFT */}
          <ProgressSummaryCard
            title="Progress – Soft Competency"
            totalItems={filteredSoft.length}
            achieved={soft.achieved}
            notAchieved={soft.notAchieved}
            average={soft.average}
            onClick={() => router.push("/dashboard/soft")}
            filterSlot={
              <div className="flex items-center gap-2">
                <Label htmlFor="year-soft" className="text-xs text-muted-foreground">
                  Year
                </Label>
                <Select value={yearSoft} onValueChange={(v) => setYearSoft(v as any)}>
                  <SelectTrigger id="year-soft" className="h-8 w-28">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent align="end">
                    {YEAR_OPTIONS.map((y) => (
                      <SelectItem key={y} value={y}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
}
