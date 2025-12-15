"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { getToken } from "@/lib/auth-storage";
import { apiGetMasterUnitKerja } from "@/lib/api";

import { ArrowLeft, Loader2 } from "lucide-react";

/* =======================
 * TYPES
 * ======================= */
type ApiUser = {
  id: number;
  nik: string;
  name: string;
  email: string;
  role: string;
  unit_kerja: string | null;
};

type ApiProfile = {
  id: number;
  photo_url: string | null;
  nama_lengkap: string | null;
  gelar_akademik: string | null;
  nik: string | null;
  pendidikan: string | null;
  no_ktp: string | null;
  tempat_lahir: string | null;
  tanggal_lahir: string | null; // "YYYY-MM-DD"
  jenis_kelamin: string | null;
  agama: string | null;
  jabatan_terakhir: string | null;
  unit_kerja: string | null;
  alamat_rumah: string | null;
  handphone: string | null;
  email_pribadi: string | null;
  npwp: string | null;
  suku: string | null;
  golongan_darah: string | null;
  status_perkawinan: string | null;
  penilaian_kerja: string | null;
  pencapaian: string | null;
};

type ApiResponse = {
  data: {
    user: ApiUser;
    profile: ApiProfile;
  };
};

type FormState = {
  // users table
  name: string;
  email: string;
  unit_kerja: string;

  // employee_profiles table
  nama_lengkap: string;
  gelar_akademik: string;
  nik: string;
  no_ktp: string;
  pendidikan: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  jenis_kelamin: string;
  agama: string;
  jabatan_terakhir: string;
  alamat_rumah: string;
  handphone: string;
  email_pribadi: string;
  npwp: string;
  suku: string;
  golongan_darah: string;
  status_perkawinan: string;
  penilaian_kerja: string;
  pencapaian: string;
};

const initialForm: FormState = {
  name: "",
  email: "",
  unit_kerja: "",

  nama_lengkap: "",
  gelar_akademik: "",
  nik: "",
  no_ktp: "",
  pendidikan: "",
  tempat_lahir: "",
  tanggal_lahir: "",
  jenis_kelamin: "",
  agama: "",
  jabatan_terakhir: "",
  alamat_rumah: "",
  handphone: "",
  email_pribadi: "",
  npwp: "",
  suku: "",
  golongan_darah: "",
  status_perkawinan: "",
  penilaian_kerja: "",
  pencapaian: "",
};

