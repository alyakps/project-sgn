"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectValue,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Info } from "lucide-react";

/* ====================== TYPES ====================== */

type EmployeeRow = {
  id: string;
  nik: string;
  nama: string;
  unitKerja: string;
};

type HardItem = {
  idKey: string; // key internal utk React & toggle
  displayId: string; // ID kompetensi yang ditampilkan
  kode: string;
  nama: string;
  jobFamily: string;
  subJob: string;
  status: string; // lowercase dari API
  nilai: number | null;
  deskripsi: string;
};

type YearHistory = {
  year: number;
  items: HardItem[];
};

/* ====================== DUMMY DATA ADMIN ====================== */

const EMPLOYEES: EmployeeRow[] = [
  {
    id: "emp-001",
    nik: "SGN001",
    nama: "Andi Setiawan",
    unitKerja: "HR & People Development",
  },
  {
    id: "emp-002",
    nik: "SGN002",
    nama: "Budi Santoso",
    unitKerja: "Plant / Pabrik",
  },
  {
    id: "emp-003",
    nik: "SGN003",
    nama: "Citra Lestari",
    unitKerja: "Finance & Accounting",
  },
];

const HARD_HISTORY: Record<string, YearHistory[]> = {
  "emp-001": [
    {
      year: 2023,
      items: [
        {
          idKey: "emp-001-2023-HC01",
          displayId: "HC-01-2023-HR",
          kode: "HC-01",
          nama: "Penguasaan Proses Bisnis",
          jobFamily: "HR",
          subJob: "People Development",
          status: "tercapai",
          nilai: 82,
          deskripsi: "Memahami alur proses bisnis HR lintas unit.",
        },
        {
          idKey: "emp-001-2023-HC02",
          displayId: "HC-02-2023-HR",
          kode: "HC-02",
          nama: "Analisis Data SDM",
          jobFamily: "HR",
          subJob: "People Development",
          status: "tidak tercapai",
          nilai: 69,
          deskripsi: "Perlu pendampingan dalam advanced analytics.",
        },
      ],
    },
    {
      year: 2024,
      items: [
        {
          idKey: "emp-001-2024-HC01",
          displayId: "HC-01-2024-HR",
          kode: "HC-01",
          nama: "Penguasaan Proses Bisnis",
          jobFamily: "HR",
          subJob: "People Development",
          status: "tercapai",
          nilai: 86,
          deskripsi: "Menjadi rujukan tim lain dalam proses HR.",
        },
        {
          idKey: "emp-001-2024-HC02",
          displayId: "HC-02-2024-HR",
          kode: "HC-02",
          nama: "Analisis Data SDM",
          jobFamily: "HR",
          subJob: "People Development",
          status: "tercapai",
          nilai: 77,
          deskripsi: "Menyusun dashboard dan insight secara mandiri.",
        },
      ],
    },
  ],
  "emp-002": [
    {
      year: 2023,
      items: [
        {
          idKey: "emp-002-2023-HC03",
          displayId: "HC-03-2023-PLT",
          kode: "HC-03",
          nama: "Operasional Pabrik",
          jobFamily: "Plant",
          subJob: "Produksi",
          status: "tercapai",
          nilai: 75,
          deskripsi: "Mampu mengoperasikan mesin utama sesuai SOP.",
        },
      ],
    },
    {
      year: 2024,
      items: [
        {
          idKey: "emp-002-2024-HC03",
          displayId: "HC-03-2024-PLT",
          kode: "HC-03",
          nama: "Operasional Pabrik",
          jobFamily: "Plant",
          subJob: "Produksi",
          status: "tercapai",
          nilai: 79,
          deskripsi: "Konsisten menjaga performa dan safety.",
        },
      ],
    },
  ],
  "emp-003": [
    {
      year: 2022,
      items: [
        {
          idKey: "emp-003-2022-HC04",
          displayId: "HC-04-2022-FIN",
          kode: "HC-04",
          nama: "Pengelolaan Anggaran",
          jobFamily: "Finance",
          subJob: "Accounting",
          status: "tercapai",
          nilai: 81,
          deskripsi: "Menyusun budget unit kerja dengan rapi.",
        },
      ],
    },
    {
      year: 2023,
      items: [
        {
          idKey: "emp-003-2023-HC04",
          displayId: "HC-04-2023-FIN",
          kode: "HC-04",
          nama: "Pengelolaan Anggaran",
          jobFamily: "Finance",
          subJob: "Accounting",
          status: "tercapai",
          nilai: 85,
          deskripsi: "Akurat dan tepat waktu dalam pelaporan.",
        },
      ],
    },
  ],
};

/* ====================== UTIL ====================== */

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

/* ====================== PAGE ====================== */

