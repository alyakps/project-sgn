// src/components/profile/ProfileSectionCard.tsx
import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";

type Props = React.PropsWithChildren<{
  title: string;
  className?: string;
}>;

export function ProfileSectionCard({ title, children, className }: Props) {
  return (
    <Card className={className}>
      <div className="p-3 md:p-4">
        <h2 className="text-lg font-semibold tracking-tight mb-2">{title}</h2>
        <div className="border-t border-gray-200" />
        <CardContent className="p-0 pt-3">{children}</CardContent>
      </div>
    </Card>
  );
}
