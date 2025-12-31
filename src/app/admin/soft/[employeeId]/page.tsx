// src/app/admin/soft/[employeeId]/page.tsx
"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectValue,
  SelectItem,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";

import { getToken, getUser, clearAuth } from "@/lib/auth-storage";

/* =======================
 *  TYPES
 * ======================= */

type ChartItem = {
  id_kompetensi: string;
  kode: string;
  nama_kompetensi: string;
  your_score: number;
  your_level: string;
  avg_employee_score: number | null;
  avg_level: string | null;
};

type Item = {
  id_kompetensi: string;
  kode: string;
  nama_kompetensi: string;
  status: string;
  nilai: number;
  level: string;
  deskripsi: string | null;
};

type AdminSoftApiData = {
  nik: string;
  tahun: number | null;
  chart: ChartItem[];
  items: Item[];
  available_years?: number[];
};

type ApiMeta = {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
};

type AdminSoftApiResponse = {
  data?: AdminSoftApiData;
  meta?: ApiMeta;
};

/* =======================
 *  HELPER
 * ======================= */

const API_BASE_URL =
  (process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000")
    .replace(/\/$/, "") + "/api";

const band = (v: number) => (v >= 86 ? "High" : v >= 70 ? "Middle" : "Low");

function formatStatus(status: string) {
  const lower = status.toLowerCase();
  if (lower === "tercapai") return "Tercapai";
  if (lower === "tidak tercapai") return "Tidak Tercapai";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

/**
 * Fetch dari endpoint admin:
 * GET /api/admin/karyawan/{nik}/soft-competencies?tahun=XXXX&page=Y
 */
async function fetchAdminSoftCompetency(
  nik: string,
  year?: string,
  page?: number
): Promise<{ data: AdminSoftApiData; meta?: ApiMeta }> {
  const token = getToken();
  if (!token) {
    throw new Error("Sesi login tidak ditemukan. Silakan login kembali.");
  }

  const params = new URLSearchParams();
  if (year) params.set("tahun", year);
  if (page) params.set("page", String(page));

  const queryString = params.toString();
  const url =
    `${API_BASE_URL}/admin/karyawan/${nik}/soft-competencies` +
    (queryString ? `?${queryString}` : "");

  console.log("[Soft Admin] Fetch URL:", url);

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    let msg: string;

    if (res.status === 401) {
      msg = "Sesi Anda telah berakhir. Silakan login kembali.";
    } else {
      msg = `Gagal memuat data (${res.status})`;
    }

    try {
      const e: unknown = await res.json();
      if (typeof (e as { message?: unknown })?.message === "string") {
        msg += ` - ${(e as { message: string }).message}`;
      }
    } catch {
      // ignore
    }

    throw new Error(msg);
  }

  const json: AdminSoftApiResponse = await res.json();
  const data = json.data;

  if (!data) {
    throw new Error("Data soft competency tidak ditemukan.");
  }

  console.log("[Soft Admin] Data dari API:", data);
  console.log("[Soft Admin] Meta dari API:", json.meta);

  return { data, meta: json.meta };
}

/* =======================
 *  SUB COMPONENTS
 * ======================= */

type SoftCompetencyChartProps = {
  chart: ChartItem[];
  loading: boolean;
  availableYears: string[];
};

function SoftCompetencyChart({
  chart,
  loading,
  availableYears,
}: SoftCompetencyChartProps) {
  const radarData = React.useMemo(
    () =>
      chart.map((d) => ({
        kode: d.kode,
        label: d.nama_kompetensi,
        value: d.your_score,
        avg: d.avg_employee_score ?? 0,
        standard: 75, // ✅ Standard score khusus SOFT
        your_level: d.your_level,
        avg_level: d.avg_level,
      })),
    [chart]
  );

  const hasData = radarData.length > 0;

  return (
    <div className="px-3 sm:px-5">
      <div className="relative h-[380px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {hasData ? (
            <RadarChart data={radarData} outerRadius="75%">
              <PolarGrid gridType="polygon" />
              <PolarAngleAxis dataKey="kode" tick={{ fontSize: 11 }} />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tickCount={5}
                tick={{ fontSize: 10 }}
              />
              <Radar
                name="Your Score"
                dataKey="value"
                stroke="#16a34a"
                fill="#16a34a"
                fillOpacity={0.25}
              />
              <Radar
                name="Average Employee Score"
                dataKey="avg"
                stroke="#2563eb"
                fill="#2563eb"
                fillOpacity={0.15}
              />
              {/* ✅ Radar Standard Score (75) warna kuning */}
              <Radar
                name="Standard Score"
                dataKey="standard"
                stroke="#facc15"
                fill="#facc15"
                fillOpacity={0.12}
              />
              <Legend
                verticalAlign="top"
                align="center"
                wrapperStyle={{ fontSize: 12, paddingBottom: 8 }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;

                  const p = payload[0] as unknown as {
                    payload?: { kode?: string; label?: string };
                  };

                  const kode = p?.payload?.kode ?? "";
                  const label = p?.payload?.label ?? "";

                  const score = Number(
                    (
                      payload as unknown as Array<{
                        dataKey?: string;
                        value?: unknown;
                      }>
                    ).find((x) => x.dataKey === "value")?.value ?? 0
                  );
                  const avg = Number(
                    (
                      payload as unknown as Array<{
                        dataKey?: string;
                        value?: unknown;
                      }>
                    ).find((x) => x.dataKey === "avg")?.value ?? 0
                  );

                  return (
                    <div className="rounded bg-white px-3 py-2 text-xs shadow">
                      <div className="font-semibold">{label}</div>
                      <div className="text-zinc-600">
                        Kode: <span className="font-medium">{kode}</span>
                      </div>
                      <div className="mt-1 space-y-0.5">
                        <div>
                          Your Score:{" "}
                          <span className="font-semibold">{score}</span> (
                          {band(score)})
                        </div>
                        <div>
                          Average Score:{" "}
                          <span className="font-semibold">{avg}</span>
                        </div>
                        <div>
                          Standard Score:{" "}
                          <span className="font-semibold">75</span>
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
            </RadarChart>
          ) : (
            <RadarChart
              data={[
                { kode: "A", value: 0 },
                { kode: "B", value: 0 },
                { kode: "C", value: 0 },
                { kode: "D", value: 0 },
                { kode: "E", value: 0 },
              ]}
              outerRadius="75%"
            >
              <PolarGrid gridType="polygon" />
              <PolarAngleAxis dataKey="kode" tick={{ fontSize: 11 }} />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tickCount={5}
                tick={{ fontSize: 10 }}
              />
            </RadarChart>
          )}
        </ResponsiveContainer>

        {!hasData && !loading && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <p className="rounded-md bg-white/80 px-3 py-2 text-xs sm:text-sm text-zinc-600">
              {availableYears.length === 0
                ? "Belum ada data soft competency."
                : "Pilih tahun untuk melihat data."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

type SoftCompetencyTableProps = {
  items: Item[];
  loading: boolean;
  hasAnyYear: boolean;
  startNumber: number; // <-- tambahan untuk nomor lanjut
};

function SoftCompetencyTable({
  items,
  loading,
  hasAnyYear,
  startNumber,
}: SoftCompetencyTableProps) {
  const [openIds, setOpenIds] = React.useState<string[]>([]);

  const toggleOpen = (id: string) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="w-full overflow-x-auto">
        <table className="w-full text-sm sm:text-[15px]">
          <thead>
            <tr className="border-b text-zinc-700">
              <th className="py-3 px-2 text-center">No</th>
              <th className="py-3 px-2 text-left">Kode</th>
              <th className="py-3 px-2 text-left">Kompetensi</th>
              <th className="py-3 px-2 text-center">Status</th>
              <th className="py-3 px-2 text-center">Nilai</th>
              <th className="py-3 px-2 text-center">Detail</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r, i) => {
              const open = openIds.includes(r.id_kompetensi);
              const statusLabel = formatStatus(r.status);
              const isTercapai = statusLabel === "Tercapai";

              return (
                <React.Fragment key={`${r.id_kompetensi}-${i}`}>
                  <tr
                    className={`border-b transition ${
                      open ? "bg-zinc-50" : "hover:bg-zinc-50"
                    }`}
                  >
                    {/* nomor lanjut per halaman */}
                    <td className="py-3 px-2 text-center">
                      {startNumber + i}
                    </td>

                    <td className="py-3 px-2 font-semibold">{r.kode}</td>
                    <td className="py-3 px-2">{r.nama_kompetensi}</td>
                    <td className="py-3 px-2 text-center">
                      <span
                        className={[
                          "inline-flex items-center rounded-full px-3 py-1 text-[13px] font-medium ring-1",
                          isTercapai
                            ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                            : "bg-amber-50 text-amber-700 ring-amber-200",
                        ].join(" ")}
                      >
                        {statusLabel}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center">{r.nilai}</td>
                    <td className="py-3 px-2 text-center">
                      <Button
                        size="sm"
                        className="h-9 rounded-lg px-4 text-[13px] font-semibold"
                        onClick={() => toggleOpen(r.id_kompetensi)}
                      >
                        {open ? "Tutup" : "Detail"}
                      </Button>
                    </td>
                  </tr>

                  {open && (
                    <tr className="bg-zinc-50">
                      <td colSpan={6} className="p-0">
                        <div className="m-3 rounded-xl bg-white">
                          <div className="space-y-3 px-6 py-4">
                            <div className="grid gap-3 sm:grid-cols-2">
                              <div>
                                <p className="text-xs text-zinc-500">ID</p>
                                <p className="text-[15px] font-semibold">
                                  {r.id_kompetensi}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-zinc-500">Kode</p>
                                <p className="text-[15px] font-semibold">
                                  {r.kode}
                                </p>
                              </div>
                              <div className="sm:col-span-2">
                                <p className="text-xs text-zinc-500">
                                  Kompetensi
                                </p>
                                <p className="text-[15px] font-semibold">
                                  {r.nama_kompetensi}
                                </p>
                              </div>
                            </div>

                            <div className="border-t pt-3">
                              <p className="mb-1 text-xs text-zinc-500">
                                Deskripsi
                              </p>
                              <p className="text-[15px] leading-relaxed">
                                {r.deskripsi || "-"}
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

            {!loading && !items.length && (
              <tr>
                <td
                  colSpan={6}
                  className="py-4 text-center text-sm text-zinc-500"
                >
                  {hasAnyYear
                    ? "Tidak ada data ditampilkan untuk tahun ini."
                    : "Belum ada data soft competency."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* =======================
 *  PAGE (ADMIN PER KARYAWAN)
 * ======================= */

export default function AdminSoftEmployeePage() {
  const router = useRouter();
  const params = useParams<{ employeeId: string }>();

  // Sekarang [employeeId] langsung diisi NIK (dari /admin/soft page)
  const employeeNik = React.useMemo(() => {
    const raw = params?.employeeId;
    const value = Array.isArray(raw) ? raw[0] ?? "" : raw ?? "";
    console.log("[Soft Admin] employeeNik dari route:", value);
    return value;
  }, [params]);

  const [year, setYear] = React.useState<string>(""); // untuk query API
  const [selectedYear, setSelectedYear] = React.useState<string>(""); // untuk Select

  const [availableYears, setAvailableYears] = React.useState<string[]>([]);
  const [chart, setChart] = React.useState<ChartItem[]>([]);
  const [items, setItems] = React.useState<Item[]>([]);

  // pagination (minimal)
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

  /* ========== FETCH DATA ========== */
  React.useEffect(() => {
    if (loadingAuth) return;
    if (!employeeNik) return;

    let cancelled = false;

    async function load() {
      try {
        setLoadingData(true);
        setError(null);

        const { data, meta: metaFromApi } = await fetchAdminSoftCompetency(
          employeeNik,
          year || undefined,
          currentPage
        );
        if (cancelled) return;

        setMeta(metaFromApi ?? null);
        setCurrentPage(metaFromApi?.current_page ?? currentPage);

        const yearsFromApi =
          data.available_years
            ?.filter((v): v is number => typeof v === "number")
            .map((v) => String(v)) ?? [];

        setAvailableYears(yearsFromApi);

        // === FIX PENTING (tetap dipertahankan) ===
        // Fetch pertama (year === "") hanya dipakai untuk tahu daftar tahun.
        // Kalau tahun dari API = 0 / null → jangan isi chart/items dulu.
        if (!year) {
          const latestYear =
            data.tahun && data.tahun !== 0
              ? String(data.tahun)
              : yearsFromApi[0] ?? "";

          console.log("[Soft Admin] first load, latestYear:", latestYear);

          if (latestYear) {
            setYear(latestYear); // akan memicu fetch ulang dengan tahun spesifik
            setSelectedYear(latestYear);
            setCurrentPage(1); // reset pagination saat auto set tahun
          }

          // JANGAN set chart/items di sini, biarkan fetch kedua yang isi
          return;
        }

        // kalau sudah ada year → isi chart/items
        let effectiveYear = year;

        if (!effectiveYear) {
          if (data.tahun && data.tahun !== 0) {
            effectiveYear = String(data.tahun);
          } else if (yearsFromApi.length > 0) {
            effectiveYear = yearsFromApi[0];
          }
        }

        setSelectedYear(effectiveYear);
        setChart(data.chart ?? []);
        setItems(data.items ?? []);

        console.log(
          "[Soft Admin] FINAL chart length:",
          data.chart?.length ?? 0,
          "items length:",
          data.items?.length ?? 0
        );
      } catch (err: unknown) {
        if (cancelled) return;
        console.error("[Soft Admin] Error fetch:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Gagal memuat data soft competency."
        );
        setChart([]);
        setItems([]);
        setMeta(null);
      } finally {
        if (!cancelled) {
          setLoadingData(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [loadingAuth, employeeNik, year, currentPage]);

  if (loadingAuth) {
    return (
      <div className="flex min-h-[200px] items-center justify-center text-sm text-muted-foreground">
        Memuat...
      </div>
    );
  }

  // pagination safe values
  const safeCurrentPage = meta?.current_page ?? currentPage;
  const totalPages = meta?.last_page ?? 1;

  // untuk nomor tabel lanjut
  const perPage = meta?.per_page ?? (items.length > 0 ? items.length : 10);
  const startNumber = (safeCurrentPage - 1) * perPage + 1;

  return (
    <section className="flex flex-col gap-3">
      {/* HEADER: panah back kiri + title, filter tahun kanan */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 pb-0 sm:p-5">
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
          <h2 className="text-lg font-semibold sm:text-xl">Soft Competency</h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-zinc-700">Tahun:</span>
          <Select
            value={selectedYear || ""}
            onValueChange={(val) => {
              setYear(val); // trigger fetch untuk tahun tersebut
              setSelectedYear(val);
              setCurrentPage(1); // reset pagination saat ganti tahun
            }}
            disabled={availableYears.length === 0}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Pilih tahun" />
            </SelectTrigger>
            <SelectContent position="popper" className="z-50">
              {availableYears.map((y) => (
                <SelectItem key={y} value={y}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loadingData && (
        <p className="px-3 text-xs text-zinc-500 sm:px-5 sm:text-sm">
          Memuat data soft competency...
        </p>
      )}
      {error && (
        <p className="px-3 text-xs text-red-600 sm:px-5 sm:text-sm">{error}</p>
      )}

      {/* CHART */}
      <SoftCompetencyChart
        chart={chart}
        loading={loadingData}
        availableYears={availableYears}
      />

      <Separator className="my-2 bg-zinc-200" />

      {/* TABLE */}
      <SoftCompetencyTable
        key={`${selectedYear || "no-year"}-${safeCurrentPage}`}
        items={items}
        loading={loadingData}
        hasAnyYear={availableYears.length > 0}
        startNumber={startNumber}
      />

      {/* Pagination: pakai meta dari backend */}
      {meta && meta.total > 0 && (
        <div className="px-4 pb-6 sm:px-6">
          <div className="mt-1 flex items-center justify-between">
            {/* kiri */}
            <span className="text-xs text-zinc-600">
              Halaman <span className="font-semibold">{safeCurrentPage}</span>{" "}
              dari <span className="font-semibold">{totalPages}</span>
            </span>

            {/* kanan */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={safeCurrentPage <= 1 || loadingData}
                onClick={() => {
                  if (!loadingData) setCurrentPage(safeCurrentPage - 1);
                }}
              >
                Prev
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={safeCurrentPage >= totalPages || loadingData}
                onClick={() => {
                  if (!loadingData) setCurrentPage(safeCurrentPage + 1);
                }}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
