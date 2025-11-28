"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

/* shadcn/ui */
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

/* Icons */
import { CheckCircle2, XCircle } from "lucide-react";

type PasswordRules = {
  minLength: boolean;
  hasLower: boolean;
  hasUpper: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
};

function getPasswordRules(value: string): PasswordRules {
  return {
    minLength: value.length >= 8,
    hasLower: /[a-z]/.test(value),
    hasUpper: /[A-Z]/.test(value),
    hasNumber: /[0-9]/.test(value),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\;/]/.test(value),
  };
}

export default function ChangePasswordPage() {
  const router = useRouter();

  const [oldPassword, setOldPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const rules = getPasswordRules(newPassword);
  const isStrongPassword = Object.values(rules).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("Semua field wajib diisi.");
      return;
    }

    if (!isStrongPassword) {
      setError("Password baru belum memenuhi semua persyaratan.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Konfirmasi password tidak sama dengan password baru.");
      return;
    }

    try {
      setLoading(true);

      await new Promise((r) => setTimeout(r, 700));

      setSuccess("Password berhasil diubah!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setError("Terjadi kesalahan saat mengubah password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900">
          Change Password
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Masukkan password lama dan buat password baru yang lebih aman.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"
      >
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* OLD PASSWORD */}
        <div className="space-y-2">
          <Label>Old Password</Label>
          <Input
            type="password"
            autoComplete="current-password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className={oldPassword ? "border-green-500" : ""}
          />
        </div>

        {/* NEW PASSWORD */}
        <div className="space-y-2">
          <Label>New Password</Label>
          <Input
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={
              newPassword
                ? isStrongPassword
                  ? "border-green-500"
                  : "border-red-500"
                : ""
            }
          />

          <div className="mt-1 space-y-1 text-xs">
            <Rule label="Minimal 8 karakter" ok={rules.minLength} />
            <Rule label="Huruf kecil (a-z)" ok={rules.hasLower} />
            <Rule label="Huruf kapital (A-Z)" ok={rules.hasUpper} />
            <Rule label="Angka (0-9)" ok={rules.hasNumber} />
            <Rule label="Karakter spesial (!@#$, dll)" ok={rules.hasSpecial} />
          </div>
        </div>

        {/* CONFIRM PASSWORD */}
        <div className="space-y-2">
          <Label>Confirm New Password</Label>
          <Input
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={
              confirmPassword && confirmPassword !== newPassword
                ? "border-red-500"
                : ""
            }
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Batal
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Change Password"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function Rule({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div
      className={`flex items-center gap-2 ${
        ok ? "text-emerald-600" : "text-zinc-500"
      }`}
    >
      {ok ? (
        <CheckCircle2 className="h-3.5 w-3.5" />
      ) : (
        <XCircle className="h-3.5 w-3.5 text-red-500" />
      )}
      <span>{label}</span>
    </div>
  );
}
