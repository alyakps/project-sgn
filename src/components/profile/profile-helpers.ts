// src/components/profile/profile-helpers.ts
export function fix(v: unknown): string {
  if (!v || v === "null" || v === "undefined") return "-";
  if (typeof v === "string" && v.trim() === "") return "-";
  return String(v);
}

export const emptyToNull = (v: string): string | null => {
  const t = v.trim();
  return !t || t === "-" ? null : t;
};

export const initials = (name: string): string =>
  name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
