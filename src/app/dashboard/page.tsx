"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

import ProfileCard from "@/components/dashboard/ProfileCard";
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
  const [loadingSummary, setLoadingSummary] = React.useState(true);
  const [errorSummary, setErrorSummary] = React.useState<string | null>(null);

  // ==== FILTER TAHUN ====
  const [yearOptions, setYearOptions] = React.useState<number[]>([]);
  const [selectedYear, setSelectedYear] = React.useState<"all" | number>("all");

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

    // kalau di local storage sudah ada foto, pakai dulu
    if (user.photo_url) {
      setAvatarUrl(user.photo_url);
    } else if (user.profile?.photo_url) {
      setAvatarUrl(user.profile.photo_url);
    } else {
      setAvatarUrl(null);
    }

    setLoadingAuth(false);
  }, [router]);

  // ========= AMBIL SUMMARY (bisa dipanggil ulang waktu ganti tahun) =========
  const loadSummary = React.useCallback(
    async (tahun: "all" | number) => {
      const token = getToken();
      if (!token) return;

      setLoadingSummary(true);
      setErrorSummary(null);

      try {
        const data: any = await apiKaryawanSummary(token, tahun);

        const profile = data.profile ?? {};

        if (profile.name) setUserName(profile.name);
        if (profile.nik) setEmpNo(profile.nik);
        if (profile.jabatan) setEmpTitle(profile.jabatan);
        if (profile.unit_kerja) setEmpUnit(profile.unit_kerja);

        if (profile.photo_url) {
          setAvatarUrl(profile.photo_url);
        } else {
          setAvatarUrl(null);
        }

        const yearsFromApi: number[] = (data.available_years ?? []).map(
          (y: any) => Number(y)
        );
        setYearOptions(yearsFromApi);

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
      } catch (err: any) {
        console.error(err);
        setErrorSummary(err.message || "Gagal mengambil summary");
      } finally {
        setLoadingSummary(false);
      }
    },
    []
  );

  // pertama kali: all year
  React.useEffect(() => {
    if (!loadingAuth) {
      loadSummary("all");
    }
  }, [loadingAuth, loadSummary]);

  const firstName = getFirstName(userName);
  const selectValue =
    selectedYear === "all" ? "all" : String(selectedYear ?? "all");

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

        {/* 🔹 Di sini pakai avatarUrl dari state, BUKAN "/avatar.png" */}
        <ProfileCard
          name={userName}
          avatarUrl={avatarUrl}
          empNo={empNo}
          title={empTitle}
          unit={empUnit}
        />

        {errorSummary && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {errorSummary}
          </p>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                  htmlFor="year-filter"
                  className="text-xs text-muted-foreground"
                >
                  Year
                </Label>
                <Select
                  value={selectValue}
                  onValueChange={async (v) => {
                    const tahun = v === "all" ? "all" : Number(v);
                    setSelectedYear(tahun);
                    await loadSummary(tahun);
                  }}
                  disabled={loadingSummary || yearOptions.length === 0}
                >
                  <SelectTrigger id="year-filter" className="h-8 w-28">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent align="end">
                    {yearOptions.length > 1 && (
                      <SelectItem value="all">All</SelectItem>
                    )}
                    {yearOptions.map((y) => (
                      <SelectItem key={y} value={String(y)}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            }
          />

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
                  value={selectValue}
                  onValueChange={async (v) => {
                    const tahun = v === "all" ? "all" : Number(v);
                    setSelectedYear(tahun);
                    await loadSummary(tahun);
                  }}
                  disabled={loadingSummary || yearOptions.length === 0}
                >
                  <SelectTrigger id="year-filter-soft" className="h-8 w-28">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent align="end">
                    {yearOptions.length > 1 && (
                      <SelectItem value="all">All</SelectItem>
                    )}
                    {yearOptions.map((y) => (
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
