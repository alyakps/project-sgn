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

  const [form, setForm] = React.useState<ProfileFormState>({
    jabatanTerakhir: "",
    unitKerja: "", // tetap ada di state untuk display, tapi TIDAK dikirim ke backend
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

        // ✅ FIX: source of truth unit kerja dari users.unit_kerja, fallback profile.unit_kerja
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

        // FORM STATE (unitKerja hanya untuk display, tidak akan dikirim)
        setForm({
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
          emailPribadi: p.email_pribadi ?? user.email,
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
  // HANDLE SAVE
  // ======================================================================
  async function handleSave() {
    try {
      setSaving(true);
      setError(null);

      const token = getToken();

      const payload = {
        jabatan_terakhir: emptyToNull(form.jabatanTerakhir),
        // ❌ unit_kerja sengaja TIDAK dikirim
        gelar_akademik: emptyToNull(form.gelarAkademik),
        pendidikan: emptyToNull(form.pendidikan),
        no_ktp: emptyToNull(form.noKtp),
        tempat_lahir: emptyToNull(form.tempatLahir),
        tanggal_lahir: emptyToNull(form.tanggalLahir),
        jenis_kelamin: emptyToNull(form.jenisKelamin),
        agama: emptyToNull(form.agama),
        alamat_rumah: emptyToNull(form.alamatRumah),
        npwp: emptyToNull(form.npwp),
        suku: emptyToNull(form.suku),
        golongan_darah: emptyToNull(form.golonganDarah),
        status_perkawinan: emptyToNull(form.statusPerkawinan),
        handphone: emptyToNull(form.handphone),
        penilaian_kerja: emptyToNull(form.penilaianKerja),
        pencapaian: emptyToNull(form.pencapaian),
      };

      const res = await fetch(UPDATE_PROFILE_URL, {
        method: "POST", // route kamu pakai POST
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Gagal menyimpan profil.");

      // update view singkat setelah save (unitKerja TIDAK berubah di sini)
      setMain((prev) => ({
        ...prev,
        jabatanTerakhir: fix(form.jabatanTerakhir),
        handphone: fix(form.handphone),
      }));

      setPersonal([
        { label: "Gelar Akademik", value: fix(form.gelarAkademik) },
        { label: "Pendidikan", value: fix(form.pendidikan) },
        { label: "No. KTP", value: fix(form.noKtp) },
        { label: "Tempat Lahir", value: fix(form.tempatLahir) },
        { label: "Tanggal Lahir", value: fix(form.tanggalLahir) },
        { label: "Jenis Kelamin", value: fix(form.jenisKelamin) },
        { label: "Agama", value: fix(form.agama) },
        { label: "Alamat Rumah", value: fix(form.alamatRumah) },
        { label: "NPWP", value: fix(form.npwp) },
        { label: "Suku", value: fix(form.suku) },
        { label: "Golongan Darah", value: fix(form.golonganDarah) },
        { label: "Status Perkawinan", value: fix(form.statusPerkawinan) },
      ]);

      setPerformance({
        penilaianKerja: [fix(form.penilaianKerja || "-")],
        achievements: [fix(form.pencapaian || "-")],
      });

      // biar mini profile / topbar ikut update
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] });

      setIsEditing(false);
    } catch (err: any) {
      setError(err.message ?? "Gagal menyimpan profil.");
    } finally {
      setSaving(false);
    }
  }

  // ======================================================================
  // RENDER
  // ======================================================================
  return (
    <div className="flex flex-col gap-3">
      {/* HEADER TITLE */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-semibold">Profile</h2>
      </div>

      {loading && (
        <p className="text-xs sm:text-sm text-muted-foreground">
          Memuat data profil...
        </p>
      )}
      {error && <p className="text-xs sm:text-sm text-red-600">{error}</p>}

      {/* HEADER CARD */}
      <ProfileHeaderCard main={main} onEdit={() => setIsEditing(true)} />

      {/* PERSONAL INFO */}
      <ProfilePersonalCard items={personal} />

      {/* WORK PERFORMANCE */}
      <ProfilePerformanceCard performance={performance} />

      {/* POPUP EDIT FORM */}
      <ProfileEditDialog
        open={isEditing}
        onOpenChange={setIsEditing}
        main={main}
        form={form}
        setForm={setForm}
        saving={saving}
        onSubmit={handleSave}
      />
    </div>
  );
}
