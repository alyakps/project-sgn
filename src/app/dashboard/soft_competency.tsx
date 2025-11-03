"use client";

export default function SoftCompetencyPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl md:text-2xl font-bold text-zinc-900">
        Soft Competency
      </h1>
      <p className="text-sm text-zinc-500 max-w-xl">
        Di sini nanti daftar kompetensi soft (komunikasi, teamwork, leadership, dll).
      </p>

      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm p-6 text-sm text-zinc-700">
        (Belum ada data. Kamu bisa isi nanti dari database.)
      </div>
    </div>
  );
}
