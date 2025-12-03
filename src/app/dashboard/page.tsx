"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

import ProgressSummaryCard from "@/components/dashboard/ProgressSummaryCard";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { getUser, getToken, clearAuth } from "@/lib/auth-storage";
import { apiKaryawanSummary } from "@/lib/api";
import { getFirstName } from "@/lib/competency";

type SummaryBox = {
  total: number;
  tercapai: number;
  tidakTercapai: number;
  avg: number;
};

function DashboardPage() {
  const router = useRouter();

  const [loadingAuth, setLoadingAuth] = React.useState(true);
  const [loadingSummary, setLoadingSummary] = React.useState(false);
  const [errorSummary, setErrorSummary] = React.useState<string | null>(null);

  // 🔹 Tahun Hard & Soft dipisah (list tahun juga dipisah)
  const [yearOptionsHard, setYearOptionsHard] = React.useState<number[]>([]);
  const [yearOptionsSoft, setYearOptionsSoft] = React.useState<number[]>([]);

  const [yearHard, setYearHard] = React.useState<"all" | number>("all");
  const [yearSoft, setYearSoft] = React.useState<"all" | number>("all");

  // ==== DATA USER ====
  const [userName, setUserName] = React.useState<string>("Karyawan");
  const [empNo, setEmpNo] = React.useState<string>("-");
  const [empTitle, setEmpTitle] = React.useState<string>("Karyawan");
  const [empUnit, setEmpUnit] = React.useState<string>("Unit / Divisi");
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);

  // ==== DATA SUMMARY ====
  const [hardSummary, setHardSummary] = React.useState<SummaryBox>({
    total: 0,
    tercapai: 0,
    tidakTercapai: 0,
    avg: 0,
  });

  const [softSummary, setSoftSummary] = React.useState<SummaryBox>({
    total: 0,
    tercapai: 0,
    tidakTercapai: 0,
    avg: 0,
  });

  // ========= CEK LOGIN & ROLE =========
  React.useEffect(() => {
    const token = getToken();
    const user = getUser();

    if (!token || !user) {
      clearAuth();
      router.push("/login");
      return;
    }

    if (user.role && user.role !== "karyawan") {
      router.push("/admin/dashboard");
      return;
    }

    setUserName(user.name || "Karyawan");
    setEmpNo(user.nik || "-");
    setEmpTitle(user.jabatan_terakhir || user.role || "Karyawan");
    setEmpUnit(user.unit || "Unit / Divisi");

    if (user.photo_url) {
      setAvatarUrl(user.photo_url);
    } else if (user.profile?.photo_url) {
      setAvatarUrl(user.profile.photo_url);
    } else {
      setAvatarUrl(null);
    }

    setLoadingAuth(false);
  }, [router]);

  // 🔧 Helper: normalisasi list tahun dari field apa pun
  function normalizeYears(raw: any): number[] {
    const arr = Array.isArray(raw) ? raw : [];
    const nums = arr
      .map((v) => Number(v))
      .filter((v) => !Number.isNaN(v));

    // urut desc biar tahun terbaru di atas
    nums.sort((a, b) => b - a);
    return nums;
  }

  // 🔧 Helper: panggil summary untuk tahun tertentu
  const fetchSummary = React.useCallback(
    async (tahun: "all" | number) => {
      const token = getToken();
      if (!token) return null;
      const data = await apiKaryawanSummary(token, tahun);
      return data;
    },
    []
  );

  /**
   * 🔹 Load awal dashboard:
   * - pakai tahun "all" → isi awal summary + list tahun
   */
  React.useEffect(() => {
    if (loadingAuth) return;

    (async () => {
      try {
        setLoadingSummary(true);
        setErrorSummary(null);

        const data: any = await fetchSummary("all");
        if (!data) return;

        const profile = data.profile ?? {};
        if (profile.name) setUserName(profile.name);
        if (profile.nik) setEmpNo(profile.nik);
        if (profile.jabatan) setEmpTitle(profile.jabatan);
        if (profile.unit_kerja) setEmpUnit(profile.unit_kerja);
        setAvatarUrl(profile.photo_url || null);

        // 🔹 Tahun per tipe (kalau backend sudah kirim per-type, kita pakai itu)
        const yearsHard = normalizeYears(
          data.available_years_hard ?? data.available_years ?? []
        );
        const yearsSoft = normalizeYears(
          data.available_years_soft ?? data.available_years ?? []
        );

        setYearOptionsHard(yearsHard);
        setYearOptionsSoft(yearsSoft);

        const hard = data.hard_competency ?? {};
        const hardStatus = hard.status_counts ?? {};
        setHardSummary({
          total: Number(hard.total ?? 0),
          tercapai: Number(hardStatus.tercapai ?? 0),
          tidakTercapai: Number(hardStatus.tidak_tercapai ?? 0),
          avg: Number(hard.avg_nilai ?? 0),
        });

        const soft = data.soft_competency ?? {};
        const softStatus = soft.status_counts ?? {};
        setSoftSummary({
          total: Number(soft.total ?? 0),
          tercapai: Number(softStatus.tercapai ?? 0),
          tidakTercapai: Number(softStatus.tidak_tercapai ?? 0),
          avg: Number(soft.avg_nilai ?? 0),
        });

        setYearHard("all");
        setYearSoft("all");
      } catch (err: any) {
        console.error(err);
        setErrorSummary(err.message || "Gagal mengambil summary");
      } finally {
        setLoadingSummary(false);
      }
    })();
  }, [loadingAuth, fetchSummary]);

  const firstName = getFirstName(userName);

  const selectValueHard =
    yearHard === "all" ? "all" : String(yearHard ?? "all");
  const selectValueSoft =
    yearSoft === "all" ? "all" : String(yearSoft ?? "all");

  if (loadingAuth) {
    return (
      <div className="flex min-h-[200px] items-center justify-center text-sm text-muted-foreground">
        Memuat dashboard...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-4">
        <header>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight leading-tight text-zinc-900">
            Welcome, {firstName}
          </h1>
        </header>

        {errorSummary && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {errorSummary}
          </p>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* 🔵 HARD SUMMARY CARD */}
          <ProgressSummaryCard
            title="Progress – Hard Competency"
            totalItems={hardSummary.total}
            achieved={hardSummary.tercapai}
            notAchieved={hardSummary.tidakTercapai}
            average={hardSummary.avg}
            onClick={() => router.push("/dashboard/hard")}
            filterSlot={
              <div className="flex items-center gap-2">
                <Label
                  htmlFor="year-filter-hard"
                  className="text-xs text-muted-foreground"
                >
                  Year
                </Label>
                <Select
                  value={selectValueHard}
                  onValueChange={async (v) => {
                    const tahun = v === "all" ? "all" : Number(v);
                    setYearHard(tahun);

                    try {
                      setLoadingSummary(true);
                      setErrorSummary(null);

                      const data: any = await fetchSummary(tahun);
                      if (!data) return;

                      const yearsHard = normalizeYears(
                        data.available_years_hard ??
                          data.available_years ??
                          []
                      );
                      setYearOptionsHard(yearsHard);

                      const hard = data.hard_competency ?? {};
                      const hardStatus = hard.status_counts ?? {};
                      setHardSummary({
                        total: Number(hard.total ?? 0),
                        tercapai: Number(hardStatus.tercapai ?? 0),
                        tidakTercapai: Number(
                          hardStatus.tidak_tercapai ?? 0
                        ),
                        avg: Number(hard.avg_nilai ?? 0),
                      });

                      // 🔸 Soft tidak diutak-atik di sini
                    } catch (err: any) {
                      console.error(err);
                      setErrorSummary(
                        err.message || "Gagal mengambil summary hard"
                      );
                    } finally {
                      setLoadingSummary(false);
                    }
                  }}
                  disabled={loadingSummary || yearOptionsHard.length === 0}
                >
                  <SelectTrigger id="year-filter-hard" className="h-8 w-28">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent align="end">
                    {/* ✅ "All" selalu ada */}
                    <SelectItem value="all">All</SelectItem>

                    {yearOptionsHard.map((y) => (
                      <SelectItem key={y} value={String(y)}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            }
          />

          {/* 🟣 SOFT SUMMARY CARD */}
          <ProgressSummaryCard
            title="Progress – Soft Competency"
            totalItems={softSummary.total}
            achieved={softSummary.tercapai}
            notAchieved={softSummary.tidakTercapai}
            average={softSummary.avg}
            onClick={() => router.push("/dashboard/soft")}
            filterSlot={
              <div className="flex items-center gap-2">
                <Label
                  htmlFor="year-filter-soft"
                  className="text-xs text-muted-foreground"
                >
                  Year
                </Label>
                <Select
                  value={selectValueSoft}
                  onValueChange={async (v) => {
                    const tahun = v === "all" ? "all" : Number(v);
                    setYearSoft(tahun);

                    try {
                      setLoadingSummary(true);
                      setErrorSummary(null);

                      const data: any = await fetchSummary(tahun);
                      if (!data) return;

                      const yearsSoft = normalizeYears(
                        data.available_years_soft ??
                          data.available_years ??
                          []
                      );
                      setYearOptionsSoft(yearsSoft);

                      const soft = data.soft_competency ?? {};
                      const softStatus = soft.status_counts ?? {};
                      setSoftSummary({
                        total: Number(soft.total ?? 0),
                        tercapai: Number(softStatus.tercapai ?? 0),
                        tidakTercapai: Number(
                          softStatus.tidak_tercapai ?? 0
                        ),
                        avg: Number(soft.avg_nilai ?? 0),
                      });

                      // 🔸 Hard tidak diubah di sini
                    } catch (err: any) {
                      console.error(err);
                      setErrorSummary(
                        err.message || "Gagal mengambil summary soft"
                      );
                    } finally {
                      setLoadingSummary(false);
                    }
                  }}
                  disabled={loadingSummary || yearOptionsSoft.length === 0}
                >
                  <SelectTrigger id="year-filter-soft" className="h-8 w-28">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent align="end">
                    {/* ✅ "All" selalu ada */}
                    <SelectItem value="all">All</SelectItem>

                    {yearOptionsSoft.map((y) => (
                      <SelectItem key={y} value={String(y)}>
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

export default dynamic(() => Promise.resolve(DashboardPage), {
  ssr: false,
});
