// app/admin/dashboard/page.tsx

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-zinc-900">
        Dashboard Admin
      </h1>

      <p className="text-sm text-zinc-600">
        Ini halaman utama untuk admin. Nanti bisa kamu isi dengan card summary,
        grafik, atau quick action (import data, kelola user, dll).
      </p>

      {/* Contoh placeholder card biar kelihatan ada konten */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <p className="text-xs font-medium text-zinc-500">
            Total Karyawan
          </p>
          <p className="mt-2 text-2xl font-semibold text-zinc-900">0</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <p className="text-xs font-medium text-zinc-500">
            Penilaian Hard
          </p>
          <p className="mt-2 text-2xl font-semibold text-zinc-900">0</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <p className="text-xs font-medium text-zinc-500">
            Penilaian Soft
          </p>
          <p className="mt-2 text-2xl font-semibold text-zinc-900">0</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <p className="text-xs font-medium text-zinc-500">
            Belum Dinilai
          </p>
          <p className="mt-2 text-2xl font-semibold text-amber-600">0</p>
        </div>
      </div>
    </div>
  );
}
