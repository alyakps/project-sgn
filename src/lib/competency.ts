import type { HardRow, SoftRow, HardStats, SoftStats } from "@/types/competency";

/** Bulatkan 1 desimal */
export function round1(n: number) {
  return Math.round(n * 10) / 10;
}

export function computeHardStats(data: HardRow[]): HardStats {
  const achieved = data.filter((d) => d.status === "Tercapai").length;
  const notAchieved = data.length - achieved;
  const avgRaw =
    data.reduce((s, r) => s + (r.nilai ?? 0), 0) / (data.length || 1);
  return { achieved, notAchieved, average: round1(avgRaw || 0) };
}

export function computeSoftStats(data: SoftRow[]): SoftStats {
  const achieved = data.filter((s) => (s.avg ?? 0) >= 70).length; // fixed threshold
  const notAchieved = data.length - achieved;
  const avgRaw =
    data.reduce((s, r) => s + (r.avg ?? 0), 0) / (data.length || 1);
  return { achieved, notAchieved, average: round1(avgRaw || 0) };
}

/** Ambil nama depan */
export function getFirstName(fullName: string) {
  const first = fullName?.trim().split(" ")[0];
  return first || fullName;
}
