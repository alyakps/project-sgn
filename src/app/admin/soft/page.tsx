"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectValue,
  SelectItem,
} from "@/components/ui/select";
import { Info } from "lucide-react";
import { getToken, getUser, clearAuth } from "@/lib/auth-storage";
import { apiGetMasterUnitKerja } from "@/lib/api";

/* ====================== TYPES ====================== */

type EmployeeRow = {
  id: string;
  nik: string;
  nama: string;
  unitKerja: string;
};

type ApiMeta = {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
};

/* ====================== API CONFIG ====================== */

const API_BASE_URL =
  (process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000")
    .replace(/\/$/, "") + "/api";

/* ====================== PAGE ====================== */

export default function AdminSoftPage() {
  const router = useRouter();

  const [search, setSearch] = React.useState("");
  const [unitFilter, setUnitFilter] = React.useState<string>("all");

  const [unitOptions, setUnitOptions] = React.useState<string[]>([]);
  const [loadingUnits, setLoadingUnits] = React.useState(false);

  const [employees, setEmployees] = React.useState<EmployeeRow[]>([]);
  const [meta, setMeta] = React.useState<ApiMeta | null>(null);

  const [loadingAuth, setLoadingAuth] = React.useState(true);
  const [loadingData, setLoadingData] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  /* ========== CEK AUTH (ADMIN) ========== */
  React.useEffect(() => {
    const token = getToken();
    const user = getUser();

    if (!token || !user) {
      clearAuth();
      router.push("/login");
      return;
    }

    setLoadingAuth(false);
  }, [router]);

  /* ========== LOAD MASTER UNIT KERJA ========== */
  React.useEffect(() => {
    if (loadingAuth) return;

    const run = async () => {
      const token = getToken();
      if (!token) return;

      setLoadingUnits(true);
      try {
        const list = await apiGetMasterUnitKerja(token);

        // sanitize ringan: trim, remove empty, unique, sort
        const clean = Array.from(
          new Set(
            (list ?? [])
              .map((x) => String(x ?? "").trim())
              .filter((x) => x.length > 0)
          )
        ).sort((a, b) => a.localeCompare(b));

        setUnitOptions(clean);
      } catch (e) {
        console.error(e);
        // kalau gagal fetch master, dropdown tetap usable dengan "Semua Unit"
        setUnitOptions([]);
      } finally {
        setLoadingUnits(false);
      }
    };

    run();
  }, [loadingAuth]);

  /* ========== LOAD DATA (SERVER-SIDE SEARCH + FILTER + PAGINATION) ========== */
  const loadEmployees = React.useCallback(
    async (page: number = 1, q?: string, unitKerja?: string) => {
      const token = getToken();
      if (!token) return;

      setLoadingData(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.set("page", String(page));

        const qq = (q ?? "").trim();
        if (qq !== "") params.set("q", qq);

        const uk = (unitKerja ?? "").trim();
        if (uk !== "" && uk !== "all") params.set("unit_kerja", uk);

        const res = await fetch(`${API_BASE_URL}/admin/karyawan?${params}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (!res.ok) {
          throw new Error(`Gagal memuat daftar karyawan (status ${res.status})`);
        }

        const json: any = await res.json();
        const list: any[] = json.data ?? [];
        const meta: ApiMeta | null = json.meta ?? null;

        const mapped: EmployeeRow[] = list.map((item) => ({
          id: String(item.id),
          nik: item.nik ?? "-",
          nama: item.name ?? "-",
          unitKerja: item.unit_kerja ?? "-",
        }));

        setEmployees(mapped);
        setMeta(
          meta ?? {
            current_page: page,
            per_page: list.length || 10,
            total: list.length,
            last_page: 1,
          }
        );
      } catch (err: any) {
        console.error(err);
        setError(err?.message || "Terjadi kesalahan saat memuat daftar karyawan.");
        setEmployees([]);
        setMeta(null);
      } finally {
        setLoadingData(false);
      }
    },
    []
  );

  // load pertama
  React.useEffect(() => {
    if (!loadingAuth) {
      loadEmployees(1, "", "all");
    }
  }, [loadingAuth, loadEmployees]);

  // reload ketika search/unit berubah
  React.useEffect(() => {
    if (loadingAuth) return;

    const t = setTimeout(() => {
      loadEmployees(1, search, unitFilter);
    }, 350);

    return () => clearTimeout(t);
  }, [search, unitFilter, loadingAuth, loadEmployees]);

  const safeCurrentPage = meta?.current_page ?? 1;
  const totalPages = meta?.last_page ?? 1;
  const baseNo = meta ? (meta.current_page - 1) * meta.per_page : 0;

  const handleOpenDetail = (emp: EmployeeRow) => {
    router.push(`/admin/soft/${emp.nik}`);
  };

  if (loadingAuth) {
    return (
      <div className="flex min-h-[200px] items-center justify-center text-sm text-muted-foreground">
        Memeriksa sesi...
      </div>
    );
  }

  return (
    <section className="max-w-6xl mx-auto space-y-5 px-3 sm:px-4 lg:px-0">
      <div className="pt-1">
        <h1 className="text-xl font-semibold text-zinc-900">Soft Competency</h1>
        <p className="text-xs text-zinc-500 mt-1">Pilih karyawan</p>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs sm:text-sm text-red-700">
          {error}
        </div>
      )}

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
          <div className="w-56">
            <Select value={unitFilter} onValueChange={setUnitFilter}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Semua unit kerja" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">Semua Unit</SelectItem>

                {loadingUnits && (
                  <SelectItem value="__loading" disabled>
                    Memuat unit kerja...
                  </SelectItem>
                )}

                {!loadingUnits &&
                  unitOptions.map((u) => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

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
            {employees.length === 0 && !loadingData && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-sm text-muted-foreground">
                  Tidak ada karyawan yang cocok dengan filter.
                </td>
              </tr>
            )}

            {loadingData && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-sm text-muted-foreground">
                  Memuat data karyawan...
                </td>
              </tr>
            )}

            {employees.map((emp, idx) => {
              const no = baseNo + idx + 1;
              return (
                <tr
                  key={emp.id}
                  className={`border-b transition ${
                    idx % 2 === 0 ? "bg-white" : "bg-zinc-50/70"
                  }`}
                >
                  <td className="py-3 px-2 text-center align-middle">{no}</td>

                  <td className="py-3 px-2 align-middle text-zinc-800 whitespace-nowrap">
                    {emp.nik}
                  </td>

                  <td className="py-3 px-2 align-middle text-zinc-900">{emp.nama}</td>

                  <td className="py-3 px-2 align-middle text-zinc-700">{emp.unitKerja}</td>

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
              onClick={() => !loadingData && loadEmployees(safeCurrentPage - 1, search, unitFilter)}
            >
              Prev
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={safeCurrentPage >= totalPages || loadingData}
              onClick={() => !loadingData && loadEmployees(safeCurrentPage + 1, search, unitFilter)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
