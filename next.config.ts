import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Permite imagens de domínios externos se necessário
    remotePatterns: [],
  },
};

export default nextConfig;
