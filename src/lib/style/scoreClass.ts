export function getAvgBoxClass(v: number) {
  if (v >= 86) return "bg-emerald-50 border-emerald-200";
  if (v >= 70) return "bg-amber-50 border-amber-200";
  return "bg-rose-50 border-rose-200";
}

export function getAvgTextClass(v: number) {
  if (v >= 86) return "text-emerald-700";
  if (v >= 70) return "text-amber-700";
  return "text-rose-700";
}
