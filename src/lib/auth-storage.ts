import Cookies from "js-cookie";

const TOKEN_KEY = "sgn_token";
const USER_KEY = "sgn_user";

// ✅ tambahan
const MUST_CHANGE_KEY = "sgn_must_change_password";

export function saveAuth(token: string, user: any) {
  // Simpan token ke cookie (dibaca middleware)
  Cookies.set(TOKEN_KEY, token, { expires: 7 });

  // ✅ simpan flag must change password ke cookie juga
  Cookies.set(MUST_CHANGE_KEY, user?.must_change_password ? "1" : "0", { expires: 7 });

  // Simpan data user ke localStorage (dipakai di FE)
  if (typeof window !== "undefined") {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
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

  // ✅ hapus flag cookie
  Cookies.remove(MUST_CHANGE_KEY);

  if (typeof window !== "undefined") {
    localStorage.removeItem(USER_KEY);
  }
}
