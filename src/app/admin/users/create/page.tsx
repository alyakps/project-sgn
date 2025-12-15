"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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

  const [unitOptions, setUnitOptions] = React.useState<string[]>([]);
  const [loadingUnits, setLoadingUnits] = React.useState(false);
  const [unitError, setUnitError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadUnits = async () => {
      try {
        setLoadingUnits(true);
        setUnitError(null);

        const token = getToken();
        if (!token) throw new Error("Token tidak ditemukan. Silakan login ulang.");

        const list = await apiGetMasterUnitKerja(token);
        setUnitOptions(list);

        if (!form.unitKerja && list.length > 0) {
          setForm((prev) => ({ ...prev, unitKerja: list[0] }));
        }
      } catch (err: any) {
        setUnitError(err.message || "Gagal memuat data unit kerja.");
      } finally {
        setLoadingUnits(false);
      }
    };

    void loadUnits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

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

      await apiAdminCreateKaryawan(token, payload);

      router.push("/admin/users");
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan user.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-2">
      {/* HEADER */}
      <div className="-mt-3 flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-semibold tracking-tight">Add User</h1>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
          {error}
        </div>
      )}

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-2">
        {/* USER DETAILS */}
        <Card>
          <CardContent className="p-3">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-[200px_1fr]">
              <div className="space-y-0.5">
                <div className="text-sm font-semibold text-zinc-900">
                  User Details
                </div>
                <div className="text-xs text-muted-foreground">
                  Informasi umum profil user.
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {/* Role */}
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-zinc-700">
                    Role
                  </label>
                  <Select
                    value={form.role}
                    onValueChange={(val: RoleOption) =>
                      updateField("role", val)
                    }
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="karyawan">Karyawan</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Unit Kerja | Jabatan */}
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-zinc-700">
                      Unit Kerja
                    </label>
                    <Select
                      value={form.unitKerja}
                      onValueChange={(val) =>
                        updateField("unitKerja", val)
                      }
                      disabled={
                        loadingUnits || !!unitError || unitOptions.length === 0
                      }
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {unitOptions.map((u) => (
                          <SelectItem key={u} value={u}>
                            {u}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {unitError && (
                      <p className="text-[11px] text-red-600">{unitError}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-zinc-700">
                      Jabatan Terakhir
                    </label>
                    <Input
                      className="h-8 text-sm"
                      value={form.jabatanTerakhir}
                      onChange={(e) =>
                        updateField("jabatanTerakhir", e.target.value)
                      }
                    />
                  </div>
                </div>

                {/* Nama | NIK */}
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-zinc-700">
                      Nama Lengkap
                    </label>
                    <Input
                      className="h-8 text-sm"
                      value={form.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-zinc-700">
                      NIK
                    </label>
                    <Input
                      className="h-8 text-sm"
                      value={form.nik}
                      onChange={(e) => updateField("nik", e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* LOGIN DETAILS */}
        <Card>
          <CardContent className="p-3">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-[200px_1fr]">
              <div className="space-y-0.5">
                <div className="text-sm font-semibold text-zinc-900">
                  Login Details
                </div>
                <div className="text-xs text-muted-foreground">
                  Detail untuk autentikasi aplikasi.
                </div>
              </div>

              <div className="space-y-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-zinc-700">
                    Email
                  </label>
                  <Input
                    type="email"
                    className="h-8 text-sm"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-zinc-700">
                    Password
                  </label>
                  <Input
                    type="password"
                    className="h-8 text-sm"
                    value={form.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-zinc-700">
                    Confirm Password
                  </label>
                  <Input
                    type="password"
                    className="h-8 text-sm"
                    value={form.passwordConfirmation}
                    onChange={(e) =>
                      updateField("passwordConfirmation", e.target.value)
                    }
                    required
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SAVE BUTTON */}
        <div className="pt-1">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminUserCreatePage;
