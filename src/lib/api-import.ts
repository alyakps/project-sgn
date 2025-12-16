// src/lib/api-import.ts
import { getToken, clearAuth } from "@/lib/auth-storage";

export type ImportType = "hard" | "soft";

export type ImportLog = {
  id: number;
  filename: string;
  type: ImportType;
  uploadedAt: string;
  year?: number;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function normalizeType(raw: unknown): ImportType {
  const v = String(raw ?? "").toLowerCase();

  // backend format: "soft_competency" | "hard_competency"
  if (v.includes("soft")) return "soft";
  return "hard";
}

export async function fetchImportLogs(): Promise<ImportLog[]> {
  const token = getToken();
  if (!API_URL) throw new Error("API URL belum di-set");
  if (!token) throw new Error("Token tidak ditemukan, silakan login ulang");

  const res = await fetch(`${API_URL}/api/admin/import-logs`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  if (res.status === 401) {
    clearAuth();
    throw new Error("Sesi login kadaluarsa, silakan login ulang");
  }

  if (!res.ok) {
    throw new Error("Gagal memuat log import");
  }

  const json = await res.json();

  // Asumsi response: { data: [ { id, filename, type, tahun, created_at } ] }
  const rawLogs = (json.data ?? json) as any[];

  const pad = (v: number) => String(v).padStart(2, "0");

  return rawLogs.map((item, index) => {
    const createdAt = item.created_at ?? item.uploaded_at ?? "";
    const dt = createdAt ? new Date(createdAt) : null;

    const uploadedAt =
      dt != null && !Number.isNaN(dt.getTime())
        ? `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(
            dt.getDate()
          )} ${pad(dt.getHours())}:${pad(dt.getMinutes())}`
        : createdAt || "-";

    return {
      id: item.id ?? index + 1,
      filename: item.filename ?? "-",
      type: normalizeType(item.type), // ✅ FIX DI SINI
      uploadedAt,
      year: item.tahun ?? item.year ?? undefined,
    };
  });
}

export async function importCompetencyFile(
  type: ImportType,
  file: File,
  year: number
) {
  if (!API_URL) throw new Error("API URL belum di-set");

  const token = getToken();
  if (!token) throw new Error("Token tidak ditemukan, silakan login ulang");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("tahun", String(year));

  const endpoint =
    type === "hard"
      ? `${API_URL}/api/admin/import-hard-competencies`
      : `${API_URL}/api/admin/import-soft-competencies`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (res.status === 401) {
    clearAuth();
    throw new Error("Sesi login kadaluarsa, silakan login ulang");
  }

  const payload = await res.json().catch(() => null);

  if (!res.ok) {
    const msg =
      payload?.message ||
      payload?.error ||
      "Terjadi kesalahan saat import file";
    throw new Error(msg);
  }

  return payload;
}
