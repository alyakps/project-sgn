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
  status: "tercapai" | "tidak tercapai";
  nilai: number | null;
};

const DATA: Row[] = [
  { id: "4821", kode: "HAK.MAK.008", nama: "Verifikasi Bahan Baku", jobFamily: "Produksi", subJob: "Operator Giling", status: "tercapai", nilai: 92 },
  { id: "1942", kode: "HAK.MAK.009", nama: "Pengawasan Proses Giling", jobFamily: "Produksi", subJob: "Operator Giling", status: "tidak tercapai", nilai: 61 },
  { id: "2873", kode: "TEK.MTN.005", nama: "Preventive Maintenance", jobFamily: "Teknik", subJob: "Maintenance", status: "tercapai", nilai: 95 },
  { id: "5239", kode: "SDM.RKT.004", nama: "Interview Dasar", jobFamily: "SDM", subJob: "Rekrutmen", status: "tidak tercapai", nilai: 39 },
];

export default function HardCompetencyPage() {
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  const toggleDetail = (id: string) => {
    setExpandedId((curr) => (curr === id ? null : id));
  };

  return (
    <div className="flex flex-col gap-6">
      <Card className="bg-white/90 backdrop-blur-sm border border-zinc-200 shadow-xl rounded-2xl">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-zinc-900 mb-4">Hard Competency</h2>

          <div className="w-full overflow-x-auto">
            <table className="w-full table-fixed">
              <colgroup>
                <col className="w-12" />
                <col />
                <col className="w-32" />
                <col className="w-24" />
                <col className="w-28" />
              </colgroup>

              <thead>
                <tr className="text-left text-[13px] text-zinc-600 border-b border-zinc-200">
                  <th className="py-2">No</th>
                  <th className="py-2">Nama Kompetensi</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Nilai</th>
                  <th className="py-2 text-center">Detail</th>
                </tr>
              </thead>

              <tbody>
                {DATA.map((r, i) => (
                  <React.Fragment key={r.id}>
                    <tr
                      className={`border-b border-zinc-100 ${
                        expandedId === r.id ? "bg-zinc-50" : "hover:bg-zinc-50"
                      }`}
                    >
                      <td className="py-3 text-zinc-700">{i + 1}</td>
                      <td className="py-3 text-zinc-900 font-medium">{r.nama}</td>
                      <td className="py-3">
                        <span
                          className={[
                            "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1",
                            r.status === "tercapai"
                              ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                              : "bg-amber-50 text-amber-700 ring-amber-200",
                          ].join(" ")}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3 text-zinc-900">{r.nilai ?? "-"}</td>
                      <td className="py-3 text-center">
                        {/* Button shadcn/ui */}
                        <Button
                          variant="default"
                          size="sm"
                          className="h-8 rounded-xl px-4 text-xs font-medium"
                          onClick={() => toggleDetail(r.id)}
                        >
                          {expandedId === r.id ? "Tutup" : "Detail"}
                        </Button>
                      </td>
                    </tr>

                    {expandedId === r.id && (
                      <tr className="bg-zinc-50">
                        <td colSpan={5} className="p-0">
                          <div className="mx-3 my-2 rounded-lg border border-zinc-200 bg-white shadow-sm">
                            <div className="px-4 py-3">
                              <h3 className="text-[15px] font-semibold text-zinc-900 mb-2">
                                Detail Kompetensi
                              </h3>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-2">
                                <div className="space-y-2">
                                  <div>
                                    <p className="text-xs text-zinc-500">ID</p>
                                    <p className="text-zinc-900 font-medium text-[15px]">{r.id}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-zinc-500">Kode</p>
                                    <p className="text-zinc-900 font-medium text-[15px]">{r.kode}</p>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <div>
                                    <p className="text-xs text-zinc-500">Job Family Kompetensi</p>
                                    <p className="text-zinc-900 font-medium text-[15px]">{r.jobFamily}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-zinc-500">Sub Job Family Kompetensi</p>
                                    <p className="text-zinc-900 font-medium text-[15px]">{r.subJob}</p>
                                  </div>
                                </div>
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
