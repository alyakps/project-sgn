// src/app/dashboard/profile/page.tsx
"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

type KeyVal = { label: string; value: string };

export default function ProfilePage() {
  const main = {
    namaLengkap: "Muchammad Hardhiaz Maulana Putra",
    jabatanTerakhir: "Backend Developer Intern",
    nikPn: "5025211018",
    handphone: "081234567890",
    email: "andrian.tambunan@example.com",
    avatarUrl: "/avatar.png",
    avatarAlt: "Andrian Tambunan",
  };

  const personal: KeyVal[] = [
    { label: "Gelar Akademik", value: "S.Kom" },
    { label: "Pendidikan", value: "S1" },
    { label: "No. KTP", value: "3507091234567890" },
    { label: "Tempat Lahir", value: "Medan" },
    { label: "Tanggal Lahir (DD/MM/YY)", value: "25/08/02" },
    { label: "Jenis Kelamin", value: "Laki-laki" },
    { label: "Agama", value: "Kristen Protestan" },
    {
      label: "Alamat Rumah",
      value: "Jl. Raya ITS, Keputih, Sukolilo, Surabaya",
    },
    { label: "NPWP", value: "123456789012000" },
    { label: "Suku", value: "Batak" },
    { label: "Golongan Darah", value: "O" },
    { label: "Status Perkawinan", value: "Belum Menikah" },
  ];

  const performance = {
    penilaianKerja: [
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    ],
    achievements: [
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    ],
  };

  return (
    <div className="flex flex-col gap-3">
      {/* ===== PAGE TITLE ===== */}
      <h2 className="text-lg sm:text-xl font-semibold">Profile</h2>

      {/* ===== MAIN CARD ===== */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          {/* Avatar */}
          <Avatar className="h-17.5 w-17.5 shrink-0">
            <AvatarImage src={main.avatarUrl} alt={main.avatarAlt} />
            <AvatarFallback>{initials(main.namaLengkap)}</AvatarFallback>
          </Avatar>

          {/* Right content */}
          <div className="flex flex-col w-full">
            {/* Nama + Jabatan */}
            <div>
              <h1
                className={`text-xl font-semibold leading-tight ${
                  main.namaLengkap.split(" ").length > 2
                    ? "whitespace-normal wrap-break-word max-w-[260px] sm:max-w-[320px]"
                    : "whitespace-nowrap"
                }`}
              >
                {main.namaLengkap}
              </h1>
              <p className="text-sm text-muted-foreground">
                {main.jabatanTerakhir}
              </p>
            </div>

            {/* PN / Phone kiri + Email kanan */}
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-y-2 lg:gap-x-8 relative">
              {/* Kolom kiri */}
              <div className="space-y-2">
                <KVStack label="NIK" value={main.nikPn} nowrap />
                <KVStack label="Handphone" value={main.handphone} nowrap />
              </div>

              {/* Garis vertikal dihapus di sini */}

              {/* Kolom kanan */}
              <div className="pt-2 lg:pt-0 lg:pl-10">
                <KVStack
                  label="Email"
                  value={main.email}
                  classNameValue="break-all sm:break-normal sm:truncate sm:max-w-[360px]"
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* ===== CONTENT CARDS ===== */}
      <div className="grid grid-cols-1 gap-6 mt-6">
        <SectionCard title="Personal Information">
          <TwoColList items={personal} />
        </SectionCard>

        <SectionCard title="Work Performance">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Penilaian Kerja
              </p>
              {performance.penilaianKerja.map((text, i) => (
                <p key={i} className="font-semibold leading-relaxed">
                  {text}
                </p>
              ))}
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Achievement</p>
              {performance.achievements.map((a, i) => (
                <p key={i} className="font-semibold leading-relaxed">
                  {a}
                </p>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

/* ===== Small Components ===== */
function KVStack({
  label,
  value,
  nowrap,
  classNameValue,
}: {
  label: string;
  value: string;
  nowrap?: boolean;
  classNameValue?: string;
}) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={[
          "text-sm font-semibold min-w-0 overflow-hidden",
          nowrap ? "whitespace-nowrap" : "wrap-break-word",
          classNameValue ?? "",
        ].join(" ")}
        title={value}
      >
        {value}
      </p>
    </div>
  );
}

/* ===== Two-Column List ===== */
function TwoColList({ items }: { items: KeyVal[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 md:gap-y-3 gap-x-8">
      {items.map((it) => (
        <div key={it.label} className="flex flex-col min-w-0">
          <span className="text-sm text-muted-foreground">{it.label}</span>
          <span className="font-semibold wrap-break-word whitespace-pre-wrap">
            {it.value}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ===== Section Card ===== */
function SectionCard({
  title,
  children,
  className,
}: React.PropsWithChildren<{ title: string; className?: string }>) {
  return (
    <Card className={className}>
      <div className="p-3 md:p-4">
        <h2 className="text-lg font-semibold tracking-tight mb-2">{title}</h2>
        <div className="border-t border-gray-200" />
        <CardContent className="p-0 pt-3">{children}</CardContent>
      </div>
    </Card>
  );
}

/* ===== Helper ===== */
function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
