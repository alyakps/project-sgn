"use client";

import * as React from "react";
import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Plus, UploadCloud, FileSpreadsheet, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Dialog,
  DialogContent,
  DialogHeader as DialogHeaderBase,
  DialogTitle as DialogTitleBase,
} from "@/components/ui/dialog";

import {
  fetchImportLogs,
  importCompetencyFile,
  type ImportLog,
  type ImportType,
} from "@/lib/api-import";

/** ===== CONSTANTS ===== */
const PAGE_SIZE = 10;
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024; // 10 MB

export default function DataEntryPage() {
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState<ImportType>("hard");
  const [year, setYear] = useState<number>(2024);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const queryClient = useQueryClient();

  // pagination untuk log import
  const [currentPage, setCurrentPage] = useState(1);

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

  // reset halaman kalau jumlah data berubah
  React.useEffect(() => {
    setCurrentPage(1);
  }, [logs.length]);

  const totalItems = logs.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const pagedLogs = logs.slice(startIndex, endIndex);

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

      setIsImportModalOpen(false);
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

  const validateAndSetFile = (f: File | undefined | null) => {
    if (!f) return;

    if (f.size > MAX_FILE_SIZE) {
      setStatusMessage(`Ukuran file maksimal ${MAX_FILE_SIZE_MB}MB.`);
      // reset input kalau lewat batas
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setFile(null);
      return;
    }

    setFile(f);
    setStatusMessage(null);
  };

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
    validateAndSetFile(droppedFile);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  /* ==================== RENDER ==================== */

  return (
    <div className="space-y-6">
      {/* Header halaman (tanpa tombol import) */}
      <div>
        <h1 className="text-xl font-semibold text-zinc-900">
          Import Nilai Kompetensi
        </h1>
      </div>

      {/* Modal Import */}
      <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
        <DialogContent className="sm:max-w-md max-w-md w-full flex flex-col items-center gap-3 py-4 px-4">
          <DialogHeaderBase className="w-full text-center">
            <DialogTitleBase className="flex flex-col items-center gap-1 text-base sm:text-lg font-semibold text-zinc-900">
              <UploadCloud className="h-6 w-6 text-[#05398f]" />
              <span>Import File Excel</span>
            </DialogTitleBase>
          </DialogHeaderBase>

          {/* Container form sederhana, tanpa card/border, pusat */}
          <div className="w-full px-1">
            <form
              onSubmit={handleSubmit}
              className="space-y-3 sm:space-y-4 w-full max-w-md mx-auto"
            >
              {/* Jenis Kompetensi */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-800">
                  Jenis Kompetensi
                </label>

                <Select
                  value={type}
                  onValueChange={(val: ImportType) => setType(val)}
                  disabled={importMutation.isPending}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Pilih jenis kompetensi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hard">Hard Competency</SelectItem>
                    <SelectItem value="soft">Soft Competency</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tahun */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-800">
                  Tahun
                </label>

                <Select
                  value={String(year)}
                  onValueChange={(val) => setYear(Number(val))}
                  disabled={importMutation.isPending}
                >
                  <SelectTrigger className="h-9 text-sm">
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

              {/* Dropzone */}
              <div className="space-y-1.5">
                <div
                  className="flex flex-col items-center justify-center gap-3 rounded-md border-2 border-dashed border-zinc-300 bg-zinc-50 px-4 py-4 text-center"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                >
                  <p className="text-xs text-zinc-500">
                    Drag and drop file (*.xls, *.xlsx) atau klik tombol
                  </p>

                  <Button
                    type="button"
                    onClick={openFileDialog}
                    className="inline-flex items-center gap-2 bg-[#05398f] hover:bg-[#032b6a]"
                    disabled={importMutation.isPending}
                  >
                    <UploadCloud className="h-4 w-4" />
                    <span className="text-sm font-medium">Pilih File</span>
                  </Button>

                  {file && (
                    <p className="mt-1 text-xs text-zinc-600">
                      Selected:{" "}
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
                  onChange={(e) => validateAndSetFile(e.target.files?.[0])}
                />

                <p className="text-xs text-zinc-500 text-center">
                  Maksimal {MAX_FILE_SIZE_MB}MB.
                </p>

                {statusMessage && (
                  <p className="text-xs text-red-600 text-center">
                    {statusMessage}
                  </p>
                )}
              </div>

              {/* Save */}
              <div className="pt-1 flex justify-center">
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
          </div>
        </DialogContent>
      </Dialog>

      {/* Log Import + tombol Import sejajar */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-[#05398f]" />
            <h2 className="text-base sm:text-lg font-semibold text-zinc-900">
              Log Import
            </h2>
          </div>

          <Button
            type="button"
            onClick={() => {
              setStatusMessage(null);
              setIsImportModalOpen(true);
            }}
            className="inline-flex items-center gap-2 bg-[#05398f] hover:bg-[#032b6a]"
          >
            <Plus className="h-4 w-4" />
            <span className="text-sm font-medium">Import</span>
          </Button>
        </div>

        {/* Tabel log + pagination bentuk seperti screenshot */}
        <div className="p-0 sm:p-1">
          <div className="w-full overflow-x-auto">
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
              <>
                <table className="w-full text-sm sm:text-[15px]">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 text-gray-800">
                      <th className="py-3 px-4 text-left text-sm font-semibold">
                        Nama File
                      </th>
                      <th className="py-3 px-4 text-left text-sm font-semibold">
                        Jenis Kompetensi
                      </th>
                      <th className="py-3 px-4 text-left text-sm font-semibold">
                        Tahun
                      </th>
                      <th className="py-3 px-4 text-left text-sm font-semibold">
                        Uploaded At
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {pagedLogs.map((log) => (
                      <tr
                        key={log.id}
                        className="border-b border-gray-200 bg-white"
                      >
                        <td className="py-3 px-4 align-middle text-gray-800">
                          {log.filename}
                        </td>
                        <td className="py-3 px-4 align-middle">
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
                        <td className="py-3 px-4 align-middle text-gray-700">
                          {log.year ?? "-"}
                        </td>
                        <td className="py-3 px-4 align-middle text-gray-700">
                          {log.uploadedAt}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination di luar tabel, seperti di gambar */}
                {totalItems > 0 && (
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-zinc-600">
                      Halaman{" "}
                      <span className="font-semibold">
                        {safeCurrentPage}
                      </span>{" "}
                      dari{" "}
                      <span className="font-semibold">{totalPages}</span>
                    </span>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={safeCurrentPage <= 1 || isLogsLoading}
                        onClick={handlePrevPage}
                      >
                        Prev
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={
                          safeCurrentPage >= totalPages || isLogsLoading
                        }
                        onClick={handleNextPage}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
