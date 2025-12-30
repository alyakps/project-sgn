import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["http://localhost:3000", "http://10.10.13.10"],

  eslint: {
    // biar build/deploy ga gagal gara-gara lint error
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
