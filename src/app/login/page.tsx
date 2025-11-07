// src/app/login/page.tsx
"use client";

import { useState } from "react";
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

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push("/dashboard");
    }, 800);
  };

  return (
    <div
      className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-8 bg-cover bg-center"
      style={{ backgroundImage: "url('/sugarcane.png')" }}
    >
      {/* === Glass Card === */}
      <Card className="relative z-10 w-full max-w-sm rounded-2xl border border-white/40 bg-white/30 backdrop-blur-md shadow-xl">
        <CardHeader className="px-5 pt-6 pb-4 text-center">
          {/* Title tengah, super bold dan hitam */}
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

            {/* Submit */}
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

      {/* Hilangkan ikon mata bawaan browser */}
      <style jsx global>{`
        input[type="password"]::-ms-reveal,
        input[type="password"]::-ms-clear {
          display: none !important;
        }
        input[type="password"]::-webkit-password-toggle-button,
        input[type="password"]::-webkit-credentials-auto-fill-button,
        input[type="password"]::-webkit-textfield-decoration-container {
          display: none !important;
          appearance: none !important;
        }
      `}</style>
    </div>
  );
}
