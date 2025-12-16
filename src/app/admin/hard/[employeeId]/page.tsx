"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectValue,
  SelectItem,
} from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";

import { getToken, getUser, clearAuth } from "@/lib/auth-storage";

/* ====================== TYPES ====================== */

type Row = {
  idKey: string; // key internal utk React & toggle
  displayId: string; // ditampilkan di detail
  kode: string;
  nama: string;
  jobFamily: string;
  subJob: string;
  status: string; // disimpan lowercase dari API
  nilai: number | null;
  deskripsi: string;
};

type HardCompetencyApiItem = {
  nik: string;
  tahun: number;
  id_kompetensi: string | number;
  kode: string;
  nama_kompetensi: string;
  job_family_kompetensi: string;
  sub_job_family_kompetensi: string;
  status: string;
  nilai: number | null;
  deskripsi: string | null;
};

type ApiMeta = {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
};

type HardCompetencyApiResponse = {
  data?: HardCompetencyApiItem[];
  meta?: ApiMeta;
  links?: {
    first?: string | null;
    prev?: string | null;
    next?: string | null;
    last?: string | null;
  };
};

/* ====================== HELPERS ====================== */

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

// base URL
const API_BASE_URL =
  (process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000")
    .replace(/\/$/, "") + "/api";

/* ====================== PAGE ====================== */

export default function AdminHardEmployeePage() {
  const router = useRouter();
  const params = useParams<{ employeeId: string }>();

  const employeeNik = React.useMemo(() => {
    const raw = params?.employeeId;
    if (!raw) return "";
    if (Array.isArray(raw)) return raw[0] ?? "";
    return raw;
  }, [params]);

  const [rows, setRows] = React.useState<Row[]>([]);
  const [openSet, setOpenSet] = React.useState<Set<string>>(new Set());

  const [yearOptions, setYearOptions] = React.useState<number[]>([]);
  const [selectedYear, setSelectedYear] = React.useState<number | null>(null);

  // pagination
  const [meta, setMeta] = React.useState<ApiMeta | null>(null);
  const [currentPage, setCurrentPage] = React.useState<number>(1);

  const [loadingAuth, setLoadingAuth] = React.useState(true);
  const [loadingData, setLoadingData] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  /* ========== CEK LOGIN & ROLE ADMIN ========== */
  React.useEffect(() => {
    const token = getToken();
    const user = getUser();

    if (!token || !user) {
      clearAuth();
      router.push("/login");
      return;
    }

    if (user.role && user.role !== "admin") {
      router.push("/");
      return;
    }

    setLoadingAuth(false);
  }, [router]);

  /* ========== LOAD DATA DARI API ADMIN (dengan pagination) ========== */
  const loadData = React.useCallback(
    async (nik: string, year?: number, page: number = 1) => {
      const token = getToken();

      if (!token) {
        clearAuth();
        router.push("/login");
        return;
      }

      if (!nik) return;

      setLoadingData(true);
      setError(null);

      try {
        let url = `${API_BASE_URL}/admin/karyawan/${nik}/hard-competencies?page=${page}`;
        if (typeof year === "number") url += `&tahun=${year}`;

        const res = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (res.status === 401) {
          clearAuth();
          router.push("/login");
          return;
        }

        if (!res.ok) {
          throw new Error(`Gagal memuat data (status ${res.status})`);
        }

        const json: HardCompetencyApiResponse = await res.json();
        const itemsRaw: HardCompetencyApiItem[] = json.data ?? [];

        // pagination meta
        setMeta(json.meta ?? null);
        setCurrentPage(json.meta?.current_page ?? page);

        // kumpulkan daftar tahun dari data
        const years = Array.from(
          new Set(
            itemsRaw
              .map((i) => i.tahun)
              .filter((v) => typeof v === "number" && !Number.isNaN(v))
          )
        ).sort((a, b) => b - a);

        if (years.length > 0) setYearOptions(years);

        // tentukan tahun aktif
        let activeYear: number | null =
          typeof year === "number" ? year : selectedYear;

        if (activeYear === null && years.length > 0) {
          activeYear = years[0];
          setSelectedYear((prev) => (prev === null ? years[0] : prev));
        }

        // filter data sesuai tahun aktif (kalau ada)
        const filteredItems =
          activeYear !== null
            ? itemsRaw.filter((i) => i.tahun === activeYear)
            : itemsRaw;

        const mapped: Row[] = filteredItems.map((item) => {
          const rawId = item.id_kompetensi;
          const nilaiSafe =
            item.nilai === null || item.nilai === undefined
              ? null
              : Number(item.nilai);

          return {
            idKey: String(rawId),
            displayId: String(rawId),
            kode: item.kode ?? "-",
            nama: item.nama_kompetensi ?? "-",
            jobFamily: item.job_family_kompetensi ?? "-",
            subJob: item.sub_job_family_kompetensi ?? "-",
            status: (item.status ?? "").toLowerCase(),
            nilai: Number.isNaN(nilaiSafe as number) ? null : nilaiSafe,
            deskripsi: item.deskripsi ?? "Belum ada deskripsi kompetensi.",
          };
        });

        setRows(mapped);
        setOpenSet(new Set());
      } catch (err: unknown) {
        console.error(err);
        const msg =
          err instanceof Error ? err.message : "Gagal memuat data Hard Competency.";
        setError(msg);
        setRows([]);
        setOpenSet(new Set());
        setMeta(null);
      } finally {
        setLoadingData(false);
      }
    },
    [router, selectedYear]
  );

  // pertama kali: setelah auth OK dan nik ada → load page 1
  React.useEffect(() => {
    if (!loadingAuth && employeeNik) {
      loadData(employeeNik, selectedYear ?? undefined, 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingAuth, employeeNik]);

  const toggleRow = (idKey: string) =>
    setOpenSet((prev) => {
      const next = new Set(prev);
      next.has(idKey) ? next.delete(idKey) : next.add(idKey);
      return next;
    });

  if (loadingAuth) {
    return (
      <div className="flex min-h-[200px] items-center justify-center text-sm text-muted-foreground">
        Memuat...
      </div>
    );
  }

  const effectiveYearOptions = yearOptions.length > 0 ? yearOptions : [];

  // pagination safe values
  const safeCurrentPage = meta?.current_page ?? currentPage;
  const totalPages = meta?.last_page ?? 1;
  const perPage = meta?.per_page ?? rows.length;

  return (
    <section className="flex flex-col gap-3 overflow-visible">
      {/* Header: panah kembali (kiri) + title, filter tahun di kanan */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:p-5 pb-0">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg sm:text-xl font-semibold">Hard Competency</h2>
        </div>

        <div className="relative z-20">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-zinc-700">Tahun:</span>
            <Select
              value={selectedYear !== null ? String(selectedYear) : undefined}
              onValueChange={(v) => {
                const year = Number(v);
                setSelectedYear(year);
                if (employeeNik) {
                  // reset page ke 1 saat ganti tahun
                  loadData(employeeNik, year, 1);
                }
              }}
              disabled={loadingData || effectiveYearOptions.length === 0}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Pilih tahun" />
              </SelectTrigger>
              <SelectContent position="popper" className="z-50">
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
                      Belum ada data hard competency untuk tahun ini.
                    </td>
                  </tr>
                )}

                {rows.map((r, i) => {
                  const open = openSet.has(r.idKey);
                  const rowNumber = (safeCurrentPage - 1) * perPage + (i + 1);

                  return (
                    <React.Fragment key={r.idKey}>
                      {/* Row utama */}
                      <tr
                        className={`border-b transition ${
                          open ? "bg-zinc-50/60" : "hover:bg-zinc-50"
                        }`}
                      >
                        <td className="py-3 px-2 text-center whitespace-nowrap align-middle">
                          {rowNumber}
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

          {/* Pagination: pakai meta dari backend */}
          {meta && meta.total > 0 && (
            <div className="mt-4 flex items-center justify-between">
              {/* kiri */}
              <span className="text-xs text-zinc-600">
                Halaman{" "}
                <span className="font-semibold">{safeCurrentPage}</span> dari{" "}
                <span className="font-semibold">{totalPages}</span>
              </span>

              {/* kanan */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={safeCurrentPage <= 1 || loadingData}
                  onClick={() =>
                    !loadingData &&
                    loadData(
                      employeeNik,
                      selectedYear ?? undefined,
                      safeCurrentPage - 1
                    )
                  }
                >
                  Prev
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={safeCurrentPage >= totalPages || loadingData}
                  onClick={() =>
                    !loadingData &&
                    loadData(
                      employeeNik,
                      selectedYear ?? undefined,
                      safeCurrentPage + 1
                    )
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
