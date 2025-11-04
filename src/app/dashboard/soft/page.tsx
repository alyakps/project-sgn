// src/app/dashboard/soft/page.tsx
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

// 17 titik untuk radar
const RADAR_DATA = ALL.map((d) => ({ kode: d.kode, label: d.label, value: d.nilai }));

function band(v: number) {
  if (v >= 86) return "High";
  if (v >= 70) return "Middle";
  return "Low";
}

export default function SoftCompetencyPage() {
  const [openRows, setOpenRows] = React.useState<Set<string>>(new Set());

  const toggleDetail = (id: string) => {
    setOpenRows((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* RADAR */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-semibold">Soft Competency</h2>
            <div className="hidden sm:flex items-center gap-4 text-xs text-zinc-600">
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                High (86–100)
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                Middle (70–85)
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                Low (0–69)
              </span>
            </div>
          </div>

          <div className="mt-4 h-[420px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={RADAR_DATA} outerRadius="75%">
                <PolarGrid gridType="polygon" />
                <PolarAngleAxis dataKey="kode" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  tickCount={5}
                  tickFormatter={(v: number) => String(v)}
                  tick={{ fontSize: 10 }}
                />
                <Radar
                  name="Nilai"
                  dataKey="value"
                  stroke="#5B43F9"
                  fill="#5B43F9"
                  fillOpacity={0.35}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.[0]) return null;
                    const p = payload[0].payload as { kode: string; value: number; label: string };
                    return (
                      <div className="rounded-md border bg-white px-3 py-2 text-xs shadow">
                        <div className="font-semibold">{p.label}</div>
                        <div className="text-zinc-600">
                          Kode: <span className="font-medium">{p.kode}</span>
                        </div>
                        <div className="text-zinc-600">
                          Nilai: <span className="font-medium">{p.value}</span> ({band(p.value)})
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
          <h3 className="text-lg font-semibold text-zinc-900 mb-4">
            Daftar Kompetensi (17)
          </h3>

          <div className="w-full overflow-x-auto">
            <table className="w-full table-fixed text-[15px]">
              <colgroup>
                <col className="w-12" />
                <col className="w-20" />
                <col />
                <col className="w-40" />
                <col className="w-24" />
                <col className="w-32" />
              </colgroup>

              <thead>
                <tr className="text-[15px] font-semibold text-zinc-700 border-b border-zinc-200">
                  {/* 👇 No sejajar (center) */}
                  <th className="py-3 text-center">No</th>
                  <th className="py-3 text-left">Kode</th>
                  <th className="py-3 text-left">Nama Kompetensi</th>
                  <th className="py-3 text-center">Status</th>
                  <th className="py-3 text-center">Nilai</th>
                  <th className="py-3 text-center">Detail</th>
                </tr>
              </thead>

              <tbody>
                {ALL.map((r, i) => (
                  <React.Fragment key={r.id}>
                    <tr
                      className={`border-b border-zinc-100 transition ${
                        openRows.has(r.id) ? "bg-zinc-50" : "hover:bg-zinc-50"
                      }`}
                    >
                      {/* 👇 isi No juga center */}
                      <td className="py-3 text-center text-zinc-700">{i + 1}</td>
                      <td className="py-3 text-zinc-900 font-semibold">{r.kode}</td>
                      <td className="py-3 text-zinc-900">{r.nama}</td>
                      <td className="py-3 text-center">
                        <div className="flex justify-center">
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
                        </div>
                      </td>
                      <td className="py-3 text-center text-zinc-900">{r.nilai}</td>
                      <td className="py-3 text-center">
                        <Button
                          size="sm"
                          className="h-9 rounded-lg px-4 text-[13px] font-semibold bg-[#05398f] hover:bg-[#042E71] text-white transition-colors"
                          onClick={() => toggleDetail(r.id)}
                        >
                          {openRows.has(r.id) ? "Tutup" : "Detail"}
                        </Button>
                      </td>
                    </tr>

                    {openRows.has(r.id) && (
                      <tr className="bg-zinc-50">
                        <td colSpan={6} className="p-0">
                          <div className="mx-3 my-3 rounded-xl border border-zinc-200 bg-white shadow-sm">
                            <div className="px-6 py-4">
                              <h4 className="text-lg font-semibold text-zinc-900 mb-3">
                                Detail Kompetensi
                              </h4>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-3 text-[15px]">
                                <div className="space-y-2">
                                  <div>
                                    <p className="text-sm text-zinc-500 font-medium">ID</p>
                                    <p className="text-zinc-900 font-semibold text-[16px]">{r.id}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-zinc-500 font-medium">Kode</p>
                                    <p className="text-zinc-900 font-semibold text-[16px]">{r.kode}</p>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <div>
                                    <p className="text-sm text-zinc-500 font-medium">Nama Kompetensi</p>
                                    <p className="text-zinc-900 font-semibold text-[16px]">{r.nama}</p>
                                  </div>
                                </div>
                              </div>

                              <div className="mt-4 pt-3 border-t border-zinc-200">
                                <p className="text-sm text-zinc-500 font-medium mb-1">Deskripsi</p>
                                <p className="text-[16px] text-zinc-900 font-semibold leading-relaxed">
                                  {r.deskripsi}
                                </p>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
