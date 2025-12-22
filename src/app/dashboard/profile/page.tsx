// app/dashboard/profile/page.tsx
"use client";

import * as React from "react";
import { getToken } from "@/lib/auth-storage";

import {
  KeyVal,
  MainProfileState,
  PerformanceState,
  ProfileFormState,
} from "@/components/profile/profile-types";
import { fix, emptyToNull } from "@/components/profile/profile-helpers";
import { ProfileHeaderCard } from "@/components/profile/ProfileHeaderCard";
import { ProfilePersonalCard } from "@/components/profile/ProfilePersonalCard";
import { ProfilePerformanceCard } from "@/components/profile/ProfilePerformanceCard";
import { ProfileEditDialog } from "@/components/profile/ProfileEditDialog";

// React Query (untuk sync topbar / dashboard)
import { useQueryClient } from "@tanstack/react-query";

// =======================
// API TYPES
// =======================
type UserApi = {
  id: number;
  nik: string;
  name: string;
  email: string;
  role: string;
  unit_kerja?: string | null;
};

type ProfileApi = {
  id: number;
  photo_url: string | null;
  nama_lengkap: string | null;
  gelar_akademik: string | null;
  nik: string | null;
  pendidikan: string | null;
  no_ktp: string | null;
  tempat_lahir: string | null;
  tanggal_lahir: string | null;
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

type ProfileApiResponse = {
  data: {
    user: UserApi;
    profile: ProfileApi;
  };
};

// =======================
// CONFIG API
// =======================
const API_BASE_URL =
  (process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000").replace(
    /\/$/,
    "",
  ) + "/api";

const UPDATE_PROFILE_URL = `${API_BASE_URL}/karyawan/profile`;

// =======================
// Helpers
// =======================
function toNullIfEmpty(v: string | null | undefined): string | null {
  if (v == null) return null;
  const t = String(v).trim();
  return t === "" || t === "-" ? null : t;
}

function parseLaravel422(json: any): { message?: string; fieldErrors?: Record<string, string> } {
  // bentuk umum Laravel:
  // { message: "...", errors: { field: ["msg"], ... } }
  const fieldErrors: Record<string, string> = {};
  if (json?.errors && typeof json.errors === "object") {
    for (const key of Object.keys(json.errors)) {
      const arr = json.errors[key];
      if (Array.isArray(arr) && arr[0]) fieldErrors[key] = String(arr[0]);
    }
  }
  return {
    message: json?.message ? String(json.message) : undefined,
    fieldErrors: Object.keys(fieldErrors).length ? fieldErrors : undefined,
  };
}

// ======================================================================
// PAGE
// ======================================================================
export default function ProfilePage() {
  const queryClient = useQueryClient();

  const [main, setMain] = React.useState<MainProfileState>({
    namaLengkap: "-",
    jabatanTerakhir: "-",
    unitKerja: "-",
    nikPn: "-",
    handphone: "-",
    email: "-",
    avatarUrl: "/avatar.png",
    avatarAlt: "",
  });

  const [personal, setPersonal] = React.useState<KeyVal[]>([]);
  const [performance, setPerformance] = React.useState<PerformanceState>({
    penilaianKerja: [],
    achievements: [],
  });

  // ✅ default values untuk RHF di dialog
  const [defaultForm, setDefaultForm] = React.useState<ProfileFormState>({
    jabatanTerakhir: "",
    unitKerja: "",
    gelarAkademik: "",
    pendidikan: "",
    noKtp: "",
    tempatLahir: "",
    tanggalLahir: "",
    jenisKelamin: "",
    agama: "",
    alamatRumah: "",
    npwp: "",
    suku: "",
    golonganDarah: "",
    statusPerkawinan: "",
    handphone: "",
    emailPribadi: "",
    penilaianKerja: "",
    pencapaian: "",
  });

  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isEditing, setIsEditing] = React.useState(false);

  // ======================================================================
  // FETCH PROFILE
  // ======================================================================
  React.useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        setLoading(true);
        setError(null);

        const token = getToken();
        const res = await fetch(`${API_BASE_URL}/karyawan/profile`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const json: ProfileApiResponse = await res.json();
        if (cancelled) return;

        const user = json.data.user;
        const p = json.data.profile;

        const nama = p.nama_lengkap || user.name;
        const unitKerja = user.unit_kerja ?? p.unit_kerja ?? "";

        // MAIN STATE
        const mainState: MainProfileState = {
          namaLengkap: fix(nama),
          jabatanTerakhir: fix(p.jabatan_terakhir),
          unitKerja: fix(unitKerja),
          nikPn: fix(p.nik || user.nik),
          handphone: fix(p.handphone),
          email: fix(p.email_pribadi || user.email),
          avatarUrl: p.photo_url || "/avatar.png",
          avatarAlt: fix(nama),
        };
        setMain(mainState);

        // ✅ Default form values untuk RHF dialog
        setDefaultForm({
          jabatanTerakhir: p.jabatan_terakhir ?? "",
          unitKerja: unitKerja ?? "",
          gelarAkademik: p.gelar_akademik ?? "",
          pendidikan: p.pendidikan ?? "",
          noKtp: p.no_ktp ?? "",
          tempatLahir: p.tempat_lahir ?? "",
          tanggalLahir: p.tanggal_lahir ?? "",
          jenisKelamin: p.jenis_kelamin ?? "",
          agama: p.agama ?? "",
          alamatRumah: p.alamat_rumah ?? "",
          npwp: p.npwp ?? "",
          suku: p.suku ?? "",
          golonganDarah: p.golongan_darah ?? "",
          statusPerkawinan: p.status_perkawinan ?? "",
          handphone: p.handphone ?? "",
          emailPribadi: p.email_pribadi ?? user.email ?? "",
          penilaianKerja: p.penilaian_kerja ?? "",
          pencapaian: p.pencapaian ?? "",
        });

        // PERSONAL VIEW
        const personalView: KeyVal[] = [
          { label: "Gelar Akademik", value: fix(p.gelar_akademik) },
          { label: "Pendidikan", value: fix(p.pendidikan) },
          { label: "No. KTP", value: fix(p.no_ktp) },
          { label: "Tempat Lahir", value: fix(p.tempat_lahir) },
          { label: "Tanggal Lahir", value: fix(p.tanggal_lahir) },
          { label: "Jenis Kelamin", value: fix(p.jenis_kelamin) },
          { label: "Agama", value: fix(p.agama) },
          { label: "Alamat Rumah", value: fix(p.alamat_rumah) },
          { label: "NPWP", value: fix(p.npwp) },
          { label: "Suku", value: fix(p.suku) },
          { label: "Golongan Darah", value: fix(p.golongan_darah) },
          { label: "Status Perkawinan", value: fix(p.status_perkawinan) },
        ];
        setPersonal(personalView);

        // PERFORMANCE VIEW
        const perf: PerformanceState = {
          penilaianKerja: p.penilaian_kerja ? [fix(p.penilaian_kerja)] : ["-"],
          achievements: p.pencapaian ? [fix(p.pencapaian)] : ["-"],
        };
        setPerformance(perf);
      } catch (err: any) {
        if (!cancelled) setError(err.message ?? "Gagal memuat profil.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  // ======================================================================
  // SAVE (dipanggil dari Dialog)
  // ======================================================================
  async function handleSave(values: ProfileFormState) {
    setSaving(true);
    setError(null);

    try {
      const token = getToken();

      // ✅ Map RHF values -> payload backend (snake_case)
      // Mandatory fields jangan di-null-kan
      const payload = {
        jabatan_terakhir: toNullIfEmpty(values.jabatanTerakhir),
        gelar_akademik: toNullIfEmpty(values.gelarAkademik),
        pendidikan: toNullIfEmpty(values.pendidikan),
        no_ktp: values.noKtp.trim(),
        tempat_lahir: toNullIfEmpty(values.tempatLahir),
        tanggal_lahir: values.tanggalLahir.trim(), // "yyyy-MM-dd"
        jenis_kelamin: toNullIfEmpty(values.jenisKelamin),
        agama: toNullIfEmpty(values.agama),
        alamat_rumah: values.alamatRumah.trim(),
        npwp: toNullIfEmpty(values.npwp),
        suku: toNullIfEmpty(values.suku),
        golongan_darah: toNullIfEmpty(values.golonganDarah),
        status_perkawinan: values.statusPerkawinan.trim(),
        handphone: values.handphone.trim(),
        email_pribadi: toNullIfEmpty(values.emailPribadi),
        penilaian_kerja: toNullIfEmpty(values.penilaianKerja),
        pencapaian: toNullIfEmpty(values.pencapaian),
      };

      const res = await fetch(UPDATE_PROFILE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({} as any));

      if (!res.ok) {
        if (res.status === 422) {
          const parsed = parseLaravel422(json);
          // throw object supaya dialog bisa set per-field error
          throw {
            kind: "validation",
            message:
              parsed.message ||
              "Validasi gagal. Mohon periksa field yang wajib diisi.",
            fieldErrors: parsed.fieldErrors,
          };
        }

        throw new Error(json?.message || "Gagal menyimpan profil.");
      }

      // ✅ Update UI setelah save (pakai values)
      setMain((prev) => ({
        ...prev,
        jabatanTerakhir: fix(values.jabatanTerakhir),
        handphone: fix(values.handphone),
        email: fix(values.emailPribadi || prev.email),
      }));

      setPersonal([
        { label: "Gelar Akademik", value: fix(values.gelarAkademik) },
        { label: "Pendidikan", value: fix(values.pendidikan) },
        { label: "No. KTP", value: fix(values.noKtp) },
        { label: "Tempat Lahir", value: fix(values.tempatLahir) },
        { label: "Tanggal Lahir", value: fix(values.tanggalLahir) },
        { label: "Jenis Kelamin", value: fix(values.jenisKelamin) },
        { label: "Agama", value: fix(values.agama) },
        { label: "Alamat Rumah", value: fix(values.alamatRumah) },
        { label: "NPWP", value: fix(values.npwp) },
        { label: "Suku", value: fix(values.suku) },
        { label: "Golongan Darah", value: fix(values.golonganDarah) },
        { label: "Status Perkawinan", value: fix(values.statusPerkawinan) },
      ]);

      setPerformance({
        penilaianKerja: [fix(values.penilaianKerja || "-")],
        achievements: [fix(values.pencapaian || "-")],
      });

      // sync topbar / mini profile
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] });

      // ✅ update default values untuk edit selanjutnya
      setDefaultForm(values);

      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  }

  // ======================================================================
  // RENDER
  // ======================================================================
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-semibold">Profile</h2>
      </div>

      {loading && (
        <p className="text-xs sm:text-sm text-muted-foreground">
          Memuat data profil...
        </p>
      )}
      {error && <p className="text-xs sm:text-sm text-red-600">{error}</p>}

      <ProfileHeaderCard main={main} onEdit={() => setIsEditing(true)} />
      <ProfilePersonalCard items={personal} />
      <ProfilePerformanceCard performance={performance} />

      <ProfileEditDialog
        open={isEditing}
        onOpenChange={setIsEditing}
        main={main}
        defaultValues={defaultForm}
        saving={saving}
        onSubmit={handleSave}
      />
    </div>
  );
}
