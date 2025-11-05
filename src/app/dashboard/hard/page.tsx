// src/app/dashboard/hard/page.tsx
"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Row = {
  id: string;
  kode: string;
  nama: string;
  jobFamily: string;
  subJob: string;
  status: "Tercapai" | "Tidak Tercapai";
  nilai: number | null;
  deskripsi: string;
};

const DATA: Row[] = [
  {
    id: "4821",
    kode: "HAK.MAK.008",
    nama: "Verifikasi Bahan Baku",
    jobFamily: "Produksi",
    subJob: "Operator Giling",
    status: "Tercapai",
    nilai: 92,
    deskripsi:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    id: "1942",
    kode: "HAK.MAK.009",
    nama: "Pengawasan Proses Giling",
    jobFamily: "Produksi",
    subJob: "Operator Giling",
    status: "Tidak Tercapai",
    nilai: 61,
    deskripsi:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip.",
  },
  {
    id: "2873",
    kode: "TEK.MTN.005",
    nama: "Preventive Maintenance",
    jobFamily: "Teknik",
    subJob: "Maintenance",
    status: "Tercapai",
    nilai: 95,
    deskripsi:
      "Kegiatan perawatan terjadwal untuk mencegah downtime dan kerusakan peralatan produksi.",
  },
  {
    id: "5239",
    kode: "SDM.RKT.004",
    nama: "Interview Dasar",
    jobFamily: "SDM",
    subJob: "Rekrutmen",
    status: "Tidak Tercapai",
    nilai: 39,
    deskripsi:
      "Wawancara tahap awal untuk menilai kesesuaian umum kandidat terhadap kriteria dasar pekerjaan.",
  },
];

export default function HardCompetencyPage() {
  const [expandedIds, setExpandedIds] = React.useState<string[]>([]);
  const toggleDetail = (id: string) =>
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  return (
    // ❌ tidak perlu offset kiri/calc width di sini — layout sudah handle sidebar
    <div className="w-full min-w-0 flex flex-col gap-6 px-2 md:px-0">
      <Card className="bg-white border border-zinc-200 shadow-xl rounded-2xl w-full">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold text-zinc-900 mb-5">
            Hard Competency
          </h2>

          {/* Scroll horizontal hanya di dalam tabel */}
          <div className="-mx-2 md:mx-0 px-2 md:px-0 w-auto overflow-x-auto">
            {/* min-w mencegah kolom mepet; kalau layar < 640px, container ini yang scroll */}
            <table className="min-w-[640px] w-full table-fixed text-[16px]">
              <colgroup>
                <col className="w-12" />
                <col />
                <col className="w-36" />
                <col className="w-28" />
                <col className="w-32" />
              </colgroup>

              <thead className="whitespace-nowrap">
                <tr className="text-[17px] font-semibold text-zinc-700 border-b border-zinc-200">
                  <th className="py-3 text-center">No</th>
                  <th className="py-3 text-left">Kompetensi</th>
                  <th className="py-3 text-center">Status</th>
                  <th className="py-3 text-center">Nilai</th>
                  <th className="py-3 text-center">Detail</th>
                </tr>
              </thead>

              <tbody>
                {DATA.map((r, i) => (
                  <React.Fragment key={r.id}>
                    <tr
                      className={`border-b border-zinc-100 transition ${
                        expandedIds.includes(r.id)
                          ? "bg-zinc-50"
                          : "hover:bg-zinc-50"
                      }`}
                    >
                      <td className="py-3 text-zinc-700 text-center font-medium">
                        {i + 1}
                      </td>
                      <td className="py-3 text-zinc-900 font-semibold">
                        {r.nama}
                      </td>
                      <td className="py-3 text-center">
                        <div className="flex justify-center">
                          <span
                            className={[
                              "inline-flex items-center rounded-full px-3 py-1 text-[14px] font-medium ring-1",
                              r.status === "Tercapai"
                                ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                                : "bg-amber-50 text-amber-700 ring-amber-200",
                            ].join(" ")}
                          >
                            {r.status}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 text-zinc-900 text-center font-medium">
                        {r.nilai ?? "-"}
                      </td>
                      <td className="py-3 text-center">
                        <Button
                          size="sm"
                          className="h-9 rounded-lg px-4 text-[14px] font-semibold bg-[#05398f] hover:bg-[#042E71] text-white transition-colors"
                          onClick={() => toggleDetail(r.id)}
                        >
                          {expandedIds.includes(r.id) ? "Tutup" : "Detail"}
                        </Button>
                      </td>
                    </tr>

                    {expandedIds.includes(r.id) && (
                      <tr className="bg-zinc-50">
                        <td colSpan={5} className="p-0">
                          <div className="mx-3 my-3 rounded-xl border border-zinc-200 bg-white shadow-sm">
                            <div className="px-6 py-4">
                              <h3 className="text-lg font-semibold text-zinc-900 mb-3">
                                Detail Kompetensi
                              </h3>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-3 text-[16px]">
                                <div className="space-y-2">
                                  <div>
                                    <p className="text-sm text-zinc-500 font-medium">
                                      ID
                                    </p>
                                    <p className="text-zinc-900 font-semibold">
                                      {r.id}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-zinc-500 font-medium">
                                      Kode
                                    </p>
                                    <p className="text-zinc-900 font-semibold">
                                      {r.kode}
                                    </p>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <div>
                                    <p className="text-sm text-zinc-500 font-medium">
                                      Job Family Kompetensi
                                    </p>
                                    <p className="text-zinc-900 font-semibold">
                                      {r.jobFamily}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-zinc-500 font-medium">
                                      Sub Job Family Kompetensi
                                    </p>
                                    <p className="text-zinc-900 font-semibold">
                                      {r.subJob}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className="mt-4 pt-3 border-t border-zinc-200">
                                <p className="text-sm text-zinc-500 font-medium mb-1">
                                  Deskripsi Kompetensi
                                </p>
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
