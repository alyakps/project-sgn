"use client";

import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectValue,
  SelectItem,
} from "@/components/ui/select";

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
  { id: "4821", kode: "HAK.MAK.008", nama: "Verifikasi Bahan Baku", jobFamily: "Produksi", subJob: "Operator Giling", status: "Tercapai", nilai: 92, deskripsi: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
  { id: "1942", kode: "HAK.MAK.009", nama: "Pengawasan Proses Giling", jobFamily: "Produksi", subJob: "Operator Giling", status: "Tidak Tercapai", nilai: 61, deskripsi: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip." },
  { id: "2873", kode: "TEK.MTN.005", nama: "Preventive Maintenance", jobFamily: "Teknik", subJob: "Maintenance", status: "Tercapai", nilai: 95, deskripsi: "Kegiatan perawatan terjadwal untuk mencegah downtime dan kerusakan peralatan produksi." },
  { id: "5239", kode: "SDM.RKT.004", nama: "Interview Dasar", jobFamily: "SDM", subJob: "Rekrutmen", status: "Tidak Tercapai", nilai: 39, deskripsi: "Wawancara tahap awal untuk menilai kesesuaian umum kandidat terhadap kriteria dasar pekerjaan." },
];

const pillClass = (s: Row["status"]) =>
  [
    "inline-flex items-center rounded-full px-3 py-1 text-[13px] font-medium ring-1",
    s === "Tercapai"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : "bg-amber-50 text-amber-700 ring-amber-200",
  ].join(" ");

export default function HardCompetencyPage() {
  const [openSet, setOpenSet] = useState<Set<string>>(new Set());
  const [year, setYear] = useState("2025");
  const years = ["2025", "2024", "2023", "2022"];

  const toggleRow = (id: string) =>
    setOpenSet((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <section className="flex flex-col gap-3 overflow-visible">
      {/* Header + Filter (tetap) */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:p-5 pb-0">
        <h2 className="text-lg sm:text-xl font-semibold">Hard Competency</h2>

        <div className="relative z-20">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-zinc-700">Tahun:</span>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Pilih tahun" />
              </SelectTrigger>
              <SelectContent position="popper" className="z-50">
                {years.map((y) => (
                  <SelectItem key={y} value={y}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* ===== TABEL (dibuat mirip Soft Competency) ===== */}
      <div className="p-4 sm:p-6">
        {/* full-bleed di mobile biar swipe kanan-kiri enak */}
        <div className="-mx-3 sm:mx-0">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm sm:text-[15px]">
              <thead>
                <tr className="text-zinc-700 border-b">
                  {/* nama kolom TIDAK diubah */}
                  <th className="py-3 px-2 text-center">No</th>
                  <th className="py-3 px-2 text-left">Kompetensi</th>
                  <th className="py-3 px-2 text-center">Status</th>
                  <th className="py-3 px-2 text-center">Nilai</th>
                  <th className="py-3 px-2 text-center">Detail</th>
                </tr>
              </thead>

              <tbody>
                {DATA.map((r, i) => {
                  const open = openSet.has(r.id);
                  return (
                    <React.Fragment key={r.id}>
                      <tr
                        className={`border-b transition ${
                          open ? "bg-zinc-50" : "hover:bg-zinc-50"
                        }`}
                      >
                        <td className="py-3 px-2 text-center whitespace-nowrap">
                          {i + 1}
                        </td>
                        <td className="py-3 px-2 leading-tight">
                          {r.nama}
                        </td>
                        <td className="py-3 px-2 text-center whitespace-nowrap">
                          <span className={pillClass(r.status)}>{r.status}</span>
                        </td>
                        <td className="py-3 px-2 text-center whitespace-nowrap">
                          {r.nilai ?? "-"}
                        </td>
                        <td className="py-3 px-2 text-center whitespace-nowrap">
                          <Button
                            size="sm"
                            className="h-9 rounded-lg px-4 text-[13px] font-semibold"
                            onClick={() => toggleRow(r.id)}
                          >
                            {open ? "Tutup" : "Detail"}
                          </Button>
                        </td>
                      </tr>

                      {open && (
                        <tr className="bg-zinc-50">
                          <td colSpan={5} className="p-0">
                            {/* kartu detail putih — selaras dengan Soft Competency */}
                            <div className="m-3 rounded-xl bg-white">
                              <div className="px-6 py-4 space-y-3">
                                <div className="grid gap-3 sm:grid-cols-2">
                                  <div>
                                    <p className="text-xs text-zinc-500">ID</p>
                                    <p className="text-[15px] font-semibold">{r.id}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-zinc-500">Kode Kompetensi</p>
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
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* ===== /TABEL ===== */}
    </section>
  );
}
