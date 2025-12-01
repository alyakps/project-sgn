const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export async function apiLogin(email: string, password: string) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

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

  const data = await res.json();

  if (!res.ok) {
    throw new Error("Gagal mengambil profile user");
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

  if (!res.ok) {
    // backend cuma hapus token, kalau error pun kita tetap clear di FE
    throw new Error("Gagal logout");
  }

  return res.json().catch(() => ({}));
}

// 🔹 Change Password
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
        Object.values(data.errors).flat().join("\n")) ||
      data.message ||
      "Gagal mengubah password";
    throw new Error(msg);
  }

  return data;
}

// src/lib/api.ts
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

  // <- unwrap "data" di sini, jadi di page.tsx kamu tetap pakai data.profile, data.hard_competency, dst
  return json.data ?? json;
}

// ===== KARYAWAN – HARD COMPETENCY LIST =====
export async function apiKaryawanHardList(
  token: string,
  tahun: "all" | number
) {
  if (!API_URL) throw new Error("NEXT_PUBLIC_API_URL belum di-set");

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
    const msg =
      json.message ||
      "Gagal mengambil data Hard Competency.";
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

// ===== KARYAWAN – SOFT COMPETENCY LIST =====
export async function apiKaryawanSoftList(
  token: string,
  tahun: "all" | number
) {
  if (!API_URL) throw new Error("NEXT_PUBLIC_API_URL belum di-set");

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
    const msg =
      json.message ||
      "Gagal mengambil data Soft Competency.";
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
