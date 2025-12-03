// src/components/profile/ProfilePerformanceCard.tsx
import * as React from "react";
import { ProfileSectionCard } from "./ProfileSectionCard";
import { PerformanceState } from "./profile-types";

type Props = {
  performance: PerformanceState;
};

export function ProfilePerformanceCard({ performance }: Props) {
  const { penilaianKerja, achievements } = performance;

  return (
    <ProfileSectionCard title="Work Performance">
      <div className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">
            Penilaian Kerja
          </p>
          {penilaianKerja.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Belum ada data penilaian kerja.
            </p>
          ) : (
            penilaianKerja.map((text, i) => (
              <p key={i} className="font-semibold leading-relaxed">
                {text}
              </p>
            ))
          )}
        </div>

        <div>
          <p className="text-sm text-muted-foreground mb-1">Achievement</p>
          {achievements.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Belum ada data achievement.
            </p>
          ) : (
            achievements.map((a, i) => (
              <p key={i} className="font-semibold leading-relaxed">
                {a}
              </p>
            ))
          )}
        </div>
      </div>
    </ProfileSectionCard>
  );
}
