"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

type Props = {
  name: string;
  avatarUrl?: string | null;
  empNo: string;
  title: string;
  unit: string;
};

export default function ProfileCard({
  name,
  avatarUrl,
  empNo,
  title,
  unit,
}: Props) {
  const initials =
    name
      .split(" ")
      .map((s) => s[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  // hanya pakai url kalau benar2 ada dan bukan string kosong
  const safeAvatarUrl =
    avatarUrl && avatarUrl.trim() !== "" ? avatarUrl : undefined;

  return (
    <Card className="rounded-xl border border-zinc-200">
      <CardContent className="p-4">
        {/* Desktop */}
        <div className="hidden sm:grid sm:grid-cols-[auto_1fr_1fr] items-center gap-y-4 gap-x-3">
          <div className="flex items-center justify-start">
          <Avatar className="h-24 w-24 rounded-full ring-4 ring-white shadow-xl overflow-hidden">
            {safeAvatarUrl && <AvatarImage src={safeAvatarUrl} alt={name} />}
            <AvatarFallback className="flex h-full w-full items-center justify-center rounded-full bg-zinc-200 text-zinc-700 text-3xl font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          </div>

          <div className="flex flex-col justify-center pl-4">
            <div>
              <div className="text-[11px] text-zinc-500">Nama</div>
              <div className="text-lg font-semibold text-zinc-900">{name}</div>
            </div>
            <div className="mt-2">
              <div className="text-[11px] text-zinc-500">Employee Number</div>
              <div className="text-sm font-medium">{empNo}</div>
            </div>
          </div>

          <div className="flex flex-col justify-center gap-3">
            <div>
              <div className="text-[11px] text-zinc-500">Jabatan</div>
              <div className="text-sm font-medium">{title}</div>
            </div>
            <div>
              <div className="text-[11px] text-zinc-500">Unit Kerja</div>
              <div className="text-sm font-medium">{unit}</div>
            </div>
          </div>
        </div>

        {/* Mobile */}
        <div className="sm:hidden space-y-4">
          <div className="flex justify-start">
            <Avatar className="h-24 w-24 rounded-full ring-4 ring-white shadow-xl overflow-hidden">
              {safeAvatarUrl && <AvatarImage src={safeAvatarUrl} alt={name} />}
              <AvatarFallback className="bg-[#05398f] text-white text-xl font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="grid grid-cols-[120px_1fr] gap-x-4 gap-y-2">
            <div className="text-[11px] text-zinc-500">Nama</div>
            <div className="text-base font-semibold text-zinc-900">{name}</div>

            <div className="text-[11px] text-zinc-500">Employee Number</div>
            <div className="text-sm font-medium">{empNo}</div>

            <div className="text-[11px] text-zinc-500">Jabatan</div>
            <div className="text-sm font-medium">{title}</div>

            <div className="text-[11px] text-zinc-500">Unit Kerja</div>
            <div className="text-sm font-medium">{unit}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
