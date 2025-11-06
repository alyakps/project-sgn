"use client";

import * as React from "react";
import type { HardRow, SoftRow, HardStats, SoftStats } from "@/types/competency";
import { computeHardStats, computeSoftStats } from "@/lib/competency";

export function useCompetencyStats(
  hardData: HardRow[],
  softData: SoftRow[]
) {
  return React.useMemo<{
    hard: HardStats;
    soft: SoftStats;
  }>(() => {
    return {
      hard: computeHardStats(hardData),
      soft: computeSoftStats(softData),
    };
  }, [hardData, softData]);
}
