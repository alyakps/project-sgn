export type HardRow = {
  id: string;
  status: "Tercapai" | "Tidak Tercapai";
  nilai: number | null;
};

export type SoftRow = {
  avg: number;
};

export type Thresholds = {
  highMin: number; // mis: 86
  midMin: number;  // mis: 70
};

export type HardStats = {
  achieved: number;
  notAchieved: number;
  average: number;
};

export type SoftStats = {
  achieved: number;     // jumlah >= midMin (default)
  notAchieved: number;
  average: number;
};
