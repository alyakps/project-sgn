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

const pillClass = (s: Row["status"]) =>
  [
    "inline-flex items-center rounded-full px-3 py-1 text-[13px] font-medium ring-1",
    s === "Tercapai"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : "bg-amber-50 text-amber-700 ring-amber-200",
  ].join(" ");

export default function HardCompetencyPage() {
  const [openId, setOpenId] = React.useState<string | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent className="p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Hard Competency</h2>

          {/* scroll horizontal hanya di tabel */}
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm sm:text-[15px]">
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
                {DATA.map((r, i) => {
                  const open = openId === r.id;
                  return (
                    <React.Fragment key={r.id}>
                      <tr className={`border-b transition ${open ? "bg-zinc-50" : "hover:bg-zinc-50"}`}>
                        <td className="py-3 px-2 text-center">{i + 1}</td>
                        <td className="py-3 px-2 font-semibold">{r.kode}</td>
                        <td className="py-3 px-2">{r.nama}</td>
                        <td className="py-3 px-2 text-center">
                          <span className={pillClass(r.status)}>{r.status}</span>
                        </td>
                        <td className="py-3 px-2 text-center">{r.nilai ?? "-"}</td>
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
                                <h3 className="text-base sm:text-lg font-semibold">Detail Kompetensi</h3>

                                <div className="grid gap-3 sm:grid-cols-2">
                                  <div>
                                    <p className="text-xs text-zinc-500">ID</p>
                                    <p className="text-[15px] font-semibold">{r.id}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-zinc-500">Kode</p>
                                    <p className="text-[15px] font-semibold">{r.kode}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-zinc-500">Job Family</p>
                                    <p className="text-[15px] font-semibold">{r.jobFamily}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-zinc-500">Sub Job</p>
                                    <p className="text-[15px] font-semibold">{r.subJob}</p>
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
