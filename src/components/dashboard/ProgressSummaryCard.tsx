"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getAvgBoxClass, getAvgTextClass } from "@/lib/style/scoreClass";

type Props = {
  title: string;
  totalItems: number;
  achievedLabel?: string;
  notAchievedLabel?: string;
  achieved: number;
  notAchieved: number;
  average: number;
  onClick?: () => void;
};

export default function ProgressSummaryCard({
  title,
  totalItems,
  achievedLabel = "Tercapai",
  notAchievedLabel = "Tidak Tercapai",
  achieved,
  notAchieved,
  average,
  onClick,
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group block w-full text-left focus:outline-none"
    >
      <Card className="rounded-xl border border-zinc-200 transition ring-0 group-hover:ring-2 group-hover:ring-violet-300">
        <CardContent className="pt-2 pb-2 px-4 sm:pt-3 sm:pb-3">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-[15px] sm:text-base font-semibold text-zinc-900">
              {title}
            </h2>
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-700">
              {totalItems} item
            </span>
          </div>

          <div className="mb-2 flex items-center gap-4 text-[11px] text-zinc-600">
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> High (86–100)
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-amber-500" /> Middle (70–85)
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-rose-500" /> Low (0–69)
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border p-3">
              <div className="text-[11px] text-zinc-500">{achievedLabel}</div>
              <div className="text-lg font-semibold text-emerald-600">{achieved}</div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-[11px] text-zinc-500">{notAchievedLabel}</div>
              <div className="text-lg font-semibold text-amber-600">{notAchieved}</div>
            </div>
            <div className={cn("rounded-lg border p-3", getAvgBoxClass(average))}>
              <div className="text-[11px] text-zinc-600">Rata-rata</div>
              <div className={cn("text-lg font-semibold", getAvgTextClass(average))}>
                {average}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </button>
  );
}