export default function AdminHardCompetencyPage() {
  const [search, setSearch] = React.useState("");
  const [unitFilter, setUnitFilter] = React.useState<string>("all");

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedEmployee, setSelectedEmployee] =
    React.useState<EmployeeRow | null>(null);
  const [selectedYear, setSelectedYear] = React.useState<string>("");

  const [openSet, setOpenSet] = React.useState<Set<string>>(new Set());

  const unitOptions = React.useMemo(
    () => Array.from(new Set(EMPLOYEES.map((e) => e.unitKerja))),
    []
  );

  const filteredEmployees = EMPLOYEES.filter((emp) => {
    const key = search.trim().toLowerCase();
    const matchSearch =
      key === "" ||
      emp.nama.toLowerCase().includes(key) ||
      emp.nik.toLowerCase().includes(key);

    const matchUnit =
      unitFilter === "all" || emp.unitKerja === unitFilter;

    return matchSearch && matchUnit;
  });

  const activeHistory: YearHistory[] =
    (selectedEmployee && HARD_HISTORY[selectedEmployee.id]) || [];

  const yearOptions = activeHistory
    .map((h) => h.year)
    .sort((a, b) => a - b);

  const currentYearHistory =
    activeHistory.find((h) => String(h.year) === selectedYear) || null;

  const handleOpenDetail = (emp: EmployeeRow) => {
    setSelectedEmployee(emp);

    const history = HARD_HISTORY[emp.id] ?? [];
    if (history.length > 0) {
      const latest = history
        .map((h) => h.year)
        .sort((a, b) => b - a)[0];
      setSelectedYear(String(latest));
    } else {
      setSelectedYear("");
    }

    setOpenSet(new Set());
    setDialogOpen(true);
  };

  const toggleRow = (idKey: string) =>
    setOpenSet((prev) => {
      const next = new Set(prev);
      next.has(idKey) ? next.delete(idKey) : next.add(idKey);
      return next;
    });

  return (
    <section className="max-w-6xl mx-auto space-y-5 px-3 sm:px-4 lg:px-0">
      {/* Title */}
      <div className="pt-1">
        <h1 className="text-xl font-semibold text-zinc-900">
          Hard Competency
        </h1>
      </div>

      {/* Search + filter (layout lama, tapi digeser kanan pakai padding) */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pr-4 sm:pr-10">
        <div className="w-full sm:max-w-sm">
          <Input
            placeholder="Cari nama atau NIK karyawan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-600">Unit Kerja:</span>
          <div className="w-48">
            <Select
              value={unitFilter}
              onValueChange={(val) => setUnitFilter(val)}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Semua unit kerja" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Unit</SelectItem>
                {unitOptions.map((unit) => (
                  <SelectItem key={unit} value={unit}>
                    {unit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Tabel utama */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm sm:text-[15px] border-collapse">
          <thead>
            <tr className="text-zinc-700 border-b">
              <th className="py-3 px-2 text-center w-[60px]">No</th>
              <th className="py-3 px-2 text-left w-[130px]">NIK</th>
              <th className="py-3 px-2 text-left">Nama Karyawan</th>
              <th className="py-3 px-2 text-left">Unit Kerja</th>
              <th className="py-3 px-2 text-center w-[110px]">Detail</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="py-6 text-center text-sm text-muted-foreground"
                >
                  Tidak ada karyawan yang cocok dengan filter.
                </td>
              </tr>
            )}

            {filteredEmployees.map((emp, idx) => (
              <tr
                key={emp.id}
                className={`border-b transition ${
                  idx % 2 === 0 ? "bg-white" : "bg-zinc-50/70"
                }`}
              >
                <td className="py-3 px-2 text-center align-middle">
                  {idx + 1}
                </td>
                <td className="py-3 px-2 align-middle text-zinc-800 whitespace-nowrap">
                  {emp.nik}
                </td>
                <td className="py-3 px-2 align-middle text-zinc-900">
                  {emp.nama}
                </td>
                <td className="py-3 px-2 align-middle text-zinc-700">
                  {emp.unitKerja}
                </td>
                <td className="py-3 px-2 text-center align-middle">
                  <Button
                    size="sm"
                    className="h-9 rounded-lg px-4 text-[13px] font-semibold"
                    variant="outline"
                    onClick={() => handleOpenDetail(emp)}
                  >
                    <Info className="h-3.5 w-3.5 mr-1" />
                    Detail
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dialog detail */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-full max-w-[1400px] max-h-[90vh] overflow-y-auto p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-sm sm:text-base">
              Detail Hard Competency Karyawan
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Riwayat nilai hard competency per tahun untuk karyawan terpilih.
            </DialogDescription>
          </DialogHeader>

          {selectedEmployee ? (
            <div className="space-y-4 pb-2 w-full">
              {/* Info karyawan */}
              <div className="rounded-md border border-zinc-200 bg-zinc-50 px-6 py-4 text-sm text-zinc-700 w-full">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-zinc-500">
                      Nama Karyawan
                    </p>
                    <p className="mt-0.5 text-sm font-medium text-zinc-900">
                      {selectedEmployee.nama}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-zinc-500">
                      NIK
                    </p>
                    <p className="mt-0.5 text-sm font-medium text-zinc-900">
                      {selectedEmployee.nik}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-zinc-500">
                      Unit Kerja
                    </p>
                    <p className="mt-0.5 text-sm font-medium text-zinc-900">
                      {selectedEmployee.unitKerja}
                    </p>
                  </div>
                </div>
              </div>

              {/* Pilih tahun */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-zinc-800">
                    Tahun Penilaian
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    Pilih tahun untuk melihat daftar hard competency.
                  </p>
                </div>
                <div className="w-32">
                  <Select
                    value={selectedYear}
                    onValueChange={(val) => {
                      setSelectedYear(val);
                      setOpenSet(new Set());
                    }}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Pilih tahun" />
                    </SelectTrigger>
                    <SelectContent>
                      {yearOptions.map((y) => (
                        <SelectItem key={y} value={String(y)}>
                          {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Tabel riwayat */}
              <div className="border border-zinc-200 rounded-md overflow-x-auto w-full">
                {(!currentYearHistory ||
                  currentYearHistory.items.length === 0) ? (
                  <p className="px-4 py-3 text-xs sm:text-sm text-zinc-500">
                    Belum ada data nilai untuk tahun{" "}
                    {selectedYear || "(tahun belum dipilih)"}.
                  </p>
                ) : (
                  <table className="w-full text-sm sm:text-[15px] border-collapse">
                    <thead>
                      <tr className="text-zinc-700 bg-zinc-50 border-b">
                        <th className="py-3 px-2 text-center w-[60px]">
                          No
                        </th>
                        <th className="py-3 px-2 text-left">Kompetensi</th>
                        <th className="py-3 px-2 text-center w-[140px]">
                          Status
                        </th>
                        <th className="py-3 px-2 text-center w-[90px]">
                          Nilai
                        </th>
                        <th className="py-3 px-2 text-center w-[110px]">
                          Detail
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentYearHistory.items.map((item, idx) => {
                        const open = openSet.has(item.idKey);
                        return (
                          <React.Fragment key={item.idKey}>
                            <tr
                              className={`border-b transition ${
                                open
                                  ? "bg-zinc-50/60"
                                  : idx % 2 === 0
                                  ? "bg-white hover:bg-zinc-50"
                                  : "bg-zinc-50/60 hover:bg-zinc-100"
                              }`}
                            >
                              <td className="py-3 px-2 text-center align-middle">
                                {idx + 1}
                              </td>
                              <td className="py-3 px-2 align-middle">
                                <span className="font-semibold text-zinc-900">
                                  {item.nama}
                                </span>
                              </td>
                              <td className="py-3 px-2 text-center align-middle">
                                <span className={pillClass(item.status)}>
                                  {formatStatus(item.status)}
                                </span>
                              </td>
                              <td className="py-3 px-2 text-center align-middle">
                                {item.nilai ?? "-"}
                              </td>
                              <td className="py-3 px-2 text-center align-middle">
                                <Button
                                  size="sm"
                                  className="h-9 rounded-lg px-4 text-[13px] font-semibold"
                                  onClick={() => toggleRow(item.idKey)}
                                >
                                  {open ? "Tutup" : "Detail"}
                                </Button>
                              </td>
                            </tr>

                            {open && (
                              <tr className="bg-zinc-50">
                                <td colSpan={5} className="p-0">
                                  <div className="mx-2 sm:mx-4 lg:mx-6 mb-4 mt-0 rounded-xl bg-white shadow-[0_2px_8px_rgba(15,23,42,0.03)] border border-zinc-100">
                                    <div className="px-6 py-4 space-y-4">
                                      {/* 4 kolom info utama */}
                                      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                        <div>
                                          <p className="text-xs text-zinc-500">
                                            ID Kompetensi
                                          </p>
                                          <p className="text-[15px] font-semibold">
                                            {item.displayId}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-xs text-zinc-500">
                                            Kode Kompetensi
                                          </p>
                                          <p className="text-[15px] font-semibold">
                                            {item.kode}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-xs text-zinc-500">
                                            Job Family Kompetensi
                                          </p>
                                          <p className="text-[15px] font-semibold">
                                            {item.jobFamily}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-xs text-zinc-500">
                                            Sub Job Family Kompetensi
                                          </p>
                                          <p className="text-[15px] font-semibold">
                                            {item.subJob}
                                          </p>
                                        </div>
                                      </div>

                                      {/* Deskripsi */}
                                      <div className="pt-3 border-t border-zinc-100">
                                        <p className="mb-1 text-xs text-zinc-500">
                                          Deskripsi
                                        </p>
                                        <p className="text-[15px] leading-relaxed text-zinc-800">
                                          {item.deskripsi ||
                                            "Belum ada deskripsi untuk kompetensi ini."}
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
                )}
              </div>

              <div className="flex justify-end">
                <DialogClose asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 text-xs"
                  >
                    Tutup
                  </Button>
                </DialogClose>
              </div>
            </div>
          ) : (
            <p className="text-xs sm:text-sm text-zinc-500">
              Tidak ada karyawan yang dipilih.
            </p>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
