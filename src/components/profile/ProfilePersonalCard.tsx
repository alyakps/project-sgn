// src/components/profile/ProfilePersonalCard.tsx
import * as React from "react";
import { ProfileSectionCard } from "./ProfileSectionCard";
import { KeyVal } from "./profile-types";
import { fix } from "./profile-helpers";

type Props = {
  items: KeyVal[];
};

export function ProfilePersonalCard({ items }: Props) {
  if (!items.length) {
    return (
      <ProfileSectionCard title="Personal Information">
        <p className="text-sm text-muted-foreground">
          Belum ada data personal yang ditampilkan.
        </p>
      </ProfileSectionCard>
    );
  }

  return (
    <ProfileSectionCard title="Personal Information">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 md:gap-y-3 gap-x-8">
        {items.map((it) => {
          const display = fix(it.value);
          return (
            <div key={it.label} className="flex flex-col min-w-0">
              <span className="text-sm text-muted-foreground">{it.label}</span>
              <span className="font-semibold wrap-break-word whitespace-pre-wrap">
                {display}
              </span>
            </div>
          );
        })}
      </div>
    </ProfileSectionCard>
  );
}
