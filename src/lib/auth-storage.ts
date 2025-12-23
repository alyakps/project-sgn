import Cookies from "js-cookie";

const TOKEN_KEY = "sgn_token";
const USER_KEY = "sgn_user";
const MUST_CHANGE_KEY = "sgn_must_change_password";

// ✅ NEW: simpan role untuk middleware
const ROLE_KEY = "sgn_role";

export function saveAuth(token: string, user: any) {
  Cookies.set(TOKEN_KEY, token, { expires: 7 });

  const role = String(user?.role ?? "karyawan").toLowerCase();

  // ✅ role buat middleware
  Cookies.set(ROLE_KEY, role, { expires: 7 });

  /**
   * ✅ MUST CHANGE hanya berlaku untuk karyawan
   * Admin selalu 0 biar admin tidak pernah kena lock middleware
   */
  const mustChange =
    role !== "admin" && user?.must_change_password ? "1" : "0";
  Cookies.set(MUST_CHANGE_KEY, mustChange, { expires: 7 });

  if (typeof window !== "undefined") {
    localStorage.setItem(USER_KEY, JSON.stringify({ ...user, role }));
  }
}

export function getToken() {
  return Cookies.get(TOKEN_KEY) || null;
}

export function getUser() {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem(USER_KEY);
  return data ? JSON.parse(data) : null;
}

export function clearAuth() {
  Cookies.remove(TOKEN_KEY);
  Cookies.remove(MUST_CHANGE_KEY);
  Cookies.remove(ROLE_KEY);

  if (typeof window !== "undefined") {
    localStorage.removeItem(USER_KEY);
  }
}
