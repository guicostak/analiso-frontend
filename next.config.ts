import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // Permite imagens de domínios externos se necessário
    remotePatterns: [],
  },
};

export default nextConfig;
