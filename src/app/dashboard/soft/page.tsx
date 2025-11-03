// src/app/dashboard/soft/page.tsx
"use client";

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";

type Point = { kode: string; label: string; value: number };

const data: Point[] = [
  { kode: "CIN", label: "Creativity & Innovation", value: 95 },
  { kode: "TRL", label: "Transformational Leadership", value: 81 },
  { kode: "NEP", label: "Empowering People", value: 74 },
  { kode: "INF", label: "Information Seeking", value: 63 },
  { kode: "RSL", label: "Resilience", value: 88 },
  { kode: "ACH", label: "Achievement Orientation", value: 72 },
  { kode: "CFO", label: "Concern For Order", value: 67 },
];

function band(v: number) {
  if (v >= 90) return "High";
  if (v >= 70) return "Middle";
  return "Low";
}

export default function SoftCompetencyPage() {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-wide text-zinc-500">
                Soft Competency
              </p>
              <h2 className="text-base sm:text-lg font-semibold">
                Radar (7 Arah)
              </h2>
            </div>

            <div className="hidden sm:flex items-center gap-4 text-xs text-zinc-600">
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                High (90–100)
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                Middle (70–89)
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                Low (0–69)
              </span>
            </div>
          </div>

          {/* Wajib: tinggi container agar chart tidak blank */}
          <div className="mt-4 h-[380px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={data} outerRadius="75%">
                <PolarGrid gridType="polygon" />
                {/* Tampilkan KODE di sumbu */}
                <PolarAngleAxis dataKey="kode" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  tickCount={4}
                  tickFormatter={(v: number) => String(v)}
                  tick={{ fontSize: 10 }}
                />
                <Radar
                  name="Nilai"
                  dataKey="value"
                  stroke="#5B43F9"
                  fill="#5B43F9"
                  fillOpacity={0.35}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.[0]) return null;
                    const p = payload[0].payload as Point;
                    return (
                      <div className="rounded-md border bg-white px-3 py-2 text-xs shadow">
                        <div className="font-semibold">{p.label}</div>
                        <div className="text-zinc-600">
                          Kode: <span className="font-medium">{p.kode}</span>
                        </div>
                        <div className="text-zinc-600">
                          Nilai: <span className="font-medium">{p.value}</span> (
                          {band(p.value)})
                        </div>
                      </div>
                    );
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
