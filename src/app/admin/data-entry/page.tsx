"use client";

import * as React from "react";
import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { UploadCloud, FileSpreadsheet, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  fetchImportLogs,
  importCompetencyFile,
  type ImportLog,
  type ImportType,
} from "@/lib/api-import";

export default function DataEntryPage() {
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState<ImportType>("hard");
  const [year, setYear] = useState<number>(2024);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const queryClient = useQueryClient();

  // Tahun 2000–2100
  const yearOptions = React.useMemo(
    () => Array.from({ length: 101 }, (_, i) => 2000 + i),
    []
  );

  /* ==================== FETCH LOG IMPORT ==================== */

  const {
    data: logsData,
    isLoading: isLogsLoading,
    isError: isLogsError,
    error: logsError,
  } = useQuery<ImportLog[]>({
    queryKey: ["import-logs"],
    queryFn: fetchImportLogs,
  });

  const logs = logsData ?? [];

  /* ==================== MUTATION IMPORT FILE ==================== */

  const importMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("File belum dipilih");
      return importCompetencyFile(type, file, year);
    },
    onSuccess: () => {
      setStatusMessage("Import berhasil disimpan.");
      queryClient.invalidateQueries({ queryKey: ["import-logs"] });

      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    onError: (err: unknown) => {
      if (err instanceof Error) {
        setStatusMessage(err.message);
      } else {
        setStatusMessage("Gagal mengimport file.");
      }
    },
  });

  /* ==================== HANDLERS ==================== */

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    if (!file) {
      setStatusMessage("Silakan pilih file terlebih dahulu.");
      return;
    }
    importMutation.mutate();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      setFile(droppedFile);
      setStatusMessage(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  /* ==================== RENDER ==================== */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-zinc-900">
          Import Nilai Kompetensi
        </h1>
      </div>

      {/* Form Import (tetap pakai Card) */}
      <Card className="border-zinc-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <UploadCloud className="h-5 w-5 text-[#05398f]" />
            Import File Excel
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Pilih jenis kompetensi dan unggah file Excel (.xls / .xlsx)
            sesuai template yang sudah ditentukan.
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

              <div suppressHydrationWarning>
                <Select
                  value={type}
                  onValueChange={(val: ImportType) => setType(val)}
                  disabled={importMutation.isPending}
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

              <div suppressHydrationWarning>
                <Select
                  value={String(year)}
                  onValueChange={(val) => setYear(Number(val))}
                  disabled={importMutation.isPending}
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
                  disabled={importMutation.isPending}
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
                  if (f) {
                    setFile(f);
                    setStatusMessage(null);
                  }
                }}
              />

              <p className="text-xs text-zinc-500">
                Maksimal 10MB. Pastikan format kolom sudah sesuai.
              </p>

              {statusMessage && (
                <p className="text-xs text-red-600">{statusMessage}</p>
              )}
            </div>

            {/* Submit */}
            <div className="pt-1">
              <Button
                type="submit"
                disabled={!file || importMutation.isPending}
                className="inline-flex items-center gap-2 bg-[#05398f] hover:bg-[#032b6a]"
              >
                {importMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Uploading...</span>
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="h-4 w-4" />
                    <span className="text-sm">Save</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Log Import - TANPA CARD, tabel full width */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-[#05398f]" />
            <h2 className="text-base sm:text-lg font-semibold text-zinc-900">
              Log Import
            </h2>
          </div>
        </div>

        {/* Wrapper tabel ujung ke ujung */}
        <div className="overflow-x-auto">
          <div className="min-w-full border border-zinc-200 rounded-md overflow-hidden">
            {isLogsLoading ? (
              <p className="px-4 py-3 text-sm text-zinc-500">
                Memuat log import...
              </p>
            ) : isLogsError ? (
              <p className="px-4 py-3 text-sm text-red-600">
                {(logsError as Error)?.message ??
                  "Gagal memuat log import dari server."}
              </p>
            ) : logs.length === 0 ? (
              <p className="px-4 py-3 text-sm text-zinc-500">
                Belum ada data import yang tercatat.
              </p>
            ) : (
              <table className="min-w-full border-collapse">
                <thead className="bg-zinc-50">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-xs sm:text-sm font-medium text-zinc-700 border-b border-zinc-200">
                      Nama File
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs sm:text-sm font-medium text-zinc-700 border-b border-zinc-200">
                      Jenis Kompetensi
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs sm:text-sm font-medium text-zinc-700 border-b border-zinc-200">
                      Tahun
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs sm:text-sm font-medium text-zinc-700 border-b border-zinc-200">
                      Uploaded At
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, idx) => (
                    <tr
                      key={log.id}
                      className={
                        idx % 2 === 0 ? "bg-white" : "bg-zinc-50/70"
                      }
                    >
                      <td className="px-4 py-2.5 text-xs sm:text-sm text-zinc-800 border-b border-zinc-100">
                        {log.filename}
                      </td>
                      <td className="px-4 py-2.5 text-xs sm:text-sm border-b border-zinc-100">
                        <span
                          className={[
                            "inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium border",
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
                      <td className="px-4 py-2.5 text-xs sm:text-sm text-zinc-700 border-b border-zinc-100">
                        {log.year ?? "-"}
                      </td>
                      <td className="px-4 py-2.5 text-xs sm:text-sm text-zinc-700 border-b border-zinc-100">
                        {log.uploadedAt}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
