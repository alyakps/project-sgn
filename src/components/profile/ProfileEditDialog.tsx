// src/components/profile/ProfileEditDialog.tsx
"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";

import {
  useForm,
  Controller,
  type SubmitHandler,
  type ControllerRenderProps,
  type FieldPath,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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

import type { ProfileFormState, MainProfileState } from "./profile-types";
import {
  agamaOptions,
  golonganDarahOptions,
  jenisKelaminOptions,
  pendidikanOptions,
  statusPerkawinanOptions,
  sukuOptions,
} from "./profile-options";

import {
  ProfileUpdateSchema,
  type ProfileUpdateForm,
} from "@/components/profile/profile-schema";

type BackendValidationError = {
  kind: "validation";
  message: string;
  fieldErrors?: Record<string, string>;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  main: MainProfileState;

  // ✅ RHF defaultValues dari page
  defaultValues: ProfileFormState;

  saving: boolean;

  // ✅ Page handle API; dialog handle setError RHF
  onSubmit: (values: ProfileFormState) => Promise<void>;
};

export function ProfileEditDialog({
  open,
  onOpenChange,
  main,
  defaultValues,
  saving,
  onSubmit,
}: Props) {
  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isValid, isSubmitting },
  } = useForm<ProfileUpdateForm>({
    resolver: zodResolver(ProfileUpdateSchema),
    mode: "onChange",
    defaultValues,
  });

  // ✅ setiap dialog dibuka / defaultValues berubah → reset form
  React.useEffect(() => {
    if (open) {
      reset(defaultValues);
    }
  }, [open, defaultValues, reset]);

  const disabled = saving || isSubmitting;

  // ✅ FIX: typed submit values (hindari implicit any)
  const submit: React.FormEventHandler<HTMLFormElement> = handleSubmit(
    (async (values: ProfileUpdateForm) => {
      try {
        // reminder: schema ini beda key (camelCase) — sama persis dengan ProfileFormState
        await onSubmit(values as unknown as ProfileFormState);
        onOpenChange(false);
      } catch (e: unknown) {
        // ✅ Tangkap "validation object" dari page (422)
        const err = e as BackendValidationError;

        if (err?.kind === "validation") {
          // set field errors kalau ada
          if (err.fieldErrors) {
            // mapping key backend (snake_case) -> key form (camelCase)
            const map: Partial<Record<string, keyof ProfileUpdateForm>> = {
              no_ktp: "noKtp",
              tanggal_lahir: "tanggalLahir",
              alamat_rumah: "alamatRumah",
              handphone: "handphone",
              status_perkawinan: "statusPerkawinan",
              email_pribadi: "emailPribadi",
              tempat_lahir: "tempatLahir",
              jenis_kelamin: "jenisKelamin",
              jabatan_terakhir: "jabatanTerakhir",
              gelar_akademik: "gelarAkademik",
              golongan_darah: "golonganDarah",
              penilaian_kerja: "penilaianKerja",
            };

            for (const [k, msg] of Object.entries(err.fieldErrors)) {
              const key = map[k];
              if (key) {
                setError(key, { type: "server", message: msg });
              }
            }
          } else {
            // fallback: taruh error global di salah satu field biar kebaca user
            setError("noKtp", { type: "server", message: err.message });
          }

          return;
        }

        // fallback non-422
        const message =
          e instanceof Error ? e.message : "Gagal menyimpan profil.";
        setError("noKtp", { type: "server", message });
      }
    }) as SubmitHandler<ProfileUpdateForm>
  );

  // ✅ FIX: helper type supaya FieldError tidak any dan aman dipakai untuk semua field
  const FieldError = <TName extends FieldPath<ProfileUpdateForm>>({
    name,
  }: {
    name: TName;
  }) => {
    const msg = errors[name]?.message;
    if (!msg) return null;
    return <p className="text-xs text-red-600 mt-1">{String(msg)}</p>;
  };

  // ✅ FIX: helper renderer typed supaya "field" tidak implicit any
  const selectRenderer =
    <TName extends FieldPath<ProfileUpdateForm>>(disabledSelect: boolean) =>
    ({
      field,
    }: {
      field: ControllerRenderProps<ProfileUpdateForm, TName>;
    }) =>
      field;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Ubah Data Profil
          </DialogTitle>
        </DialogHeader>

        <form className="mt-4 space-y-5" onSubmit={submit}>
          {/* Nama Lengkap */}
          <div className="flex flex-col gap-1">
            <Label className="text-sm text-muted-foreground">Nama Lengkap</Label>
            <Input className="h-9 text-sm" value={main.namaLengkap} disabled />
          </div>

          {/* Jabatan Terakhir */}
          <div className="flex flex-col gap-1">
            <Label className="text-sm text-muted-foreground">
              Jabatan Terakhir
            </Label>
            <Input
              className="h-9 text-sm"
              disabled={disabled}
              {...register("jabatanTerakhir")}
            />
            <FieldError name="jabatanTerakhir" />
          </div>

          {/* Unit Kerja (READ-ONLY) */}
          <div className="flex flex-col gap-1">
            <Label className="text-sm text-muted-foreground">Unit Kerja</Label>
            <Input className="h-9 text-sm" value={main.unitKerja} disabled />
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
              disabled={disabled}
              {...register("handphone")}
            />
            <FieldError name="handphone" />
          </div>

          {/* No KTP (wajib) */}
          <div className="flex flex-col gap-1">
            <Label className="text-sm text-muted-foreground">
              No. KTP <span className="text-red-500">*</span>
            </Label>
            <Input
              className="h-9 text-sm"
              disabled={disabled}
              {...register("noKtp")}
            />
            <FieldError name="noKtp" />
          </div>

          {/* Gelar Akademik */}
          <div className="flex flex-col gap-1">
            <Label className="text-sm text-muted-foreground">
              Gelar Akademik
            </Label>
            <Input
              className="h-9 text-sm"
              disabled={disabled}
              {...register("gelarAkademik")}
            />
            <FieldError name="gelarAkademik" />
          </div>

          {/* Pendidikan & Jenis Kelamin */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <Label className="text-sm text-muted-foreground">Pendidikan</Label>

              <Controller
                control={control}
                name="pendidikan"
                render={({ field }: { field: ControllerRenderProps<ProfileUpdateForm, "pendidikan"> }) => (
                  <Select
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                    disabled={disabled}
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
                )}
              />
              <FieldError name="pendidikan" />
            </div>

            <div className="flex flex-col gap-1">
              <Label className="text-sm text-muted-foreground">
                Jenis Kelamin
              </Label>

              <Controller
                control={control}
                name="jenisKelamin"
                render={({ field }: { field: ControllerRenderProps<ProfileUpdateForm, "jenisKelamin"> }) => (
                  <Select
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                    disabled={disabled}
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
                )}
              />
              <FieldError name="jenisKelamin" />
            </div>
          </div>

          {/* Tempat Lahir & Tanggal Lahir */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <Label className="text-sm text-muted-foreground">
                Tempat Lahir
              </Label>

              <Controller
                control={control}
                name="tempatLahir"
                render={({ field }: { field: ControllerRenderProps<ProfileUpdateForm, "tempatLahir"> }) => (
                  <CityCombobox
                    value={field.value ?? ""}
                    onChange={(v: string) => field.onChange(v)}
                  />
                )}
              />
              <FieldError name="tempatLahir" />
            </div>

            <div className="flex flex-col gap-1">
              <Label className="text-sm text-muted-foreground">
                Tanggal Lahir <span className="text-red-500">*</span>
              </Label>

              <Controller
                control={control}
                name="tanggalLahir"
                render={({ field }: { field: ControllerRenderProps<ProfileUpdateForm, "tanggalLahir"> }) => (
                  <DatePicker
                    value={field.value ?? ""}
                    onChange={(v: string) => field.onChange(v)}
                  />
                )}
              />
              <FieldError name="tanggalLahir" />
            </div>
          </div>

          {/* Agama & Suku */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <Label className="text-sm text-muted-foreground">Agama</Label>

              <Controller
                control={control}
                name="agama"
                render={({ field }: { field: ControllerRenderProps<ProfileUpdateForm, "agama"> }) => (
                  <Select
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                    disabled={disabled}
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
                )}
              />
              <FieldError name="agama" />
            </div>

            <div className="flex flex-col gap-1">
              <Label className="text-sm text-muted-foreground">Suku</Label>

              <Controller
                control={control}
                name="suku"
                render={({ field }: { field: ControllerRenderProps<ProfileUpdateForm, "suku"> }) => (
                  <Select
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                    disabled={disabled}
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
                )}
              />
              <FieldError name="suku" />
            </div>
          </div>

          {/* Golongan Darah & Status Perkawinan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <Label className="text-sm text-muted-foreground">
                Golongan Darah
              </Label>

              <Controller
                control={control}
                name="golonganDarah"
                render={({ field }: { field: ControllerRenderProps<ProfileUpdateForm, "golonganDarah"> }) => (
                  <Select
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                    disabled={disabled}
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
                )}
              />
              <FieldError name="golonganDarah" />
            </div>

            <div className="flex flex-col gap-1">
              <Label className="text-sm text-muted-foreground">
                Status Perkawinan <span className="text-red-500">*</span>
              </Label>

              <Controller
                control={control}
                name="statusPerkawinan"
                render={({ field }: { field: ControllerRenderProps<ProfileUpdateForm, "statusPerkawinan"> }) => (
                  <Select
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                    disabled={disabled}
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
                )}
              />
              <FieldError name="statusPerkawinan" />
            </div>
          </div>

          {/* Alamat Rumah (wajib) */}
          <div className="flex flex-col gap-1">
            <Label className="text-sm text-muted-foreground">
              Alamat Rumah <span className="text-red-500">*</span>
            </Label>
            <Input
              className="h-9 text-sm"
              disabled={disabled}
              {...register("alamatRumah")}
            />
            <FieldError name="alamatRumah" />
          </div>

          {/* NPWP */}
          <div className="flex flex-col gap-1">
            <Label className="text-sm text-muted-foreground">NPWP</Label>
            <Input
              className="h-9 text-sm"
              disabled={disabled}
              {...register("npwp")}
            />
            <FieldError name="npwp" />
          </div>

          {/* Email Pribadi */}
          <div className="flex flex-col gap-1">
            <Label className="text-sm text-muted-foreground">Email Pribadi</Label>
            <Input
              className="h-9 text-sm"
              disabled={disabled}
              {...register("emailPribadi")}
            />
            <FieldError name="emailPribadi" />
          </div>

          {/* Penilaian Kerja */}
          <div className="flex flex-col gap-1">
            <Label className="text-sm text-muted-foreground">Penilaian Kerja</Label>
            <textarea
              className="w-full min-h-[80px] rounded-md border px-3 py-2 text-sm"
              disabled={disabled}
              {...register("penilaianKerja")}
            />
            <FieldError name="penilaianKerja" />
          </div>

          {/* Pencapaian */}
          <div className="flex flex-col gap-1">
            <Label className="text-sm text-muted-foreground">Pencapaian</Label>
            <textarea
              className="w-full min-h-[80px] rounded-md border px-3 py-2 text-sm"
              disabled={disabled}
              {...register("pencapaian")}
            />
            <FieldError name="pencapaian" />
          </div>

          {/* BUTTONS */}
          <div className="pt-4 flex justify-center gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={disabled}
            >
              Batal
            </Button>

            <Button type="submit" disabled={disabled || !isValid}>
              {(disabled || isSubmitting) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Simpan
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
