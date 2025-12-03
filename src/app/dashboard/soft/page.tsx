// src/app/dashboard/soft-competency/page.tsx
"use client";

import * as React from "react";
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

import { getToken } from "@/lib/auth-storage";

// =======================
// TYPE DEFINITIONS
// =======================
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

type ApiResponse = {
  data: {
    nik: string;
    tahun: number | null;
    chart: ChartItem[];
    items: Item[];
    available_years?: number[];
  };
};

const API_BASE_URL =
  (process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000").replace(
    /\/$/,
    ""
  ) + "/api";

const band = (v: number) => (v >= 86 ? "High" : v >= 70 ? "Middle" : "Low");

function formatStatus(status: string) {
  const lower = status.toLowerCase();
  if (lower === "tercapai") return "Tercapai";
  if (lower === "tidak tercapai") return "Tidak Tercapai";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function SoftCompetencyPage() {
  // const [openId, setOpenId] = React.useState<string | null>(null);
  const [openIds, setOpenIds] = React.useState<string[]>([]); // ✅ bisa banyak yang kebuka

  // tahun yang dipilih user
  const [year, setYear] = React.useState<string>("");

  // daftar tahun dari backend
  const [availableYears, setAvailableYears] = React.useState<string[]>([]);

  const [chart, setChart] = React.useState<ChartItem[]>([]);
  const [items, setItems] = React.useState<Item[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // =======================
  //   FETCH DATA
  // =======================
  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (year) {
          params.set("tahun", year);
        }

        const queryString = params.toString();
        const url =
          `${API_BASE_URL}/karyawan/soft-competencies` +
          (queryString ? `?${queryString}` : "");

        const headers: HeadersInit = {
          Accept: "application/json",
        };

        const token = getToken();
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const res = await fetch(url, {
          method: "GET",
          headers,
        });

        if (!res.ok) {
          let msg = `Failed: ${res.status}`;
          try {
            const e = await res.json();
            if (e?.message) msg += ` - ${e.message}`;
          } catch {
            // ignore non-json
          }
          throw new Error(msg);
        }

        const json: ApiResponse = await res.json();
        if (cancelled) return;

        // ambil daftar tahun dari backend
        const yearsFromApi =
          json.data.available_years
            ?.filter((v) => typeof v === "number")
            .map((v) => String(v)) ?? [];

        setAvailableYears(yearsFromApi);

        // kalau belum ada year yg dipilih, auto pilih yang terbaru
        if (!year && yearsFromApi.length > 0) {
          setYear(yearsFromApi[0]);
        }

        setChart(json.data?.chart ?? []);
        setItems(json.data?.items ?? []);
        // setOpenId(null);
        setOpenIds([]); // ✅ reset semua detail tertutup ketika data reload
      } catch (err: any) {
        if (cancelled) return;
        setError(err.message ?? "Failed to fetch");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
    // year sebagai dependency → setiap ganti tahun, refetch
  }, [year]);

  const radarData = React.useMemo(
    () =>
      chart.map((d) => ({
        kode: d.kode,
        label: d.nama_kompetensi,
        value: d.your_score,
        avg: d.avg_employee_score ?? 0,
        your_level: d.your_level,
        avg_level: d.avg_level,
      })),
    [chart]
  );

  const hasData = radarData.length > 0;

  return (
    <section className="flex flex-col gap-3">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:p-5 pb-0">
        <h2 className="text-lg sm:text-xl font-semibold">Soft Competency</h2>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-zinc-700">Tahun:</span>
          <Select
            value={year || ""}
            onValueChange={(val) => {
              setYear(val);
              // setOpenId(null);
              setOpenIds([]); // ✅ tutup semua detail saat ganti tahun
            }}
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

      {loading && (
        <p className="px-3 sm:px-5 text-xs sm:text-sm text-zinc-500">
          Memuat data soft competency...
        </p>
      )}
      {error && (
        <p className="px-3 sm:px-5 text-xs sm:text-sm text-red-600">{error}</p>
      )}

      {/* ====================== CHART ====================== */}
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
                <Legend
                  verticalAlign="top"
                  align="center"
                  wrapperStyle={{ fontSize: 12, paddingBottom: 8 }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const p = payload[0] as any;

                    const kode = p?.payload?.kode ?? "";
                    const label = p?.payload?.label ?? "";
                    const score = Number(
                      payload.find((x: any) => x.dataKey === "value")?.value ??
                        0
                    );
                    const avg = Number(
                      payload.find((x: any) => x.dataKey === "avg")?.value ?? 0
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

      <Separator className="my-2 bg-zinc-200" />

      {/* ====================== TABLE ====================== */}
      <div className="p-4 sm:p-6">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-sm sm:text-[15px]">
            <thead>
              <tr className="text-zinc-700 border-b">
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
                // const open = openId === r.id_kompetensi;
                const open = openIds.includes(r.id_kompetensi); // ✅ cek apakah id ini terbuka
                const statusLabel = formatStatus(r.status);
                const isTercapai = statusLabel === "Tercapai";

                return (
                  // ⬅️ KEY HARUS UNIK: id + index
                  <React.Fragment key={`${r.id_kompetensi}-${i}`}>
                    <tr
                      className={`border-b transition ${
                        open ? "bg-zinc-50" : "hover:bg-zinc-50"
                      }`}
                    >
                      <td className="py-3 px-2 text-center">{i + 1}</td>
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
                          onClick={() =>
                            setOpenIds((prev) =>
                              prev.includes(r.id_kompetensi)
                                ? prev.filter(
                                    (id) => id !== r.id_kompetensi
                                  ) // ✅ kalau sudah terbuka → tutup
                                : [...prev, r.id_kompetensi] // ✅ kalau tertutup → buka
                            )
                          }
                        >
                          {open ? "Tutup" : "Detail"}
                        </Button>
                      </td>
                    </tr>

                    {open && (
                      <tr className="bg-zinc-50">
                        <td colSpan={6} className="p-0">
                          <div className="m-3 rounded-xl bg-white">
                            <div className="px-6 py-4 space-y-3">
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

                              <div className="pt-3 border-t">
                                <p className="text-xs text-zinc-500 mb-1">
                                  Deskripsi
                                </p>
                                <p className="text-[15px] leading-relaxed">
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

              {!loading && !items.length && (
                <tr>
                  <td
                    colSpan={6}
                    className="py-4 text-center text-sm text-zinc-500"
                  >
                    {availableYears.length === 0
                      ? "Belum ada data soft competency."
                      : "Tidak ada data ditampilkan untuk tahun ini."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
