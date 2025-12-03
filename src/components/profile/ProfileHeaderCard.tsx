// src/components/profile/ProfileHeaderCard.tsx
import * as React from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

import { MainProfileState } from "./profile-types";
import { fix, initials } from "./profile-helpers";

type Props = {
  main: MainProfileState;
  onEdit: () => void;
};

type KVProps = {
  label: string;
  value: string;
  nowrap?: boolean;
  classNameValue?: string;
};

function KVStack({ label, value, nowrap, classNameValue }: KVProps) {
  const display = fix(value);
  return (
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={[
          "text-sm font-semibold min-w-0 overflow-hidden",
          nowrap ? "whitespace-nowrap" : "wrap-break-word",
          classNameValue ?? "",
        ].join(" ")}
        title={display}
      >
        {display}
      </p>
    </div>
  );
}

export function ProfileHeaderCard({ main, onEdit }: Props) {
  const {
    namaLengkap,
    jabatanTerakhir,
    nikPn,
    handphone,
    email,
    avatarUrl,
    avatarAlt,
  } = main;

  const ini = initials(namaLengkap);

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-4">
        {/* Kiri: avatar + info */}
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          <Avatar className="h-17.5 w-17.5 shrink-0">
            <AvatarImage src={avatarUrl} alt={avatarAlt} />
            <AvatarFallback>{ini}</AvatarFallback>
          </Avatar>

          <div className="flex flex-col w-full">
            <div>
              <h1
                className={`text-xl font-semibold leading-tight ${
                  namaLengkap.split(" ").length > 2
                    ? "whitespace-normal wrap-break-word max-w-[260px] sm:max-w-[320px]"
                    : "whitespace-nowrap"
                }`}
              >
                {namaLengkap}
              </h1>
              <p className="text-sm text-muted-foreground">
                {jabatanTerakhir}
              </p>
            </div>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-y-2 lg:gap-x-8">
              <div className="space-y-2">
                <KVStack label="NIK" value={nikPn} nowrap />
                <KVStack label="Handphone" value={handphone} nowrap />
              </div>

              <div className="pt-2 lg:pt-0 lg:pl-10">
                <KVStack
                  label="Email"
                  value={email}
                  classNameValue="break-all sm:break-normal sm:truncate sm:max-w-[360px]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Kanan atas: tombol Edit kecil */}
        <Button
          size="sm"
          variant="outline"
          className="ml-2"
          type="button"
          onClick={onEdit}
        >
          <Pencil className="w-3.5 h-3.5 mr-1" />
          Edit
        </Button>
      </div>
    </Card>
  );
}
