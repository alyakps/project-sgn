import { getUser, getToken } from "./auth-storage";

export function isLoggedIn() {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("sgn_token");
}

export function getRole() {
  if (typeof window === "undefined") return null;
  const user = localStorage.getItem("sgn_user");
  return user ? JSON.parse(user).role : null;
}

export function getUserData() {
  if (typeof window === "undefined") return null;
  const user = localStorage.getItem("sgn_user");
  return user ? JSON.parse(user) : null;
}

export function useClientAuth() {
  // ini cuma helper plain, bukan React hook beneran
  const token = getToken();
  const user = getUser();
  return { token, user };
}