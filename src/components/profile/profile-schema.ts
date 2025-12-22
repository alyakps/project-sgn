import { z } from "zod";

export const ProfileUpdateSchema = z.object({
  jabatanTerakhir: z.string().optional().nullable(),
  unitKerja: z.string().optional().nullable(), // display only
  gelarAkademik: z.string().optional().nullable(),
  pendidikan: z.string().optional().nullable(),
  noKtp: z.string().min(1, "No. KTP wajib diisi."),
  tempatLahir: z.string().optional().nullable(),
  tanggalLahir: z.string().min(1, "Tanggal lahir wajib diisi."),
  jenisKelamin: z.string().optional().nullable(),
  agama: z.string().optional().nullable(),
  alamatRumah: z.string().min(1, "Alamat rumah wajib diisi."),
  npwp: z.string().optional().nullable(),
  suku: z.string().optional().nullable(),
  golonganDarah: z.string().optional().nullable(),
  statusPerkawinan: z.string().min(1, "Status perkawinan wajib diisi."),
  handphone: z.string().min(1, "Handphone wajib diisi."),
  emailPribadi: z.string().email().optional().nullable(),
  penilaianKerja: z.string().optional().nullable(),
  pencapaian: z.string().optional().nullable(),
});

export type ProfileUpdateForm = z.infer<typeof ProfileUpdateSchema>;
