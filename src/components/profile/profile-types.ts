// src/components/profile/profile-types.ts
export type KeyVal = { label: string; value: string };

export type MainProfileState = {
  namaLengkap: string;
  jabatanTerakhir: string;
  nikPn: string;
  handphone: string;
  email: string;
  avatarUrl: string;
  avatarAlt: string;
};

export type PerformanceState = {
  penilaianKerja: string[];
  achievements: string[];
};

export type ProfileFormState = {
  jabatanTerakhir: string;
  gelarAkademik: string;
  pendidikan: string;
  noKtp: string;
  tempatLahir: string;
  tanggalLahir: string;
  jenisKelamin: string;
  agama: string;
  alamatRumah: string;
  npwp: string;
  suku: string;
  golonganDarah: string;
  statusPerkawinan: string;
  handphone: string;
  emailPribadi: string;
  penilaianKerja: string;
  pencapaian: string;
};
