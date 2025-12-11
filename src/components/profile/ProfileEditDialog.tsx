// src/components/profile/ProfileEditDialog.tsx
import * as React from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CityCombobox } from "@/components/profile/CityCombobox";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { ProfileFormState, MainProfileState } from "./profile-types";
import {
  agamaOptions,
  golonganDarahOptions,
  jenisKelaminOptions,
  pendidikanOptions,
  statusPerkawinanOptions,
  sukuOptions,
  // unitKerjaOptions, // ❌ sudah tidak dipakai lagi
} from "./profile-options";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  main: MainProfileState;
  form: ProfileFormState;
  setForm: React.Dispatch<React.SetStateAction<ProfileFormState>>;
  saving: boolean;
  onSubmit: () => void | Promise<void>;
};

export function ProfileEditDialog({
  open,
  onOpenChange,
  main,
  form,
  setForm,
  saving,
  onSubmit,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Ubah Data Profil
          </DialogTitle>
        </DialogHeader>

        <form
          className="mt-4 space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            void onSubmit();
          }}
        >
          {/* Nama Lengkap */}
          <div className="flex flex-col gap-1">
            <Label className="text-sm text-muted-foreground">
              Nama Lengkap
            </Label>
            <Input className="h-9 text-sm" value={main.namaLengkap} disabled />
          </div>

          {/* Jabatan Terakhir */}
          <div className="flex flex-col gap-1">
            <Label className="text-sm text-muted-foreground">
              Jabatan Terakhir
            </Label>
            <Input
              className="h-9 text-sm"
              value={form.jabatanTerakhir}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  jabatanTerakhir: e.target.value,
                }))
              }
            />
          </div>

          {/* Unit Kerja (READ-ONLY, hanya admin yang boleh ubah di backend) */}
          <div className="flex flex-col gap-1">
            <Label className="text-sm text-muted-foreground">Unit Kerja</Label>
            <Input
              className="h-9 text-sm"
              value={main.unitKerja}
              disabled
            />
          </div>

          {/* NIK */}
          <div className="flex flex-col gap-1">
            <Label className="text-sm text-muted-foreground">NIK</Label>
            <Input className="h-9 text-sm" value={main.nikPn} disabled />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1">
            <Label className="text-sm text-muted-foreground">Email</Label>
            <Input className="h-9 text-sm" value={main.email} disabled />
          </div>

          {/* Handphone (wajib) */}
          <div className="flex flex-col gap-1">
            <Label className="text-sm text-muted-foreground">
              Handphone <span className="text-red-500">*</span>
            </Label>
            <Input
              className="h-9 text-sm"
              required
              value={form.handphone}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  handphone: e.target.value,
                }))
              }
            />
          </div>

          {/* No KTP (wajib) */}
          <div className="flex flex-col gap-1">
            <Label className="text-sm text-muted-foreground">
              No. KTP <span className="text-red-500">*</span>
            </Label>
            <Input
              className="h-9 text-sm"
              required
              value={form.noKtp}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, noKtp: e.target.value }))
              }
            />
          </div>

          {/* Gelar Akademik */}
          <div className="flex flex-col gap-1">
            <Label className="text-sm text-muted-foreground">
              Gelar Akademik
            </Label>
            <Input
              className="h-9 text-sm"
              value={form.gelarAkademik}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  gelarAkademik: e.target.value,
                }))
              }
            />
          </div>

          {/* Pendidikan & Jenis Kelamin */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <Label className="text-sm text-muted-foreground">
                Pendidikan
              </Label>
              <Select
                value={form.pendidikan}
                onValueChange={(v) =>
                  setForm((prev) => ({ ...prev, pendidikan: v }))
                }
              >
                <SelectTrigger className="h-9 w-full text-sm">
                  <SelectValue placeholder="Pilih pendidikan" />
                </SelectTrigger>
                <SelectContent>
                  {pendidikanOptions.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1">
              <Label className="text-sm text-muted-foreground">
                Jenis Kelamin
              </Label>
              <Select
                value={form.jenisKelamin}
                onValueChange={(v) =>
                  setForm((prev) => ({ ...prev, jenisKelamin: v }))
                }
              >
                <SelectTrigger className="h-9 w-full text-sm">
                  <SelectValue placeholder="Pilih jenis kelamin" />
                </SelectTrigger>
                <SelectContent>
                  {jenisKelaminOptions.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tempat Lahir & Tanggal Lahir */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <Label className="text-sm text-muted-foreground">
                Tempat Lahir
              </Label>
              <CityCombobox
                value={form.tempatLahir}
                onChange={(v: string) =>
                  setForm((prev) => ({ ...prev, tempatLahir: v }))
                }
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label className="text-sm text-muted-foreground">
                Tanggal Lahir <span className="text-red-500">*</span>
              </Label>
              <DatePicker
                value={form.tanggalLahir}
                onChange={(v: string) =>
                  setForm((prev) => ({ ...prev, tanggalLahir: v }))
                }
              />
            </div>
          </div>

          {/* Agama & Suku */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <Label className="text-sm text-muted-foreground">Agama</Label>
              <Select
                value={form.agama}
                onValueChange={(v) =>
                  setForm((prev) => ({ ...prev, agama: v }))
                }
              >
                <SelectTrigger className="h-9 w-full text-sm">
                  <SelectValue placeholder="Pilih agama" />
                </SelectTrigger>
                <SelectContent>
                  {agamaOptions.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1">
              <Label className="text-sm text-muted-foreground">Suku</Label>
              <Select
                value={form.suku}
                onValueChange={(v) =>
                  setForm((prev) => ({ ...prev, suku: v }))
                }
              >
                <SelectTrigger className="h-9 w-full text-sm">
                  <SelectValue placeholder="Pilih suku" />
                </SelectTrigger>
                <SelectContent>
                  {sukuOptions.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Golongan Darah & Status Perkawinan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <Label className="text-sm text-muted-foreground">
                Golongan Darah
              </Label>
              <Select
                value={form.golonganDarah}
                onValueChange={(v) =>
                  setForm((prev) => ({ ...prev, golonganDarah: v }))
                }
              >
                <SelectTrigger className="h-9 w-full text-sm">
                  <SelectValue placeholder="Pilih golongan darah" />
                </SelectTrigger>
                <SelectContent>
                  {golonganDarahOptions.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1">
              <Label className="text-sm text-muted-foreground">
                Status Perkawinan <span className="text-red-500">*</span>
              </Label>
              <Select
                value={form.statusPerkawinan}
                onValueChange={(v) =>
                  setForm((prev) => ({ ...prev, statusPerkawinan: v }))
                }
              >
                <SelectTrigger className="h-9 w-full text-sm">
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  {statusPerkawinanOptions.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Alamat Rumah (wajib) */}
          <div className="flex flex-col gap-1">
            <Label className="text-sm text-muted-foreground">
              Alamat Rumah <span className="text-red-500">*</span>
            </Label>
            <Input
              className="h-9 text-sm"
              required
              value={form.alamatRumah}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  alamatRumah: e.target.value,
                }))
              }
            />
          </div>

          {/* NPWP */}
          <div className="flex flex-col gap-1">
            <Label className="text-sm text-muted-foreground">NPWP</Label>
            <Input
              className="h-9 text-sm"
              value={form.npwp}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, npwp: e.target.value }))
              }
            />
          </div>

          {/* Penilaian Kerja */}
          <div className="flex flex-col gap-1">
            <Label className="text-sm text-muted-foreground">
              Penilaian Kerja
            </Label>
            <textarea
              className="w-full min-h-[80px] rounded-md border px-3 py-2 text-sm"
              value={form.penilaianKerja}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  penilaianKerja: e.target.value,
                }))
              }
            />
          </div>

          {/* Pencapaian */}
          <div className="flex flex-col gap-1">
            <Label className="text-sm text-muted-foreground">Pencapaian</Label>
            <textarea
              className="w-full min-h-[80px] rounded-md border px-3 py-2 text-sm"
              value={form.pencapaian}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  pencapaian: e.target.value,
                }))
              }
            />
          </div>

          {/* BUTTONS */}
          <div className="pt-4 flex justify-center gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Batal
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
