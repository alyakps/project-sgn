"use client";

import * as React from "react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { UploadCloud, FileSpreadsheet } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ImportType = "hard" | "soft";

type ImportLog = {
  id: number;
  filename: string;
  type: ImportType;
  uploadedAt: string;
  year?: number;
};

export default function DataEntryPage() {
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState<ImportType>("hard");
  const [logs, setLogs] = useState<ImportLog[]>([
    {
      id: 1,
      filename: "hard_competency_2024.xlsx",
      type: "hard",
      uploadedAt: "2025-12-03 10:15",
      year: 2024,
    },
    {
      id: 2,
      filename: "soft_competency_2024.xlsx",
      type: "soft",
      uploadedAt: "2025-12-03 10:30",
      year: 2024,
    },
  ]);

  // Tahun 2000–2100
  const yearOptions = Array.from({ length: 101 }, (_, i) => 2000 + i);
  const [year, setYear] = useState<number>(2024);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    const now = new Date();
    const uploadedAt = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}-${String(now.getDate()).padStart(
      2,
      "0"
    )} ${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;

    setLogs((prev) => [
      {
        id: prev.length ? prev[prev.length - 1].id + 1 : 1,
        filename: file.name,
        type,
        uploadedAt,
        year,
      },
      ...prev,
    ]);

    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-zinc-900">
          Import Nilai Kompetensi
        </h1>
      </div>

      {/* Form Import */}
      <Card className="border-zinc-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <UploadCloud className="h-5 w-5 text-[#05398f]" />
            Import File Excel
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Pilih jenis kompetensi dan unggah file Excel (.xls / .xlsx) sesuai
            template yang sudah ditentukan.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="space-y-4 sm:space-y-5 max-w-xl"
          >
            {/* Jenis Kompetensi - dropdown */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-800">
                Jenis Kompetensi
              </label>

              {/* ⬇️ suppressHydrationWarning utk cegah warning Select Radix */}
              <div suppressHydrationWarning>
                <Select
                  value={type}
                  onValueChange={(val: ImportType) => setType(val)}
                >
                  <SelectTrigger className="w-full sm:w-72">
                    <SelectValue placeholder="Pilih jenis kompetensi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hard">Hard Competency</SelectItem>
                    <SelectItem value="soft">Soft Competency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tahun (2000–2100) */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-800">
                Tahun
              </label>

              {/* ⬇️ suppressHydrationWarning lagi di Select tahun */}
              <div suppressHydrationWarning>
                <Select
                  value={String(year)}
                  onValueChange={(val) => setYear(Number(val))}
                >
                  <SelectTrigger className="w-full sm:w-72">
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

            {/* Dropzone + Import button */}
            <div className="space-y-1.5">
              <div
                className="flex flex-col items-center justify-center gap-3 rounded-md border-2 border-dashed border-zinc-300 bg-zinc-50 px-4 py-6 text-center"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <p className="text-xs text-zinc-500">
                  Drag and drop to upload data file (*.xls, *.xlsx) or import
                  file from your computer
                </p>

                <Button
                  type="button"
                  onClick={openFileDialog}
                  className="inline-flex items-center gap-2 bg-[#05398f] hover:bg-[#032b6a]"
                >
                  <UploadCloud className="h-4 w-4" />
                  <span className="text-sm font-medium">Import</span>
                </Button>

                {file && (
                  <p className="mt-1 text-xs text-zinc-600">
                    Selected file:{" "}
                    <span className="font-medium text-zinc-800">
                      {file.name}
                    </span>
                  </p>
                )}
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                id="excel-file-input"
                type="file"
                accept=".xls,.xlsx"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setFile(f);
                }}
              />

              <p className="text-xs text-zinc-500">
                Maksimal 10MB. Pastikan format kolom sudah sesuai template
                sistem.
              </p>
            </div>

            {/* Submit */}
            <div className="pt-1">
              <Button
                type="submit"
                disabled={!file}
                className="inline-flex items-center gap-2 bg-[#05398f] hover:bg-[#032b6a]"
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span className="text-sm">Save</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Log Import */}
      <Card className="border-zinc-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <FileSpreadsheet className="h-5 w-5 text-[#05398f]" />
            Log Import
          </CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="text-sm text-zinc-500">
              Belum ada data import yang tercatat.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-zinc-200 text-xs sm:text-sm">
                <thead className="bg-zinc-50">
                  <tr>
                    <th className="border-b border-zinc-200 px-3 py-2 text-left font-medium text-zinc-700">
                      Nama File
                    </th>
                    <th className="border-b border-zinc-200 px-3 py-2 text-left font-medium text-zinc-700">
                      Jenis Kompetensi
                    </th>
                    <th className="border-b border-zinc-200 px-3 py-2 text-left font-medium text-zinc-700">
                      Tahun
                    </th>
                    <th className="border-b border-zinc-200 px-3 py-2 text-left font-medium text-zinc-700">
                      Uploaded At
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr
                      key={log.id}
                      className="odd:bg-white even:bg-zinc-50/60"
                    >
                      <td className="border-b border-zinc-100 px-3 py-2 text-zinc-800">
                        {log.filename}
                      </td>
                      <td className="border-b border-zinc-100 px-3 py-2">
                        <span
                          className={[
                            "inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium border",
                            log.type === "hard"
                              ? "bg-blue-50 text-blue-700 border-blue-100"
                              : "bg-emerald-50 text-emerald-700 border-emerald-100",
                          ].join(" ")}
                        >
                          {log.type === "hard"
                            ? "Hard Competency"
                            : "Soft Competency"}
                        </span>
                      </td>
                      <td className="border-b border-zinc-100 px-3 py-2 text-zinc-700">
                        {log.year ?? "-"}
                      </td>
                      <td className="border-b border-zinc-100 px-3 py-2 text-zinc-700">
                        {log.uploadedAt}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
