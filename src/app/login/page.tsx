"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // TODO: nanti ganti ini jadi real auth call ke backend kamu
    // contoh pseudo:
    // const res = await fetch("/api/login", { method: "POST", body: ... })
    // if (res.ok) { router.push("/dashboard") } else { error message ... }

    // sementara: pura-pura login sukses
    setTimeout(() => {
      setLoading(false);
      router.push("/dashboard"); // <-- redirect ke dashboard
    }, 800);
  };

  return (
    <div
      className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-8 bg-cover bg-center"
      style={{ backgroundImage: "url('/sugarcane.png')" }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px]" />

      {/* Card login */}
      <div className="relative z-10 w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl rounded-2xl md:rounded-3xl bg-white/95 shadow-2xl ring-1 ring-black/10 p-6 sm:p-8 md:p-10 flex flex-col gap-8 md:gap-10">
        {/* Header */}
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-zinc-900 text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" x2="3" y1="12" y2="12" />
            </svg>
          </div>

          <div>
            <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-zinc-900">
              Sign in with Email
            </h1>
            <p className="text-sm sm:text-base text-zinc-500">
              Access your dashboard securely
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="flex flex-col gap-6 sm:gap-8">
          {/* Email */}
          <div className="flex flex-col gap-2 sm:gap-3">
            <label
              htmlFor="email"
              className="text-base sm:text-lg font-medium text-zinc-800"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              className="block w-full rounded-lg sm:rounded-xl border border-zinc-300 bg-white px-4 sm:px-5 py-2.5 sm:py-3 text-base sm:text-lg text-zinc-900 shadow-sm outline-none placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
              placeholder="you@example.com"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-2 sm:gap-3">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-base sm:text-lg font-medium text-zinc-800"
              >
                Password
              </label>
              <button
                type="button"
                className="text-xs sm:text-sm font-medium text-zinc-500 hover:text-zinc-700"
              >
                Forgot password?
              </button>
            </div>

            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                className="block w-full rounded-lg sm:rounded-xl border border-zinc-300 bg-white px-4 sm:px-5 py-2.5 sm:py-3 pr-16 text-base sm:text-lg text-zinc-900 shadow-sm outline-none placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs sm:text-sm font-semibold text-zinc-700 hover:text-zinc-900"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 inline-flex h-11 sm:h-12 md:h-13 w-full items-center justify-center rounded-lg sm:rounded-xl bg-zinc-900 px-4 sm:px-6 text-base sm:text-lg font-semibold text-white shadow hover:bg-zinc-800 active:bg-zinc-950 disabled:opacity-60 transition-all"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
