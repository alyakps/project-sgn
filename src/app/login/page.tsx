// src/app/login/page.tsx
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { apiLogin, apiMe } from "@/lib/api";
import { saveAuth } from "@/lib/auth-storage";

export default function SignInPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1) Login → dapat token
      const loginRes = await apiLogin(email, password);
      const token = loginRes.token;

      // 2) Ambil data user
      const me = await apiMe(token);

      // 3) Simpan auth ke localStorage
      saveAuth(token, {
        id: me.id,
        nik: me.nik ?? null,
        name: me.name,
        email: me.email,
        role: me.role,
      });

      // 4) Normalisasi role, jaga2 kalau dari API "Admin"/"ADMIN"
      const role = String(me.role).toLowerCase();

      if (role === "admin") {
        // Admin → ke dashboard admin (route kamu sekarang)
        router.replace("/admin");
      } else {
        // Karyawan → ke dashboard karyawan
        router.replace("/dashboard"); // ganti "/" → "/dashboard" biar konsisten
      }
    } catch (err: any) {
      setError(err?.message || "Email atau password salah");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-8 bg-cover bg-center"
      style={{ backgroundImage: "url('/sugarcane.png')" }}
    >
      <Card className="relative z-10 w-full max-w-sm rounded-2xl border border-white/40 bg-white/30 backdrop-blur-md shadow-xl">
        <CardHeader className="px-5 pt-6 pb-4 text-center">
          <CardTitle className="text-4xl font-black text-zinc-900 leading-[1.1]">
            Sign In
          </CardTitle>
          <CardDescription className="text-[15px] text-zinc-700 mt-0.5 font-medium">
            Access your dashboard
          </CardDescription>
        </CardHeader>

        <CardContent className="px-5 pb-5">
          <form onSubmit={onSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-semibold text-zinc-800"
              >
                Email
              </Label>
              <Input
                id="email"
                type="email"
                required
                autoComplete="username"
                placeholder="you@example.com"
                className="h-10 rounded-md bg-white/60 backdrop-blur-sm border-white/40 placeholder:text-zinc-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-semibold text-zinc-800"
              >
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="h-10 pr-16 rounded-md bg-white/60 backdrop-blur-sm border-white/40 placeholder:text-zinc-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-zinc-700 hover:text-zinc-900"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {error}
              </p>
            )}

            {/* Button */}
            <Button
              type="submit"
              disabled={loading}
              className={[
                "w-full h-10 rounded-md font-semibold text-white",
                "bg-[#05398f] hover:bg-[#042E71]",
                "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#05398f]",
                "disabled:opacity-70 disabled:cursor-not-allowed",
                "transition-all duration-200",
                "shadow-lg",
              ].join(" ")}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
