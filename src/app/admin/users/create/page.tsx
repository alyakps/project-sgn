"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { getToken } from "@/lib/auth-storage";
import { apiGetMasterUnitKerja, apiAdminCreateKaryawan } from "@/lib/api";

type RoleOption = "karyawan" | "admin";

type FormState = {
  role: RoleOption;
  nik: string;
  name: string;
  unitKerja: string;
  jabatanTerakhir: string;
  email: string;
  password: string;
  passwordConfirmation: string;
};

const AdminUserCreatePage: React.FC = () => {
  const router = useRouter();

  const [form, setForm] = React.useState<FormState>({
    role: "karyawan",
    nik: "",
    name: "",
    unitKerja: "",
    jabatanTerakhir: "",
    email: "",
    password: "",
    passwordConfirmation: "",
  });

  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // ===== UNIT KERJA MASTER =====
  const [unitOptions, setUnitOptions] = React.useState<string[]>([]);
  const [loadingUnits, setLoadingUnits] = React.useState(false);
  const [unitError, setUnitError] = React.useState<string | null>(null);

  // Load master unit kerja
  React.useEffect(() => {
    const loadUnits = async () => {
      try {
        setLoadingUnits(true);
        setUnitError(null);

        const token = getToken();
        if (!token) throw new Error("Token tidak ditemukan. Silakan login ulang.");

        const list = await apiGetMasterUnitKerja(token);
        setUnitOptions(list);

        // kalau form.unitKerja masih kosong dan ada data → set default ke item pertama
        if (!form.unitKerja && list.length > 0) {
          setForm((prev) => ({ ...prev, unitKerja: list[0] }));
        }
      } catch (err: any) {
        console.error(err);
        setUnitError(err.message || "Gagal memuat data unit kerja.");
      } finally {
        setLoadingUnits(false);
      }
    };

    void loadUnits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== HANDLE CHANGE =====
  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // ===== HANDLE SUBMIT (SUDAH TERINTEGRASI API) =====
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError(null);

      if (!form.email || !form.password || !form.passwordConfirmation) {
        throw new Error("Email dan password wajib diisi.");
      }

      if (form.password !== form.passwordConfirmation) {
        throw new Error("Password dan konfirmasi password tidak sama.");
      }

      const token = getToken();
      if (!token) {
        throw new Error("Token tidak ditemukan. Silakan login ulang.");
      }

      // Sesuaikan dengan payload yang diminta backend:
      // POST /api/admin/karyawan
      const payload = {
        role: form.role,
        nik: form.nik,
        name: form.name,
        unit_kerja: form.unitKerja,
        jabatan_terakhir: form.jabatanTerakhir || null,
        email: form.email,
        password: form.password,
        password_confirmation: form.passwordConfirmation,
      };

      const res = await apiAdminCreateKaryawan(token, payload);
      console.log("Create karyawan success:", res);

      // Kalau mau, di sini bisa pakai toast pakai res.message
      // toast.success(res.message || "Karyawan berhasil dibuat.");

      // Redirect balik ke list user
      router.push("/admin/users");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Gagal menyimpan user.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          Add User
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Tambah user baru dan atur detail karyawan serta login.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* CARD 1: USER DETAILS */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm sm:text-base">
              User Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Kiri */}
              <div className="space-y-3">
                {/* Role */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-zinc-700">
                    Role
                  </label>
                  <Select
                    value={form.role}
                    onValueChange={(val: RoleOption) => updateField("role", val)}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="karyawan">Karyawan</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* NIK */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-zinc-700">
                    NIK
                  </label>
                  <Input
                    className="h-9 text-sm"
                    value={form.nik}
                    onChange={(e) => updateField("nik", e.target.value)}
                    required
                  />
                </div>

                {/* Nama Lengkap */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-zinc-700">
                    Nama Lengkap
                  </label>
                  <Input
                    className="h-9 text-sm"
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Kanan */}
              <div className="space-y-3">
                {/* Unit Kerja */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-zinc-700">
                    Unit Kerja
                  </label>
                  <Select
                    value={form.unitKerja}
                    onValueChange={(val) => updateField("unitKerja", val)}
                    disabled={loadingUnits || !!unitError || unitOptions.length === 0}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue
                        placeholder={
                          loadingUnits
                            ? "Memuat unit kerja..."
                            : unitError
                            ? "Gagal memuat unit kerja"
                            : "Pilih unit kerja"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {unitOptions.map((u: string) => (
                        <SelectItem key={u} value={u}>
                          {u}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {unitError && (
                    <p className="text-xs text-red-600 mt-1">
                      {unitError}
                    </p>
                  )}
                </div>

                {/* Jabatan Terakhir */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-zinc-700">
                    Jabatan Terakhir
                  </label>
                  <Input
                    className="h-9 text-sm"
                    value={form.jabatanTerakhir}
                    onChange={(e) =>
                      updateField("jabatanTerakhir", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CARD 2: LOGIN DETAILS */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm sm:text-base">
              Login Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-zinc-700">
                  Email
                </label>
                <Input
                  type="email"
                  className="h-9 text-sm"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  required
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-zinc-700">
                  Password
                </label>
                <Input
                  type="password"
                  className="h-9 text-sm"
                  value={form.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  required
                />
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-zinc-700">
                  Confirm Password
                </label>
                <Input
                  type="password"
                  className="h-9 text-sm"
                  value={form.passwordConfirmation}
                  onChange={(e) =>
                    updateField("passwordConfirmation", e.target.value)
                  }
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* BUTTONS */}
        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/users")}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminUserCreatePage;
