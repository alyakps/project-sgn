// src/lib/api-import.ts
import { getToken, clearAuth } from "@/lib/auth-storage";

export type ImportType = "hard" | "soft";
export type ImportLogType = "hard" | "soft" | "karyawan";
export type ImportLogStatus = "active" | "canceled";

export type ImportLog = {
  id: number;
  filename: string;
  type: ImportLogType;
  uploadedAt: string;
  year?: number;
  status?: ImportLogStatus;
};

const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL;

function getBaseUrl(): string {
  if (!RAW_API_URL) throw new Error("API URL belum di-set");
  return RAW_API_URL.replace(/\/$/, "");
}

function normalizeType(raw: unknown): ImportLogType {
  const v = String(raw ?? "").toLowerCase();
  if (v.includes("karyawan")) return "karyawan";
  if (v.includes("soft")) return "soft";
  if (v.includes("hard")) return "hard";
  return "hard";
}

function normalizeStatus(raw: unknown): ImportLogStatus {
  const v = String(raw ?? "").toLowerCase();
  if (v.includes("cancel")) return "canceled";
  if (v.includes("rollback")) return "canceled";
  return "active";
}

function pickErrorMessage(payload: any): string | null {
  if (!payload) return null;

  if (typeof payload.message === "string" && payload.message.trim() !== "") {
    return payload.message;
  }

  if (payload.errors && typeof payload.errors === "object") {
    const firstKey = Object.keys(payload.errors)[0];
    const val = payload.errors[firstKey];
    if (Array.isArray(val) && typeof val[0] === "string") return val[0];
  }

  if (typeof payload.error === "string" && payload.error.trim() !== "") {
    return payload.error;
  }

  return null;
}

export async function fetchImportLogs(): Promise<ImportLog[]> {
  const token = getToken();
  const API_URL = getBaseUrl();
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

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const msg = pickErrorMessage(json) || "Gagal memuat log import";
    throw new Error(msg);
  }

  const rawLogs = ((json?.data ?? json) as any[]) ?? [];
  const pad = (n: number) => String(n).padStart(2, "0");

  return rawLogs.map((item, index) => {
    const createdAt = item.created_at ?? item.uploaded_at ?? "";
    const dt = createdAt ? new Date(createdAt) : null;

    const uploadedAt =
      dt != null && !Number.isNaN(dt.getTime())
        ? `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())} ${pad(
            dt.getHours()
          )}:${pad(dt.getMinutes())}`
        : createdAt || "-";

    return {
      id: item.id ?? index + 1,
      filename: item.filename ?? "-",
      type: normalizeType(item.type),
      uploadedAt,
      year: item.tahun ?? item.year ?? undefined,
      status: normalizeStatus(item.status),
    };
  });
}

/**
 * ✅ FIX UTAMA:
 * - 200 => success
 * - 422 => import selesai tapi ada baris gagal (partial success) => tetap return payload
 * Dengan ini UI kamu akan tetap "onSuccess" dan bisa refresh tabel log tanpa reload page.
 */
export async function importCompetencyFile(type: ImportType, file: File, year: number) {
  const API_URL = getBaseUrl();
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
      Accept: "application/json",
    },
    body: formData,
  });

  if (res.status === 401) {
    clearAuth();
    throw new Error("Sesi login kadaluarsa, silakan login ulang");
  }

  const payload = await res.json().catch(() => null);

  // ✅ 422 dianggap "hasil import" (bukan throw)
  if (res.status === 422) {
    return payload;
  }

  if (!res.ok) {
    const msg = pickErrorMessage(payload) || "Terjadi kesalahan saat import file";
    throw new Error(msg);
  }

  return payload;
}

export async function cancelImportLog(importLogId: number) {
  const API_URL = getBaseUrl();
  const token = getToken();
  if (!token) throw new Error("Token tidak ditemukan, silakan login ulang");

  const res = await fetch(`${API_URL}/api/admin/import-cancel/${importLogId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  if (res.status === 401) {
    clearAuth();
    throw new Error("Sesi login kadaluarsa, silakan login ulang");
  }

  const payload = await res.json().catch(() => null);

  if (!res.ok) {
    const msg = pickErrorMessage(payload) || "Gagal membatalkan import";
    throw new Error(msg);
  }

  return payload;
}
