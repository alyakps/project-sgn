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
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Row = {
  id: string;
  kode: string;
  label: string;
  nama: string;
  status: "Tercapai" | "Tidak Tercapai";
  nilai: number;
  deskripsi: string;
};

const ALL: Row[] = [
  { id: "964", kode: "CIN", label: "Creativity & Innovation", nama: "Creativity & Innovation (Kreativitas dan Inovasi)", status: "Tidak Tercapai", nilai: 60, deskripsi: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
  { id: "965", kode: "TRL", label: "Transformational Leadership", nama: "Transformational Leadership (Kepemimpinan Transformasi)", status: "Tercapai", nilai: 100, deskripsi: "Ut enim ad minim veniam, quis nostrud exercitation ullamco." },
  { id: "966", kode: "NEP", label: "Empowering People", nama: "Nurturing and Empowering People (Membina dan Memberdayakan Orang lain)", status: "Tercapai", nilai: 98, deskripsi: "Duis aute irure dolor in reprehenderit in voluptate velit esse." },
  { id: "950", kode: "INF", label: "Information Seeking", nama: "Information Seeking (Pencarian Informasi)", status: "Tercapai", nilai: 77, deskripsi: "Cillum dolore eu fugiat nulla pariatur, excepteur sint." },
  { id: "951", kode: "RSL", label: "Resilience", nama: "Resilience (Ketangguhan)", status: "Tercapai", nilai: 88, deskripsi: "Occaecat cupidatat non proident, sunt in culpa qui." },
  { id: "952", kode: "ACH", label: "Achievement Orientation", nama: "Achievement Orientation (Orientasi Berprestasi)", status: "Tercapai", nilai: 97, deskripsi: "Officia deserunt mollit anim id est laborum." },
  { id: "953", kode: "CFO", label: "Concern For Order", nama: "Concern For Order (Ketepatan)", status: "Tercapai", nilai: 79, deskripsi: "Pellentesque habitant morbi tristique senectus et netus." },
  { id: "954", kode: "ORC", label: "Organizational Commitment", nama: "Organizational Commitment (Komitmen Organisasi)", status: "Tidak Tercapai", nilai: 69, deskripsi: "Integer posuere erat a ante venenatis dapibus posuere." },
  { id: "955", kode: "ETO", label: "Ethical Oriented", nama: "Ethical Oriented (Kesadaran Beretika)", status: "Tercapai", nilai: 79, deskripsi: "Aenean lacinia bibendum nulla sed consectetur." },
  { id: "956", kode: "MED", label: "Managing Equality & Diversity", nama: "Managing Equality & Diversity (Pengelolaan Kesetaraan dan Keberagaman)", status: "Tercapai", nilai: 73, deskripsi: "Vivamus sagittis lacus vel augue laoreet rutrum." },
  { id: "957", kode: "BCR", label: "Building Collaborative Relationship", nama: "Building Collaborative Relationship (Membangun Hubungan Kerjasama)", status: "Tercapai", nilai: 95, deskripsi: "Cras mattis consectetur purus sit amet fermentum." },
  { id: "958", kode: "BSV", label: "Business Savvy", nama: "Business Savvy (Kecerdasan Bisnis)", status: "Tercapai", nilai: 86, deskripsi: "Maecenas sed diam eget risus varius blandit." },
  { id: "959", kode: "CSF", label: "Customer Focus", nama: "Customer Focus (Orientasi Pelanggan)", status: "Tercapai", nilai: 78, deskripsi: "Sed posuere consectetur est at lobortis." },
  { id: "960", kode: "STO", label: "Strategic Orientation", nama: "Strategic Orientation (Orientasi Strategis)", status: "Tercapai", nilai: 100, deskripsi: "Etiam porta sem malesuada magna mollis euismod." },
  { id: "961", kode: "STM", label: "Sustainability Mindset", nama: "Sustainability Mindset (Orientasi Keberlanjutan)", status: "Tercapai", nilai: 79, deskripsi: "Donec id elit non mi porta gravida at eget metus." },
  { id: "962", kode: "EXF", label: "Execution Focused", nama: "Execution Focused (Fokus pada Pelaksanaan)", status: "Tercapai", nilai: 93, deskripsi: "Curabitur blandit tempus porttitor." },
  { id: "963", kode: "DGL", label: "Digital Literate", nama: "Digital Literate (Pemahaman Digital)", status: "Tercapai", nilai: 82, deskripsi: "Praesent commodo cursus magna, vel scelerisque nisl." },
];

const AVG_BY_KODE: Record<string, number> = {
  CIN: 82, TRL: 79, NEP: 81, INF: 75, RSL: 84, ACH: 80, CFO: 76, ORC: 72, ETO: 85,
  MED: 70, BCR: 88, BSV: 83, CSF: 80, STO: 78, STM: 86, EXF: 82, DGL: 85,
};

const band = (v: number) => (v >= 86 ? "High" : v >= 70 ? "Middle" : "Low");

export default function SoftCompetencyPage() {
  const [openId, setOpenId] = React.useState<string | null>(null);

  const radarData = React.useMemo(
    () =>
      ALL.map((d) => ({
        kode: d.kode,
        label: d.label,
        value: d.nilai,
        avg: AVG_BY_KODE[d.kode] ?? 0,
      })),
    []
  );

  return (
    <div className="flex flex-col gap-6">
      {/* RADAR */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base sm:text-lg font-semibold">Soft Competency</h2>
            <div className="hidden sm:flex items-center gap-4 text-xs text-zinc-600">
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> High (86–100)
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-500" /> Middle (70–85)
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-rose-500" /> Low (0–69)
              </span>
            </div>
          </div>

          <div className="mt-4 h-[380px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="75%">
                <PolarGrid gridType="polygon" />
                <PolarAngleAxis dataKey="kode" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tickCount={5} tick={{ fontSize: 10 }} />

                <Radar name="Your Score" dataKey="value" stroke="#16a34a" fill="#16a34a" fillOpacity={0.25} />
                <Radar name="Average" dataKey="avg" stroke="#2563eb" fill="#2563eb" fillOpacity={0.15} />

                <Legend verticalAlign="top" align="center" wrapperStyle={{ fontSize: 12, paddingBottom: 8 }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const kode = String(payload[0].payload.kode);
                    const label = String(payload[0].payload.label);
                    const vUser = Number(payload.find((p) => p.dataKey === "value")?.value ?? 0);
                    const vAvg = Number(payload.find((p) => p.dataKey === "avg")?.value ?? 0);
                    return (
                      <div className="rounded border bg-white px-3 py-2 text-xs shadow">
                        <div className="font-semibold">{label}</div>
                        <div className="text-zinc-600">Kode: <span className="font-medium">{kode}</span></div>
                        <div className="mt-1 space-y-0.5">
                          <div>Your Score: <span className="font-semibold">{vUser}</span> ({band(vUser)})</div>
                          <div>Average: <span className="font-semibold">{vAvg}</span></div>
                        </div>
                      </div>
                    );
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* TABEL */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <h3 className="text-lg font-semibold mb-4">Daftar Kompetensi</h3>

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
                {ALL.map((r, i) => {
                  const open = openId === r.id;
                  return (
                    <React.Fragment key={r.id}>
                      <tr className={`border-b transition ${open ? "bg-zinc-50" : "hover:bg-zinc-50"}`}>
                        <td className="py-3 px-2 text-center">{i + 1}</td>
                        <td className="py-3 px-2 font-semibold">{r.kode}</td>
                        <td className="py-3 px-2">{r.nama}</td>
                        <td className="py-3 px-2 text-center">
                          <span
                            className={[
                              "inline-flex items-center rounded-full px-3 py-1 text-[13px] font-medium ring-1",
                              r.status === "Tercapai"
                                ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                                : "bg-amber-50 text-amber-700 ring-amber-200",
                            ].join(" ")}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center">{r.nilai}</td>
                        <td className="py-3 px-2 text-center">
                          <Button
                            size="sm"
                            className="h-9 rounded-lg px-4 text-[13px] font-semibold"
                            onClick={() => setOpenId(open ? null : r.id)}
                          >
                            {open ? "Tutup" : "Detail"}
                          </Button>
                        </td>
                      </tr>

                      {open && (
                        <tr className="bg-zinc-50">
                          <td colSpan={6} className="p-0">
                            <div className="m-3 rounded-xl border bg-white shadow-sm">
                              <div className="px-6 py-4 space-y-3">
                                <div className="grid gap-3 sm:grid-cols-2">
                                  <div>
                                    <p className="text-xs text-zinc-500">ID</p>
                                    <p className="text-[15px] font-semibold">{r.id}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-zinc-500">Kode</p>
                                    <p className="text-[15px] font-semibold">{r.kode}</p>
                                  </div>
                                  <div className="sm:col-span-2">
                                    <p className="text-xs text-zinc-500">Kompetensi</p>
                                    <p className="text-[15px] font-semibold">{r.nama}</p>
                                  </div>
                                </div>

                                <div className="pt-3 border-t">
                                  <p className="text-xs text-zinc-500 mb-1">Deskripsi</p>
                                  <p className="text-[15px] leading-relaxed">{r.deskripsi}</p>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
