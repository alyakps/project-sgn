"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectValue,
  SelectItem,
} from "@/components/ui/select";

import { getToken, getUser, clearAuth } from "@/lib/auth-storage";
import { apiKaryawanHardList } from "@/lib/api";

type Row = {
  idKey: string;       // key internal utk React & toggle
  displayId: string;   // ditampilkan di detail
  kode: string;
  nama: string;
  jobFamily: string;
  subJob: string;
  status: string;      // disimpan lowercase dari API
  nilai: number | null;
  deskripsi: string;
};

const pillClass = (s?: string | null) => {
  const lower = (s ?? "").toLowerCase();
  const base =
    "inline-flex items-center rounded-full px-3 py-1 text-[13px] font-medium ring-1";
  if (lower === "tercapai") {
    return `${base} bg-emerald-50 text-emerald-700 ring-emerald-200`;
  }
  if (lower === "tidak tercapai") {
    return `${base} bg-amber-50 text-amber-700 ring-amber-200`;
  }
  return `${base} bg-zinc-50 text-zinc-700 ring-zinc-200`;
};

function formatStatus(status: string | null | undefined) {
  if (!status) return "–";
  const lower = status.toLowerCase();
  if (lower === "tercapai") return "Tercapai";
  if (lower === "tidak tercapai") return "Tidak Tercapai";
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

export default function HardCompetencyPage() {
  const router = useRouter();

  const [rows, setRows] = React.useState<Row[]>([]);
  const [openSet, setOpenSet] = React.useState<Set<string>>(new Set());

  const [yearOptions, setYearOptions] = React.useState<number[]>([]);
  const [selectedYear, setSelectedYear] = React.useState<"all" | number>("all");

  const [loadingAuth, setLoadingAuth] = React.useState(true);
  const [loadingData, setLoadingData] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // ===== CEK LOGIN & ROLE =====
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

    setLoadingAuth(false);
  }, [router]);

  // ===== LOAD DATA API =====
  const loadData = React.useCallback(
    async (tahun: "all" | number) => {
      const token = getToken();
      if (!token) return;

      setLoadingData(true);
      setError(null);

      try {
        const res = await apiKaryawanHardList(token, tahun);
        const anyRes: any = res; // <- supaya bebas akses data / years / dll

        const items = anyRes.items ?? anyRes.data ?? [];

        const mapped: Row[] = items.map((item: any) => {
          const rawId =
            item.id_kompetensi ??
            item.id ??
            item.single_id ??
            null;

          return {
            idKey:
              rawId
                ? String(rawId)
                : item.kode ??
                  item.kode_kompetensi ??
                  Math.random().toString(36).slice(2),
            displayId: rawId ? String(rawId) : "-",
            kode: item.kode_kompetensi ?? item.kode ?? "–",
            nama: item.nama_kompetensi ?? item.nama ?? "–",
            jobFamily:
              item.job_family_kompetensi ??
              item.job_family ??
              "–",
            subJob:
              item.sub_job_family_kompetensi ??
              item.sub_job ??
              "–",
            status: (item.status ?? "").toLowerCase(),
            nilai:
              item.nilai !== undefined && item.nilai !== null
                ? Number(item.nilai)
                : null,
            deskripsi:
              item.deskripsi ??
              item.deskripsi_kompetensi ??
              "Belum ada deskripsi kompetensi.",
          };
        });

        setRows(mapped);

        const yearsFromApi: number[] = (
          anyRes.available_years ??
          anyRes.years ??
          []
        ).map((y: any) => Number(y));

        setYearOptions(yearsFromApi);
        setOpenSet(new Set());
      } catch (err: any) {
        console.error(err);
        setError(err?.message || "Gagal memuat data Hard Competency.");
      } finally {
        setLoadingData(false);
      }
    },
    []
  );

  React.useEffect(() => {
    if (!loadingAuth) {
      loadData("all");
    }
  }, [loadingAuth, loadData]);

  const toggleRow = (idKey: string) =>
    setOpenSet((prev) => {
      const next = new Set(prev);
      next.has(idKey) ? next.delete(idKey) : next.add(idKey);
      return next;
    });

  const yearSelectValue =
    selectedYear === "all" ? "all" : String(selectedYear ?? "all");

  if (loadingAuth) {
    return (
      <div className="flex min-h-[200px] items-center justify-center text-sm text-muted-foreground">
        Memuat...
      </div>
    );
  }

  const effectiveYearOptions = yearOptions.length > 0 ? yearOptions : [];

  return (
    <section className="flex flex-col gap-3 overflow-visible">
      {/* Header + filter tahun */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:p-5 pb-0">
        <h2 className="text-lg sm:text-xl font-semibold">Hard Competency</h2>

        <div className="relative z-20">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-zinc-700">Tahun:</span>
            <Select
              value={yearSelectValue}
              onValueChange={async (v) => {
                const tahun = v === "all" ? "all" : Number(v);
                setSelectedYear(tahun);
                await loadData(tahun);
              }}
              disabled={loadingData}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent position="popper" className="z-50">
                <SelectItem value="all">All</SelectItem>
                {effectiveYearOptions.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {error && (
        <div className="mx-4 sm:mx-6 -mt-1 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs sm:text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Tabel + detail */}
      <div className="p-4 sm:p-6">
        <div className="-mx-3 sm:mx-0">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm sm:text-[15px]">
              <thead>
                <tr className="text-zinc-700 border-b">
                  <th className="py-3 px-2 text-center w-[60px]">No</th>
                  <th className="py-3 px-2 text-left">Kompetensi</th>
                  <th className="py-3 px-2 text-center w-[140px]">Status</th>
                  <th className="py-3 px-2 text-center w-[90px]">Nilai</th>
                  <th className="py-3 px-2 text-center w-[110px]">Detail</th>
                </tr>
              </thead>

              <tbody>
                {rows.length === 0 && !loadingData && (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-6 text-center text-sm text-muted-foreground"
                    >
                      Belum ada data hard competency.
                    </td>
                  </tr>
                )}

                {rows.map((r, i) => {
                  const open = openSet.has(r.idKey);
                  return (
                    <React.Fragment key={r.idKey}>
                      {/* Row utama */}
                      <tr
                        className={`border-b transition ${
                          open ? "bg-zinc-50/60" : "hover:bg-zinc-50"
                        }`}
                      >
                        <td className="py-3 px-2 text-center whitespace-nowrap align-middle">
                          {i + 1}
                        </td>

                        <td className="py-3 px-2 align-middle">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-semibold text-zinc-900">
                              {r.nama}
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-2 text-center whitespace-nowrap align-middle">
                          <span className={pillClass(r.status)}>
                            {formatStatus(r.status)}
                          </span>
                        </td>

                        <td className="py-3 px-2 text-center whitespace-nowrap align-middle">
                          {r.nilai ?? "-"}
                        </td>

                        <td className="py-3 px-2 text-center whitespace-nowrap align-middle">
                          <Button
                            size="sm"
                            className="h-9 rounded-lg px-4 text-[13px] font-semibold"
                            onClick={() => toggleRow(r.idKey)}
                          >
                            {open ? "Tutup" : "Detail"}
                          </Button>
                        </td>
                      </tr>

                      {/* Row detail */}
                      {open && (
                        <tr className="bg-zinc-50">
                          <td colSpan={5} className="p-0">
                            <div className="mx-3 mb-4 mt-0 rounded-xl bg-white shadow-[0_2px_8px_rgba(15,23,42,0.03)] border border-zinc-100">
                              <div className="px-6 py-4 space-y-3">
                                <div className="grid gap-3 sm:grid-cols-2">
                                  <div>
                                    <p className="text-xs text-zinc-500">ID</p>
                                    <p className="text-[15px] font-semibold">
                                      {r.displayId}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-zinc-500">
                                      Kode Kompetensi
                                    </p>
                                    <p className="text-[15px] font-semibold">
                                      {r.kode}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-zinc-500">
                                      Job Family
                                    </p>
                                    <p className="text-[15px] font-semibold">
                                      {r.jobFamily}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-zinc-500">
                                      Sub Job
                                    </p>
                                    <p className="text-[15px] font-semibold">
                                      {r.subJob}
                                    </p>
                                  </div>
                                </div>

                                <div className="pt-3 border-t border-zinc-100">
                                  <p className="text-xs text-zinc-500 mb-1">
                                    Deskripsi
                                  </p>
                                  <p className="text-[15px] leading-relaxed text-zinc-800">
                                    {r.deskripsi}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}

                {loadingData && (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-6 text-center text-sm text-muted-foreground"
                    >
                      Memuat data...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
