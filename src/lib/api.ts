const API_URL = process.env.NEXT_PUBLIC_API_URL!;
if (!API_URL) {
  // Biar kalau lupa set env langsung ketahuan di awal
  throw new Error("NEXT_PUBLIC_API_URL belum di-set");
}

/* ====================== AUTH ====================== */

export async function apiLogin(email: string, password: string) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Login gagal");
  }

  return data;
}

export async function apiMe(token: string) {
  const res = await fetch(`${API_URL}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Gagal mengambil profile user");
  }

  return data;
}

export async function apiLogout(token: string) {
  const res = await fetch(`${API_URL}/api/auth/logout`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  // backend cuma hapus token, kalau error pun kita tetap clear di FE
  if (!res.ok) {
    throw new Error("Gagal logout");
  }

  return res.json().catch(() => ({}));
}

/**
 * Change Password (user yang login sendiri)
 */
export async function apiChangePassword(
  token: string,
  payload: {
    current_password: string;
    new_password: string;
    new_password_confirmation: string;
  }
) {
  const res = await fetch(`${API_URL}/api/auth/change-password`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    // Laravel ValidationError -> { errors: {field: [msg]} } atau {message: "..."}
    const msg =
      (data.errors &&
        Object.values(data.errors)
          .flat()
          .join("\n")) ||
      data.message ||
      "Gagal mengubah password";
    throw new Error(msg);
  }

  return data;
}

/* ====================== DASHBOARD KARYAWAN ====================== */

export async function apiKaryawanSummary(
  token: string,
  tahun: "all" | number = "all"
) {
  const params = new URLSearchParams();
  if (tahun !== "all") {
    params.set("tahun", String(tahun));
  }

  const qs = params.toString();
  const url = qs
    ? `${API_URL}/api/dashboard/karyawan/summary?${qs}`
    : `${API_URL}/api/dashboard/karyawan/summary`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(json.message || "Gagal mengambil summary karyawan");
  }

  // backend bisa kirim {data: {...}} atau langsung {...}
  return json.data ?? json;
}

/* ====================== KARYAWAN – HARD COMPETENCY LIST ====================== */

export async function apiKaryawanHardList(
  token: string,
  tahun: "all" | number
) {
  const url = new URL(`${API_URL}/api/karyawan/hard-competencies`);

  if (tahun !== "all") {
    url.searchParams.set("tahun", String(tahun));
  }

  const res = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await res.json().catch(() => ({} as any));

  if (!res.ok) {
    const msg = json.message || "Gagal mengambil data Hard Competency.";
    throw new Error(msg);
  }

  // supaya konsisten: kembalikan bentuk { items, available_years }
  const items = Array.isArray(json.data) ? json.data : [];
  const years = Array.isArray(json.available_years)
    ? json.available_years.map((y: any) => Number(y))
    : [];

  return {
    items,
    available_years: years,
  };
}

/* ====================== KARYAWAN – SOFT COMPETENCY LIST ====================== */

export async function apiKaryawanSoftList(
  token: string,
  tahun: "all" | number
) {
  const url = new URL(`${API_URL}/api/karyawan/soft-competencies`);

  if (tahun !== "all") {
    url.searchParams.set("tahun", String(tahun));
  }

  const res = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await res.json().catch(() => ({} as any));

  if (!res.ok) {
    const msg = json.message || "Gagal mengambil data Soft Competency.";
    throw new Error(msg);
  }

  const items = Array.isArray(json.data) ? json.data : [];
  const years = Array.isArray(json.available_years)
    ? json.available_years.map((y: any) => Number(y))
    : [];

  return {
    items,
    available_years: years,
  };
}

/* ====================== ADMIN – KARYAWAN LIST ====================== */

export type AdminKaryawan = {
  id: number;
  nik: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
};

export type AdminKaryawanMeta = {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
};

/**
 * GET /api/admin/karyawan
 * Query: per_page, page, q
 * Dipakai di halaman Manajemen User (AdminUsersPage)
 */
export async function apiAdminListKaryawan(
  token: string,
  params?: { page?: number; per_page?: number; q?: string }
): Promise<{ items: AdminKaryawan[]; meta: AdminKaryawanMeta }> {
  const url = new URL(`${API_URL}/api/admin/karyawan`);

  if (params?.per_page) url.searchParams.set("per_page", String(params.per_page));
  if (params?.page) url.searchParams.set("page", String(params.page));
  if (params?.q && params.q.trim() !== "") {
    url.searchParams.set("q", params.q.trim());
  }

  const res = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await res.json().catch(() => ({} as any));

  if (!res.ok) {
    const msg = json.message || "Gagal mengambil data karyawan.";
    throw new Error(msg);
  }

  const items = Array.isArray(json.data) ? json.data : [];
  const meta: AdminKaryawanMeta =
    json.meta ?? {
      current_page: 1,
      per_page: items.length,
      total: items.length,
      last_page: 1,
    };

  return { items, meta };
}

/* ====================== ADMIN – CREATE KARYAWAN ====================== */

export type CreateKaryawanPayload = {
  role: "karyawan" | "admin";
  nik: string;
  name: string;
  unit_kerja: string;
  jabatan_terakhir?: string | null;
  email: string;
  password: string;
  password_confirmation: string;
};

/**
 * POST /api/admin/karyawan
 * Body: { role, nik, name, unit_kerja, jabatan_terakhir, email, password, password_confirmation }
 */
export async function apiAdminCreateKaryawan(
  token: string,
  payload: CreateKaryawanPayload
) {
  const res = await fetch(`${API_URL}/api/admin/karyawan`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json().catch(() => ({} as any));

  if (!res.ok) {
    let message = json.message || "Gagal membuat karyawan.";

    if (json.errors && typeof json.errors === "object") {
      const firstField = Object.keys(json.errors)[0];
      if (firstField && Array.isArray(json.errors[firstField])) {
        message = json.errors[firstField][0] || message;
      }
    }

    throw new Error(message);
  }

  // contoh response:
  // { "message": "Karyawan berhasil dibuat.", "data": { "user": {...} } }
  return json as {
    message: string;
    data: {
      user: {
        id: number;
        nik: string;
        name: string;
        email: string;
        role: string;
        unit_kerja: string;
      };
    };
  };
}

/* ====================== ADMIN – RESET PASSWORD KARYAWAN ====================== */

/**
 * Reset password karyawan (role: karyawan) ke default (123).
 * Endpoint: POST /api/admin/karyawan/{user}/reset-password
 * Middleware: auth:sanctum + role:admin
 */
export async function apiAdminResetKaryawanPassword(
  token: string,
  userId: number
) {
  const res = await fetch(
    `${API_URL}/api/admin/karyawan/${userId}/reset-password`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const json = await res.json().catch(() => ({} as any));

  if (!res.ok) {
    const msg = json.message || "Gagal reset password karyawan.";
    throw new Error(msg);
  }

  // backend kirim { message, default_password }
  return json as { message: string; default_password: string };
}

/* ====================== ADMIN – DELETE KARYAWAN ====================== */

export async function apiAdminDeleteKaryawan(token: string, userId: number) {
  const res = await fetch(`${API_URL}/api/admin/karyawan/${userId}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await res.json().catch(() => ({} as any));

  if (!res.ok) {
    const msg = json.message || "Gagal menghapus karyawan.";
    throw new Error(msg);
  }

  // backend biasanya respond { message: "..." }
  return json;
}

/* ====================== ADMIN – IMPORT KARYAWAN (EXCEL) ====================== */

/**
 * Import karyawan via Excel.
 * Endpoint: POST /api/admin/import-karyawan
 * Body: form-data { file: xls/xlsx }
 */
export async function apiAdminImportKaryawan(token: string, file: File) {
  const formData = new FormData();
  // pastikan nama field "file" sama dengan yang diterima AdminController@importKaryawan
  formData.append("file", file);

  const res = await fetch(`${API_URL}/api/admin/import-karyawan`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      // Jangan set Content-Type manual, biar browser yang set boundary multipart
    },
    body: formData,
  });

  const json = await res.json().catch(() => ({} as any));

  if (!res.ok) {
    const msg =
      json.message ||
      "Gagal mengimpor karyawan. Pastikan format file sudah sesuai.";
    throw new Error(msg);
  }

  return json;
}

/* ====================== MASTER DATA ====================== */

export async function apiGetMasterUnitKerja(token: string): Promise<string[]> {
  const res = await fetch(`${API_URL}/api/master/unit-kerja`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await res.json().catch(() => ({} as any));

  if (!res.ok) {
    const msg = json.message || "Gagal mengambil data unit kerja.";
    throw new Error(msg);
  }

  const list = Array.isArray(json.data) ? json.data : [];
  return list as string[];
}