const AdminEditUserPage: React.FC = () => {
  const router = useRouter();
  const { employeeId } = useParams<{ employeeId: string }>();

  // employeeId di route = NIK
  const nik = employeeId;

  const [form, setForm] = React.useState<FormState>(initialForm);

  const [unitOptions, setUnitOptions] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  /* =======================
   * HELPERS
   * ======================= */
  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  /* =======================
   * LOAD INITIAL DATA
   * ======================= */
  React.useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = getToken();
        if (!token) throw new Error("Token tidak ditemukan.");
        if (!API_URL) throw new Error("NEXT_PUBLIC_API_URL belum di-set");

        // 1) ambil profile karyawan by NIK
        const res = await fetch(`${API_URL}/api/admin/karyawan/${nik}/profile`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const json: ApiResponse = await res.json();
        if (!res.ok) throw new Error((json as any)?.message || "Gagal load profile.");

        const { user, profile } = json.data;

        setForm({
          // users
          name: user?.name ?? "",
          email: user?.email ?? "",
          unit_kerja: user?.unit_kerja ?? "",

          // employee_profiles
          nama_lengkap: profile?.nama_lengkap ?? "",
          gelar_akademik: profile?.gelar_akademik ?? "",
          nik: profile?.nik ?? user?.nik ?? "",
          no_ktp: profile?.no_ktp ?? "",
          pendidikan: profile?.pendidikan ?? "",
          tempat_lahir: profile?.tempat_lahir ?? "",
          tanggal_lahir: profile?.tanggal_lahir ?? "",
          jenis_kelamin: profile?.jenis_kelamin ?? "",
          agama: profile?.agama ?? "",
          jabatan_terakhir: profile?.jabatan_terakhir ?? "",
          alamat_rumah: profile?.alamat_rumah ?? "",
          handphone: profile?.handphone ?? "",
          email_pribadi: profile?.email_pribadi ?? "",
          npwp: profile?.npwp ?? "",
          suku: profile?.suku ?? "",
          golongan_darah: profile?.golongan_darah ?? "",
          status_perkawinan: profile?.status_perkawinan ?? "",
          penilaian_kerja: profile?.penilaian_kerja ?? "",
          pencapaian: profile?.pencapaian ?? "",
        });

        // 2) master unit kerja
        const units = await apiGetMasterUnitKerja(token);
        setUnitOptions(units);
      } catch (err: any) {
        setError(err?.message || "Gagal memuat data karyawan.");
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [nik, API_URL]);

  /* =======================
   * SUBMIT
   * ======================= */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError(null);

      const token = getToken();
      if (!token) throw new Error("Token tidak ditemukan.");
      if (!API_URL) throw new Error("NEXT_PUBLIC_API_URL belum di-set");

      // payload: kirim semua field form (backend kamu sudah handle users + profile)
      const res = await fetch(`${API_URL}/api/admin/karyawan/${nik}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const json = await res.json().catch(() => ({} as any));
      if (!res.ok) {
        const msg =
          (json?.errors &&
            typeof json.errors === "object" &&
            Object.values(json.errors).flat().join("\n")) ||
          json?.message ||
          "Gagal menyimpan perubahan.";
        throw new Error(msg);
      }

      router.push("/admin/users");
    } catch (err: any) {
      setError(err?.message || "Gagal menyimpan perubahan.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Memuat data...
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* HEADER (✅ tombol kembali icon panah) */}
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => router.push("/admin/users")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <h1 className="text-xl font-semibold tracking-tight">Ubah Data Profil</h1>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* SECTION 1 */}
      <div className="space-y-4 rounded-lg border bg-white p-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium">Nama Lengkap</label>
            <Input
              value={form.nama_lengkap}
              onChange={(e) => setField("nama_lengkap", e.target.value)}
              placeholder="Nama Lengkap"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Jabatan Terakhir</label>
            <Input
              value={form.jabatan_terakhir}
              onChange={(e) => setField("jabatan_terakhir", e.target.value)}
              placeholder="Jabatan Terakhir"
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-medium">Unit Kerja</label>
            <Select
              value={form.unit_kerja}
              onValueChange={(val) => setField("unit_kerja", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih Unit Kerja" />
              </SelectTrigger>
              <SelectContent>
                {unitOptions.map((u) => (
                  <SelectItem key={u} value={u}>
                    {u}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">NIK</label>
            <Input value={form.nik} disabled />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Email</label>
            <Input value={form.email} disabled />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">
              Handphone <span className="text-red-500">*</span>
            </label>
            <Input
              value={form.handphone}
              onChange={(e) => setField("handphone", e.target.value)}
              placeholder="08xxxxxxxxxx"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">
              No. KTP <span className="text-red-500">*</span>
            </label>
            <Input
              value={form.no_ktp}
              onChange={(e) => setField("no_ktp", e.target.value)}
              placeholder="Nomor KTP"
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-medium">Gelar Akademik</label>
            <Input
              value={form.gelar_akademik}
              onChange={(e) => setField("gelar_akademik", e.target.value)}
              placeholder="Contoh: S.T"
            />
          </div>
        </div>
      </div>

      {/* SECTION 2 */}
      <div className="space-y-4 rounded-lg border bg-white p-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium">Pendidikan</label>
            <Input
              value={form.pendidikan}
              onChange={(e) => setField("pendidikan", e.target.value)}
              placeholder="Contoh: S1"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Jenis Kelamin</label>
            <Input
              value={form.jenis_kelamin}
              onChange={(e) => setField("jenis_kelamin", e.target.value)}
              placeholder="Contoh: Laki-laki"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Tempat Lahir</label>
            <Input
              value={form.tempat_lahir}
              onChange={(e) => setField("tempat_lahir", e.target.value)}
              placeholder="Tempat Lahir"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">
              Tanggal Lahir <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={form.tanggal_lahir}
              onChange={(e) => setField("tanggal_lahir", e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Agama</label>
            <Input
              value={form.agama}
              onChange={(e) => setField("agama", e.target.value)}
              placeholder="Agama"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Suku</label>
            <Input
              value={form.suku}
              onChange={(e) => setField("suku", e.target.value)}
              placeholder="Suku"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Golongan Darah</label>
            <Input
              value={form.golongan_darah}
              onChange={(e) => setField("golongan_darah", e.target.value)}
              placeholder="Contoh: AB"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">
              Status Perkawinan <span className="text-red-500">*</span>
            </label>
            <Input
              value={form.status_perkawinan}
              onChange={(e) => setField("status_perkawinan", e.target.value)}
              placeholder="Contoh: Belum Menikah"
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-medium">
              Alamat Rumah <span className="text-red-500">*</span>
            </label>
            <Input
              value={form.alamat_rumah}
              onChange={(e) => setField("alamat_rumah", e.target.value)}
              placeholder="Alamat Rumah"
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-medium">NPWP</label>
            <Input
              value={form.npwp}
              onChange={(e) => setField("npwp", e.target.value)}
              placeholder="NPWP"
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-medium">Penilaian Kerja</label>
            <textarea
              className="min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={form.penilaian_kerja}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setField("penilaian_kerja", e.target.value)
              }
              placeholder="Penilaian kerja"
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-medium">Pencapaian</label>
            <textarea
              className="min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={form.pencapaian}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setField("pencapaian", e.target.value)
              }
              placeholder="Pencapaian"
            />
          </div>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/users")}
          disabled={saving}
        >
          Batal
        </Button>

        <Button type="submit" disabled={saving}>
          {saving ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Menyimpan...
            </span>
          ) : (
            "Simpan"
          )}
        </Button>
      </div>
    </form>
  );
};

export default AdminEditUserPage;