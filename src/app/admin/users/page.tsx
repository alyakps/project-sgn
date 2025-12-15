"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { getToken } from "@/lib/auth-storage";
import {
  apiAdminListKaryawan,
  apiAdminResetKaryawanPassword,
  apiAdminImportKaryawan,
} from "@/lib/api";

import {
  KeyRound,
  Pencil,
  Trash2,
  Plus,
  Upload,
  UploadCloud,
  Loader2,
  FileSpreadsheet,
} from "lucide-react";

type UserRow = {
  id: number;
  nik: string;
  name: string;
  email: string;
};

type Meta = {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
};

const MAX_FILE_SIZE_MB = 5;

const AdminUsersPage: React.FC = () => {
  const router = useRouter();

  const [users, setUsers] = React.useState<UserRow[]>([]);
  const [meta, setMeta] = React.useState<Meta | null>(null);

  const [loadingData, setLoadingData] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [search, setSearch] = React.useState<string>("");

  // reset password
  const [loadingResetUserId, setLoadingResetUserId] =
    React.useState<number | null>(null);
  const [lastResetUser, setLastResetUser] = React.useState<UserRow | null>(null);
  const [resetDialogUser, setResetDialogUser] =
    React.useState<UserRow | null>(null);

  // delete user
  const [deletingUserId, setDeletingUserId] =
    React.useState<number | null>(null);
  const [deleteDialogUser, setDeleteDialogUser] =
    React.useState<UserRow | null>(null);

  // import modal (user excel)
  const [isImportModalOpen, setIsImportModalOpen] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);
  const [statusMessage, setStatusMessage] = React.useState<string | null>(null);
  const [isImporting, setIsImporting] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const safeCurrentPage = meta?.current_page ?? 1;
  const totalPages = meta?.last_page ?? 1;

  const loadUsers = React.useCallback(
    async (page: number = 1) => {
      try {
        setLoadingData(true);
        setError(null);

        const token = getToken();
        if (!token) throw new Error("Token tidak ditemukan. Silakan login ulang.");

        const res = await apiAdminListKaryawan(token, {
          page,
          per_page: 10,
          q: search,
        });

        setUsers(res.items);
        setMeta(res.meta);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Gagal mengambil data user.");
        setUsers([]);
        setMeta(null);
      } finally {
        setLoadingData(false);
      }
    },
    [search],
  );

  React.useEffect(() => {
    void loadUsers(1);
  }, [loadUsers]);

  // =========================
  // ✅ RESET PASSWORD (FIX: pakai NIK)
  // =========================
  const doResetPassword = async (user: UserRow) => {
    try {
      setLoadingResetUserId(user.id);

      const token = getToken();
      if (!token) throw new Error("Token tidak ditemukan. Silakan login ulang.");

      // ✅ FIX DI SINI: user.id (number) → user.nik (string)
      const res = await apiAdminResetKaryawanPassword(token, user.nik);

      setLastResetUser(user);
      alert(`${res.message} Password default: ${res.default_password}`);
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Gagal reset password");
    } finally {
      setLoadingResetUserId(null);
      setResetDialogUser(null);
    }
  };

  const doDeleteUser = async (user: UserRow) => {
    try {
      setDeletingUserId(user.id);

      const token = getToken();
      if (!token) throw new Error("Token tidak ditemukan. Silakan login ulang.");

      const API_BASE_URL =
        (process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000").replace(
          /\/$/,
          "",
        ) + "/api";

      const res = await fetch(`${API_BASE_URL}/admin/karyawan/${user.id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json().catch(() => ({} as any));
      if (!res.ok) throw new Error(json.message || "Gagal menghapus user.");

      await loadUsers(safeCurrentPage);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Gagal menghapus user");
    } finally {
      setDeletingUserId(null);
      setDeleteDialogUser(null);
    }
  };

  const isAnyRowLoading = (userId: number) =>
    loadingResetUserId === userId || deletingUserId === userId;

  const validateAndSetFile = (f?: File) => {
    if (!f) {
      setFile(null);
      return;
    }

    const ext = f.name.split(".").pop()?.toLowerCase();
    if (!ext || !["xls", "xlsx"].includes(ext)) {
      setStatusMessage("Format file harus .xls atau .xlsx");
      setFile(null);
      return;
    }

    const sizeMb = f.size / (1024 * 1024);
    if (sizeMb > MAX_FILE_SIZE_MB) {
      setStatusMessage(`Ukuran file maksimal ${MAX_FILE_SIZE_MB}MB`);
      setFile(null);
      return;
    }

    setStatusMessage(null);
    setFile(f);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    validateAndSetFile(f);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const openFileDialog = () => fileInputRef.current?.click();

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setStatusMessage("Silakan pilih file terlebih dahulu.");
      return;
    }

    try {
      setIsImporting(true);
      setStatusMessage(null);

      const token = getToken();
      if (!token) throw new Error("Token tidak ditemukan. Silakan login ulang.");

      await apiAdminImportKaryawan(token, file);

      setIsImportModalOpen(false);
      setFile(null);
      setStatusMessage(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      await loadUsers(1);
    } catch (err: any) {
      console.error(err);
      setStatusMessage(err.message || "Terjadi kesalahan saat import user.");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Manajemen User</h1>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:w-64">
            <Input
              placeholder="Cari NIK / Nama / Email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              className="h-9"
              onClick={() => {
                setIsImportModalOpen(true);
                setStatusMessage(null);
                setFile(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
            >
              <Upload className="mr-1 h-4 w-4" />
              Import
            </Button>

            <Button
              size="sm"
              className="h-9"
              onClick={() => router.push("/admin/users/create")}
            >
              <Plus className="mr-1 h-4 w-4" />
              Add User
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
          {error}
        </div>
      )}

      {lastResetUser && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
          Password untuk{" "}
          <span className="font-semibold">{lastResetUser.name}</span> (
          {lastResetUser.nik}) telah direset ke default:{" "}
          <span className="font-mono font-semibold">123</span>.
        </div>
      )}

      <div className="overflow-x-auto rounded-md bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-gray-700">
                NIK
              </th>
              <th className="px-4 py-2 text-left font-medium text-gray-700">
                Nama
              </th>
              <th className="px-4 py-2 text-left font-medium text-gray-700">
                Email
              </th>
              <th className="px-4 py-2 text-center font-medium text-gray-700">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {loadingData && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-500">
                  Memuat data user...
                </td>
              </tr>
            )}

            {!loadingData && users.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-500">
                  Tidak ada data user.
                </td>
              </tr>
            )}

            {!loadingData &&
              users.map((user) => {
                const rowLoading = isAnyRowLoading(user.id);

                return (
                  <tr key={user.id} className="transition-colors hover:bg-gray-50">
                    <td className="px-4 py-2 align-middle">{user.nik}</td>
                    <td className="px-4 py-2 align-middle">{user.name}</td>
                    <td className="px-4 py-2 align-middle">{user.email}</td>

                    <td className="px-4 py-2 align-middle">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setResetDialogUser(user)}
                          disabled={rowLoading}
                        >
                          <KeyRound className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => router.push(`/admin/users/${user.nik}/edit`)}
                          disabled={rowLoading}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 border-red-200 text-red-600 hover:bg-red-50"
                          onClick={() => setDeleteDialogUser(user)}
                          disabled={rowLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {meta && meta.total > 0 && (
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-zinc-600">
            Halaman <span className="font-semibold">{safeCurrentPage}</span> dari{" "}
            <span className="font-semibold">{totalPages}</span>
          </span>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={safeCurrentPage <= 1 || loadingData}
              onClick={() => !loadingData && loadUsers(safeCurrentPage - 1)}
            >
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={safeCurrentPage >= totalPages || loadingData}
              onClick={() => !loadingData && loadUsers(safeCurrentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Dialog Reset Password */}
      <Dialog open={!!resetDialogUser} onOpenChange={(open) => !open && setResetDialogUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Password user akan direset ke default <b>123</b>. Pastikan Anda sudah menginformasikan kepada yang bersangkutan.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-2 text-sm">
            {resetDialogUser && (
              <p>
                User:{" "}
                <span className="font-semibold">
                  {resetDialogUser.name} ({resetDialogUser.nik})
                </span>
              </p>
            )}
          </div>

          <DialogFooter className="mt-4 flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setResetDialogUser(null)}
              disabled={resetDialogUser ? loadingResetUserId === resetDialogUser.id : false}
            >
              Batal
            </Button>
            <Button
              size="sm"
              onClick={() => resetDialogUser && doResetPassword(resetDialogUser)}
              disabled={resetDialogUser ? loadingResetUserId === resetDialogUser.id : false}
            >
              {resetDialogUser && loadingResetUserId === resetDialogUser.id ? "Mereset..." : "Reset Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Delete User */}
      <Dialog open={!!deleteDialogUser} onOpenChange={(open) => !open && setDeleteDialogUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus User</DialogTitle>
            <DialogDescription>
              Tindakan ini akan menghapus user dari sistem. Data kompetensi dan profil yang terhubung mungkin ikut terdampak sesuai pengaturan backend. Pastikan Anda yakin sebelum melanjutkan.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-2 text-sm">
            {deleteDialogUser && (
              <p>
                Yakin menghapus{" "}
                <span className="font-semibold">
                  {deleteDialogUser.name} ({deleteDialogUser.nik})
                </span>
                ?
              </p>
            )}
          </div>

          <DialogFooter className="mt-4 flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteDialogUser(null)}
              disabled={deleteDialogUser ? deletingUserId === deleteDialogUser.id : false}
            >
              Batal
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => deleteDialogUser && doDeleteUser(deleteDialogUser)}
              disabled={deleteDialogUser ? deletingUserId === deleteDialogUser.id : false}
            >
              {deleteDialogUser && deletingUserId === deleteDialogUser.id ? "Menghapus..." : "Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Import User */}
      <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
        <DialogContent className="sm:max-w-md max-w-md w-full flex flex-col items-center gap-3 py-4 px-4">
          <DialogHeader className="w-full text-center">
            <DialogTitle className="flex flex-col items-center gap-1 text-base sm:text-lg font-semibold text-zinc-900">
              <UploadCloud className="h-6 w-6 text-[#05398f]" />
              <span>Import User</span>
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-zinc-500 mt-1">
              Upload file Excel berisi daftar karyawan. Pastikan format kolom sesuai template.
            </DialogDescription>
          </DialogHeader>

          <div className="w-full px-1">
            <form onSubmit={handleImportSubmit} className="space-y-3 sm:space-y-4 w-full max-w-md mx-auto">
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
                    disabled={isImporting}
                  >
                    <UploadCloud className="h-4 w-4" />
                    <span className="text-sm font-medium">Pilih File</span>
                  </Button>

                  {file && (
                    <p className="mt-1 text-xs text-zinc-600">
                      Selected: <span className="font-medium text-zinc-800">{file.name}</span>
                    </p>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  id="excel-file-input"
                  type="file"
                  accept=".xls,.xlsx"
                  className="hidden"
                  onChange={(e) => validateAndSetFile(e.target.files?.[0] ?? undefined)}
                />

                <p className="text-xs text-zinc-500 text-center">
                  Maksimal {MAX_FILE_SIZE_MB}MB.
                </p>

                {statusMessage && (
                  <p className="text-xs text-red-600 text-center">{statusMessage}</p>
                )}
              </div>

              <div className="pt-1 flex justify-center">
                <Button
                  type="submit"
                  disabled={!file || isImporting}
                  className="inline-flex items-center gap-2 bg-[#05398f] hover:bg-[#032b6a]"
                >
                  {isImporting ? (
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
    </div>
  );
};

export default AdminUsersPage;
