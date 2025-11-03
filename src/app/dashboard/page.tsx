"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";

export default function DashboardPage() {
  const employeeName = "Andrian Tambunan";
  const employeeNumber = "5025211018";
  const employeeLevel = "BOD-3";

  return (
    <div className="flex flex-col gap-10 min-h-full">
      {/* === HEADER UNGU === */}
      <Card className="relative w-full overflow-hidden rounded-2xl border-0 shadow-xl bg-gradient-to-r from-violet-600 to-violet-500 text-white">
        <CardContent className="p-6 sm:p-8 flex flex-col justify-center relative">
          {/* Label kecil */}
          <p className="text-[10px] uppercase tracking-widest font-semibold text-violet-200 mb-1">
            Project
          </p>

          {/* Title besar */}
          <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>

          {/* Avatar kecil di pojok kanan atas */}
          <Avatar className="absolute top-4 right-4 h-10 w-10 ring-2 ring-white/70 shadow-lg">
            <AvatarImage src="/avatar.png" alt="User" />
            <AvatarFallback>AT</AvatarFallback>
          </Avatar>

          {/* Dekorasi sparkle / aura */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute right-[-40px] top-[10px] w-[160px] h-[160px] rounded-full bg-white/10 blur-3xl" />
            <div className="absolute right-[40px] top-[30px] w-[80px] h-[80px] rounded-full border border-white/30 opacity-30 rotate-12" />
            <div className="absolute right-[100px] bottom-[20px] w-[40px] h-[40px] rounded-full border border-white/20 opacity-40" />
          </div>
        </CardContent>
      </Card>

      {/* === PROFILE CARD === */}
      <Card className="bg-white/90 backdrop-blur-sm border border-zinc-200 shadow-xl">
        <CardContent className="flex items-center gap-6 p-6">
          {/* Avatar besar */}
          <Avatar className="h-28 w-28 ring-1 ring-black/5 shadow-md">
            <AvatarImage src="/avatar.png" alt={employeeName} />
            <AvatarFallback>AT</AvatarFallback>
          </Avatar>

          {/* Info teks */}
          <div className="flex flex-col">
            <h2 className="text-base sm:text-lg font-semibold text-zinc-900">
              {employeeName}
            </h2>
            <p className="text-sm text-zinc-700">{employeeNumber}</p>
            <p className="text-sm text-zinc-500">{employeeLevel}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
