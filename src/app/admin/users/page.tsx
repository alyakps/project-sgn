"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { getToken } from "@/lib/auth-storage";
import {
  apiAdminListKaryawan,
  apiAdminResetKaryawanPassword,
} from "@/lib/api";

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

const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = React.useState<UserRow[]>([]);
  const [meta, setMeta] = React.useState<Meta | null>(null);

  const [loadingList, setLoadingList] = React.useState(false);
  const [loadingUserId, setLoadingUserId] = React.useState<number | null>(null);

  const [error, setError] = React.useState<string | null>(null);
  const [lastResetUser, setLastResetUser] = React.useState<UserRow | null>(null);

  const [search, setSearch] = React.useState<string>("");
  const [page, setPage] = React.useState<number>(1);

  // 🔹 Ambil data user dari backend
  React.useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingList(true);
        setError(null);

        const token = getToken();
        if (!token) {
          throw new Error("Token tidak ditemukan. Silakan login ulang.");
        }

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
        setLoadingList(false);
      }
    };

    fetchUsers();
  }, [search, page]);

  // 🔹 Reset password 1 user
  const handleResetPassword = async (user: UserRow) => {
    const ok = window.confirm(
      `Yakin reset password untuk ${user.name} (${user.nik}) ke default (123)?`
    );
    if (!ok) return;

    try {
      setLoadingUserId(user.id);

      const token = getToken();
      if (!token) {
        throw new Error("Token tidak ditemukan. Silakan login ulang.");
      }

      const res = await apiAdminResetKaryawanPassword(token, user.id);
      // res: { message: string; default_password: string }

      setLastResetUser(user);

      alert(`${res.message} Password default: ${res.default_password}`);
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Gagal reset password");
    } finally {
      setLoadingUserId(null);
    }
  };

  const handlePrevPage = () => {
    if (meta && meta.current_page > 1) {
      setPage(meta.current_page - 1);
    }
  };

  const handleNextPage = () => {
    if (meta && meta.current_page < meta.last_page) {
      setPage(meta.current_page + 1);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          Manajemen User
        </h1>

        {/* Searchbar (langsung hit API karena search dipakai di effect) */}
        <div className="mt-2 w-full sm:w-64">
          <Input
            placeholder="Cari NIK / Nama / Email..."
            value={search}
            onChange={e => {
              setPage(1); // reset ke page 1 kalau ganti kata kunci
              setSearch(e.target.value);
            }}
            className="h-9"
          />
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Notifikasi kecil setelah reset */}
      {lastResetUser && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
          Password untuk{" "}
          <span className="font-semibold">{lastResetUser.name}</span> (
          {lastResetUser.nik}) telah direset ke default:{" "}
          <span className="font-mono font-semibold">123</span>.
        </div>
      )}

      {/* Tabel User */}
      <div className="overflow-x-auto rounded-md border bg-white">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="border-b px-4 py-2 text-left font-medium text-gray-700 w-12">
                No
              </th>
              <th className="border-b px-4 py-2 text-left font-medium text-gray-700">
                NIK
              </th>
              <th className="border-b px-4 py-2 text-left font-medium text-gray-700">
                Nama
              </th>
              <th className="border-b px-4 py-2 text-left font-medium text-gray-700">
                Email
              </th>
              <th className="border-b px-4 py-2 text-center font-medium text-gray-700">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {loadingList && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-sm text-gray-500"
                >
                  Memuat data user...
                </td>
              </tr>
            )}

            {!loadingList && users.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-sm text-gray-500"
                >
                  Tidak ada data user.
                </td>
              </tr>
            )}

            {!loadingList &&
              users.map((user, index) => (
                <tr
                  key={user.id}
                  className="transition-colors hover:bg-gray-50/80"
                >
                  <td className="border-b px-4 py-2 align-middle">
                    {/* nomor urut relatif terhadap page */}
                    {meta
                      ? (meta.current_page - 1) * meta.per_page + (index + 1)
                      : index + 1}
                  </td>
                  <td className="border-b px-4 py-2 align-middle">{user.nik}</td>
                  <td className="border-b px-4 py-2 align-middle">{user.name}</td>
                  <td className="border-b px-4 py-2 align-middle">{user.email}</td>

                  <td className="border-b px-4 py-2 align-middle text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleResetPassword(user)}
                      disabled={loadingUserId === user.id}
                    >
                      {loadingUserId === user.id ? "Resetting..." : "Reset Password"}
                    </Button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {meta && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div>
            Halaman {meta.current_page} dari {meta.last_page}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={meta.current_page <= 1 || loadingList}
              onClick={handlePrevPage}
            >
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={meta.current_page >= meta.last_page || loadingList}
              onClick={handleNextPage}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
